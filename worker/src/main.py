import asyncio
import schedule
import time
import structlog
import sentry_sdk
from .config import get_settings
from .health import HealthServer, update_health, set_status
from .sentry_setup import init_sentry
from .scrapers.news import TechCrunchScraper
from .scrapers.jobs import JobBoardScraper
from .scrapers.company import CompanyWebsiteScraper
from .scrapers.linkedin import LinkedInScraper
from .scrapers.hackernews import HackerNewsScraper
from .scrapers.googlenews import GoogleNewsScraper
from .scrapers.prnewswire import PRNewswireScraper
from .scrapers.techblogs import TechBlogsScraper
from .scrapers.producthunt import ProductHuntScraper
from .scrapers.reddit import RedditScraper
from .scrapers.globenewswire import GlobeNewswireScraper
from .db.supabase import (
    insert_signal,
    get_merged_target_companies,
    get_merged_signal_keywords,
    get_enabled_sources,
    get_pending_scrape_run,
    create_scrape_run,
    update_scrape_run,
)

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)
log = structlog.get_logger()

# Shared signals use NULL user_id - all authenticated users can view them
SYSTEM_USER_ID = None  # NULL = shared signal visible to all users

# Estimated time per source in seconds (used for progress display)
ESTIMATED_TIME_PER_SOURCE = 30


async def run_scrapers(run_id: str | None = None, user_id: str | None = None):
    """Run all scrapers, enrich with AI, and store results."""
    settings = get_settings()

    # Get configuration from database
    target_companies = get_merged_target_companies()
    signal_keywords = get_merged_signal_keywords()
    enabled_sources = get_enabled_sources()

    log.info(
        "scrape_cycle_start",
        ai_enabled=settings.ai_enabled,
        target_companies=len(target_companies),
        enabled_sources=enabled_sources,
        run_id=run_id,
    )

    # Build list of scrapers based on enabled sources
    scrapers = []

    # Original sources (configurable)
    if enabled_sources.get("techcrunch", True):
        scrapers.append(TechCrunchScraper())
    if enabled_sources.get("indeed", True):
        scrapers.append(JobBoardScraper(target_companies=target_companies, signal_keywords=signal_keywords))
    if enabled_sources.get("company", True):
        scrapers.append(CompanyWebsiteScraper(target_companies=target_companies))
    if enabled_sources.get("linkedin", False):
        scrapers.append(LinkedInScraper(target_companies=target_companies, signal_keywords=signal_keywords))

    # New sources - always enabled (free, no API keys needed)
    scrapers.append(HackerNewsScraper(target_companies=target_companies))
    scrapers.append(GoogleNewsScraper(target_companies=target_companies))
    scrapers.append(PRNewswireScraper(target_companies=target_companies))
    scrapers.append(TechBlogsScraper(target_companies=target_companies))
    scrapers.append(ProductHuntScraper(target_companies=target_companies))
    scrapers.append(RedditScraper(target_companies=target_companies))
    scrapers.append(GlobeNewswireScraper(target_companies=target_companies))

    if not scrapers:
        log.warning("no_scrapers_enabled")
        if run_id:
            update_scrape_run(run_id, status="completed", total_signals=0)
        return

    # Estimate total duration
    estimated_duration = len(scrapers) * ESTIMATED_TIME_PER_SOURCE
    if run_id:
        update_scrape_run(run_id, estimated_duration_seconds=estimated_duration)

    total_signals = 0
    enriched_signals = 0
    signals_by_source: dict[str, int] = {}
    progress: dict[str, dict] = {}

    # Initialize progress for all scrapers
    for scraper in scrapers:
        progress[scraper.name] = {"status": "pending", "signals": 0}

    if run_id:
        update_scrape_run(run_id, progress=progress)

    # Add Sentry context for this scraper run
    with sentry_sdk.configure_scope() as scope:
        scope.set_context("scraper_run", {
            "ai_enabled": settings.ai_enabled,
            "model": settings.openai_model,
            "target_companies": target_companies[:10],  # First 10 for context
            "enabled_sources": enabled_sources,
        })

        for scraper in scrapers:
            # Update progress to running
            progress[scraper.name]["status"] = "running"
            if run_id:
                update_scrape_run(run_id, progress=progress)

            try:
                signals = await scraper.scrape()
                scraper_count = 0

                for signal in signals:
                    # Enrich with AI before inserting
                    enriched_signal = scraper.enrich_signal(signal)

                    if enriched_signal.metadata.get('ai_enriched'):
                        enriched_signals += 1

                    # Insert with user_id if this was a user-triggered scrape
                    result = insert_signal(enriched_signal, user_id or SYSTEM_USER_ID)
                    if result:
                        total_signals += 1
                        scraper_count += 1

                signals_by_source[scraper.name] = scraper_count
                progress[scraper.name] = {"status": "completed", "signals": scraper_count}

            except Exception as e:
                sentry_sdk.capture_exception(e)
                log.error("scraper_failed", scraper=scraper.name, error=str(e))
                signals_by_source[scraper.name] = 0
                progress[scraper.name] = {"status": "failed", "signals": 0, "error": str(e)}

            # Update progress after each scraper
            if run_id:
                update_scrape_run(
                    run_id,
                    progress=progress,
                    total_signals=total_signals,
                    signals_by_source=signals_by_source,
                    ai_enriched_count=enriched_signals,
                )

    log.info(
        "scrape_cycle_complete",
        total_signals=total_signals,
        ai_enriched=enriched_signals,
        by_source=signals_by_source
    )

    # Mark run as completed
    if run_id:
        update_scrape_run(
            run_id,
            status="completed",
            progress=progress,
            total_signals=total_signals,
            signals_by_source=signals_by_source,
            ai_enriched_count=enriched_signals,
        )

    # Update health status
    update_health(success=True, scrape_count=total_signals)


