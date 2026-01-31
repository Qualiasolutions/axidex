import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Account } from "@/types";

interface AccountQueryParams {
  search?: string;
  minSignals?: number;
  sortBy?: "last_signal" | "signal_count" | "company_name";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// RPC function result type
interface AccountAggregation {
  company_domain: string;
  company_name: string;
  company_logo: string | null;
  signal_count: number;
  high_priority_count: number;
  last_signal: string;
}

// Try RPC first, fallback to in-memory aggregation
export async function fetchAccounts(
  supabase: SupabaseClient<Database>,
  userId: string,
  params: AccountQueryParams = {}
): Promise<{ accounts: Account[]; count: number }> {
  const {
    search,
    minSignals = 0,
    sortBy = "last_signal",
    sortOrder = "desc",
    limit = 50,
    offset = 0,
  } = params;

  // Try database-side aggregation via RPC (much faster for large datasets)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rpcData, error: rpcError } = await (supabase as any).rpc("get_accounts_aggregated", {
    p_user_id: userId,
    p_search: search || null,
    p_min_signals: minSignals,
    p_sort_by: sortBy,
    p_sort_order: sortOrder,
    p_limit: limit,
    p_offset: offset,
  });

  // If RPC works, use it
  if (!rpcError && rpcData) {
    const accounts = (rpcData as AccountAggregation[]).map((row) => ({
      company_domain: row.company_domain,
      company_name: row.company_name,
      company_logo: row.company_logo,
      signal_count: row.signal_count,
      high_priority_count: row.high_priority_count,
      last_signal: row.last_signal,
    }));

    // Get total count for pagination (separate query)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: countData } = await (supabase as any).rpc("get_accounts_count", {
      p_user_id: userId,
      p_search: search || null,
      p_min_signals: minSignals,
    });

    return {
      accounts,
      count: (countData as number) || accounts.length,
    };
  }

  // Fallback: in-memory aggregation (for when RPC isn't deployed)
  console.warn("RPC get_accounts_aggregated failed, using fallback:", rpcError?.message);
  return fetchAccountsFallback(supabase, userId, params);
}

// Fallback function with optimizations
async function fetchAccountsFallback(
  supabase: SupabaseClient<Database>,
  userId: string,
  params: AccountQueryParams
): Promise<{ accounts: Account[]; count: number }> {
  const {
    search,
    minSignals = 0,
    sortBy = "last_signal",
    sortOrder = "desc",
    limit = 50,
    offset = 0,
  } = params;

  // Limit to 5000 signals to prevent OOM - warn if truncated
  let query = supabase
    .from("signals")
    .select("company_domain, company_name, company_logo, priority, detected_at")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("detected_at", { ascending: false })
    .limit(5000);

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    query = query.or(`company_name.ilike.${searchTerm},company_domain.ilike.${searchTerm}`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Single-pass aggregation using Map
  const accountsMap = new Map<string, Account>();

  for (const signal of data || []) {
    const domain = signal.company_domain || signal.company_name;
    const existing = accountsMap.get(domain);

    if (existing) {
      existing.signal_count++;
      if (signal.priority === "high") {
        existing.high_priority_count++;
      }
      // First entry has latest date due to ORDER BY
      if (!existing.last_signal) {
        existing.last_signal = signal.detected_at;
      }
    } else {
      accountsMap.set(domain, {
        company_domain: signal.company_domain || "",
        company_name: signal.company_name,
        company_logo: signal.company_logo || null,
        signal_count: 1,
        high_priority_count: signal.priority === "high" ? 1 : 0,
        last_signal: signal.detected_at,
      });
    }
  }

  // Convert to array and filter by minSignals
  let accounts = Array.from(accountsMap.values())
    .filter((a) => a.signal_count >= minSignals);

  // Sort (optimized comparisons)
  const sortMultiplier = sortOrder === "asc" ? 1 : -1;
  accounts.sort((a, b) => {
    switch (sortBy) {
      case "company_name":
        return sortMultiplier * a.company_name.localeCompare(b.company_name);
      case "signal_count":
        return sortMultiplier * (a.signal_count - b.signal_count);
      case "last_signal":
      default:
        return sortMultiplier * (a.last_signal.localeCompare(b.last_signal));
    }
  });

  const totalCount = accounts.length;

  // Paginate
  accounts = accounts.slice(offset, offset + limit);

  return {
    accounts,
    count: totalCount,
  };
}
