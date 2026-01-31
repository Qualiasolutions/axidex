# Axidex Worker Alerting Setup

The worker exposes a health endpoint at `GET /health` on port 8080 (configurable via HEALTH_PORT).

## Health Response

```json
{
  "status": "healthy",
  "last_scrape_time": "2026-01-31T12:00:00Z",
  "last_scrape_success": true,
  "scrape_count": 42,
  "error_count": 0,
  "timestamp": "2026-01-31T12:05:00Z"
}
```

Status values: `starting`, `healthy`, `degraded`, `stopped`
- 200 OK: `healthy` or `starting`
- 503 Service Unavailable: `degraded` or `stopped`

## Railway Health Check

Railway automatically detects the health endpoint. To configure explicitly:

1. Go to Railway Dashboard -> axidex-worker -> Settings
2. Under "Health Check", set:
   - Path: `/health`
   - Port: `8080`
   - Interval: `60` (seconds)

Railway will restart the service if health checks fail.

## UptimeRobot Setup (External Monitoring)

1. Create account at uptimerobot.com (free tier: 50 monitors)
2. Add New Monitor:
   - Type: HTTP(s)
   - URL: `https://axidex-worker-production.up.railway.app/health`
   - Interval: 5 minutes
3. Configure Alert Contacts (email, Slack, etc.)

## Sentry Crons (Alternative)

Sentry Crons can monitor scheduled jobs. Add to worker after a scrape cycle:

```python
import sentry_sdk
from sentry_sdk.crons import monitor

@monitor(monitor_slug='axidex-worker-scrape')
async def run_scrapers():
    # ... existing code
```

Configure in Sentry Dashboard -> Crons to alert on missed check-ins.
