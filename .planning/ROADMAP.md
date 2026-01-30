# Roadmap: Axidex

## Overview

5 phases | 31 requirements | 3 weeks estimated

Axidex transforms from a shell with empty states into a full signal intelligence platform. We build foundation first (database + auth), then scrapers with AI classification, then the dashboard with email generation, automation with LinkedIn, and finally UI polish to complete the experience.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (e.g., 2.1): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Database schema, RLS policies, and authentication
- [x] **Phase 2: Signal Ingestion** - Scrapers for news/jobs + AI classification
- [x] **Phase 3: Dashboard & Emails** - Live signal feed with AI email generation
- [x] **Phase 4: Automation & Hardening** - LinkedIn scraping, scheduling, notifications
- [ ] **Phase 5: UI Polish** - Pagination, search, priority filters for production-ready UX

## Phase Details

### Phase 1: Foundation
**Goal:** Users can create accounts and the database is ready to receive signals
**Depends on:** Nothing (first phase)
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, DATA-01, DATA-02, DATA-03, DATA-04
**Plans:** 2 plans (Wave 1: parallel)

**Success Criteria** (what must be TRUE):
1. User can sign up with email/password and land on dashboard
2. User can log in, close browser, return next day still logged in
3. User can log out from any page in the dashboard
4. User can request password reset and receive email with working link
5. Database tables exist with proper RLS (users see only their own data)

Plans:
- [x] 01-01-PLAN.md — Database schema (profiles, signals, emails) and RLS policies
- [x] 01-02-PLAN.md — Supabase Auth integration (login, signup, logout, password reset)

### Phase 2: Signal Ingestion
**Goal:** Signals flow automatically from news/job sources into the database, classified and scored
**Depends on:** Phase 1 (needs database tables)
**Requirements:** SCRP-01, SCRP-02, SCRP-03, SCRP-05, SCRP-06, SCRP-07, AI-01, AI-02
**Plans:** 3 plans (Wave 1: 02-01, 02-02 parallel | Wave 2: 02-03)

**Success Criteria** (what must be TRUE):
1. Python worker on Railway scrapes TechCrunch and stores raw data
2. Python worker scrapes company career pages and press releases
3. Python worker scrapes Indeed/Glassdoor job postings
4. Duplicate signals are detected and not stored twice
5. Each signal has a type (hiring/funding/expansion) and priority score

Plans:
- [x] 02-01-PLAN.md — Python worker setup + TechCrunch news scraper
- [x] 02-02-PLAN.md — Job board and company website scrapers with deduplication
- [x] 02-03-PLAN.md — AI entity extraction and signal classification

### Phase 3: Dashboard & Emails
**Goal:** Users see live signals and can generate personalized outreach emails
**Depends on:** Phase 2 (needs signals in database)
**Requirements:** DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, DASH-08, DASH-09, AI-03, AI-04, AI-05
**Plans:** 3 plans (Wave 1: 03-01 | Wave 2: 03-02, 03-03 parallel)

**Success Criteria** (what must be TRUE):
1. Dashboard shows real signals from database (not empty states)
2. User can filter signals by type, date range, and priority
3. User can click any signal to view full details and context
4. User can generate a personalized email for any signal with one click
5. User can copy generated email to clipboard
6. Dashboard stats show accurate counts (total, by type, by priority)
7. New signals appear in dashboard without page refresh (real-time)

Plans:
- [x] 03-01-PLAN.md — Signals API, list page with filters (type, priority, date)
- [x] 03-02-PLAN.md — Signal detail view with Claude-powered email generation
- [x] 03-03-PLAN.md — Dashboard stats and Supabase realtime updates

### Phase 4: Automation & Hardening
**Goal:** LinkedIn signals flow in, notifications alert users to high-priority signals
**Depends on:** Phase 3 (core flow must work first)
**Requirements:** SCRP-04, NOTF-01, NOTF-02
**Plans:** 2 plans (Wave 1: parallel)

**Success Criteria** (what must be TRUE):
1. LinkedIn Jobs scraped with proxy rotation (no rate limit bans)
2. User can configure notification preferences in settings
3. User receives email notification when high-priority signal matches their criteria

Plans:
- [x] 04-01-PLAN.md — LinkedIn Jobs scraper with Bright Data proxy rotation
- [x] 04-02-PLAN.md — Notification preferences UI and email alerts via Resend

### Phase 5: UI Polish
**Goal:** Signals list has pagination, search, and priority filters for a production-ready experience
**Depends on:** Phase 3 (builds on existing signals page)
**Requirements:** None (tech debt closure from audit)
**Gap Closure:** Closes UI tech debt from v1.0 audit
**Plans:** 2 plans (Wave 1: parallel)

**Success Criteria** (what must be TRUE):
1. Signals list shows pagination controls when more than 20 signals exist
2. User can search signals by company name or title keyword
3. User can filter signals by priority level (high, medium, low)
4. All filters work together and persist in URL for sharing

Plans:
- [ ] 05-01-PLAN.md — Pagination component and infinite scroll for signals list
- [ ] 05-02-PLAN.md — Search input and priority filter controls

## Progress

**Execution Order:** Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | ✓ Complete | 2026-01-30 |
| 2. Signal Ingestion | 3/3 | ✓ Complete | 2026-01-30 |
| 3. Dashboard & Emails | 3/3 | ✓ Complete | 2026-01-30 |
| 4. Automation & Hardening | 2/2 | ✓ Complete | 2026-01-30 |
| 5. UI Polish | 0/2 | Not started | - |

---
*Roadmap created: 2026-01-30*
*Depth: quick (3-5 phases)*
*Coverage: 31/31 requirements mapped*
