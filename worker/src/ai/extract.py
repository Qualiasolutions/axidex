from openai import OpenAI
from ..config import get_settings
import structlog
import json

log = structlog.get_logger()

_client: OpenAI | None = None


def get_openai_client() -> OpenAI:
    """Get or create OpenAI client singleton."""
    global _client
    if _client is None:
        settings = get_settings()
        if not settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY not set")
        # Support OpenRouter or other OpenAI-compatible APIs via base_url
        _client = OpenAI(
            api_key=settings.openai_api_key,
            base_url=settings.openai_api_base,  # None uses default OpenAI URL
        )
    return _client


EXTRACTION_PROMPT = """Extract structured entities from this business signal. Return JSON only.

Signal:
Title: {title}
Summary: {summary}
Source: {source_name}

Extract these fields (use null if not found):
- company_name: The primary company this signal is about
- funding_amount: Dollar amount if funding mentioned (e.g., "$50M", "$100 million")
- funding_round: Series A, B, C, Seed, etc.
- role_title: Job title if hiring signal
- key_people: Names of executives/founders mentioned
- industry: Company's industry/sector
- location: Geographic location if mentioned

Return ONLY valid JSON, no markdown formatting."""


def extract_entities(title: str, summary: str, source_name: str) -> dict:
    """
    Use GPT-4o to extract structured entities from signal content.
    Returns dict with extracted fields, empty dict on error.
    """
    settings = get_settings()
    if not settings.ai_enabled or not settings.openai_api_key:
        log.debug("ai_disabled_or_no_key", skipping="entity_extraction")
        return {}

    try:
        client = get_openai_client()

        prompt = EXTRACTION_PROMPT.format(
            title=title,
            summary=summary,
            source_name=source_name
        )

        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are an entity extraction system. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=500,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        entities = json.loads(content)

        log.info("entities_extracted", company=entities.get("company_name"), fields=len([v for v in entities.values() if v]))
        return entities

    except json.JSONDecodeError as e:
        log.warning("entity_extraction_json_error", error=str(e))
        return {}
    except Exception as e:
        log.error("entity_extraction_failed", error=str(e))
        return {}
