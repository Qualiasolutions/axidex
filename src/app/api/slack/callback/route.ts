import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

interface SlackOAuthResponse {
  ok: boolean;
  access_token: string;
  team: {
    id: string;
    name: string;
  };
  error?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?slack_error=${error}`
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?slack_error=no_code`
    );
  }

  // Verify CSRF state parameter
  const cookieStore = await cookies();
  const storedState = cookieStore.get("slack_oauth_state")?.value;

  // Clear the state cookie regardless of outcome
  cookieStore.delete("slack_oauth_state");

  if (!state || !storedState || state !== storedState) {
    console.error("Slack OAuth CSRF validation failed", {
      hasState: !!state,
      hasStoredState: !!storedState,
      statesMatch: state === storedState,
    });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?slack_error=csrf_validation_failed`
    );
  }

  // Exchange code for token
  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?slack_error=not_configured`
    );
  }

  try {
    const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData: SlackOAuthResponse = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error("Slack OAuth error:", tokenData.error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?slack_error=${tokenData.error}`
      );
    }

    // Save to database
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?redirect=/dashboard/settings`
      );
    }

    // Update profile with Slack credentials
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        slack_workspace_id: tokenData.team.id,
        slack_workspace_name: tokenData.team.name,
        slack_access_token: tokenData.access_token,
        slack_enabled: false, // User needs to select channel first
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error saving Slack credentials:", updateError);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?slack_error=save_failed`
      );
    }

    // Success - redirect to settings with success message
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?slack_connected=true`
    );
  } catch (err) {
    console.error("Slack OAuth error:", err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?slack_error=unknown`
    );
  }
}
