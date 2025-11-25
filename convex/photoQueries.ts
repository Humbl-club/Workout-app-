import { v } from "convex/values";
import { query } from "./_generated/server";

export const getUserProgressPhotos = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
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
