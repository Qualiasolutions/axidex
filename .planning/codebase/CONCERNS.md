# Codebase Concerns

**Analysis Date:** 2026-01-30

## Tech Debt

**Dashboard shows only empty states - no data layer:**
- Issue: Dashboard and signals pages only render empty states with hardcoded placeholder values (`"—"` for stats). No actual data fetching implemented.
- Files: `src/app/dashboard/page.tsx`, `src/app/dashboard/signals/page.tsx`
- Impact: Application cannot display real data. All UI is static mockups.
- Fix approach: Implement Supabase queries in server components or use React Query/SWR for client-side fetching. Create API routes for data mutations.

**Supabase clients created but never used:**
- Issue: Supabase client setup exists but no component imports or uses it for actual queries.
- Files: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- Impact: Database connection is configured but unused. No actual backend integration.
- Fix approach: Replace hardcoded empty states with actual Supabase queries once database tables are created.

**Non-null assertions on env vars without validation:**
- Issue: Supabase clients use `!` assertions (`process.env.NEXT_PUBLIC_SUPABASE_URL!`) without runtime validation.
- Files: `src/lib/supabase/client.ts` (lines 5-6), `src/lib/supabase/server.ts` (lines 8-9)
- Impact: Application will crash with cryptic errors if env vars are missing.
- Fix approach: Add validation at app startup or use a library like zod for env validation. Create a dedicated `src/lib/env.ts` module.

**Sidebar collapse state not persisted:**
- Issue: Sidebar collapsed/expanded state resets on page navigation or refresh.
- Files: `src/components/layout/sidebar.tsx` (line 24)
- Impact: Poor UX - user preference lost on navigation.
- Fix approach: Persist state in localStorage or cookie.

**Dashboard layout margin doesn't sync with sidebar collapse:**
- Issue: Dashboard layout uses fixed `lg:ml-60` but sidebar can collapse to `w-16`.
- Files: `src/app/dashboard/layout.tsx` (line 12), `src/components/layout/sidebar.tsx` (line 31)
- Impact: When sidebar collapses, main content doesn't expand to fill space.
- Fix approach: Lift collapse state up to layout or use CSS calc with CSS custom properties.

**Duplicate Header components:**
- Issue: Two different Header components exist - one for landing, one for dashboard.
- Files: `src/components/landing/header.tsx`, `src/components/layout/header.tsx`
- Impact: Potential confusion. Different naming or consolidation needed.
- Fix approach: Rename to `LandingHeader` and `DashboardHeader` for clarity.

## Known Bugs

**Mobile menu doesn't close on route change:**
- Symptoms: Mobile nav menu stays open after clicking a link that navigates to a new page.
- Files: `src/components/landing/header.tsx` (lines 71-99)
- Trigger: Click mobile menu link that uses client-side navigation.
- Workaround: Manual onClick handlers call `setMobileMenuOpen(false)` but may not work for all navigation methods.

**Sign Out button has no functionality:**
- Symptoms: Clicking "Sign Out" in sidebar does nothing.
- Files: `src/components/layout/sidebar.tsx` (lines 109-118)
- Trigger: Click Sign Out button.
- Workaround: None - authentication not implemented.

**Search input in dashboard header is non-functional:**
- Symptoms: Search input accepts text but performs no action.
- Files: `src/components/layout/header.tsx` (lines 30-35)
- Trigger: Type in search box, press Enter.
- Workaround: None.

**Notifications button shows hardcoded "3":**
- Symptoms: Always shows "3" regardless of actual notifications.
- Files: `src/components/layout/header.tsx` (lines 39-41)
- Trigger: View dashboard header.
- Workaround: None - notification system not implemented.

## Security Considerations

**No authentication middleware:**
- Risk: Dashboard routes (`/dashboard/*`) are accessible without authentication.
- Files: `src/app/dashboard/layout.tsx`, no `middleware.ts` exists
- Current mitigation: None - pages show empty states but are publicly accessible.
- Recommendations: Implement Supabase Auth middleware to protect `/dashboard/*` routes. Create `middleware.ts` at project root.

**Missing RLS policies:**
- Risk: Once Supabase tables are created, data may be exposed without proper Row Level Security.
- Files: No migration files exist (database not set up)
- Current mitigation: N/A - database tables don't exist yet.
- Recommendations: Create RLS policies before populating any data. Follow least-privilege principle.

**API keys exposed via env vars without server-side protection:**
- Risk: `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` referenced in `.env.example` need to be server-only.
- Files: `.env.example` (lines 6, 9)
- Current mitigation: These are listed without `NEXT_PUBLIC_` prefix, so they should be server-only.
- Recommendations: Create API routes for AI operations. Never expose these keys to client. Add validation to ensure keys aren't accidentally prefixed with `NEXT_PUBLIC_`.

