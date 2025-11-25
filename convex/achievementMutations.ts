import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Update streak after completing a workout
 */
export const updateStreak = mutation({
  args: {
    userId: v.string(),
    workoutDate: v.string() // ISO date of completed workout
  },
  handler: async (ctx, args) => {
    const now = new Date(args.workoutDate);
    const today = now.toISOString().split('T')[0];

    // Get or create streak data
    let streakData = await ctx.db
      .query("streakData")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!streakData) {
      // First workout ever!
      streakData = await ctx.db.insert("streakData", {
        userId: args.userId,
        currentStreak: 1,
        longestStreak: 1,
        lastWorkoutDate: today,
        streakFreezes: 0,
        lastFreezeUsed: null,
        totalWorkouts: 1,
        weeklyWorkouts: [false, false, false, false, false, false, false]
      });

      // Unlock "First Workout" achievement
      await ctx.db.insert("achievements", {
        userId: args.userId,
        type: "first_workout",
        unlockedAt: new Date().toISOString(),
        displayName: "First Step",
        description: "Complete your first workout",
        icon: "🎯",
        tier: "bronze"
      });

      return { currentStreak: 1, achievementsUnlocked: ["first_workout"] };
    }

    // Get existing streak data
    const streakDoc = await ctx.db.get(streakData);
    if (!streakDoc) return { currentStreak: 0, achievementsUnlocked: [] };

    const lastWorkout = new Date(streakDoc.lastWorkoutDate);
    const daysSinceLastWorkout = Math.floor((now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = streakDoc.currentStreak;
    const achievementsUnlocked: string[] = [];

    // Same day workout - don't increment
    if (daysSinceLastWorkout === 0) {
      return { currentStreak: newStreak, achievementsUnlocked: [] };
    }

    // Next day - increment streak
    if (daysSinceLastWorkout === 1) {
      newStreak = streakDoc.currentStreak + 1;
    }
    // Missed days - check for freeze
    else if (daysSinceLastWorkout > 1) {
      // Streak broken (for now, no freeze logic)
      newStreak = 1;
    }

    // Update streak data
    await ctx.db.patch(streakDoc._id, {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, streakDoc.longestStreak),
      lastWorkoutDate: today,
      totalWorkouts: streakDoc.totalWorkouts + 1
    });

    // Check for streak achievements
    if (newStreak === 7) {
      const existing = await ctx.db
        .query("achievements")
        .withIndex("by_userId_type", (q) => q.eq("userId", args.userId).eq("type", "streak_7"))
        .first();

      if (!existing) {
        await ctx.db.insert("achievements", {
          userId: args.userId,
          type: "streak_7",
          unlockedAt: new Date().toISOString(),
          displayName: "Week Warrior",
          description: "7-day workout streak",
          icon: "🔥",
          tier: "silver"
        });
        achievementsUnlocked.push("streak_7");
      }
    }

    if (newStreak === 30) {
      const existing = await ctx.db
        .query("achievements")
        .withIndex("by_userId_type", (q) => q.eq("userId", args.userId).eq("type", "streak_30"))
        .first();

      if (!existing) {
        await ctx.db.insert("achievements", {
          userId: args.userId,
          type: "streak_30",
          unlockedAt: new Date().toISOString(),
          displayName: "Month Master",
          description: "30-day workout streak",
          icon: "⚡",
          tier: "gold"
        });
        achievementsUnlocked.push("streak_30");
      }
    }

    // Check workout count achievements
    const totalWorkouts = streakDoc.totalWorkouts + 1;

    if (totalWorkouts === 10) {
      await unlockAchievement(ctx, args.userId, "workouts_10", "Getting Started", "Complete 10 workouts", "💪", "bronze");
      achievementsUnlocked.push("workouts_10");
    }
    if (totalWorkouts === 50) {
      await unlockAchievement(ctx, args.userId, "workouts_50", "Committed", "Complete 50 workouts", "🏋️", "silver");
      achievementsUnlocked.push("workouts_50");
    }
    if (totalWorkouts === 100) {
      await unlockAchievement(ctx, args.userId, "workouts_100", "Century Club", "Complete 100 workouts", "🎖️", "gold");
      achievementsUnlocked.push("workouts_100");
    }

    return {
      currentStreak: newStreak,
      achievementsUnlocked
    };
  },
});

// Helper function to unlock achievement
async function unlockAchievement(
  ctx: any,
  userId: string,
  type: string,
  displayName: string,
  description: string,
  icon: string,
  tier: "bronze" | "silver" | "gold" | "platinum"
) {
  const existing = await ctx.db
    .query("achievements")
    .withIndex("by_userId_type", (q) => q.eq("userId", userId).eq("type", type))
    .first();

  if (!existing) {
    await ctx.db.insert("achievements", {
      userId,
      type,
      unlockedAt: new Date().toISOString(),
      displayName,
      description,
      icon,
      tier
    });
  }
}

/**
 * Check and unlock volume-based achievements
 */
export const checkVolumeAchievements = mutation({
  args: {
    userId: v.string(),
    totalVolume: v.number() // Cumulative total volume in kg
  },
  handler: async (ctx, args) => {
    const achievementsUnlocked: string[] = [];

    if (args.totalVolume >= 10000) {
      const existing = await ctx.db
        .query("achievements")
        .withIndex("by_userId_type", (q) => q.eq("userId", args.userId).eq("type", "volume_10000"))
        .first();

      if (!existing) {
        await ctx.db.insert("achievements", {
          userId: args.userId,
          type: "volume_10000",
          unlockedAt: new Date().toISOString(),
          displayName: "Heavy Lifter",
          description: "Lift 10,000kg total volume",
          icon: "🏆",
          tier: "gold"
        });
        achievementsUnlocked.push("volume_10000");
      }
    }

    if (args.totalVolume >= 50000) {
      await unlockAchievement(ctx, args.userId, "volume_50000", "Beast Mode", "Lift 50,000kg total", "💎", "platinum");
      achievementsUnlocked.push("volume_50000");
    }

    return { achievementsUnlocked };
  },
});
