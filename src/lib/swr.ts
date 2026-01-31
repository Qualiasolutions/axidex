import type { SWRConfiguration } from "swr";

// Generic fetcher for SWR
export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    const error = new Error("Failed to fetch data");
    throw error;
  }

  return response.json();
}

// SWR global configuration
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false, // Don't refetch when user focuses tab
  revalidateOnReconnect: true, // Refresh data on network reconnect
  dedupingInterval: 5000, // Deduplicate requests within 5 seconds
  errorRetryCount: 3, // Retry failed requests 3 times
  fetcher,
};
