import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
}

interface SlackChannelsResponse {
  ok: boolean;
  channels?: SlackChannel[];
  error?: string;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's Slack token
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("slack_access_token")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.slack_access_token) {
    return NextResponse.json(
      { error: "Slack not connected" },
      { status: 400 }
    );
  }

  try {
    // Fetch public channels
    const publicResponse = await fetch(
      "https://slack.com/api/conversations.list?types=public_channel&limit=200",
      {
        headers: {
          Authorization: `Bearer ${profile.slack_access_token}`,
        },
      }
    );

    const publicData: SlackChannelsResponse = await publicResponse.json();

    // Fetch private channels (groups)
    const privateResponse = await fetch(
      "https://slack.com/api/conversations.list?types=private_channel&limit=200",
      {
        headers: {
          Authorization: `Bearer ${profile.slack_access_token}`,
        },
      }
    );

    const privateData: SlackChannelsResponse = await privateResponse.json();

    if (!publicData.ok && !privateData.ok) {
      return NextResponse.json(
        { error: publicData.error || "Failed to fetch channels" },
        { status: 500 }
      );
    }

    // Combine and sort channels
    const channels = [
      ...(publicData.channels || []),
      ...(privateData.channels || []),
    ].sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ channels });
  } catch (err) {
    console.error("Error fetching Slack channels:", err);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
}

// Update selected channel
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { channel_id, channel_name, enabled } = await request.json();

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      slack_channel_id: channel_id,
      slack_channel_name: channel_name,
      slack_enabled: enabled,
    })
    .eq("id", user.id);

  if (updateError) {
    console.error("Error updating Slack channel:", updateError);
    return NextResponse.json(
      { error: "Failed to update channel" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
