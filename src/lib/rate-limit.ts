/**
 * Rate limiting utility for auth endpoints
 * Uses in-memory sliding window for request tracking
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (resets on cold start, but that's acceptable for rate limiting)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
const CLEANUP_INTERVAL = 60000; // 1 minute
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean;
  /** Remaining requests in the window */
  remaining: number;
  /** Time until the window resets (in seconds) */
  retryAfter: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for rate limiting (usually IP or user ID)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupExpiredEntries();

  const now = Date.now();
  const key = identifier;
  const entry = rateLimitStore.get(key);

  // No existing entry or window expired - allow and create new entry
  if (!entry || entry.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      retryAfter: 0,
    };
  }

  // Within window - check limit
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      success: false,
      remaining: 0,
      retryAfter,
    };
  }

  // Within window and under limit - increment and allow
  entry.count++;
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    retryAfter: 0,
  };
}

// Preset configurations
export const RATE_LIMITS = {
  /** Auth endpoints - stricter to prevent brute force */
  auth: {
    maxRequests: 5,
    windowMs: 60000, // 1 minute
  },
  /** Password reset - very strict */
  passwordReset: {
    maxRequests: 3,
    windowMs: 300000, // 5 minutes
  },
  /** General API endpoints */
  api: {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
  /** Signup - moderate to prevent spam */
  signup: {
    maxRequests: 3,
    windowMs: 300000, // 5 minutes
  },
} as const;

/**
 * Get client IP from request headers
 * Handles common proxy headers
 */
export function getClientIp(headers: Headers): string {
  // Check common proxy headers in order of preference
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP (client IP)
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Vercel-specific header
  const vercelForwardedFor = headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0].trim();
  }

  // Fallback - should not happen in production
  return "unknown";
}
