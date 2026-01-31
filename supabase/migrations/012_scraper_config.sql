-- Scraper Configuration and Status Tracking
-- Allows users to configure what companies to track and see scrape progress

-- =====================
-- SCRAPER CONFIGURATION
-- =====================

CREATE TABLE IF NOT EXISTS public.scraper_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Target companies to scrape (array of company names)
    target_companies text[] DEFAULT ARRAY['Stripe', 'Shopify', 'HubSpot', 'Salesforce', 'Twilio']::text[],

    -- Job title keywords that indicate buying signals
    signal_keywords text[] DEFAULT ARRAY['Sales Director', 'Account Executive', 'Business Development', 'VP Sales', 'Head of Growth', 'Marketing Director', 'Enterprise Sales']::text[],

    -- Enabled scrape sources
    source_techcrunch boolean DEFAULT true,
    source_indeed boolean DEFAULT true,
    source_linkedin boolean DEFAULT false,  -- Requires Bright Data credentials
    source_company_newsrooms boolean DEFAULT true,

    -- Scrape interval in minutes (default 30, min 15, max 1440)
    scrape_interval_minutes integer DEFAULT 30 CHECK (scrape_interval_minutes >= 15 AND scrape_interval_minutes <= 1440),

    -- Auto-scrape enabled
    auto_scrape_enabled boolean DEFAULT true,

    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    UNIQUE(user_id)
);

-- =====================
-- SCRAPE RUNS (STATUS/PROGRESS)
-- =====================

CREATE TYPE scrape_status AS ENUM ('pending', 'running', 'completed', 'failed');

CREATE TABLE IF NOT EXISTS public.scrape_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,  -- NULL = system-wide scrape

    status scrape_status DEFAULT 'pending',

    -- Progress tracking
    started_at timestamptz,
    completed_at timestamptz,
    estimated_duration_seconds integer,  -- Estimated time remaining

    -- Scraper progress (which sources have been processed)
    progress jsonb DEFAULT '{}'::jsonb,
    -- Example: {"techcrunch": {"status": "completed", "signals": 5}, "indeed": {"status": "running", "signals": 0}}

    -- Results
    total_signals integer DEFAULT 0,
    signals_by_source jsonb DEFAULT '{}'::jsonb,
    ai_enriched_count integer DEFAULT 0,

    -- Error tracking
    error_message text,
    error_details jsonb,

    created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scraper_config_user ON public.scraper_config(user_id);
CREATE INDEX IF NOT EXISTS idx_scrape_runs_user ON public.scrape_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_scrape_runs_status ON public.scrape_runs(status);
CREATE INDEX IF NOT EXISTS idx_scrape_runs_created ON public.scrape_runs(created_at DESC);

-- =====================
-- RLS POLICIES
-- =====================

ALTER TABLE public.scraper_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scrape_runs ENABLE ROW LEVEL SECURITY;

-- Scraper config: Users can only see/edit their own config
CREATE POLICY "Users can view own scraper config"
    ON public.scraper_config FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scraper config"
    ON public.scraper_config FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scraper config"
    ON public.scraper_config FOR UPDATE
    USING (auth.uid() = user_id);

-- Scrape runs: Users can see their own runs + system runs (user_id = NULL)
CREATE POLICY "Users can view own and system scrape runs"
    ON public.scrape_runs FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert scrape runs"
    ON public.scrape_runs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- System can update any scrape run (for worker)
CREATE POLICY "Service role can manage scrape runs"
    ON public.scrape_runs FOR ALL
    USING (true)
    WITH CHECK (true);

-- =====================
-- AUTO-CREATE CONFIG ON USER SIGNUP
-- =====================

CREATE OR REPLACE FUNCTION create_default_scraper_config()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.scraper_config (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Trigger to create config when profile is created
DROP TRIGGER IF EXISTS on_profile_created_scraper_config ON public.profiles;
CREATE TRIGGER on_profile_created_scraper_config
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_scraper_config();

-- =====================
-- UPDATED_AT TRIGGER
-- =====================

CREATE OR REPLACE FUNCTION update_scraper_config_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_scraper_config_timestamp ON public.scraper_config;
CREATE TRIGGER update_scraper_config_timestamp
    BEFORE UPDATE ON public.scraper_config
    FOR EACH ROW
    EXECUTE FUNCTION update_scraper_config_updated_at();

-- =====================
-- HELPER FUNCTION: GET ACTIVE CONFIG
-- =====================

CREATE OR REPLACE FUNCTION get_active_scraper_configs()
RETURNS TABLE (
    user_id uuid,
    target_companies text[],
    signal_keywords text[],
    sources jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sc.user_id,
        sc.target_companies,
        sc.signal_keywords,
        jsonb_build_object(
            'techcrunch', sc.source_techcrunch,
            'indeed', sc.source_indeed,
            'linkedin', sc.source_linkedin,
            'company', sc.source_company_newsrooms
        ) as sources
    FROM public.scraper_config sc
    WHERE sc.auto_scrape_enabled = true;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION get_active_scraper_configs() TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_scraper_configs() TO service_role;
