import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { SignalAlertEmail } from "@/components/emails/signal-alert";

// Lazy initialize Resend client (to avoid build-time errors)
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

// Signal type for the notification
interface SignalPayload {
  id: string;
  company_name: string;
  signal_type: string;
  title: string;
  summary?: string;
  priority: string;
}

interface NotificationRequest {
  email: string;
  userName: string;
  signal: SignalPayload;
}

export async function POST(request: NextRequest) {
  try {
    // Verify internal API key (optional, for security)
    const authHeader = request.headers.get("Authorization");
    const internalKey = process.env.INTERNAL_API_KEY;

    // If internal key is set, require it
    if (internalKey && authHeader !== `Bearer ${internalKey}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: NotificationRequest = await request.json();
    const { email, userName, signal } = body;

    // Validate required fields
    if (!email || !userName || !signal) {
      return NextResponse.json(
        { error: "Missing required fields: email, userName, signal" },
        { status: 400 }
      );
    }

    if (!signal.id || !signal.company_name || !signal.signal_type || !signal.title || !signal.priority) {
      return NextResponse.json(
        { error: "Invalid signal: missing id, company_name, signal_type, title, or priority" },
        { status: 400 }
      );
    }

    // Build dashboard URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://axidex.vercel.app";
    const dashboardUrl = `${baseUrl}/dashboard/signals/${signal.id}`;
    const settingsUrl = `${baseUrl}/dashboard/settings`;

    // Determine from address
    // Use verified domain in production, or Resend's onboarding address for dev
    const fromEmail = process.env.RESEND_FROM_EMAIL || "Axidex <onboarding@resend.dev>";

    // Send email via Resend
    const { data, error } = await getResend().emails.send({
      from: fromEmail,
      to: [email],
      subject: `New Signal: ${signal.company_name} - ${formatSignalType(signal.signal_type)}`,
      react: SignalAlertEmail({
        userName,
        companyName: signal.company_name,
        signalType: signal.signal_type,
        signalTitle: signal.title,
        signalSummary: signal.summary,
        priority: signal.priority,
        dashboardUrl,
        settingsUrl,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data?.id,
      message: `Email sent to ${email}`,
    });
  } catch (error) {
    console.error("Send notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper to format signal type for display
function formatSignalType(type: string): string {
  const labels: Record<string, string> = {
    hiring: "Hiring",
    funding: "Funding",
    expansion: "Expansion",
    partnership: "Partnership",
    product_launch: "Product Launch",
    leadership_change: "Leadership Change",
  };
  return labels[type] || type;
}
