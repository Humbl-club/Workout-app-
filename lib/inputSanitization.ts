/**
 * Input Sanitization & Validation Utilities
 *
 * Protects against XSS, SQL injection, and malicious inputs.
 * Use these functions before saving ANY user input to database.
 */

// Character limits for safety
export const INPUT_LIMITS = {
  // Text inputs
  PLAN_NAME: 100,
  EXERCISE_NAME: 100,
  EXERCISE_NOTES: 500,
  WORKOUT_FOCUS: 100,
  DAY_NOTES: 500,

  // User profile
  USER_NAME: 50,
  BIO: 500,
  GOAL_TITLE: 100,
  GOAL_DESCRIPTION: 500,

  // Chat & AI
  CHAT_MESSAGE: 1000,
  AI_PROMPT: 2000,
  PLAN_TEXT_IMPORT: 20000,

  // Buddy system
  BUDDY_MESSAGE: 500,
  SHARE_CODE: 20, // REBLD-ABC123 format

  // Numeric limits
  WEIGHT_MIN: 0,
  WEIGHT_MAX: 1000, // kg
  REPS_MIN: 0,
  REPS_MAX: 500,
  RPE_MIN: 0,
  RPE_MAX: 10,
  SETS_MIN: 0,
  SETS_MAX: 50,
} as const;

/**
 * Sanitize string input - removes dangerous characters
 */
export function sanitizeString(input: string, maxLength: number = INPUT_LIMITS.CHAT_MESSAGE): string {
  if (!input) return '';

  // Trim whitespace
  let cleaned = input.trim();

  // Remove null bytes
  cleaned = cleaned.replace(/\0/g, '');

  // Remove control characters (except newlines/tabs for multiline inputs)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Enforce length limit
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }

  return cleaned;
}

/**
 * Sanitize HTML - prevent XSS attacks
 */
