import { PlanDay, PlanExercise } from '../types';

/**
 * Calculate workout intensity based on RPE and exercise count
 */
export function calculateWorkoutIntensity(day: PlanDay): {
  level: 'High' | 'Moderate' | 'Light';
  value: number; // 0-100
  color: string;
  gradient: string;
} {
  // Get exercises from blocks (single session) or sessions (2x daily)
  let exercises: PlanExercise[] = [];

  // Single session: day.blocks
  if (day.blocks && Array.isArray(day.blocks)) {
    exercises = day.blocks.flatMap(b => Array.isArray(b.exercises) ? b.exercises : []);
  }

  // 2x daily: day.sessions[].blocks[].exercises
  const sessions = (day as any).sessions;
  if ((!exercises.length) && sessions && Array.isArray(sessions)) {
    exercises = sessions.flatMap((s: any) =>
      (s.blocks || []).flatMap((b: any) =>
        Array.isArray(b.exercises) ? b.exercises : []
      )
    );
  }

  if (exercises.length === 0) {
    return {
      level: 'Light',
      value: 0,
      color: 'accent-recovery',
      gradient: 'gradient-recovery'
    };
  }

  // Calculate average RPE (handles string or number)
  const validRPEs = exercises
    .map(ex => {
      if (ex.rpe === null || ex.rpe === undefined) return 5;
      if (typeof ex.rpe === 'number') return ex.rpe;
      const parsed = parseInt(String(ex.rpe), 10);
      return isNaN(parsed) ? 5 : parsed;
    })
    .filter(rpe => !isNaN(rpe) && rpe > 0);

  const avgRPE = validRPEs.length > 0
    ? validRPEs.reduce((sum, rpe) => sum + rpe, 0) / validRPEs.length
    : 5;

  // Factor in volume (exercise count)
  const volumeFactor = Math.min(exercises.length / 8, 1); // Normalize to 0-1
  const intensity = (avgRPE / 10) * 0.7 + volumeFactor * 0.3; // Weighted average

  const value = Math.round(intensity * 100);

  if (avgRPE >= 8 || value >= 75) {
    return {
      level: 'High',
      value,
      color: 'accent-strength',
      gradient: 'gradient-strength'
    };
  }

  if (avgRPE >= 6 || value >= 50) {
    return {
      level: 'Moderate',
      value,
      color: 'accent',
      gradient: 'gradient-accent'
    };
  }

  return {
    level: 'Light',
    value,
    color: 'accent-recovery',
    gradient: 'gradient-recovery'
  };
}

/**
 * Get workout type based on focus and exercises
 */
export function getWorkoutType(day: PlanDay): 'strength' | 'cardio' | 'mobility' | 'mixed' {
  const focus = (day.focus || (day as any).session_name || '').toLowerCase();

  if (focus.includes('cardio') || focus.includes('run') || focus.includes('endurance')) {
    return 'cardio';
  }

  if (focus.includes('mobility') || focus.includes('stretch') || focus.includes('yoga')) {
    return 'mobility';
  }

  if (focus.includes('strength') || focus.includes('power') || focus.includes('lift')) {
    return 'strength';
  }

  return 'mixed';
}

/**
 * Format elapsed time from start date
 */
export function formatElapsedTime(startTime: Date): string {
  const now = new Date();
  const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Estimate calories burned using a simple MET-based formula.
 * calories = MET * 3.5 * weight_kg / 200 * duration_minutes
 * Defaults: weight 70kg, MET derived from workout type + intensity (0-100)
 */
export function estimateCalories(
  durationMinutes: number,
  intensity: number,
  weightKg: number = 70,
  workoutType: 'strength' | 'cardio' | 'mobility' | 'mixed' = 'mixed'
): number {
  // Map workout type + intensity to a MET range
  const intensityClamp = Math.max(0, Math.min(intensity, 100));
  const ramp = (min: number, max: number) =>
    min + ((max - min) * intensityClamp) / 100;

  let met = 6; // default mixed
  if (workoutType === 'cardio') {
    met = ramp(6, 10); // moderate to vigorous cardio
  } else if (workoutType === 'strength') {
    met = ramp(4, 8); // moderate to heavy lifting
  } else if (workoutType === 'mobility') {
    met = ramp(3, 4); // light mobility/yoga
  } else {
    met = ramp(5, 7); // mixed circuits
  }

  const calories = (met * 3.5 * weightKg * durationMinutes) / 200;
  return Math.round(calories);
}
