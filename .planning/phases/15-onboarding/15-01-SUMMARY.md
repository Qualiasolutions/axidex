---
phase: 15-onboarding
plan: 01
subsystem: frontend/onboarding
tags: [motion, supabase, react-hooks, modal, spotlight]
dependency-graph:
  requires: [profiles-table, supabase-client]
  provides: [onboarding-state, welcome-modal, feature-tour]
  affects: [dashboard-integration, settings-restart-tour]
tech-stack:
  added: []
  patterns: [state-machine, optimistic-updates, spotlight-overlay, AnimatePresence]
key-files:
  created:
    - supabase/migrations/016_onboarding.sql
    - src/hooks/use-onboarding.ts
    - src/components/onboarding/welcome-modal.tsx
    - src/components/onboarding/feature-tour.tsx
    - src/components/onboarding/tour-step.tsx
  modified:
    - src/types/database.ts
decisions:
  - id: D054
    summary: Default hasCompletedOnboarding to true to avoid flash
    rationale: Only show onboarding if explicitly null in database
metrics:
  duration: 2min 33s
  completed: 2026-01-31
---

# Phase 15 Plan 01: Welcome Modal and Feature Tour Summary

Welcome modal with Motion animations and 3-step feature tour using spotlight highlighting with box-shadow technique.

## What Was Built

### Database Migration (016_onboarding.sql)
- Added `onboarding_completed_at` TIMESTAMPTZ column to profiles table
- Created partial index for querying incomplete onboarding users
- NULL means not completed, timestamp means completed

### useOnboarding Hook
- State machine with 5 phases: idle, welcome, tour, wizard, complete
- Tracks `tourStep` for navigation within tour
- Auto-fetches onboarding status on mount from profiles table
- Optimistic updates for `completeOnboarding`, `skip`, and `resetOnboarding`
- Defaults `hasCompletedOnboarding` to true to prevent modal flash

### WelcomeModal Component
- AnimatePresence wrapper for enter/exit animations
- Backdrop with `bg-black/60 backdrop-blur-sm`
- Modal scales from 0.9 to 1 with easeOutExpo easing
- Sparkles icon with orange gradient and shadow
- "Start Quick Tour" and "Skip for now" buttons
- Close X button in top right corner

### TourStep Component
- Uses `getBoundingClientRect()` for target positioning
- Box-shadow technique creates dark overlay with spotlight cutout
- Scrolls target into view with smooth behavior
- Positions tooltip relative to target (top/bottom/left/right)
- Updates position on window resize/scroll
- Gracefully skips step if target element not found
- Progress indicator shows "Step X of Y"
- Back/Next navigation with Finish on last step

### FeatureTour Orchestrator
- Defines 3 tour steps (under 5 as research recommends):
  1. Signals page (nav-signals) - "Your Signal Feed"
  2. Run Scraper button (btn-run-scraper) - "Detect New Signals"
  3. Emails page (nav-emails) - "AI Email Drafts"
- Renders current TourStep based on currentStep prop
- Calls onComplete when user clicks Next on last step

## Commits

| Hash | Message |
|------|---------|
| 605d83c | feat(15-01): add onboarding tracking to profiles table |
| 4814b26 | feat(15-01): add useOnboarding hook and WelcomeModal component |
| 047945d | feat(15-01): add TourStep spotlight and FeatureTour orchestrator |

## Files Changed

### Created
- `supabase/migrations/016_onboarding.sql` - Migration for onboarding_completed_at column
- `src/hooks/use-onboarding.ts` - Onboarding state management hook
- `src/components/onboarding/welcome-modal.tsx` - Welcome modal with animations
- `src/components/onboarding/feature-tour.tsx` - Tour orchestration
- `src/components/onboarding/tour-step.tsx` - Spotlight step component

### Modified
- `src/types/database.ts` - Added onboarding_completed_at to profiles types

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for 15-02:**
- Onboarding components built and exported
- Dashboard needs integration (15-02 will add OnboardingProvider)
- Target element IDs need to be added to sidebar nav items (nav-signals, nav-emails)
- Run Scraper button needs id="btn-run-scraper"

**Blockers:** None
