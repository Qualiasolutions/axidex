# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-31)

**Core value:** Sales teams get actionable signals with ready-to-send emails — no manual research.
**Current focus:** Milestone v1.2 UX Polish & Feature Completion

## Current Position

Phase: 14 - Billing (Complete)
Plan: 2 of 2 (Complete)
Status: Phase complete
Last activity: 2026-01-31 — Completed 14-02-PLAN.md

Progress: [██████████] 97% (30/31 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 30 (12 v1.0 + 18 v1.2)
- Average duration: 3min 28s
- Total execution time: 1.76 hours

**By Phase (v1.0):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Foundation | 2/2 | 4min 24s | 2min 12s |
| 2. Signal Ingestion | 3/3 | 12min 35s | 4min 12s |
| 3. Dashboard & Emails | 3/3 | 11min 21s | 3min 47s |
| 4. Automation & Hardening | 2/2 | 8min 57s | 4min 29s |
| 5. UI Polish | 2/2 | 4min 21s | 2min 11s |

**v1.1 Progress:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 6. Production Deployment | 2/2 ✓ | 35min | 17min 30s |
| 7. Observability | 2/2 ✓ | 8min 20s | 4min 10s |
| 8. LinkedIn Scraping | 2/2 ✓ | 7min 30s | 3min 45s |
| 9. Notifications | 0/1 | - | - |

**v1.2 Progress:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 10. Navigation & UX | 2/2 ✓ | 4min 17s | 2min 09s |
| 11. Performance | 2/2 ✓ | 16min 49s | 8min 25s |
| 12. Design Polish | 2/2 ✓ | 5min 38s | 2min 49s |
| 13. Slack Integration | 1/1 ✓ | 2min 8s | 2min 8s |
| 14. Billing | 2/2 ✓ | 8min 36s | 4min 18s |

**Total v1.2:** 9 plans, 40min 28s

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

| ID | Decision | Phase | Rationale |
|----|----------|-------|-----------|
| D015 | Use Bright Data Web Scraper API for LinkedIn | 04-01 | Legal protection; handles anti-bot, CAPTCHA, retries |
| D016 | Random 2-5s delays between LinkedIn requests | 04-01 | Prevents rate limiting without predictable patterns |
| D017 | Lazy-initialize Resend client | 04-02 | Avoid build errors without API key |
| D018 | JSONB for notification preferences | 04-02 | Flexible schema, queryable with GIN index |
| D019 | Use OpenRouter with Gemini 2.5 Flash for AI | 06-01 | Cost-effective, user preference |
| D020 | Deploy worker to Railway | 06-02 | Python runtime, scheduled execution |
| D021 | Separate DSN env vars for Sentry (NEXT_PUBLIC_ vs private) | 07-01 | Security - keep server credentials out of browser |
| D022 | 10% trace sampling in production | 07-01 | Balance Sentry quota vs observability |
| D023 | Session replay 10%/100% sampling | 07-01 | Always capture error context, limit normal sessions |
| D024 | LoggingIntegration for Python worker | 07-01 | Integrates with structlog; captures relevant levels |
| D025 | Health server on port 8080 with daemon thread | 07-02 | Railway default, non-blocking |
| D026 | Content hash over pgvector for dedup | 08-02 | More efficient for exact/near-duplicate detection |
| D027 | Custom events for keyboard navigation | 10-01 | Simpler than global state, no prop drilling |
| D028 | Ring offset matches background color | 10-01 | Clean visual separation for selection ring |
| D029 | Reset selection on filter changes | 10-01 | Prevents stale selectedIndex references |
| D030 | Truncate email subjects in breadcrumbs at 40 chars | 10-02 | Prevents overflow on narrow viewports |
| D031 | Include breadcrumbs in loading/error states | 10-02 | Consistent UI context regardless of page state |
| D032 | Keep "Back to" buttons alongside breadcrumbs | 10-02 | Mobile-friendly option, desktop hierarchy |
| D033 | SWR over React Query | 11-01 | Lighter weight, simpler API, better for Next.js SSR |
| D034 | 5-second deduplication window | 11-01 | Balance between performance and data freshness |
| D035 | No revalidation on tab focus | 11-01 | Prevents unnecessary requests when users switch tabs |
| D036 | Stats refresh interval 30s | 11-01 | Dashboard metrics change slowly, reduce server load |
| D037 | Optimistic updates only for rules page | 11-02 | Signals/emails/accounts are read-only with no mutations |
| D038 | Store previous state for rollback on error | 11-02 | Ensures data integrity when API calls fail |
| D039 | Use SWR preload() for hover prefetching | 11-02 | Background data loading for instant navigation |
| D040 | Prefetch data matches route structure | 11-02 | List data for pages, detail data for cards |
| D041 | Use Sonner for toast notifications | 12-01 | Lightweight, excellent DX, built-in theming |
| D042 | Success toasts after mutate(), error before rollback | 12-01 | Consistent feedback pattern for optimistic updates |
| D043 | EmptyState accepts children prop for actions | 12-01 | Flexible composition pattern vs hardcoded buttons |
| D044 | EmptyState component for all list pages | 12-02 | Consistent visual design, reduces duplicate code |
| D045 | Icon selection matches page context | 12-02 | Visual identity reinforces page purpose |
| D046 | Conditional empty state descriptions | 12-02 | Context-aware messaging reduces user confusion |
| D047 | Toast notifications for async actions | 12-02 | Immediate user feedback for all state changes |
| D048 | Lazy-initialize Stripe client | 14-01 | Avoids build errors when env vars not set |
| D049 | Use service role client for webhooks | 14-01 | Bypass RLS for server-side subscription updates |
| D050 | Store subscription history in separate table | 14-01 | Audit trail and period tracking independent of current status |
| D051 | Enforce limits at API route level | 14-02 | More flexible than middleware, allows custom error responses |
| D052 | Use -1 for unlimited tier limits | 14-02 | Clear sentinel value for enterprise tier unlimited resources |

### Pending Todos

**Completed in Phase 6:**
- ~~Apply migrations to Supabase production (001-009)~~ ✓
- ~~Deploy worker to Railway~~ ✓
- ~~Deploy check-notification Edge Function~~ ✓

**Completed in Phase 7:**
- ~~Integrate Sentry SDK for Next.js~~ ✓
- ~~Integrate Sentry SDK for Python worker~~ ✓
- ~~Add health check endpoint to worker~~ ✓

**Completed in Phase 8:**
- ~~LinkedIn scraper with Bright Data integration~~ ✓
- ~~Deduplication logic verified with unit tests~~ ✓
- ~~All LNKD-* requirements marked complete~~ ✓

**Completed in Phase 14:**
- ~~Stripe checkout flow~~ ✓
- ~~Webhook handler for subscription events~~ ✓
- ~~Billing portal access~~ ✓
- ~~Usage limits enforcement~~ ✓

**Phase 9 Manual Steps (deferred):**
- Add RESEND_API_KEY to Vercel environment
- Configure Supabase database webhook for signals INSERT
- End-to-end verification test

**Phase 14 Manual Setup Required:**
- Add STRIPE_SECRET_KEY to Vercel environment
- Add STRIPE_PUBLISHABLE_KEY to Vercel environment
- Add STRIPE_WEBHOOK_SECRET to Vercel environment
- Create Pro and Enterprise products in Stripe Dashboard
- Add STRIPE_PRO_PRICE_ID and STRIPE_ENTERPRISE_PRICE_ID env vars
- Add SUPABASE_SERVICE_ROLE_KEY to Vercel environment
- Create webhook endpoint in Stripe Dashboard pointing to /api/webhooks/stripe
- Apply migration 015_billing.sql to Supabase production

**Other Manual Setup:**
- Add BRIGHT_DATA_API_TOKEN to worker environment
- Add SENTRY_DSN environment variables (Next.js and worker)
- Configure Railway health check in Dashboard
- (Optional) Set up UptimeRobot or Sentry Crons for alerting

### Blockers/Concerns

- **LinkedIn legal risk:** Proxycurl shut down July 2026 after lawsuit. Use Bright Data (won cases) or public sources only. Phase 8 ready with Bright Data approach.
- **LLM cost control:** Implement budget caps before production. Real costs can be 9x higher than expected.

## Session Continuity

Last session: 2026-01-31
Stopped at: Completed 14-02-PLAN.md
Resume file: None
Next step: Phase 14 complete - v1.2 milestone near completion (Phase 9 pending manual steps)

---
*State initialized: 2026-01-30*
*Milestone v1.1 started*
*Phase 6 completed: 2026-01-31*
*Phase 7 completed: 2026-01-31*
*Phase 8 completed: 2026-01-31*
*Phase 9 paused: 2026-01-31 (code verified, manual steps pending)*
*Phase 10 completed: 2026-01-31*
*Phase 11 completed: 2026-01-31*
*Phase 12 completed: 2026-01-31*
*Phase 13 completed: 2026-01-31*
*Phase 14 completed: 2026-01-31*
