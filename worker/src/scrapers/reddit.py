"""
Reddit Scraper - Tech and startup subreddits for signals.
Uses public JSON API, no auth required.
"""

import asyncio
import httpx
import structlog
from typing import Optional

from .base import BaseScraper
from ..models import Signal, Priority
from ..db.dedup import is_duplicate, get_content_hash

log = structlog.get_logger()


class RedditScraper(BaseScraper):
    """
    Scrapes Reddit tech/startup subreddits for company signals.
    Uses public JSON endpoints (no API key needed).
    """

    name = "reddit"

    SUBREDDITS = [
        "startups",
        "SaaS",
        "Entrepreneur",
        "technology",
        "programming",
        "webdev",
        "venturecapital",
        "smallbusiness",
        "growmybusiness",
    ]

    SIGNAL_KEYWORDS = [
        "raised", "funding", "series", "seed", "investment",
        "launched", "launching", "announce", "released",
        "hiring", "looking for", "job opening",
        "acquired", "acquisition", "partnership",
        "expanding", "growth", "scaling",
        "reached", "milestone", "customers", "revenue",
    ]

    def __init__(self, target_companies: list[str] | None = None):
        self.target_companies = [c.lower() for c in (target_companies or [])]

    async def scrape(self) -> list[Signal]:
        signals = []

        headers = {
            "User-Agent": "Axidex Signal Scraper 1.0"
        }

        async with httpx.AsyncClient(timeout=30.0, headers=headers) as client:
            for subreddit in self.SUBREDDITS:
                try:
                    sub_signals = await self._scrape_subreddit(client, subreddit)
                    signals.extend(sub_signals)
                    await asyncio.sleep(2.0)  # Reddit rate limit
                except Exception as e:
                    log.warning("reddit_subreddit_failed", subreddit=subreddit, error=str(e))

        self.log_result(signals)
        return signals

    async def _scrape_subreddit(self, client: httpx.AsyncClient, subreddit: str) -> list[Signal]:
        signals = []

        url = f"https://www.reddit.com/r/{subreddit}/hot.json?limit=25"

        try:
            resp = await client.get(url)
            if resp.status_code != 200:
                return []

            data = resp.json()
            posts = data.get("data", {}).get("children", [])

            for post_data in posts:
                post = post_data.get("data", {})
                signal = self._parse_post(post, subreddit)
                if signal:
                    signals.append(signal)

        except Exception as e:
            log.debug("reddit_parse_failed", subreddit=subreddit, error=str(e))

        return signals

    def _parse_post(self, post: dict, subreddit: str) -> Optional[Signal]:
        title = post.get("title", "")
        url = post.get("url", "")
        selftext = post.get("selftext", "")
        score = post.get("score", 0)
        permalink = post.get("permalink", "")

        if not title:
            return None

        title_lower = title.lower()

        # Check for signal keywords
        if not any(kw in title_lower for kw in self.SIGNAL_KEYWORDS):
            return None

        # Filter by target companies if specified
        if self.target_companies:
            if not any(tc in title_lower for tc in self.target_companies):
                return None

        # Minimum engagement threshold
        if score < 5:
            return None

        # Full URL
        full_url = f"https://reddit.com{permalink}" if permalink else url

        # Extract company name
        company_name = self._extract_company(title)

        # Dedup check
        if is_duplicate(title, company_name, full_url):
            return None

        signal_type = self._detect_signal_type(title_lower)
        priority = self._assess_priority(title_lower, score)

        # Create summary
        summary = selftext[:300] if selftext else f"Posted in r/{subreddit} with {score} upvotes."

        return Signal(
            company_name=company_name,
            signal_type=signal_type,
            title=title[:200],
            summary=summary,
            source_url=full_url,
            source_name=f"Reddit r/{subreddit}",
            priority=priority,
            metadata={
                **get_content_hash(title, company_name),
                "subreddit": subreddit,
                "score": score,
            },
        )

    def _extract_company(self, title: str) -> str:
        # Try to find company name patterns
        import re
        patterns = [
            r'^(?:We|Our company|My startup)\s+(.+?)\s+(?:raised|launched|just)',
            r'^(.+?)\s+(?:raises|launches|announces|acquired)',
            r'(?:at|for|with)\s+(.+?)\s*(?:\.|,|$)',
        ]
        for pattern in patterns:
            match = re.search(pattern, title, re.IGNORECASE)
            if match:
                company = match.group(1).strip()
                if 3 < len(company) < 50:
                    return company

        return "Startup"

    def _detect_signal_type(self, title: str) -> str:
        if any(w in title for w in ["hiring", "job", "looking for", "recruit"]):
            return "hiring"
        if any(w in title for w in ["raised", "funding", "series", "seed", "investment"]):
            return "funding"
        if any(w in title for w in ["launched", "launch", "released", "announce"]):
            return "product_launch"
        if any(w in title for w in ["acquired", "acquisition", "partner", "collaboration"]):
            return "partnership"
        if any(w in title for w in ["expand", "growth", "scaling", "milestone"]):
            return "expansion"
        return "product_launch"

    def _assess_priority(self, title: str, score: int) -> Priority:
        if score > 500 or any(w in title for w in ["million", "billion", "acquired"]):
            return "high"
        if score > 100 or any(w in title for w in ["funding", "series", "raised"]):
            return "medium"
        return "low"
