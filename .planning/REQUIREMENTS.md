# Requirements: Axidex

**Defined:** 2026-01-30
**Core Value:** Sales teams get actionable signals with ready-to-send emails — no manual research.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can sign up with email and password
- [ ] **AUTH-02**: User can log in and stay logged in across sessions
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: User can reset password via email link

### Database

- [ ] **DATA-01**: Signals table stores scraped signals with type, company, content, priority
- [ ] **DATA-02**: Emails table stores generated emails linked to signals
- [ ] **DATA-03**: Users table stores profiles and preferences
- [ ] **DATA-04**: RLS policies restrict users to their own data

### Signal Ingestion

- [ ] **SCRP-01**: Python worker scrapes TechCrunch/news sites on schedule
- [ ] **SCRP-02**: Python worker scrapes company websites (press releases, careers)
- [ ] **SCRP-03**: Python worker scrapes public job boards (Indeed, Glassdoor)
- [ ] **SCRP-04**: Python worker scrapes LinkedIn Jobs with proxy rotation
- [ ] **SCRP-05**: Signals deduplicated via pgvector similarity before storage
- [ ] **SCRP-06**: Signals classified by type (hiring, funding, expansion)
- [ ] **SCRP-07**: Signals scored for buyer intent priority

### AI Pipeline

- [ ] **AI-01**: OpenAI GPT-4o extracts entities (company, role, funding amount) from raw content
- [ ] **AI-02**: Classification model determines signal type and priority
- [ ] **AI-03**: Anthropic Claude generates personalized outreach email per signal
- [ ] **AI-04**: Email generation triggered on-demand when user requests
- [ ] **AI-05**: LLM usage tracked with budget caps and alerts

### Dashboard

- [ ] **DASH-01**: Dashboard displays real signals from database
- [ ] **DASH-02**: User can filter signals by type (hiring/funding/expansion)
- [ ] **DASH-03**: User can filter signals by date range
- [ ] **DASH-04**: User can filter signals by priority level
- [ ] **DASH-05**: User can click signal to view full details
- [ ] **DASH-06**: Signal detail shows AI-generated email
- [ ] **DASH-07**: User can copy email to clipboard with one click
- [ ] **DASH-08**: Dashboard shows stats (total signals, by type, by priority)
- [ ] **DASH-09**: Dashboard updates in real-time when new signals arrive

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
| AUTH-01 | TBD | Pending |
| AUTH-02 | TBD | Pending |
| AUTH-03 | TBD | Pending |
| AUTH-04 | TBD | Pending |
| DATA-01 | TBD | Pending |
| DATA-02 | TBD | Pending |
| DATA-03 | TBD | Pending |
| DATA-04 | TBD | Pending |
| SCRP-01 | TBD | Pending |
| SCRP-02 | TBD | Pending |
| SCRP-03 | TBD | Pending |
| SCRP-04 | TBD | Pending |
| SCRP-05 | TBD | Pending |
| SCRP-06 | TBD | Pending |
| SCRP-07 | TBD | Pending |
| AI-01 | TBD | Pending |
| AI-02 | TBD | Pending |
| AI-03 | TBD | Pending |
| AI-04 | TBD | Pending |
| AI-05 | TBD | Pending |
| DASH-01 | TBD | Pending |
| DASH-02 | TBD | Pending |
| DASH-03 | TBD | Pending |
| DASH-04 | TBD | Pending |
| DASH-05 | TBD | Pending |
| DASH-06 | TBD | Pending |
| DASH-07 | TBD | Pending |
| DASH-08 | TBD | Pending |
| DASH-09 | TBD | Pending |
| NOTF-01 | TBD | Pending |
| NOTF-02 | TBD | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 0
- Unmapped: 31 ⚠️

---
*Requirements defined: 2026-01-30*
*Last updated: 2026-01-30 after initial definition*
