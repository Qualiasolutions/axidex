# Codebase Structure

**Analysis Date:** 2026-01-30

## Directory Layout

```
axidex/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard route group
│   │   │   ├── signals/        # Signals page
│   │   │   ├── layout.tsx      # Dashboard layout with sidebar
│   │   │   └── page.tsx        # Dashboard overview
│   │   ├── globals.css         # Design system CSS variables
│   │   ├── layout.tsx          # Root layout (fonts, analytics)
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── landing/            # Landing page sections
│   │   ├── layout/             # Shared layout components
│   │   ├── signals/            # Signal-related components
│   │   └── ui/                 # Base UI primitives
│   ├── lib/
│   │   ├── supabase/           # Supabase client setup
│   │   └── utils.ts            # Utility functions
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── public/                     # Static assets
├── docs/                       # Project documentation
├── .planning/                  # GSD workflow files
│   └── codebase/               # Codebase analysis docs
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── eslint.config.mjs           # ESLint config
└── postcss.config.mjs          # PostCSS/Tailwind config
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router pages and layouts
- Contains: page.tsx, layout.tsx files organized by route
- Key files: `layout.tsx` (root), `globals.css` (design tokens), `page.tsx` (landing)

**`src/app/dashboard/`:**
- Purpose: Authenticated app area
- Contains: Dashboard pages (overview, signals)
- Key files: `layout.tsx` (sidebar wrapper), `page.tsx` (overview), `signals/page.tsx`

**`src/components/ui/`:**
- Purpose: Reusable UI primitives
- Contains: Button, Badge, Input, Motion wrappers
- Key files: `button.tsx` (cva variants), `badge.tsx` (with signal-specific badges), `motion.tsx` (animation helpers)

**`src/components/layout/`:**
- Purpose: Shared layout components for dashboard
- Contains: Sidebar, Header
- Key files: `sidebar.tsx` (collapsible nav), `header.tsx` (page header with search)

**`src/components/landing/`:**
- Purpose: Landing page sections
- Contains: Hero, Features, Testimonial, Changelog, Header, Footer
- Key files: `hero.tsx` (main CTA), `header.tsx` (landing nav), `features.tsx` (feature grid)

**`src/components/dashboard/`:**
- Purpose: Dashboard-specific UI
- Contains: StatsCard
- Key files: `stats-card.tsx` (metric display)

**`src/components/signals/`:**
- Purpose: Signal-related UI
- Contains: SignalCard
- Key files: `signal-card.tsx` (signal display with badges and actions)

**`src/lib/supabase/`:**
- Purpose: Supabase client initialization
- Contains: Browser and server client factories
- Key files: `client.ts` (browser), `server.ts` (server with cookies)

**`src/lib/`:**
- Purpose: Shared utilities
- Contains: utils.ts
- Key files: `utils.ts` (cn() class merger, date formatters)

**`src/types/`:**
- Purpose: TypeScript type definitions
- Contains: Domain interfaces
- Key files: `index.ts` (Signal, User, Email, Filter, Stats types)

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout (fonts, HTML shell)
- `src/app/page.tsx`: Landing page
- `src/app/dashboard/page.tsx`: Dashboard overview

**Configuration:**
- `next.config.ts`: Image domains
- `tsconfig.json`: TypeScript paths (@/ alias)
- `src/app/globals.css`: CSS variables, design tokens
- `.env.example`: Required environment variables

**Core Logic:**
- `src/types/index.ts`: All domain types
- `src/lib/supabase/server.ts`: Server-side data access
- `src/lib/supabase/client.ts`: Client-side data access
- `src/lib/utils.ts`: Shared utilities

**Testing:**
- No test files present (testing not yet set up)

## Naming Conventions

**Files:**
- Components: `kebab-case.tsx` (e.g., `signal-card.tsx`, `stats-card.tsx`)
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)
- Types: `index.ts` (barrel export)
- Utilities: `kebab-case.ts`

**Directories:**
- Lowercase, hyphenated if multi-word
- Component folders named by domain: `ui`, `landing`, `dashboard`, `signals`, `layout`

**Components:**
- PascalCase function names: `SignalCard`, `StatsCard`, `Header`
- Named exports (not default) for non-page components

**Types:**
- PascalCase interfaces: `Signal`, `GeneratedEmail`, `DashboardStats`
- Discriminated unions for signal types: `SignalType`, `SignalPriority`, `SignalStatus`

## Where to Add New Code

**New Feature (e.g., Emails):**
- Primary code: `src/app/dashboard/emails/page.tsx`
- Components: `src/components/emails/email-card.tsx`
- Types: Add to `src/types/index.ts`

**New Dashboard Page:**
- Implementation: `src/app/dashboard/{feature}/page.tsx`
- Uses: `<Header />` from `src/components/layout/header.tsx`
- Pattern: `"use client"` directive, motion animations

**New UI Component:**
- Implementation: `src/components/ui/{component}.tsx`
- Pattern: Use `cn()` from `@/lib/utils`, accept `className` prop
- Variants: Use `cva` from class-variance-authority

**New Landing Section:**
- Implementation: `src/components/landing/{section}.tsx`
- Add to: `src/app/page.tsx` in order

**New API Route:**
- Implementation: `src/app/api/{route}/route.ts`
- Pattern: Export GET, POST, etc. functions

**New Utility:**
- Implementation: Add to `src/lib/utils.ts` or create `src/lib/{utility}.ts`

**New Types:**
- Implementation: Add to `src/types/index.ts`

## Special Directories

**`.next/`:**
- Purpose: Next.js build output
- Generated: Yes
- Committed: No (in .gitignore)

**`node_modules/`:**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No (in .gitignore)

**`.planning/`:**
- Purpose: GSD workflow documentation
- Generated: By Claude Code
- Committed: Optional (typically yes)

**`public/`:**
- Purpose: Static assets served at root
- Generated: No
- Committed: Yes

**`.vercel/`:**
- Purpose: Vercel deployment config
- Generated: By Vercel CLI
- Committed: No (in .gitignore)

**`docs/`:**
- Purpose: Project documentation
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-01-30*
