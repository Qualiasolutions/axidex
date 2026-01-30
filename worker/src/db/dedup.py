import hashlib
import structlog
from .supabase import get_client

log = structlog.get_logger()

# We use a simple local embedding approach for now
# In production, you'd use OpenAI embeddings or a local model
# For MVP, we use content hash + title similarity


def compute_content_hash(title: str, company: str) -> str:
    """Compute a deterministic hash for quick exact-match dedup."""
    content = f"{title.lower().strip()}|{company.lower().strip()}"
    return hashlib.sha256(content.encode()).hexdigest()[:32]


def is_duplicate(title: str, company_name: str, source_url: str) -> bool:
    """
    Check if this signal is a duplicate using multiple strategies:
    1. Exact URL match (already in supabase.signal_exists)
    2. Content hash match (same title + company)
    3. Fuzzy title match (future: vector similarity)
    """
    client = get_client()

    # Strategy 1: URL check (handled elsewhere, but double-check)
    url_result = (
        client.table("signals").select("id").eq("source_url", source_url).limit(1).execute()
    )
    if url_result.data:
        log.debug("duplicate_found", strategy="url", url=source_url)
        return True

    # Strategy 2: Content hash - check metadata for hash
    content_hash = compute_content_hash(title, company_name)

    # We store hash in metadata.content_hash
    hash_result = (
        client.table("signals")
        .select("id")
        .contains("metadata", {"content_hash": content_hash})
        .limit(1)
        .execute()
    )
    if hash_result.data:
        log.debug("duplicate_found", strategy="hash", title=title[:50])
        return True

    # Strategy 3: Title similarity (simple approach - check for near-identical titles)
    # For the same company, if title starts the same way, likely duplicate
    title_prefix = title[:50].lower()
    prefix_result = (
        client.table("signals")
        .select("id")
        .ilike("title", f"{title_prefix}%")
        .eq("company_name", company_name)
        .limit(1)
        .execute()
    )
    if prefix_result.data:
        log.debug("duplicate_found", strategy="prefix", title=title[:50])
        return True

    return False


def get_content_hash(title: str, company: str) -> dict:
    """Return metadata dict with content hash for storage."""
    return {"content_hash": compute_content_hash(title, company)}
