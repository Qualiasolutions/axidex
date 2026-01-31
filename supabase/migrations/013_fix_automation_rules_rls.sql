-- Fix duplicate RLS policies on automation_rules table
-- The "Users can manage own rules" FOR ALL policy already covers all operations,
-- so the individual SELECT/INSERT/UPDATE/DELETE policies are redundant

DROP POLICY IF EXISTS "Users can view own rules" ON automation_rules;
DROP POLICY IF EXISTS "Users can create own rules" ON automation_rules;
DROP POLICY IF EXISTS "Users can update own rules" ON automation_rules;
DROP POLICY IF EXISTS "Users can delete own rules" ON automation_rules;

-- Keep only "Users can manage own rules" which handles all operations
