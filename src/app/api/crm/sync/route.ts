import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncSignalToCRM } from "@/lib/crm";
import type { CRMIntegration, Signal } from "@/types";

// POST /api/crm/sync - Sync a signal to connected CRMs
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { signalId, integrationId } = body;

  if (!signalId) {
    return NextResponse.json({ error: "Signal ID required" }, { status: 400 });
  }

  // Get the signal
  const { data: signal, error: signalError } = await supabase
    .from("signals")
    .select("*")
    .eq("id", signalId)
    .single();

  if (signalError || !signal) {
    return NextResponse.json({ error: "Signal not found" }, { status: 404 });
  }

  // Get integrations to sync to
  let integrationQuery = supabase
    .from("crm_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("auto_sync_enabled", true);

  if (integrationId) {
    integrationQuery = integrationQuery.eq("id", integrationId);
  }

  const { data: integrations, error: intError } = await integrationQuery;

  if (intError) {
    console.error("Error fetching CRM integrations:", intError);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }

  if (!integrations || integrations.length === 0) {
    return NextResponse.json(
      { error: "No CRM integrations found" },
      { status: 404 }
    );
  }

  // Sync to each integration
  const results = await Promise.all(
    (integrations as unknown as CRMIntegration[]).map(async (integration) => {
      // Create sync log entry
      const { data: syncLog, error: logError } = await supabase
        .from("crm_sync_logs")
        .insert({
          integration_id: integration.id,
          signal_id: signalId,
          user_id: user.id,
          status: "syncing",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (logError) {
        console.error("Error creating sync log:", logError);
        return {
          provider: integration.provider,
          success: false,
          error: "Failed to create sync log",
        };
      }

      // Perform sync
      const result = await syncSignalToCRM(integration, signal as Signal);

      // Update sync log with result
      await supabase
        .from("crm_sync_logs")
        .update({
          status: result.success ? "success" : "failed",
          completed_at: new Date().toISOString(),
          crm_company_id: result.companyId || null,
          crm_contact_id: result.contactId || null,
          crm_deal_id: result.dealId || null,
          crm_note_id: result.noteId || null,
          error_message: result.error || null,
        })
        .eq("id", syncLog.id);

      return {
        provider: integration.provider,
        integrationId: integration.id,
        ...result,
      };
    })
  );

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  return NextResponse.json({
    success: failed.length === 0,
    results,
    summary: {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
    },
  });
}

// GET /api/crm/sync - Get sync history for a signal
export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const signalId = searchParams.get("signalId");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = supabase
    .from("crm_sync_logs")
    .select(
      `
      *,
      crm_integrations (
        provider,
        portal_id,
        instance_url
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (signalId) {
    query = query.eq("signal_id", signalId);
  }

  const { data: logs, error } = await query;

  if (error) {
    console.error("Error fetching sync logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch sync logs" },
      { status: 500 }
    );
  }

  return NextResponse.json({ logs });
}
