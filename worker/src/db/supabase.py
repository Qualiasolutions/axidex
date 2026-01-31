from supabase import create_client, Client
from ..config import get_settings
from ..models import Signal
from dataclasses import dataclass
from datetime import datetime
import structlog

log = structlog.get_logger()

_client: Client | None = None


@dataclass
class ScraperConfig:
    """User's scraper configuration from database."""
    user_id: str | None
    target_companies: list[str]
    signal_keywords: list[str]
    sources: dict[str, bool]


@dataclass
class ScrapeRun:
    """Tracks a scrape run's progress."""
    id: str
    user_id: str | None
    status: str


def get_client() -> Client:
    global _client
    if _client is None:
        settings = get_settings()
        _client = create_client(
            settings.supabase_url, settings.supabase_service_role_key
        )
    return _client


def insert_signal(signal: Signal, user_id: str | None = None) -> dict | None:
    """Insert a signal. If user_id is None, creates a shared signal visible to all users."""
    try:
        client = get_client()
        data = signal.model_dump()
        if user_id is not None:
            data["user_id"] = user_id
        # user_id will be NULL for shared signals
        result = client.table("signals").insert(data).execute()
        log.info("signal_inserted", company=signal.company_name, type=signal.signal_type, shared=user_id is None)
        return result.data[0] if result.data else None
    except Exception as e:
        log.error("signal_insert_failed", error=str(e), company=signal.company_name)
        return None


def signal_exists(source_url: str) -> bool:
    """Check if a signal with this source URL already exists (basic dedup)."""
    client = get_client()
    result = (
        client.table("signals").select("id").eq("source_url", source_url).limit(1).execute()
    )
    return len(result.data) > 0


def get_scraper_configs() -> list[ScraperConfig]:
    """
    Get all active scraper configurations from the database.
    Returns a list of ScraperConfig objects with target companies and enabled sources.
    """
    client = get_client()
    try:
        result = client.table("scraper_config").select("*").eq("auto_scrape_enabled", True).execute()

        configs = []
        for row in result.data:
            configs.append(ScraperConfig(
                user_id=row.get("user_id"),
                target_companies=row.get("target_companies", []),
                signal_keywords=row.get("signal_keywords", []),
                sources={
                    "techcrunch": row.get("source_techcrunch", True),
                    "indeed": row.get("source_indeed", True),
                    "linkedin": row.get("source_linkedin", False),
                    "company": row.get("source_company_newsrooms", True),
                }
            ))
        return configs
    except Exception as e:
        log.error("get_scraper_configs_failed", error=str(e))
        return []


def get_pending_scrape_run() -> ScrapeRun | None:
    """Check for a pending scrape run triggered manually from the UI."""
    client = get_client()
    try:
        result = (
            client.table("scrape_runs")
            .select("id, user_id, status")
            .eq("status", "pending")
            .order("created_at", desc=False)
            .limit(1)
            .execute()
        )
        if result.data:
            row = result.data[0]
            return ScrapeRun(
                id=row["id"],
                user_id=row.get("user_id"),
                status=row["status"]
            )
        return None
    except Exception as e:
        log.error("get_pending_scrape_run_failed", error=str(e))
        return None


def create_scrape_run(user_id: str | None = None) -> str | None:
    """Create a new scrape run record and return its ID."""
    client = get_client()
    try:
        data = {
            "status": "running",
            "started_at": datetime.utcnow().isoformat(),
            "progress": {},
            "signals_by_source": {},
        }
        if user_id:
            data["user_id"] = user_id

        result = client.table("scrape_runs").insert(data).execute()
        if result.data:
            return result.data[0]["id"]
        return None
    except Exception as e:
        log.error("create_scrape_run_failed", error=str(e))
        return None


def update_scrape_run(
    run_id: str,
    status: str | None = None,
    progress: dict | None = None,
    total_signals: int | None = None,
    signals_by_source: dict | None = None,
    ai_enriched_count: int | None = None,
    error_message: str | None = None,
    estimated_duration_seconds: int | None = None,
) -> bool:
    """Update a scrape run with progress or completion status."""
    client = get_client()
    try:
        data = {}
        if status:
            data["status"] = status
        if progress is not None:
            data["progress"] = progress
        if total_signals is not None:
            data["total_signals"] = total_signals
        if signals_by_source is not None:
            data["signals_by_source"] = signals_by_source
        if ai_enriched_count is not None:
            data["ai_enriched_count"] = ai_enriched_count
        if error_message is not None:
            data["error_message"] = error_message
        if estimated_duration_seconds is not None:
            data["estimated_duration_seconds"] = estimated_duration_seconds
        if status == "completed" or status == "failed":
            data["completed_at"] = datetime.utcnow().isoformat()

        client.table("scrape_runs").update(data).eq("id", run_id).execute()
        return True
    except Exception as e:
        log.error("update_scrape_run_failed", error=str(e), run_id=run_id)
        return False


def get_merged_target_companies() -> list[str]:
    """
    Get a merged list of all target companies from all active configs.
    Removes duplicates and returns a unique list.
    """
    configs = get_scraper_configs()
    all_companies = set()
    for config in configs:
        all_companies.update(config.target_companies)
    return list(all_companies)


def get_merged_signal_keywords() -> list[str]:
    """
    Get a merged list of all signal keywords from all active configs.
    Removes duplicates and returns a unique list.
    """
    configs = get_scraper_configs()
    all_keywords = set()
    for config in configs:
        all_keywords.update(config.signal_keywords)
    return list(all_keywords)


def get_enabled_sources() -> dict[str, bool]:
    """
    Get merged enabled sources from all active configs.
    A source is enabled if ANY user has it enabled.
    """
    configs = get_scraper_configs()
    sources = {
        "techcrunch": False,
        "indeed": False,
        "linkedin": False,
        "company": False,
    }
    for config in configs:
        for source, enabled in config.sources.items():
            if enabled:
                sources[source] = True
    return sources
