"use client";

import useSWR from "swr";
import type { AutomationRule } from "@/types";
import { fetcher } from "@/lib/swr";

interface UseRulesParams {
  active?: boolean;
  limit?: number;
  offset?: number;
}

interface RulesResponse {
  rules: AutomationRule[];
  count: number;
}

export function useRules(params: UseRulesParams = {}) {
  // Build URL with query parameters
  const searchParams = new URLSearchParams();

  if (params.active !== undefined) {
    searchParams.set("active", params.active.toString());
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", params.limit.toString());
  }
  if (params.offset !== undefined) {
    searchParams.set("offset", params.offset.toString());
  }

  const url = `/api/rules?${searchParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<RulesResponse>(url, fetcher);

  return {
    rules: data?.rules || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
}
