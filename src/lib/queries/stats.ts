import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { DashboardStats, SignalType } from "@/types";

// Type for the SQL function response
interface StatsResponse {
  total_signals: number;
  new_signals: number;
  high_priority: number;
  conversion_rate: number;
  emails_drafted: number;
  signals_by_type: Record<string, number>;
  signals_by_day: { date: string; count: number }[];
}

// Fallback function when RPC is not available
async function fetchStatsFallback(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DashboardStats> {
  // Get date for "new" signals (last 24 hours)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  // Fetch counts in parallel
  const [
    totalResult,
    newResult,
    highPriorityResult,
    emailsResult,
    byTypeResult,
  ] = await Promise.all([
    // Total signals
    supabase
      .from("signals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    // New signals (last 24h)
    supabase
      .from("signals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("detected_at", yesterday.toISOString()),
    // High priority signals
    supabase
      .from("signals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("priority", "high"),
    // Emails drafted
    supabase
      .from("generated_emails")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    // Signals by type
    supabase
      .from("signals")
      .select("signal_type")
      .eq("user_id", userId),
  ]);

  // Count by type
  const signalsByType: Record<string, number> = {};
  if (byTypeResult.data) {
    for (const signal of byTypeResult.data) {
      const type = signal.signal_type || "unknown";
      signalsByType[type] = (signalsByType[type] || 0) + 1;
    }
  }

  // Calculate conversion rate (signals with emails / total signals)
  const totalSignals = totalResult.count || 0;
  const emailsDrafted = emailsResult.count || 0;
  const conversionRate = totalSignals > 0 ? Math.round((emailsDrafted / totalSignals) * 100) : 0;

  return {
    total_signals: totalSignals,
    new_signals: newResult.count || 0,
    high_priority: highPriorityResult.count || 0,
    conversion_rate: conversionRate,
    emails_drafted: emailsDrafted,
    signals_by_type: signalsByType as Record<SignalType, number>,
    signals_by_day: [], // Skip for fallback
  };
}

export async function fetchDashboardStats(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DashboardStats> {
  // Try optimized SQL function first
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("get_dashboard_stats", {
    p_user_id: userId,
  });

  // If RPC fails, use fallback query
  if (error) {
    console.warn("RPC get_dashboard_stats failed, using fallback:", error.message);
    return fetchStatsFallback(supabase, userId);
  }

  // The RPC returns JSON directly
  const stats = data as StatsResponse;

  return {
    total_signals: stats.total_signals,
    new_signals: stats.new_signals,
    high_priority: stats.high_priority,
    conversion_rate: stats.conversion_rate,
    emails_drafted: stats.emails_drafted,
    signals_by_type: stats.signals_by_type as Record<SignalType, number>,
    signals_by_day: stats.signals_by_day,
  };
}
