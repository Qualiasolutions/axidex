-- Migration: Add soft deletes for data recovery
-- Allows recovery of accidentally deleted data within 30-day grace period

-- Add deleted_at columns
ALTER TABLE signals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE generated_emails ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS signals_deleted_at_idx ON signals(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS generated_emails_deleted_at_idx ON generated_emails(deleted_at) WHERE deleted_at IS NOT NULL;

-- Update RLS policies to exclude soft-deleted records
-- First drop the existing policies
DROP POLICY IF EXISTS "signals_select_own" ON signals;
DROP POLICY IF EXISTS "signals_update_own" ON signals;
DROP POLICY IF EXISTS "signals_delete_own" ON signals;
DROP POLICY IF EXISTS "generated_emails_select_own" ON generated_emails;
DROP POLICY IF EXISTS "generated_emails_delete_own" ON generated_emails;

-- Recreate policies with soft delete filter
CREATE POLICY "signals_select_own" ON signals
  FOR SELECT USING ((select auth.uid()) = user_id AND deleted_at IS NULL);

CREATE POLICY "signals_update_own" ON signals
  FOR UPDATE USING ((select auth.uid()) = user_id AND deleted_at IS NULL)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "signals_delete_own" ON signals
  FOR DELETE USING ((select auth.uid()) = user_id AND deleted_at IS NULL);

CREATE POLICY "generated_emails_select_own" ON generated_emails
  FOR SELECT USING ((select auth.uid()) = user_id AND deleted_at IS NULL);

CREATE POLICY "generated_emails_delete_own" ON generated_emails
  FOR DELETE USING ((select auth.uid()) = user_id AND deleted_at IS NULL);

-- Function to soft delete instead of hard delete (optional - can use application logic instead)
CREATE OR REPLACE FUNCTION soft_delete_signal()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE signals SET deleted_at = now() WHERE id = OLD.id;
  RETURN NULL; -- Prevent actual deletion
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: To enable soft delete trigger, uncomment below:
-- CREATE TRIGGER signals_soft_delete_trigger
--   BEFORE DELETE ON signals
--   FOR EACH ROW EXECUTE FUNCTION soft_delete_signal();

-- Function to permanently delete old soft-deleted records (run via cron job)
CREATE OR REPLACE FUNCTION cleanup_soft_deleted_records()
RETURNS void AS $$
BEGIN
  -- Delete records soft-deleted more than 30 days ago
  DELETE FROM signals WHERE deleted_at IS NOT NULL AND deleted_at < now() - INTERVAL '30 days';
  DELETE FROM generated_emails WHERE deleted_at IS NOT NULL AND deleted_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
