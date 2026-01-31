import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Lazy initialize Resend client
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

interface SendEmailRequest {
  emailId: string;
  recipientEmail: string;
  recipientName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request
    const body: SendEmailRequest = await request.json();
    const { emailId, recipientEmail, recipientName } = body;

    if (!emailId || !recipientEmail) {
      return NextResponse.json(
        { error: "Missing emailId or recipientEmail" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: "Invalid email address format" },
        { status: 400 }
      );
    }

    // Fetch the generated email
    const { data: emailData, error: emailError } = await supabase
      .from("generated_emails")
      .select("*, signals(company_name)")
      .eq("id", emailId)
      .eq("user_id", user.id)
      .single();

    if (emailError || !emailData) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );
    }

    // Get user's profile for sender name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    const senderName = profile?.full_name || "Axidex User";

    // Determine from address
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Axidex <onboarding@resend.dev>";

    // Send email via Resend
    const { data, error } = await getResend().emails.send({
      from: fromEmail,
      to: [recipientEmail],
      subject: emailData.subject,
      text: emailData.body,
      replyTo: profile?.email || undefined,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error.message },
        { status: 500 }
      );
    }

    // Log the sent email (optional: create a sent_emails table later)
    console.log("Email sent:", {
      emailId,
      recipientEmail,
      resendId: data?.id,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      id: data?.id,
      message: `Email sent to ${recipientName || recipientEmail}`,
    });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
