/**
 * Shared Validation Constants
 *
 * Used by both frontend (form validation) and backend (mutation validation)
 * Keep in sync with convex/utils/constants.ts
 */

// Weight validation (in kg)
export const MAX_WEIGHT_KG = 1000;
export const MIN_WEIGHT_KG = 0;

// Reps validation
export const MAX_REPS = 1000;
export const MIN_REPS = 1;

// Sets validation
export const MAX_SETS = 50;
export const MIN_SETS = 1;

// Duration validation (in minutes)
export const MAX_DURATION_MINUTES = 480; // 8 hours
export const MIN_DURATION_MINUTES = 1;

// Distance validation (in meters)
export const MAX_DISTANCE_M = 100000; // 100km
export const MIN_DISTANCE_M = 1;

// RPE validation (Rate of Perceived Exertion)
export const MAX_RPE = 10;
export const MIN_RPE = 1;

// Helper function for validation
export function validateWeight(weight: number): { valid: boolean; error?: string } {
  if (!Number.isFinite(weight)) {
    return { valid: false, error: 'Weight must be a valid number' };
  }
  if (weight < MIN_WEIGHT_KG) {
    return { valid: false, error: `Weight cannot be less than ${MIN_WEIGHT_KG} kg` };
  }
  if (weight > MAX_WEIGHT_KG) {
    return { valid: false, error: `Weight cannot exceed ${MAX_WEIGHT_KG} kg` };
  }
  return { valid: true };
}

export function validateReps(reps: number): { valid: boolean; error?: string } {
  if (!Number.isFinite(reps)) {
    return { valid: false, error: 'Reps must be a valid number' };
  }
  if (reps < MIN_REPS) {
    return { valid: false, error: `Reps must be at least ${MIN_REPS}` };
  }
  if (reps > MAX_REPS) {
    return { valid: false, error: `Reps cannot exceed ${MAX_REPS}` };
  }
  return { valid: true };
}

export function validateSets(sets: number): { valid: boolean; error?: string } {
  if (!Number.isFinite(sets)) {
    return { valid: false, error: 'Sets must be a valid number' };
  }
  if (sets < MIN_SETS) {
    return { valid: false, error: `Sets must be at least ${MIN_SETS}` };
  }
  if (sets > MAX_SETS) {
    return { valid: false, error: `Sets cannot exceed ${MAX_SETS}` };
  }
  return { valid: true };
}
