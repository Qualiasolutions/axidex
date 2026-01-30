---
phase: 02-signal-ingestion
plan: 01
subsystem: infra
tags: [python, httpx, selectolax, supabase, schedule, railway, docker, rss, scraping]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: signals table schema in Supabase
provides:
  - Python worker project structure
  - TechCrunch RSS scraper
  - Supabase client wrapper for Python
  - Railway deployment configuration
affects: [02-02, 02-03, signal-ingestion-plans]

# Tech tracking
tech-stack:
  added: [httpx, selectolax, supabase-py, schedule, pydantic-settings, structlog]
  patterns: [lazy-settings-loading, base-scraper-interface, rule-based-classification]

key-files:
  created:
    - worker/pyproject.toml
    - worker/src/main.py
    - worker/src/config.py
    - worker/src/models.py
    - worker/src/db/supabase.py
    - worker/src/scrapers/base.py
    - worker/src/scrapers/news.py
    - worker/Dockerfile
    - worker/railway.toml
  modified: []

key-decisions:
  - "Lazy-load settings via get_settings() to allow imports without env vars"
  - "Use selectolax for RSS/HTML parsing (faster than BeautifulSoup)"
  - "Rule-based signal classification with keyword matching"
  - "Schedule library for simple interval-based cron (not APScheduler)"

patterns-established:
  - "BaseScraper: Abstract class all scrapers extend with async scrape() method"
  - "get_settings(): Lazy singleton pattern for Pydantic settings"
  - "signal_exists(): Dedup by source_url before insert"

# Metrics
duration: 4min 6s
completed: 2026-01-30
---

# Phase 2 Plan 1: Python Worker Infrastructure Summary

**Python worker with TechCrunch RSS scraper using httpx/selectolax, deployable to Railway with schedule-based job loop**

## Performance

- **Duration:** 4min 6s
- **Started:** 2026-01-30T15:08:39Z
- **Completed:** 2026-01-30T15:12:45Z
- **Tasks:** 3
- **Files created:** 12

## Accomplishments
- Complete Python worker project with modern pyproject.toml packaging
- TechCrunch scraper parsing RSS feeds for funding/startup signals
- Rule-based classification (funding, hiring, expansion, partnership, product_launch, leadership_change)
- Supabase client wrapper with insert_signal() and signal_exists() dedup
- Dockerfile and railway.toml ready for Railway deployment

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Python project structure with dependencies** - `4230eac` (feat)
2. **Task 2: Create Supabase client wrapper and base scraper** - `d70f809` (feat)
3. **Task 3: Create TechCrunch news scraper and main entry point** - `f333002` (feat)

## Files Created

- `worker/pyproject.toml` - Python project config with dependencies (httpx, selectolax, supabase, schedule, pydantic-settings, structlog)
- `worker/src/__init__.py` - Package marker
- `worker/src/config.py` - Pydantic settings with lazy-loading via get_settings()
- `worker/src/models.py` - Signal Pydantic model matching database schema
- `worker/src/db/__init__.py` - Database package marker
- `worker/src/db/supabase.py` - Supabase client wrapper (insert_signal, signal_exists)
- `worker/src/scrapers/__init__.py` - Scrapers package marker
- `worker/src/scrapers/base.py` - BaseScraper abstract class
- `worker/src/scrapers/news.py` - TechCrunchScraper with RSS parsing
- `worker/src/main.py` - Entry point with schedule-based job loop
- `worker/Dockerfile` - Python 3.11 slim container
- `worker/railway.toml` - Railway deployment config with auto-restart
- `worker/.env.example` - Environment variable documentation
- `worker/.gitignore` - Python artifact ignores

## Decisions Made

1. **Lazy-load settings** - Settings instantiation moved to get_settings() function to allow module imports without environment variables being set. Essential for testing and IDE support.

2. **selectolax over BeautifulSoup** - Faster HTML/XML parsing, sufficient for RSS feed structure.

3. **Rule-based classification** - Keyword matching for signal types rather than LLM calls. Faster, cheaper, good enough for news headlines.

4. **schedule library** - Simple interval scheduling vs APScheduler. Lighter weight for single-purpose worker.

5. **Bright Data proxy support (added)** - Config extended with optional proxy credentials for future job board scraping.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Settings instantiation at import time**
- **Found during:** Task 3 (verifying imports)
- **Issue:** `settings = Settings()` at module level caused ValidationError when importing without env vars
- **Fix:** Changed to `get_settings()` function with @lru_cache for lazy singleton
- **Files modified:** worker/src/config.py, worker/src/db/supabase.py, worker/src/main.py
- **Verification:** `python -c "from src.scrapers.news import TechCrunchScraper"` succeeds
- **Committed in:** f333002 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (blocking issue)
**Impact on plan:** Essential fix for module imports. No scope creep.

## Issues Encountered

- System Python 3.14 requires venv (externally-managed-environment). Created worker/.venv for dependency installation and testing.

## User Setup Required

**External services require manual configuration.** For Railway deployment:

1. **Railway Project:**
   - Create new project: Railway Dashboard -> New Project -> Empty Project
   - Link to this repo or deploy from Dockerfile

2. **Environment Variables (Railway):**
   - `SUPABASE_URL` - From Supabase Dashboard -> Settings -> API -> Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - From Supabase Dashboard -> Settings -> API -> service_role key (secret)
   - `SCRAPE_INTERVAL_MINUTES` - Default 30
   - `LOG_LEVEL` - Default INFO

3. **Optional (for future job board scraping):**
   - `BRIGHT_DATA_USERNAME` - Bright Data proxy username
   - `BRIGHT_DATA_PASSWORD` - Bright Data proxy password

## Next Phase Readiness

- Worker infrastructure complete, ready for additional scrapers
- BaseScraper pattern established for Plan 02-02 (job board scraper)
- Supabase client wrapper reusable across all scrapers
- No blockers for next plan

---
*Phase: 02-signal-ingestion*
*Plan: 01*
*Completed: 2026-01-30*
