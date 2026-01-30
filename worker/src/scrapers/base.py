from abc import ABC, abstractmethod
from ..models import Signal
from ..ai import extract_entities, classify_signal, score_priority
from ..config import get_settings
import structlog

log = structlog.get_logger()


class BaseScraper(ABC):
    name: str = "base"

    @abstractmethod
    async def scrape(self) -> list[Signal]:
        """Scrape source and return list of signals."""
        pass

    def log_result(self, signals: list[Signal]):
        log.info("scrape_complete", scraper=self.name, signal_count=len(signals))

    def enrich_signal(self, signal: Signal) -> Signal:
        """
        Enrich a signal with AI-extracted entities and classification.
        Updates signal in place and returns it.
        """
        settings = get_settings()
        if not settings.ai_enabled:
            return signal

        try:
            # Step 1: Extract entities
            entities = extract_entities(
                title=signal.title,
                summary=signal.summary,
                source_name=signal.source_name
            )

            # Merge extracted entities into metadata
            if entities:
                signal.metadata = {**signal.metadata, **entities}

            # Step 2: Classify signal type and priority
            ai_type, ai_priority, confidence = classify_signal(
                title=signal.title,
                summary=signal.summary,
                source_name=signal.source_name,
                entities=entities,
                fallback_type=signal.signal_type,
                fallback_priority=signal.priority
            )

            # Use AI classification if confident, otherwise keep rule-based
            if confidence >= 0.7:
                signal.signal_type = ai_type
                signal.priority = ai_priority
            else:
                # Low confidence: use rule-based scoring
                signal.priority = score_priority(
                    signal_type=signal.signal_type,
                    entities=entities,
                    source_name=signal.source_name
                )

            # Store confidence in metadata
            signal.metadata['ai_confidence'] = confidence
            signal.metadata['ai_enriched'] = True

            log.debug("signal_enriched", company=signal.company_name, type=signal.signal_type, priority=signal.priority)

        except Exception as e:
            log.warning("enrichment_failed", error=str(e), company=signal.company_name)
            signal.metadata['ai_enriched'] = False

        return signal
