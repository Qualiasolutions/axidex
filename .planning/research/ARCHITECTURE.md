# Architecture Research: Signal Intelligence Platform

**Domain:** Web scraping + AI classification + Sales outreach
**Researched:** 2026-01-30
**Confidence:** HIGH (verified with official docs + multiple sources)

---

## System Overview

```
                                    AXIDEX ARCHITECTURE

    ┌─────────────────────────────────────────────────────────────────────────┐
    │                           RAILWAY (Python Backend)                       │
    │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
    │  │  Scheduler   │───▶│   Scraper    │───▶│  AI Processor │              │
    │  │  (Cron Job)  │    │   Workers    │    │  (Classifier) │              │
    │  └──────────────┘    └──────────────┘    └──────────────┘               │
    │         │                   │                    │                       │
    │         │                   │                    │                       │
    │         ▼                   ▼                    ▼                       │
    └─────────────────────────────────────────────────────────────────────────┘
                                         │
                                         │ REST API / Direct DB Write
                                         ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                         SUPABASE (Data Layer)                            │
    │                                                                          │
    │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
    │  │   signals    │    │  raw_scrapes │    │    users     │               │
    │  │   (table)    │    │   (table)    │    │   (table)    │               │
    │  └──────────────┘    └──────────────┘    └──────────────┘               │
    │         │                                                                │
    │         │ Realtime Publication                                           │
    │         ▼                                                                │
    │  ┌──────────────┐                                                        │
    │  │   Realtime   │ ─────────── WebSocket ──────────────────────┐         │
    │  │   Broadcast  │                                              │         │
    │  └──────────────┘                                              │         │
    │                                                                │         │
    └────────────────────────────────────────────────────────────────│─────────┘
                                                                     │
                                                                     ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                         VERCEL (Next.js Frontend)                        │
    │                                                                          │
    │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐               │
    │  │  Dashboard   │    │   Signals    │    │    Email     │               │
    │  │   (SSR)      │    │   Feed       │    │  Generator   │               │
    │  └──────────────┘    └──────────────┘    └──────────────┘               │
    │                                                                          │
    └─────────────────────────────────────────────────────────────────────────┘
```

**Key Principle:** Database as the integration point. Python workers write to Supabase. Next.js reads from Supabase. Supabase Realtime broadcasts changes to frontend.

---

## Data Flow

### Stage 1: Scrape Initiation

```
Railway Cron (every 15-30 min)
         │
         ▼
    ┌─────────────┐
    │  Scheduler  │ ── Reads scrape_configs from Supabase
    │   Service   │ ── Enqueues URLs to scrape
    └─────────────┘
         │
         ▼
    Queue (Redis or in-memory)
```

**Constraints (Railway Cron):**
- Minimum interval: 5 minutes
- Must exit after completion (no long-running processes)
- Runs in UTC timezone
- May vary by a few minutes from scheduled time

### Stage 2: Raw Scraping

```
    ┌─────────────┐
    │   Worker    │ ── Pulls URL from queue
    │  (Python)   │ ── Scrapes with rate limiting
    └─────────────┘ ── Stores raw HTML/JSON
         │
         │ Respects rate limits:
         │   - LinkedIn: ~50-100 requests/hour per IP
         │   - News sites: varies, check robots.txt
         │   - Random delays: 5-30 seconds between requests
         │
         ▼
    raw_scrapes table
    ├── id
    ├── source_url
    ├── source_type (linkedin_jobs | news | company_site)
    ├── raw_content (JSONB)
    ├── scraped_at
    └── status (pending | processed | failed)
```

### Stage 3: AI Processing

```
    ┌─────────────┐
    │ AI Processor│ ── Reads raw_scrapes (status=pending)
    │  (Python)   │ ── Extracts structured data
    └─────────────┘ ── Classifies signal type + priority
         │
         │ OpenAI/Anthropic API calls:
         │   - Extract: company, title, summary
         │   - Classify: signal_type, priority
         │   - Validate: is this a real buying signal?
         │
         ▼
    signals table
    ├── id
    ├── company_name
    ├── signal_type (hiring | funding | expansion | ...)
    ├── priority (high | medium | low)
    ├── status (new)
    ├── title
    ├── summary
    ├── source_url
    ├── detected_at
    └── metadata (JSONB)
```

