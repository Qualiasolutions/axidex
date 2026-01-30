# External Integrations

**Analysis Date:** 2026-01-30

## APIs & External Services

**AI/ML Services (Planned - Not Yet Implemented):**
- OpenAI - Signal extraction from content
  - SDK/Client: Not yet implemented
  - Auth: `OPENAI_API_KEY`
- Anthropic - Email generation
  - SDK/Client: Not yet implemented
  - Auth: `ANTHROPIC_API_KEY`

**Note:** OpenAI and Anthropic integrations are defined in `.env.example` but no implementation exists yet in the codebase.

## Data Storage

**Databases:**
- Supabase (PostgreSQL)
  - Connection: `NEXT_PUBLIC_SUPABASE_URL`
  - Auth Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Browser Client: `@supabase/ssr` via `createBrowserClient()`
  - Server Client: `@supabase/ssr` via `createServerClient()`

**Client Locations:**
- Browser client: `src/lib/supabase/client.ts`
- Server client: `src/lib/supabase/server.ts`

**Current State:**
- Client setup complete
- No database tables created yet
- No RLS policies defined
- No migrations present

**Planned Tables (from `src/types/index.ts`):**
- `signals` - Buying signal records
- `generated_emails` - AI-generated outreach emails
- `users` - User profiles

**File Storage:**
- None configured

**Caching:**
- None configured

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (planned)
  - Implementation: Not yet built
  - Server client configured with cookie handling for SSR auth

**Current State:**
- Supabase client supports auth via cookies
- No auth UI components
- No protected routes
- No session management

## Analytics & Monitoring

**Analytics:**
- Vercel Analytics
  - Package: `@vercel/analytics` 1.6.1
  - Integration: `<Analytics />` component in `src/app/layout.tsx`
  - Auto-tracks page views

**Error Tracking:**
- None configured

**Logging:**
- Console only (no structured logging)

## CI/CD & Deployment

**Hosting:**
- Vercel
  - Live URL: https://axidex.vercel.app
  - Project config: `.vercel/project.json`
  - Auto-deploy on push

**CI Pipeline:**
- GitHub + Vercel integration
- No separate CI configuration (relies on Vercel build)

## External Images

**Remote Image Sources:**
- `images.unsplash.com` (configured in `next.config.ts`)

## Environment Configuration

**Required env vars for current functionality:**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

**Required for future features:**
- `OPENAI_API_KEY` - OpenAI API for signal extraction
- `ANTHROPIC_API_KEY` - Anthropic API for email generation

**Secrets location:**
- Local: `.env.local` (gitignored)
- Production: Vercel Environment Variables dashboard

## Webhooks & Callbacks

**Incoming:**
- None configured

**Outgoing:**
- None configured

## Third-Party SDKs Summary

| Service | Package | Version | Status |
|---------|---------|---------|--------|
| Supabase | `@supabase/ssr` | 0.8.0 | Configured |
| Supabase | `@supabase/supabase-js` | 2.93.3 | Configured |
| Vercel Analytics | `@vercel/analytics` | 1.6.1 | Active |
| OpenAI | - | - | Planned |
| Anthropic | - | - | Planned |

## Integration Patterns

**Supabase Browser Client:**
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Supabase Server Client:**
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) { /* ... */ },
      },
    }
  );
}
```

---

*Integration audit: 2026-01-30*
