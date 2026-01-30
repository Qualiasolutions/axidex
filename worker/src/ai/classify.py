from openai import OpenAI
from ..config import get_settings
from .extract import get_openai_client
import structlog
import json
from typing import Literal

log = structlog.get_logger()

SignalType = Literal['hiring', 'funding', 'expansion', 'partnership', 'product_launch', 'leadership_change']
Priority = Literal['high', 'medium', 'low']


CLASSIFICATION_PROMPT = """Classify this business signal and assess its sales priority.

Signal:
Title: {title}
Summary: {summary}
Source: {source_name}
Extracted Entities: {entities}

Classification rules:
- hiring: Company is recruiting, especially sales/growth roles
- funding: Company raised investment, new funding round
- expansion: Company entering new markets, opening offices
- partnership: Company forming alliances, integrations
- product_launch: Company releasing new products/features
- leadership_change: New executives, C-suite changes

Priority rules (for sales outreach potential):
- high: Large funding ($50M+), C-suite hires, major expansions, enterprise-focused signals
- medium: Standard funding rounds, director-level hires, product launches
- low: Seed rounds, junior hires, minor updates

Return JSON with exactly these fields:
{{"signal_type": "one of the types above", "priority": "high|medium|low", "confidence": 0.0-1.0, "reasoning": "brief explanation"}}"""


def classify_signal(
    title: str,
    summary: str,
    source_name: str,
    entities: dict,
    fallback_type: str = "product_launch",
    fallback_priority: str = "medium"
) -> tuple[SignalType, Priority, float]:
    """
    Use GPT-4o to classify signal type and priority.

    Returns: (signal_type, priority, confidence)
    Falls back to provided defaults if AI fails.
    """
    settings = get_settings()
    if not settings.ai_enabled or not settings.openai_api_key:
        log.debug("ai_disabled_or_no_key", skipping="classification")
        return fallback_type, fallback_priority, 0.0

    try:
        client = get_openai_client()

        prompt = CLASSIFICATION_PROMPT.format(
            title=title,
            summary=summary,
            source_name=source_name,
            entities=json.dumps(entities) if entities else "None"
        )

        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {"role": "system", "content": "You are a signal classification system. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=200,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content
        result = json.loads(content)

        signal_type = result.get("signal_type", fallback_type)
        priority = result.get("priority", fallback_priority)
        confidence = result.get("confidence", 0.5)

        # Validate signal_type
        valid_types = ['hiring', 'funding', 'expansion', 'partnership', 'product_launch', 'leadership_change']
        if signal_type not in valid_types:
            log.warning("invalid_signal_type", received=signal_type, using=fallback_type)
            signal_type = fallback_type

        # Validate priority
        valid_priorities = ['high', 'medium', 'low']
        if priority not in valid_priorities:
            log.warning("invalid_priority", received=priority, using=fallback_priority)
            priority = fallback_priority

        log.info("signal_classified", type=signal_type, priority=priority, confidence=confidence)
        return signal_type, priority, confidence

    except json.JSONDecodeError as e:
        log.warning("classification_json_error", error=str(e))
        return fallback_type, fallback_priority, 0.0
    except Exception as e:
        log.error("classification_failed", error=str(e))
        return fallback_type, fallback_priority, 0.0


def score_priority(
    signal_type: str,
    entities: dict,
    source_name: str
) -> Priority:
    """
    Rule-based priority scoring as fallback/supplement to AI.
    Used when AI confidence is low or AI is disabled.
    """
    score = 50  # Start at medium

    # Funding signals: check amount
    if signal_type == 'funding':
        amount = entities.get('funding_amount', '')
        if any(s in str(amount).lower() for s in ['billion', '100m', '50m']):
            score += 30
        elif any(s in str(amount).lower() for s in ['series c', 'series d', 'series e']):
            score += 20
        elif 'seed' in str(amount).lower() or 'pre-seed' in str(amount).lower():
            score -= 20

    # Hiring signals: check role seniority
    if signal_type == 'hiring':
        role = entities.get('role_title', '').lower()
        if any(s in role for s in ['vp', 'vice president', 'director', 'head of', 'chief', 'cxo']):
            score += 25
        elif any(s in role for s in ['manager', 'lead', 'senior']):
            score += 10

    # Leadership changes: C-suite is always high priority
    if signal_type == 'leadership_change':
        people = str(entities.get('key_people', '')).lower()
        if any(s in people for s in ['ceo', 'cto', 'cfo', 'coo', 'founder']):
            score += 30

    # Source reliability bonus
    trusted_sources = ['techcrunch', 'bloomberg', 'forbes', 'wall street journal']
    if any(s in source_name.lower() for s in trusted_sources):
        score += 10

    # Convert score to priority
    if score >= 70:
        return 'high'
    elif score >= 40:
        return 'medium'
    else:
        return 'low'
