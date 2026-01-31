"""
LinkedIn People Profiles Scraper using Bright Data Web Scraper API.

Collects profile data by URL for decision-maker identification and contact enrichment.
"""

import asyncio
from typing import Optional
import httpx
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from ..scrapers.base import BaseScraper
from ..models import Signal, Priority
from ..config import get_settings
from ..db.dedup import is_duplicate, get_content_hash

log = structlog.get_logger()

# Bright Data dataset ID for LinkedIn People Profiles (Collect by URL)
LINKEDIN_PROFILES_DATASET_ID = "gd_l1viktl72bvl7bjuj0"


class LinkedInProfilesScraper(BaseScraper):
    """
    LinkedIn People Profiles scraper using Bright Data Web Scraper API.

    Collects profiles by URL to identify decision makers and enrich contact data.
    Requires BRIGHT_DATA_API_TOKEN environment variable.
    """

    name = "linkedin_profiles"

    def __init__(self):
        settings = get_settings()
        self.api_token = settings.bright_data_api_token
        self._enabled = bool(self.api_token)

        if not self._enabled:
            log.warning(
                "linkedin_profiles_scraper_disabled",
                reason="BRIGHT_DATA_API_TOKEN not set",
            )

    async def scrape(self) -> list[Signal]:
        """
        Placeholder for scheduled scraping.

        For profiles, we typically scrape on-demand via scrape_profiles().
        """
        if not self._enabled:
            log.info("linkedin_profiles_scraper_skipped", reason="no credentials")
            return []
        return []

    async def scrape_profiles(self, profile_urls: list[str]) -> list[dict]:
        """
        Scrape LinkedIn profiles by URLs.

        Args:
            profile_urls: List of LinkedIn profile URLs to scrape

        Returns:
            List of profile data dictionaries
        """
        if not self._enabled:
            log.warning("linkedin_profiles_disabled", reason="no API token")
            return []

        if not profile_urls:
            return []

        return await self._collect_profiles(profile_urls)

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
    )
    async def _collect_profiles(self, profile_urls: list[str]) -> list[dict]:
        """
        Collect LinkedIn profiles using Bright Data API.

        Uses the "collect by URL" endpoint for LinkedIn people profiles.
        """
        api_url = "https://api.brightdata.com/datasets/v3/trigger"

        # Format input as required by Bright Data
        inputs = [{"url": url} for url in profile_urls]

        payload = {
            "dataset_id": LINKEDIN_PROFILES_DATASET_ID,
            "include_errors": True,
            "notify": False,
            "input": inputs,
        }

        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(api_url, json=payload, headers=headers)

            if response.status_code == 401:
                log.error("linkedin_profiles_auth_failed", status=401)
                return []

            if response.status_code == 429:
                log.warning("linkedin_profiles_rate_limited")
                return []

            response.raise_for_status()

            result = response.json()
            snapshot_id = result.get("snapshot_id")

            if not snapshot_id:
                log.warning("linkedin_profiles_no_snapshot", response=result)
                return []

            log.info("linkedin_profiles_triggered", snapshot_id=snapshot_id, count=len(profile_urls))

            # Poll for results
            profiles = await self._poll_for_results(client, snapshot_id, headers)

            log.info("linkedin_profiles_collected", count=len(profiles))
            return profiles

    async def _poll_for_results(
        self,
        client: httpx.AsyncClient,
        snapshot_id: str,
        headers: dict,
        max_attempts: int = 20,
        poll_interval: float = 5.0,
    ) -> list[dict]:
        """
        Poll Bright Data API for scrape results.

        LinkedIn profiles can take 10+ seconds per profile, so we poll
        with a longer interval and more attempts.
        """
        progress_url = f"https://api.brightdata.com/datasets/v3/progress/{snapshot_id}"
        data_url = f"https://api.brightdata.com/datasets/v3/snapshot/{snapshot_id}"

        for attempt in range(max_attempts):
            await asyncio.sleep(poll_interval)

            try:
                progress_resp = await client.get(progress_url, headers=headers)
                if progress_resp.status_code != 200:
                    continue

                progress = progress_resp.json()
                status = progress.get("status")

                if status == "ready":
                    data_resp = await client.get(data_url, headers=headers, params={"format": "json"})
                    if data_resp.status_code == 200:
                        return data_resp.json()
                    break
                elif status == "failed":
                    log.error("linkedin_profiles_failed", snapshot_id=snapshot_id, progress=progress)
                    break

                log.debug("linkedin_profiles_polling", attempt=attempt + 1, status=status)

            except Exception as e:
                log.warning("linkedin_profiles_poll_error", error=str(e))

        return []

    def profile_to_signal(self, profile: dict, signal_type: str = "job_change") -> Optional[Signal]:
        """
        Convert a LinkedIn profile to a buying signal.

        Useful for detecting job changes, new hires at target companies, etc.
        """
        name = profile.get("name", "")
        position = profile.get("position", "")
        company = profile.get("current_company", {})
        company_name = company.get("name", "") if isinstance(company, dict) else ""
        profile_url = profile.get("url", "")
        city = profile.get("city", "")
        about = profile.get("about", "")

        if not name or not company_name:
            return None

        if is_duplicate(name, company_name, profile_url):
            return None

        title = f"{name} - {position}" if position else name
        summary = about[:300] + "..." if about and len(about) > 300 else about
        if not summary:
            summary = f"{name} at {company_name}"

        return Signal(
            company_name=company_name,
            signal_type=signal_type,
            title=title,
            summary=summary,
            source_url=profile_url,
            source_name="LinkedIn",
            priority=self._assess_priority(position),
            metadata={
                **get_content_hash(name, company_name),
                "city": city,
                "linkedin_id": profile.get("id", ""),
                "followers": profile.get("followers"),
                "connections": profile.get("connections"),
                "source_platform": "linkedin_profiles",
            },
        )

    def _assess_priority(self, position: str) -> Priority:
        """
        Assess signal priority based on job position.
        """
        position_lower = position.lower() if position else ""
        high_priority = ["vp", "vice president", "director", "head of", "chief", "cro", "cmo", "cso", "svp", "evp", "founder", "ceo", "president"]
        if any(kw in position_lower for kw in high_priority):
            return "high"
        return "medium"
