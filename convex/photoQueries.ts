import { v } from "convex/values";
import { query } from "./_generated/server";
import { isAuthenticatedUser } from "./utils/accessControl";

export const getUserProgressPhotos = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // SECURITY: Verify userId matches authenticated user (returns empty if not auth'd)
    if (!await isAuthenticatedUser(ctx, args.userId)) {
      return [];
    }

    const photos = await ctx.db
      .query("progressPhotos")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 50);

    return photos;
  },
});

export const getLatestPhoto = query({
  args: {
    userId: v.string(),
    photoType: v.optional(v.union(v.literal("front"), v.literal("side"), v.literal("back")))
  },
  handler: async (ctx, args) => {
    // SECURITY: Verify userId matches authenticated user (returns null if not auth'd)
    if (!await isAuthenticatedUser(ctx, args.userId)) {
      return null;
    }

    let query = ctx.db
      .query("progressPhotos")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId));

    if (args.photoType) {
      query = query.filter((q) => q.eq(q.field("photoType"), args.photoType));
    }

    const latest = await query.order("desc").first();
    return latest;
  },
});
