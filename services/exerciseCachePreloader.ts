/**
 * Exercise Cache Preloader
 *
 * Optimizes performance by preloading common exercises into cache:
 * - Reduces API calls during workout sessions
 * - Instant exercise explanations for common movements
 * - Background prefetching on app launch
 */

import { api } from '../convex/_generated/api';
import { ConvexReactClient } from 'convex/react';

// Top 100 most common exercises to preload
const COMMON_EXERCISES = [
  // Upper Push
  'Bench Press', 'Incline Bench Press', 'Overhead Press', 'Push Press',
  'Dumbbell Bench Press', 'Incline Dumbbell Press', 'Dips', 'Push-ups',
  
  // Upper Pull
  'Pull-ups', 'Chin-ups', 'Barbell Row', 'Pendlay Row', 'T-Bar Row',
  'Dumbbell Row', 'Lat Pulldown', 'Face Pulls', 'Cable Row',
  
  // Legs
  'Back Squat', 'Front Squat', 'Deadlift', 'Romanian Deadlift',
  'Sumo Deadlift', 'Bulgarian Split Squat', 'Leg Press', 'Lunges',
  'Walking Lunges', 'Leg Curl', 'Leg Extension', 'Calf Raise',
  
  // Olympic Lifts
  'Clean', 'Power Clean', 'Hang Clean', 'Snatch', 'Power Snatch',
  'Clean & Jerk', 'Hang Snatch',
  
  // Shoulders
  'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Arnold Press',
  'Cable Lateral Raise', 'Upright Row',
  
  // Arms
  'Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl',
  'Cable Curl', 'Tricep Extension', 'Skull Crusher', 'Cable Pushdown',
  'Close Grip Bench Press', 'Overhead Tricep Extension',
  
  // Core
  'Plank', 'Side Plank', 'Hollow Body Hold', 'Dead Bug',
  'Ab Wheel Rollout', 'Hanging Leg Raise', 'Russian Twist',
  
  // Conditioning
  'Burpees', 'Box Jumps', 'Kettlebell Swing', 'Rowing Machine',
  'Assault Bike', 'Jump Rope', 'Ski Erg', 'Sled Push', 'Sled Pull',
  
  // Accessory
  'Glute Bridge', 'Hip Thrust', 'Good Morning', 'Back Extension',
  'Nordic Curl', 'Copenhagen Plank', 'Farmer Carry', 'Suitcase Carry',
  
  // Variations
  'Pause Squat', 'Tempo Bench', 'Box Squat', 'Pin Press',
  'Deficit Deadlift', 'Block Pull', 'Paused Deadlift',
];

export interface PreloadProgress {
  total: number;
  loaded: number;
  percentage: number;
  currentExercise?: string;
}

export type PreloadCallback = (progress: PreloadProgress) => void;

/**
 * Preload exercise cache in background
 */
export async function preloadExerciseCache(
  client: ConvexReactClient,
  onProgress?: PreloadCallback
): Promise<void> {
  const total = COMMON_EXERCISES.length;
  let loaded = 0;

  for (const exercise of COMMON_EXERCISES) {
    try {
      // Check if exercise exists in cache
      const cached = await client.query(api.queries.getExerciseExplanation, {
        exercise_name: exercise,
      });

      // If not cached, trigger explanation generation (will cache it)
      if (!cached) {
        // Note: This would typically call the AI action to generate
        // For now, we just mark it as attempted
        console.log(`Preloading: ${exercise}`);
      }

      loaded++;
      
      if (onProgress) {
        onProgress({
          total,
          loaded,
          percentage: Math.round((loaded / total) * 100),
          currentExercise: exercise,
        });
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to preload ${exercise}:`, error);
      loaded++;
    }
  }
}

/**
 * Preload exercises from user's active plan
 */
export async function preloadPlanExercises(
  client: ConvexReactClient,
  userId: string,
  onProgress?: PreloadCallback
): Promise<void> {
  try {
    // Get user's active plan
    const plans = await client.query(api.queries.getWorkoutPlans, { userId });
    const activePlan = plans && Array.isArray(plans) ? plans.find((p: any) => p.isActive) : null;

    if (!activePlan) return;

    // Extract all unique exercise names from the plan
    const exerciseNames = new Set<string>();
    
    activePlan.weeklyPlan?.forEach((day: any) => {
      day.blocks?.forEach((block: any) => {
        block.exercises?.forEach((exercise: any) => {
          if (exercise.exercise_name) {
            exerciseNames.add(exercise.exercise_name);
          }
        });
      });
    });

    const exercises = Array.from(exerciseNames);
    const total = exercises.length;
    let loaded = 0;

    for (const exercise of exercises) {
      try {
        await client.query(api.queries.getExerciseExplanation, {
          exercise_name: exercise,
        });

        loaded++;
        
        if (onProgress) {
          onProgress({
            total,
            loaded,
            percentage: Math.round((loaded / total) * 100),
            currentExercise: exercise,
          });
        }

        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`Failed to preload ${exercise}:`, error);
        loaded++;
      }
    }
  } catch (error) {
    console.error('Failed to preload plan exercises:', error);
  }
}

/**
 * Smart preloading strategy
 * 1. Preload user's plan exercises first (high priority)
 * 2. Then preload common exercises in background (low priority)
 */
export async function smartPreload(
  client: ConvexReactClient,
  userId: string,
  onProgress?: PreloadCallback
): Promise<void> {
  // Phase 1: Preload user's plan (high priority)
  await preloadPlanExercises(client, userId, onProgress);

  // Phase 2: Preload common exercises in background (low priority)
  // Only if connection is good
  if (navigator.onLine) {
    await preloadExerciseCache(client, onProgress);
  }
}

/**
 * Check cache hit rate for analytics
 */
export async function checkCacheHitRate(
  client: ConvexReactClient
): Promise<{ total: number; cached: number; percentage: number }> {
  let cached = 0;

  for (const exercise of COMMON_EXERCISES) {
    try {
      const explanation = await client.query(api.queries.getExerciseExplanation, {
        exercise_name: exercise,
      });
      if (explanation) cached++;
    } catch {
      // Ignore errors
    }
  }

  return {
    total: COMMON_EXERCISES.length,
    cached,
    percentage: Math.round((cached / COMMON_EXERCISES.length) * 100),
  };
}
