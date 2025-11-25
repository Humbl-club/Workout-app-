import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const uploadProgressPhoto = mutation({
  args: {
    userId: v.string(),
    photoUrl: v.string(),
    photoType: v.union(v.literal("front"), v.literal("side"), v.literal("back")),
    analysis: v.optional(v.object({
      bodyFatEstimate: v.number(),
      muscleChanges: v.string(),
      improvements: v.array(v.string()),
      suggestions: v.array(v.string()),
      confidence: v.number()
    }))
  },
  handler: async (ctx, args) => {
    // Get most recent photo of same type for comparison
    const previousPhoto = await ctx.db
      .query("progressPhotos")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("photoType"), args.photoType))
      .order("desc")
      .first();

    const photoId = await ctx.db.insert("progressPhotos", {
      userId: args.userId,
      photoUrl: args.photoUrl,
      photoType: args.photoType,
      date: new Date().toISOString(),
      aiAnalysis: args.analysis,
      comparedTo: previousPhoto?._id || null,
      createdAt: new Date().toISOString()
    });

    return { photoId, comparedTo: previousPhoto?._id };
  },
});

export const deleteProgressPhoto = mutation({
  args: {
    photoId: v.id("progressPhotos"),
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const photo = await ctx.db.get(args.photoId);

    if (!photo || photo.userId !== args.userId) {
      throw new Error("Photo not found or unauthorized");
    }

    await ctx.db.delete(args.photoId);
    return { success: true };
  },
});
