/**
 * Standardized Error Handling
 *
 * Consistent error handling patterns across all Convex functions.
 */

/**
 * Custom error types for better error handling
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, identifier: string) {
    super(`${resource} not found: ${identifier}`);
    this.name = "NotFoundError";
  }
}

export class DuplicateError extends Error {
  constructor(resource: string, field: string) {
    super(`${resource} already exists with ${field}`);
    this.name = "DuplicateError";
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "AuthorizationError";
  }
}

/**
 * Safely handle errors and log them appropriately
 */
export function handleError(error: unknown, context: string): never {
  if (error instanceof ValidationError) {
    console.error(`[${context}] Validation error:`, error.message);
    throw error;
  }

  if (error instanceof NotFoundError) {
    console.error(`[${context}] Not found:`, error.message);
    throw error;
  }

  if (error instanceof DuplicateError) {
    console.error(`[${context}] Duplicate:`, error.message);
    throw error;
  }

  if (error instanceof AuthorizationError) {
    console.error(`[${context}] Authorization failed:`, error.message);
    throw error;
  }

  // Unknown error
  console.error(`[${context}] Unexpected error:`, error);
  throw new Error(`Internal error in ${context}: ${error instanceof Error ? error.message : String(error)}`);
}

/**
 * Validate required fields in an object
 */
export function validateRequired<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[],
  context: string
): void {
  const missing = fields.filter(field =>
    data[field] === undefined || data[field] === null || data[field] === ""
  );

  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields in ${context}: ${missing.join(", ")}`
    );
  }
}

/**
 * Safe number parsing with validation
 */
export function parseNumber(
  value: any,
  fieldName: string,
  options: { min?: number; max?: number; integer?: boolean } = {}
): number {
  const num = typeof value === "number" ? value : Number(value);

  if (isNaN(num)) {
    throw new ValidationError(`${fieldName} must be a valid number`);
  }

  if (options.integer && !Number.isInteger(num)) {
    throw new ValidationError(`${fieldName} must be an integer`);
  }

  if (options.min !== undefined && num < options.min) {
    throw new ValidationError(`${fieldName} must be at least ${options.min}`);
  }

  if (options.max !== undefined && num > options.max) {
    throw new ValidationError(`${fieldName} must be at most ${options.max}`);
  }

  return num;
}

/**
 * Safe string validation
 */
export function validateString(
  value: any,
  fieldName: string,
  options: { minLength?: number; maxLength?: number; pattern?: RegExp } = {}
): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }

  if (options.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(`${fieldName} must be at least ${options.minLength} characters`);
  }

  if (options.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(`${fieldName} must be at most ${options.maxLength} characters`);
  }

  if (options.pattern && !options.pattern.test(value)) {
    throw new ValidationError(`${fieldName} has invalid format`);
  }

  return value;
}
