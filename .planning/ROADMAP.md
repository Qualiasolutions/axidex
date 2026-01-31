# Roadmap: Axidex

## Overview

9 phases | 49 requirements total | v1.1: 4 phases, 18 requirements

Milestone v1.1 takes Axidex from dev environment to production. Deploy infrastructure (migrations, worker, functions), add observability for reliability, complete LinkedIn scraping with Bright Data, and finalize notification system.

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

### Milestone v1.1 (Current)
- [x] **Phase 6: Production Deployment** - Migrations, worker, Edge Function, environment variables
- [x] **Phase 7: Observability** - Sentry integration, health checks, alerting
- [x] **Phase 8: LinkedIn Scraping** - Bright Data integration for LinkedIn Jobs
- [ ] **Phase 9: Notifications** - Preferences UI and email alerts

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

## Progress

**Execution Order:** Phases execute in numeric order: 6 -> 7 -> 8 -> 9

| Phase | Plans Complete | Status |
|-------|----------------|--------|
| 6. Production Deployment | 2/2 | Complete |
| 7. Observability | 2/2 | Complete |
| 8. LinkedIn Scraping | 2/2 | Complete |
| 9. Notifications | 0/1 | Pending |

---
*Roadmap created: 2026-01-30*
*Milestone: v1.1 Production Launch + LinkedIn*
*Depth: quick (4 phases)*
*Coverage: 18/18 v1.1 requirements mapped*
