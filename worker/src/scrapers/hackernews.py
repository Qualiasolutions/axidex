"""
Hacker News Scraper - Free API, high-quality tech/startup news.
"""

import asyncio
import httpx
import structlog
from typing import Optional

from .base import BaseScraper
from ..models import Signal, Priority
from ..db.dedup import is_duplicate, get_content_hash

log = structlog.get_logger()

# Keywords that indicate buying signals
SIGNAL_KEYWORDS = [
    "hiring", "raised", "funding", "series a", "series b", "series c",
    "acquired", "acquisition", "ipo", "expansion", "launch", "partnership",
    "revenue", "growth", "scaling", "enterprise", "b2b", "saas",
]

# Companies to track
TARGET_COMPANIES = [
    "stripe", "shopify", "hubspot", "salesforce", "twilio", "vercel",
    "supabase", "linear", "notion", "figma", "slack", "zoom", "datadog",
    "snowflake", "mongodb", "elastic", "confluent", "hashicorp",
]


class HackerNewsScraper(BaseScraper):
    """
    Scrapes Hacker News top/new stories for buying signals.
    Uses the free HN API - no auth required.
    """

    name = "hackernews"

    def __init__(self, target_companies: list[str] | None = None):
        self.target_companies = [c.lower() for c in (target_companies or TARGET_COMPANIES)]
        self.base_url = "https://hacker-news.firebaseio.com/v0"

    async def scrape(self) -> list[Signal]:
        signals = []

        async with httpx.AsyncClient(timeout=30.0) as client:
            # Get top 100 stories
            top_url = f"{self.base_url}/topstories.json"
            new_url = f"{self.base_url}/newstories.json"

            try:
                top_resp = await client.get(top_url)
                new_resp = await client.get(new_url)

                top_ids = top_resp.json()[:50] if top_resp.status_code == 200 else []
                new_ids = new_resp.json()[:50] if new_resp.status_code == 200 else []

                all_ids = list(set(top_ids + new_ids))[:75]  # Dedupe and limit

                # Fetch stories in parallel batches
                for i in range(0, len(all_ids), 10):
                    batch_ids = all_ids[i:i+10]
                    tasks = [self._fetch_story(client, sid) for sid in batch_ids]
                    stories = await asyncio.gather(*tasks, return_exceptions=True)

                    for story in stories:
                        if isinstance(story, dict):
                            signal = self._parse_story(story)
                            if signal:
                                signals.append(signal)

                    await asyncio.sleep(0.5)  # Rate limit

            except Exception as e:
                log.error("hackernews_scrape_failed", error=str(e))

        self.log_result(signals)
        return signals

    async def _fetch_story(self, client: httpx.AsyncClient, story_id: int) -> Optional[dict]:
        try:
            url = f"{self.base_url}/item/{story_id}.json"
            resp = await client.get(url)
            if resp.status_code == 200:
                return resp.json()
        except Exception:
            pass
        return None

    def _parse_story(self, story: dict) -> Optional[Signal]:
        title = story.get("title", "")
        url = story.get("url", "")
        story_id = story.get("id")

        if not title:
            return None

        title_lower = title.lower()

        # Check if it matches a target company
        matched_company = None
        for company in self.target_companies:
            if company in title_lower:
                matched_company = company.title()
                break

        # Check if it has signal keywords
        has_signal = any(kw in title_lower for kw in SIGNAL_KEYWORDS)

        if not matched_company and not has_signal:
            return None

        # Determine signal type
        signal_type = self._detect_signal_type(title_lower)

        # Skip if no URL (text-only posts)
        if not url:
            url = f"https://news.ycombinator.com/item?id={story_id}"

        # Dedup check
        company_name = matched_company or "Tech Industry"
        if is_duplicate(title, company_name, url):
            return None

        priority = self._assess_priority(title_lower, story.get("score", 0))

        return Signal(
            company_name=company_name,
            signal_type=signal_type,
            title=title,
            summary=f"Trending on Hacker News with {story.get('score', 0)} points. {story.get('descendants', 0)} comments.",
            source_url=url,
            source_name="Hacker News",
            priority=priority,
            metadata={
                **get_content_hash(title, company_name),
                "hn_id": story_id,
                "score": story.get("score", 0),
                "comments": story.get("descendants", 0),
            },
        )

    def _detect_signal_type(self, title: str) -> str:
        if any(w in title for w in ["hiring", "job", "career", "engineer", "developer"]):
            return "hiring"
        if any(w in title for w in ["raised", "funding", "series", "seed", "investment", "ipo"]):
            return "funding"
        if any(w in title for w in ["launch", "released", "announcing", "introducing", "new product"]):
            return "product_launch"
        if any(w in title for w in ["acquired", "acquisition", "merge", "partnership"]):
            return "partnership"
        if any(w in title for w in ["expand", "growth", "scaling", "international"]):
            return "expansion"
        if any(w in title for w in ["ceo", "cto", "founder", "executive", "leadership"]):
            return "leadership_change"
        return "product_launch"

    def _assess_priority(self, title: str, score: int) -> Priority:
        # High score = high visibility = high priority
        if score > 200:
            return "high"
        if any(w in title for w in ["raised", "funding", "acquired", "ipo"]):
            return "high"
        if score > 50:
            return "medium"
        return "low"
