"""
Tech Blogs RSS Scraper - Aggregates signals from major tech publications.
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


class TechBlogsScraper(BaseScraper):
    """
    Scrapes RSS feeds from major tech blogs and publications.
    Free, no API key required.
    """

    name = "techblogs"

    RSS_FEEDS = {
        "TechCrunch": "https://techcrunch.com/feed/",
        "VentureBeat": "https://venturebeat.com/feed/",
        "The Verge": "https://www.theverge.com/rss/index.xml",
        "Wired": "https://www.wired.com/feed/rss",
        "Ars Technica": "https://feeds.arstechnica.com/arstechnica/technology-lab",
        "MIT Tech Review": "https://www.technologyreview.com/feed/",
        "ZDNet": "https://www.zdnet.com/news/rss.xml",
        "InfoWorld": "https://www.infoworld.com/index.rss",
        "SaaStr": "https://www.saastr.com/feed/",
        "First Round Review": "https://review.firstround.com/feed.xml",
    }

    SIGNAL_KEYWORDS = [
        "funding", "raised", "series", "seed", "investment", "valuation",
        "launch", "announces", "unveils", "introduces", "releases",
        "hiring", "expands", "expansion", "growth", "scale",
        "partnership", "partners", "acquisition", "acquires",
        "ipo", "unicorn", "billion", "million",
    ]

    def __init__(self, target_companies: list[str] | None = None):
        self.target_companies = [c.lower() for c in (target_companies or [])]

    async def scrape(self) -> list[Signal]:
        signals = []

        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            for source_name, feed_url in self.RSS_FEEDS.items():
                try:
                    feed_signals = await self._scrape_feed(client, feed_url, source_name)
                    signals.extend(feed_signals)
                    await asyncio.sleep(0.5)
                except Exception as e:
                    log.warning("techblogs_feed_failed", source=source_name, error=str(e))

        self.log_result(signals)
        return signals

    async def _scrape_feed(self, client: httpx.AsyncClient, feed_url: str, source_name: str) -> list[Signal]:
        signals = []

        try:
            resp = await client.get(feed_url)
            if resp.status_code != 200:
                return []

            # Try parsing as RSS or Atom
            root = ET.fromstring(resp.content)

            # Handle both RSS and Atom formats
            items = root.findall(".//item") or root.findall(".//{http://www.w3.org/2005/Atom}entry")

            for item in items[:15]:
                signal = self._parse_item(item, source_name)
                if signal:
                    signals.append(signal)

        except Exception as e:
            log.debug("techblogs_parse_failed", source=source_name, error=str(e))

        return signals

    def _parse_item(self, item: ET.Element, source_name: str) -> Optional[Signal]:
        # RSS format
        title_elem = item.find("title")
        link_elem = item.find("link")
        desc_elem = item.find("description")

        # Atom format fallback
        if title_elem is None:
            title_elem = item.find("{http://www.w3.org/2005/Atom}title")
        if link_elem is None:
            link_elem = item.find("{http://www.w3.org/2005/Atom}link")
            if link_elem is not None:
                link_elem = type('obj', (object,), {'text': link_elem.get('href')})()
        if desc_elem is None:
            desc_elem = item.find("{http://www.w3.org/2005/Atom}summary")

        if title_elem is None:
            return None

        title = unescape(title_elem.text or "")
        url = link_elem.text if link_elem is not None else ""
        description = unescape(desc_elem.text or "") if desc_elem is not None else ""

        if not title:
            return None

        title_lower = title.lower()

        # Check if relevant (contains signal keywords)
        if not any(kw in title_lower for kw in self.SIGNAL_KEYWORDS):
            return None

        # Extract company name
        company_name = self._extract_company(title)

        # Filter by target companies if specified
        if self.target_companies:
            if not any(tc in title_lower for tc in self.target_companies):
                return None

        # Dedup check
        if is_duplicate(title, company_name, url):
            return None

        signal_type = self._detect_signal_type(title_lower)
        priority = self._assess_priority(title_lower)

        # Clean description
        summary = re.sub(r'<[^>]+>', '', description)[:300]
        if not summary:
            summary = f"From {source_name}: {title[:200]}"

        return Signal(
            company_name=company_name,
            signal_type=signal_type,
            title=title[:200],
            summary=summary,
            source_url=url,
            source_name=source_name,
            priority=priority,
            metadata={
                **get_content_hash(title, company_name),
                "blog_source": source_name,
            },
        )

    def _extract_company(self, title: str) -> str:
        # Common patterns in tech news
        patterns = [
            r'^(.+?)\s+(?:raises|launches|announces|unveils|acquires|partners)',
            r'^(.+?)\s+(?:is|has|gets|secures)',
            r"^(.+?)'s\s+",
        ]
        for pattern in patterns:
            match = re.match(pattern, title, re.IGNORECASE)
            if match:
                company = match.group(1).strip()
                if len(company) < 50:  # Reasonable company name length
                    return company

        # Fallback: first capitalized words
        words = title.split()
        company_words = []
        for word in words[:4]:
            if word[0].isupper() if word else False:
                company_words.append(word)
            else:
                break
        return " ".join(company_words) if company_words else "Tech Company"

    def _detect_signal_type(self, title: str) -> str:
        if any(w in title for w in ["hiring", "jobs", "recruit", "talent"]):
            return "hiring"
        if any(w in title for w in ["raised", "funding", "series", "seed", "investment", "valuation"]):
            return "funding"
        if any(w in title for w in ["launch", "release", "announce", "unveil", "introduce"]):
            return "product_launch"
        if any(w in title for w in ["partner", "acquisition", "acquire", "merge", "deal"]):
            return "partnership"
        if any(w in title for w in ["expand", "growth", "scale", "international"]):
            return "expansion"
        if any(w in title for w in ["ceo", "cto", "founder", "executive", "appoint"]):
            return "leadership_change"
        return "product_launch"

    def _assess_priority(self, title: str) -> Priority:
        if any(w in title for w in ["billion", "unicorn", "ipo", "$100m", "$50m"]):
            return "high"
        if any(w in title for w in ["million", "series b", "series c", "acquisition"]):
            return "high"
        if any(w in title for w in ["series a", "seed", "funding", "raised"]):
            return "medium"
        return "low"
