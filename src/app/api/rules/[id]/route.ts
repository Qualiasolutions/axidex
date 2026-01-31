import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("automation_rules")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching rule:", error);
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json({ rule: data });
  } catch (error) {
    console.error("Unexpected error in rule API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, trigger_conditions, actions, is_active } = body;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (trigger_conditions !== undefined) updateData.trigger_conditions = trigger_conditions;
    if (actions !== undefined) updateData.actions = actions;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from("automation_rules")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating rule:", error);
      return NextResponse.json({ error: "Failed to update rule" }, { status: 500 });
    }

    return NextResponse.json({ rule: data });
  } catch (error) {
    console.error("Unexpected error in rule API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("automation_rules")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting rule:", error);
      return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in rule API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
