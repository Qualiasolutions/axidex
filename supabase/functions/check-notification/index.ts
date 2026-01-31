// Supabase Edge Function: check-notification
// Triggered by database webhook on signals INSERT
// Evaluates user notification preferences and sends email if criteria match

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Type definitions
interface Signal {
  id: string;
  user_id: string;
  company_name: string;
  signal_type: string;
  title: string;
  summary: string;
  priority: "high" | "medium" | "low";
}

interface NotificationPreferences {
  email_enabled: boolean;
  signal_types: string[];
  priority_threshold: "high" | "medium" | "low";
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: Signal;
  old_record: Signal | null;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  notification_preferences: NotificationPreferences | null;
  slack_enabled: boolean | null;
  slack_access_token: string | null;
  slack_channel_id: string | null;
}

interface SlackPostResult {
  ok: boolean;
  error?: string;
}

// Priority level mapping for comparison
const priorityLevels: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

// Emoji mappings for Slack messages
const priorityEmoji: Record<string, string> = {
  high: "🔴",
  medium: "🟡",
  low: "🟢",
};

const typeEmoji: Record<string, string> = {
  hiring: "👥",
  funding: "💰",
  expansion: "🌍",
  partnership: "🤝",
  product_launch: "🚀",
  leadership_change: "👔",
};

// Check if signal priority meets threshold
function meetsPriorityThreshold(
  signalPriority: string,
  threshold: string
): boolean {
  const signalLevel = priorityLevels[signalPriority] || 0;
  const thresholdLevel = priorityLevels[threshold] || 0;
  return signalLevel >= thresholdLevel;
}

// Default notification preferences
const DEFAULT_PREFS: NotificationPreferences = {
  email_enabled: true,
  signal_types: [
    "hiring",
    "funding",
    "expansion",
    "partnership",
    "product_launch",
    "leadership_change",
  ],
  priority_threshold: "high",
};

