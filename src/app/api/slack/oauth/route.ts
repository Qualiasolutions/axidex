import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Generate cryptographically secure random string for CSRF protection
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

// Redirect to Slack OAuth authorization
export async function GET() {
  const clientId = process.env.SLACK_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Slack integration not configured" },
      { status: 500 }
    );
  }

  // Generate CSRF state token
  const state = generateState();

  // Store state in secure cookie for verification in callback
  const cookieStore = await cookies();
  cookieStore.set("slack_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes - should be enough for OAuth flow
    path: "/",
  });

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/callback`;
  const scopes = ["chat:write", "channels:read", "groups:read"].join(",");

  const slackUrl = new URL("https://slack.com/oauth/v2/authorize");
  slackUrl.searchParams.set("client_id", clientId);
  slackUrl.searchParams.set("scope", scopes);
  slackUrl.searchParams.set("redirect_uri", redirectUri);
  slackUrl.searchParams.set("state", state);

  return NextResponse.redirect(slackUrl.toString());
}