### Stage 4: Real-time Dashboard Update

```
    signals table INSERT
         │
         │ Supabase Realtime (postgres_changes)
         │ Publication: supabase_realtime
         │
         ▼
    WebSocket broadcast
         │
         ▼
    Next.js client subscription
         │
         ▼
    Dashboard UI updates instantly
```

---

## Component Communication

### Pattern: Database as Message Broker

**Why this pattern:**
- Simplicity: No additional message queue infrastructure needed
- Atomicity: Scrape results and signals are persisted in same transaction
- Audit trail: All data changes are stored and queryable
- Real-time built-in: Supabase Realtime handles pub/sub

**How Python workers talk to Supabase:**

```python
# Using supabase-py (community library)
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Insert raw scrape
supabase.table("raw_scrapes").insert({
    "source_url": url,
    "source_type": "linkedin_jobs",
    "raw_content": scraped_data,
    "status": "pending"
}).execute()

# Insert processed signal (triggers Realtime broadcast)
supabase.table("signals").insert({
    "company_name": extracted["company"],
    "signal_type": classified["type"],
    "priority": classified["priority"],
    "title": extracted["title"],
    "summary": extracted["summary"],
    "source_url": url,
    "status": "new"
}).execute()
```

**How Next.js subscribes to updates:**

```typescript
// Client component
const supabase = createClient();

useEffect(() => {
  const channel = supabase
    .channel('signals-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'signals'
      },
      (payload) => {
        // Update local state with new signal
        setSignals(prev => [payload.new as Signal, ...prev]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### Alternative: Webhook Pattern (for more control)

If you need more control over processing (validation, transformation):

```
Python Worker ──POST──▶ Next.js API Route ──INSERT──▶ Supabase
                          /api/signals/ingest
                          - Validates payload
                          - Enriches data
                          - Inserts to DB
```

```typescript
// /api/signals/ingest/route.ts
export async function POST(req: Request) {
  const signal = await req.json();

  // Validate
  if (!isValidSignal(signal)) {
    return Response.json({ error: 'Invalid signal' }, { status: 400 });
  }

  // Enrich (e.g., fetch company logo)
  const enriched = await enrichSignal(signal);

  // Insert (triggers Realtime)
  const { data, error } = await supabase
    .from('signals')
    .insert(enriched)
    .select()
    .single();

  return Response.json(data);
}
```

**Recommendation:** Start with direct DB writes. Add API route layer when you need validation/enrichment logic.

---

## Rate Limiting & Backpressure

### LinkedIn-Specific Constraints

LinkedIn has aggressive anti-bot detection. Key limits to respect:

| Factor | Recommendation |
|--------|----------------|
| Requests per hour | 50-100 max per IP |
| Delay between requests | 5-30 seconds (random) |
| Proxy rotation | Required (residential preferred) |
| User agent rotation | Required |
| Session management | Warm up accounts before heavy use |

**Detection signals LinkedIn uses:**
- Request frequency patterns
- IP reputation (data center IPs flagged)
- Browser fingerprinting
- Behavioral patterns (mouse movement, scroll)

**HTTP error handling:**
- `429 Too Many Requests`: Back off, increase delays
- `403 Forbidden`: IP/session likely flagged, rotate

### Implementing Backpressure

```python
# Simple rate limiter for Python scraper
import time
import random
from collections import deque

class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = deque()

    def wait_if_needed(self):
        now = time.time()

        # Remove requests outside window
        while self.requests and self.requests[0] < now - self.window_seconds:
            self.requests.popleft()

        # If at limit, wait
        if len(self.requests) >= self.max_requests:
            sleep_time = self.requests[0] + self.window_seconds - now
            time.sleep(sleep_time + random.uniform(1, 5))

        self.requests.append(time.time())

# Usage
limiter = RateLimiter(max_requests=50, window_seconds=3600)  # 50/hour

for url in urls_to_scrape:
    limiter.wait_if_needed()
    scrape(url)
    time.sleep(random.uniform(5, 15))  # Additional human-like delay
