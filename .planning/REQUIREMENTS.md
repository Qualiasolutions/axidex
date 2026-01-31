# Requirements: Axidex

**Defined:** 2026-01-30
**Core Value:** Sales teams get actionable signals with ready-to-send emails — no manual research.

## v1.2 Requirements

### Navigation & UX

- [ ] **NAV-01**: Sidebar displays icons alongside text labels
- [ ] **NAV-02**: Mobile navigation drawer accessible on small screens
- [ ] **NAV-03**: Keyboard shortcuts for common actions (j/k navigation, g+s for signals, etc.)
- [ ] **NAV-04**: Breadcrumb navigation on detail pages

### Performance

- [ ] **PERF-01**: Optimistic UI updates for user actions (mark read, toggle, etc.)
- [ ] **PERF-02**: Client-side caching with SWR or React Query
- [ ] **PERF-03**: Skeleton loading states consistent across all pages
- [ ] **PERF-04**: Prefetch linked pages on hover

### Design Polish

- [ ] **UI-01**: Consistent spacing and typography across all pages
- [ ] **UI-02**: Improved visual hierarchy in cards and lists
- [ ] **UI-03**: Empty states with helpful actions
- [ ] **UI-04**: Toast notifications for user feedback

### Slack Integration

- [ ] **SLCK-01**: User can connect Slack workspace via OAuth
- [ ] **SLCK-02**: User can select channel for notifications
- [ ] **SLCK-03**: High-priority signals posted to Slack automatically
- [ ] **SLCK-04**: Slack messages include signal details and action links

### Billing

- [ ] **BILL-01**: Stripe checkout integration for subscription
- [ ] **BILL-02**: User billing portal for managing subscription
- [ ] **BILL-03**: Stripe webhook handling for subscription events
- [ ] **BILL-04**: Usage limits enforced based on plan tier

### Onboarding

- [ ] **ONBR-01**: Welcome screen for new users after signup
- [ ] **ONBR-02**: Guided tour of key features
- [ ] **ONBR-03**: Quick setup wizard for notification preferences

## v1.1 Requirements (Complete)

### Deployment

- [x] **DEPL-01**: Supabase migrations (001-009) applied to production database
- [x] **DEPL-02**: Worker deployed to Railway with SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
- [x] **DEPL-03**: Vercel environment variables configured (ANTHROPIC_API_KEY, RESEND_API_KEY)
- [x] **DEPL-04**: Supabase database webhook configured for signals INSERT events
- [x] **DEPL-05**: check-notification Edge Function deployed to Supabase
- [x] **DEPL-06**: Verify RLS policies work correctly in production (users see only own data)

### Observability

- [x] **OBSV-01**: Sentry SDK integrated in Next.js frontend
- [x] **OBSV-02**: Sentry SDK integrated in Python worker
- [x] **OBSV-03**: Worker health check endpoint accessible
- [x] **OBSV-04**: Alert configured for worker failures

### LinkedIn Scraping

- [x] **LNKD-01**: Bright Data Web Scraper API credentials configured
- [x] **LNKD-02**: LinkedIn Jobs scraper fetches job posts from Bright Data
- [x] **LNKD-03**: Scraper extracts company name, job title, location, and posting URL
- [x] **LNKD-04**: LinkedIn signals deduplicated via content hash before storage
  - *Note: Uses content hash + title prefix matching (more efficient than pgvector for exact/near-duplicate detection)*
- [x] **LNKD-05**: Random 2-5s delays between requests to prevent rate limiting
- [x] **LNKD-06**: Scraper runs on schedule with other scrapers

### Notifications

- [ ] **NOTF-01**: User can configure notification preferences in settings
- [ ] **NOTF-02**: User receives email when high-priority signal matches criteria

## v1.0 Requirements (Validated)

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
- [x] **SCRP-05**: Signals deduplicated via pgvector similarity before storage
- [x] **SCRP-06**: Signals classified by type (hiring, funding, expansion)
- [x] **SCRP-07**: Signals scored for buyer intent priority

### AI Pipeline

- [x] **AI-01**: OpenAI GPT-4o extracts entities (company, role, funding amount) from raw content
- [x] **AI-02**: Classification model determines signal type and priority
- [x] **AI-03**: Anthropic Claude generates personalized outreach email per signal
- [x] **AI-04**: Email generation triggered on-demand when user requests

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
- **AI-05**: LLM usage tracked with budget caps and alerts

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
| Slack notifications | Defer to v2, email notifications first |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DEPL-01 | Phase 6 | Pending |
| DEPL-02 | Phase 6 | Pending |
| DEPL-03 | Phase 6 | Pending |
| DEPL-04 | Phase 6 | Pending |
| DEPL-05 | Phase 6 | Pending |
| DEPL-06 | Phase 6 | Pending |
| OBSV-01 | Phase 7 | Complete |
| OBSV-02 | Phase 7 | Complete |
| OBSV-03 | Phase 7 | Complete |
| OBSV-04 | Phase 7 | Complete |
| LNKD-01 | Phase 8 | Complete |
| LNKD-02 | Phase 8 | Complete |
| LNKD-03 | Phase 8 | Complete |
| LNKD-04 | Phase 8 | Complete |
| LNKD-05 | Phase 8 | Complete |
| LNKD-06 | Phase 8 | Complete |
| NOTF-01 | Phase 9 | Pending |
| NOTF-02 | Phase 9 | Pending |

**Coverage:**
- v1.1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-30*
*Last updated: 2026-01-31 — Phase 8 LinkedIn Scraping complete*
