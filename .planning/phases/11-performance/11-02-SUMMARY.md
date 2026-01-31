---
phase: 11-performance
plan: 02
subsystem: ui
tags: [swr, optimistic-ui, prefetch, react, performance]

# Dependency graph
requires:
  - phase: 11-01
    provides: SWR hooks with mutate functions for all data types
provides:
  - Optimistic UI updates for rule toggle and delete operations
  - SWR preload on hover for all navigation and cards
  - Instant UI feedback for user actions with error rollback
affects: [future-features, user-experience]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Optimistic updates with rollback on error
    - SWR preload on hover for instant navigation

key-files:
  created: []
  modified:
    - src/app/dashboard/rules/page.tsx
    - src/components/layout/sidebar.tsx
    - src/components/signals/signal-card.tsx
    - src/components/emails/email-card.tsx
    - src/components/accounts/account-card.tsx
    - src/components/rules/rule-card.tsx

key-decisions:
  - "Optimistic updates only for rules page - signals/emails/accounts are read-only"
  - "Prefetch all navigation links and card detail pages on hover"
  - "Use SWR preload() for client-side data prefetching"
  - "Rollback optimistic updates on API failure to preserve data integrity"

patterns-established:
  - "Optimistic pattern: store previous state, update cache, call API, rollback on error"
  - "Prefetch pattern: import preload/fetcher, add onMouseEnter handler to links"

# Metrics
duration: 3min 37s
completed: 2026-01-31
---

# Phase 11 Plan 02: Optimistic UI & Prefetch Summary

**Optimistic updates for rule mutations with instant rollback, and SWR prefetch on hover for all navigation and cards**

## Performance

- **Duration:** 3min 37s
- **Started:** 2026-01-31T17:26:08Z
- **Completed:** 2026-01-31T17:29:45Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Rule toggle and delete operations update UI immediately before API response
- All navigation links prefetch data on hover for instant page loads
- Signal, email, account, and rule cards prefetch detail data on hover
- Optimistic updates rollback gracefully on API failure

## Task Commits

Each task was committed atomically:

1. **Task 1: Add optimistic updates to rules page** - `d2723fa` (feat)
2. **Task 2: Add optimistic updates for signal interactions** - N/A (no mutations found)
3. **Task 3: Add prefetch on hover to navigation and cards** - `4b5fc96` (feat)

**Chore commit:** `2a8f557` (chore: gitignore update)

## Files Created/Modified
- `src/app/dashboard/rules/page.tsx` - Optimistic updates for toggle/delete with error rollback
- `src/components/layout/sidebar.tsx` - Prefetch route data on navigation hover
- `src/components/signals/signal-card.tsx` - Prefetch signal detail on hover
- `src/components/emails/email-card.tsx` - Prefetch email detail on hover
- `src/components/accounts/account-card.tsx` - Prefetch account detail on hover
- `src/components/rules/rule-card.tsx` - Prefetch rule detail on hover
- `.gitignore` - Added .env*.local to prevent committing local env files

## Decisions Made

**D037: Optimistic updates only for rules page**
- Signals, emails, and accounts pages are read-only with no mutations
- Only copy-to-clipboard in email card, which doesn't need optimistic updates

**D038: Store previous state for rollback on error**
- Pattern: save `previousRules` and `previousCount` before optimistic update
- On API error, call `mutate()` with previous data to restore original state

**D039: Use SWR preload() for hover prefetching**
- Imported `preload` and `fetcher` from SWR library
- Added `onMouseEnter` handlers to all navigation links and cards
- Prefetch happens in background, doesn't block UI

**D040: Prefetch data matches route structure**
- Sidebar prefetches route-level data (e.g., `/api/signals?limit=20`)
- Cards prefetch detail data (e.g., `/api/signals/${id}`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added .env*.local to gitignore**
- **Found during:** Project inspection between tasks
- **Issue:** .env*.local files could be committed, exposing secrets
- **Fix:** Added pattern to .gitignore
- **Files modified:** .gitignore
- **Verification:** Pattern matches .env.local, .env.development.local, etc.
- **Committed in:** `2a8f557` (separate chore commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential security fix. No scope creep.

## Issues Encountered
None - plan executed as specified.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All performance optimizations complete
- UI feels instant: actions respond immediately, navigation loads fast
- Ready for production deployment with optimized user experience

## Technical Notes

### Optimistic Update Pattern
```typescript
const handleMutation = async (item, newValue) => {
  const previous = currentData;

  // Update immediately
  mutate({ ...newData }, { revalidate: false });

  try {
    await apiCall();
    mutate(); // Revalidate
  } catch {
    mutate(previous, { revalidate: false }); // Rollback
  }
};
```

### Prefetch Pattern
```typescript
import { preload } from 'swr';
import { fetcher } from '@/lib/swr';

const handlePrefetch = () => {
  preload(`/api/resource/${id}`, fetcher);
};

<Link onMouseEnter={handlePrefetch}>
```

---
*Phase: 11-performance*
*Completed: 2026-01-31*
