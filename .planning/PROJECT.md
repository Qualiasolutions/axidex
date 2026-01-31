# Axidex (PULSE)

## What This Is

A signal intelligence platform for sales teams. Automatically scrapes buying signals (hiring, funding, expansion news) from LinkedIn Jobs, news sites, and company websites, classifies intent with AI, and generates personalized outreach emails. Delivers via dashboard with filters, plus Slack/email notifications.

## Core Value

Sales teams get actionable signals with ready-to-send emails — no manual research.

## Current State (v1.2 shipped)

**Live:** https://axidex.vercel.app

**Shipped Features:**
- Full authentication (signup, login, password reset)
- Signal ingestion from LinkedIn Jobs, news, company websites
- AI pipeline (entity extraction, classification, Claude email generation)
- Dashboard with real-time feed, filters, pagination, search
- Keyboard shortcuts, breadcrumbs, optimistic UI
- SWR caching with prefetch on hover
- Toast notifications, skeleton loading states
- Slack integration (OAuth, channel selection, auto-posting)
- Stripe billing (checkout, portal, webhooks, usage limits)
- Onboarding (welcome modal, feature tour, setup wizard)

**Tech Stack:**
- Frontend: Next.js 16 + React 19 + TypeScript (23,725 LOC)
- Backend: Python worker on Railway
- Database: Supabase (PostgreSQL + Auth + Realtime)
- AI: OpenAI GPT-4o (extraction), Anthropic Claude (emails)
- Integrations: Slack, Stripe, Bright Data, Sentry

## Requirements

### Validated

**v1.0 — Core Platform:**
- ✓ Landing page with premium minimalist design — existing
- ✓ Dashboard shell with collapsible sidebar — existing
- ✓ Signals page with filters and empty states — existing
- ✓ Component library (Button, Badge, SignalCard, StatsCard) — existing
- ✓ Design system (CSS variables, orange accent #ea580c) — existing
- ✓ Supabase client setup (browser + server) — existing
- ✓ TypeScript types for Signal, User, Email, DashboardStats — existing
- ✓ Vercel deployment with auto-deploy — existing
- ✓ User authentication (signup, login, logout, password reset) — v1.0
- ✓ Database schema with RLS policies — v1.0
- ✓ Signal ingestion from news, job boards, company sites — v1.0
- ✓ AI entity extraction and classification — v1.0
- ✓ Claude email generation on-demand — v1.0
- ✓ Dashboard with real-time signal feed — v1.0
- ✓ Filters, pagination, search — v1.0

**v1.1 — Production Launch:**
- ✓ Supabase migrations applied to production — v1.1
- ✓ Worker deployed to Railway — v1.1
- ✓ Sentry integration (Next.js + Python) — v1.1
- ✓ Health check endpoints — v1.1
- ✓ LinkedIn Jobs scraper via Bright Data — v1.1
- ✓ Notification preferences UI — v1.1

**v1.2 — UX Polish & Features:**
- ✓ Keyboard shortcuts (g+s/e/a/n/r, j/k, ? help) — v1.2
- ✓ Breadcrumbs on all detail pages — v1.2
- ✓ SWR caching with optimistic updates — v1.2
- ✓ Prefetch on hover — v1.2
- ✓ Skeleton loading states — v1.2
- ✓ Toast notifications (Sonner) — v1.2
- ✓ EmptyState component — v1.2
- ✓ Slack integration (OAuth, channel selection, auto-posting) — v1.2
- ✓ Stripe billing (checkout, portal, webhooks) — v1.2
- ✓ Usage limits enforcement — v1.2
- ✓ Onboarding (welcome, tour, wizard) — v1.2

### Active

(No active requirements — awaiting next milestone definition)

### Out of Scope

- Mobile app — web-first, responsive design sufficient
- Real-time chat — not core to signal delivery
- OAuth login (Google/GitHub) — email/password sufficient
- CRM integrations (Salesforce, HubSpot) — defer to v2
- Custom scraping targets — fixed sources for v1
- Multi-tenant teams — single-user accounts for v1

## Context

**Codebase:**
- 23,725 lines TypeScript (src/)
- 16 Supabase migrations (001-016)
- 15 phases completed across 3 milestones

**Manual Setup Required:**
- Add RESEND_API_KEY to Vercel
- Configure Supabase database webhook for signals INSERT
- Add Stripe environment variables (secret, publishable, webhook secret, price IDs)
- Apply migrations 015 (billing) and 016 (onboarding) to production

**Known Constraints:**
- LinkedIn scraping requires Bright Data (legal protection)
- LLM costs need monitoring (budget caps recommended)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Hybrid architecture (Python + Next.js) | Scraping needs long-running processes; dashboard needs serverless | ✓ Good |
| Supabase for auth + database | Already prepared, fits stack | ✓ Good |
| On-demand email generation | Avoids generating for unviewed signals | ✓ Good |
| Three signal sources for v1 | LinkedIn, news, company sites cover main signals | ✓ Good |
| SWR over React Query | Lighter weight, better Next.js SSR integration | ✓ Good |
| Sonner for toasts | Lightweight, excellent DX | ✓ Good |
| Lazy-init Stripe/Resend clients | Avoids build errors without env vars | ✓ Good |
| Custom events for keyboard nav | Simpler than global state | ✓ Good |
| Limit enforcement at API level | More flexible than middleware | ✓ Good |

---
*Last updated: 2026-02-01 after v1.2 milestone completion*
