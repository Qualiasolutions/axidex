"use client";

import useSWR from "swr";
import type { Signal, SignalType, SignalPriority, SignalStatus } from "@/types";
import { fetcher } from "@/lib/swr";

interface UseSignalsParams {
  types?: SignalType[];
  priorities?: SignalPriority[];
  statuses?: SignalStatus[];
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

interface SignalsResponse {
  signals: Signal[];
  count: number;
}

export function useSignals(params: UseSignalsParams = {}) {
  // Build URL with query parameters
  const searchParams = new URLSearchParams();

  if (params.types && params.types.length > 0) {
    searchParams.set("types", params.types.join(","));
  }
  if (params.priorities && params.priorities.length > 0) {
    searchParams.set("priorities", params.priorities.join(","));
  }
  if (params.statuses && params.statuses.length > 0) {
    searchParams.set("statuses", params.statuses.join(","));
  }
  if (params.search) {
    searchParams.set("search", params.search);
  }
  if (params.from) {
    searchParams.set("from", params.from);
  }
  if (params.to) {
    searchParams.set("to", params.to);
  }
  if (params.limit !== undefined) {
    searchParams.set("limit", params.limit.toString());
  }
  if (params.offset !== undefined) {
    searchParams.set("offset", params.offset.toString());
  }

  const url = `/api/signals?${searchParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<SignalsResponse>(url, fetcher);

  return {
    signals: data?.signals || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
}
