import asyncio
import schedule
import time
import structlog
from .config import get_settings
from .scrapers.news import TechCrunchScraper
from .scrapers.jobs import JobBoardScraper
from .scrapers.company import CompanyWebsiteScraper
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
    ]

    total_signals = 0
    enriched_signals = 0

    for scraper in scrapers:
        try:
            signals = await scraper.scrape()

            for signal in signals:
                # Enrich with AI before inserting
                enriched_signal = scraper.enrich_signal(signal)

                if enriched_signal.metadata.get('ai_enriched'):
                    enriched_signals += 1

                result = insert_signal(enriched_signal, DEMO_USER_ID)
                if result:
                    total_signals += 1

        except Exception as e:
            log.error("scraper_failed", scraper=scraper.name, error=str(e))

    log.info(
        "scrape_cycle_complete",
        total_signals=total_signals,
        ai_enriched=enriched_signals
    )


def job():
    """Wrapper to run async scrapers from sync scheduler."""
    asyncio.run(run_scrapers())


def main():
    settings = get_settings()
    log.info(
        "worker_starting",
        interval=settings.scrape_interval_minutes,
        ai_enabled=settings.ai_enabled,
        model=settings.openai_model
    )

    # Run immediately on start
    job()

    # Then schedule regular runs
    schedule.every(settings.scrape_interval_minutes).minutes.do(job)

    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    main()
