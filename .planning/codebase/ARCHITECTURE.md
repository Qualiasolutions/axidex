# Architecture

**Analysis Date:** 2026-01-30

## Pattern Overview

**Overall:** Next.js App Router with Component-Based UI Architecture

**Key Characteristics:**
- Server-first rendering with selective client components
- Route-based layouts with nested structure (landing vs dashboard)
- Presentational components with no business logic (early stage)
- CSS variables design system with Tailwind for styling
- Supabase prepared but not yet integrated with data

## Layers

**Presentation Layer:**
- Purpose: Renders UI and handles user interactions
- Location: `src/components/`
- Contains: React components organized by domain (ui, layout, landing, dashboard, signals)
- Depends on: Types, Utils, Supabase clients
- Used by: App router pages

**Page Layer:**
- Purpose: Route handlers and page composition
- Location: `src/app/`
- Contains: Pages, layouts, and route groups
- Depends on: Components, Layouts
- Used by: Next.js router

**Data Access Layer:**
- Purpose: Database connectivity (prepared, not active)
- Location: `src/lib/supabase/`
- Contains: Browser and server Supabase clients
- Depends on: Environment variables
- Used by: Pages (future), Components (future)

**Types Layer:**
- Purpose: TypeScript interfaces for domain models
- Location: `src/types/`
- Contains: Signal, User, Email, Filter, Stats types
- Depends on: Nothing
- Used by: All layers

**Utilities Layer:**
- Purpose: Shared helper functions
- Location: `src/lib/utils.ts`
- Contains: cn() class merger, date formatters
- Depends on: clsx, tailwind-merge
- Used by: All components

## Data Flow

**Current State (No Backend):**

1. Page renders with static/hardcoded data
2. Components display empty states or placeholder values
3. User interactions trigger client-side navigation only

**Planned State (With Supabase):**

1. Server component fetches signals via `createClient()` from `src/lib/supabase/server.ts`
2. Data passed to presentational components as props
3. Client components use `src/lib/supabase/client.ts` for mutations
4. Real-time subscriptions for live signal updates

**State Management:**
- No global state management library
- Local component state via `useState` for UI toggles (sidebar collapse, mobile menu)
- URL state for routing
- Future: Supabase real-time for server state

## Key Abstractions

**Signal:**
- Purpose: Core domain entity representing a buying signal
- Examples: `src/types/index.ts`, `src/components/signals/signal-card.tsx`
- Pattern: TypeScript interface with strict typing for signal_type, priority, status

**Layout:**
- Purpose: Page structure and navigation shell
- Examples: `src/app/layout.tsx`, `src/app/dashboard/layout.tsx`
- Pattern: Nested layouts with shared headers/sidebars

**UI Components:**
- Purpose: Reusable, styled building blocks
- Examples: `src/components/ui/button.tsx`, `src/components/ui/badge.tsx`
- Pattern: Variant-based styling via class-variance-authority (cva)

**Motion Wrappers:**
- Purpose: Consistent animation patterns
- Examples: `src/components/ui/motion.tsx`
- Pattern: FadeIn, Stagger, HoverScale composable animation components

## Entry Points

**Root Layout (`src/app/layout.tsx`):**
- Location: `src/app/layout.tsx`
- Triggers: Every page load
- Responsibilities: Font loading, global CSS, Vercel Analytics, HTML structure

**Landing Page (`src/app/page.tsx`):**
- Location: `src/app/page.tsx`
- Triggers: Visit to `/`
- Responsibilities: Marketing landing page composition

**Dashboard Layout (`src/app/dashboard/layout.tsx`):**
- Location: `src/app/dashboard/layout.tsx`
- Triggers: Any `/dashboard/*` route
- Responsibilities: Sidebar shell, authenticated layout wrapper

**Dashboard Page (`src/app/dashboard/page.tsx`):**
- Location: `src/app/dashboard/page.tsx`
- Triggers: Visit to `/dashboard`
- Responsibilities: Overview stats, recent signals, quick actions

**Signals Page (`src/app/dashboard/signals/page.tsx`):**
- Location: `src/app/dashboard/signals/page.tsx`
- Triggers: Visit to `/dashboard/signals`
- Responsibilities: Signal list with filters, empty state

## Error Handling

**Strategy:** Minimal (early stage)

**Patterns:**
- Silent catch in server Supabase client for cookie setting in Server Components
- No error boundaries implemented
- No API error handling (no API routes yet)

## Cross-Cutting Concerns

**Logging:** None implemented (use console for dev)

**Validation:** TypeScript compile-time only (no runtime validation)

**Authentication:** Not implemented (Supabase Auth prepared but not integrated)

**Styling:**
- Design system via CSS variables in `src/app/globals.css`
- Tailwind CSS v4 with custom theme
- Orange accent (#ea580c) throughout

**Animation:**
- Motion (Framer Motion) for page transitions and micro-interactions
- Consistent fade-in patterns via motion.tsx helpers

---

*Architecture analysis: 2026-01-30*
