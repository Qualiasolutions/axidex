# Requirements: Axidex

**Defined:** 2026-01-30
**Core Value:** Sales teams get actionable signals with ready-to-send emails — no manual research.

## v1 Requirements

### Authentication

- [x] **AUTH-01**: User can sign up with email and password
- [x] **AUTH-02**: User can log in and stay logged in across sessions
- [x] **AUTH-03**: User can log out from any page
- [x] **AUTH-04**: User can reset password via email link

### Database

- [x] **DATA-01**: Signals table stores scraped signals with type, company, content, priority
- [x] **DATA-02**: Emails table stores generated emails linked to signals
- [x] **DATA-03**: Users table stores profiles and preferences
- [x] **DATA-04**: RLS policies restrict users to their own data

### Signal Ingestion

- [x] **SCRP-01**: Python worker scrapes TechCrunch/news sites on schedule
- [x] **SCRP-02**: Python worker scrapes company websites (press releases, careers)
- [x] **SCRP-03**: Python worker scrapes public job boards (Indeed, Glassdoor)
- [ ] **SCRP-04**: Python worker scrapes LinkedIn Jobs with proxy rotation
- [x] **SCRP-05**: Signals deduplicated via pgvector similarity before storage
- [x] **SCRP-06**: Signals classified by type (hiring, funding, expansion)
- [x] **SCRP-07**: Signals scored for buyer intent priority

### AI Pipeline

- [x] **AI-01**: OpenAI GPT-4o extracts entities (company, role, funding amount) from raw content
- [x] **AI-02**: Classification model determines signal type and priority
- [x] **AI-03**: Anthropic Claude generates personalized outreach email per signal
- [x] **AI-04**: Email generation triggered on-demand when user requests
- [~] **AI-05**: LLM usage tracked with budget caps and alerts (tracking implemented, budget caps deferred)

### Dashboard

- [x] **DASH-01**: Dashboard displays real signals from database
- [x] **DASH-02**: User can filter signals by type (hiring/funding/expansion)
- [x] **DASH-03**: User can filter signals by date range
- [x] **DASH-04**: User can filter signals by priority level
- [x] **DASH-05**: User can click signal to view full details
- [x] **DASH-06**: Signal detail shows AI-generated email
- [x] **DASH-07**: User can copy email to clipboard with one click
- [x] **DASH-08**: Dashboard shows stats (total signals, by type, by priority)
- [x] **DASH-09**: Dashboard updates in real-time when new signals arrive

### Notifications

- [ ] **NOTF-01**: User can configure notification preferences
- [ ] **NOTF-02**: User receives email when high-priority signals match criteria

## v2 Requirements

### Integrations

- **INTG-01**: User can connect HubSpot CRM
- **INTG-02**: User can push signals to CRM as leads
- **INTG-03**: User can send email directly from dashboard via connected email

### Notifications (Extended)

- **NOTF-03**: User can connect Slack workspace
- **NOTF-04**: Team receives Slack notifications for new signals

### Advanced Features

- **ADV-01**: User can define custom signal criteria (keywords, industries)
- **ADV-02**: User can save and name filter presets
- **ADV-03**: User can customize email brand voice and templates

## Out of Scope

| Feature | Reason |
|---------|--------|
| OAuth login (Google/GitHub) | Email/password sufficient for v1 |
| Mobile app | Web-first, responsive design covers mobile |
| Multi-tenant teams | Single-user accounts for v1 |
| CRM integrations | Defer to v2 after core validated |
| Contact enrichment database | Use third-party APIs, don't build own database |
| Direct email sending | Copy to clipboard for v1, avoid deliverability complexity |
| Real-time chat support | Not core to signal delivery |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 1 | Complete |
| DATA-04 | Phase 1 | Complete |
| SCRP-01 | Phase 2 | Complete |
| SCRP-02 | Phase 2 | Complete |
| SCRP-03 | Phase 2 | Complete |
| SCRP-04 | Phase 4 | Pending |
| SCRP-05 | Phase 2 | Complete |
| SCRP-06 | Phase 2 | Complete |
| SCRP-07 | Phase 2 | Complete |
| AI-01 | Phase 2 | Complete |
| AI-02 | Phase 2 | Complete |
| AI-03 | Phase 3 | Complete |
| AI-04 | Phase 3 | Complete |
| AI-05 | Phase 3 | Partial |
| DASH-01 | Phase 3 | Complete |
| DASH-02 | Phase 3 | Complete |
| DASH-03 | Phase 3 | Complete |
| DASH-04 | Phase 3 | Complete |
| DASH-05 | Phase 3 | Complete |
| DASH-06 | Phase 3 | Complete |
| DASH-07 | Phase 3 | Complete |
| DASH-08 | Phase 3 | Complete |
| DASH-09 | Phase 3 | Complete |
| NOTF-01 | Phase 4 | Pending |
| NOTF-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

---
*Requirements defined: 2026-01-30*
*Last updated: 2026-01-30 — Phase 3 requirements complete*
