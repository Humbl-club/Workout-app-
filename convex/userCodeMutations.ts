import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Generate unique user code (REBLD-ABC12345)
 * Uses cryptographically secure random generation
 */
function generateUserCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'REBLD-';

  // Generate 8 random bytes for increased security (was 6)
  const randomBytes = new Uint8Array(8);
  crypto.getRandomValues(randomBytes);

  for (let i = 0; i < 8; i++) {
    code += chars[randomBytes[i] % chars.length];
  }

  return code;
}

/**
 * Ensure user has a unique code (called on user creation or first login)
 * RACE CONDITION FIX: Re-check user state before patching to prevent concurrent updates
 */
export const ensureUserCode = mutation({
  args: {
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      // User doesn't exist, will be created elsewhere
      return null;
    }

    // User already has a code
    if (user.userCode) {
      return user.userCode;
    }

    // Generate unique code
    let code = generateUserCode();
    let attempts = 0;
    let isUnique = false;

    // Ensure code is unique (very unlikely to collide with 36^8 combinations = 2.8 trillion)
    while (!isUnique && attempts < 20) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_userCode", (q) => q.eq("userCode", code))
        .first();

      if (!existing) {
        isUnique = true;
      } else {
        code = generateUserCode();
        attempts++;
      }
    }

    // RACE CONDITION FIX: Re-read user to check if another concurrent call already set a code
    const freshUser = await ctx.db.get(user._id);
    if (freshUser?.userCode) {
      // Another concurrent call already set a code, return that one
      return freshUser.userCode;
    }

    // Update user with code
    await ctx.db.patch(user._id, {
      userCode: code
    });

    return code;
  },
});

/**
 * Get user by their user code (with authentication)
 * SECURITY: Requires authentication to prevent user enumeration attacks
 */
export const getUserByCode = query({
  args: {
    userCode: v.string()
  },
  handler: async (ctx, args) => {
    // SECURITY: Require authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userCode", (q) => q.eq("userCode", args.userCode))
      .first();

    if (!user) {
      return { exists: false };
    }

    // Return minimal info to prevent exposing too much user data
    return {
      exists: true,
      userCode: user.userCode,
      userId: user.userId // Needed for buddy request
    };
  },
});

/**
 * Send buddy request via user code
 * SECURITY: Requires authentication and creates pending request (not instant buddy)
 */
export const sendBuddyRequest = mutation({
  args: {
    fromUserId: v.string(),
    toUserCode: v.string()
  },
  handler: async (ctx, args) => {
    // SECURITY: Verify authenticated user matches fromUserId
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const authenticatedUserId = identity.subject;
    if (authenticatedUserId !== args.fromUserId) {
      throw new Error("Unauthorized: Can only send requests as yourself");
    }

    // Find target user
    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_userCode", (q) => q.eq("userCode", args.toUserCode))
      .first();

    if (!targetUser) {
      throw new Error("User code not found");
    }

    if (targetUser.userId === args.fromUserId) {
      throw new Error("You can't add yourself as a buddy!");
    }

    // Check if already buddies or pending request exists
    const existing = await ctx.db
      .query("workoutBuddies")
      .withIndex("by_pair", (q) => q.eq("userId", args.fromUserId).eq("buddyId", targetUser.userId))
      .first();

    if (existing) {
      if (existing.status === "active") {
        throw new Error("Already buddies!");
      } else if (existing.status === "pending") {
        throw new Error("Buddy request already sent!");
      }
    }

    // SECURITY FIX: Create PENDING buddy relationship (not active)
    // User must explicitly accept before becoming buddies
    await ctx.db.insert("workoutBuddies", {
      userId: args.fromUserId,
      buddyId: targetUser.userId,
      sharedPlanId: null,
      status: "pending", // Changed from "active"
      createdAt: new Date().toISOString(),
      acceptedAt: null // Not accepted yet
    });

    // Send notification
    await ctx.db.insert("buddyNotifications", {
      userId: targetUser.userId,
      triggeredBy: args.fromUserId,
      type: "buddy_request",
      relatedPlanId: null,
      relatedShareCode: null,
      message: "wants to be your workout buddy!",
      createdAt: new Date().toISOString(),
      read: false,
      actionTaken: false // Changed from true - user needs to accept
    });

    return {
      success: true,
      buddyId: targetUser.userId,
      buddyCode: targetUser.userCode,
      status: "pending"
    };
  },
});

/**
 * Accept a buddy request
 * SECURITY: Only the recipient can accept their own requests
 */
export const acceptBuddyRequest = mutation({
  args: {
    userId: v.string(),
    requesterId: v.string(),
  },
  handler: async (ctx, args) => {
    // SECURITY: Verify authenticated user matches userId (recipient)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    const authenticatedUserId = identity.subject;
    if (authenticatedUserId !== args.userId) {
      throw new Error("Unauthorized: Can only accept your own buddy requests");
    }

    // Find pending request
    const request = await ctx.db
      .query("workoutBuddies")
      .withIndex("by_pair", (q) => q.eq("userId", args.requesterId).eq("buddyId", args.userId))
      .first();

    if (!request) {
      throw new Error("Buddy request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request is not pending");
    }

    // Update request to active
    await ctx.db.patch(request._id, {
      status: "active",
      acceptedAt: new Date().toISOString()
    });

    // Create reciprocal relationship
    await ctx.db.insert("workoutBuddies", {
      userId: args.userId,
      buddyId: args.requesterId,
      sharedPlanId: null,
      status: "active",
      createdAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString()
    });

    // Create settings for both users
    await ctx.db.insert("buddySettings", {
      userId: args.userId,
      buddyId: args.requesterId,
      notifyOnWorkoutStart: true,
      compareStats: true,
      shareLogs: true,
      showPRs: true
    });

    await ctx.db.insert("buddySettings", {
      userId: args.requesterId,
      buddyId: args.userId,
      notifyOnWorkoutStart: true,
      compareStats: true,
      shareLogs: true,
      showPRs: true
    });

    return { success: true };
  },
});
