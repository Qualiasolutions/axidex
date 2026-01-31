"use client";

import useSWR from "swr";
import type { Account } from "@/types";
import { fetcher } from "@/lib/swr";

interface UseAccountsParams {
  search?: string;
  sortBy?: "signals" | "priority" | "recent";
  minSignals?: number;
  limit?: number;
  offset?: number;
}

interface AccountsResponse {
  accounts: Account[];
  count: number;
}

export function useAccounts(params: UseAccountsParams = {}) {
  // Build URL with query parameters
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.set("search", params.search);
  }
  if (params.sortBy) {
    searchParams.set("sortBy", params.sortBy);
  }
  if (params.minSignals !== undefined) {
    searchParams.set("minSignals", params.minSignals.toString());
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", params.limit.toString());
  }
  if (params.offset !== undefined) {
    searchParams.set("offset", params.offset.toString());
  }

  const url = `/api/accounts?${searchParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<AccountsResponse>(url, fetcher);

  return {
    accounts: data?.accounts || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
}
