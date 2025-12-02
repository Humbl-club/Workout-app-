/**
 * Exercise Preload Hook
 *
 * Automatically preloads exercise explanations in the background
 * - Runs on app startup (after authentication)
 * - Shows progress indicator (optional)
 * - Improves UX by reducing loading times during workouts
 */

import { useEffect, useState } from 'react';
import { useConvex } from 'convex/react';
import { smartPreload, PreloadProgress } from '../services/exerciseCachePreloader';

export interface UseExercisePreloadOptions {
  enabled?: boolean;
  userId: string | null;
  onComplete?: () => void;
}

export function useExercisePreload(options: UseExercisePreloadOptions) {
  const { enabled = true, userId, onComplete } = options;
  const convex = useConvex();
  const [progress, setProgress] = useState<PreloadProgress>({
    total: 0,
    loaded: 0,
    percentage: 0,
  });
  const [isPreloading, setIsPreloading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled || !userId || isComplete) return;

    let isCancelled = false;

    const preload = async () => {
      setIsPreloading(true);

      try {
        await smartPreload(
          convex,
          userId,
          (progressData) => {
            if (!isCancelled) {
              setProgress(progressData);
            }
          }
        );

        if (!isCancelled) {
          setIsComplete(true);
          setIsPreloading(false);
          onComplete?.();
        }
      } catch (error) {
        console.error('Failed to preload exercises:', error);
        if (!isCancelled) {
          setIsPreloading(false);
        }
      }
    };

    // Delay preload by 3 seconds to avoid blocking app startup
    const timer = setTimeout(preload, 3000);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, userId, convex, onComplete, isComplete]);

  return {
    progress,
    isPreloading,
    isComplete,
  };
}
