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
}

// Priority level mapping for comparison
const priorityLevels: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
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

    // Fetch user profile and notification preferences
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, notification_preferences")
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

    // Check 1: Email notifications enabled?
    if (!prefs.email_enabled) {
      console.log(`User ${signal.user_id}: Email notifications disabled`);
      return new Response(
        JSON.stringify({ skipped: true, reason: "Email notifications disabled" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check 2: Signal type in allowed types?
    if (!prefs.signal_types.includes(signal.signal_type)) {
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

    // Check 3: Signal priority meets threshold?
    if (!meetsPriorityThreshold(signal.priority, prefs.priority_threshold)) {
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

    // All checks passed - send notification email
    const appUrl = Deno.env.get("APP_URL") || "https://axidex.vercel.app";
    const internalApiKey = Deno.env.get("INTERNAL_API_KEY");

    const notificationPayload = {
      email: (profile as Profile).email,
      userName: (profile as Profile).full_name || (profile as Profile).email.split("@")[0],
      signal: {
        id: signal.id,
        company_name: signal.company_name,
        signal_type: signal.signal_type,
        title: signal.title,
        summary: signal.summary,
        priority: signal.priority,
      },
    };

    console.log(`Sending notification to ${(profile as Profile).email} for signal ${signal.id}`);

    // Call the notification API route
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (internalApiKey) {
      headers["Authorization"] = `Bearer ${internalApiKey}`;
    }

    const response = await fetch(`${appUrl}/api/send-notification`, {
      method: "POST",
      headers,
      body: JSON.stringify(notificationPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Notification API error:", result);
      return new Response(
        JSON.stringify({
          error: "Failed to send notification",
          details: result,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(`Notification sent successfully: ${result.id}`);

    return new Response(
      JSON.stringify({
        sent: true,
        emailId: result.id,
        to: (profile as Profile).email,
        signalId: signal.id,
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
