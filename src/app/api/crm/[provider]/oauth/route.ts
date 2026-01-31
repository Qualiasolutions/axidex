import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCRMAuthUrl, validateProviderConfig } from "@/lib/crm";
import type { CRMProvider } from "@/types";

const VALID_PROVIDERS: CRMProvider[] = ["hubspot", "salesforce", "pipedrive", "zoho", "apollo"];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  // Validate provider
  if (!VALID_PROVIDERS.includes(provider as CRMProvider)) {
    return NextResponse.json(
      { error: `Invalid CRM provider: ${provider}` },
      { status: 400 }
    );
  }

  const crmProvider = provider as CRMProvider;

  // Check auth
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.redirect(
      new URL("/login?redirect=/dashboard/settings", request.url)
    );
  }

  // Validate provider config
  const { valid, missing } = validateProviderConfig(crmProvider);
  if (!valid) {
    console.error(`Missing env vars for ${provider}:`, missing);
    return NextResponse.json(
      { error: `${provider} integration not configured` },
      { status: 500 }
    );
  }

  // Generate state for CSRF protection
  const state = Buffer.from(
    JSON.stringify({
      userId: user.id,
      provider: crmProvider,
      timestamp: Date.now(),
    })
  ).toString("base64url");

  // Store state in cookie for verification
  const redirectUri = `${new URL(request.url).origin}/api/crm/${provider}/callback`;

  try {
    const authUrl = getCRMAuthUrl(crmProvider, redirectUri, state);

    const response = NextResponse.redirect(authUrl);
    response.cookies.set("crm_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error(`Error generating ${provider} auth URL:`, error);
    return NextResponse.json(
      { error: `Failed to initiate ${provider} OAuth` },
      { status: 500 }
    );
  }
}
