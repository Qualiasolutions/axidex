import sentry_sdk
from sentry_sdk.integrations.logging import LoggingIntegration
import logging
from .config import get_settings


def init_sentry():
    """Initialize Sentry for the worker process."""
    settings = get_settings()

    if not settings.sentry_dsn:
        return False

    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        environment="production",

        # Performance monitoring
        traces_sample_rate=0.1,

        # Capture INFO+ logs as breadcrumbs, WARNING+ as events
        integrations=[
            LoggingIntegration(
                level=logging.INFO,
                event_level=logging.WARNING,
            ),
        ],

        # Add worker context to all events
        release="axidex-worker@0.1.0",
    )

    # Set default tags
    sentry_sdk.set_tag("service", "worker")

    return True
