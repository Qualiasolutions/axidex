-- Axidex Row Level Security Policies
-- Migration: 002_rls.sql
-- Ensures users can only access their own data

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_emails ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY profiles_select_own ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- SIGNALS POLICIES
-- ============================================

-- Users can view their own signals
CREATE POLICY signals_select_own ON signals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert signals for themselves
CREATE POLICY signals_insert_own ON signals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own signals
CREATE POLICY signals_update_own ON signals
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own signals
CREATE POLICY signals_delete_own ON signals
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- GENERATED EMAILS POLICIES
-- ============================================

-- Users can view their own generated emails
CREATE POLICY generated_emails_select_own ON generated_emails
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert emails for themselves
CREATE POLICY generated_emails_insert_own ON generated_emails
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own generated emails
CREATE POLICY generated_emails_delete_own ON generated_emails
  FOR DELETE
  USING (auth.uid() = user_id);
