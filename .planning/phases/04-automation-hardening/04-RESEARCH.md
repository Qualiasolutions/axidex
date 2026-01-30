# Phase 4: Automation & Hardening - Research

**Researched:** 2026-01-30
**Domain:** Web Scraping (LinkedIn Jobs), Email Notifications, User Preferences
**Confidence:** MEDIUM (legal landscape evolving, technical patterns well-established)

## Summary

Phase 4 requires three interconnected capabilities: (1) LinkedIn Jobs scraping with proxy rotation, (2) user notification preferences UI, and (3) email notifications for high-priority signals. The research reveals a critical legal constraint: Proxycurl was shut down in July 2026 after LinkedIn's lawsuit, making Bright Data the only scraping provider with documented court victories (Meta, X in 2024). The existing worker infrastructure uses httpx + selectolax and already supports Bright Data proxies via `proxy_url` configuration.

For notifications, the standard pattern is Supabase Database Webhooks triggering Edge Functions, which call Resend (email provider) with React Email templates. This is event-driven: when a high-priority signal is inserted, a webhook fires, the Edge Function evaluates user preferences, and sends email if criteria match.

**Primary recommendation:** Use Bright Data residential proxies for LinkedIn Jobs (public data only, no login), Resend + React Email for transactional notifications, and a `notification_preferences` JSONB column on the profiles table for settings storage.

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| brightdata-sdk | latest | LinkedIn scraping API | Only provider with U.S. court victories; Proxycurl shut down |
| httpx | 0.27+ | Async HTTP with proxy | Already in worker; native proxy auth support |
| resend | 3.x | Transactional email API | First-class Next.js support, React Email integration |
| @react-email/components | latest | Email templates | Build emails with React, auto-converts to HTML |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-email | latest (dev) | Email preview server | Development only - preview templates in browser |
| tenacity | 8.x | Retry with backoff | Proxy rotation on failures |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Resend | Mailtrap | Mailtrap announced Supabase integration Jan 2026; Resend has better React Email integration |
| brightdata-sdk | Direct proxy URL | SDK handles polling, retries; raw proxy requires manual management |
| Database Webhooks | Polling cron | Webhooks are instant; polling adds latency |

**Installation (Worker):**
```bash
pip install brightdata-sdk tenacity
```

**Installation (Next.js):**
```bash
npm install resend @react-email/components
npm install react-email -D
```

## Architecture Patterns

### Notification Flow
```
[Signal INSERT]
    -> [Database Webhook (pg_net)]
    -> [Edge Function: check-notification]
    -> [Evaluate user preferences]
    -> [If match: Resend API]
    -> [Email delivered]
```

### LinkedIn Scraping Flow
```
[Scheduled job (Railway cron)]
    -> [Bright Data SDK: scrape LinkedIn Jobs]
    -> [Parse with selectolax]
    -> [Dedup check (hash + vector)]
    -> [Store signal]
    -> [Webhook triggers notification check]
```

### Recommended Project Structure
```
worker/src/
├── scrapers/
│   └── linkedin.py       # NEW: Bright Data LinkedIn scraper
├── config.py             # Add Bright Data API token
└── main.py               # Add linkedin scraper to schedule

src/
├── app/
│   └── dashboard/
│       └── settings/
│           └── page.tsx  # NEW: Settings page with notification prefs
├── components/
│   └── emails/
│       └── signal-alert.tsx  # NEW: React Email template
└── app/api/
    └── send/
        └── route.ts      # NEW: Resend API route

supabase/
├── functions/
│   └── check-notification/  # NEW: Edge Function
└── migrations/
    └── 004_notification_prefs.sql  # NEW: Add prefs column
```

### Pattern 1: Bright Data SDK Async Scraping

**What:** Use Bright Data's Python SDK for LinkedIn Jobs scraping with automatic retry and anti-detection.

**When to use:** Any LinkedIn data collection (public data only, no login).

**Example:**
```python
# Source: https://github.com/brightdata/sdk-python
import asyncio
from brightdata_sdk import BrightDataClient

async def scrape_linkedin_jobs(company: str) -> list[dict]:
    """Scrape public LinkedIn job listings for a company."""
    async with BrightDataClient() as client:
        # Use LinkedIn-specific scraper
        result = await client.scrape.linkedin.jobs(
            query=f'"{company}" hiring',
            location="United States",
            limit=25
        )
        return result.data.get("jobs", [])

# Batch multiple companies
async def scrape_all_companies(companies: list[str]):
    tasks = [scrape_linkedin_jobs(c) for c in companies]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return results
```

### Pattern 2: HTTPX Proxy Rotation with Retry

**What:** Fallback pattern if SDK unavailable; use httpx with rotating residential proxies.

**When to use:** Direct scraping with proxy authentication.

