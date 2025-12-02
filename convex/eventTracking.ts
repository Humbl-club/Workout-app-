import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Track a user event for analytics
 *
 * Usage:
 * ```typescript
 * await trackEvent({
 *   userId: user.id,
 *   eventType: "plan_generated",
 *   eventData: {
 *     goal: "strength",
 *     experience: "intermediate",
 *     generation_time_ms: 2500,
 *     model: "gemini-2.5-flash"
 *   },
 *   sessionId: sessionId,
 *   metadata: {
 *     platform: "web",
 *     duration_ms: 2500,
 *     success: true
 *   }
 * });
 * ```
 */
export const trackEvent = mutation({
  args: {
    userId: v.string(),
    eventType: v.string(),
    eventData: v.any(),
    sessionId: v.optional(v.string()),
    metadata: v.optional(v.object({
      userAgent: v.optional(v.string()),
      platform: v.optional(v.string()),
      appVersion: v.optional(v.string()),
      locale: v.optional(v.string()),
      duration_ms: v.optional(v.number()),
      success: v.optional(v.boolean()),
      error: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const timestamp = new Date().toISOString();
    const createdAt = Date.now();

    const eventId = await ctx.db.insert("events", {
      userId: args.userId,
      eventType: args.eventType,
      eventData: args.eventData,
      timestamp,
      sessionId: args.sessionId,
      metadata: args.metadata,
      createdAt,
    });

    return eventId;
  },
});

/**
 * Track multiple events in a batch (for efficiency)
 */
export const trackEventBatch = mutation({
  args: {
    events: v.array(v.object({
      userId: v.string(),
      eventType: v.string(),
      eventData: v.any(),
      sessionId: v.optional(v.string()),
      metadata: v.optional(v.object({
        userAgent: v.optional(v.string()),
        platform: v.optional(v.string()),
        appVersion: v.optional(v.string()),
        locale: v.optional(v.string()),
        duration_ms: v.optional(v.number()),
        success: v.optional(v.boolean()),
        error: v.optional(v.string()),
      })),
    })),
  },
  handler: async (ctx, args) => {
    const timestamp = new Date().toISOString();
    const createdAt = Date.now();

    const eventIds = await Promise.all(
      args.events.map((event) =>
        ctx.db.insert("events", {
          userId: event.userId,
          eventType: event.eventType,
          eventData: event.eventData,
          timestamp,
          sessionId: event.sessionId,
          metadata: event.metadata,
          createdAt,
        })
      )
    );

    return eventIds;
  },
});

/**
 * Get events for a specific user
 */
export const getUserEvents = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
    eventType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    let events;
    if (args.eventType) {
      events = await ctx.db
        .query("events")
        .withIndex("by_userId_eventType", (q) =>
          q.eq("userId", args.userId).eq("eventType", args.eventType)
        )
        .order("desc")
        .take(limit);
    } else {
      events = await ctx.db
        .query("events")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(limit);
    }

    return events;
  },
});

/**
 * Get events by type (for analytics dashboards)
 */
export const getEventsByType = query({
  args: {
    eventType: v.string(),
    limit: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 1000;

    let events = await ctx.db
      .query("events")
      .withIndex("by_eventType", (q) => q.eq("eventType", args.eventType))
      .order("desc")
      .take(limit);

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      events = events.filter((event) => {
        if (args.startDate && event.timestamp < args.startDate) return false;
        if (args.endDate && event.timestamp > args.endDate) return false;
        return true;
      });
    }

    return events;
  },
});

/**
 * Get events for a specific session
 */
export const getSessionEvents = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .collect();

    return events;
  },
});

/**
 * Get event counts by type (for analytics)
 */
export const getEventCounts = query({
  args: {
    userId: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let events;

    if (args.userId) {
      events = await ctx.db
        .query("events")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();
    } else {
      events = await ctx.db.query("events").collect();
    }

    // Filter by date range if provided
    if (args.startDate || args.endDate) {
      events = events.filter((event) => {
        if (args.startDate && event.timestamp < args.startDate) return false;
        if (args.endDate && event.timestamp > args.endDate) return false;
        return true;
      });
    }

    // Count events by type
    const counts: Record<string, number> = {};
    events.forEach((event) => {
      counts[event.eventType] = (counts[event.eventType] || 0) + 1;
    });

    return counts;
  },
});

/**
 * Delete old events (data retention policy)
 * Call this periodically to keep database size manageable
 */
export const deleteOldEvents = mutation({
  args: {
    olderThanDays: v.number(), // Delete events older than X days
  },
  handler: async (ctx, args) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - args.olderThanDays);
    const cutoffTimestamp = cutoffDate.toISOString();

    const oldEvents = await ctx.db
      .query("events")
      .withIndex("by_timestamp")
      .filter((q) => q.lt(q.field("timestamp"), cutoffTimestamp))
      .collect();

    // Delete in batches to avoid timeouts
    const batchSize = 100;
    let deletedCount = 0;

    for (let i = 0; i < oldEvents.length; i += batchSize) {
      const batch = oldEvents.slice(i, i + batchSize);
      await Promise.all(batch.map((event) => ctx.db.delete(event._id)));
      deletedCount += batch.length;
    }

    return { deletedCount, cutoffDate: cutoffTimestamp };
  },
});
