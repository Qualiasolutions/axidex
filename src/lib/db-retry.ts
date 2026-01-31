/**
 * Database retry utility with exponential backoff
 * Handles transient connection failures gracefully
 */

export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Initial delay in milliseconds */
  initialDelayMs: number;
  /** Maximum delay in milliseconds */
  maxDelayMs: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

// Errors that are considered transient and worth retrying
const TRANSIENT_ERROR_CODES = [
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EPIPE",
  "EHOSTUNREACH",
  "ENETUNREACH",
];

const TRANSIENT_ERROR_MESSAGES = [
  "fetch failed",
  "network error",
  "connection reset",
  "socket hang up",
  "timeout",
  "aborted",
  "connection refused",
];

function isTransientError(error: unknown): boolean {
  if (!error) return false;

  // Check for error code
  if (typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    if (TRANSIENT_ERROR_CODES.includes(code)) {
      return true;
    }
  }

  // Check error message
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  return TRANSIENT_ERROR_MESSAGES.some((transient) =>
    message.includes(transient)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a function with retry logic and exponential backoff
 * @param fn - Function to execute (should return a Promise)
 * @param config - Retry configuration
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, initialDelayMs, maxDelayMs, backoffMultiplier } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  let lastError: unknown;
  let delay = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry non-transient errors
      if (!isTransientError(error)) {
        throw error;
      }

      // Don't retry after last attempt
      if (attempt === maxRetries) {
        break;
      }

      // Log retry attempt
      console.warn(`Database operation failed, retrying...`, {
        attempt: attempt + 1,
        maxRetries,
        delay,
        error: error instanceof Error ? error.message : String(error),
      });

      // Wait with exponential backoff
      await sleep(delay);
      delay = Math.min(delay * backoffMultiplier, maxDelayMs);
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Wrapper for Supabase query results with retry logic
 * Handles the specific shape of Supabase responses
 */
export async function withSupabaseRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: Error | null }>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    return await withRetry(async () => {
      const result = await queryFn();
      // If there's a network error in the result, throw it for retry handling
      if (result.error && isTransientError(result.error)) {
        throw result.error;
      }
      return result;
    });
  } catch (error) {
    // Return error in Supabase format for consistency
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
