-- Create automation_rules table for storing user-defined automation rules
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_conditions JSONB NOT NULL DEFAULT '{}',
  actions JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own rules
CREATE POLICY "Users can manage own rules" ON automation_rules
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- Add status column to generated_emails if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generated_emails' AND column_name = 'status'
  ) THEN
    ALTER TABLE generated_emails ADD COLUMN status TEXT DEFAULT 'draft';
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_automation_rules_user_id ON automation_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_is_active ON automation_rules(is_active);
