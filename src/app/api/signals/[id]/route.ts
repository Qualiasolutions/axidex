import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch signal
    const { data: signal, error: signalError } = await supabase
      .from("signals")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (signalError || !signal) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    return NextResponse.json({ signal });
  } catch (error) {
    console.error("Error fetching signal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
