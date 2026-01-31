import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    // The worker will pick this up and start processing
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

    // In production, you'd trigger the worker here via:
    // - Railway webhook
    // - AWS Lambda
    // - Supabase Edge Function
    // For now, the worker polls for pending runs

    return NextResponse.json({
      success: true,
      runId: newRun.id,
      message: "Scrape triggered. The worker will start processing shortly.",
    });
  } catch (error) {
    console.error("Unexpected error in scraper trigger API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
