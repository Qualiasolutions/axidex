# Coding Conventions

**Analysis Date:** 2026-01-30

## Naming Patterns

**Files:**
- Components: `kebab-case.tsx` (e.g., `signal-card.tsx`, `stats-card.tsx`)
- Utilities: `kebab-case.ts` (e.g., `utils.ts`, `client.ts`, `server.ts`)
- Types: `index.ts` in dedicated `types/` folder
- Pages: `page.tsx` (Next.js App Router convention)
- Layouts: `layout.tsx` (Next.js App Router convention)

**Functions:**
- camelCase for all functions (e.g., `formatDate`, `formatRelativeTime`, `createClient`)
- Named exports preferred over default exports for utilities
- Default exports for React components and pages

**Variables:**
- camelCase for all variables (e.g., `signalFilters`, `bottomNavigation`)
- UPPER_SNAKE_CASE not observed (constants use camelCase)

**Types:**
- PascalCase for interfaces and types (e.g., `Signal`, `SignalType`, `BadgeProps`)
- Prefix with purpose: `*Props` for component props (e.g., `HeaderProps`, `StatsCardProps`)
- Union types for constrained strings (e.g., `SignalType`, `SignalPriority`)

## Code Style

**Formatting:**
- No Prettier config detected - using ESLint defaults
- 2-space indentation (inferred from files)
- Double quotes for JSX attributes
- Single quotes for string imports

**Linting:**
- ESLint 9 with Next.js config
- Config file: `eslint.config.mjs`
- Extends: `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`
- Run command: `npm run lint`

**TypeScript:**
- Strict mode enabled (`"strict": true` in `tsconfig.json`)
- Target: ES2017
- Module resolution: bundler
- Path alias: `@/*` maps to `./src/*`

## Import Organization

**Order:**
1. React/framework imports (`"use client"` directive first when present)
2. Third-party packages (e.g., `motion/react`, `lucide-react`, `next/link`)
3. Internal aliases (`@/components/*`, `@/lib/*`, `@/types`)
4. Relative imports (used sparingly)

**Path Aliases:**
- `@/*` - Maps to `src/*` (configured in `tsconfig.json`)
- Example: `import { cn } from "@/lib/utils"`
- Example: `import type { Signal } from "@/types"`

## Error Handling

**Patterns:**
- Try-catch blocks for async operations (see `src/lib/supabase/server.ts`)
- Silent failures for non-critical operations (e.g., cookie setting in server components)
- No global error boundary detected

**Example from `src/lib/supabase/server.ts`:**
```typescript
try {
  cookiesToSet.forEach(({ name, value, options }) =>
    cookieStore.set(name, value, options)
  );
} catch {
  // Server component, ignore
}
```

## Logging

**Framework:** None configured - uses browser console

**Patterns:**
- No structured logging observed
- No logging utility functions

## Comments

**When to Comment:**
- Section dividers in JSX (e.g., `{/* Header row */}`, `{/* Empty state */}`)
- Implementation notes for edge cases (e.g., "Server component, ignore")

**JSDoc/TSDoc:**
- Not used - TypeScript interfaces provide documentation

## Function Design

**Size:**
- Components: 50-165 lines typical
- Utility functions: 5-15 lines

**Parameters:**
- Use object destructuring for props
- Props interface defined inline or separately
- Optional props use `?` modifier

**Return Values:**
- Components return JSX.Element
- Utility functions return explicit types

**Example pattern from `src/components/ui/button.tsx`:**
```typescript
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  // ...
}
```

## Module Design

**Exports:**
- Named exports for utilities and reusable components
- Default exports for page components
- Re-exports from index files (see `src/types/index.ts`)

**Barrel Files:**
- `src/types/index.ts` exports all types
- UI components export individually (no barrel file)

## Component Patterns

**Client Directive:**
- Add `"use client"` at top of file for interactive components
- Server components by default (no directive needed)

**Props Interface:**
```typescript
interface ComponentNameProps {
  required: string;
  optional?: number;
  className?: string;  // Always accept className for extension
}
```

**Class Merging:**
- Use `cn()` from `@/lib/utils` for conditional classes
- Example: `className={cn("base-classes", conditional && "conditional-class", className)}`

**Variants with CVA:**
- Use `class-variance-authority` for component variants
- Define `variants` object with variant groups
- Export both component and variants (e.g., `Button`, `buttonVariants`)

**Example from `src/components/ui/button.tsx`:**
```typescript
const buttonVariants = cva(
  "base-classes-here",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3',
        lg: 'h-10 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)
```

## CSS Patterns

**Design System:**
- CSS variables defined in `src/app/globals.css`
- Access via `var(--variable-name)` in Tailwind classes
- Primary colors: `--accent` (#ea580c), `--foreground` (#1a1a1a)

**Tailwind Usage:**
- Direct utility classes preferred
- CSS variable references: `bg-[var(--bg-primary)]`, `text-[var(--accent)]`
- Responsive: `sm:`, `md:`, `lg:`, `xl:` prefixes
- State: `hover:`, `focus:`, `group-hover:`

**Animation:**
- Motion library (`motion/react`) for complex animations
- Tailwind `transition-*` utilities for simple transitions
- `tw-animate-css` for animation presets

## Data Fetching

**Server Components:**
```typescript
import { createClient } from "@/lib/supabase/server"
// Use in async server components
const supabase = await createClient()
```

**Client Components:**
```typescript
import { createClient } from "@/lib/supabase/client"
// Use in client-side code
const supabase = createClient()
```

## Page Structure

**Dashboard Pages:**
```tsx
"use client";

import { Header } from "@/components/layout/header";
// other imports...

export default function PageName() {
  return (
    <>
      <Header title="Title" subtitle="Optional subtitle" />
      <main className="p-6 lg:p-8 space-y-6">
        {/* Page content */}
      </main>
    </>
  );
}
```

**Landing Pages:**
```tsx
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <div className="relative z-10 flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center w-full">
        {/* Sections */}
      </main>
      <Footer />
    </div>
  )
}
```

---

*Convention analysis: 2026-01-30*
