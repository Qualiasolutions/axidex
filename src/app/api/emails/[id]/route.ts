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
      .from("generated_emails")
      .select("*, signal:signals(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (error) {
      console.error("Error fetching email:", error);
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    return NextResponse.json({ email: data });
  } catch (error) {
    console.error("Unexpected error in email API:", error);
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
    const { subject, body: emailBody, tone, status } = body;

    const updateData: Record<string, unknown> = {};
    if (subject !== undefined) updateData.subject = subject;
    if (emailBody !== undefined) updateData.body = emailBody;
    if (tone !== undefined) updateData.tone = tone;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from("generated_emails")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*, signal:signals(*)")
      .single();

    if (error) {
      console.error("Error updating email:", error);
      return NextResponse.json({ error: "Failed to update email" }, { status: 500 });
    }

    return NextResponse.json({ email: data });
  } catch (error) {
    console.error("Unexpected error in email API:", error);
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
      .from("generated_emails")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting email:", error);
      return NextResponse.json({ error: "Failed to delete email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in email API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
