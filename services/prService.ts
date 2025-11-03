import { WorkoutLog, PersonalRecord } from '../types';

/**
 * Detect if a new PR (Personal Record) was achieved
 * Only applicable for weight-based exercises
 */
export const detectPR = (
  exerciseName: string,
  newWeight: number,
  newReps: number,
  allLogs: WorkoutLog[]
): { isPR: boolean; previousBest?: { weight: number; reps: number; date: string } } => {
  // Get all historical performances for this exercise
  const exerciseHistory: Array<{ weight: number; reps: number; date: string }> = [];

  allLogs.forEach(log => {
    const exercise = log.exercises.find(ex => ex.exercise_name === exerciseName);
    if (exercise) {
      exercise.sets.forEach(set => {
        if ('weight' in set && 'reps' in set) {
          exerciseHistory.push({
            weight: Number(set.weight),
            reps: Number(set.reps),
            date: log.date
          });
        }
      });
    }
  });

  if (exerciseHistory.length === 0) {
    // First time doing this exercise = automatic PR
    return { isPR: true };
  }

  // Find the best performance (highest weight, or same weight with more reps)
  let bestWeight = 0;
  let bestReps = 0;
  let bestDate = '';

  exerciseHistory.forEach(perf => {
    if (perf.weight > bestWeight) {
      bestWeight = perf.weight;
      bestReps = perf.reps;
      bestDate = perf.date;
    } else if (perf.weight === bestWeight && perf.reps > bestReps) {
      bestReps = perf.reps;
      bestDate = perf.date;
    }
  });

  // Check if new performance beats the best
  const isPR = newWeight > bestWeight || (newWeight === bestWeight && newReps > bestReps);

  return {
    isPR,
    previousBest: isPR ? { weight: bestWeight, reps: bestReps, date: bestDate } : undefined
  };
};

/**
 * Get all PRs for a user from their workout logs
 */
export const getAllPRs = (allLogs: WorkoutLog[]): PersonalRecord[] => {
  const exercisePRs: Record<string, PersonalRecord> = {};

  allLogs.forEach(log => {
    log.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        if ('weight' in set && 'reps' in set) {
          const weight = Number(set.weight);
          const reps = Number(set.reps);
          const existing = exercisePRs[exercise.exercise_name];

          if (!existing) {
            // First record for this exercise
            exercisePRs[exercise.exercise_name] = {
              exercise_name: exercise.exercise_name,
              weight,
              reps,
              date: log.date
            };
          } else {
            // Check if this beats the existing PR
            if (weight > existing.weight || (weight === existing.weight && reps > existing.reps)) {
              exercisePRs[exercise.exercise_name] = {
                exercise_name: exercise.exercise_name,
                weight,
                reps,
                date: log.date,
                previousBest: {
                  weight: existing.weight,
                  reps: existing.reps,
                  date: existing.date
                }
              };
            }
          }
        }
      });
    });
  });

  return Object.values(exercisePRs);
};

/**
 * Check if an exercise should track PRs
 * Excludes bodyweight exercises, stretching, cardio, etc.
 */
export const shouldTrackPR = (exerciseName: string): boolean => {
  const name = exerciseName.toLowerCase();

  // Exclude bodyweight/stretching/mobility
  const excludeKeywords = [
    'stretch', 'mobility', 'plank', 'bird dog', 'dead bug',
    'thread the needle', 'cat cow', 'foam roll',
    'cardio', 'walk', 'jog', 'run', 'elliptical', 'bike',
    'breath', 'hang', 'hollow hold'
  ];

  return !excludeKeywords.some(keyword => name.includes(keyword));
};
