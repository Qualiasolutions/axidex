"""
PR Newswire RSS Scraper - Official press releases from companies.
"""

import asyncio
import xml.etree.ElementTree as ET
from html import unescape
import httpx
import structlog
from typing import Optional
import re

from .base import BaseScraper
from ..models import Signal, Priority
from ..db.dedup import is_duplicate, get_content_hash

log = structlog.get_logger()


class PRNewswireScraper(BaseScraper):
    """
    Scrapes PR Newswire RSS feeds for official company announcements.
    Free, no API key required. These are official press releases.
    """

    name = "prnewswire"

    RSS_FEEDS = [
        # Technology
        "https://www.prnewswire.com/rss/technology-latest-news.rss",
        # Business & Finance
        "https://www.prnewswire.com/rss/financial-services-latest-news.rss",
        # Software
        "https://www.prnewswire.com/rss/computer-software-latest-news.rss",
        # Internet
        "https://www.prnewswire.com/rss/internet-latest-news.rss",
        # Venture Capital
        "https://www.prnewswire.com/rss/venture-capital-latest-news.rss",
    ]

    def __init__(self, target_companies: list[str] | None = None):
        self.target_companies = [c.lower() for c in (target_companies or [])]

    async def scrape(self) -> list[Signal]:
        signals = []

        async with httpx.AsyncClient(timeout=30.0) as client:
            for feed_url in self.RSS_FEEDS:
                try:
                    feed_signals = await self._scrape_feed(client, feed_url)
                    signals.extend(feed_signals)
                    await asyncio.sleep(0.5)
                except Exception as e:
                    log.error("prnewswire_feed_failed", feed=feed_url, error=str(e))

        self.log_result(signals)
        return signals

    async def _scrape_feed(self, client: httpx.AsyncClient, feed_url: str) -> list[Signal]:
        signals = []

        try:
            resp = await client.get(feed_url, follow_redirects=True)
            if resp.status_code != 200:
                return []

            root = ET.fromstring(resp.content)

            for item in root.findall(".//item")[:20]:
                signal = self._parse_item(item)
                if signal:
                    signals.append(signal)

        except Exception as e:
            log.debug("prnewswire_parse_failed", error=str(e))

        return signals

    def _parse_item(self, item: ET.Element) -> Optional[Signal]:
        title_elem = item.find("title")
        link_elem = item.find("link")
        desc_elem = item.find("description")

        if title_elem is None or link_elem is None:
            return None

        title = unescape(title_elem.text or "")
        url = link_elem.text or ""
        description = unescape(desc_elem.text or "") if desc_elem is not None else ""

        if not title or not url:
            return None

        # Extract company name from title (usually first part before "Announces")
        company_name = self._extract_company(title)

        # Check if relevant (funding, hiring, launch, etc.)
        title_lower = title.lower()
        if not self._is_relevant(title_lower):
            return None

        # Filter by target companies if specified
        if self.target_companies:
            if not any(tc in title_lower or tc in company_name.lower() for tc in self.target_companies):
                return None

        # Dedup check
        if is_duplicate(title, company_name, url):
            return None

        signal_type = self._detect_signal_type(title_lower)
        priority = self._assess_priority(title_lower, description.lower())

        # Clean description
        summary = re.sub(r'<[^>]+>', '', description)[:300]
        if not summary:
            summary = title

        return Signal(
            company_name=company_name,
            signal_type=signal_type,
            title=title[:200],
            summary=summary,
            source_url=url,
            source_name="PR Newswire",
            priority=priority,
            metadata={
                **get_content_hash(title, company_name),
                "is_press_release": True,
            },
        )

    def _extract_company(self, title: str) -> str:
        # Common patterns: "Company Name Announces...", "Company Name Launches..."
        patterns = [
            r'^(.+?)\s+(?:Announces|Launches|Reports|Raises|Expands|Partners|Acquires|Appoints)',
            r'^(.+?)\s+(?:to\s+(?:Launch|Expand|Partner))',
        ]
        for pattern in patterns:
            match = re.match(pattern, title, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        # Fallback: first few words
        words = title.split()[:3]
        return " ".join(words)

    def _is_relevant(self, title: str) -> bool:
        keywords = [
            "funding", "raised", "series", "seed", "investment",
            "launch", "announces", "unveils", "introduces",
            "hiring", "expands", "expansion", "growth",
            "partnership", "partners", "collaboration",
            "acquisition", "acquires", "merge",
            "appoints", "names", "promotes", "ceo", "cto",
            "revenue", "milestone", "customers",
        ]
        return any(kw in title for kw in keywords)

    def _detect_signal_type(self, title: str) -> str:
        if any(w in title for w in ["hiring", "talent", "recruit", "jobs"]):
            return "hiring"
        if any(w in title for w in ["raised", "funding", "series", "seed", "investment", "capital"]):
            return "funding"
        if any(w in title for w in ["launch", "unveil", "introduce", "release", "announce"]):
            return "product_launch"
        if any(w in title for w in ["partner", "collaboration", "acquisition", "acquire"]):
            return "partnership"
        if any(w in title for w in ["expand", "growth", "international", "new office", "new market"]):
            return "expansion"
        if any(w in title for w in ["appoint", "name", "ceo", "cto", "executive", "leadership"]):
            return "leadership_change"
        return "product_launch"

    def _assess_priority(self, title: str, description: str) -> Priority:
        combined = title + " " + description
        if any(w in combined for w in ["billion", "100 million", "50 million", "unicorn", "ipo"]):
            return "high"
        if any(w in combined for w in ["million", "series b", "series c", "acquisition"]):
            return "high"
        if any(w in combined for w in ["series a", "seed", "launch", "expansion"]):
            return "medium"
        return "low"
