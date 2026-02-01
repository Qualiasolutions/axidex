import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GDPR Data Export Endpoint
 * GET /api/account/export
 *
 * Returns all user data in a downloadable JSON format.
 * Sensitive data (tokens, secrets) are redacted.
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all user data in parallel
    const [
      profileResult,
      signalsResult,
      emailsResult,
      rulesResult,
      crmIntegrationsResult,
      syncLogsResult,
      scraperConfigResult,
      scrapeRunsResult,
      subscriptionsResult,
    ] = await Promise.all([
      // Profile data
      supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, company_name, subscription_status, subscription_tier, created_at, updated_at")
        .eq("id", user.id)
        .single(),

      // Signals
      supabase
        .from("signals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      // Generated emails
      supabase
        .from("generated_emails")
        .select("id, signal_id, subject, body, tone, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),

      // Automation rules
      supabase
        .from("automation_rules")
        .select("id, name, description, trigger_conditions, actions, is_active, created_at, updated_at")
        .eq("user_id", user.id),

      // CRM integrations (tokens redacted)
      supabase
        .from("crm_integrations")
        .select("id, provider, connected_at, connected_by_email, auto_sync_enabled, sync_on_signal_types, sync_on_priorities, field_mapping, create_company, create_contact, create_deal, create_note, created_at")
        .eq("user_id", user.id),

      // CRM sync logs
      supabase
        .from("crm_sync_logs")
        .select("id, integration_id, signal_id, status, started_at, completed_at, crm_company_id, crm_note_id, error_message, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1000),

      // Scraper config
      supabase
        .from("scraper_config")
        .select("id, target_companies, signal_keywords, source_techcrunch, source_indeed, source_linkedin, source_company_newsrooms, scrape_interval_minutes, auto_scrape_enabled, created_at, updated_at")
        .eq("user_id", user.id)
        .single(),

      // Scrape runs
      supabase
        .from("scrape_runs")
        .select("id, status, started_at, completed_at, total_signals, signals_by_source, error_message, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100),

      // Subscriptions
      supabase
        .from("subscriptions")
        .select("id, status, tier, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    // Build export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      email: user.email,
      profile: profileResult.data || null,
      signals: signalsResult.data || [],
      generatedEmails: emailsResult.data || [],
      automationRules: rulesResult.data || [],
      crmIntegrations: crmIntegrationsResult.data || [],
      crmSyncLogs: syncLogsResult.data || [],
      scraperConfig: scraperConfigResult.data || null,
      scrapeRuns: scrapeRunsResult.data || [],
      subscriptions: subscriptionsResult.data || [],
      _metadata: {
        signalsCount: signalsResult.data?.length || 0,
        emailsCount: emailsResult.data?.length || 0,
        rulesCount: rulesResult.data?.length || 0,
        integrationsCount: crmIntegrationsResult.data?.length || 0,
        note: "Sensitive data (OAuth tokens, API keys) has been redacted for security.",
      },
    };

    // Return as downloadable JSON file
    const json = JSON.stringify(exportData, null, 2);
    const filename = `axidex-data-export-${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
