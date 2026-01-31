# Roadmap: Axidex

## Overview

15 phases | 69 requirements total | v1.2: 6 phases, 20 requirements

Milestone v1.2 focuses on UX polish and feature completion for launch readiness. Improves navigation, performance, and design while adding Slack notifications and Stripe billing.

## Phases

**Phase Numbering:**
- Integer phases (1-5): Milestone v1.0 (Complete)
- Integer phases (6-9): Milestone v1.1 (Current)

### Milestone v1.0 (Complete)
- [x] **Phase 1: Foundation** - Database schema, RLS policies, and authentication
- [x] **Phase 2: Signal Ingestion** - Scrapers for news/jobs + AI classification
- [x] **Phase 3: Dashboard & Emails** - Live signal feed with AI email generation
- [x] **Phase 4: Automation & Hardening** - LinkedIn scraping, scheduling, notifications
- [x] **Phase 5: UI Polish** - Pagination, search, priority filters for production-ready UX

### Milestone v1.1 (Complete)
- [x] **Phase 6: Production Deployment** - Migrations, worker, Edge Function, environment variables
- [x] **Phase 7: Observability** - Sentry integration, health checks, alerting
- [x] **Phase 8: LinkedIn Scraping** - Bright Data integration for LinkedIn Jobs
- [x] **Phase 9: Notifications** - Preferences UI and email alerts (code complete)

### Milestone v1.2 (Current)
- [x] **Phase 10: Navigation & UX** - Icons, mobile nav, keyboard shortcuts, breadcrumbs
- [x] **Phase 11: Performance** - Optimistic UI, caching, prefetching, skeletons
- [x] **Phase 12: Design Polish** - Visual hierarchy, spacing, toasts, empty states
- [ ] **Phase 13: Slack Integration** - OAuth, channel selection, auto-posting
- [ ] **Phase 14: Billing** - Stripe checkout, portal, webhooks, usage limits
- [ ] **Phase 15: Onboarding** - Welcome screen, guided tour, setup wizard

## Phase Details

### Phase 6: Production Deployment
**Goal:** Application runs in production with all infrastructure deployed and verified
**Depends on:** Phase 5 (v1.0 complete)
**Requirements:** DEPL-01, DEPL-02, DEPL-03, DEPL-04, DEPL-05, DEPL-06
**Plans:** 2 plans

**Success Criteria** (what must be TRUE):
1. All 9 database migrations applied to production Supabase project
2. Worker running on Railway, processing signals on schedule
3. Edge Function deployed and triggering on signals INSERT
4. RLS verified: users cannot access other users' data

Plans:
- [ ] 06-01-PLAN.md — Database migrations and Vercel environment setup
- [ ] 06-02-PLAN.md — Railway worker deployment and Supabase webhook/Edge Function

### Phase 7: Observability
**Goal:** Errors are captured, worker health is monitored, and failures trigger alerts
**Depends on:** Phase 6 (production must be running)
**Requirements:** OBSV-01, OBSV-02, OBSV-03, OBSV-04
**Plans:** 2 plans

**Success Criteria** (what must be TRUE):
1. Frontend errors appear in Sentry dashboard with stack traces
2. Worker exceptions appear in Sentry with context
3. Health check endpoint returns 200 OK when worker is healthy
4. Alert fires when worker health check fails for 5+ minutes

Plans:
- [x] 07-01-PLAN.md — Sentry SDK integration (Next.js + Python worker)
- [x] 07-02-PLAN.md — Worker health endpoint and failure alerting

### Phase 8: LinkedIn Scraping
**Goal:** LinkedIn job signals flow into the database via Bright Data
**Depends on:** Phase 6 (worker must be deployed)
**Requirements:** LNKD-01, LNKD-02, LNKD-03, LNKD-04, LNKD-05, LNKD-06
**Plans:** 2 plans

**Success Criteria** (what must be TRUE):
1. LinkedIn Jobs scraper fetches data from Bright Data API
2. Each signal includes company, title, location, and source URL
3. Duplicate LinkedIn signals detected and not stored
4. Scraper runs on schedule without rate limiting

Plans:
- [x] 08-01-PLAN.md — Verify Bright Data integration and add unit tests
- [x] 08-02-PLAN.md — Verify deduplication, scheduler, and update requirements

### Phase 9: Notifications
**Goal:** Users receive email alerts for high-priority signals matching their criteria
**Depends on:** Phase 6 (Edge Function must be deployed)
**Requirements:** NOTF-01, NOTF-02
**Plans:** 1 plan

**Success Criteria** (what must be TRUE):
1. User can access notification preferences in settings page
2. User can toggle email notifications on/off
3. User can set priority threshold for notifications (e.g., "high only")
4. User receives email within 5 minutes of matching signal insertion

