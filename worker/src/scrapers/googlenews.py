"""
Google News RSS Scraper - Free, reliable news aggregation.
"""

import asyncio
import xml.etree.ElementTree as ET
from html import unescape
from urllib.parse import quote
import httpx
import structlog
from typing import Optional

from .base import BaseScraper
from ..models import Signal, Priority
from ..db.dedup import is_duplicate, get_content_hash

log = structlog.get_logger()


class GoogleNewsScraper(BaseScraper):
    """
    Scrapes Google News RSS feeds for company-specific news.
    Free, no API key required.
    """

    name = "googlenews"

    def __init__(self, target_companies: list[str] | None = None):
        self.target_companies = target_companies or [
            "Stripe", "Shopify", "HubSpot", "Salesforce", "Twilio",
            "Vercel", "Supabase", "Linear", "Notion", "Figma",
            "Slack", "Zoom", "Datadog", "Snowflake", "MongoDB",
        ]

    async def scrape(self) -> list[Signal]:
        signals = []

        async with httpx.AsyncClient(timeout=30.0) as client:
            for company in self.target_companies:
                try:
                    company_signals = await self._scrape_company(client, company)
                    signals.extend(company_signals)
                    await asyncio.sleep(1.0)  # Rate limit
                except Exception as e:
                    log.error("googlenews_company_failed", company=company, error=str(e))

        self.log_result(signals)
        return signals

    async def _scrape_company(self, client: httpx.AsyncClient, company: str) -> list[Signal]:
        signals = []

        # Search queries for different signal types
        queries = [
            f"{company} funding raised",
            f"{company} hiring jobs",
            f"{company} expansion growth",
            f"{company} partnership announcement",
            f"{company} product launch",
        ]

        for query in queries:
            try:
                encoded_query = quote(query)
                url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"

                resp = await client.get(url, follow_redirects=True)
                if resp.status_code != 200:
                    continue

                # Parse RSS XML
                root = ET.fromstring(resp.content)

                for item in root.findall(".//item")[:5]:  # Top 5 per query
                    signal = self._parse_item(item, company)
                    if signal:
                        signals.append(signal)

            except Exception as e:
                log.debug("googlenews_query_failed", query=query, error=str(e))

        return signals

    def _parse_item(self, item: ET.Element, company: str) -> Optional[Signal]:
        title_elem = item.find("title")
        link_elem = item.find("link")
        pub_date_elem = item.find("pubDate")
        source_elem = item.find("source")

        if title_elem is None or link_elem is None:
            return None

        title = unescape(title_elem.text or "")
        url = link_elem.text or ""
        source_name = source_elem.text if source_elem is not None else "Google News"

        if not title or not url:
            return None

        # Dedup check
        if is_duplicate(title, company, url):
            return None

        signal_type = self._detect_signal_type(title.lower())
        priority = self._assess_priority(title.lower())

        # Create summary from title
        summary = f"News from {source_name}: {title[:200]}"

        return Signal(
            company_name=company,
            signal_type=signal_type,
            title=title[:200],
            summary=summary,
            source_url=url,
            source_name=f"Google News ({source_name})",
            priority=priority,
            metadata={
                **get_content_hash(title, company),
                "original_source": source_name,
            },
        )

    def _detect_signal_type(self, title: str) -> str:
        if any(w in title for w in ["hiring", "jobs", "recruit", "talent"]):
            return "hiring"
        if any(w in title for w in ["raised", "funding", "series", "seed", "investment", "valuation"]):
            return "funding"
        if any(w in title for w in ["launch", "released", "announce", "introducing", "unveil"]):
            return "product_launch"
        if any(w in title for w in ["partner", "collaboration", "acquisition", "acquire", "merge"]):
            return "partnership"
        if any(w in title for w in ["expand", "growth", "international", "new market", "office"]):
            return "expansion"
        if any(w in title for w in ["ceo", "cto", "founder", "executive", "appoint", "hire"]):
            return "leadership_change"
        return "product_launch"

    def _assess_priority(self, title: str) -> Priority:
        high_keywords = ["billion", "million", "raised", "acquired", "ipo", "unicorn"]
        if any(w in title for w in high_keywords):
            return "high"
        medium_keywords = ["funding", "series", "launch", "expansion", "partnership"]
        if any(w in title for w in medium_keywords):
            return "medium"
        return "low"
