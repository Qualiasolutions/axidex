import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { subDays, formatISO, startOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "month"; // today, week, month, quarter

    // Calculate date range
    let daysBack = 30;
    switch (period) {
      case "today":
        daysBack = 1;
        break;
      case "week":
        daysBack = 7;
        break;
      case "month":
        daysBack = 30;
        break;
      case "quarter":
        daysBack = 90;
        break;
    }

    const fromDate = formatISO(startOfDay(subDays(new Date(), daysBack)));

    // Fetch signals in period
    const { data: signals, error: signalsError } = await supabase
      .from("signals")
      .select("id, signal_type, priority, status, detected_at")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .gte("detected_at", fromDate);

    if (signalsError) {
      console.error("Error fetching signals:", signalsError);
      return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }

    // Fetch emails in period
    const { data: emails, error: emailsError } = await supabase
      .from("generated_emails")
      .select("id, created_at")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .gte("created_at", fromDate);

    if (emailsError) {
      console.error("Error fetching emails:", emailsError);
    }

    const signalsList = signals || [];
    const emailsList = emails || [];

    // Calculate metrics
    const totalSignals = signalsList.length;
    const newSignals = signalsList.filter((s) => s.status === "new").length;
    const highPriority = signalsList.filter((s) => s.priority === "high").length;
    const converted = signalsList.filter((s) => s.status === "converted").length;
    const conversionRate = totalSignals > 0 ? Math.round((converted / totalSignals) * 100) : 0;
    const emailsDrafted = emailsList.length;
    const emailsSent = 0; // status column not yet added

    // Signals by type
    const signalsByType: Record<string, number> = {};
    signalsList.forEach((s) => {
      signalsByType[s.signal_type] = (signalsByType[s.signal_type] || 0) + 1;
    });

    // Signals by priority
    const signalsByPriority: Record<string, number> = {
      high: signalsList.filter((s) => s.priority === "high").length,
      medium: signalsList.filter((s) => s.priority === "medium").length,
      low: signalsList.filter((s) => s.priority === "low").length,
    };

    // Signals by day (last 30 days)
    const signalsByDay: { date: string; count: number }[] = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = formatISO(date).split("T")[0];
      const count = signalsList.filter((s) => s.detected_at.startsWith(dateStr)).length;
      signalsByDay.push({ date: dateStr, count });
    }

    // Signals by status
    const signalsByStatus: Record<string, number> = {
      new: newSignals,
      reviewed: signalsList.filter((s) => s.status === "reviewed").length,
      contacted: signalsList.filter((s) => s.status === "contacted").length,
      converted: converted,
      dismissed: signalsList.filter((s) => s.status === "dismissed").length,
    };

    return NextResponse.json({
      metrics: {
        totalSignals,
        newSignals,
        highPriority,
        conversionRate,
        emailsDrafted,
        emailsSent,
      },
      charts: {
        signalsByType,
        signalsByPriority,
        signalsByDay,
        signalsByStatus,
      },
    });
  } catch (error) {
    console.error("Unexpected error in analytics API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
