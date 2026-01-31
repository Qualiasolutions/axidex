import httpx
from selectolax.parser import HTMLParser
from urllib.parse import urlencode
from ..scrapers.base import BaseScraper
from ..models import Signal
from ..config import get_settings
from ..db.dedup import is_duplicate, get_content_hash
import structlog

log = structlog.get_logger()

# Default target companies (used if no config provided)
DEFAULT_TARGET_COMPANIES = [
    "Salesforce",
    "HubSpot",
    "Stripe",
    "Shopify",
    "Twilio",
]

# Default job title keywords indicating growth/buying signals
DEFAULT_SIGNAL_KEYWORDS = [
    "Sales Director",
    "Account Executive",
    "Business Development",
    "VP Sales",
    "Head of Growth",
    "Marketing Director",
    "Enterprise Sales",
]


class JobBoardScraper(BaseScraper):
    name = "jobs"

    def __init__(
        self,
        target_companies: list[str] | None = None,
        signal_keywords: list[str] | None = None,
    ):
        settings = get_settings()
        self.proxy = settings.proxy_url
        self.target_companies = target_companies or DEFAULT_TARGET_COMPANIES
        self.signal_keywords = signal_keywords or DEFAULT_SIGNAL_KEYWORDS

    async def scrape(self) -> list[Signal]:
        signals = []

        async with httpx.AsyncClient(
            timeout=30.0,
            proxy=self.proxy,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
        ) as client:
            for company in TARGET_COMPANIES:
                try:
                    company_signals = await self._scrape_company_jobs(client, company)
                    signals.extend(company_signals)
                except Exception as e:
                    log.error("company_jobs_failed", company=company, error=str(e))

        self.log_result(signals)
        return signals

    async def _scrape_company_jobs(
        self, client: httpx.AsyncClient, company: str
    ) -> list[Signal]:
        """Scrape Indeed for a specific company's job postings."""
        signals = []

        # Search Indeed for company jobs
        params = {
            "q": f'"{company}"',
            "l": "United States",
            "sort": "date",
        }
        url = f"https://www.indeed.com/jobs?{urlencode(params)}"

        try:
            resp = await client.get(url)
            if resp.status_code == 403:
                log.warning("rate_limited", source="indeed", company=company)
                return []
            resp.raise_for_status()
        except Exception as e:
            log.error("indeed_fetch_failed", company=company, error=str(e))
            return []

        parser = HTMLParser(resp.text)

        # Indeed job cards
        for job_card in parser.css("div.job_seen_beacon"):
            try:
                title_el = job_card.css_first("h2.jobTitle span")
                company_el = job_card.css_first("span[data-testid='company-name']")
                link_el = job_card.css_first("a.jcs-JobTitle")

                if not all([title_el, company_el, link_el]):
                    continue

                title = title_el.text(strip=True)
                detected_company = company_el.text(strip=True)
                job_link = "https://www.indeed.com" + link_el.attributes.get("href", "")

                # Only process if it's a target company
                if company.lower() not in detected_company.lower():
                    continue

                # Check if job title indicates buying signal
                if not any(kw.lower() in title.lower() for kw in SIGNAL_KEYWORDS):
                    continue

                # Dedup check
                if is_duplicate(title, detected_company, job_link):
                    continue

                signal = Signal(
                    company_name=detected_company,
                    signal_type="hiring",
                    title=f"{detected_company} is hiring: {title}",
                    summary=f"New job posting for {title} at {detected_company}. This indicates active growth and potential budget for solutions.",
                    source_url=job_link,
                    source_name="Indeed",
                    priority=self._assess_priority(title),
                    metadata=get_content_hash(title, detected_company),
                )
                signals.append(signal)

            except Exception as e:
                log.warning("job_parse_failed", error=str(e))

        return signals

    def _assess_priority(self, title: str) -> str:
        """VP/Director/Head = high priority, others = medium."""
        title_lower = title.lower()
        if any(
            kw in title_lower
            for kw in ["vp", "vice president", "director", "head of", "chief"]
        ):
            return "high"
        return "medium"
