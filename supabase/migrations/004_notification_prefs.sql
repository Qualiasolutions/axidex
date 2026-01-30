-- Migration: 004_notification_prefs.sql
-- Add notification preferences to profiles table

-- Add notification_preferences JSONB column with defaults
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email_enabled": true,
  "signal_types": ["hiring", "funding", "expansion", "partnership", "product_launch", "leadership_change"],
  "priority_threshold": "high"
}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN profiles.notification_preferences IS 'User notification preferences: email_enabled (bool), signal_types (array), priority_threshold (high|medium|low)';

-- Index for querying preferences (GIN for JSONB containment queries)
CREATE INDEX IF NOT EXISTS idx_profiles_notification_prefs
ON profiles USING gin (notification_preferences);

-- Backfill existing profiles with default preferences
UPDATE profiles
SET notification_preferences = '{
  "email_enabled": true,
  "signal_types": ["hiring", "funding", "expansion", "partnership", "product_launch", "leadership_change"],
  "priority_threshold": "high"
}'::jsonb
WHERE notification_preferences IS NULL;
