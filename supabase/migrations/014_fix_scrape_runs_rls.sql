-- Fix overly permissive RLS policy on scrape_runs table
-- The "Service role can manage scrape runs" policy with USING (true) allows
-- ANY authenticated user to modify ANY scrape run, which is a security issue.
-- Service role already bypasses RLS automatically, so this policy is unnecessary.

DROP POLICY IF EXISTS "Service role can manage scrape runs" ON public.scrape_runs;

-- Users can only update their own scrape runs
CREATE POLICY "Users can update own scrape runs"
    ON public.scrape_runs FOR UPDATE
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can only delete their own scrape runs
CREATE POLICY "Users can delete own scrape runs"
    ON public.scrape_runs FOR DELETE
    USING ((SELECT auth.uid()) = user_id);
