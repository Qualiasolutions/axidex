-- Axidex Database Schema
-- Migration: 011_crm_integrations.sql
-- Adds CRM integration support for HubSpot, Salesforce, Pipedrive, Zoho

-- CRM provider enum type
DO $$ BEGIN
  CREATE TYPE crm_provider AS ENUM ('hubspot', 'salesforce', 'pipedrive', 'zoho', 'apollo', 'attio');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CRM sync status enum
DO $$ BEGIN
  CREATE TYPE crm_sync_status AS ENUM ('pending', 'syncing', 'success', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CRM integrations table - stores OAuth tokens and settings per user
CREATE TABLE IF NOT EXISTS crm_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider crm_provider NOT NULL,

  -- OAuth tokens
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Provider-specific identifiers
  instance_url TEXT, -- Salesforce instance URL
  portal_id TEXT, -- HubSpot portal ID
  account_id TEXT, -- Generic account identifier

  -- Connection metadata
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  connected_by_email TEXT,

  -- Sync settings
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_on_signal_types TEXT[] DEFAULT ARRAY['hiring', 'funding', 'expansion', 'partnership', 'product_launch', 'leadership_change'],
  sync_on_priorities TEXT[] DEFAULT ARRAY['high', 'medium'],

  -- Field mapping configuration (signal field -> CRM field)
  field_mapping JSONB DEFAULT '{
    "company_name": "company",
    "company_domain": "website",
    "signal_type": "lead_source",
    "title": "description",
    "summary": "notes",
    "priority": "priority",
    "source_url": "source"
  }'::jsonb,

  -- What to create in CRM
  create_company BOOLEAN DEFAULT true,
  create_contact BOOLEAN DEFAULT false,
  create_deal BOOLEAN DEFAULT false,
  create_note BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each user can only have one integration per provider
  UNIQUE(user_id, provider)
);

-- CRM sync logs - tracks each signal sync attempt
CREATE TABLE IF NOT EXISTS crm_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES crm_integrations(id) ON DELETE CASCADE,
  signal_id UUID NOT NULL REFERENCES signals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Sync details
  status crm_sync_status DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- What was created/updated
  crm_company_id TEXT,
  crm_contact_id TEXT,
  crm_deal_id TEXT,
  crm_note_id TEXT,

  -- Error tracking
  error_message TEXT,
  error_code TEXT,
  retry_count INT DEFAULT 0,

  -- Request/response for debugging
  request_payload JSONB,
  response_payload JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate syncs
  UNIQUE(integration_id, signal_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS crm_integrations_user_id_idx ON crm_integrations(user_id);
CREATE INDEX IF NOT EXISTS crm_integrations_provider_idx ON crm_integrations(provider);
CREATE INDEX IF NOT EXISTS crm_integrations_auto_sync_idx ON crm_integrations(auto_sync_enabled) WHERE auto_sync_enabled = true;

CREATE INDEX IF NOT EXISTS crm_sync_logs_integration_id_idx ON crm_sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS crm_sync_logs_signal_id_idx ON crm_sync_logs(signal_id);
CREATE INDEX IF NOT EXISTS crm_sync_logs_user_id_idx ON crm_sync_logs(user_id);
CREATE INDEX IF NOT EXISTS crm_sync_logs_status_idx ON crm_sync_logs(status);
CREATE INDEX IF NOT EXISTS crm_sync_logs_pending_idx ON crm_sync_logs(status, retry_count) WHERE status = 'pending' OR status = 'failed';

-- RLS policies
ALTER TABLE crm_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_sync_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own integrations
CREATE POLICY "Users can view own integrations" ON crm_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own integrations" ON crm_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON crm_integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON crm_integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own sync logs
CREATE POLICY "Users can view own sync logs" ON crm_sync_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sync logs" ON crm_sync_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync logs" ON crm_sync_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE crm_integrations IS 'Stores CRM OAuth tokens and sync settings per user';
COMMENT ON TABLE crm_sync_logs IS 'Tracks individual signal-to-CRM sync attempts';
COMMENT ON COLUMN crm_integrations.field_mapping IS 'Maps Axidex signal fields to CRM-specific field names';
COMMENT ON COLUMN crm_integrations.sync_on_signal_types IS 'Only auto-sync signals of these types';
COMMENT ON COLUMN crm_integrations.sync_on_priorities IS 'Only auto-sync signals with these priorities';