**Example:**
```python
# Source: https://www.python-httpx.org/advanced/proxies/
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential
from src.config import get_settings

@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=1, max=10))
async def fetch_with_proxy(url: str) -> str:
    """Fetch URL through Bright Data residential proxy."""
    settings = get_settings()

    # Proxy URL format: http://user:pass@brd.superproxy.io:22225
    # Bright Data handles rotation automatically per-request
    async with httpx.AsyncClient(
        proxy=settings.proxy_url,
        timeout=30.0,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
    ) as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.text
```

### Pattern 3: Supabase Database Webhook for Notifications

**What:** Trigger Edge Function when high-priority signal is inserted.

**When to use:** Event-driven notifications without polling.

**Example (SQL):**
```sql
-- Source: https://supabase.com/docs/guides/database/webhooks
-- Create webhook via Dashboard or SQL

-- The webhook calls: POST /functions/v1/check-notification
-- Payload includes: type, table, schema, record, old_record

-- Edge Function receives:
-- {
--   "type": "INSERT",
--   "table": "signals",
--   "record": { "id": "...", "priority": "high", "user_id": "...", ... }
-- }
```

### Pattern 4: Resend with React Email

**What:** Send transactional emails using React components as templates.

**When to use:** Any user-facing email notifications.

**Example:**
```typescript
// Source: https://resend.com/docs/send-with-nextjs
// src/components/emails/signal-alert.tsx
import { Html, Head, Body, Container, Text, Link, Button } from '@react-email/components';

interface SignalAlertProps {
  userName: string;
  companyName: string;
  signalType: string;
  signalTitle: string;
  dashboardUrl: string;
}

export function SignalAlertEmail({ userName, companyName, signalType, signalTitle, dashboardUrl }: SignalAlertProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9fafb' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Text style={{ fontSize: '18px', fontWeight: '600' }}>
            New High-Priority Signal: {companyName}
          </Text>
          <Text style={{ color: '#6b7280' }}>
            Hi {userName}, a new {signalType} signal was detected:
          </Text>
          <Text style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            {signalTitle}
          </Text>
          <Button href={dashboardUrl} style={{ backgroundColor: '#ea580c', color: '#fff', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none' }}>
            View in Dashboard
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
```

```typescript
// src/app/api/send-notification/route.ts
import { Resend } from 'resend';
import { SignalAlertEmail } from '@/components/emails/signal-alert';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { email, userName, signal } = await request.json();

  const { data, error } = await resend.emails.send({
    from: 'Axidex <notifications@axidex.com>',
    to: [email],
    subject: `New Signal: ${signal.company_name} is ${signal.signal_type}`,
    react: SignalAlertEmail({
      userName,
      companyName: signal.company_name,
      signalType: signal.signal_type,
      signalTitle: signal.title,
      dashboardUrl: `https://axidex.vercel.app/dashboard/signals/${signal.id}`
    }),
  });

  if (error) {
    return Response.json({ error }, { status: 500 });
  }
  return Response.json({ success: true, id: data?.id });
}
```

### Pattern 5: Notification Preferences Schema

**What:** JSONB column for flexible notification settings.

**When to use:** User-configurable notification preferences.

**Example:**
```sql
-- Migration: 004_notification_prefs.sql
ALTER TABLE profiles
ADD COLUMN notification_preferences JSONB DEFAULT '{
  "email_enabled": true,
  "signal_types": ["hiring", "funding", "expansion", "partnership", "product_launch", "leadership_change"],
  "priority_threshold": "high",
  "digest_mode": "instant"
}'::jsonb;

-- Query example: Check if user wants notification
SELECT
  p.email,
  p.full_name,
  p.notification_preferences
FROM profiles p
WHERE p.id = $1
  AND (p.notification_preferences->>'email_enabled')::boolean = true
  AND p.notification_preferences->'signal_types' ? $2  -- signal type
  AND (
    p.notification_preferences->>'priority_threshold' = 'low'
    OR (p.notification_preferences->>'priority_threshold' = 'medium' AND $3 IN ('medium', 'high'))
    OR (p.notification_preferences->>'priority_threshold' = 'high' AND $3 = 'high')
  );
