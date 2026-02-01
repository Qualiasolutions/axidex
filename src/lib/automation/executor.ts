import { createClient } from "@/lib/supabase/server";
import { syncSignalToCRM } from "@/lib/crm";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import type { Signal, AutomationRule, CRMIntegration, CRMProvider } from "@/types";

interface ActionResult {
  action_type: string;
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

/**
 * Check if a signal matches rule trigger conditions
 */
export function matchesConditions(
  signal: Signal,
  conditions: AutomationRule["trigger_conditions"]
): boolean {
  // Check signal types
  if (conditions.signal_types?.length) {
    if (!conditions.signal_types.includes(signal.signal_type)) {
      return false;
    }
  }

  // Check priorities
  if (conditions.priorities?.length) {
    if (!conditions.priorities.includes(signal.priority)) {
      return false;
    }
  }

  // Check keywords (in title or summary)
  if (conditions.keywords?.length) {
    const text = `${signal.title} ${signal.summary}`.toLowerCase();
    const hasKeyword = conditions.keywords.some((kw) =>
      text.includes(kw.toLowerCase())
    );
    if (!hasKeyword) return false;
  }

  // Check companies
  if (conditions.companies?.length) {
    const companyMatch = conditions.companies.some(
      (c) =>
        signal.company_name.toLowerCase().includes(c.toLowerCase()) ||
        signal.company_domain?.toLowerCase().includes(c.toLowerCase())
    );
    if (!companyMatch) return false;
  }

  return true;
}

/**
 * Execute a single action for a signal
 */
async function executeAction(
  action: AutomationRule["actions"][0],
  signal: Signal,
  userId: string
): Promise<ActionResult> {
  switch (action.type) {
    case "push_to_crm":
      return executePushToCrm(signal, userId, action.config);

    case "generate_email":
      return executeGenerateEmail(signal, userId, action.config);

    case "mark_status":
      return executeMarkStatus(signal, userId, action.config);

    case "notify":
      return executeNotify(signal, userId, action.config);

    default:
      return {
        action_type: action.type,
        success: false,
        error: `Unknown action type: ${action.type}`,
      };
  }
}

/**
 * Push signal to connected CRMs
 */
async function executePushToCrm(
  signal: Signal,
  userId: string,
  config: Record<string, unknown>
): Promise<ActionResult> {
  const supabase = await createClient();

  // Get user's CRM integrations
  let query = supabase
    .from("crm_integrations")
    .select("*")
    .eq("user_id", userId)
    .eq("auto_sync_enabled", true);

  // If specific provider is specified in config
  if (config.provider) {
    query = query.eq("provider", config.provider as CRMProvider);
  }

  const { data: integrations, error } = await query;

  if (error || !integrations?.length) {
    return {
      action_type: "push_to_crm",
      success: false,
      error: "No CRM integrations found",
    };
  }

  const results = await Promise.all(
    (integrations as unknown as CRMIntegration[]).map(async (integration) => {
      try {
        const result = await syncSignalToCRM(integration, signal);

        // Log the sync
        await supabase.from("crm_sync_logs").insert({
          integration_id: integration.id,
          signal_id: signal.id,
          user_id: userId,
          status: result.success ? "success" : "failed",
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          crm_company_id: result.companyId || null,
          crm_note_id: result.noteId || null,
          error_message: result.error || null,
        });

        return { provider: integration.provider, ...result };
      } catch (err) {
        return {
          provider: integration.provider,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        };
      }
    })
  );

  const successful = results.filter((r) => r.success);

  return {
    action_type: "push_to_crm",
    success: successful.length > 0,
    data: { results },
    error:
      successful.length === 0 ? "All CRM syncs failed" : undefined,
  };
}

/**
 * Generate email for signal
 */
async function executeGenerateEmail(
  signal: Signal,
  userId: string,
  config: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const response = await fetchWithTimeout(
      `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/signals/${signal.id}/email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone: config.tone || "professional",
        }),
        timeout: 45000, // AI generation can take time
        retries: 1,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate email");
    }

    const data = await response.json();

    return {
      action_type: "generate_email",
      success: true,
      data: { emailId: data.email?.id },
    };
  } catch (err) {
    return {
      action_type: "generate_email",
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Update signal status
 */
async function executeMarkStatus(
  signal: Signal,
  _userId: string,
  config: Record<string, unknown>
): Promise<ActionResult> {
  const supabase = await createClient();
  const newStatus = config.status as string;

  if (!newStatus) {
    return {
      action_type: "mark_status",
      success: false,
      error: "No status specified",
    };
  }

  const { error } = await supabase
    .from("signals")
    .update({ status: newStatus })
    .eq("id", signal.id);

  if (error) {
    return {
      action_type: "mark_status",
      success: false,
      error: error.message,
    };
  }

  return {
    action_type: "mark_status",
    success: true,
    data: { newStatus },
  };
}

/**
 * Send notification (Slack/email)
 */
async function executeNotify(
  signal: Signal,
  notifyUserId: string,
  config: Record<string, unknown>
): Promise<ActionResult> {
  const channels = (config.channels as string[]) || ["slack", "email"];
  const results: Record<string, boolean> = {};

  // Slack notification
  if (channels.includes("slack")) {
    try {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("slack_access_token, slack_channel_id, slack_enabled")
        .eq("id", notifyUserId)
        .single();

      if (profile?.slack_enabled && profile.slack_access_token && profile.slack_channel_id) {
        const { postToSlack } = await import("@/lib/slack");
        const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || "https://axidex.vercel.app";
        await postToSlack(
          profile.slack_access_token,
          profile.slack_channel_id,
          signal,
          dashboardUrl
        );
        results.slack = true;
      }
    } catch (err) {
      console.error("Slack notification failed:", err);
      results.slack = false;
    }
  }

  // Email notification
  if (channels.includes("email")) {
    try {
      const response = await fetchWithTimeout(
        `${process.env.NEXT_PUBLIC_APP_URL || ""}/api/send-notification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Api-Key": process.env.INTERNAL_API_KEY || "",
          },
          body: JSON.stringify({ signal }),
          timeout: 15000,
          retries: 2,
        }
      );
      results.email = response.ok;
    } catch (err) {
      console.error("Email notification failed:", err);
      results.email = false;
    }
  }

  const anySuccess = Object.values(results).some((v) => v);

  return {
    action_type: "notify",
    success: anySuccess,
    data: { results },
  };
}

/**
 * Execute all actions for a rule on a signal
 */
export async function executeRule(
  rule: AutomationRule,
  signal: Signal,
  userId: string
): Promise<ActionResult[]> {
  if (!rule.is_active) {
    return [];
  }

  if (!matchesConditions(signal, rule.trigger_conditions)) {
    return [];
  }

  const results = await Promise.all(
    rule.actions.map((action) => executeAction(action, signal, userId))
  );

  return results;
}

/**
 * Process a new signal against all active rules for a user
 */
export async function processSignalWithRules(
  signal: Signal,
  userId: string
): Promise<{ rule_id: string; rule_name: string; results: ActionResult[] }[]> {
  const supabase = await createClient();

  // Get all active rules for the user
  const { data: rules, error } = await supabase
    .from("automation_rules")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error || !rules?.length) {
    return [];
  }

  const allResults = await Promise.all(
    (rules as AutomationRule[]).map(async (rule) => {
      const results = await executeRule(rule, signal, userId);
      return {
        rule_id: rule.id,
        rule_name: rule.name,
        results,
      };
    })
  );

  // Filter out rules that didn't match
  return allResults.filter((r) => r.results.length > 0);
}
