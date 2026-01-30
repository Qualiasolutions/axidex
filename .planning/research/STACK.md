# Stack Research: Signal Intelligence Platform

**Project:** Axidex - AI-powered sales signal intelligence
**Researched:** 2025-01-30
**Overall Confidence:** HIGH

---

## Executive Summary

This research covers the 2025 standard stack for building a signal intelligence / web scraping platform. The recommendations prioritize:
1. **Reliability** - Scraping is fragile; use proven tools
2. **Scalability** - Handle thousands of signals daily
3. **Cost efficiency** - Avoid over-engineering early
4. **Integration** - Works with existing Next.js frontend + Supabase

---

## Recommended Stack

### Scraping Layer

| Technology | Version | Purpose | Why This Choice |
|------------|---------|---------|-----------------|
| **Crawlee (Python)** | 0.6.x | Primary scraping framework | Modern, batteries-included, built-in proxy rotation, anti-detection, and retry logic. Combines Playwright + HTTP scraping in one API. [Source](https://crawlee.dev/python/) |
| **Playwright** | 1.49+ | Browser automation (via Crawlee) | Best-in-class JS rendering, handles SPAs, smart auto-waiting. Used under the hood by Crawlee's PlaywrightCrawler. [Source](https://www.scrapingbee.com/blog/best-python-web-scraping-libraries/) |
| **BeautifulSoup4** | 4.12+ | HTML parsing (via Crawlee) | Fast for static pages via Crawlee's BeautifulSoupCrawler. [Source](https://crawlee.dev/python/docs/introduction) |
| **playwright-stealth** | 1.0.6+ | Anti-detection | Patches browser fingerprints to avoid bot detection. Essential for LinkedIn. [Source](https://www.zenrows.com/blog/playwright-stealth) |

**Why Crawlee over Scrapy:**
- Scrapy is powerful but requires JS integration (Splash) for dynamic sites
- Crawlee unifies HTTP + browser crawling with zero config
- Built-in fingerprint rotation, proxy management, retry logic
- Released for Python in March 2025, already production-ready
- Better DX with type hints and async-first design

**LinkedIn Jobs Specific:**
For LinkedIn Jobs specifically, use the **JobSpy** library as a starting point:
```bash
pip install python-jobspy
```
Note: LinkedIn rate limits around page 10 without proxies. Proxies are mandatory for scale. [Source](https://github.com/speedyapply/JobSpy)

---

### Proxy & Anti-Detection

| Service | Purpose | Pricing | Why |
|---------|---------|---------|-----|
| **Bright Data** | Residential proxies | $10.50/GB (pay-as-you-go) | Largest proxy pool (120M+ IPs), best success rates for LinkedIn, scraping browser compatible with Playwright. [Source](https://brightdata.com/blog/comparison/bright-data-vs-oxylabs) |
| **Oxylabs** | Alternative | $4/GB residential | Cheaper, 99.95% success rate, good if Bright Data is overkill. [Source](https://oxylabs.io/) |

**Anti-Detection Strategy:**
1. Use Crawlee's built-in fingerprint rotation (enabled by default)
2. Add `playwright-stealth` for CDP detection bypass
3. Rotate user agents, viewports, and timezones
4. Add random delays (2-8 seconds) between requests
5. Use residential proxies for LinkedIn (datacenter gets blocked)

**Budget Option:** Start with Oxylabs at $4/GB. Upgrade to Bright Data if blocking becomes an issue.

---

### Job Queue System

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Dramatiq** | 1.17+ | Task queue | Sweet spot between Celery complexity and RQ simplicity. Better defaults, reliable message delivery, simpler config. [Source](https://dramatiq.io/motivation.html) |
| **Redis** | 7.2+ | Message broker | Fast, simple, already needed for caching. Use Valkey if license concerns. [Source](https://judoscale.com/blog/choose-python-task-queue) |
| **APScheduler** | 3.10+ | Cron scheduling | Schedule periodic scraping jobs (hourly, daily). Simpler than Celery Beat. |

**Why Dramatiq over Celery:**
- Celery has decade of baggage and complex config
- Dramatiq has sane defaults, JSON serialization by default (security!)
- Built-in middleware for retries, rate limiting, time limits
- Same Redis broker, easier migration path if needed
- "If you're frustrated with Celery but need more than RQ" - it's the modern choice

**Why NOT Temporal (yet):**
- Overkill for MVP signal scraping
- Steep learning curve (month+ to productivity)
- Consider later for complex multi-step AI agent workflows
- Good for: mission-critical, stateful workflows
- Overkill for: "scrape this site, extract entities, save to DB"

**Alternative - SAQ:** If you want pure async Python, SAQ (Simple Async Queue) has < 5ms latency and is built on asyncio. Consider if Dramatiq feels too sync-heavy.

---

### Vector Database (for Deduplication)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **pgvector** | 0.8.0+ | Embedding storage & similarity | Already using Supabase (PostgreSQL). No new infrastructure. Store signals + embeddings in same DB. [Source](https://supabase.com/docs/guides/database/extensions/pgvector) |

**Why pgvector over Pinecone/Qdrant:**
- **Zero new infrastructure** - Supabase has pgvector built-in
- **40-80% cheaper** than specialized vector DBs for < 100M vectors
- **Hybrid queries** - JOIN signal metadata with vector similarity in one SQL
- **9x faster** with 0.8.0 release (HNSW indexing)
- Pinecone is great but adds cost and another service

**Deduplication Workflow:**
1. Generate embedding for each signal (title + company + source)
2. Before insert, query for cosine similarity > 0.95
3. If match found, merge/update instead of insert
4. Use HNSW index for fast approximate nearest neighbor

```sql
-- Enable pgvector in Supabase
CREATE EXTENSION IF NOT EXISTS vector;

-- Signals table with embedding
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  source_url TEXT,
  embedding VECTOR(1536), -- OpenAI ada-002 dimension
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for fast similarity search
CREATE INDEX ON signals USING hnsw (embedding vector_cosine_ops);
```

---

### LLM Orchestration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Direct API calls** | - | Primary approach | Simpler, fewer abstractions, full control. LangChain adds complexity without clear value for this use case. |
| **OpenAI SDK** | 1.x | Entity extraction | Structured Outputs guarantee valid JSON. 100% schema adherence with gpt-4o. [Source](https://platform.openai.com/docs/guides/structured-outputs) |
| **Anthropic SDK** | 0.40+ | Email generation | Claude excels at brand voice adaptation and nuanced copywriting. [Source](https://claude.com/customers/copy-ai) |
| **Instructor** | 1.x | Schema validation | Pydantic integration for both OpenAI and Anthropic. Type-safe LLM outputs. |

**Why NOT LangChain:**
- LangChain is great for prototyping, but adds abstraction without value here
- In 2025, "specialized stacks are winning" - direct API calls + validation
- Use case is simple: extract entities, generate email. No chains needed.
- Instructor provides the schema validation we need without the framework tax

**Composable Approach:**
```
OpenAI (entity extraction) + Anthropic (email gen) + Instructor (validation)
```

This is the 2025 pattern: composable tools instead of monolithic frameworks.

---

### News & Funding Data Sources

| Source | Method | Notes |
|--------|--------|-------|
| **TechCrunch** | Direct scraping | RSS feed + article scraping. ScraperAPI has dedicated support. |
| **Crunchbase** | API or scraping | Official API requires partnership. Use ScrapingBee or Apify actors for funding rounds. [Source](https://scrapfly.io/blog/posts/how-to-scrape-crunchbase) |
| **LinkedIn Jobs** | JobSpy + proxies | Most restrictive. Rate limits at page 10. Proxies mandatory. |
| **Company websites** | Crawlee | Careers pages, press releases, about pages |

**Legal Note:** Scraping public data is generally legal, but:
- LinkedIn TOS prohibits scraping (IP/account ban risk, not legal risk for public data)
- Crunchbase requires permission for commercial use
- Never scrape private/gated content
- Respect rate limits, don't damage sites

---

## Complete Installation

### Python Backend

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Core scraping
pip install crawlee[playwright,beautifulsoup]
pip install playwright-stealth
pip install python-jobspy  # LinkedIn Jobs

# Task queue
pip install dramatiq[redis]
pip install apscheduler
pip install redis

# LLM
pip install openai
pip install anthropic
pip install instructor

# Database
pip install supabase
pip install pgvector

# Utilities
pip install pydantic
pip install httpx
pip install python-dotenv
```

### Requirements.txt

```
crawlee[playwright,beautifulsoup]>=0.6.0
playwright-stealth>=1.0.6
python-jobspy>=1.1.0
dramatiq[redis]>=1.17.0
apscheduler>=3.10.0
redis>=5.0.0
openai>=1.0.0
anthropic>=0.40.0
instructor>=1.0.0
supabase>=2.0.0
pgvector>=0.3.0
pydantic>=2.0.0
httpx>=0.27.0
python-dotenv>=1.0.0
```

---

## Rationale Summary

| Decision | Rationale |
|----------|-----------|
| **Crawlee over Scrapy** | Modern, unified HTTP+browser, built-in anti-detection, better DX |
| **Dramatiq over Celery** | Simpler config, sane defaults, same power |
| **pgvector over Pinecone** | Already have Supabase, no new infra, hybrid queries |
| **Direct API over LangChain** | Simpler, full control, composable with Instructor |
| **Bright Data for proxies** | Best success rates for LinkedIn, Playwright integration |

---

## Alternatives Considered

### Scraping Framework

| Alternative | Why Not Chosen |
|-------------|----------------|
| **Scrapy** | No native JS support, middleware complexity, older async model |
| **Selenium** | Slower than Playwright, more detection-prone, worse API |
| **Raw Playwright** | Missing retry logic, proxy rotation, queue management that Crawlee provides |
| **Puppeteer** | Node.js only, Playwright has better API and browser support |

### Task Queue

| Alternative | Why Not Chosen |
|-------------|----------------|
| **Celery** | Complex config, pickle security issues by default, overkill |
| **RQ** | Too simple, no middleware, limited retry control |
| **Temporal** | Overkill for MVP, steep learning curve, consider for v2 |
| **BullMQ** | Node.js native (has Python bindings but less mature) |

### Vector Database

| Alternative | Why Not Chosen |
|-------------|----------------|
| **Pinecone** | Another service, cost at scale, not needed < 100M vectors |
| **Qdrant** | Self-hosted complexity, pgvector simpler for our scale |
| **Weaviate** | Over-engineered for deduplication use case |
| **Chroma** | Less mature, SQLite-based limits scale |

### LLM Orchestration

| Alternative | Why Not Chosen |
|-------------|----------------|
| **LangChain** | Abstraction without value for simple extract/generate flow |
| **LlamaIndex** | Designed for RAG, not our use case |
| **Haystack** | Enterprise search focus, overkill |

---

## Sources

### Scraping
- [Crawlee Python Documentation](https://crawlee.dev/python/)
- [Apify: Best Python Web Scraping Libraries 2025](https://blog.apify.com/what-are-the-best-python-web-scraping-libraries/)
- [JobSpy GitHub](https://github.com/speedyapply/JobSpy)
- [ZenRows: Playwright Stealth](https://www.zenrows.com/blog/playwright-stealth)

### Proxies
- [Bright Data vs Oxylabs Comparison](https://blog.apify.com/oxylabs-vs-bright-data/)
- [KDnuggets: Best Proxy Providers 2026](https://www.kdnuggets.com/2025/11/brightdata/the-best-proxy-providers-for-large-scale-scraping-for-2026)

### Task Queues
- [Judoscale: Choosing Python Task Queue](https://judoscale.com/blog/choose-python-task-queue)
- [Dramatiq Motivation](https://dramatiq.io/motivation.html)
- [DevPro: Python Background Tasks 2025](https://devproportal.com/languages/python/python-background-tasks-celery-rq-dramatiq-comparison-2025/)

### Vector Database
- [Supabase pgvector Docs](https://supabase.com/docs/guides/database/extensions/pgvector)
- [Firecrawl: Best Vector Databases 2025](https://www.firecrawl.dev/blog/best-vector-databases-2025)

### LLM
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [Anthropic Claude for Copywriting](https://claude.com/customers/copy-ai)
- [ZenML: LLM Orchestration Frameworks](https://www.zenml.io/blog/best-llm-orchestration-frameworks)

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Scraping (Crawlee) | HIGH | Official docs, recent release, verified features |
| Proxies | HIGH | Multiple sources confirm Bright Data/Oxylabs leadership |
| Task Queue (Dramatiq) | HIGH | Well-documented, community consensus |
| Vector DB (pgvector) | HIGH | Supabase official docs, production proven |
| LLM approach | MEDIUM | Composable approach is 2025 trend, but LangChain still popular |

---

## Roadmap Implications

1. **Phase 1: Core Scraping** - Set up Crawlee + Dramatiq + Redis, basic LinkedIn Jobs scraper
2. **Phase 2: Multi-Source** - Add TechCrunch, Crunchbase, company websites
3. **Phase 3: AI Pipeline** - OpenAI entity extraction, pgvector deduplication
4. **Phase 4: Email Generation** - Anthropic Claude integration, template system
5. **Phase 5: Scale** - Proxy optimization, Bright Data integration, monitoring
