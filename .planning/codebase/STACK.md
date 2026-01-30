# Technology Stack

**Analysis Date:** 2026-01-30

## Languages

**Primary:**
- TypeScript 5.x - All source code (`src/**/*.ts`, `src/**/*.tsx`)
- TSConfig target: ES2017

**Secondary:**
- CSS - Styling via Tailwind CSS (`src/app/globals.css`)

## Runtime

**Environment:**
- Node.js 25.4.0

**Package Manager:**
- npm 11.7.0
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.1.6 - App Router framework
- React 19.2.3 - UI library
- React DOM 19.2.3 - DOM rendering

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS
- PostCSS with `@tailwindcss/postcss` plugin
- tw-animate-css 1.4.0 - Animation utilities

**Animation:**
- Motion 12.29.2 (Framer Motion) - Component animations

**Build/Dev:**
- TypeScript 5.x - Type checking
- ESLint 9.x with `eslint-config-next` 16.1.6 - Linting

## Key Dependencies

**Critical:**
- `next` 16.1.6 - Application framework
- `react` 19.2.3 - UI rendering
- `@supabase/ssr` 0.8.0 - Server-side Supabase client
- `@supabase/supabase-js` 2.93.3 - Supabase JavaScript client

**UI Components:**
- `@radix-ui/react-slot` 1.2.4 - Primitive for Button composition
- `class-variance-authority` 0.7.1 - Variant-based component styling
- `clsx` 2.1.1 - Conditional class joining
- `tailwind-merge` 3.4.0 - Tailwind class deduplication
- `lucide-react` 0.563.0 - Icon library

**Utilities:**
- `date-fns` 4.1.0 - Date manipulation (imported but not yet used in codebase)

**Analytics:**
- `@vercel/analytics` 1.6.1 - Vercel Analytics integration

## Configuration

**TypeScript (`tsconfig.json`):**
- Strict mode enabled
- Module resolution: bundler
- Path alias: `@/*` maps to `./src/*`
- JSX: react-jsx
- Incremental builds enabled

**Next.js (`next.config.ts`):**
- Remote image patterns: `images.unsplash.com`

**ESLint (`eslint.config.mjs`):**
- Core Web Vitals rules
- TypeScript rules
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

**PostCSS (`postcss.config.mjs`):**
- Uses `@tailwindcss/postcss` plugin

**Environment Variables (`.env.example`):**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## Design System

**CSS Variables (`src/app/globals.css`):**
- Color scheme: Light theme with warm orange accent
- Primary/Accent: `#ea580c` (orange-600)
- Background: `#ffffff`
- Foreground: `#1a1a1a`
- Border radius: 0.5rem base

**Fonts (Google Fonts via `next/font`):**
- Sans: Inter (`--font-inter`)
- Serif: Playfair Display (`--font-playfair`)
- Mono: JetBrains Mono (`--font-jetbrains`)

## Platform Requirements

**Development:**
- Node.js 25.x (or compatible)
- npm 11.x
- Git

**Production:**
- Vercel (deployed at https://axidex.vercel.app)
- Auto-deploy on push to main branch
- Vercel Analytics enabled

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

*Stack analysis: 2026-01-30*
