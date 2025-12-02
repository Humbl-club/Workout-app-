/**
 * Rate Limiting for Queries
 *
 * Prevent abuse of expensive queries.
 */

import { QueryCtx } from "../_generated/server";
import { RATE_LIMIT_CLEANUP_INTERVAL_MINUTES } from "./constants";

// In-memory rate limit tracking (resets on server restart)
const rateLimits = new Map<string, { count: number; resetAt: number }>();

// Cleanup interval (run every 5 minutes)
const CLEANUP_INTERVAL_MS = RATE_LIMIT_CLEANUP_INTERVAL_MINUTES * 60 * 1000;
let lastCleanup = Date.now();

/**
 * Clean up expired rate limit entries
 * Called automatically during rate limit checks
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();

  // Only run cleanup every 5 minutes
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }

  let removedCount = 0;
  for (const [key, value] of Array.from(rateLimits.entries())) {
    if (now > value.resetAt) {
      rateLimits.delete(key);
      removedCount++;
    }
  }

  lastCleanup = now;

  // Optional: log cleanup (only in dev environment)
  if (removedCount > 0 && process.env.NODE_ENV === "development") {
    console.log(`[Rate Limit] Cleaned up ${removedCount} expired entries`);
  }
}

/**
 * Check if rate limit is exceeded
 *
 * @param ctx Query context
 * @param operation Operation name (e.g., "dashboard", "analytics")
 * @param maxCalls Maximum calls allowed
 * @param windowSeconds Time window in seconds
 */
export async function checkRateLimit(
  ctx: QueryCtx,
  operation: string,
  maxCalls: number,
  windowSeconds: number,
  requireAuth: boolean = true
): Promise<void> {
  // Periodic cleanup of expired entries (runs every 5 minutes)
  cleanupExpiredEntries();

  // Get user ID from auth (if available)
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    if (requireAuth) {
      throw new Error("Unauthorized");
    }
    // For non-authenticated calls, use IP-based rate limiting (not implemented yet)
    // For now, skip rate limiting if no auth
    return;
  }

  const userId = identity.subject;
  const key = `${userId}:${operation}`;
  const now = Date.now();

  const current = rateLimits.get(key);

  if (!current || now > current.resetAt) {
    // First call or window expired, reset
    rateLimits.set(key, {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    });
    return;
  }

  if (current.count >= maxCalls) {
    const waitSeconds = Math.ceil((current.resetAt - now) / 1000);
    throw new Error(
      `Rate limit exceeded for ${operation}. Try again in ${waitSeconds} seconds.`
    );
  }

  // Increment count
  current.count++;
}

/**
 * Clear all rate limits (for testing)
 */
export function clearRateLimits(): void {
  rateLimits.clear();
}
