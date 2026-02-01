/**
 * Fetch utility with timeout and retry support for external APIs
 */

export interface FetchOptions extends RequestInit {
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Number of retry attempts (default: 2) */
  retries?: number;
  /** Initial retry delay in ms (default: 500) */
  retryDelay?: number;
}

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY = 500;

/**
 * Fetch with timeout and automatic retry on transient failures
 */
export async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry if it's not a network/timeout error
      if (!isRetryableError(lastError)) {
        throw lastError;
      }

      // Don't retry after last attempt
      if (attempt === retries) {
        break;
      }

      // Wait before retrying with exponential backoff
      await sleep(retryDelay * Math.pow(2, attempt));
    }
  }

  throw lastError ?? new Error("Request failed after retries");
}

function isRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    error.name === "AbortError" ||
    message.includes("timeout") ||
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("econnreset") ||
    message.includes("econnrefused") ||
    message.includes("etimedout")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create an AbortController with timeout
 * Useful for APIs that accept a signal directly (like OpenAI)
 */
export function createTimeoutController(timeoutMs: number = DEFAULT_TIMEOUT): {
  controller: AbortController;
  clear: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  return {
    controller,
    clear: () => clearTimeout(timeoutId),
  };
}
