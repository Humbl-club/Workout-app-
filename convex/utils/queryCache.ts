/**
 * Query Caching Utilities
 *
 * Simple in-memory caching for expensive queries.
 * Note: Convex already has built-in reactivity, so use this sparingly
 * for truly expensive operations that don't change frequently.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

/**
 * Simple in-memory cache with TTL
 */
export class QueryCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private readonly ttl: number; // milliseconds
  private readonly maxSize: number;

  constructor(ttl: number = 60000, maxSize: number = 100) {
    this.ttl = ttl;
    this.maxSize = maxSize;
  }

  /**
   * Get cached data if available and not expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update hit count
    entry.hits++;

    return entry.data;
  }

  /**
   * Set cached data
   */
  set(key: string, data: T): void {
    // Evict oldest if at max size
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.findOldest();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * Invalidate specific key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        hits: entry.hits,
      })),
    };
  }

  /**
   * Find oldest entry (for eviction)
   */
  private findOldest(): string | null {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }
}

/**
 * Helper function to use cache with async operations
 */
export async function withCache<T>(
  cache: QueryCache<T>,
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = cache.get(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetcher();

  // Store in cache
  cache.set(key, data);

  return data;
}

/**
 * Pre-configured caches for common use cases
 */

// Exercise cache (long TTL - exercises don't change often)
export const exerciseQueryCache = new QueryCache<any>(5 * 60 * 1000, 200); // 5 minutes

// User data cache (medium TTL)
export const userDataCache = new QueryCache<any>(2 * 60 * 1000, 100); // 2 minutes

// Workout logs cache (short TTL - logs change frequently)
export const workoutLogsCache = new QueryCache<any>(30 * 1000, 50); // 30 seconds

/**
 * Cache key builders for consistency
 */
export const CacheKeys = {
  exerciseExplanation: (exerciseName: string) => `exercise:${exerciseName}`,
  userProfile: (userId: string) => `user:${userId}`,
  userWorkoutLogs: (userId: string, limit?: number) => `logs:${userId}:${limit || 'all'}`,
  buddyPRs: (userId: string, buddyId: string) => `prs:${userId}:${buddyId}`,
};