```

### Anti-Patterns to Avoid

- **Scraping LinkedIn with logged-in sessions:** Violates ToS, risk of account ban and legal action. Always use public data only.
- **Polling for new signals:** Database webhooks are instant and more efficient.
- **Storing notification prefs in separate table rows:** JSONB column is simpler for single-user settings; separate table only needed for multi-tenant teams.
- **Sending emails synchronously in API routes:** Use Edge Functions or background jobs; don't block user requests.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| LinkedIn scraping | Custom scraper with raw proxies | Bright Data SDK | Handles anti-bot, CAPTCHA, retries automatically |
| Email HTML rendering | Manual HTML strings | React Email | Cross-client compatibility, responsive, dark mode |
| Transactional email | Raw SMTP or Supabase built-in | Resend | Supabase limits to 2/hour; Resend is purpose-built |
| Proxy rotation | Manual IP pool management | Bright Data residential | They handle rotation, fingerprinting, retry logic |
| Notification triggers | Polling with cron | Database Webhooks | Instant, no wasted queries |

**Key insight:** Web scraping and email delivery have too many edge cases (anti-bot, email client quirks, deliverability) to build reliably. Use specialized services.

## Common Pitfalls

### Pitfall 1: LinkedIn Rate Limiting

**What goes wrong:** Scraping too fast gets IP banned or triggers CAPTCHA.
**Why it happens:** LinkedIn actively detects automated access patterns.
**How to avoid:**
- Use Bright Data residential proxies (automatic rotation)
- Add random delays between requests (2-5s)
- Limit to 25-50 jobs per company per run
- Respect robots.txt for public pages
**Warning signs:** HTTP 429, CAPTCHA pages, empty results when data should exist.

### Pitfall 2: Email Deliverability to Spam

**What goes wrong:** Notification emails land in spam folder.
**Why it happens:** New domain without reputation, missing DNS records.
**How to avoid:**
- Verify domain in Resend (SPF, DKIM, DMARC records)
- Start with low volume, build reputation
- Use clear subject lines, avoid spam triggers
- Include unsubscribe link (required by law)
**Warning signs:** Low open rates, user complaints about missing emails.

### Pitfall 3: Database Webhook Not Firing

**What goes wrong:** Signal inserted but Edge Function never runs.
**Why it happens:** pg_net async worker not enabled, webhook misconfigured.
**How to avoid:**
- Verify pg_net extension is enabled in Supabase project
- Check webhook logs in Dashboard > Database > Webhooks
- Ensure Edge Function is deployed and accessible
- Add auth header with service role key in webhook config
**Warning signs:** Entries in `supabase_functions.hooks` but no function logs.

### Pitfall 4: Notification Preference Defaults

**What goes wrong:** Users don't receive notifications because preferences are null.
**Why it happens:** Migration adds column but existing users have no default.
**How to avoid:**
- Migration must include DEFAULT value
- Query should use COALESCE for existing null values
- UI should show defaults if preference not set
**Warning signs:** New users get notifications, existing users don't.

### Pitfall 5: Legal Compliance for LinkedIn

**What goes wrong:** Cease and desist letter, legal action.
**Why it happens:** Scraping private data, violating ToS at scale.
**How to avoid:**
- Only scrape publicly visible data (no login required)
- Use Bright Data (documented legal victories)
- Consult legal counsel before commercial use
- Document data sources and collection methods
**Warning signs:** LinkedIn account flags, legal notices, Bright Data account suspension.

## Code Examples

### Edge Function: Check Notification

```typescript
// supabase/functions/check-notification/index.ts
// Source: https://supabase.com/docs/guides/functions
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

