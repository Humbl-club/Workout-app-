import { useMutation, useQuery } from "convex/react";
import { useUser } from '@clerk/clerk-react';
import { api } from "../convex/_generated/api";

/**
 * Hook to save exercise history for auto-fill next time
 * Use within React components only
 */
export const useSaveExerciseHistory = () => {
  const { user } = useUser();
  const userId = user?.id || null;
  const saveHistory = useMutation(api.mutations.saveExerciseHistory);

  return async (
    exerciseName: string,
    weight: number,
    reps: number
  ) => {
    if (!userId) return;
    
    try {
      await saveHistory({ userId, exerciseName, weight, reps });
    } catch (error) {
      console.error("Failed to save exercise history:", error);
    }
  };
};

/**
 * Hook to get exercise history for auto-fill
 * Use within React components: const history = useExerciseHistoryFor(exerciseName);
 */
export const useExerciseHistoryFor = (exerciseName: string) => {
  const { user } = useUser();
  const userId = user?.id || null;
  
  const history = useQuery(
    api.queries.getExerciseHistory,
    (userId && exerciseName) ? { userId, exerciseName } : "skip"
  );

  if (!history) return null;

  return {
    weight: history.last_weight,
    reps: history.last_reps
  };
};

/**
 * Legacy async function wrapper - for backwards compatibility
 * Note: This creates a hook internally, so use useExerciseHistoryFor in components instead
 */
export const saveExerciseHistory = async (
  exerciseName: string,
  weight: number,
  reps: number
) => {
  // This needs to be called from a component with useSaveExerciseHistory
  console.warn("saveExerciseHistory: Use useSaveExerciseHistory hook instead");
};

/**
 * Legacy async function wrapper - for backwards compatibility  
 * Note: Use useExerciseHistoryFor hook in components instead
 */
export const getExerciseHistory = async (
  exerciseName: string
): Promise<{ weight: number; reps: number } | null> => {
  // This needs to be called from a component with useExerciseHistoryFor
  console.warn("getExerciseHistory: Use useExerciseHistoryFor hook instead");
  return null;
};
