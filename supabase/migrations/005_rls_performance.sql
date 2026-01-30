-- Migration: Fix RLS policies for performance
-- Replace auth.uid() with (select auth.uid()) to prevent per-row re-evaluation
-- This provides 10x+ performance improvement at scale

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "signals_select_own" ON signals;
DROP POLICY IF EXISTS "signals_insert_own" ON signals;
DROP POLICY IF EXISTS "signals_update_own" ON signals;
DROP POLICY IF EXISTS "signals_delete_own" ON signals;
DROP POLICY IF EXISTS "generated_emails_select_own" ON generated_emails;
DROP POLICY IF EXISTS "generated_emails_insert_own" ON generated_emails;
DROP POLICY IF EXISTS "generated_emails_delete_own" ON generated_emails;

-- Recreate profiles policies with subselect for performance
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- Recreate signals policies with subselect for performance
CREATE POLICY "signals_select_own" ON signals
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "signals_insert_own" ON signals
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "signals_update_own" ON signals
  FOR UPDATE USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "signals_delete_own" ON signals
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Recreate generated_emails policies with subselect for performance
CREATE POLICY "generated_emails_select_own" ON generated_emails
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "generated_emails_insert_own" ON generated_emails
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "generated_emails_delete_own" ON generated_emails
  FOR DELETE USING ((select auth.uid()) = user_id);

-- Add missing index for generated_emails.user_id
CREATE INDEX IF NOT EXISTS generated_emails_user_id_idx ON generated_emails(user_id);
