import { createClient } from "@/lib/supabase/server";
import { generateEmail, type EmailTone } from "@/lib/ai/email-generator";
import { NextRequest, NextResponse } from "next/server";
import type { Signal } from "@/types";
import type { Database } from "@/types/database";

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

    // Fetch signal (verify ownership)
    const { data: signalData, error: signalError } = await supabase
      .from("signals")
      .select("*")
      .eq("id", signalId)
      .eq("user_id", user.id)
      .single();

    if (signalError || !signalData) {
      return NextResponse.json({ error: "Signal not found" }, { status: 404 });
    }

    const signal = signalData as unknown as Signal;

    // Generate email using Claude
    const { subject, body: emailBody } = await generateEmail(signal, tone);

    // Save generated email to database
    const { data: savedEmailData, error: saveError } = await supabase
      .from("generated_emails")
      .insert({
        signal_id: signalId,
        user_id: user.id,
        subject,
        body: emailBody,
        tone,
      } as any)
      .select()
      .single();

    if (saveError || !savedEmailData) {
      console.error("Error saving email:", saveError);
      return NextResponse.json(
        { error: "Failed to save generated email" },
        { status: 500 }
      );
    }

    const savedEmail = savedEmailData as unknown as {
      id: string;
      subject: string;
      body: string;
      tone: EmailTone;
      created_at: string;
    };

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
