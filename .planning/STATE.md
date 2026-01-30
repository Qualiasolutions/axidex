# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-30)

**Core value:** Sales teams get actionable signals with ready-to-send emails — no manual research.
**Current focus:** Phase 2 Signal Ingestion - Python worker with TechCrunch scraper

## Current Position

Phase: 2 of 4 (Signal Ingestion)
Plan: 1 of 3 in current phase
Status: In progress
Last activity: 2026-01-30 — Completed 02-01-PLAN.md (Python Worker Infrastructure)

Progress: [███░░░░░░░] 30%

## Performance Metrics

**Velocity:**
- Total plans completed: 3
- Average duration: 2min 50s
- Total execution time: 0.14 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 2/2 | 4min 24s | 2min 12s |
| 2. Signal Ingestion | 1/3 | 4min 6s | 4min 6s |
| 3. Dashboard & Emails | 0/3 | - | - |
| 4. Automation & Hardening | 0/2 | - | - |

**Recent Trend:**
- Last 5 plans: 01-01 (84s), 01-02 (180s), 02-01 (246s)
- Trend: Slightly increasing (more complex plans)

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

| ID | Decision | Phase | Rationale |
|----|----------|-------|-----------|
| D001 | Use TEXT with CHECK constraints instead of ENUM types | 01-01 | Easier to modify without migration |
| D002 | Suspense boundary for useSearchParams | 01-02 | Required by Next.js 16 for static generation |
| D003 | Session refresh on every request via middleware | 01-02 | Ensures sessions persist across browser restarts |
| D004 | Lazy-load settings via get_settings() | 02-01 | Allow imports without env vars for testing/IDE |
| D005 | selectolax for RSS/HTML parsing | 02-01 | Faster than BeautifulSoup, sufficient for feeds |
| D006 | Rule-based signal classification | 02-01 | Keyword matching faster/cheaper than LLM |

### Pending Todos

- Apply migrations to Supabase project (`supabase db push` or dashboard)
- Configure Supabase Auth (enable email provider, set site URL)
- Deploy worker to Railway (requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

### Blockers/Concerns

- **LinkedIn legal risk:** Proxycurl shut down July 2026 after lawsuit. Phase 4 LinkedIn scraping needs legal review before launch. Use Bright Data (won cases) or public sources only.
- **LLM cost control:** Implement budget caps before production. Real costs can be 9x higher than expected.

## Session Continuity

Last session: 2026-01-30 15:12 UTC
Stopped at: Completed 02-01-PLAN.md (Python Worker Infrastructure)
Resume file: None

---
*State initialized: 2026-01-30*
*Next: 02-02-PLAN.md (Job Board Scraper)*
