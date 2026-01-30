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
    """Run all scrapers and store results."""
    log.info("scrape_cycle_start")

    scrapers = [
        TechCrunchScraper(),
        JobBoardScraper(),
        CompanyWebsiteScraper(),
    ]

    total_signals = 0
    for scraper in scrapers:
        try:
            signals = await scraper.scrape()
            for signal in signals:
                result = insert_signal(signal, DEMO_USER_ID)
                if result:
                    total_signals += 1
        except Exception as e:
            log.error("scraper_failed", scraper=scraper.name, error=str(e))

    log.info("scrape_cycle_complete", total_signals=total_signals)


def job():
    """Wrapper to run async scrapers from sync scheduler."""
    asyncio.run(run_scrapers())


def main():
    settings = get_settings()
    log.info("worker_starting", interval=settings.scrape_interval_minutes)

    # Run immediately on start
    job()

    # Then schedule regular runs
    schedule.every(settings.scrape_interval_minutes).minutes.do(job)

    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    main()
