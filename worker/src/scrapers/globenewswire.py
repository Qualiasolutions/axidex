"""
GlobeNewswire RSS Scraper - Official press releases.
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


class GlobeNewswireScraper(BaseScraper):
    """
    Scrapes GlobeNewswire RSS feeds for official press releases.
    Free, no API key required.
    """

    name = "globenewswire"

    RSS_FEEDS = [
        "https://www.globenewswire.com/RssFeed/subjectcode/25-Earnings/feedTitle/GlobeNewswire%20-%20Earnings",
        "https://www.globenewswire.com/RssFeed/subjectcode/34-Contracts/feedTitle/GlobeNewswire%20-%20Contracts",
        "https://www.globenewswire.com/RssFeed/subjectcode/28-Product%20Launch/feedTitle/GlobeNewswire%20-%20Product%20Launch",
        "https://www.globenewswire.com/RssFeed/subjectcode/30-Personnel%20Announcements/feedTitle/GlobeNewswire%20-%20Personnel%20Announcements",
        "https://www.globenewswire.com/RssFeed/subjectcode/35-Funding%20Information/feedTitle/GlobeNewswire%20-%20Funding%20Information",
    ]

    def __init__(self, target_companies: list[str] | None = None):
        self.target_companies = [c.lower() for c in (target_companies or [])]

    async def scrape(self) -> list[Signal]:
        signals = []

        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            for feed_url in self.RSS_FEEDS:
                try:
                    feed_signals = await self._scrape_feed(client, feed_url)
                    signals.extend(feed_signals)
                    await asyncio.sleep(0.5)
                except Exception as e:
                    log.warning("globenewswire_feed_failed", error=str(e))

        self.log_result(signals)
        return signals

    async def _scrape_feed(self, client: httpx.AsyncClient, feed_url: str) -> list[Signal]:
        signals = []

        try:
            resp = await client.get(feed_url)
            if resp.status_code != 200:
                return []

            root = ET.fromstring(resp.content)

            for item in root.findall(".//item")[:15]:
                signal = self._parse_item(item)
                if signal:
                    signals.append(signal)

        except Exception as e:
            log.debug("globenewswire_parse_failed", error=str(e))

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

        company_name = self._extract_company(title)
        title_lower = title.lower()

        # Filter by target companies if specified
        if self.target_companies:
            if not any(tc in title_lower for tc in self.target_companies):
                return None

        # Dedup check
        if is_duplicate(title, company_name, url):
            return None

        signal_type = self._detect_signal_type(title_lower)
        priority = self._assess_priority(title_lower, description.lower())

        summary = re.sub(r'<[^>]+>', '', description)[:300]
        if not summary:
            summary = title

        return Signal(
            company_name=company_name,
            signal_type=signal_type,
            title=title[:200],
            summary=summary,
            source_url=url,
            source_name="GlobeNewswire",
            priority=priority,
            metadata={
                **get_content_hash(title, company_name),
                "is_press_release": True,
            },
        )

    def _extract_company(self, title: str) -> str:
        patterns = [
            r'^(.+?)\s+(?:Announces|Reports|Launches|Raises|Expands)',
            r'^(.+?)\s+(?:to\s+(?:Launch|Expand|Report))',
        ]
        for pattern in patterns:
            match = re.match(pattern, title, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        words = title.split()[:3]
        return " ".join(words)

    def _detect_signal_type(self, title: str) -> str:
        if any(w in title for w in ["hiring", "appoints", "names", "promotes"]):
            return "leadership_change"
        if any(w in title for w in ["raised", "funding", "investment", "capital"]):
            return "funding"
        if any(w in title for w in ["launch", "unveil", "introduce", "release"]):
            return "product_launch"
        if any(w in title for w in ["partner", "acquisition", "acquire", "agreement"]):
            return "partnership"
        if any(w in title for w in ["expand", "growth", "new office", "international"]):
            return "expansion"
        if any(w in title for w in ["revenue", "earnings", "results"]):
            return "expansion"
        return "product_launch"

    def _assess_priority(self, title: str, description: str) -> Priority:
        combined = title + " " + description
        if any(w in combined for w in ["billion", "100 million", "50 million"]):
            return "high"
        if any(w in combined for w in ["million", "series", "acquisition"]):
            return "high"
        if any(w in combined for w in ["funding", "launch", "expansion"]):
            return "medium"
        return "low"
