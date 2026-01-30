import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { DashboardStats, SignalType } from "@/types";

export async function fetchDashboardStats(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<DashboardStats> {
  // Fetch total signals and status-based counts
  const { data: signals, error: signalsError } = await supabase
    .from("signals")
    .select("id, status, priority, signal_type, detected_at")
    .eq("user_id", userId);

  if (signalsError) {
    throw signalsError;
  }

  type SignalSubset = {
    id: string;
    status: string;
    priority: string;
    signal_type: string;
    detected_at: string;
  };

  const signalsList = (signals || []) as SignalSubset[];

  // Fetch generated emails count
  const { count: emailsCount, error: emailsError } = await supabase
    .from("generated_emails")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (emailsError) {
    throw emailsError;
  }

  // Calculate aggregated stats
  const total_signals = signalsList.length;
  const new_signals = signalsList.filter((s) => s.status === "new").length;
  const high_priority = signalsList.filter((s) => s.priority === "high").length;
  const converted = signalsList.filter((s) => s.status === "converted").length;
  const conversion_rate = total_signals > 0 ? Math.round((converted / total_signals) * 100) : 0;
  const emails_drafted = emailsCount || 0;

  // Group by signal type
  const signals_by_type = signalsList.reduce((acc, signal) => {
    const type = signal.signal_type as SignalType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<SignalType, number>);

  // Group by day (last 7 days)
  const signals_by_day: { date: string; count: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const count = signalsList.filter((s) => {
      const signalDate = new Date(s.detected_at).toISOString().split("T")[0];
      return signalDate === dateStr;
    }).length;

    signals_by_day.push({ date: dateStr, count });
  }

  return {
    total_signals,
    new_signals,
    high_priority,
    conversion_rate,
    emails_drafted,
    signals_by_type,
    signals_by_day,
  };
}
