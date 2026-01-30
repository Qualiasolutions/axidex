"""
LinkedIn Jobs Scraper using Bright Data SDK.

Uses Bright Data's Web Scraper API for LinkedIn Jobs with legal protection and anti-detection.
Only scrapes publicly visible job listings (no login required).
"""

import asyncio
import random
from typing import Optional
import httpx
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from ..scrapers.base import BaseScraper
from ..models import Signal
from ..config import get_settings
from ..db.dedup import is_duplicate, get_content_hash

log = structlog.get_logger()

# Target companies for LinkedIn job scraping
# In production, this would come from user preferences or database
TARGET_COMPANIES = [
    "Stripe",
    "Shopify",
    "Vercel",
    "Supabase",
    "Linear",
]

# Job title keywords indicating buying signals
SIGNAL_KEYWORDS = [
    "Sales",
    "Account Executive",
    "Business Development",
    "VP",
    "Director",
    "Head of",
    "Growth",
    "Marketing",
    "Enterprise",
    "Revenue",
    "Partnerships",
]


class LinkedInScraper(BaseScraper):
    """
    LinkedIn Jobs scraper using Bright Data Web Scraper API.

    Requires BRIGHT_DATA_API_TOKEN environment variable.
    If not set, scraper skips gracefully without crashing.

    Rate limiting: 2-5 second random delays between company requests
    to prevent detection and bans.
    """

    name = "linkedin"

    def __init__(self):
        settings = get_settings()
        self.api_token = settings.bright_data_api_token
        self.proxy_url = settings.proxy_url
        self._enabled = bool(self.api_token)

        if not self._enabled:
            log.warning(
                "linkedin_scraper_disabled",
                reason="BRIGHT_DATA_API_TOKEN not set",
                hint="Set BRIGHT_DATA_API_TOKEN in environment to enable LinkedIn scraping"
            )

    async def scrape(self) -> list[Signal]:
        """
        Scrape LinkedIn jobs for target companies.

        Returns empty list if Bright Data credentials are not configured.
        """
        if not self._enabled:
            log.info("linkedin_scraper_skipped", reason="no credentials")
            return []

        signals = []

        for company in TARGET_COMPANIES:
            try:
                company_signals = await self._scrape_company_jobs(company)
                signals.extend(company_signals)

                # Rate limiting: random delay between company requests (2-5 seconds)
                delay = random.uniform(2.0, 5.0)
                log.debug("rate_limit_delay", company=company, delay_seconds=delay)
                await asyncio.sleep(delay)

            except Exception as e:
                log.error("linkedin_company_failed", company=company, error=str(e))

        self.log_result(signals)
        return signals

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException)),
        before_sleep=lambda retry_state: log.warning(
            "linkedin_retry",
            attempt=retry_state.attempt_number,
            wait=retry_state.next_action.sleep
        )
    )
    async def _scrape_company_jobs(self, company: str) -> list[Signal]:
        """
        Scrape LinkedIn job listings for a specific company using Bright Data API.

        Uses the Web Scraper API endpoint which returns structured job data.
        """
        signals = []

        # Bright Data Web Scraper API for LinkedIn Jobs
        # https://docs.brightdata.com/scraping-automation/web-scraper-api/linkedin
        api_url = "https://api.brightdata.com/datasets/v3/trigger"

        payload = {
            "dataset_id": "gd_l1viktl72bvl7bjuj0",  # LinkedIn Jobs dataset
            "include_errors": True,
            "limit_multiple_results": 25,
            "notify": False,
            "input": [
                {
                    "company_name": company,
                    "country": "United States",
                }
            ]
        }

        headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            # Trigger the scrape
            response = await client.post(api_url, json=payload, headers=headers)

            if response.status_code == 401:
                log.error("linkedin_auth_failed", status=401, hint="Check BRIGHT_DATA_API_TOKEN")
                return []

            if response.status_code == 429:
                log.warning("linkedin_rate_limited", company=company)
                return []

            response.raise_for_status()

            result = response.json()
            snapshot_id = result.get("snapshot_id")

            if not snapshot_id:
                log.warning("linkedin_no_snapshot", company=company, response=result)
                return []

            # Poll for results (Bright Data processes asynchronously)
            jobs_data = await self._poll_for_results(client, snapshot_id, headers)

            if not jobs_data:
                log.info("linkedin_no_jobs", company=company)
                return []

            # Parse jobs into signals
            for job in jobs_data:
                signal = self._parse_job_to_signal(job, company)
                if signal:
                    signals.append(signal)

        return signals

    async def _poll_for_results(
        self,
        client: httpx.AsyncClient,
        snapshot_id: str,
        headers: dict,
        max_attempts: int = 10,
        poll_interval: float = 3.0
    ) -> list[dict]:
        """
        Poll Bright Data API for scrape results.

        The API processes requests asynchronously, so we need to poll
        until results are ready.
        """
        progress_url = f"https://api.brightdata.com/datasets/v3/progress/{snapshot_id}"
        data_url = f"https://api.brightdata.com/datasets/v3/snapshot/{snapshot_id}"

        for attempt in range(max_attempts):
            await asyncio.sleep(poll_interval)

            # Check progress
            progress_resp = await client.get(progress_url, headers=headers)
            if progress_resp.status_code != 200:
                continue

            progress = progress_resp.json()
            status = progress.get("status")

            if status == "ready":
                # Fetch results
                data_resp = await client.get(data_url, headers=headers, params={"format": "json"})
                if data_resp.status_code == 200:
                    return data_resp.json()
                break
            elif status == "failed":
                log.error("linkedin_scrape_failed", snapshot_id=snapshot_id, progress=progress)
                break

            log.debug("linkedin_poll_waiting", attempt=attempt + 1, status=status)

        return []

    def _parse_job_to_signal(self, job: dict, default_company: str) -> Optional[Signal]:
        """
        Parse a Bright Data LinkedIn job result into a Signal.

        Returns None if job doesn't match signal criteria or is a duplicate.
        """
        title = job.get("title") or job.get("job_title", "")
        company_name = job.get("company_name") or job.get("company", default_company)
        job_url = job.get("url") or job.get("job_url", "")
        description = job.get("description") or job.get("job_description", "")
        location = job.get("location", "")

        if not title or not job_url:
            return None

        # Check if job title indicates buying signal
        title_lower = title.lower()
        if not any(kw.lower() in title_lower for kw in SIGNAL_KEYWORDS):
            return None

        # Dedup check
        if is_duplicate(title, company_name, job_url):
            log.debug("linkedin_duplicate_skipped", title=title, company=company_name)
            return None

        # Truncate description for summary
        summary_text = description[:300] + "..." if len(description) > 300 else description
        if not summary_text:
            summary_text = f"New job posting for {title} at {company_name}."

        priority = self._assess_priority(title)

        return Signal(
            company_name=company_name,
            signal_type="hiring",
            title=f"{company_name} is hiring: {title}",
            summary=summary_text,
            source_url=job_url,
            source_name="LinkedIn",
            priority=priority,
            metadata={
                **get_content_hash(title, company_name),
                "location": location,
                "source_platform": "linkedin",
            },
        )

    def _assess_priority(self, title: str) -> str:
        """
        Assess signal priority based on job title.

        VP/Director/Head = high priority (budget authority)
        Others = medium (AI enrichment may adjust)
        """
        title_lower = title.lower()
        high_priority_keywords = [
            "vp",
            "vice president",
            "director",
            "head of",
            "chief",
            "cro",
            "cmo",
            "cso",
            "svp",
            "evp",
        ]
        if any(kw in title_lower for kw in high_priority_keywords):
            return "high"
        return "medium"
