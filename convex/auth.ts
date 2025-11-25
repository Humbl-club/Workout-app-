import { query } from "./_generated/server";
import { v } from "convex/values";

// Get current user - uses Clerk user ID
export const getCurrentUser = query({
  args: {
    userId: v.string(), // Clerk user ID
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    // If user doesn't exist, create one
    if (!user) {
      const newUserId = await ctx.db.insert("users", {
        userId: args.userId,
        activePlanId: null,
        lastProgressionApplied: null,
        bodyMetrics: null,
        goals: null,
      });
      const newUser = await ctx.db.get(newUserId);
      return newUser ? { ...newUser, _id: newUser._id } : null;
    }

    return user ? { ...user, _id: user._id } : null;
  },
});
