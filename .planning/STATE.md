# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-30)

**Core value:** Sales teams get actionable signals with ready-to-send emails — no manual research.
**Current focus:** Phase 4 Automation & Hardening - LinkedIn scraper complete

## Current Position

Phase: 4 of 4 (Automation & Hardening)
Plan: 1 of 2 in current phase
Status: In progress
Last activity: 2026-01-30 — Completed 04-01-PLAN.md (LinkedIn Scraper)

Progress: [█████████░] 90%

## Performance Metrics

**Velocity:**
- Total plans completed: 9
- Average duration: 3min 17s
- Total execution time: 0.49 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 2/2 | 4min 24s | 2min 12s |
| 2. Signal Ingestion | 3/3 | 12min 35s | 4min 12s |
| 3. Dashboard & Emails | 3/3 | 11min 21s | 3min 47s |
| 4. Automation & Hardening | 1/2 | 2min 51s | 2min 51s |

**Recent Trend:**
- Last 5 plans: 03-01 (202s), 03-02 (287s), 03-03 (192s), 04-01 (171s)
- Trend: Steady - averaging 3 min per plan

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

### Pending Todos

- Apply migrations to Supabase project (001, 002, 003) via dashboard or `supabase db push`
- Configure Supabase Auth (enable email provider, set site URL)
- Deploy worker to Railway (requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
- Add OPENAI_API_KEY to worker environment for AI enrichment
- **Add ANTHROPIC_API_KEY to .env.local for email generation** (required for 03-02)
- **Add BRIGHT_DATA_API_TOKEN to worker environment for LinkedIn scraping** (required for 04-01)

### Blockers/Concerns

- **LinkedIn legal risk:** Proxycurl shut down July 2026 after lawsuit. Phase 4 LinkedIn scraping needs legal review before launch. Use Bright Data (won cases) or public sources only.
- **LLM cost control:** Implement budget caps before production. Real costs can be 9x higher than expected.

## Session Continuity

Last session: 2026-01-30 16:33 UTC
Stopped at: Completed 04-01-PLAN.md (LinkedIn Scraper)
Resume file: None

---
*State initialized: 2026-01-30*
*Next: 04-02 Notification Preferences & Email Alerts*
