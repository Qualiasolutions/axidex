import { NextResponse } from "next/server";

// Redirect to Slack OAuth authorization
export async function GET() {
  const clientId = process.env.SLACK_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "Slack integration not configured" },
      { status: 500 }
    );
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/slack/callback`;
  const scopes = [
    "chat:write",
    "channels:read",
    "groups:read",
  ].join(",");

  const slackUrl = new URL("https://slack.com/oauth/v2/authorize");
  slackUrl.searchParams.set("client_id", clientId);
  slackUrl.searchParams.set("scope", scopes);
  slackUrl.searchParams.set("redirect_uri", redirectUri);

  return NextResponse.redirect(slackUrl.toString());
}