**External link security:**
- Risk: Signal source URLs link to external sites without full sanitization.
- Files: `src/components/signals/signal-card.tsx` (lines 63-70)
- Current mitigation: Uses `target="_blank" rel="noopener noreferrer"` which prevents opener exploits.
- Recommendations: Consider URL validation when implementing signal ingestion to prevent malicious URLs.

## Performance Bottlenecks

**No code observed that would cause performance issues:**
- Current state: Application is mostly static UI. Once data fetching is added, consider:
  - Pagination for signals list
  - Virtual scrolling for large lists
  - Image optimization for company logos
  - Debounced search input

**Large hero component with complex transforms:**
- Problem: Hero section has multiple absolutely positioned cards with CSS 3D transforms.
- Files: `src/components/landing/hero.tsx` (lines 75-160)
- Cause: Multiple `transform: rotateX() rotateY() translateZ()` operations and hover transitions.
- Improvement path: Consider reducing transforms on mobile. Test on low-powered devices.

## Fragile Areas

**CSS Variables split across two systems:**
- Files: `src/app/globals.css` (lines 6-47 and 49-95)
- Why fragile: Dashboard components use `var(--bg-primary)`, `var(--text-primary)`, etc. but these aren't defined. Only Tailwind v4 theme variables are defined.
- Safe modification: Check both the `:root` block and `@theme inline` block when adding colors.
- Test coverage: No tests - visual inspection only.

**Badge component depends on type definitions:**
- Files: `src/components/ui/badge.tsx`, `src/types/index.ts`
- Why fragile: Badge configurations (`signalTypeConfig`, `priorityConfig`, `statusConfig`) must stay in sync with TypeScript types.
- Safe modification: Always update both files together when adding signal types, priorities, or statuses.
- Test coverage: No tests.

**Type definitions not connected to Supabase:**
- Files: `src/types/index.ts`
- Why fragile: TypeScript interfaces are manually written. When Supabase tables are created, types may drift.
- Safe modification: Generate types from Supabase schema using `supabase gen types typescript`.
- Test coverage: No tests.

## Scaling Limits

**Client-side rendering for dashboard:**
- Current capacity: Works fine for empty states.
- Limit: With real data, "use client" pages will struggle with large datasets.
- Scaling path: Convert to server components where possible. Implement pagination. Use React Query for client data needs.

## Dependencies at Risk

**Next.js 16.1.6 (canary/rc):**
- Risk: Using very recent Next.js version that may have breaking changes.
- Impact: Potential instability, limited community support for edge cases.
- Migration plan: Monitor for stable release. Be prepared to adjust for API changes.

**React 19.2.3:**
- Risk: React 19 is still relatively new. Some patterns may change.
- Impact: Library compatibility issues possible.
- Migration plan: Keep React updated but test thoroughly.

**date-fns installed but unused:**
- Risk: Unnecessary dependency bloat.
- Impact: Minor - adds to bundle size.
- Migration plan: `src/lib/utils.ts` implements custom `formatRelativeTime`. Either use date-fns or remove it.

## Missing Critical Features

**No authentication system:**
- Problem: Users cannot sign up, log in, or have sessions.
- Blocks: All personalized functionality (user-specific signals, saved emails, settings).

**No database tables:**
- Problem: Supabase connected but no schema defined.
- Blocks: Any data persistence. Application cannot store signals, emails, or user data.

**No API routes:**
- Problem: No `src/app/api/*` routes exist.
- Blocks: Signal ingestion, email generation, webhooks, any backend logic.

**No email generation integration:**
- Problem: "Draft Email" button has no implementation.
- Blocks: Core product functionality (AI-powered email drafts).

**No signal ingestion:**
- Problem: No way to detect or import signals.
- Blocks: Core product functionality.

**Missing dashboard pages:**
- Problem: Navigation links to `/dashboard/emails`, `/dashboard/accounts`, `/dashboard/analytics`, `/dashboard/rules`, `/dashboard/notifications`, `/dashboard/settings` - none exist.
- Blocks: Full application navigation. Users see 404 pages.

## Test Coverage Gaps

**No test infrastructure:**
- What's not tested: Everything. Zero test files in `src/`.
- Files: All of `src/**/*.{ts,tsx}`
- Risk: Any change can break existing functionality unnoticed.
- Priority: High - add Jest/Vitest + React Testing Library before feature development.

**No type checking in CI:**
- What's not tested: TypeScript compilation not verified in CI.
- Files: `package.json` - no test or typecheck script beyond `tsc --noEmit`
- Risk: Type errors can slip into production.
- Priority: Medium - add `npm run typecheck` to CI pipeline.

**No lint enforcement:**
- What's not tested: ESLint rules not enforced in CI.
- Files: No CI config detected (`.github/workflows/` not present)
- Risk: Code style drift.
- Priority: Low - set up after core functionality.

---

*Concerns audit: 2026-01-30*