export function sanitizeHTML(input: string): string {
  if (!input) return '';

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'\/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Validate exercise name
 */
export function validateExerciseName(name: string): { valid: boolean; error?: string; sanitized?: string } {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Exercise name is required' };
  }

  const sanitized = sanitizeString(name, INPUT_LIMITS.EXERCISE_NAME);

  // Must be at least 2 characters
  if (sanitized.length < 2) {
    return { valid: false, error: 'Exercise name must be at least 2 characters' };
  }

  // Only allow letters, numbers, spaces, hyphens, parentheses
  if (!/^[a-zA-Z0-9\s\-()]+$/.test(sanitized)) {
    return { valid: false, error: 'Exercise name contains invalid characters' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate plan name
 */
export function validatePlanName(name: string): { valid: boolean; error?: string; sanitized?: string } {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Plan name is required' };
  }

  const sanitized = sanitizeString(name, INPUT_LIMITS.PLAN_NAME);

  if (sanitized.length < 3) {
    return { valid: false, error: 'Plan name must be at least 3 characters' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate notes/text fields
 */
export function validateNotes(notes: string, maxLength: number = INPUT_LIMITS.EXERCISE_NOTES): { valid: boolean; error?: string; sanitized?: string } {
  const sanitized = sanitizeString(notes, maxLength);
  return { valid: true, sanitized };
}

/**
 * Validate numeric input
 */
export function validateNumber(
  value: number | string,
  min: number,
  max: number,
  fieldName: string = 'Value'
): { valid: boolean; error?: string; sanitized?: number } {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (!isFinite(num)) {
    return { valid: false, error: `${fieldName} must be finite` };
  }

  if (num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (num > max) {
    return { valid: false, error: `${fieldName} cannot exceed ${max}` };
  }

  return { valid: true, sanitized: num };
}

/**
 * Validate weight input
 */
export function validateWeight(weight: number | string): { valid: boolean; error?: string; sanitized?: number } {
  return validateNumber(weight, INPUT_LIMITS.WEIGHT_MIN, INPUT_LIMITS.WEIGHT_MAX, 'Weight');
}

/**
 * Validate reps input
 */
export function validateReps(reps: number | string): { valid: boolean; error?: string; sanitized?: number } {
  return validateNumber(reps, INPUT_LIMITS.REPS_MIN, INPUT_LIMITS.REPS_MAX, 'Reps');
}

/**
 * Validate RPE input
 */
export function validateRPE(rpe: number | string): { valid: boolean; error?: string; sanitized?: number } {
  return validateNumber(rpe, INPUT_LIMITS.RPE_MIN, INPUT_LIMITS.RPE_MAX, 'RPE');
}

/**
 * Validate sets input
 */
export function validateSets(sets: number | string): { valid: boolean; error?: string; sanitized?: number } {
  return validateNumber(sets, INPUT_LIMITS.SETS_MIN, INPUT_LIMITS.SETS_MAX, 'Sets');
}

/**
 * Validate share code (REBLD-ABC123 format)
 */
export function validateShareCode(code: string): { valid: boolean; error?: string; sanitized?: string } {
  if (!code || !code.trim()) {
    return { valid: false, error: 'Share code is required' };
  }

  const sanitized = sanitizeString(code, INPUT_LIMITS.SHARE_CODE).toUpperCase();

  // Format: REBLD-ABC123 (letters: A-Z, numbers: 0-9)
  if (!/^REBLD-[A-Z0-9]{6}$/.test(sanitized)) {
    return { valid: false, error: 'Invalid share code format (should be REBLD-ABC123)' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string; sanitized?: string } {
  if (!email || !email.trim()) {
    return { valid: false, error: 'Email is required' };
  }

  const sanitized = sanitizeString(email, 254).toLowerCase(); // Max email length = 254

  // Basic email regex (RFC 5322 simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate chat message
 */
export function validateChatMessage(message: string): { valid: boolean; error?: string; sanitized?: string } {
  if (!message || !message.trim()) {
    return { valid: false, error: 'Message cannot be empty' };
  }

  const sanitized = sanitizeString(message, INPUT_LIMITS.CHAT_MESSAGE);

  if (sanitized.length < 1) {
    return { valid: false, error: 'Message is too short' };
  }

  return { valid: true, sanitized };
}

/**
 * Validate URL (for profile links, etc.)
 */
export function validateURL(url: string): { valid: boolean; error?: string; sanitized?: string } {
  if (!url || !url.trim()) {
    return { valid: false, error: 'URL is required' };
  }

  const sanitized = sanitizeString(url, 2048).trim(); // Max URL length

  try {
    const parsed = new URL(sanitized);

    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use http:// or https://' };
    }

    return { valid: true, sanitized };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Sanitize entire workout plan before saving
 */
export function sanitizeWorkoutPlan(plan: any): any {
  return {
    ...plan,
    name: sanitizeString(plan.name || '', INPUT_LIMITS.PLAN_NAME),
    weeklyPlan: (plan.weeklyPlan || []).map((day: any) => ({
      ...day,
      focus: sanitizeString(day.focus || '', INPUT_LIMITS.WORKOUT_FOCUS),
      notes: sanitizeString(day.notes || '', INPUT_LIMITS.DAY_NOTES),
      blocks: (day.blocks || []).map((block: any) => ({
        ...block,
        title: sanitizeString(block.title || '', INPUT_LIMITS.WORKOUT_FOCUS),
        exercises: (block.exercises || []).map((ex: any) => ({
          ...ex,
          exercise_name: sanitizeString(ex.exercise_name || '', INPUT_LIMITS.EXERCISE_NAME),
          notes: sanitizeString(ex.notes || '', INPUT_LIMITS.EXERCISE_NOTES),
        })),
      })),
    })),
  };
}

/**
 * Detect potential SQL injection patterns (for extra safety)
 */
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(UNION\s+SELECT)/i,
    /(--|\#|\/\*|\*\/)/,
    /(\bOR\b\s+\d+\s*=\s*\d+)/i,
    /(\bAND\b\s+\d+\s*=\s*\d+)/i,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect potential XSS patterns
 */
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["']?[^"']*["']?/gi, // onclick, onerror, etc.
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Comprehensive input validation - checks for all threats
 */
export function validateUserInput(
  input: string,
  maxLength: number = INPUT_LIMITS.CHAT_MESSAGE
): { valid: boolean; error?: string; sanitized?: string } {
  if (!input) {
    return { valid: false, error: 'Input is required' };
  }

  // Check for SQL injection
  if (detectSQLInjection(input)) {
    return { valid: false, error: 'Input contains forbidden patterns' };
  }

  // Check for XSS
  if (detectXSS(input)) {
    return { valid: false, error: 'Input contains forbidden HTML/scripts' };
  }

  // Sanitize and return
  const sanitized = sanitizeString(input, maxLength);

  return { valid: true, sanitized };
}
