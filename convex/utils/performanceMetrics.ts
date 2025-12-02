/**
 * Performance Metrics Tracking
 *
 * Track performance of mutations, queries, and actions for optimization.
 */

/**
 * Simple performance timer
 */
export class PerformanceTimer {
  private start: number;
  private checkpoints: Map<string, number> = new Map();

  constructor() {
    this.start = Date.now();
  }

  /**
   * Mark a checkpoint
   */
  checkpoint(label: string): void {
    this.checkpoints.set(label, Date.now() - this.start);
  }

  /**
   * Get elapsed time
   */
  elapsed(): number {
    return Date.now() - this.start;
  }

  /**
   * Get all checkpoints
   */
  getCheckpoints(): Record<string, number> {
    return Object.fromEntries(this.checkpoints);
  }

  /**
   * Log performance summary
   */
  logSummary(context: string, threshold: number = 1000): void {
    const total = this.elapsed();

    // Only log if exceeds threshold
    if (total < threshold) return;

    console.warn(`[Performance] ${context} took ${total}ms`);

    if (this.checkpoints.size > 0) {
      console.warn("Checkpoints:", this.getCheckpoints());
    }
  }
}

/**
 * Track database query performance
 */
export async function trackQueryPerformance<T>(
  context: string,
  operation: () => Promise<T>,
  warnThreshold: number = 500
): Promise<T> {
  const timer = new PerformanceTimer();

  try {
    const result = await operation();
    const elapsed = timer.elapsed();

    if (elapsed > warnThreshold) {
      console.warn(`[Query Performance] ${context} took ${elapsed}ms (threshold: ${warnThreshold}ms)`);
    }

    return result;
  } catch (error) {
    const elapsed = timer.elapsed();
    console.error(`[Query Performance] ${context} failed after ${elapsed}ms:`, error);
    throw error;
  }
}

/**
 * Performance metrics collector (in-memory, could be persisted)
 */
class MetricsCollector {
  private metrics: Map<string, {
    count: number;
    totalTime: number;
    maxTime: number;
    minTime: number;
    errors: number;
  }> = new Map();

  record(operation: string, duration: number, success: boolean) {
    const existing = this.metrics.get(operation);

    if (!existing) {
      this.metrics.set(operation, {
        count: 1,
        totalTime: duration,
        maxTime: duration,
        minTime: duration,
        errors: success ? 0 : 1,
      });
    } else {
      existing.count++;
      existing.totalTime += duration;
      existing.maxTime = Math.max(existing.maxTime, duration);
      existing.minTime = Math.min(existing.minTime, duration);
      if (!success) existing.errors++;
    }
  }

  getStats(operation: string) {
    const metric = this.metrics.get(operation);
    if (!metric) return null;

    return {
      ...metric,
      avgTime: metric.totalTime / metric.count,
      errorRate: (metric.errors / metric.count) * 100,
    };
  }

  getAllStats() {
    const stats: Record<string, any> = {};
    for (const [operation, data] of this.metrics.entries()) {
      stats[operation] = {
        ...data,
        avgTime: data.totalTime / data.count,
        errorRate: (data.errors / data.count) * 100,
      };
    }
    return stats;
  }

  clear() {
    this.metrics.clear();
  }
}

// Global metrics collector (single instance)
export const metricsCollector = new MetricsCollector();

/**
 * Wrap a function with performance tracking
 */
export async function withMetrics<T>(
  operationName: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  let success = false;

  try {
    const result = await fn();
    success = true;
    return result;
  } finally {
    const duration = Date.now() - start;
    metricsCollector.record(operationName, duration, success);

    // Log slow operations (>2s)
    if (duration > 2000) {
      console.warn(`[Slow Operation] ${operationName} took ${duration}ms`);
    }
  }
}
