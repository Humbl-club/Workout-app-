/**
 * Application Constants
 *
 * Central location for all magic numbers and configuration values
 */

// ==================== TIME CONSTANTS ====================

/** Share code expiration period (in days) */
export const SHARE_CODE_EXPIRY_DAYS = 7;

/** Streak maintenance window (in hours) */
export const STREAK_MAINTENANCE_WINDOW_HOURS = 48;

/** Cache time-to-live (in minutes) */
export const CACHE_TTL_MINUTES = 2;

/** Rate limit cleanup interval (in minutes) */
export const RATE_LIMIT_CLEANUP_INTERVAL_MINUTES = 5;

// ==================== PAGINATION CONSTANTS ====================

/** Default page size for paginated queries */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum page size for paginated queries */
export const MAX_PAGE_SIZE = 100;

/** Default exercise query limit */
export const DEFAULT_EXERCISE_LIMIT = 100;

// ==================== RATE LIMITING CONSTANTS ====================

/** Maximum calls per window for analytics queries */
export const ANALYTICS_RATE_LIMIT_CALLS = 10;

/** Rate limit window duration (in seconds) */
export const RATE_LIMIT_WINDOW_SECONDS = 60;

// ==================== VALIDATION CONSTANTS ====================

/** Maximum weight in kg */
export const MAX_WEIGHT_KG = 1000;

/** Minimum weight in kg */
export const MIN_WEIGHT_KG = 0;

/** Maximum reps */
export const MAX_REPS = 1000;

/** Minimum reps */
export const MIN_REPS = 1;

/** Maximum share code generation attempts */
export const MAX_SHARE_CODE_ATTEMPTS = 10;

// ==================== ACHIEVEMENT CONSTANTS ====================

/** Streak for "Week Warrior" achievement */
export const ACHIEVEMENT_STREAK_WEEK = 7;

/** Streak for "Month Master" achievement */
export const ACHIEVEMENT_STREAK_MONTH = 30;

/** Workouts for "Getting Started" achievement */
export const ACHIEVEMENT_WORKOUTS_BEGINNER = 10;

/** Workouts for "Committed" achievement */
export const ACHIEVEMENT_WORKOUTS_INTERMEDIATE = 50;

/** Workouts for "Century Club" achievement */
export const ACHIEVEMENT_WORKOUTS_ADVANCED = 100;

/** Volume for "Heavy Lifter" achievement (in kg) */
export const ACHIEVEMENT_VOLUME_HEAVY = 10000;

/** Volume for "Beast Mode" achievement (in kg) */
export const ACHIEVEMENT_VOLUME_BEAST = 50000;

// ==================== STREAK CONSTANTS ====================

/** Streak freezes per month for premium users */
export const STREAK_FREEZES_PER_MONTH = 1;

// ==================== SHARE CODE CONSTANTS ====================

/** Share code prefix */
export const SHARE_CODE_PREFIX = "REBLD-";

/** Share code character length (after prefix) */
export const SHARE_CODE_LENGTH = 6;
