import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCRMCode } from "@/lib/crm";
import type { CRMProvider } from "@/types";

const VALID_PROVIDERS: CRMProvider[] = ["hubspot", "salesforce", "pipedrive", "zoho", "apollo", "attio"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error(`${provider} OAuth error:`, error, errorDescription);
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?error=${encodeURIComponent(errorDescription || error)}`,
        request.url
      )
    );
  }

  // Validate provider
  if (!VALID_PROVIDERS.includes(provider as CRMProvider)) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=Invalid+provider", request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=Missing+code+or+state", request.url)
    );
  }

  // Verify state from cookie
  const supabase = await createClient();
  const cookies = request.headers.get("cookie") || "";
  const stateCookie = cookies
    .split(";")
    .find((c) => c.trim().startsWith("crm_oauth_state="))
    ?.split("=")[1];

  if (!stateCookie || stateCookie !== state) {
    console.error("OAuth state mismatch");
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=Invalid+state", request.url)
    );
  }

  // Parse state to get user ID
  let stateData: { userId: string; provider: string; timestamp: number };
  try {
    stateData = JSON.parse(Buffer.from(state, "base64url").toString());
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=Invalid+state+format", request.url)
    );
  }

  // Check state is not expired (10 minutes)
  if (Date.now() - stateData.timestamp > 600000) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=OAuth+session+expired", request.url)
    );
  }

  // Get user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user || user.id !== stateData.userId) {
    return NextResponse.redirect(
      new URL("/login?redirect=/dashboard/settings", request.url)
    );
  }

  // Exchange code for tokens
  const redirectUri = `${new URL(request.url).origin}/api/crm/${provider}/callback`;
  const crmProvider = provider as CRMProvider;

  try {
    const tokens = await exchangeCRMCode(crmProvider, code, redirectUri);

    // Check if integration already exists
    const { data: existing } = await supabase
      .from("crm_integrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("provider", crmProvider)
      .single();

    const integrationData = {
      user_id: user.id,
      provider: crmProvider,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      token_expires_at: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      instance_url: tokens.instance_url || null,
      portal_id: tokens.portal_id || null,
      connected_at: new Date().toISOString(),
      connected_by_email: user.email,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      // Update existing integration
      const { error: updateError } = await supabase
        .from("crm_integrations")
        .update(integrationData)
        .eq("id", existing.id);

      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new integration
      const { error: insertError } = await supabase
        .from("crm_integrations")
        .insert(integrationData);

      if (insertError) {
        throw insertError;
      }
    }

    // Clear state cookie and redirect to settings
    const response = NextResponse.redirect(
      new URL(`/dashboard/settings?crm_connected=${provider}`, request.url)
    );
    response.cookies.delete("crm_oauth_state");

    return response;
  } catch (error) {
    console.error(`Error exchanging ${provider} code:`, error);
    return NextResponse.redirect(
      new URL(
        `/dashboard/settings?error=${encodeURIComponent(
          error instanceof Error ? error.message : "Failed to connect"
        )}`,
        request.url
      )
    );
  }
}
