"""
Product Hunt Scraper - Daily top product launches.
Uses the public RSS feed, no API key required.
"""

import asyncio
import xml.etree.ElementTree as ET
from html import unescape
import httpx
import structlog
from typing import Optional
import re
from datetime import datetime

from .base import BaseScraper
from ..models import Signal, Priority
from ..db.dedup import is_duplicate, get_content_hash

log = structlog.get_logger()


class ProductHuntScraper(BaseScraper):
    """
    Scrapes Product Hunt for new product launches.
    Great for discovering new tools and competitor launches.
    """

    name = "producthunt"

    RSS_URL = "https://www.producthunt.com/feed"

    def __init__(self, target_companies: list[str] | None = None):
        self.target_companies = [c.lower() for c in (target_companies or [])]

    async def scrape(self) -> list[Signal]:
        signals = []

        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            try:
                resp = await client.get(self.RSS_URL)
                if resp.status_code != 200:
                    log.warning("producthunt_fetch_failed", status=resp.status_code)
                    return []

                root = ET.fromstring(resp.content)

                for item in root.findall(".//item")[:30]:
                    signal = self._parse_item(item)
                    if signal:
                        signals.append(signal)

            except Exception as e:
                log.error("producthunt_scrape_failed", error=str(e))

        self.log_result(signals)
        return signals

    def _parse_item(self, item: ET.Element) -> Optional[Signal]:
        title_elem = item.find("title")
        link_elem = item.find("link")
        desc_elem = item.find("description")
        pub_date_elem = item.find("pubDate")

        if title_elem is None or link_elem is None:
            return None

        title = unescape(title_elem.text or "")
        url = link_elem.text or ""
        description = unescape(desc_elem.text or "") if desc_elem is not None else ""

        if not title or not url:
            return None

        # Parse product name and tagline (usually "Product Name — Tagline")
        parts = title.split("—")
        product_name = parts[0].strip() if parts else title
        tagline = parts[1].strip() if len(parts) > 1 else ""

        # Filter by target companies if specified
        if self.target_companies:
            title_lower = title.lower()
            if not any(tc in title_lower for tc in self.target_companies):
                return None

        # Dedup check
        if is_duplicate(title, product_name, url):
            return None

        # All Product Hunt items are product launches
        priority = self._assess_priority(title, description)

        # Clean description
        summary = re.sub(r'<[^>]+>', '', description)[:300]
        if tagline and tagline not in summary:
            summary = f"{tagline}. {summary}"

        return Signal(
            company_name=product_name,
            signal_type="product_launch",
            title=f"{product_name} launched on Product Hunt",
            summary=summary[:300] if summary else f"New product: {tagline or title}",
            source_url=url,
            source_name="Product Hunt",
            priority=priority,
            metadata={
                **get_content_hash(title, product_name),
                "tagline": tagline,
                "is_launch": True,
            },
        )

    def _assess_priority(self, title: str, description: str) -> Priority:
        combined = (title + " " + description).lower()

        # High priority keywords (enterprise, B2B, AI, funding)
        high_keywords = [
            "enterprise", "b2b", "saas", "ai", "artificial intelligence",
            "automation", "api", "developer", "infrastructure",
            "backed by", "funded", "yc", "y combinator",
        ]
        if any(kw in combined for kw in high_keywords):
            return "high"

        # Medium priority (useful tools)
        medium_keywords = [
            "productivity", "workflow", "analytics", "integration",
            "platform", "tool", "app", "software",
        ]
        if any(kw in combined for kw in medium_keywords):
            return "medium"

        return "low"
