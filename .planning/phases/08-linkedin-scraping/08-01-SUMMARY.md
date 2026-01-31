---
phase: 08-linkedin-scraping
plan: 01
subsystem: signal-ingestion
tags: [linkedin, web-scraping, bright-data, python, worker]
status: complete
completed: 2026-01-31

frontmatter:
  depends_on: [07-observability]
  provides: [linkedin-scraper, bright-data-integration]
  affects: [08-02-email-enrichment, future-signal-sources]

tech_stack:
  added:
    - Bright Data Web Scraper API (LinkedIn Jobs)
    - tenacity (retry with exponential backoff)
  patterns:
    - Async polling for scraper results via snapshot_id
    - Rate limiting with random 2-5s delays
    - Graceful degradation (no token = silent skip)

file_tracking:
  created:
    - worker/tests/test_linkedin.py (LinkedIn scraper unit tests)
  modified:
    - worker/src/scrapers/linkedin.py (verification + type fixes)
    - worker/src/config.py (BRIGHT_DATA_API_TOKEN configuration)
---

# Phase 8 Plan 1: Bright Data LinkedIn Integration Summary

**One-liner:** LinkedIn scraper with Bright Data Web Scraper API, async polling, and rate limiting implemented and tested.

## Execution Summary

Plan 08-01 executed to completion with 2 of 3 tasks completed. Task 3 (human verification checkpoint) was deferred by user.

**Duration:** Started 2026-01-31, completed same day
**Tasks:** 2/3 completed, 1/3 skipped (checkpoint deferred)

## Completed Tasks

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Verify LinkedIn scraper implementation | dd48345 | worker/src/scrapers/linkedin.py, worker/src/config.py |
| 2 | Add scraper unit test | 389a126 | worker/tests/test_linkedin.py |
| 3 | Environment configuration verification | SKIPPED | (User deferred manual credential setup) |

## What Was Built

### Task 1: Implementation Verification
- Confirmed `LinkedInScraper` correctly implements Bright Data Web Scraper API
  - Endpoint: `https://api.brightdata.com/datasets/v3/trigger`
  - Dataset ID: `gd_l1viktl72bvl7bjuj0` (LinkedIn Jobs)
  - Bearer token authorization via BRIGHT_DATA_API_TOKEN
  - Async polling via snapshot_id with 5-minute retries
- Verified signal parsing extracts all required fields:
  - `company_name` (from position.company or fallback)
  - `title` (job title)
  - `location` (job location)
  - `source_url` (LinkedIn job posting URL)
- Confirmed rate limiting: Random 2-5s delays between company requests
- Verified graceful degradation: Returns empty list if token not set, logs warning
- Fixed typing issues found during verification (mypy validation)

### Task 2: Unit Tests
- Created comprehensive test suite in `worker/tests/test_linkedin.py`
- Test coverage:
  - `test_parse_job_extracts_required_fields`: Validates signal field extraction from mock Bright Data response
  - `test_parse_job_filters_non_signal_titles`: Confirms non-signal job titles are filtered
  - `test_assess_priority_high_for_vp`: VP/Director titles marked as "high" priority
  - `test_assess_priority_medium_for_others`: Regular titles marked as "medium" priority
  - `test_scraper_disabled_without_token`: Scraper gracefully disabled when BRIGHT_DATA_API_TOKEN not set
- All tests pass: `pytest worker/tests/test_linkedin.py -v`

### Task 3: Skipped (Deferred)
- Human verification checkpoint was deferred by user
- Requires manual configuration: `BRIGHT_DATA_API_TOKEN` must be added to Railway worker environment
- Skipped to avoid blocking upstream work
- Will be completed when user configures Bright Data credentials

## How to Activate

When ready to use the LinkedIn scraper:

1. **Obtain API Token:**
   - Visit [Bright Data Dashboard](https://dashboard.brightdata.com)
   - Navigate to API Tokens section
   - Copy the Web Scraper API token

2. **Configure in Railway:**
   - Open Railway dashboard for the Axidex worker
   - Go to Variables tab
   - Add variable: `BRIGHT_DATA_API_TOKEN` = `{paste token from step 1}`
   - Redeploy worker

3. **Verify Activation:**
   - Check Railway logs for `linkedin_scraper_skipped` (if token missing) or `scrape_complete scraper=linkedin signal_count=N`
   - Signals from LinkedIn will appear in Supabase with `source_name = "LinkedIn"`

## Implementation Details

### LinkedInScraper Class
- **Location:** `worker/src/scrapers/linkedin.py`
- **Parent:** Extends `BaseScraper`
- **Key methods:**
  - `scrape(companies: List[str])` → Initiates Bright Data API call with company names
  - `_poll_for_results(snapshot_id)` → Async polling with exponential backoff (30s, 60s, 120s)
  - `_parse_job_to_signal(job_data)` → Extracts Signal from Bright Data response
  - `_assess_priority(title)` → Determines "high" (VP/Director) or "medium" priority

### Rate Limiting
```python
import random
import time
# Between each company request
delay = random.uniform(2, 5)  # 2-5 seconds
time.sleep(delay)
```

### Graceful Degradation
```python
if not self._enabled:
    log.warning("linkedin_scraper_skipped", reason="BRIGHT_DATA_API_TOKEN not configured")
    return []
```

## Deviations from Plan

### Auto-fixed Issues (Rule 1)
**Fixed typing issues in LinkedIn scraper**
- **Found during:** Task 1 verification
- **Issue:** Type hints were incomplete; mypy flagged missing type annotations on `Optional` fields
- **Fix:** Added proper type hints to all method parameters and return types
- **Files modified:** `worker/src/scrapers/linkedin.py`
- **Commit:** dd48345

## Dependencies & Integration

### Requires (to be configured by user)
- `BRIGHT_DATA_API_TOKEN` env var in Railway (manual setup not yet completed)

### Provides (ready for downstream work)
- LinkedIn scraper registered in `worker/src/main.py` (scrapers list)
- Signal parsing pipeline compatible with signal database schema

### No Breaking Changes
- Existing scrapers (GNews, Crunchbase) unaffected
- LinkedInScraper gracefully disables if credentials missing
- Tests validate isolated behavior (no real API calls)

## Next Steps

**Phase 8 Plan 2:** Email enrichment using extracted LinkedIn signals
**Phase 9:** Notification system integration

When BRIGHT_DATA_API_TOKEN is configured in Railway, this scraper will automatically:
1. Fetch LinkedIn job postings via Bright Data API
2. Parse job data into Signal objects
3. Store signals in Supabase with source_name="LinkedIn"
4. Trigger downstream email generation pipeline

## Testing Status

- Unit tests: ✓ All passing
- Type checking: ✓ mypy clean
- Integration: ⏸ Pending credential setup (deferred)
- Manual verification: ⏸ Deferred

---

**Plan Status:** COMPLETE (with Task 3 checkpoint deferred)
**Ready for:** Phase 8 Plan 2
