-- Axidex Database Schema
-- Migration: 010_slack_integration.sql
-- Adds Slack workspace connection fields to profiles

-- Add Slack integration columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS slack_workspace_id TEXT,
ADD COLUMN IF NOT EXISTS slack_workspace_name TEXT,
ADD COLUMN IF NOT EXISTS slack_access_token TEXT,
ADD COLUMN IF NOT EXISTS slack_channel_id TEXT,
ADD COLUMN IF NOT EXISTS slack_channel_name TEXT,
ADD COLUMN IF NOT EXISTS slack_enabled BOOLEAN DEFAULT false;

-- Index for quick Slack-enabled user lookups
CREATE INDEX IF NOT EXISTS profiles_slack_enabled_idx ON profiles(slack_enabled) WHERE slack_enabled = true;

COMMENT ON COLUMN profiles.slack_workspace_id IS 'Slack workspace (team) ID';
COMMENT ON COLUMN profiles.slack_workspace_name IS 'Slack workspace name for display';
COMMENT ON COLUMN profiles.slack_access_token IS 'OAuth access token for posting to Slack';
COMMENT ON COLUMN profiles.slack_channel_id IS 'Selected channel ID for notifications';
COMMENT ON COLUMN profiles.slack_channel_name IS 'Selected channel name for display';
COMMENT ON COLUMN profiles.slack_enabled IS 'Whether Slack notifications are enabled';
