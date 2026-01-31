import httpx
from selectolax.parser import HTMLParser
from urllib.parse import urljoin
from ..scrapers.base import BaseScraper
from ..models import Signal
from ..db.dedup import is_duplicate, get_content_hash
import structlog

log = structlog.get_logger()

# Known company press release URLs mapping
KNOWN_PRESS_URLS = {
    "salesforce": {
        "domain": "salesforce.com",
        "press_url": "https://www.salesforce.com/news/press-releases/",
    },
    "hubspot": {
        "domain": "hubspot.com",
        "press_url": "https://www.hubspot.com/company/news",
    },
    "stripe": {
        "domain": "stripe.com",
        "press_url": "https://stripe.com/newsroom",
    },
    "shopify": {
        "domain": "shopify.com",
        "press_url": "https://news.shopify.com/",
    },
    "twilio": {
        "domain": "twilio.com",
        "press_url": "https://www.twilio.com/press",
    },
    "vercel": {
        "domain": "vercel.com",
        "press_url": "https://vercel.com/blog",
    },
    "supabase": {
        "domain": "supabase.com",
        "press_url": "https://supabase.com/blog",
    },
}


class CompanyWebsiteScraper(BaseScraper):
    name = "company"

    def __init__(self, target_companies: list[str] | None = None):
        self.target_companies = target_companies or list(KNOWN_PRESS_URLS.keys())

    def _get_company_sources(self) -> list[dict]:
        """Build list of company sources from target companies."""
        sources = []
        for company in self.target_companies:
            company_lower = company.lower()
            if company_lower in KNOWN_PRESS_URLS:
                info = KNOWN_PRESS_URLS[company_lower]
                sources.append({
                    "name": company,
                    "domain": info["domain"],
                    "press_url": info["press_url"],
                })
        return sources

    async def scrape(self) -> list[Signal]:
        signals = []
        company_sources = self._get_company_sources()

        if not company_sources:
            log.info("no_company_sources", target_companies=self.target_companies)
            return signals

        async with httpx.AsyncClient(
            timeout=30.0,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            },
            follow_redirects=True,
        ) as client:
            for company in company_sources:
                try:
                    # Scrape press releases
                    press_signals = await self._scrape_press_releases(client, company)
                    signals.extend(press_signals)
                except Exception as e:
                    log.error("press_scrape_failed", company=company["name"], error=str(e))

        self.log_result(signals)
        return signals

    async def _scrape_press_releases(
        self, client: httpx.AsyncClient, company: dict
    ) -> list[Signal]:
        """Scrape a company's press release page."""
        signals = []

        try:
            resp = await client.get(company["press_url"])
            resp.raise_for_status()
        except Exception as e:
            log.warning("press_page_failed", url=company["press_url"], error=str(e))
            return []

        parser = HTMLParser(resp.text)

        # Generic approach: find links that look like press releases
        # Most press pages have article/news items with links and dates
        for link in parser.css("a"):
            href = link.attributes.get("href", "")
            text = link.text(strip=True)

            if not href or not text or len(text) < 20:
                continue

            # Filter to likely press release links
            if not any(kw in href.lower() for kw in ["news", "press", "release", "announce"]):
                if not any(
                    kw in text.lower()
                    for kw in ["funding", "launch", "partner", "expand", "appoint"]
                ):
                    continue

            # Build full URL
            full_url = urljoin(company["press_url"], href)

            # Skip if not from this company's domain
            if company["domain"] not in full_url:
                continue

            # Dedup
            if is_duplicate(text, company["name"], full_url):
                continue

            # Classify the signal
            signal_type = self._classify_press_release(text)
            if not signal_type:
                continue

            signal = Signal(
                company_name=company["name"],
                company_domain=company["domain"],
                signal_type=signal_type,
                title=text[:200],
                summary=f"Press release from {company['name']}: {text[:300]}",
                source_url=full_url,
                source_name=f"{company['name']} Newsroom",
                priority=self._assess_priority(text),
                metadata=get_content_hash(text, company["name"]),
            )
            signals.append(signal)

        return signals

    def _classify_press_release(self, text: str) -> str | None:
        """Classify press release text into signal type."""
        text_lower = text.lower()

        if any(
            kw in text_lower
            for kw in ["funding", "raises", "investment", "series", "valuation"]
        ):
            return "funding"
        if any(
            kw in text_lower
            for kw in ["launch", "introduces", "unveils", "announces", "releases"]
        ):
            return "product_launch"
        if any(
            kw in text_lower
            for kw in ["partner", "collaboration", "alliance", "teams with"]
        ):
            return "partnership"
        if any(
            kw in text_lower
            for kw in ["expands", "opens", "new office", "new market", "international"]
        ):
            return "expansion"
        if any(
            kw in text_lower
            for kw in ["appoints", "names", "joins", "promotes", "ceo", "cto"]
        ):
            return "leadership_change"

        return None

    def _assess_priority(self, text: str) -> str:
        """Assess priority based on content."""
        text_lower = text.lower()

        # High priority: Major funding, C-suite changes
        if any(
            kw in text_lower
            for kw in ["$100", "$50", "billion", "ceo", "cto", "acquisition"]
        ):
            return "high"

        return "medium"
