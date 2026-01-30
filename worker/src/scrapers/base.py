from abc import ABC, abstractmethod
from ..models import Signal
import structlog

log = structlog.get_logger()


class BaseScraper(ABC):
    name: str = "base"

    @abstractmethod
    async def scrape(self) -> list[Signal]:
        """Scrape source and return list of signals."""
        pass

    def log_result(self, signals: list[Signal]):
        log.info("scrape_complete", scraper=self.name, signal_count=len(signals))
