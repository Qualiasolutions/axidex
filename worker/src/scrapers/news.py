import httpx
from selectolax.parser import HTMLParser
from .base import BaseScraper
from ..models import Signal
from ..db.supabase import signal_exists
import structlog
import re

log = structlog.get_logger()

# TechCrunch funding/startup RSS feeds
TC_FEEDS = [
    "https://techcrunch.com/category/startups/feed/",
    "https://techcrunch.com/category/venture/feed/",
]


class TechCrunchScraper(BaseScraper):
    name = "techcrunch"

    async def scrape(self) -> list[Signal]:
        signals = []
        async with httpx.AsyncClient(timeout=30.0) as client:
            for feed_url in TC_FEEDS:
                try:
                    resp = await client.get(feed_url)
                    resp.raise_for_status()
                    signals.extend(self._parse_feed(resp.text))
                except Exception as e:
                    log.error("feed_fetch_failed", feed=feed_url, error=str(e))

        # Filter already-seen signals
        new_signals = [s for s in signals if not signal_exists(s.source_url)]
        self.log_result(new_signals)
        return new_signals

    def _parse_feed(self, xml: str) -> list[Signal]:
        """Parse RSS XML into Signal objects."""
        signals = []
        parser = HTMLParser(xml)

        for item in parser.css("item"):
            try:
                title_el = item.css_first("title")
                link_el = item.css_first("link")
                desc_el = item.css_first("description")

                if not all([title_el, link_el, desc_el]):
                    continue

                title = title_el.text(strip=True)
                link = link_el.text(strip=True)
                description = desc_el.text(strip=True)

                # Extract company name from title (often "Company raises $X" or "Company launches Y")
                company = self._extract_company(title)
                signal_type = self._classify_signal(title, description)
                priority = self._assess_priority(title, description)

                if company and signal_type:
                    signals.append(
                        Signal(
                            company_name=company,
                            signal_type=signal_type,
                            title=title,
                            summary=description[:500],  # Truncate
                            source_url=link,
                            source_name="TechCrunch",
                            priority=priority,
                            metadata={"raw_title": title},
                        )
                    )
            except Exception as e:
                log.warning("item_parse_failed", error=str(e))

        return signals

    def _extract_company(self, title: str) -> str | None:
        """Basic company extraction - first capitalized word(s)."""
        # Pattern: "Company raises/launches/announces..."
        match = re.match(r"^([A-Z][a-zA-Z0-9]+(?:\s+[A-Z][a-zA-Z0-9]+)?)", title)
        return match.group(1) if match else None

    def _classify_signal(self, title: str, description: str) -> str | None:
        """Rule-based classification."""
        text = f"{title} {description}".lower()

        if any(
            kw in text
            for kw in [
                "raises",
                "funding",
                "series",
                "seed",
                "valuation",
                "investment",
            ]
        ):
            return "funding"
        if any(kw in text for kw in ["hiring", "jobs", "talent", "team"]):
            return "hiring"
        if any(
            kw in text
            for kw in ["expands", "expansion", "opens", "new market", "international"]
        ):
            return "expansion"
        if any(kw in text for kw in ["partnership", "partners with", "collaborat"]):
            return "partnership"
        if any(
            kw in text
            for kw in ["launches", "announces", "introduces", "unveils", "releases"]
        ):
            return "product_launch"
        if any(
            kw in text for kw in ["ceo", "cto", "appoints", "joins as", "new head"]
        ):
            return "leadership_change"

        return None  # Can't classify

    def _assess_priority(self, title: str, description: str) -> str:
        """Rule-based priority scoring."""
        text = f"{title} {description}".lower()

        # High priority: Large funding rounds, major launches
        if any(
            kw in text
            for kw in ["$100m", "$50m", "unicorn", "series c", "series d", "ipo"]
        ):
            return "high"

        # Low priority: Small rounds, minor updates
        if any(kw in text for kw in ["seed", "pre-seed", "angel", "update"]):
            return "low"

        return "medium"
