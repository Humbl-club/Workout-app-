/**
 * Production-Safe Logging Utility
 *
 * Replaces console.log with environment-aware logging.
 * Use this instead of console.log to ensure logs are controlled in production.
 */

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Current log level (set based on environment)
 * In production, only WARN and ERROR are logged
 */
const CURRENT_LOG_LEVEL =
  process.env.NODE_ENV === "production" ? LogLevel.WARN : LogLevel.DEBUG;

/**
 * Logger class
 */
class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Debug logs (development only)
   */
  debug(...args: any[]): void {
    if (CURRENT_LOG_LEVEL <= LogLevel.DEBUG) {
      console.log(`[DEBUG][${this.context}]`, ...args);
    }
  }

  /**
   * Info logs (development only)
   */
  info(...args: any[]): void {
    if (CURRENT_LOG_LEVEL <= LogLevel.INFO) {
      console.log(`[INFO][${this.context}]`, ...args);
    }
  }

  /**
   * Warning logs (always logged)
   */
  warn(...args: any[]): void {
    if (CURRENT_LOG_LEVEL <= LogLevel.WARN) {
      console.warn(`[WARN][${this.context}]`, ...args);
    }
  }

  /**
   * Error logs (always logged)
   */
  error(...args: any[]): void {
    if (CURRENT_LOG_LEVEL <= LogLevel.ERROR) {
      console.error(`[ERROR][${this.context}]`, ...args);
    }
  }

  /**
   * Performance logging (development only)
   */
  perf(operation: string, duration: number, threshold: number = 1000): void {
    if (CURRENT_LOG_LEVEL <= LogLevel.DEBUG && duration > threshold) {
      console.warn(`[PERF][${this.context}] ${operation} took ${duration}ms (threshold: ${threshold}ms)`);
    }
  }
}

/**
 * Create a logger instance for a specific context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * Pre-configured loggers for common contexts
 */
export const loggers = {
  ai: createLogger("AI"),
  mutations: createLogger("Mutations"),
  queries: createLogger("Queries"),
  actions: createLogger("Actions"),
  validation: createLogger("Validation"),
  cache: createLogger("Cache"),
  performance: createLogger("Performance"),
};