// Post notification to Slack channel
async function postToSlack(
  accessToken: string,
  channelId: string,
  signal: {
    id: string;
    company_name: string;
    title: string;
    summary: string;
    priority: string;
    signal_type: string;
    source_url?: string;
    source_name?: string;
  },
  dashboardUrl: string
): Promise<SlackPostResult> {
  const priorityIcon = priorityEmoji[signal.priority] || "⚪";
  const typeIcon = typeEmoji[signal.signal_type] || "📊";

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${priorityIcon} New ${signal.priority.toUpperCase()} Priority Signal`,
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${signal.company_name}*\n${typeIcon} ${signal.title}`,
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "View in Dashboard",
          emoji: true,
        },
        url: `${dashboardUrl}/dashboard/signals/${signal.id}`,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: signal.summary,
      },
    },
  ];

  // Add source context if available
  if (signal.source_url && signal.source_name) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Source: <${signal.source_url}|${signal.source_name}>`,
        },
      ],
    } as typeof blocks[0]);
  }

  const message = {
    channel: channelId,
    text: `${priorityIcon} New ${signal.priority} priority signal from ${signal.company_name}: ${signal.title}`,
    blocks,
  };

  try {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error("Slack API error:", data.error);
      return { ok: false, error: data.error };
    }

    return { ok: true };
  } catch (err) {
    console.error("Error posting to Slack:", err);
    return { ok: false, error: "Failed to post message" };
  }
}

serve(async (req: Request) => {
  try {
    // Parse webhook payload
    const payload: WebhookPayload = await req.json();

    console.log(`Received webhook: ${payload.type} on ${payload.table}`);

    // Only process INSERT events on signals table
    if (payload.type !== "INSERT" || payload.table !== "signals") {
      return new Response(
        JSON.stringify({ skipped: true, reason: "Not a signals INSERT" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const signal = payload.record;

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials");
      return new Response(
        JSON.stringify({ error: "Missing Supabase configuration" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user profile and notification preferences (including Slack fields)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, notification_preferences, slack_enabled, slack_access_token, slack_channel_id")
      .eq("id", signal.user_id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({
          error: "User not found",
          userId: signal.user_id,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get preferences with defaults
    const prefs: NotificationPreferences =
      (profile as Profile).notification_preferences || DEFAULT_PREFS;
    const typedProfile = profile as Profile;

    // Check signal type and priority filters (applies to both email and Slack)
    const signalTypeAllowed = prefs.signal_types.includes(signal.signal_type);
    const priorityMet = meetsPriorityThreshold(signal.priority, prefs.priority_threshold);

    if (!signalTypeAllowed) {
      console.log(
        `User ${signal.user_id}: Signal type ${signal.signal_type} not in allowed types`
      );
      return new Response(
        JSON.stringify({
          skipped: true,
          reason: `Signal type ${signal.signal_type} not in preferences`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!priorityMet) {
      console.log(
        `User ${signal.user_id}: Signal priority ${signal.priority} below threshold ${prefs.priority_threshold}`
      );
      return new Response(
        JSON.stringify({
          skipped: true,
          reason: `Priority ${signal.priority} below threshold ${prefs.priority_threshold}`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Signal passes filters - send notifications based on user preferences
    const appUrl = Deno.env.get("APP_URL") || "https://axidex.vercel.app";
    const dashboardUrl = Deno.env.get("DASHBOARD_URL") || appUrl;
    const internalApiKey = Deno.env.get("INTERNAL_API_KEY");

    let emailSent = false;
    let emailId: string | undefined;
    let emailError: string | undefined;
    let slackSent = false;
    let slackError: string | undefined;

    // Email notification (if enabled)
    if (prefs.email_enabled) {
      const notificationPayload = {
        email: typedProfile.email,
        userName: typedProfile.full_name || typedProfile.email.split("@")[0],
        signal: {
          id: signal.id,
          company_name: signal.company_name,
          signal_type: signal.signal_type,
          title: signal.title,
          summary: signal.summary,
          priority: signal.priority,
        },
      };

      console.log(`Sending email notification to ${typedProfile.email} for signal ${signal.id}`);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (internalApiKey) {
        headers["Authorization"] = `Bearer ${internalApiKey}`;
      }

      try {
        const response = await fetch(`${appUrl}/api/send-notification`, {
          method: "POST",
          headers,
          body: JSON.stringify(notificationPayload),
        });

        const result = await response.json();

        if (response.ok) {
          emailSent = true;
          emailId = result.id;
          console.log(`Email notification sent successfully: ${result.id}`);
        } else {
          console.error("Email notification API error:", result);
          emailError = result.error || "Failed to send email";
        }
      } catch (err) {
        console.error("Error sending email notification:", err);
        emailError = err instanceof Error ? err.message : "Unknown error";
      }
    } else {
      console.log(`User ${signal.user_id}: Email notifications disabled`);
    }

    // Slack notification (if enabled and connected)
    if (typedProfile.slack_enabled && typedProfile.slack_access_token && typedProfile.slack_channel_id) {
      console.log(`Sending Slack notification for signal ${signal.id}`);

      const slackResult = await postToSlack(
        typedProfile.slack_access_token,
        typedProfile.slack_channel_id,
        {
          id: signal.id,
          company_name: signal.company_name,
          title: signal.title,
          summary: signal.summary,
          priority: signal.priority,
          signal_type: signal.signal_type,
        },
        dashboardUrl
      );

      slackSent = slackResult.ok;
      slackError = slackResult.error;
      console.log(`Slack notification ${slackSent ? "sent" : "failed"} for signal ${signal.id}`);
    } else if (typedProfile.slack_enabled) {
      console.log(`User ${signal.user_id}: Slack enabled but missing token or channel`);
      slackError = "Missing Slack token or channel";
    }

    // Return combined result
    return new Response(
      JSON.stringify({
        success: true,
        signalId: signal.id,
        emailSent,
        emailId,
        emailError,
        slackSent,
        slackError,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal function error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