def job():
    """Wrapper to run async scrapers from sync scheduler."""
    # Check for pending manual scrape runs
    pending_run = get_pending_scrape_run()
    if pending_run:
        log.info("processing_pending_run", run_id=pending_run.id, user_id=pending_run.user_id)
        # Update to running
        update_scrape_run(pending_run.id, status="running")
        try:
            asyncio.run(run_scrapers(run_id=pending_run.id, user_id=pending_run.user_id))
        except Exception as e:
            log.error("pending_run_failed", run_id=pending_run.id, error=str(e))
            update_scrape_run(pending_run.id, status="failed", error_message=str(e))
            update_health(success=False, scrape_count=0)
        return

    # Regular scheduled scrape
    run_id = create_scrape_run()
    try:
        asyncio.run(run_scrapers(run_id=run_id))
    except Exception as e:
        log.error("scrape_cycle_failed", error=str(e))
        if run_id:
            update_scrape_run(run_id, status="failed", error_message=str(e))
        update_health(success=False, scrape_count=0)
        raise


def check_pending_runs():
    """Check for pending runs more frequently than full scrapes."""
    pending_run = get_pending_scrape_run()
    if pending_run:
        log.info("found_pending_run", run_id=pending_run.id)
        job()


def main():
    # Initialize Sentry before any operations
    init_sentry()

    settings = get_settings()
    linkedin_enabled = bool(settings.bright_data_api_token)

    # Get initial config info
    target_companies = get_merged_target_companies()
    enabled_sources = get_enabled_sources()

    log.info(
        "worker_starting",
        interval=settings.scrape_interval_minutes,
        ai_enabled=settings.ai_enabled,
        model=settings.openai_model,
        linkedin_enabled=linkedin_enabled,
        target_companies_count=len(target_companies),
        enabled_sources=enabled_sources,
    )

    # Start health check server
    health_server = HealthServer(port=settings.health_port)
    health_server.start()
    set_status("healthy")

    # Run immediately on start
    job()

    # Schedule regular runs
    schedule.every(settings.scrape_interval_minutes).minutes.do(job)

    # Check for pending runs more frequently (every 30 seconds)
    schedule.every(30).seconds.do(check_pending_runs)

    while True:
        schedule.run_pending()
        time.sleep(10)  # Check every 10 seconds for better responsiveness


if __name__ == "__main__":
    main()
