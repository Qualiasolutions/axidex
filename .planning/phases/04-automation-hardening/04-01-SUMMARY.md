---
phase: 04-automation-hardening
plan: 01
subsystem: scrapers
tags: [linkedin, bright-data, httpx, tenacity, webscraping]

# Dependency graph
requires:
  - phase: 02-signal-ingestion
    provides: BaseScraper class, worker infrastructure, dedup system
provides:
  - LinkedInScraper class extending BaseScraper
  - LinkedIn Jobs integration in worker job loop
  - Rate limiting and retry patterns for external APIs
affects: [04-02, production-deployment]

# Tech tracking
tech-stack:
  added: [brightdata-sdk, tenacity]
  patterns: [async-polling-with-retry, rate-limited-scraping]

key-files:
  created:
    - worker/src/scrapers/linkedin.py
  modified:
    - worker/src/main.py
    - worker/src/config.py
    - worker/pyproject.toml

key-decisions:
  - "Use Bright Data Web Scraper API endpoint for LinkedIn Jobs"
  - "Random 2-5s delays between company requests for rate limiting"
  - "Exponential backoff retry (3 attempts) with tenacity"
  - "Graceful skip when BRIGHT_DATA_API_TOKEN not set"

patterns-established:
  - "Async polling pattern: trigger API, poll for results, handle async processing"
  - "Rate limiting pattern: random delays between requests to external APIs"

# Metrics
duration: 2min 51s
completed: 2026-01-30
---

# Phase 4 Plan 01: LinkedIn Jobs Scraper Summary

**LinkedIn Jobs scraper using Bright Data Web Scraper API with rate limiting, retry logic, and graceful degradation when credentials unavailable**

## Performance

- **Duration:** 2min 51s
- **Started:** 2026-01-30T16:30:42Z
- **Completed:** 2026-01-30T16:33:33Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- LinkedInScraper class extending BaseScraper with async scrape method
- Bright Data Web Scraper API integration for LinkedIn Jobs dataset
- Rate limiting (2-5s random delays) and retry logic (3 attempts, exponential backoff)
- Per-source signal tracking in worker logs
- Graceful skip when no Bright Data credentials configured

## Task Commits

Each task was committed atomically:

1. **Task 1: Create LinkedIn Jobs scraper with Bright Data** - `62d6cd0` (feat)
2. **Task 2: Integrate LinkedIn scraper into job loop** - `be82038` (feat)

## Files Created/Modified

- `worker/src/scrapers/linkedin.py` - LinkedIn Jobs scraper using Bright Data API (289 lines)
- `worker/src/main.py` - Added LinkedInScraper to scrapers list, linkedin_enabled logging
- `worker/src/config.py` - Added bright_data_api_token config option
- `worker/pyproject.toml` - Added brightdata-sdk and tenacity dependencies

## Decisions Made

| Decision | Rationale |
|----------|-----------|
| Use Bright Data Web Scraper API (not direct proxy) | Handles anti-bot, CAPTCHA, retries automatically; legal protection |
| Random 2-5s delays between requests | Prevents rate limiting without being predictable |
| Hardcode initial target companies | MVP approach; production would use user preferences |
| Track signals by source in logs | Debugging and monitoring per-scraper performance |

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation proceeded smoothly.

## User Setup Required

**External services require manual configuration.** The LinkedIn scraper requires:

1. **Bright Data API Token**
   - Source: Bright Data Dashboard -> Account -> API Token
   - Env var: `BRIGHT_DATA_API_TOKEN`

2. **Bright Data LinkedIn Dataset**
   - Location: Bright Data Dashboard -> Datasets -> LinkedIn Jobs
   - Dataset ID: `gd_l1viktl72bvl7bjuj0`

Without credentials, the scraper logs a warning and skips gracefully - other scrapers continue to function.

## Next Phase Readiness

- LinkedIn scraper ready for production deployment
- Worker can run with or without Bright Data credentials
- Next: Plan 02 notification preferences and email alerts

---
*Phase: 04-automation-hardening*
*Completed: 2026-01-30*
