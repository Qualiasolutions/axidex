---
phase: 14-billing
plan: 01
subsystem: billing
tags: [stripe, subscriptions, payments, webhooks]
completed: 2026-01-31
duration: 5min 57s
dependency-graph:
  requires: [12-design-polish]
  provides: [subscription-schema, stripe-integration, checkout-flow, webhook-handling]
  affects: [feature-gating, user-management]
tech-stack:
  added: [stripe@20.3.0]
  patterns: [lazy-client-initialization, webhook-signature-verification, service-role-admin]
key-files:
  created:
    - supabase/migrations/015_billing.sql
    - src/lib/stripe.ts
    - src/lib/supabase/admin.ts
    - src/app/api/billing/checkout/route.ts
    - src/app/api/webhooks/stripe/route.ts
    - src/app/pricing/page.tsx
  modified:
    - src/types/index.ts
    - src/types/database.ts
    - package.json
decisions:
  - id: D048
    decision: Lazy-initialize Stripe client
    rationale: Avoids build errors when env vars not set
  - id: D049
    decision: Use service role client for webhooks
    rationale: Bypass RLS for server-side subscription updates
  - id: D050
    decision: Store subscription history in separate table
    rationale: Audit trail and period tracking independent of current status
---

# Phase 14 Plan 01: Stripe Checkout Flow Summary

Stripe subscription billing with checkout sessions, webhook handling, and pricing page.

## One-liner

Stripe checkout flow with subscription schema, webhook handlers, and pricing page using lazy-initialized clients.

## What Was Built

### Task 1: Billing Database Schema
- Added subscription columns to profiles: `subscription_status`, `subscription_tier`, `stripe_customer_id`, `stripe_subscription_id`, `subscription_period_end`
- Created `subscriptions` table for history tracking
- Added RLS policy allowing users to view only their own subscriptions
- Created indexes for efficient Stripe customer lookups
- Added TypeScript types: `SubscriptionStatus`, `SubscriptionTier`, `Subscription`
- Updated `User` interface with subscription fields

### Task 2: Stripe Client and Checkout API
- Installed Stripe SDK v20.3.0 with API version 2026-01-28.clover
- Created `/src/lib/stripe.ts` with lazy initialization pattern
- Defined `PLANS` config with Free, Pro ($29/mo), Enterprise ($99/mo) tiers
- Created `/api/billing/checkout` route that:
  - Validates tier and authenticated user
  - Creates or retrieves Stripe customer
  - Creates checkout session with metadata
  - Returns checkout URL for redirect
- Built `/pricing` page with:
  - Three pricing cards with feature lists
  - Upgrade buttons with loading states
  - Premium minimalist design matching existing system
  - Motion animations for entrance effects

### Task 3: Stripe Webhook Handler
- Created `/src/lib/supabase/admin.ts` with service role client
- Created `/api/webhooks/stripe` handler for:
  - `checkout.session.completed`: Activates subscription, creates history record
  - `customer.subscription.updated`: Syncs status changes
  - `customer.subscription.deleted`: Resets to free tier
  - `invoice.payment_failed`: Sets status to past_due
  - `invoice.paid`: Recovers from past_due state
- Implemented proper signature verification
- All updates use service role to bypass RLS

## Key Implementation Details

### Stripe Client Pattern
```typescript
// Lazy initialization avoids build-time errors
let stripeInstance: Stripe | null = null;
export function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {...});
  }
  return stripeInstance;
}
```

### Subscription Status Flow
```
Free -> Checkout -> Active -> (payment fails) -> Past Due -> (recovers) -> Active
                           -> (canceled) -> Canceled -> Free
```

### Database Type Updates
Updated `src/types/database.ts` with subscription fields and `subscriptions` table types to match migration schema.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 51f3c7b | feat | Create billing database schema |
| 98be089 | feat | Create Stripe client and checkout API |
| 69d43fe | feat | Create Stripe webhook handler |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Stripe API version mismatch**
- **Found during:** Task 2
- **Issue:** Installed Stripe SDK requires API version '2026-01-28.clover'
- **Fix:** Updated apiVersion in stripe.ts
- **Files modified:** src/lib/stripe.ts

**2. [Rule 2 - Missing Critical] Database types missing subscription fields**
- **Found during:** Task 2
- **Issue:** TypeScript errors due to missing subscription columns in database types
- **Fix:** Added subscription fields to profiles and subscriptions table to database.ts
- **Files modified:** src/types/database.ts

## Environment Variables Required

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product Price IDs (create in Stripe Dashboard)
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Supabase Service Role (for webhooks)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Manual Setup Required

1. **Stripe Dashboard**
   - Create two products: Pro ($29/mo) and Enterprise ($99/mo)
   - Copy price IDs to environment variables
   - Create webhook endpoint pointing to `/api/webhooks/stripe`
   - Copy webhook signing secret

2. **Vercel Environment**
   - Add all Stripe environment variables
   - Add SUPABASE_SERVICE_ROLE_KEY

3. **Supabase**
   - Apply migration 015_billing.sql to production

## Verification Checklist

- [x] Migration 015_billing.sql creates subscription schema
- [x] Stripe client exports `stripe` and `PLANS`
- [x] POST /api/billing/checkout creates checkout session
- [x] POST /api/webhooks/stripe processes subscription events
- [x] /pricing page shows three tiers with upgrade buttons
- [x] Types include Subscription and updated User interfaces
- [x] TypeScript compiles without errors
- [x] Build passes successfully

## Next Phase Readiness

**Ready for Phase 14-02 (Billing Portal):**
- Subscription schema in place
- Stripe customer ID stored on profiles
- Webhook infrastructure handles all status changes

**Integration points:**
- Feature gating can check `subscription_tier` from profile
- Dashboard can show subscription status from profile
- Settings page can link to Stripe billing portal
