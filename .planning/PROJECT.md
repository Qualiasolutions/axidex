# Axidex (PULSE)

## What This Is

A signal intelligence platform for sales teams. Automatically scrapes buying signals (hiring, funding, expansion news) from LinkedIn Jobs, news sites, and company websites, classifies intent with AI, and generates personalized outreach emails. Delivers via dashboard with filters, plus Slack/email notifications.

## Core Value

Sales teams get actionable signals with ready-to-send emails — no manual research.

## Requirements

### Validated

- ✓ Landing page with premium minimalist design — existing
- ✓ Dashboard shell with collapsible sidebar — existing
- ✓ Signals page with filters and empty states — existing
- ✓ Component library (Button, Badge, SignalCard, StatsCard) — existing
- ✓ Design system (CSS variables, orange accent #ea580c) — existing
- ✓ Supabase client setup (browser + server) — existing
- ✓ TypeScript types for Signal, User, Email, DashboardStats — existing
- ✓ Vercel deployment with auto-deploy — existing

### Active

**Authentication**
- [ ] User can sign up with email/password
- [ ] User can log in and stay logged in across sessions
- [ ] User can log out from any page
- [ ] User can reset password via email

**Database**
- [ ] Signals table with RLS policies
- [ ] Generated emails table linked to signals
- [ ] User profiles table
- [ ] User settings/preferences table

**Signal Ingestion**
- [ ] Python worker scrapes LinkedIn Jobs on schedule
- [ ] Python worker scrapes TechCrunch/news sites on schedule
- [ ] Python worker scrapes company websites (press releases, careers)
- [ ] Signals deduplicated before storage (Pinecone vector similarity)
- [ ] Signals classified by type (hiring, funding, expansion)
- [ ] Signals prioritized by buyer intent score

**AI Pipeline**
- [ ] OpenAI GPT-4o extracts entities from raw content
- [ ] Signal classification determines intent and priority
- [ ] Anthropic Claude generates personalized outreach email per signal
- [ ] Email generation happens on-demand when user requests

**Dashboard**
- [ ] Dashboard shows real signals from database
- [ ] User can filter signals by type, company, date, priority
- [ ] User can click signal to see details
- [ ] User can generate/view AI email for any signal
- [ ] User can copy email to clipboard
- [ ] Dashboard shows stats (total signals, by type, by priority)

**Notifications**
- [ ] User receives email when new high-priority signals match criteria
- [ ] User can connect Slack for signal notifications
- [ ] User can configure notification preferences

### Out of Scope

- Mobile app — web-first, mobile later
- Real-time chat — not core to signal delivery
- OAuth login (Google/GitHub) — email/password sufficient for v1
- CRM integrations (Salesforce, HubSpot) — defer to v2
- Custom scraping targets — fixed sources for v1
- Multi-tenant teams — single-user accounts for v1

## Context

**Existing Codebase:**
- Next.js 16 + React 19 + TypeScript frontend on Vercel
- Supabase prepared but not connected
- Landing page and dashboard shell complete
- Empty states render, no real data flows yet

**Architecture:**
- Python worker on Railway handles scraping (long-running, proxy-heavy)
- Next.js on Vercel handles dashboard, auth, AI email generation
- Supabase for PostgreSQL + Auth + Realtime
- Upstash Redis for job queues and rate limiting
- Pinecone for signal deduplication

**Signal Sources (v1):**
- LinkedIn Jobs API / scraping
- TechCrunch and tech news RSS/scraping
- Company websites (press releases, career pages)

## Constraints

- **Tech Stack**: Next.js 16/React 19 frontend, Python backend, Supabase, Vercel
- **Timeline**: 3-week build (proposal timeline)
- **Budget**: €2,050 total infrastructure/services budget per proposal
- **Data Collection**: Requires residential proxies (BrightData) and headless browsers

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hybrid architecture (Python + Next.js) | Scraping needs long-running processes + proxies; dashboard needs fast serverless | — Pending |
| Supabase for auth + database | Already prepared in codebase, fits stack | — Pending |
| On-demand email generation | Avoids generating emails for signals user never views | — Pending |
| Three signal sources for v1 | LinkedIn, news, company sites cover main buying signals | — Pending |

## Current Milestone: v1.1 Production Launch + LinkedIn

**Goal:** Get v1.0 deployed to production for real customers, then add LinkedIn Jobs scraping via Bright Data.

**Target features:**
- Deploy all infrastructure (Supabase migrations, Railway worker, Vercel env vars)
- Configure production monitoring and error tracking
- Add LinkedIn Jobs scraper with Bright Data Web Scraper API
- Complete notification system (NOTF-01, NOTF-02)

---
*Last updated: 2026-01-30 after milestone v1.1 initialization*
