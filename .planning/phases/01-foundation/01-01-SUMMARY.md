---
phase: 01-foundation
plan: 01
subsystem: database
tags: [supabase, postgresql, rls, typescript]
dependency-graph:
  requires: []
  provides: [database-schema, rls-policies, database-types]
  affects: [01-02, 02-01, 02-02, 03-01]
tech-stack:
  added: []
  patterns: [row-level-security, typed-supabase-client]
key-files:
  created:
    - supabase/migrations/001_schema.sql
    - supabase/migrations/002_rls.sql
    - src/types/database.ts
  modified:
    - src/lib/supabase/client.ts
    - src/lib/supabase/server.ts
decisions:
  - id: D001
    decision: "Use TEXT with CHECK constraints instead of ENUM types for signal_type, priority, status"
    rationale: "Easier to modify without migration, Supabase prefers this pattern"
metrics:
  duration: 84s
  completed: 2026-01-30
---

# Phase 01 Plan 01: Database Schema & RLS Summary

**One-liner:** PostgreSQL schema with profiles/signals/emails tables, RLS policies enforcing user isolation, and typed Supabase clients.

## What Was Built

### Database Schema (001_schema.sql)

Three core tables created:

1. **profiles** - Extends auth.users with user metadata
   - Links to auth.users via foreign key with CASCADE delete
   - Stores email, full_name, avatar_url, company_name
   - Auto-created via trigger on user signup

2. **signals** - Core business entity for detected buying signals
   - Linked to profiles via user_id
   - Constrained signal_type (6 types), priority (3 levels), status (5 states)
   - JSONB metadata field for flexible storage
   - Indexed on user_id, signal_type, priority, created_at

3. **generated_emails** - AI-generated outreach emails
   - Links to both signals and profiles
   - Constrained tone (professional/casual/enthusiastic)

Triggers:
- `handle_new_user()` - Auto-creates profile on auth.users insert
- `update_updated_at()` - Auto-updates updated_at on profile changes

### RLS Policies (002_rls.sql)

9 policies ensuring data isolation:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | own | (trigger) | own | - |
| signals | own | own | own | own |
| generated_emails | own | own | - | own |

All policies use `auth.uid() = user_id` or `auth.uid() = id` pattern.

### TypeScript Types (database.ts)

Full Database type matching schema:
- Row, Insert, Update variants for each table
- Union types for signal_type, priority, status, tone
- Json type for metadata field

Supabase clients updated to use `<Database>` generic for type safety.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| bf6acc4 | feat | Create database schema migration |
| 3106256 | feat | Create RLS policies migration |
| 5895e38 | feat | Add typed Supabase database types |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- [x] 001_schema.sql contains CREATE TABLE for profiles, signals, generated_emails (3 tables)
- [x] 002_rls.sql contains RLS policies for all tables (9 policies)
- [x] src/types/database.ts exports Database type with all tables
- [x] Supabase clients use Database generic for type safety
- [x] `npx tsc --noEmit` passes

## Next Phase Readiness

**Dependencies satisfied for:**
- 01-02 (Auth Flow) - profiles table ready, RLS policies ready
- 02-01 (Signal Ingestion API) - signals table ready with indexes
- 02-02 (AI Email Generation) - generated_emails table ready

**Blockers:** None

**Note:** Migrations need to be applied to Supabase project. Run `supabase db push` or apply via Supabase dashboard before testing auth flow.
