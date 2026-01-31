---
phase: 15-onboarding
plan: 02
subsystem: frontend/onboarding
tags: [wizard, context-provider, dashboard-integration, settings]
dependency-graph:
  requires: [15-01, profiles-table]
  provides: [onboarding-provider, setup-wizard, tour-restart]
  affects: [dashboard-layout, settings-page]
tech-stack:
  added: []
  patterns: [context-provider, state-machine-orchestration, animated-wizard]
key-files:
  created:
    - src/components/onboarding/setup-wizard.tsx
    - src/components/onboarding/onboarding-provider.tsx
  modified:
    - src/app/dashboard/layout.tsx
    - src/app/dashboard/page.tsx
    - src/components/layout/sidebar.tsx
    - src/app/dashboard/settings/page.tsx
decisions:
  - id: D055
    summary: OnboardingProvider wraps dashboard layout
    rationale: Central orchestration of welcome -> tour -> wizard flow
metrics:
  duration: 4min 12s
  completed: 2026-02-01
---

# Phase 15 Plan 02: Setup Wizard and Dashboard Integration Summary

Complete onboarding flow integration with setup wizard, provider context, and settings restart option.

## What Was Built

### SetupWizard Component
- 2-step notification preferences wizard
- Step 1: Email notifications toggle with Bell icon
- Step 2: Signal types grid (hiring, funding, expansion, partnership)
- AnimatePresence for smooth step transitions
- Saves preferences to profiles.notification_preferences JSONB
- Loading state while saving

### OnboardingProvider
- Context provider orchestrating the onboarding flow
- Renders appropriate component based on phase:
  - idle: nothing (completed or loading)
  - welcome: WelcomeModal
  - tour: FeatureTour
  - wizard: SetupWizard
- Auto-triggers for new users (onboarding_completed_at is null)
- Handles all transitions: welcome -> tour -> wizard -> complete

### Dashboard Integration
- layout.tsx wrapped with OnboardingProvider
- Tour target IDs added:
  - id="nav-signals" on sidebar Signals link
  - id="nav-emails" on sidebar Emails link
  - id="btn-run-scraper" on dashboard Run Scraper button

### Settings Page Restart
- "Onboarding Tour" section with HelpCircle icon
- "Restart Tour" button calls resetOnboarding()
- Shows toast and redirects to dashboard
- Loading state during reset

## Commits

| Hash | Message |
|------|---------|
| 0f1156c | feat(15-02): add SetupWizard component for notification preferences |
| d31b2aa | feat(15-02): integrate OnboardingProvider into dashboard |
| 30ae2f1 | feat(15-02): add restart tour option to settings page |

## Files Changed

### Created
- `src/components/onboarding/setup-wizard.tsx` - 2-step wizard for preferences
- `src/components/onboarding/onboarding-provider.tsx` - Flow orchestration

### Modified
- `src/app/dashboard/layout.tsx` - Wrapped with OnboardingProvider
- `src/app/dashboard/page.tsx` - Added id="btn-run-scraper"
- `src/components/layout/sidebar.tsx` - Added nav item IDs
- `src/app/dashboard/settings/page.tsx` - Added restart tour section

## Deviations from Plan

- Skipped manual human verification checkpoint (deployed directly to production per user request)

## Manual Steps Required

- Apply migration 016_onboarding.sql to Supabase production:
  ```sql
  ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ DEFAULT NULL;
  ```

## Production Status

- ✓ Deployed to Vercel: https://axidex.vercel.app
- ○ Database migration pending
