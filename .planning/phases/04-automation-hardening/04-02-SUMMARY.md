---
phase: 04-automation-hardening
plan: 02
subsystem: notifications
tags: [resend, react-email, edge-functions, supabase-webhooks, notifications, email]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: profiles table with user data
  - phase: 02-signal-ingestion
    provides: signals table for notification triggers
provides:
  - notification_preferences JSONB column on profiles
  - Settings page for notification preferences
  - React Email template for signal alerts
  - Resend API integration for email delivery
  - Edge Function for webhook-triggered notifications
affects: [04-01-linkedin, user-onboarding, email-deliverability]

# Tech tracking
tech-stack:
  added: [resend, @react-email/components]
  patterns: [lazy-initialized-api-clients, react-email-templates, edge-function-webhooks]

key-files:
  created:
    - supabase/migrations/004_notification_prefs.sql
    - src/app/dashboard/settings/page.tsx
    - src/components/emails/signal-alert.tsx
    - src/app/api/send-notification/route.ts
    - supabase/functions/check-notification/index.ts
  modified:
    - src/types/database.ts
    - tsconfig.json
    - package.json

key-decisions:
  - "Lazy-initialize Resend client to avoid build-time errors without API key"
  - "Use JSONB column for notification preferences (flexible, queryable)"
  - "Exclude supabase/functions from TypeScript (Deno runtime)"

patterns-established:
  - "Lazy API client initialization: getResend() pattern for runtime-only initialization"
  - "React Email templates: Styled components in src/components/emails/"
  - "Edge Function structure: Type definitions, validation, Supabase client initialization"

# Metrics
duration: 6min
completed: 2026-01-30
---

# Phase 4 Plan 2: Email Notifications Summary

**User notification preferences UI, React Email template for signal alerts, Resend API integration, and Supabase Edge Function for event-driven email delivery**

## Performance

- **Duration:** 6 min
- **Started:** 2026-01-30T16:30:47Z
- **Completed:** 2026-01-30T16:36:51Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Settings page with email toggle, priority threshold, and signal type checkboxes
- React Email template with Axidex branding and mobile-friendly design
- Resend API route with lazy initialization and internal API key auth
- Edge Function evaluating notification preferences before sending
- Database migration adding notification_preferences JSONB column

## Task Commits

Each task was committed atomically:

1. **Task 1: Database migration and Settings page UI** - `dcbd589` (feat)
2. **Task 2: Email template, API route, and Edge Function** - `2abb1ac` (feat)

## Files Created/Modified

**Created:**
- `supabase/migrations/004_notification_prefs.sql` - JSONB column for notification prefs with GIN index
- `src/app/dashboard/settings/page.tsx` - Settings UI with toggles, radios, checkboxes
- `src/components/emails/signal-alert.tsx` - React Email template with priority badge and CTA
- `src/app/api/send-notification/route.ts` - POST handler for Resend email sending
- `supabase/functions/check-notification/index.ts` - Edge Function for webhook evaluation

**Modified:**
- `src/types/database.ts` - Added notification_preferences to profiles type
- `tsconfig.json` - Excluded supabase/functions from TypeScript compilation
- `package.json` - Added resend and @react-email/components dependencies

## Decisions Made

1. **Lazy Resend initialization** - Resend client is initialized on first request, not at module load. This avoids build errors when RESEND_API_KEY is not set during `next build`.

2. **JSONB for preferences** - Using JSONB column instead of separate table allows flexible schema evolution and efficient querying with GIN index.

3. **Type assertions for Supabase queries** - Used explicit type assertions for notification_preferences queries to work around TypeScript inference issues with partial column selects.

4. **Exclude Edge Functions from TSC** - Supabase Edge Functions use Deno runtime with URL imports. Added to tsconfig exclude to prevent TypeScript errors.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added notification_preferences to database types**
- **Found during:** Task 1 (Settings page implementation)
- **Issue:** TypeScript compilation failed - notification_preferences not in Database types
- **Fix:** Added notification_preferences JSONB column to profiles Row/Insert/Update types
- **Files modified:** src/types/database.ts
- **Verification:** npx tsc --noEmit passes
- **Committed in:** dcbd589 (Task 1 commit)

**2. [Rule 3 - Blocking] Lazy-initialized Resend client**
- **Found during:** Task 2 (API route implementation)
- **Issue:** Build failed - Resend constructor requires API key at module evaluation time
- **Fix:** Changed to lazy initialization pattern with getResend() function
- **Files modified:** src/app/api/send-notification/route.ts
- **Verification:** npm run build passes
- **Committed in:** 2abb1ac (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes essential for TypeScript compilation and build. No scope creep.

## Issues Encountered

- **TypeScript type inference with Supabase queries** - When selecting partial columns, TypeScript infers `data` as `never` in else branches. Resolved by using explicit type assertions.

## User Setup Required

**External services require manual configuration:**

1. **Resend API Key**
   - Get API key from Resend Dashboard -> API Keys
   - Add `RESEND_API_KEY=re_xxxxx` to Vercel environment variables

2. **Optional: Custom Domain**
   - Verify sending domain in Resend Dashboard -> Domains
   - Set `RESEND_FROM_EMAIL=Axidex <notifications@yourdomain.com>`

3. **Supabase Database Webhook**
   - Create webhook: Supabase Dashboard -> Database -> Webhooks -> Create
   - Table: signals, Event: INSERT
   - URL: `https://PROJECT.supabase.co/functions/v1/check-notification`
   - Add header: `Authorization: Bearer SERVICE_ROLE_KEY`

4. **Deploy Edge Function**
   - Run: `supabase functions deploy check-notification`
   - Set secrets: `supabase secrets set INTERNAL_API_KEY=your-key APP_URL=https://axidex.vercel.app`

## Next Phase Readiness

- Notification infrastructure complete
- Ready for production testing once Resend API key configured
- Settings page accessible at /dashboard/settings
- Next: Apply migration to Supabase, configure webhook, deploy Edge Function

---
*Phase: 04-automation-hardening*
*Completed: 2026-01-30*