```

### Queue-Based Backpressure (Scaled Version)

For higher scale, use Redis + a job queue:

```python
# Using Redis Queue (RQ) or Celery
from rq import Queue
from redis import Redis

redis_conn = Redis()
q = Queue(connection=redis_conn)

# Enqueue with rate limiting
for url in urls_to_scrape:
    q.enqueue(
        scrape_url,
        url,
        job_timeout=300,  # 5 min max
        retry=Retry(max=3, interval=[60, 120, 300])  # Exponential backoff
    )
```

**When to add Redis:**
- Processing > 1000 URLs per run
- Need distributed workers
- Need job persistence across restarts
- Need dead letter queue for failed jobs

**For MVP:** In-memory queue with rate limiter is sufficient.

---

## Scaling Considerations

### At 100 signals/day (MVP)

| Component | Approach |
|-----------|----------|
| Scraper | Single Railway cron job |
| Rate limiting | In-memory limiter |
| Processing | Sequential in same job |
| Realtime | Default Supabase plan |
| Storage | Default Supabase plan |

### At 1,000 signals/day

| Component | Approach |
|-----------|----------|
| Scraper | Railway cron + worker separation |
| Rate limiting | In-memory with proxy rotation |
| Processing | Batch AI calls (cheaper) |
| Realtime | Monitor Supabase concurrent connections |
| Storage | May need larger Supabase plan |

### At 10,000+ signals/day

| Component | Approach |
|-----------|----------|
| Scraper | Multiple workers with Redis queue |
| Rate limiting | Distributed rate limiting (Redis) |
| Processing | Dedicated AI processing workers |
| Realtime | Consider Broadcast from Database pattern |
| Storage | PostgreSQL partitioning by date |
| Architecture | Consider adding BullMQ for job orchestration |

### Supabase Realtime Scaling Notes

From official docs:
- "Database changes are processed on a single thread to maintain change order"
- Compute upgrades provide minimal throughput improvement
- For high scale: consider separate public tables without RLS, or server-side Realtime with client redistribution

**Recommendation:** Supabase Realtime handles thousands of concurrent connections well for dashboard use cases. Scaling issues appear at 10K+ concurrent users, which is far beyond MVP.

---

## Build Order

### Phase 1: Database Foundation (Week 1)

```sql
-- Create tables in order
1. users (extends Supabase auth.users)
2. scrape_configs (what to scrape, how often)
3. raw_scrapes (raw scraped data)
4. signals (processed signals)
5. generated_emails (AI-generated outreach)

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE signals;
```

**Why first:** Everything depends on schema. Changes are painful later.

### Phase 2: Python Scraper Skeleton (Week 2)

```
1. Basic scraper service on Railway
2. Single source (start with news, easier than LinkedIn)
3. Direct write to raw_scrapes table
4. Manual run (no cron yet)
```

**Why second:** Validates data flow before adding complexity.

### Phase 3: AI Processing Pipeline (Week 2-3)

```
1. OpenAI/Anthropic integration
2. Extraction prompts (company, title, summary)
3. Classification prompts (signal_type, priority)
4. Write to signals table
```

**Why third:** Transforms raw data into value. Core differentiator.

### Phase 4: Real-time Dashboard (Week 3)

```
1. Supabase Realtime subscription in Next.js
2. Signal feed updates live
3. Stats update on new signals
4. Notifications for high-priority signals
```

**Why fourth:** Already have signals flowing in. Now show them.

### Phase 5: Automation & Hardening (Week 4)

```
1. Railway cron scheduling
2. Rate limiting implementation
3. Error handling & retries
4. Monitoring & alerts
5. LinkedIn scraping (harder, add last)
```

**Why fifth:** Automation after manual flow works. LinkedIn is hardest source.

### Phase 6: Email Generation (Week 5)

```
1. Email generation API route
2. Anthropic Claude for personalized outreach
3. Template system with tone options
4. Integration with signals table
```

**Why sixth:** Depends on signals being populated. Can be done in parallel with Phase 5.

---

## Anti-Patterns to Avoid

### 1. Scraping in API Routes

**Don't:**
```typescript
// /api/scrape/route.ts
export async function POST() {
  const data = await scrapeLinkedIn(); // 30+ seconds
  return Response.json(data);
}
```

**Why bad:** Vercel functions timeout at 10-60 seconds. Scraping is slow and unreliable.

**Do:** Separate scraping to Railway backend. Frontend only reads results.

### 2. Polling Instead of Realtime

**Don't:**
```typescript
useEffect(() => {
  const interval = setInterval(fetchSignals, 5000);
  return () => clearInterval(interval);
}, []);
```

**Why bad:** Wastes resources, poor UX (5s delay), doesn't scale.

**Do:** Use Supabase Realtime subscriptions for instant updates.

### 3. No Rate Limiting

**Don't:**
```python
for url in urls:
    scrape(url)  # As fast as possible
