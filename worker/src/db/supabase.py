from supabase import create_client, Client
from ..config import settings
from ..models import Signal
import structlog

log = structlog.get_logger()

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(
            settings.supabase_url, settings.supabase_service_role_key
        )
    return _client


def insert_signal(signal: Signal, user_id: str) -> dict | None:
    """Insert a signal for a specific user. Returns inserted row or None on error."""
    try:
        client = get_client()
        data = signal.model_dump()
        data["user_id"] = user_id
        result = client.table("signals").insert(data).execute()
        log.info("signal_inserted", company=signal.company_name, type=signal.signal_type)
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
