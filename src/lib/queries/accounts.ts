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

  let query = supabase
    .from("signals")
    .select("company_domain, company_name, company_logo, priority, detected_at")
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    query = query.or(`company_name.ilike.${searchTerm},company_domain.ilike.${searchTerm}`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  // Aggregate in JavaScript since Supabase doesn't support GROUP BY well
  const accountsMap = new Map<string, Account>();

  for (const signal of data || []) {
    const domain = signal.company_domain || signal.company_name;
    const existing = accountsMap.get(domain);

    if (existing) {
      existing.signal_count++;
      if (signal.priority === "high") {
        existing.high_priority_count++;
      }
      if (signal.detected_at > existing.last_signal) {
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

  // Sort
  accounts.sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case "company_name":
        comparison = a.company_name.localeCompare(b.company_name);
        break;
      case "signal_count":
        comparison = a.signal_count - b.signal_count;
        break;
      case "last_signal":
      default:
        comparison = new Date(a.last_signal).getTime() - new Date(b.last_signal).getTime();
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalCount = accounts.length;

  // Paginate
  accounts = accounts.slice(offset, offset + limit);

  return {
    accounts,
    count: totalCount,
  };
}
