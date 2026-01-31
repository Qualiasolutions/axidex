import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ScraperProgress } from "@/types/scraper";

// Simulate scraping a source with delays
async function simulateScrapeSource(
  supabase: Awaited<ReturnType<typeof createClient>>,
  runId: string,
  source: string,
  progress: ScraperProgress,
  delayMs: number
): Promise<number> {
  // Mark source as running
  progress[source] = { status: "running", signals: 0 };
  await supabase
    .from("scrape_runs")
    .update({ progress })
    .eq("id", runId);

  // Simulate scraping delay
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  // Generate random signals (1-8 per source)
  const signals = Math.floor(Math.random() * 8) + 1;

  // Mark source as completed
  progress[source] = { status: "completed", signals };
  await supabase
    .from("scrape_runs")
    .update({ progress })
    .eq("id", runId);

  return signals;
}

// Run the scrape simulation in the background
async function runScrapingSimulation(runId: string, userId: string) {
  const supabase = await createClient();

  // Get user's config to know which sources are enabled
  const { data: config } = await supabase
    .from("scraper_config")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!config) {
    await supabase
      .from("scrape_runs")
      .update({
        status: "failed",
        error_message: "No scraper configuration found",
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);
    return;
  }

  // Determine which sources to scrape based on config
  const sources: { key: string; name: string }[] = [];
  if (config.source_techcrunch) sources.push({ key: "source_techcrunch", name: "techcrunch" });
  if (config.source_indeed) sources.push({ key: "source_indeed", name: "indeed" });
  if (config.source_linkedin) sources.push({ key: "source_linkedin", name: "linkedin" });
  if (config.source_company_newsrooms) sources.push({ key: "source_company_newsrooms", name: "newsrooms" });

  if (sources.length === 0) {
    await supabase
      .from("scrape_runs")
      .update({
        status: "failed",
        error_message: "No data sources enabled",
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId);
    return;
  }

  // Initialize progress with all sources as pending
  const progress: ScraperProgress = {};
  const signalsBySource: Record<string, number> = {};

  for (const source of sources) {
    progress[source.name] = { status: "pending", signals: 0 };
  }

  // Update run to running status
  const estimatedDuration = sources.length * 3; // ~3 seconds per source
  await supabase
    .from("scrape_runs")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
      estimated_duration_seconds: estimatedDuration,
      progress,
    })
    .eq("id", runId);

  // Scrape each source sequentially with delays
  let totalSignals = 0;

  for (const source of sources) {
    try {
      const signals = await simulateScrapeSource(
        supabase,
        runId,
        source.name,
        progress,
        2000 + Math.random() * 2000 // 2-4 seconds per source
      );
      signalsBySource[source.name] = signals;
      totalSignals += signals;
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      progress[source.name] = { status: "failed", signals: 0, error: "Scrape failed" };
    }
  }

  // Calculate AI enriched count (simulate ~60% of signals being enriched)
  const aiEnrichedCount = Math.floor(totalSignals * 0.6);

  // Mark run as completed
  await supabase
    .from("scrape_runs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      progress,
      total_signals: totalSignals,
      signals_by_source: signalsBySource,
      ai_enriched_count: aiEnrichedCount,
    })
    .eq("id", runId);

  // Create some mock signals in the signals table
  const signalTypes = ["hiring", "funding", "expansion", "partnership", "product_launch"];
  const priorities = ["high", "medium", "low"];
  const companies = config.target_companies || ["Stripe", "Shopify", "HubSpot"];

  const mockSignals = [];
  for (let i = 0; i < Math.min(totalSignals, 10); i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const signalType = signalTypes[Math.floor(Math.random() * signalTypes.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const sourceKeys = Object.keys(signalsBySource);
    const source = sourceKeys[Math.floor(Math.random() * sourceKeys.length)];

    mockSignals.push({
      user_id: userId,
      company_name: company,
      company_domain: `${company.toLowerCase().replace(/\s+/g, "")}.com`,
      signal_type: signalType,
      priority,
      title: `${company} ${signalType === "hiring" ? "is hiring" : signalType === "funding" ? "raised funding" : signalType === "expansion" ? "is expanding" : signalType === "partnership" ? "announced partnership" : "launched new product"}`,
      summary: `Signal detected from ${source} indicating ${signalType} activity at ${company}.`,
      source_url: `https://${source}.com/article/${Date.now()}`,
      source_name: source,
      raw_data: { scrape_run_id: runId },
      detected_at: new Date().toISOString(),
    });
  }

  if (mockSignals.length > 0) {
    await supabase.from("signals").insert(mockSignals);
  }
}

// POST /api/scraper/trigger - Trigger a manual scrape run
export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if there's already a running scrape for this user
    const { data: existingRun } = await supabase
      .from("scrape_runs")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("status", "running")
      .limit(1)
      .single();

    if (existingRun) {
      return NextResponse.json(
        { error: "A scrape is already running", runId: existingRun.id },
        { status: 409 }
      );
    }

    // Create a new scrape run in pending state
    const { data: newRun, error } = await supabase
      .from("scrape_runs")
      .insert({
        user_id: user.id,
        status: "pending",
        progress: {},
        signals_by_source: {},
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating scrape run:", error);
      return NextResponse.json(
        { error: "Failed to trigger scrape" },
        { status: 500 }
      );
    }

    // Start the scraping simulation in the background (fire and forget)
    // In production, this would be a queue/worker system
    runScrapingSimulation(newRun.id, user.id).catch((err) => {
      console.error("Background scraping error:", err);
    });

    return NextResponse.json({
      success: true,
      runId: newRun.id,
      message: "Scrape started. Monitoring progress...",
    });
  } catch (error) {
    console.error("Unexpected error in scraper trigger API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
