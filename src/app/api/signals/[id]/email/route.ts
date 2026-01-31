import { createClient } from "@/lib/supabase/server";
import { generateEmail, type EmailTone } from "@/lib/ai/email-generator";
import { NextRequest, NextResponse } from "next/server";
import type { Signal } from "@/types";
import type { Database } from "@/types/database";

// Type alias for database rows
type SignalRow = Database["public"]["Tables"]["signals"]["Row"];
type GeneratedEmailRow = Database["public"]["Tables"]["generated_emails"]["Row"];
type GeneratedEmailInsert = Database["public"]["Tables"]["generated_emails"]["Insert"];

// Convert database row to Signal type expected by email generator
function toSignal(row: SignalRow): Signal {
  return {
    id: row.id,
    company_name: row.company_name,
    company_domain: row.company_domain,
    company_logo: row.company_logo,
    signal_type: row.signal_type as Signal["signal_type"],
    title: row.title,
    summary: row.summary,
    source_url: row.source_url,
    source_name: row.source_name,
    priority: row.priority as Signal["priority"],
    status: row.status as Signal["status"],
    detected_at: row.detected_at,
    created_at: row.created_at ?? new Date().toISOString(),
    deleted_at: row.deleted_at,
    embedding: row.embedding,
    metadata: row.metadata as Signal["metadata"],
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: signalId } = await params;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const tone = (body.tone || "professional") as EmailTone;

    // Validate tone
    if (!["professional", "casual", "enthusiastic"].includes(tone)) {
      return NextResponse.json({ error: "Invalid tone parameter" }, { status: 400 });
    }

    // Fetch user's signal
    const { data: signalData, error: signalError } = await supabase
      .from("signals")
      .select("*")
      .eq("id", signalId)
      .eq("user_id", user.id)
      .single();

    if (signalError || !signalData) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    // Convert to Signal type for email generator
    const signal = toSignal(signalData);

    // Generate email using Claude
    const { subject, body: emailBody } = await generateEmail(signal, tone);

    // Save generated email to database
    // Type assertion needed: Supabase's type inference doesn't connect
    // our Database types properly. The structure matches GeneratedEmailInsert.
    const emailInsert: GeneratedEmailInsert = {
      signal_id: signalId,
      user_id: user.id,
      subject,
      body: emailBody,
      tone: tone as "professional" | "casual" | "enthusiastic",
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: savedEmailData, error: saveError } = await (supabase as any)
      .from("generated_emails")
      .insert(emailInsert)
      .select()
      .single();

    if (saveError || !savedEmailData) {
      console.error("Error saving email:", saveError);
      return NextResponse.json(
        { error: "Failed to save generated email" },
        { status: 500 }
      );
    }

    // Type is inferred from Supabase - no cast needed
    const savedEmail = savedEmailData as GeneratedEmailRow;

    return NextResponse.json({
      id: savedEmail.id,
      subject: savedEmail.subject,
      body: savedEmail.body,
      tone: savedEmail.tone,
      created_at: savedEmail.created_at,
    });
  } catch (error) {
    console.error("Error generating email:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
