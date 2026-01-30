# Project Research Summary

**Project:** Axidex - AI-powered Signal Intelligence Platform
**Domain:** Sales intelligence / Signal detection / AI outreach
**Researched:** 2026-01-30
**Confidence:** HIGH

## Executive Summary

Axidex is a signal intelligence platform that detects buying signals (funding, hiring, news) and generates AI-powered outreach emails. The competitive landscape is dominated by ZoomInfo (500M+ contacts), Apollo (275M+), and 6sense (intent data), but there's a clear gap: **most tools provide data, not action**. The winning strategy is a tight signal-to-email pipeline that turns detections into ready-to-send outreach within minutes.

The recommended architecture separates concerns: **Vercel (Next.js)** for the dashboard, **Railway (Python)** for scraping/processing, and **Supabase** as the integration point with real-time broadcasting. This avoids the fatal mistake of running slow scrapers in Vercel's serverless functions. Key technology choices favor simplicity over power: Crawlee over Scrapy, Dramatiq over Celery, pgvector over Pinecone, direct LLM API calls over LangChain.

Three critical risks require Day 1 attention: (1) **LinkedIn scraping legal exposure** - Proxycurl was sued and shut down in 2026; use legally-vetted providers or alternative sources. (2) **Signal decay** - buying signals lose 8x conversion value within minutes; design for real-time, not batch. (3) **LLM cost explosion** - production costs can hit $7,500+/month unexpectedly; implement budget caps and model routing immediately.

## Key Findings

### Stack Decision

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Scraping** | Crawlee (Python) + Playwright | Unified HTTP + browser, built-in anti-detection, better DX than Scrapy |
| **Queue** | Dramatiq + Redis | Simpler than Celery, sane defaults, same power |
| **Vector** | pgvector (Supabase) | Already have Supabase, no new infra, hybrid SQL+vector queries |
| **LLM** | OpenAI (extraction) + Anthropic (email) + Instructor | Composable, no framework tax, structured output validation |
| **Proxy** | Oxylabs (start) or Bright Data (scale) | Residential proxies mandatory for LinkedIn |

### Critical Warnings

**1. LinkedIn Legal Risk (Existential)**
- Proxycurl shut down July 2026 after LinkedIn lawsuit
- NEVER scrape behind LinkedIn login wall
- Use Bright Data (won cases against Meta/X) or public sources only
- Get legal review before launching LinkedIn features

**2. Signal Decay (Product Death)**
- Conversion drops 8x after first 5 minutes
- Design for real-time processing, not daily batch
- Timestamp everything, auto-deprioritize signals >48 hours old

**3. LLM Cost Explosion (Financial)**
- Real costs 9x higher than advertised pricing
- Implement budget caps before ANY production usage
- Use Haiku for drafts, Claude/GPT-4 for final only
- Batch API gives 50% discount for non-urgent processing

### Features Priority

**Must Have (Table Stakes):**
- Signal detection: funding rounds, hiring patterns, company news
- Basic search/filtering by company, industry, signal type
- Email verification (integrate ZeroBounce/NeverBounce)
- GDPR/CCPA compliance baked in from Day 1
- Export functionality (CSV minimum)

**Should Have (Differentiators):**
- AI-generated personalized emails (the core value prop)
- Signal-to-persona matching (right signal + right contact)
- Real-time dashboard updates via Supabase Realtime
- Human-in-the-loop email approval

**Defer (v2+):**
- Own contact database (use enrichment APIs)
- Chrome extension
- Multiple CRM integrations (start HubSpot only)
- Intent data integration
- Advanced ABM features

### Architecture Pattern

**Database as integration point:** Python workers write to Supabase, Next.js reads from Supabase, Supabase Realtime broadcasts changes. No separate message broker needed for MVP.

```
Railway (Python)          Supabase             Vercel (Next.js)
----------------         ----------           ------------------
Scheduler -------> raw_scrapes table
Scraper Workers
AI Processor -----> signals table -----> Realtime -----> Dashboard
                                          WebSocket
```

## Build Order

### Phase 1: Database Foundation
**Rationale:** Everything depends on schema. Changes are painful later.
**Delivers:** Tables (users, scrape_configs, raw_scrapes, signals, generated_emails), RLS policies, Realtime publication
**Addresses:** GDPR compliance (consent tracking), deduplication strategy
**Avoids:** Deduplication debt - impossible to fix after data ingestion starts

