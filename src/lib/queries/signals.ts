import { createClient as createServerClient } from "@/lib/supabase/server";
import type { SignalFilter, SignalType, SignalPriority, SignalStatus } from "@/types";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

interface QueryParams {
  types?: SignalType[];
  priorities?: SignalPriority[];
  statuses?: SignalStatus[];
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export async function buildSignalsQuery(
  supabase: SupabaseClient<Database>,
  filters: QueryParams,
  userId: string
) {
  // Only show user's own signals
  let query = supabase
    .from("signals")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("detected_at", { ascending: false });

  // Apply type filters
  if (filters.types && filters.types.length > 0) {
    query = query.in("signal_type", filters.types);
  }

  // Apply priority filters
  if (filters.priorities && filters.priorities.length > 0) {
    query = query.in("priority", filters.priorities);
  }

  // Apply status filters
  if (filters.statuses && filters.statuses.length > 0) {
    query = query.in("status", filters.statuses);
  }

  // Apply search filter
  if (filters.search && filters.search.trim()) {
    const searchTerm = `%${filters.search.trim()}%`;
    query = query.or(`title.ilike.${searchTerm},company_name.ilike.${searchTerm}`);
  }

  // Apply date range filters
  if (filters.from) {
    query = query.gte("detected_at", filters.from);
  }
  if (filters.to) {
    query = query.lte("detected_at", filters.to);
  }

  // Apply pagination
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  query = query.range(offset, offset + limit - 1);

  return query;
}

export async function fetchSignals(filters: QueryParams, userId: string) {
  const supabase = await createServerClient();
  const query = await buildSignalsQuery(supabase, filters, userId);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  return {
    signals: data || [],
    count: count || 0,
  };
}
