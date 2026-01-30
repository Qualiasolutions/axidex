# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-30)

**Core value:** Sales teams get actionable signals with ready-to-send emails — no manual research.
**Current focus:** Phase 2 Signal Ingestion complete - Ready for Phase 3 Dashboard & Emails

## Current Position

Phase: 2 of 4 (Signal Ingestion)
Plan: 3 of 3 in current phase (COMPLETE)
Status: Phase complete
Last activity: 2026-01-30 — Completed 02-03-PLAN.md (AI Pipeline)

Progress: [█████░░░░░] 50%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 3min 4s
- Total execution time: 0.26 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 2/2 | 4min 24s | 2min 12s |
| 2. Signal Ingestion | 3/3 | 12min 35s | 4min 12s |
| 3. Dashboard & Emails | 0/3 | - | - |
| 4. Automation & Hardening | 0/2 | - | - |

**Recent Trend:**
- Last 5 plans: 01-02 (180s), 02-01 (246s), 02-02 (329s), 02-03 (180s)
- Trend: Stabilizing around 3-4 min per plan

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
| D007 | Hash + prefix dedup before vector | 02-02 | Catches 80%+ duplicates without API costs |
| D008 | 384-dim embeddings for pgvector | 02-02 | Matches all-MiniLM-L6-v2 model |
| D009 | gpt-4o-mini default for AI enrichment | 02-03 | Cost efficiency, configurable to gpt-4o for quality |
| D010 | 0.7 confidence threshold | 02-03 | Above 0.7 uses AI classification, below uses rule-based |
| D011 | JSON mode for entity extraction | 02-03 | Reliable output parsing from GPT-4o |

### Pending Todos

- Apply migrations to Supabase project (001, 002, 003) via dashboard or `supabase db push`
- Configure Supabase Auth (enable email provider, set site URL)
- Deploy worker to Railway (requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- Optional: Configure Bright Data proxy for job board scraping
- Add OPENAI_API_KEY to worker environment for AI enrichment

### Blockers/Concerns

- **LinkedIn legal risk:** Proxycurl shut down July 2026 after lawsuit. Phase 4 LinkedIn scraping needs legal review before launch. Use Bright Data (won cases) or public sources only.
- **LLM cost control:** Implement budget caps before production. Real costs can be 9x higher than expected.

## Session Continuity

Last session: 2026-01-30 15:21 UTC
Stopped at: Completed 02-03-PLAN.md (AI Pipeline) - Phase 2 complete
Resume file: None

---
*State initialized: 2026-01-30*
*Next: Phase 3 - Dashboard & Emails*
