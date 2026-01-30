---
phase: 03-dashboard-emails
plan: 01
subsystem: frontend
tags: [signals, filtering, api, supabase, react]
dependencies:
  requires: [02-03]
  provides: [signals-api, signals-display, signal-filtering]
  affects: [03-02]
tech-stack:
  added: [date-fns]
  patterns: [api-routes, client-side-filtering, url-state-management]
key-files:
  created:
    - src/lib/queries/signals.ts
    - src/app/api/signals/route.ts
  modified:
    - src/app/dashboard/signals/page.tsx
decisions:
  - id: D012
    what: Client-side filtering with URL state
    why: Enables filter sharing, browser back/forward, and refresh persistence
    alternatives: Server-side only (no sharing), local state (no persistence)
metrics:
  duration: 202 seconds
  completed: 2026-01-30
---

# Phase 3 Plan 01: Wire Signals Display Summary

**One-liner:** Live signals feed with multi-select type filters, date presets, and URL-persisted state

## What Was Built

### 1. Signals Query Layer
Created `src/lib/queries/signals.ts` with Supabase query builder:
- `buildSignalsQuery()` - Builds filtered query with user scoping
- Supports: type, priority, status, search, date range filters
- Pagination support (limit/offset, default 50)
- Returns signals array + total count

### 2. Signals API Route
Created `src/app/api/signals/route.ts`:
- GET endpoint with authentication check (401 if not logged in)
- Parses query params: types, priorities, statuses, search, from, to
- Calls `buildSignalsQuery()` with user ID
- Returns JSON: `{ signals: Signal[], count: number }`

### 3. Interactive Signals Page
Rewrote `src/app/dashboard/signals/page.tsx`:
- Fetches signals from API with filter params
- Displays `SignalCard` components for each signal
- Loading skeleton while fetching
- Empty state with contextual messaging (no signals vs no matches)
- Real-time stats bar (total count, high priority, new)

### 4. Multi-Select Type Filters
- Clickable type badges (Hiring, Funding, Expansion, etc.)
- Toggle on/off to build multi-select filter
- Active filters highlighted with accent color
- "All Types" button to clear type filters
- Filters update URL and trigger refetch

### 5. Date Range Presets
- Four preset buttons: Today, This Week, This Month, All Time
- Uses date-fns for date calculations
- Updates URL with ISO-formatted from/to params
- Active preset highlighted based on current URL
- "All Time" clears date filters

## Technical Decisions

### D012: Client-side filtering with URL state
**Decision:** Store all filter state in URL search params
**Rationale:**
- Users can share filtered views via URL
- Browser back/forward works naturally
- Page refresh preserves filters
- No need for complex local state management

**Implementation:**
- useSearchParams() to read current filters
- useRouter().push() to update filters
- useEffect triggers refetch when filters change
- Suspense boundary per D002 (Next.js 16 requirement)

### Pattern: API Route with Auth
All dashboard API routes follow:
1. Get Supabase client
2. Call `supabase.auth.getUser()`
3. Return 401 if no user
4. Scope query by user_id
5. Return JSON with consistent structure

## Integration Points

### Connects To
- `supabase.from('signals')` - Database queries
- `/api/signals` - REST endpoint for signal fetching
- `SignalCard` component - Displays individual signals
- `date-fns` - Date calculations for presets

### Provides For
- Phase 03-02 (Email generation) - Will use signal selection from this page
- Future signal detail pages - URL patterns established
- Analytics - Filter usage can be tracked via URL params

## Files Changed

**Created:**
- `src/lib/queries/signals.ts` (79 lines) - Query builder
- `src/app/api/signals/route.ts` (62 lines) - API endpoint

**Modified:**
- `src/app/dashboard/signals/page.tsx` - Full rewrite from empty state to live data display

## Testing Notes

**Manual Testing Required:**
1. Navigate to `/dashboard/signals` as logged-in user
2. Verify signals load (or empty state if no signals)
3. Click type filters - URL updates, list filters
4. Click date presets - URL updates, list filters
5. Refresh page - filters persist
6. Share URL - filters apply

**Edge Cases Handled:**
- No signals in database - Shows "configure sources" empty state
- No signals matching filters - Shows "adjust filters" empty state with clear button
- Authentication required - 401 from API, triggers auth flow
- Empty filter arrays - Omitted from URL params

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for 03-02 (Email Generation):**
- Signal selection mechanism needed (checkboxes or click-to-select)
- Currently SignalCard has "Draft Email" button that does nothing
- Will need to wire that to email generation flow

**Database State:**
- No demo signals in database yet
- May want seed data for testing email generation
- Signal ingestion (Phase 02) should be running to populate signals

## Known Issues

None.

## Performance Notes

- API queries scoped to user_id (indexed)
- Default limit 50 to prevent large result sets
- No pagination UI yet (will need if >50 signals)
- Consider adding pagination in future enhancement

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | e413e57 | Create signals query layer and API route |
| 2 | b83c707 | Wire signals page to fetch and display real data |
| 3 | e59dba7 | Add date range filter with presets |
