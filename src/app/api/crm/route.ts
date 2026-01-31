import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CRMIntegration } from "@/types";

// GET /api/crm - List user's CRM integrations
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: integrations, error } = await supabase
    .from("crm_integrations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching CRM integrations:", error);
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    );
  }

  // Don't expose tokens in response
  const safeIntegrations = (integrations as CRMIntegration[]).map((i) => ({
    id: i.id,
    provider: i.provider,
    connected_at: i.connected_at,
    connected_by_email: i.connected_by_email,
    auto_sync_enabled: i.auto_sync_enabled,
    sync_on_signal_types: i.sync_on_signal_types,
    sync_on_priorities: i.sync_on_priorities,
    field_mapping: i.field_mapping,
    create_company: i.create_company,
    create_contact: i.create_contact,
    create_deal: i.create_deal,
    create_note: i.create_note,
    portal_id: i.portal_id,
    instance_url: i.instance_url,
  }));

  return NextResponse.json({ integrations: safeIntegrations });
}

// DELETE /api/crm - Disconnect a CRM integration
export async function DELETE(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const integrationId = searchParams.get("id");

  if (!integrationId) {
    return NextResponse.json(
      { error: "Integration ID required" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("crm_integrations")
    .delete()
    .eq("id", integrationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting CRM integration:", error);
    return NextResponse.json(
      { error: "Failed to disconnect integration" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// PATCH /api/crm - Update CRM integration settings
export async function PATCH(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Integration ID required" },
      { status: 400 }
    );
  }

  // Only allow updating specific fields
  const allowedUpdates: Partial<CRMIntegration> = {};
  if (typeof updates.auto_sync_enabled === "boolean") {
    allowedUpdates.auto_sync_enabled = updates.auto_sync_enabled;
  }
  if (Array.isArray(updates.sync_on_signal_types)) {
    allowedUpdates.sync_on_signal_types = updates.sync_on_signal_types;
  }
  if (Array.isArray(updates.sync_on_priorities)) {
    allowedUpdates.sync_on_priorities = updates.sync_on_priorities;
  }
  if (updates.field_mapping && typeof updates.field_mapping === "object") {
    allowedUpdates.field_mapping = updates.field_mapping;
  }
  if (typeof updates.create_company === "boolean") {
    allowedUpdates.create_company = updates.create_company;
  }
  if (typeof updates.create_contact === "boolean") {
    allowedUpdates.create_contact = updates.create_contact;
  }
  if (typeof updates.create_deal === "boolean") {
    allowedUpdates.create_deal = updates.create_deal;
  }
  if (typeof updates.create_note === "boolean") {
    allowedUpdates.create_note = updates.create_note;
  }

  const { error } = await supabase
    .from("crm_integrations")
    .update({ ...allowedUpdates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error updating CRM integration:", error);
    return NextResponse.json(
      { error: "Failed to update integration" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
