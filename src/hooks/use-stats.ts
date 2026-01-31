"use client";

import useSWR from "swr";
import type { DashboardStats } from "@/types";
import { fetcher } from "@/lib/swr";

export function useStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    "/api/stats",
    fetcher,
    {
      // Cache stats for 30 seconds since they update slowly
      refreshInterval: 30000,
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    mutate,
  };
}
