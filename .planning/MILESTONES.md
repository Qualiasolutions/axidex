# Milestones

## Completed

### v1.0 — Core Platform (2026-01-30)
**Goal:** Working signal intelligence platform with AI email generation

**Delivered:**
- Database schema with RLS policies
- Authentication flow (signup, login, password reset)
- Signal ingestion from news, job boards, company websites
- AI pipeline: entity extraction, classification, email generation
- Dashboard with real-time signal feed
- Filters, pagination, search across all views

**Phases:** 1-5

### v1.1 — Production Launch + LinkedIn (2026-01-31)
**Goal:** Deploy to production, add observability, LinkedIn scraping

**Delivered:**
- Supabase migrations applied to production
- Worker deployed to Railway
- Sentry integration (Next.js + Python)
- Health check endpoints
- LinkedIn Jobs scraper via Bright Data
- Notification preferences UI

**Phases:** 6-9

**Note:** Phase 9 notifications code complete, manual config pending (Resend API key, Supabase webhook)

---
*Milestones tracked: 2*
*Current: v1.2 in progress*
