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

    // Single-pass aggregation for O(n) instead of O(n*m)
    const aggregation = signalsList.reduce(
      (acc, signal) => {
        // Count by status
        acc.byStatus[signal.status] = (acc.byStatus[signal.status] || 0) + 1;
        // Count by priority
        acc.byPriority[signal.priority] = (acc.byPriority[signal.priority] || 0) + 1;
        // Count by type
        acc.byType[signal.signal_type] = (acc.byType[signal.signal_type] || 0) + 1;
        // Count by day
        const dateStr = signal.detected_at.split("T")[0];
        acc.byDay[dateStr] = (acc.byDay[dateStr] || 0) + 1;
        return acc;
      },
      {
        byStatus: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        byDay: {} as Record<string, number>,
      }
    );

    // Extract metrics from aggregation
    const totalSignals = signalsList.length;
    const newSignals = aggregation.byStatus["new"] || 0;
    const highPriority = aggregation.byPriority["high"] || 0;
    const converted = aggregation.byStatus["converted"] || 0;
    const conversionRate = totalSignals > 0 ? Math.round((converted / totalSignals) * 100) : 0;
    const emailsDrafted = emailsList.length;
    const emailsSent = 0; // status column not yet added

    // Signals by type (already aggregated)
    const signalsByType = aggregation.byType;

    // Signals by priority (ensure all priorities exist)
    const signalsByPriority: Record<string, number> = {
      high: aggregation.byPriority["high"] || 0,
      medium: aggregation.byPriority["medium"] || 0,
      low: aggregation.byPriority["low"] || 0,
    };

    // Signals by day (fill in missing days with 0)
    const signalsByDay: { date: string; count: number }[] = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = formatISO(date).split("T")[0];
      signalsByDay.push({ date: dateStr, count: aggregation.byDay[dateStr] || 0 });
    }

    // Signals by status (ensure all statuses exist)
    const signalsByStatus: Record<string, number> = {
      new: newSignals,
      reviewed: aggregation.byStatus["reviewed"] || 0,
      contacted: aggregation.byStatus["contacted"] || 0,
      converted: converted,
      dismissed: aggregation.byStatus["dismissed"] || 0,
    };

    return NextResponse.json(
      {
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
      },
      {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Unexpected error in analytics API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
