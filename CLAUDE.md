# CLAUDE.md - Axidex

## Project Overview

**Axidex** is a signal intelligence platform for sales teams. It detects buying signals (hiring, funding, expansion, etc.) and generates AI-powered outreach emails.

**Live:** https://axidex.vercel.app
**Repo:** https://github.com/Qualiasolutions/axidex

## Current State

### Completed
- Landing page with premium minimalist design
- Dashboard shell with collapsible sidebar
- Signals page with filters and empty states
- Component library: Button, Badge, StatsCard, SignalCard
- Design system: light theme, warm orange accent (#ea580c)
- Supabase client setup (browser + server)
- TypeScript types for Signal, User, Email, DashboardStats
- Vercel deployment with auto-deploy on push

### Not Yet Built
- Supabase database tables and RLS policies
- Authentication flow
- Signal ingestion (API routes, webhooks)
- AI email generation (OpenAI/Anthropic integration)
- Real data fetching (currently showing empty states)

## Tech Stack

```
Next.js 16.1.6 + React 19
Tailwind CSS 4
Motion (Framer Motion)
Supabase (auth + database)
Vercel (hosting)
```

## Key Files

| File | Purpose |
|------|---------|
| `src/app/globals.css` | Design system CSS variables |
| `src/types/index.ts` | TypeScript interfaces |
| `src/lib/supabase/` | Supabase client setup |
| `src/components/ui/` | Reusable UI components |

## Design Principles

1. **Premium minimalist** - White backgrounds, subtle borders
2. **Typography over icons** - Text-based navigation, minimal iconography
3. **Warm accent** - Orange (#ea580c) for CTAs and highlights
4. **Subtle animations** - Fade-in, stagger effects via Motion

## Patterns to Follow

### Components
- Use `"use client"` directive for interactive components
- Use CSS variables: `var(--accent)`, `var(--text-primary)`, etc.
- Use `cn()` from `@/lib/utils` for class merging
- Accept `className` prop for extension

### Pages
- Import `Header` component at top
- Wrap content in `<main className="p-6 lg:p-8 space-y-6">`
- Use Motion for entrance animations

### Data Fetching
- Server components: `import { createClient } from "@/lib/supabase/server"`
- Client components: `import { createClient } from "@/lib/supabase/client"`

## Next Steps

1. Create Supabase tables: `signals`, `generated_emails`, `users`
2. Add RLS policies
3. Build authentication (Supabase Auth)
4. Create API routes for signal ingestion
5. Integrate OpenAI for signal extraction
6. Integrate Anthropic for email generation
