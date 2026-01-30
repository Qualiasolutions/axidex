# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-30)

**Core value:** Sales teams get actionable signals with ready-to-send emails — no manual research.
**Current focus:** Milestone v1.0 Complete

## Current Position

Phase: 5 of 5 (UI Polish) ✓
Plan: 2 of 2 in current phase
Status: Milestone complete
Last activity: 2026-01-30 — Phase 5 verified and complete

Progress: [██████████] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 12
- Average duration: 3min 0s
- Total execution time: 0.62 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 2/2 | 4min 24s | 2min 12s |
| 2. Signal Ingestion | 3/3 | 12min 35s | 4min 12s |
| 3. Dashboard & Emails | 3/3 | 11min 21s | 3min 47s |
| 4. Automation & Hardening | 2/2 | 8min 57s | 4min 29s |
| 5. UI Polish | 2/2 | 4min 21s | 2min 11s |

**Recent Trend:**
- Last 5 plans: 04-01 (171s), 04-02 (364s), 05-01 (125s), 05-02 (136s)
- Trend: Consistently fast - Phase 5 averaging 2min 11s

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
| D012 | Client-side filtering with URL state | 03-01 | Enables filter sharing, browser back/forward, refresh persistence |
| D013 | Calculate stats in application layer vs RPC | 03-03 | Simpler for current scale, easier to modify |
| D014 | Supabase Realtime for live signal updates | 03-03 | More efficient than polling, instant updates |
| D015 | Use Bright Data Web Scraper API for LinkedIn | 04-01 | Legal protection; handles anti-bot, CAPTCHA, retries |
| D016 | Random 2-5s delays between LinkedIn requests | 04-01 | Prevents rate limiting without predictable patterns |
| D017 | Lazy-initialize Resend client | 04-02 | Avoid build errors without API key |
| D018 | JSONB for notification preferences | 04-02 | Flexible schema, queryable with GIN index |
| D019 | 20 items per page for pagination | 05-01 | Balances performance with user convenience |
| D020 | Page 1 has no URL param | 05-01 | Cleaner URLs (no ?page=1) |
| D021 | Auto-reset pagination on filter change | 05-01 | Prevents confusion when results don't fill current page |
| D022 | 300ms debounce delay for search input | 05-02 | Balances responsiveness with API efficiency |
| D023 | Multi-select priority filters | 05-02 | Users can combine multiple priority levels (e.g., high AND medium) |

### Pending Todos

- Apply migrations to Supabase project (001, 002, 003, 004) via dashboard or `supabase db push`
- Configure Supabase Auth (enable email provider, set site URL)
- Deploy worker to Railway (requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- Add OPENAI_API_KEY to worker environment for AI enrichment
- **Add ANTHROPIC_API_KEY to .env.local for email generation** (required for 03-02)
- **Add BRIGHT_DATA_API_TOKEN to worker environment for LinkedIn scraping** (required for 04-01)
- **Add RESEND_API_KEY to Vercel environment for email notifications** (required for 04-02)
- **Configure Supabase database webhook for signals INSERT** (required for 04-02)
- **Deploy check-notification Edge Function** (required for 04-02)

### Blockers/Concerns

- **LinkedIn legal risk:** Proxycurl shut down July 2026 after lawsuit. Phase 4 LinkedIn scraping needs legal review before launch. Use Bright Data (won cases) or public sources only.
- **LLM cost control:** Implement budget caps before production. Real costs can be 9x higher than expected.

## Session Continuity

Last session: 2026-01-30 17:35 UTC
Stopped at: Milestone v1.0 complete — all 5 phases verified
Resume file: None

---
*State initialized: 2026-01-30*
*Phase 5 added for UI polish - gap closure from v1.0 audit*
