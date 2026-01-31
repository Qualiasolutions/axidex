"use client";

import useSWR from "swr";
import type { GeneratedEmail, EmailTone, EmailStatus } from "@/types";
import { fetcher } from "@/lib/swr";

interface UseEmailsParams {
  tones?: EmailTone[];
  statuses?: EmailStatus[];
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

interface EmailsResponse {
  emails: GeneratedEmail[];
  count: number;
}

export function useEmails(params: UseEmailsParams = {}) {
  // Build URL with query parameters
  const searchParams = new URLSearchParams();

  if (params.tones && params.tones.length > 0) {
    searchParams.set("tones", params.tones.join(","));
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

  const url = `/api/emails?${searchParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<EmailsResponse>(url, fetcher);

  return {
    emails: data?.emails || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
  };
}