Plans:
- [ ] 09-01-PLAN.md — Verify notification system and complete manual configuration

## Phase Details

### Phase 10: Navigation & UX
**Goal:** Clear, fast navigation with icons, mobile support, and keyboard shortcuts
**Depends on:** None
**Requirements:** NAV-01, NAV-02, NAV-03, NAV-04
**Plans:** 2 plans

**Success Criteria:**
1. Sidebar shows recognizable icons for each section (already complete)
2. Mobile users can access all navigation via drawer (already complete)
3. Power users can navigate with keyboard (g+s, g+e, j/k, ? help)
4. Detail pages show breadcrumb trail

**Note:** NAV-01 (icons) and NAV-02 (mobile nav) were already implemented. This phase adds keyboard shortcuts help modal, j/k list navigation, and breadcrumbs to remaining detail pages.

Plans:
- [ ] 10-01-PLAN.md — Keyboard shortcuts help modal and j/k list navigation
- [ ] 10-02-PLAN.md — Add breadcrumbs to Rules, Accounts, and Emails detail pages

### Phase 11: Performance
**Goal:** Snappy, responsive UI with instant feedback
**Depends on:** Phase 10 (navigation must be solid)
**Requirements:** PERF-01, PERF-02, PERF-03, PERF-04
**Plans:** 2 plans

**Success Criteria:**
1. User actions update UI immediately, sync in background
2. Repeated visits load from cache
3. All pages have consistent skeleton states
4. Links prefetch on hover

Plans:
- [x] 11-01-PLAN.md — SWR caching and skeleton loading components
- [x] 11-02-PLAN.md — Optimistic updates and prefetch on hover

### Phase 12: Design Polish
**Goal:** Professional, cohesive visual design across all pages
**Depends on:** Phase 10, 11
**Requirements:** UI-01, UI-02, UI-03, UI-04
**Plans:** 2 plans

**Success Criteria:**
1. Consistent 4px/8px spacing grid
2. Clear visual hierarchy in all lists and cards
3. Empty states guide users to next action
4. Toast notifications for all user feedback

Plans:
- [x] 12-01-PLAN.md — Toast notifications and reusable EmptyState component
- [x] 12-02-PLAN.md — Apply EmptyState across pages and add remaining toasts

### Phase 13: Slack Integration
**Goal:** Users receive signal notifications in Slack
**Depends on:** None (parallel track)
**Requirements:** SLCK-01, SLCK-02, SLCK-03, SLCK-04
**Plans:** 1 plan

**Success Criteria:**
1. User can connect Slack workspace (already complete)
2. User can choose notification channel (already complete)
3. High-priority signals appear in Slack within 5 minutes
4. Slack messages have clickable links to dashboard (already complete)

**Note:** SLCK-01, SLCK-02, SLCK-04 were already implemented in prior work. This phase completes SLCK-03 by adding auto-posting to the Edge Function.

Plans:
- [ ] 13-01-PLAN.md — Add Slack auto-posting to Edge Function

### Phase 14: Billing
**Goal:** Users can subscribe and manage their plan
**Depends on:** None (parallel track)
**Requirements:** BILL-01, BILL-02, BILL-03, BILL-04
**Plans:** 2 plans

**Success Criteria:**
1. User can upgrade via Stripe checkout
2. User can manage subscription via billing portal
3. Subscription changes reflect in app immediately
4. Free tier has enforced limits

### Phase 15: Onboarding
**Goal:** New users understand the product and get value quickly
**Depends on:** Phase 10, 12 (UX must be polished)
**Requirements:** ONBR-01, ONBR-02, ONBR-03
**Plans:** 1 plan

**Success Criteria:**
1. New users see welcome screen after signup
2. Guided tour highlights key features
3. Setup wizard configures initial preferences

## Progress

**Execution Order:** Phases 10-12 (UX track), Phases 13-14 (feature track - can parallel), Phase 15 (after UX)

| Phase | Plans Complete | Status |
|-------|----------------|--------|
| 6. Production Deployment | 2/2 | Complete |
| 7. Observability | 2/2 | Complete |
| 8. LinkedIn Scraping | 2/2 | Complete |
| 9. Notifications | 1/1 | Complete |
| 10. Navigation & UX | 2/2 | Complete |
| 11. Performance | 2/2 | Complete |
| 12. Design Polish | 2/2 | Complete |
| 13. Slack Integration | 0/1 | Pending |
| 14. Billing | 0/2 | Pending |
| 15. Onboarding | 0/1 | Pending |

---
*Roadmap created: 2026-01-30*
*Milestone v1.2 added: 2026-01-31*
*Depth: quick*
*Coverage: 20/20 v1.2 requirements mapped*