```

**Why bad:** Gets IP banned immediately. Wastes proxy costs.

**Do:** Always implement delays and respect rate limits.

### 4. Storing Raw HTML

**Don't:**
```python
supabase.table("raw_scrapes").insert({
    "content": response.text  # Full HTML
})
```

**Why bad:** Wastes storage, slow queries, expensive.

**Do:** Extract structured data before storing. Keep raw only for debugging/reprocessing.

### 5. Synchronous AI Processing

**Don't:**
```python
for scrape in raw_scrapes:
    signal = call_openai(scrape)  # One at a time
    insert_signal(signal)
```

**Why bad:** Slow, expensive (no batching), no parallelization.

**Do:** Batch AI calls where possible. Process asynchronously.

---

## Technology Recommendations

### Python Backend (Railway)

| Library | Purpose | Why |
|---------|---------|-----|
| `httpx` | HTTP client | Async support, modern API |
| `beautifulsoup4` | HTML parsing | Simple, well-documented |
| `supabase-py` | Supabase client | Official community library |
| `openai` | AI extraction | Official SDK |
| `anthropic` | AI generation | Official SDK |
| `python-dotenv` | Config | Environment variables |

**For LinkedIn specifically:** Consider `playwright` or a scraping API service (ScrapingBee, Apify) due to anti-bot complexity.

### Next.js Frontend (Vercel)

Already have `@supabase/ssr` and `@supabase/supabase-js`. Add:

| Library | Purpose |
|---------|---------|
| `@tanstack/react-query` | Server state management |
| `sonner` | Toast notifications |

### Infrastructure

| Service | Purpose | Cost |
|---------|---------|------|
| Railway | Python backend | ~$5-20/mo (usage-based) |
| Supabase | Database + Realtime | Free tier → $25/mo |
| Vercel | Next.js hosting | Free tier → $20/mo |
| Proxy service | IP rotation | ~$50-100/mo if LinkedIn |

---

## Sources

### Official Documentation (HIGH confidence)
- [Supabase Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [Railway Cron Jobs](https://docs.railway.com/reference/cron-jobs)

### Verified with Multiple Sources (MEDIUM confidence)
- [Microservices Web Scraping with Queue Workers](https://bernhardwenzel.com/articles/tutorial-build-a-message-driven-microservice-application/)
- [BullMQ Rate Limiting Architecture](https://docs.bullmq.io/bullmq-pro/groups/rate-limiting)
- [Web Scraping Rate Limit Strategies](https://scrape.do/blog/web-scraping-rate-limit/)

### Industry Patterns (MEDIUM confidence)
- [State of Web Scraping 2026](https://www.browserless.io/blog/state-of-web-scraping-2026)
- [LinkedIn Scraping Best Practices](https://scrapfly.io/blog/posts/how-to-scrape-linkedin)
- [Cloud Scraping Architecture Patterns](https://litport.net/blog/cloud-scraping-architecture-building-scalable-web-data-extraction-systems-16543)

### Sales Intelligence Domain (MEDIUM confidence)
- [SalesIntel Signal-First Platform](https://salesintel.io/)
- [Data Engineering Trends 2026](https://www.trigyn.com/insights/data-engineering-trends-2026-building-foundation-ai-driven-enterprises)
- [Revenue Intelligence Platforms](https://pipeline.zoominfo.com/sales/revenue-intelligence-platforms)
