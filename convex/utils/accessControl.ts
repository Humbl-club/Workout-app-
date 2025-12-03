/**
 * Access Control Utilities
 *
 * Prevents unauthorized access to user data.
 * ALWAYS call these before modifying data in mutations.
 */

import { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import { DataModel } from "../_generated/dataModel";
import { Id } from "../_generated/dataModel";

/**
 * Verify user owns a workout plan
 */
export async function verifyPlanOwnership(
  ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>,
  planId: Id<"workoutPlans">,
  userId: string
): Promise<void> {
  const plan = await ctx.db.get(planId);

  if (!plan) {
    throw new Error("Plan not found");
  }

  if (plan.userId !== userId) {
    throw new Error("Unauthorized: You don't own this plan");
  }
}

/**
 * Verify user owns a workout log
 */
export async function verifyLogOwnership(
  ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>,
  logId: Id<"workoutLogs">,
  userId: string
): Promise<void> {
  const log = await ctx.db.get(logId);

  if (!log) {
    throw new Error("Workout log not found");
  }

  if (log.userId !== userId) {
    throw new Error("Unauthorized: You don't own this workout log");
  }
}

/**
 * Verify user owns a buddy relationship
 */
export async function verifyBuddyRelationship(
  ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>,
  buddyId: Id<"workoutBuddies">,
  userId: string
): Promise<void> {
  const buddy = await ctx.db.get(buddyId);

  if (!buddy) {
    throw new Error("Buddy relationship not found");
  }

  // User must be either the user or their buddy
  if (buddy.userId !== userId && buddy.buddyId !== userId) {
    throw new Error("Unauthorized: You're not part of this buddy relationship");
  }
}

/**
 * Verify user owns a shared plan
 */
export async function verifySharedPlanOwnership(
  ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>,
  sharedPlanId: Id<"sharedPlans">,
  userId: string
): Promise<void> {
  const sharedPlan = await ctx.db.get(sharedPlanId);

  if (!sharedPlan) {
    throw new Error("Shared plan not found");
  }

  if (sharedPlan.sharedBy !== userId) {
    throw new Error("Unauthorized: You don't own this shared plan");
  }
}

/**
 * Verify user owns their profile
 */
export async function verifyProfileOwnership(
  ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>,
  profileId: Id<"users">,
  userId: string
): Promise<void> {
  const profile = await ctx.db.get(profileId);

  if (!profile) {
    throw new Error("User profile not found");
  }

  if (profile.userId !== userId) {
    throw new Error("Unauthorized: You don't own this profile");
  }
}

/**
 * Verify user owns an achievement
 */
export async function verifyAchievementOwnership(
  ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>,
  achievementId: Id<"achievements">,
  userId: string
): Promise<void> {
  const achievement = await ctx.db.get(achievementId);

  if (!achievement) {
    throw new Error("Achievement not found");
  }

  if (achievement.userId !== userId) {
    throw new Error("Unauthorized: You don't own this achievement");
  }
}

/**
 * Verify user owns exercise history
 */
export async function verifyExerciseHistoryOwnership(
  ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>,
  historyId: Id<"exerciseHistory">,
  userId: string
): Promise<void> {
  const history = await ctx.db.get(historyId);

  if (!history) {
    throw new Error("Exercise history not found");
  }

  if (history.userId !== userId) {
    throw new Error("Unauthorized: You don't own this exercise history");
  }
}

/**
 * Get userId from Clerk auth (standard pattern)
 */
export async function getUserIdFromAuth(
  ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized: Not authenticated");
  }

  return identity.subject; // Clerk user ID
}

/**
 * Verify authenticated user matches userId parameter
 * For MUTATIONS: throws error if not authenticated or mismatch
 */
export async function verifyAuthenticatedUser(
  ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>,
  userId: string
): Promise<void> {
  const authenticatedUserId = await getUserIdFromAuth(ctx);

  if (authenticatedUserId !== userId) {
    throw new Error("Unauthorized: User ID mismatch");
  }
}

/**
 * Check if authenticated user matches userId parameter (non-throwing)
 * For QUERIES: returns false if not authenticated or mismatch (allows graceful handling)
 */
export async function isAuthenticatedUser(
  ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>,
  userId: string
): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return false; // Not authenticated yet (loading state)
  }

  return identity.subject === userId;
}

/**
 * Verify user is an admin
 * Returns the authenticated user ID if admin, throws otherwise
 */
export async function verifyAdmin(
  ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized: Not authenticated");
  }

  const userId = identity.subject;

  // Look up user to check role
  const user = await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();

  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return userId;
}

/**
 * Check if user is admin (non-throwing version)
 * Returns true if admin, false otherwise
 */
export async function isAdmin(
  ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>
): Promise<boolean> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return false;
  }

  const userId = identity.subject;

  const user = await ctx.db
    .query("users")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();

  return user?.role === "admin";
}