serve(async (req) => {
  const payload = await req.json();

  // Only process INSERT events on signals table
  if (payload.type !== "INSERT" || payload.table !== "signals") {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  const signal = payload.record;

  // Only notify for high priority
  if (signal.priority !== "high") {
    return new Response(JSON.stringify({ skipped: "not high priority" }), { status: 200 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get user preferences
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, notification_preferences")
    .eq("id", signal.user_id)
    .single();

  if (!profile) {
    return new Response(JSON.stringify({ error: "user not found" }), { status: 404 });
  }

  const prefs = profile.notification_preferences || {};

  // Check if user wants this notification
  if (!prefs.email_enabled) {
    return new Response(JSON.stringify({ skipped: "email disabled" }), { status: 200 });
  }

  if (prefs.signal_types && !prefs.signal_types.includes(signal.signal_type)) {
    return new Response(JSON.stringify({ skipped: "signal type not in preferences" }), { status: 200 });
  }

  // Send via internal API route (Resend)
  const response = await fetch("https://axidex.vercel.app/api/send-notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("INTERNAL_API_KEY")}`
    },
    body: JSON.stringify({
      email: profile.email,
      userName: profile.full_name || profile.email,
      signal
    })
  });

  return new Response(JSON.stringify({ sent: true }), { status: 200 });
});
```

### Settings Page Component

```typescript
// src/app/dashboard/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const SIGNAL_TYPES = [
  { id: "hiring", label: "Hiring" },
  { id: "funding", label: "Funding" },
  { id: "expansion", label: "Expansion" },
  { id: "partnership", label: "Partnership" },
  { id: "product_launch", label: "Product Launch" },
  { id: "leadership_change", label: "Leadership Change" },
];

const PRIORITY_OPTIONS = [
  { id: "high", label: "High priority only" },
  { id: "medium", label: "Medium and high" },
  { id: "low", label: "All signals" },
];

export default function SettingsPage() {
  const [prefs, setPrefs] = useState({
    email_enabled: true,
    signal_types: SIGNAL_TYPES.map(t => t.id),
    priority_threshold: "high",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("notification_preferences")
        .eq("id", user.id)
        .single();
      if (data?.notification_preferences) {
        setPrefs(data.notification_preferences);
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("profiles")
      .update({ notification_preferences: prefs })
      .eq("id", user.id);
    setSaving(false);
  };

  return (
    <main className="p-6 lg:p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Notification Settings</h1>

      {/* Email toggle */}
      <div className="bg-white border rounded-lg p-6">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={prefs.email_enabled}
            onChange={(e) => setPrefs({ ...prefs, email_enabled: e.target.checked })}
            className="w-4 h-4"
          />
          <span>Email notifications enabled</span>
        </label>
      </div>

      {/* Priority threshold */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="font-medium mb-4">Notify me for</h2>
        {PRIORITY_OPTIONS.map((opt) => (
          <label key={opt.id} className="flex items-center gap-3 mb-2">
            <input
              type="radio"
              name="priority"
              checked={prefs.priority_threshold === opt.id}
              onChange={() => setPrefs({ ...prefs, priority_threshold: opt.id })}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Signal types */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="font-medium mb-4">Signal types</h2>
        {SIGNAL_TYPES.map((type) => (
          <label key={type.id} className="flex items-center gap-3 mb-2">
            <input
              type="checkbox"
              checked={prefs.signal_types.includes(type.id)}
              onChange={(e) => {
                const types = e.target.checked
                  ? [...prefs.signal_types, type.id]
                  : prefs.signal_types.filter(t => t !== type.id);
                setPrefs({ ...prefs, signal_types: types });
              }}
            />
            <span>{type.label}</span>
          </label>
        ))}
      </div>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save preferences"}
      </Button>
    </main>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Proxycurl for LinkedIn | Bright Data SDK | July 2026 (Proxycurl shutdown) | Must migrate or use compliant provider |
| SendGrid/Mailgun | Resend + React Email | 2024-2025 | Better DX, React-native templates |
| Polling for notifications | Database Webhooks | Supabase pg_net | Instant, event-driven |
| Separate settings table | JSONB column | PostgreSQL 9.4+ | Simpler for single-user prefs |

**Deprecated/outdated:**
- **Proxycurl:** Shut down July 2026 after LinkedIn lawsuit. Do not use.
- **Supabase built-in email:** Limited to 2 emails/hour. Only for auth emails.
- **HTML email strings:** Use React Email for maintainability.

## Open Questions

1. **Bright Data pricing for LinkedIn**
   - What we know: Free trial + matched deposit up to $500
   - What's unclear: Per-request cost for LinkedIn Jobs specifically
   - Recommendation: Start with trial, monitor costs, set budget caps

2. **Email domain verification timeline**
   - What we know: Resend requires DNS verification for custom domain
   - What's unclear: How long verification takes, fallback while pending
   - Recommendation: Use `onboarding@resend.dev` for development, verify production domain early

3. **LinkedIn public vs private data boundary**
   - What we know: hiQ Labs precedent allows public data scraping
   - What's unclear: Exact definition of "public" for job listings (varies by page)
   - Recommendation: Only scrape data visible without login, consult legal for commercial use

## Sources

### Primary (HIGH confidence)
- [HTTPX Proxy Documentation](https://www.python-httpx.org/advanced/proxies/) - Proxy configuration patterns
- [Supabase Database Webhooks](https://supabase.com/docs/guides/database/webhooks) - Webhook setup and payload format
- [Resend Next.js Documentation](https://resend.com/docs/send-with-nextjs) - Email integration patterns

### Secondary (MEDIUM confidence)
- [Bright Data Python SDK](https://github.com/brightdata/sdk-python) - SDK patterns (verified with GitHub README)
- [Bright Data Proxycurl Alternatives](https://brightdata.com/blog/web-data/proxycurl-alternatives) - Legal status, Proxycurl shutdown confirmed
- [React Email Documentation](https://react.email) - Template components

### Tertiary (LOW confidence)
- [WebSearch: LinkedIn scraping legality 2026](https://www.scrapingdog.com/blog/linkedin-web-scraping/) - Legal opinions (consult actual lawyer)
- [WebSearch: Notification preferences schema](https://basila.medium.com/designing-a-user-settings-database-table-e8084fcd1f67) - Design patterns (community blog)

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - Bright Data SDK is new, Resend well-documented
- Architecture: HIGH - Database webhooks and React Email are established patterns
- Pitfalls: MEDIUM - LinkedIn legal landscape evolving, technical pitfalls well-known

**Research date:** 2026-01-30
**Valid until:** 2026-02-14 (14 days - LinkedIn legal situation is evolving)
