import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ScraperStatusResponse, ScrapeRun, ScraperProgress } from "@/types/scraper";

// GET /api/scraper/status - Get current scraper status and latest run
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch config and latest run in parallel
    const [configResult, latestRunResult] = await Promise.all([
      supabase
        .from("scraper_config")
        .select("*")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("scrape_runs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    let config = configResult.data;
    const latestRunData = latestRunResult.data;

    // Auto-create config if it doesn't exist
    if (!config && (!configResult.error || configResult.error.code === "PGRST116")) {
      const { data: newConfig } = await supabase
        .from("scraper_config")
        .insert({ user_id: user.id })
        .select()
        .single();
      config = newConfig;
    }

    // Check if a scrape is currently running for this user
    const { data: runningRunData } = await supabase
      .from("scrape_runs")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "running")
      .limit(1)
      .single();

    // Convert database types to our ScrapeRun type
    const toScrapeRun = (data: typeof latestRunData): ScrapeRun | null => {
      if (!data) return null;
      return {
        ...data,
        progress: (data.progress || {}) as ScraperProgress,
        signals_by_source: (data.signals_by_source || {}) as Record<string, number>,
        error_details: data.error_details as Record<string, unknown> | null,
      };
    };

    const latestRun = toScrapeRun(latestRunData);
    const runningRun = toScrapeRun(runningRunData);

    // Calculate next scheduled run
    let nextScheduledRun: string | null = null;
    if (config?.auto_scrape_enabled && latestRun?.completed_at) {
      const lastCompleted = new Date(latestRun.completed_at);
      const intervalMs = (config.scrape_interval_minutes || 30) * 60 * 1000;
      nextScheduledRun = new Date(lastCompleted.getTime() + intervalMs).toISOString();
    }

    const response: ScraperStatusResponse = {
      config: config || null,
      latestRun: runningRun || latestRun,
      isRunning: !!runningRun,
      nextScheduledRun,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in scraper status API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
