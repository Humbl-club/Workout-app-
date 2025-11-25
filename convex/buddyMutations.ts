import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Generate a shareable plan code
 */
export const createShareCode = mutation({
  args: {
    planId: v.id("workoutPlans"),
    userId: v.string()
  },
  handler: async (ctx, args) => {
    // Generate unique share code
    const code = `REBLD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Get plan details
    const plan = await ctx.db.get(args.planId);
    if (!plan || plan.userId !== args.userId) {
      throw new Error("Plan not found or unauthorized");
    }

    // Create share record
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const shareId = await ctx.db.insert("sharedPlans", {
      shareCode: code,
      planId: args.planId,
      sharedBy: args.userId,
      sharedWith: [],
      planName: plan.name,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      acceptedBy: [],
      isActive: true
    });

    return { shareCode: code, shareId };
  },
});

/**
 * Accept a shared plan
 */
export const acceptSharedPlan = mutation({
  args: {
    shareCode: v.string(),
    userId: v.string(),
    action: v.union(v.literal("replace"), v.literal("add"), v.literal("decline"))
  },
  handler: async (ctx, args) => {
    // Find shared plan
    const sharedPlan = await ctx.db
      .query("sharedPlans")
      .withIndex("by_shareCode", (q) => q.eq("shareCode", args.shareCode))
      .first();

    if (!sharedPlan) {
      throw new Error("Share code not found or expired");
    }

    // Check expiration
    if (new Date() > new Date(sharedPlan.expiresAt)) {
      throw new Error("This share code has expired");
    }

    if (args.action === "decline") {
      return { success: false, message: "Plan declined" };
    }

    // Get the original plan
    const originalPlan = await ctx.db.get(sharedPlan.planId);
    if (!originalPlan) {
      throw new Error("Original plan not found");
    }

    // Create copy of plan for accepting user
    const newPlanId = await ctx.db.insert("workoutPlans", {
      userId: args.userId,
      name: originalPlan.name,
      weeklyPlan: originalPlan.weeklyPlan,
      dailyRoutine: originalPlan.dailyRoutine,
      createdAt: new Date().toISOString()
    });

    // If replace, set as active plan
    if (args.action === "replace") {
      const user = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .first();

      if (user) {
        await ctx.db.patch(user._id, {
          activePlanId: newPlanId
        });
      }
    }

    // Update shared plan record
    await ctx.db.patch(sharedPlan._id, {
      sharedWith: [...sharedPlan.sharedWith, args.userId],
      acceptedBy: [...sharedPlan.acceptedBy, args.userId]
    });

    // Create buddy relationship
    const existingBuddy = await ctx.db
      .query("workoutBuddies")
      .withIndex("by_pair", (q) => q.eq("userId", args.userId).eq("buddyId", sharedPlan.sharedBy))
      .first();

    if (!existingBuddy) {
      await ctx.db.insert("workoutBuddies", {
        userId: args.userId,
        buddyId: sharedPlan.sharedBy,
        sharedPlanId: newPlanId,
        status: "active",
        createdAt: new Date().toISOString(),
        acceptedAt: new Date().toISOString()
      });

      // Create reverse relationship
      await ctx.db.insert("workoutBuddies", {
        userId: sharedPlan.sharedBy,
        buddyId: args.userId,
        sharedPlanId: originalPlan._id,
        status: "active",
        createdAt: new Date().toISOString(),
        acceptedAt: new Date().toISOString()
      });

      // Create default buddy settings
      await ctx.db.insert("buddySettings", {
        userId: args.userId,
        buddyId: sharedPlan.sharedBy,
        notifyOnWorkoutStart: true,
        compareStats: true,
        shareLogs: true,
        showPRs: true
      });

      await ctx.db.insert("buddySettings", {
        userId: sharedPlan.sharedBy,
        buddyId: args.userId,
        notifyOnWorkoutStart: true,
        compareStats: true,
        shareLogs: true,
        showPRs: true
      });
    }

    return {
      success: true,
      planId: newPlanId,
      buddyCreated: !existingBuddy
    };
  },
});

/**
 * Notify buddy when starting a workout
 */
export const notifyBuddyWorkoutStart = mutation({
  args: {
    userId: v.string(),
    workoutName: v.string()
  },
  handler: async (ctx, args) => {
    // Get all active buddies
    const buddies = await ctx.db
      .query("workoutBuddies")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Send notification to each buddy
    for (const buddy of buddies) {
      // Check if notifications enabled
      const settings = await ctx.db
        .query("buddySettings")
        .withIndex("by_pair", (q) => q.eq("userId", buddy.buddyId).eq("buddyId", args.userId))
        .first();

      if (settings?.notifyOnWorkoutStart) {
        await ctx.db.insert("buddyNotifications", {
          userId: buddy.buddyId,
          triggeredBy: args.userId,
          type: "workout_started",
          relatedPlanId: null,
          relatedShareCode: null,
          message: `started their workout: ${args.workoutName}`,
          createdAt: new Date().toISOString(),
          read: false,
          actionTaken: false
        });
      }
    }

    return { notificationsSent: buddies.length };
  },
});

/**
 * Update buddy notification settings
 */
export const updateBuddySettings = mutation({
  args: {
    userId: v.string(),
    buddyId: v.string(),
    settings: v.object({
      notifyOnWorkoutStart: v.optional(v.boolean()),
      compareStats: v.optional(v.boolean()),
      shareLogs: v.optional(v.boolean()),
      showPRs: v.optional(v.boolean())
    })
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("buddySettings")
      .withIndex("by_pair", (q) => q.eq("userId", args.userId).eq("buddyId", args.buddyId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args.settings);
    } else {
      await ctx.db.insert("buddySettings", {
        userId: args.userId,
        buddyId: args.buddyId,
        notifyOnWorkoutStart: args.settings.notifyOnWorkoutStart ?? true,
        compareStats: args.settings.compareStats ?? true,
        shareLogs: args.settings.shareLogs ?? true,
        showPRs: args.settings.showPRs ?? true
      });
    }

    return { success: true };
  },
});

/**
 * Mark notification as read
 */
export const markNotificationRead = mutation({
  args: {
    notificationId: v.id("buddyNotifications")
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, {
      read: true
    });

    return { success: true };
  },
});

/**
 * Remove workout buddy
 */
export const removeBuddy = mutation({
  args: {
    userId: v.string(),
    buddyId: v.string()
  },
  handler: async (ctx, args) => {
    // Find and delete both buddy relationships
    const userBuddy = await ctx.db
      .query("workoutBuddies")
      .withIndex("by_pair", (q) => q.eq("userId", args.userId).eq("buddyId", args.buddyId))
      .first();

    const reverseBuddy = await ctx.db
      .query("workoutBuddies")
      .withIndex("by_pair", (q) => q.eq("userId", args.buddyId).eq("buddyId", args.userId))
      .first();

    if (userBuddy) {
      await ctx.db.delete(userBuddy._id);
    }

    if (reverseBuddy) {
      await ctx.db.delete(reverseBuddy._id);
    }

    // Delete settings
    const userSettings = await ctx.db
      .query("buddySettings")
      .withIndex("by_pair", (q) => q.eq("userId", args.userId).eq("buddyId", args.buddyId))
      .first();

    const reverseSettings = await ctx.db
      .query("buddySettings")
      .withIndex("by_pair", (q) => q.eq("userId", args.buddyId).eq("buddyId", args.userId))
      .first();

    if (userSettings) {
      await ctx.db.delete(userSettings._id);
    }

    if (reverseSettings) {
      await ctx.db.delete(reverseSettings._id);
    }

    return { success: true };
  },
});
