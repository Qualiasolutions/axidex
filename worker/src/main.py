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
from .db.supabase import insert_signal

structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ]
)
log = structlog.get_logger()

# Demo user ID - in production, signals would be assigned to users based on their preferences
DEMO_USER_ID = "00000000-0000-0000-0000-000000000000"


async def run_scrapers():
    """Run all scrapers, enrich with AI, and store results."""
    settings = get_settings()
    log.info("scrape_cycle_start", ai_enabled=settings.ai_enabled)

    scrapers = [
        TechCrunchScraper(),
        JobBoardScraper(),
        CompanyWebsiteScraper(),
        LinkedInScraper(),
    ]

    total_signals = 0
    enriched_signals = 0
    signals_by_source: dict[str, int] = {}

    # Add Sentry context for this scraper run
    with sentry_sdk.configure_scope() as scope:
        scope.set_context("scraper_run", {
            "ai_enabled": settings.ai_enabled,
            "model": settings.openai_model,
        })

        for scraper in scrapers:
            try:
                signals = await scraper.scrape()
                scraper_count = 0

                for signal in signals:
                    # Enrich with AI before inserting
                    enriched_signal = scraper.enrich_signal(signal)

                    if enriched_signal.metadata.get('ai_enriched'):
                        enriched_signals += 1

                    result = insert_signal(enriched_signal, DEMO_USER_ID)
                    if result:
                        total_signals += 1
                        scraper_count += 1

                signals_by_source[scraper.name] = scraper_count

            except Exception as e:
                sentry_sdk.capture_exception(e)
                log.error("scraper_failed", scraper=scraper.name, error=str(e))
                signals_by_source[scraper.name] = 0

    log.info(
        "scrape_cycle_complete",
        total_signals=total_signals,
        ai_enriched=enriched_signals,
        by_source=signals_by_source
    )

    # Update health status
    update_health(success=True, scrape_count=total_signals)


def job():
    """Wrapper to run async scrapers from sync scheduler."""
    try:
        asyncio.run(run_scrapers())
    except Exception as e:
        log.error("scrape_cycle_failed", error=str(e))
        update_health(success=False, scrape_count=0)
        raise


def main():
    # Initialize Sentry before any operations
    init_sentry()

    settings = get_settings()
    linkedin_enabled = bool(settings.bright_data_api_token)
    log.info(
        "worker_starting",
        interval=settings.scrape_interval_minutes,
        ai_enabled=settings.ai_enabled,
        model=settings.openai_model,
        linkedin_enabled=linkedin_enabled
    )

    # Start health check server
    health_server = HealthServer(port=settings.health_port)
    health_server.start()
    set_status("healthy")

    # Run immediately on start
    job()

    # Then schedule regular runs
    schedule.every(settings.scrape_interval_minutes).minutes.do(job)

    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    main()
