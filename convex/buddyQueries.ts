import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get shared plan by code
 */
export const getSharedPlan = query({
  args: {
    shareCode: v.string()
  },
  handler: async (ctx, args) => {
    const sharedPlan = await ctx.db
      .query("sharedPlans")
      .withIndex("by_shareCode", (q) => q.eq("shareCode", args.shareCode))
      .first();

    if (!sharedPlan) {
      return null;
    }

    // Check expiration
    if (new Date() > new Date(sharedPlan.expiresAt)) {
      return null;
    }

    // Get the actual plan
    const plan = await ctx.db.get(sharedPlan.planId);

    return {
      ...sharedPlan,
      plan
    };
  },
});

/**
 * Get user's workout buddies
 * OPTIMIZED: Batch queries to avoid N+1 issue
 */
export const getWorkoutBuddies = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const buddies = await ctx.db
      .query("workoutBuddies")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    if (buddies.length === 0) {
      return [];
    }

    // OPTIMIZATION: Batch load all buddy users and settings to avoid N+1
    const buddyIds = buddies.map(b => b.buddyId);

    // Load all buddy users in parallel (still separate queries but all at once)
    const [allBuddyUsers, allSettings] = await Promise.all([
      // Get all buddy users
      Promise.all(
        buddyIds.map(buddyId =>
          ctx.db
            .query("users")
            .withIndex("by_userId", (q) => q.eq("userId", buddyId))
            .first()
        )
      ),
      // Get all settings
      Promise.all(
        buddyIds.map(buddyId =>
          ctx.db
            .query("buddySettings")
            .withIndex("by_pair", (q) => q.eq("userId", args.userId).eq("buddyId", buddyId))
            .first()
        )
      )
    ]);

    // Map results back to buddies
    return buddies.map((buddy, idx) => ({
      ...buddy,
      buddyUser: allBuddyUsers[idx],
      settings: allSettings[idx]
    }));
  },
});

/**
 * Compare PRs with a buddy
 */
export const getBuddyPRComparison = query({
  args: {
    userId: v.string(),
    buddyId: v.string()
  },
  handler: async (ctx, args) => {
    // Get settings first
    const settings = await ctx.db
      .query("buddySettings")
      .withIndex("by_pair", (q) => q.eq("userId", args.userId).eq("buddyId", args.buddyId))
      .first();

    if (!settings?.showPRs) {
      return { allowed: false, prs: [] };
    }

    // Get user's logs
    const userLogs = await ctx.db
      .query("workoutLogs")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Get buddy's logs
    const buddyLogs = await ctx.db
      .query("workoutLogs")
      .withIndex("by_userId", (q) => q.eq("userId", args.buddyId))
      .collect();

    // Calculate PRs for common exercises
    const exerciseMap = new Map<string, {
      userPR: { weight: number; reps: number; date: string } | null;
      buddyPR: { weight: number; reps: number; date: string } | null;
    }>();

    // Process user logs
    userLogs.forEach(log => {
      log.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if ('weight' in set && 'reps' in set) {
            const current = exerciseMap.get(ex.exercise_name);
            const weight = Number(set.weight);
            const reps = Number(set.reps);

            if (!current?.userPR || weight > current.userPR.weight ||
                (weight === current.userPR.weight && reps > current.userPR.reps)) {
              exerciseMap.set(ex.exercise_name, {
                userPR: { weight, reps, date: log.date },
                buddyPR: current?.buddyPR || null
              });
            }
          }
        });
      });
    });

    // Process buddy logs
    buddyLogs.forEach(log => {
      log.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          if ('weight' in set && 'reps' in set) {
            const current = exerciseMap.get(ex.exercise_name);
            const weight = Number(set.weight);
            const reps = Number(set.reps);

            if (!current?.buddyPR || weight > current.buddyPR.weight ||
                (weight === current.buddyPR.weight && reps > current.buddyPR.reps)) {
              exerciseMap.set(ex.exercise_name, {
                userPR: current?.userPR || null,
                buddyPR: { weight, reps, date: log.date }
              });
            }
          }
        });
      });
    });

    // Convert to array
    const comparisons = Array.from(exerciseMap.entries())
      .map(([exercise, prs]) => ({
        exercise,
        userPR: prs.userPR,
        buddyPR: prs.buddyPR
      }))
      .filter(c => c.userPR && c.buddyPR) // Only show exercises both have done
      .sort((a, b) => {
        // Sort by total volume (weight × reps)
        const aVol = (a.userPR!.weight * a.userPR!.reps) + (a.buddyPR!.weight * a.buddyPR!.reps);
        const bVol = (b.userPR!.weight * b.userPR!.reps) + (b.buddyPR!.weight * b.buddyPR!.reps);
        return bVol - aVol;
      });

    return {
      allowed: true,
      comparisons
    };
  },
});

/**
 * Get buddy notifications
 * OPTIMIZED: Batch load buddy users to avoid N+1
 */
export const getBuddyNotifications = query({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("buddyNotifications")
      .withIndex("by_userId_read", (q) => q.eq("userId", args.userId).eq("read", false))
      .order("desc")
      .take(10);

    if (notifications.length === 0) {
      return [];
    }

    // OPTIMIZATION: Get unique triggeredBy IDs and batch load
    const uniqueBuddyIds = [...new Set(notifications.map(n => n.triggeredBy))];

    const buddyUsers = await Promise.all(
      uniqueBuddyIds.map(buddyId =>
        ctx.db
          .query("users")
          .withIndex("by_userId", (q) => q.eq("userId", buddyId))
          .first()
      )
    );

    // Create a map for fast lookup
    const buddyMap = new Map(
      uniqueBuddyIds.map((id, idx) => [id, buddyUsers[idx]])
    );

    // Map buddy names to notifications
    return notifications.map(notif => ({
      ...notif,
      buddyName: buddyMap.get(notif.triggeredBy) ? "Buddy" : "Unknown" // Could use actual name if stored
    }));
  },
});

/**
 * Get buddy's recent workouts (if sharing enabled)
 */
export const getBuddyRecentWorkouts = query({
  args: {
    userId: v.string(),
    buddyId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Check if sharing enabled
    const settings = await ctx.db
      .query("buddySettings")
      .withIndex("by_pair", (q) => q.eq("userId", args.userId).eq("buddyId", args.buddyId))
      .first();

    if (!settings?.shareLogs) {
      return { allowed: false, workouts: [] };
    }

    // Get buddy's recent workouts
    const workouts = await ctx.db
      .query("workoutLogs")
      .withIndex("by_userId", (q) => q.eq("userId", args.buddyId))
      .order("desc")
      .take(args.limit || 5);

    return {
      allowed: true,
      workouts
    };
  },
});
