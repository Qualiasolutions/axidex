import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { postToSlack } from "@/lib/slack";
import type { Signal } from "@/types";

// POST /api/slack/test - Send a test notification to Slack
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's Slack settings
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("slack_access_token, slack_channel_id, slack_enabled")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }

  if (!profile.slack_access_token) {
    return NextResponse.json(
      { error: "Slack not connected. Please connect Slack first." },
      { status: 400 }
    );
  }

  if (!profile.slack_channel_id) {
    return NextResponse.json(
      { error: "No channel selected. Please select a Slack channel first." },
      { status: 400 }
    );
  }

  // Create a test signal
  const testSignal: Signal = {
    id: "test-signal-" + Date.now(),
    company_name: "Test Company Inc.",
    company_domain: "testcompany.com",
    signal_type: "funding",
    title: "Test Signal - Slack Integration Working!",
    summary: "This is a test notification from Axidex to verify your Slack integration is configured correctly. If you see this message, your Slack notifications are working!",
    source_url: "https://axidex.vercel.app",
    source_name: "Axidex Test",
    priority: "high",
    status: "new",
    detected_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || "https://axidex.vercel.app";

  const result = await postToSlack(
    profile.slack_access_token,
    profile.slack_channel_id,
    testSignal,
    dashboardUrl
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: `Slack error: ${result.error}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Test notification sent to Slack!",
  });
}
