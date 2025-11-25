import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get user's current streak data
 */
export const getStreakData = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const streakData = await ctx.db
      .query("streakData")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!streakData) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalWorkouts: 0,
        lastWorkoutDate: null
      };
    }

    // Check if streak is still active (within 36 hours to account for rest days)
    const now = new Date();
    const lastWorkout = new Date(streakData.lastWorkoutDate);
    const hoursSince = (now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60);

    const isActive = hoursSince < 48; // Within 48 hours = still active

    return {
      currentStreak: isActive ? streakData.currentStreak : 0,
      longestStreak: streakData.longestStreak,
      totalWorkouts: streakData.totalWorkouts,
      lastWorkoutDate: streakData.lastWorkoutDate,
      isActive
    };
  },
});

/**
 * Get user's unlocked achievements
 */
export const getUserAchievements = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc") // Most recent first
      .collect();

    return achievements;
  },
});

/**
 * Get achievement progress (what's next to unlock)
 */
export const getAchievementProgress = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const streakData = await ctx.db
      .query("streakData")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const unlocked = await ctx.db
      .query("achievements")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const unlockedTypes = new Set(unlocked.map(a => a.type));

    const progress = [];

    const totalWorkouts = streakData?.totalWorkouts || 0;
    const currentStreak = streakData?.currentStreak || 0;

    // Workout count progress
    if (!unlockedTypes.has("workouts_10") && totalWorkouts < 10) {
      progress.push({
        type: "workouts_10",
        displayName: "Getting Started",
        description: "Complete 10 workouts",
        icon: "💪",
        current: totalWorkouts,
        target: 10,
        progress: (totalWorkouts / 10) * 100
      });
    }

    if (!unlockedTypes.has("workouts_50") && totalWorkouts < 50) {
      progress.push({
        type: "workouts_50",
        displayName: "Committed",
        description: "Complete 50 workouts",
        icon: "🏋️",
        current: totalWorkouts,
        target: 50,
        progress: (totalWorkouts / 50) * 100
      });
    }

    if (!unlockedTypes.has("workouts_100") && totalWorkouts < 100) {
      progress.push({
        type: "workouts_100",
        displayName: "Century Club",
        description: "Complete 100 workouts",
        icon: "🎖️",
        current: totalWorkouts,
        target: 100,
        progress: (totalWorkouts / 100) * 100
      });
    }

    // Streak progress
    if (!unlockedTypes.has("streak_7") && currentStreak < 7) {
      progress.push({
        type: "streak_7",
        displayName: "Week Warrior",
        description: "7-day workout streak",
        icon: "🔥",
        current: currentStreak,
        target: 7,
        progress: (currentStreak / 7) * 100
      });
    }

    if (!unlockedTypes.has("streak_30") && currentStreak < 30) {
      progress.push({
        type: "streak_30",
        displayName: "Month Master",
        description: "30-day workout streak",
        icon: "⚡",
        current: currentStreak,
        target: 30,
        progress: (currentStreak / 30) * 100
      });
    }

    return progress.slice(0, 3); // Show top 3 closest achievements
  },
});

/**
 * Get 28-day heat map data
 */
export const getHeatMapData = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    // Get last 28 days of workouts
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

    const workouts = await ctx.db
      .query("workoutLogs")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Create map of date -> workout data
    const heatMap: Array<{
      date: string;
      completed: boolean;
      exerciseCount: number;
      volume: number;
      intensity: number;
    }> = [];

    for (let i = 27; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayWorkouts = workouts.filter(w => w.date.startsWith(dateStr));
      const completed = dayWorkouts.length > 0;

      let volume = 0;
      let exerciseCount = 0;

      dayWorkouts.forEach(w => {
        exerciseCount += w.exercises.length;
        w.exercises.forEach(ex => {
          ex.sets.forEach(set => {
            if ('weight' in set && 'reps' in set) {
              volume += Number(set.weight) * Number(set.reps);
            }
          });
        });
      });

      heatMap.push({
        date: dateStr,
        completed,
        exerciseCount,
        volume,
        intensity: Math.min(100, (exerciseCount / 8) * 100)
      });
    }

    return heatMap;
  },
});
