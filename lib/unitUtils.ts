/**
 * Unit conversion utilities for REBLD
 * Default: Kilograms (kg)
 */

export type WeightUnit = 'kg' | 'lbs';

/**
 * Convert between weight units
 */
export function convertWeight(value: number, from: WeightUnit, to: WeightUnit): number {
  if (from === to) return value;

  if (from === 'lbs' && to === 'kg') {
    return Math.round(value * 0.453592 * 2) / 2; // Round to nearest 0.5kg
  }

  if (from === 'kg' && to === 'lbs') {
    return Math.round(value * 2.20462);
  }

  return value;
}

/**
 * Format weight with unit
 */
export function formatWeight(value: number | string, unit: WeightUnit = 'kg'): string {
  return `${value} ${unit}`;
}

/**
 * Get smart weight increments based on current weight
 */
export function getWeightIncrements(currentWeight: number, unit: WeightUnit = 'kg'): number[] {
  if (unit === 'kg') {
    if (currentWeight >= 100) return [-10, -5, -2.5, +2.5, +5, +10];
    if (currentWeight >= 50) return [-5, -2.5, +2.5, +5];
    return [-2.5, -1.25, +1.25, +2.5];
  } else {
    if (currentWeight >= 200) return [-25, -10, -5, +5, +10, +25];
    if (currentWeight >= 100) return [-10, -5, +5, +10];
    return [-5, -2.5, +2.5, +5];
  }
}

/**
 * Format weight for display (removes unnecessary decimals)
 */
export function displayWeight(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';

  // Remove trailing .0
  return num % 1 === 0 ? num.toString() : num.toFixed(1);
}

/**
 * Parse weight input (handles decimal comma/period)
 */
export function parseWeightInput(input: string): number {
  const cleaned = input.replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Suggest next weight based on progression strategy
 */
export function suggestProgressiveOverload(
  lastWeight: number,
  lastReps: number,
  targetReps: number,
  unit: WeightUnit = 'kg'
): { weight: number; reps: number; reason: string } {
  // If they exceeded target reps significantly, increase weight
  if (lastReps >= targetReps + 2) {
    const increment = unit === 'kg' ? 2.5 : 5;
    return {
      weight: lastWeight + increment,
      reps: targetReps,
      reason: 'Progressive overload'
    };
  }

  // If they hit target exactly, small increase
  if (lastReps === targetReps) {
    const increment = unit === 'kg' ? 1.25 : 2.5;
    return {
      weight: lastWeight + increment,
      reps: targetReps,
      reason: 'Steady progress'
    };
  }

  // If they're under target, same weight
  return {
    weight: lastWeight,
    reps: targetReps,
    reason: 'Consolidate strength'
  };
}