### Phase 2: Python Scraper Skeleton
**Rationale:** Validates data flow before adding complexity
**Delivers:** Basic scraper on Railway, single source (news - easier than LinkedIn), direct DB writes
**Addresses:** Signal detection (news/funding)
**Avoids:** Scraping in API routes (Vercel timeout death)

### Phase 3: AI Processing Pipeline
**Rationale:** Transforms raw data into value. Core differentiator.
**Delivers:** Entity extraction, signal classification, priority scoring
**Uses:** OpenAI (extraction), Anthropic (generation), Instructor (validation)
**Avoids:** Cost explosion - implement budget caps and model routing here

### Phase 4: Real-time Dashboard
**Rationale:** Already have signals flowing. Now show them.
**Delivers:** Live signal feed, stats, notifications for high-priority
**Implements:** Supabase Realtime subscriptions
**Avoids:** Polling anti-pattern (wastes resources, poor UX)

### Phase 5: Email Generation
**Rationale:** Can parallel with automation phase
**Delivers:** Signal context to personalized email, template library, human-in-loop approval
**Avoids:** Hallucination - structured output, fact injection only, no freeform generation

### Phase 6: Automation & Hardening
**Rationale:** Automation after manual flow works. LinkedIn is hardest.
**Delivers:** Railway cron scheduling, rate limiting, error handling, monitoring
**Addresses:** LinkedIn scraping (last - most risk, most complexity)
**Avoids:** Rate limit bans - implement exponential backoff, proxy rotation

### Phase Ordering Rationale
- Database first because schema changes are expensive
- News scraping before LinkedIn (lower legal risk, simpler anti-bot)
- AI pipeline before dashboard (need data to display)
- Email generation can parallel with automation (independent)
- LinkedIn last because highest risk and complexity

### Research Flags

**Needs deeper research during planning:**
- Phase 2 (Signal Ingestion): Verify chosen data providers' legal standing
- Phase 5 (Email Generation): Test specific prompts with real data for hallucination
- Phase 6 (LinkedIn): Queue/pub-sub technology selection if scaling beyond MVP

**Standard patterns (skip research-phase):**
- Phase 1 (Database): Well-documented Supabase patterns
- Phase 3 (AI Pipeline): Standard model routing, documented cost controls
- Phase 4 (Dashboard): Standard Supabase Realtime patterns

## Open Questions

Unresolved items requiring user input:

1. **LinkedIn data source:** Build with Bright Data? Use alternative public sources only? Defer LinkedIn entirely?
2. **CRM priority:** HubSpot first, or different CRM based on target customer?
3. **Signal sources scope:** Start with news + job boards only? Add Crunchbase API?
4. **Contact enrichment:** Which provider? Apollo, Clearbit, or defer to v2?
5. **Email sending:** Integrate with existing tools (SendGrid/Postmark) or just "copy to clipboard"?

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Official docs, recent sources, production-proven tools |
| Features | HIGH | Multiple competitor analysis, clear market patterns |
| Architecture | HIGH | Verified Supabase Realtime + Railway patterns |
| Pitfalls | HIGH | Multiple authoritative sources, real case studies (Proxycurl lawsuit) |

**Overall confidence:** HIGH

### Gaps to Address

- **LinkedIn legal strategy:** Needs explicit decision before Phase 6
- **Contact data source:** Not selected, needed for signal-to-persona matching
- **Email deliverability:** Sending infrastructure not decided (affects Phase 5 scope)

## Sources

### Primary (HIGH confidence)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Railway Cron Jobs](https://docs.railway.com/reference/cron-jobs)
- [Crawlee Python Docs](https://crawlee.dev/python/)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [Bright Data - Proxycurl Alternatives](https://brightdata.com/blog/web-data/proxycurl-alternatives)

### Secondary (MEDIUM confidence)
- [ZoomInfo, Apollo, 6sense feature comparison](https://monday.com/blog/crm-and-sales/sales-intelligence-tools/)
- [LLM Cost Optimization 2026](https://byteiota.com/llm-cost-optimization-stop-overpaying-5-10x-in-2026/)
- [Signal decay research](https://www.heyreach.io/blog/buying-intent)

### Tertiary (LOW confidence)
- Competitor feature lists (may be outdated marketing)

---
*Research completed: 2026-01-30*
*Ready for roadmap: yes*
