/**
 * Rate Limiter for Convex Actions
 *
 * Prevents abuse of expensive AI operations by limiting calls per user per time window.
 */

import { GenericQueryCtx, GenericMutationCtx, GenericActionCtx } from "convex/server";
import { DataModel } from "./_generated/dataModel";

// Rate limit configurations
export const RATE_LIMITS = {
  // AI Plan Generation - expensive, limit to 3 per hour
  generateWorkoutPlan: {
    maxCalls: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    errorMessage: "Plan generation limit reached. Please wait before generating another plan."
  },

  // Body Photo Analysis - expensive vision API, limit to 5 per hour
  analyzeBodyPhoto: {
    maxCalls: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    errorMessage: "Photo analysis limit reached. Please wait before analyzing another photo."
  },

  // Chatbot messages - moderate cost, limit to 20 per hour
  handleChatMessage: {
    maxCalls: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    errorMessage: "Chat message limit reached. Please slow down."
  },

  // Exercise explanations - cheap, limit to 50 per hour
  explainExercise: {
    maxCalls: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
    errorMessage: "Exercise explanation limit reached."
  },

  // Plan parsing - moderate cost, limit to 10 per hour
  parseWorkoutPlan: {
    maxCalls: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    errorMessage: "Plan parsing limit reached."
  },
} as const;

export type RateLimitKey = keyof typeof RATE_LIMITS;

// In-memory cache for rate limit tracking (resets on server restart)
// Format: userId:actionName -> { count: number, resetAt: number }
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if user is rate limited for a specific action
 */
export function checkRateLimit(userId: string, action: RateLimitKey): void {
  const limit = RATE_LIMITS[action];
  const cacheKey = `${userId}:${action}`;
  const now = Date.now();

  const cached = rateLimitCache.get(cacheKey);

  if (!cached || now > cached.resetAt) {
    // No cache or cache expired, create new entry
    rateLimitCache.set(cacheKey, {
      count: 1,
      resetAt: now + limit.windowMs
    });
    return; // Allowed
  }

  if (cached.count >= limit.maxCalls) {
    // Rate limit exceeded
    const minutesRemaining = Math.ceil((cached.resetAt - now) / (60 * 1000));
    throw new Error(`${limit.errorMessage} Try again in ${minutesRemaining} minute${minutesRemaining === 1 ? '' : 's'}.`);
  }

  // Increment count
  cached.count++;
  rateLimitCache.set(cacheKey, cached);
}

/**
 * Reset rate limit for a user (admin use)
 */
export function resetRateLimit(userId: string, action?: RateLimitKey): void {
  if (action) {
    const cacheKey = `${userId}:${action}`;
    rateLimitCache.delete(cacheKey);
  } else {
    // Reset all limits for user
    const keysToDelete: string[] = [];
    for (const key of rateLimitCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => rateLimitCache.delete(key));
  }
}

/**
 * Get remaining calls for a user
 */
export function getRemainingCalls(userId: string, action: RateLimitKey): number {
  const limit = RATE_LIMITS[action];
  const cacheKey = `${userId}:${action}`;
  const now = Date.now();

  const cached = rateLimitCache.get(cacheKey);

  if (!cached || now > cached.resetAt) {
    return limit.maxCalls;
  }

  return Math.max(0, limit.maxCalls - cached.count);
}
