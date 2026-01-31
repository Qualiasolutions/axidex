-- Migration: Add onboarding tracking to profiles
-- Phase: 15-onboarding
-- Plan: 01 - Welcome modal and feature tour

-- Add onboarding tracking column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.onboarding_completed_at IS 'Timestamp when user completed onboarding flow, NULL means not completed';

-- Index for querying users who haven't completed onboarding (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_incomplete
ON public.profiles (id)
WHERE onboarding_completed_at IS NULL;
