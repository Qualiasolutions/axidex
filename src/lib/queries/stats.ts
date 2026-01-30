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

export async function fetchDashboardStats(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DashboardStats> {
  // Use optimized SQL function for stats aggregation
  // This runs entirely in the database, avoiding fetching all signals
  // Type assertion needed: Supabase's type inference doesn't connect our Database types properly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("get_dashboard_stats", {
    p_user_id: userId,
  });

  if (error) {
    throw error;
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
