import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateAttioApiKey } from "@/lib/crm";

// POST /api/crm/attio/connect - Connect Attio with API key
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { apiKey } = body;

  if (!apiKey) {
    return NextResponse.json({ error: "API key required" }, { status: 400 });
  }

  // Validate the API key
  const validation = await validateAttioApiKey(apiKey);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error || "Invalid API key" },
      { status: 400 }
    );
  }

  // Check if integration already exists
  const { data: existing } = await supabase
    .from("crm_integrations")
    .select("id")
    .eq("user_id", user.id)
    .eq("provider", "attio")
    .single();

  const integrationData = {
    user_id: user.id,
    provider: "attio" as const,
    access_token: apiKey,
    refresh_token: null,
    token_expires_at: null,
    instance_url: null,
    portal_id: null,
    account_id: null,
    connected_at: new Date().toISOString(),
    connected_by_email: user.email,
    updated_at: new Date().toISOString(),
  };

  try {
    if (existing) {
      // Update existing integration
      const { error: updateError } = await supabase
        .from("crm_integrations")
        .update(integrationData)
        .eq("id", existing.id);

      if (updateError) throw updateError;
    } else {
      // Create new integration
      const { error: insertError } = await supabase
        .from("crm_integrations")
        .insert(integrationData);

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: "Attio connected successfully",
    });
  } catch (error) {
    console.error("Error saving Attio integration:", error);
    return NextResponse.json(
      { error: "Failed to save integration" },
      { status: 500 }
    );
  }
}
