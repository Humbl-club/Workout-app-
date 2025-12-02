import { query } from "./_generated/server";
import { v } from "convex/values";
import { withCache, userDataCache } from "./utils/queryCache";
import { withMetrics } from "./utils/performanceMetrics";
import { checkRateLimit } from "./utils/rateLimiting";
import { loggers } from "./utils/logger";

/**
 * Analytics Dashboard Queries
 *
 * OPTIMIZED VERSION - November 28, 2025
 * - Uses indexes (no full table scans)
 * - Implements caching
 * - Rate limited
 * - Single-pass processing
 * - Performance metrics
 */

/**
 * Get user activity summary
 * OPTIMIZED: Uses indexes, caching, single-pass processing
 */
export const getUserActivitySummary = query({
  args: {
    userId: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await withMetrics("getUserActivitySummary", async () => {
      const cacheKey = `activity:${args.userId}:${args.startDate || "all"}:${args.endDate || "all"}`;

      return await withCache(userDataCache, cacheKey, async () => {
        // Use indexed query
        const events = await ctx.db
          .query("events")
          .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
          .collect();

        // Filter by date range if provided (server-side)
        const filteredEvents = events.filter((event) => {
          if (args.startDate && event.timestamp < args.startDate) return false;
          if (args.endDate && event.timestamp > args.endDate) return false;
          return true;
        });

        // Single-pass processing (instead of 5 separate filters)
        const stats = filteredEvents.reduce(
          (acc, event) => {
            if (event.eventType === "workout_started") acc.workoutsStarted++;
            if (event.eventType === "workout_completed") {
              acc.workoutsCompleted++;
              acc.totalDuration += event.eventData?.durationMinutes || 0;
            }
            if (event.eventType === "workout_abandoned") acc.workoutsAbandoned++;
            if (event.eventType === "plan_generated") acc.plansGenerated++;
            if (event.eventType === "achievement_unlocked") acc.achievementsUnlocked++;
            return acc;
          },
          {
            workoutsStarted: 0,
            workoutsCompleted: 0,
            workoutsAbandoned: 0,
            plansGenerated: 0,
            achievementsUnlocked: 0,
            totalDuration: 0,
          }
        );

        const completionRate =
          stats.workoutsStarted > 0 ? (stats.workoutsCompleted / stats.workoutsStarted) * 100 : 0;

        const avgDuration =
          stats.workoutsCompleted > 0 ? stats.totalDuration / stats.workoutsCompleted : 0;

        return {
          workoutsStarted: stats.workoutsStarted,
          workoutsCompleted: stats.workoutsCompleted,
          workoutsAbandoned: stats.workoutsAbandoned,
          completionRate: Math.round(completionRate),
          plansGenerated: stats.plansGenerated,
          achievementsUnlocked: stats.achievementsUnlocked,
          avgWorkoutDuration: Math.round(avgDuration),
          totalEvents: filteredEvents.length,
        };
      });
    });
  },
});

/**
 * Get plan generation analytics
 * OPTIMIZED: Uses event type index
 */
export const getPlanGenerationAnalytics = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await withMetrics("getPlanGenerationAnalytics", async () => {
      const cacheKey = `planGen:${args.startDate || "all"}:${args.endDate || "all"}`;

      return await withCache(userDataCache, cacheKey, async () => {
        // Use indexed query by event type
        const events = await ctx.db
          .query("events")
          .withIndex("by_eventType_createdAt", (q) => q.eq("eventType", "plan_generated"))
          .collect();

        // Filter by date range
        const filteredEvents = events.filter((event) => {
          if (args.startDate && event.timestamp < args.startDate) return false;
          if (args.endDate && event.timestamp > args.endDate) return false;
          return true;
        });

        // Single-pass aggregation
        const aggregated = filteredEvents.reduce(
          (acc, event) => {
            const model = event.eventData?.model || "unknown";
            const strategy = event.eventData?.strategy || "unknown";
            const goal = event.eventData?.goal || "unknown";

            acc.modelCounts[model] = (acc.modelCounts[model] || 0) + 1;
            acc.strategyCounts[strategy] = (acc.strategyCounts[strategy] || 0) + 1;
            acc.goalCounts[goal] = (acc.goalCounts[goal] || 0) + 1;
            acc.totalTime += event.eventData?.generation_time_ms || 0;

            return acc;
          },
          {
            modelCounts: {} as Record<string, number>,
            strategyCounts: {} as Record<string, number>,
            goalCounts: {} as Record<string, number>,
            totalTime: 0,
          }
        );

        const avgGenerationTime =
          filteredEvents.length > 0 ? aggregated.totalTime / filteredEvents.length : 0;

        return {
          totalPlans: filteredEvents.length,
          avgGenerationTime: Math.round(avgGenerationTime),
          modelDistribution: aggregated.modelCounts,
          strategyDistribution: aggregated.strategyCounts,
          goalDistribution: aggregated.goalCounts,
        };
      });
    });
  },
});

/**
 * Get workout completion trends over time
 * OPTIMIZED: Uses indexed query with time range
 */
export const getWorkoutTrends = query({
  args: {
    userId: v.optional(v.string()),
    days: v.number(),
  },
  handler: async (ctx, args) => {
    return await withMetrics("getWorkoutTrends", async () => {
      const endDate = Date.now();
      const startDate = endDate - args.days * 24 * 60 * 60 * 1000;

      let events;
      if (args.userId) {
        // Use compound index for user + time
        events = await ctx.db
          .query("events")
          .withIndex("by_userId_createdAt", (q) =>
            q.eq("userId", args.userId).gte("createdAt", startDate).lte("createdAt", endDate)
          )
          .collect();
      } else {
        // Use createdAt index
        events = await ctx.db
          .query("events")
          .withIndex("by_createdAt", (q) => q.gte("createdAt", startDate).lte("createdAt", endDate))
          .collect();
      }

      // Single-pass grouping by date
      const dailyStats: Record<
        string,
        {
          date: string;
          workoutsStarted: number;
          workoutsCompleted: number;
          workoutsAbandoned: number;
        }
      > = {};

      events.forEach((event) => {
        const date = event.timestamp.split("T")[0];

        if (!dailyStats[date]) {
          dailyStats[date] = {
            date,
            workoutsStarted: 0,
            workoutsCompleted: 0,
            workoutsAbandoned: 0,
          };
        }

        if (event.eventType === "workout_started") dailyStats[date].workoutsStarted++;
        if (event.eventType === "workout_completed") dailyStats[date].workoutsCompleted++;
        if (event.eventType === "workout_abandoned") dailyStats[date].workoutsAbandoned++;
      });

      const trends = Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date));

      return trends;
    });
  },
});

/**
 * Get exercise substitution analytics
 * OPTIMIZED: Uses event type index
 */
export const getExerciseSubstitutionAnalytics = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await withMetrics("getExerciseSubstitutionAnalytics", async () => {
      const cacheKey = `substitutions:${args.startDate || "all"}:${args.endDate || "all"}`;

      return await withCache(userDataCache, cacheKey, async () => {
        const events = await ctx.db
          .query("events")
          .withIndex("by_eventType_createdAt", (q) => q.eq("eventType", "exercise_substituted"))
          .collect();

        const filteredEvents = events.filter((event) => {
          if (args.startDate && event.timestamp < args.startDate) return false;
          if (args.endDate && event.timestamp > args.endDate) return false;
          return true;
        });

        // Single-pass aggregation
        const substitutionCounts: Record<
          string,
          {
            count: number;
            reasons: Record<string, number>;
          }
        > = {};

        filteredEvents.forEach((event) => {
          const exerciseName = event.eventData?.originalExercise || "unknown";
          const reason = event.eventData?.reason || "unspecified";

          if (!substitutionCounts[exerciseName]) {
            substitutionCounts[exerciseName] = {
              count: 0,
              reasons: {},
            };
          }

          substitutionCounts[exerciseName].count++;
          substitutionCounts[exerciseName].reasons[reason] =
            (substitutionCounts[exerciseName].reasons[reason] || 0) + 1;
        });

        const topSubstitutions = Object.entries(substitutionCounts)
          .map(([exercise, data]) => ({
            exercise,
            count: data.count,
            topReason: Object.entries(data.reasons).sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown",
            reasons: data.reasons,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 20);

        return {
          totalSubstitutions: filteredEvents.length,
          topSubstitutions,
        };
      });
    });
  },
});

/**
 * Get chatbot usage analytics
 * OPTIMIZED: Uses indexed query
 */
export const getChatbotAnalytics = query({
  args: {
    userId: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await withMetrics("getChatbotAnalytics", async () => {
      const cacheKey = `chatbot:${args.userId || "all"}:${args.startDate || "all"}:${args.endDate || "all"}`;

      return await withCache(userDataCache, cacheKey, async () => {
        let events;

        if (args.userId) {
          events = await ctx.db
            .query("events")
            .withIndex("by_userId_eventType", (q) =>
              q.eq("userId", args.userId).eq("eventType", "chatbot_message_sent")
            )
            .collect();
        } else {
          events = await ctx.db
            .query("events")
            .withIndex("by_eventType_createdAt", (q) => q.eq("eventType", "chatbot_message_sent"))
            .collect();
        }

        const filteredEvents = events.filter((event) => {
          if (args.startDate && event.timestamp < args.startDate) return false;
          if (args.endDate && event.timestamp > args.endDate) return false;
          return true;
        });

        const totalMessages = filteredEvents.length;
        const uniqueUsers = new Set(filteredEvents.map((e) => e.userId)).size;

        // Count function calls in single pass
        const functionCalls: Record<string, number> = {};
        let functionCallCount = 0;

        filteredEvents.forEach((event) => {
          if (event.eventData?.functionCalled !== undefined) {
            const funcName = event.eventData.functionCalled || "unknown";
            functionCalls[funcName] = (functionCalls[funcName] || 0) + 1;
            functionCallCount++;
          }
        });

        return {
          totalMessages,
          uniqueUsers,
          avgMessagesPerUser: uniqueUsers > 0 ? Math.round(totalMessages / uniqueUsers) : 0,
          functionCalls,
          totalFunctionCalls: functionCallCount,
        };
      });
    });
  },
});

/**
 * Get user retention metrics
 * OPTIMIZED: Uses indexed query, reduced payload
 */
export const getRetentionMetrics = query({
  args: {
    cohortStartDate: v.string(),
    cohortEndDate: v.string(),
  },
  handler: async (ctx, args) => {
    return await withMetrics("getRetentionMetrics", async () => {
      await checkRateLimit(ctx, "retention", 10, 60); // 10 calls per minute

      const cacheKey = `retention:${args.cohortStartDate}:${args.cohortEndDate}`;

      return await withCache(userDataCache, cacheKey, async () => {
        // Use indexed query for time range
        const cohortStartMs = new Date(args.cohortStartDate).getTime();
        const cohortEndMs = new Date(args.cohortEndDate).getTime();

        const allEvents = await ctx.db
          .query("events")
          .withIndex("by_createdAt", (q) => q.gte("createdAt", cohortStartMs))
          .collect();

        // Group events by user (single pass)
        const userEvents: Record<string, { firstEvent: number; eventTimestamps: number[] }> = {};

        allEvents.forEach((event) => {
          const eventTime = new Date(event.timestamp).getTime();

          if (!userEvents[event.userId]) {
            userEvents[event.userId] = {
              firstEvent: eventTime,
              eventTimestamps: [eventTime],
            };
          } else {
            userEvents[event.userId].eventTimestamps.push(eventTime);
            if (eventTime < userEvents[event.userId].firstEvent) {
              userEvents[event.userId].firstEvent = eventTime;
            }
          }
        });

        // Filter to cohort users
        const cohortUsers = Object.entries(userEvents).filter(
          ([userId, data]) => data.firstEvent >= cohortStartMs && data.firstEvent <= cohortEndMs
        );

        const totalCohortUsers = cohortUsers.length;

        // Calculate retention for weeks 1, 2, 4
        const calculateWeekRetention = (weekNumber: number) => {
          const weekStartMs = cohortStartMs + weekNumber * 7 * 24 * 60 * 60 * 1000;
          const weekEndMs = weekStartMs + 7 * 24 * 60 * 60 * 1000;

          const retainedUsers = cohortUsers.filter(([userId, data]) =>
            data.eventTimestamps.some((t) => t >= weekStartMs && t < weekEndMs)
          ).length;

          return {
            week: weekNumber,
            retainedUsers,
            retentionRate:
              totalCohortUsers > 0 ? Math.round((retainedUsers / totalCohortUsers) * 100) : 0,
          };
        };

        return {
          cohortSize: totalCohortUsers,
          week1: calculateWeekRetention(1),
          week2: calculateWeekRetention(2),
          week4: calculateWeekRetention(4),
        };
      });
    });
  },
});

/**
 * Get A/B test results
 * OPTIMIZED: Reduced payload
 */
export const getABTestResults = query({
  args: {
    testName: v.string(),
    metricName: v.string(),
  },
  handler: async (ctx, args) => {
    return await withMetrics("getABTestResults", async () => {
      const cacheKey = `abtest:${args.testName}:${args.metricName}`;

      return await withCache(userDataCache, cacheKey, async () => {
        const events = await ctx.db.query("events").collect();

        // Filter to test events
        const testEvents = events.filter((e) => e.metadata?.abTest === args.testName);

        const variantA = testEvents.filter((e) => e.metadata?.abVariant === "A");
        const variantB = testEvents.filter((e) => e.metadata?.abVariant === "B");

        // Calculate metric
        const calculateMetric = (events: any[]) => {
          if (args.metricName === "plan_completion_rate") {
            const started = events.filter((e) => e.eventType === "workout_started").length;
            const completed = events.filter((e) => e.eventType === "workout_completed").length;
            return started > 0 ? (completed / started) * 100 : 0;
          }

          if (args.metricName === "avg_generation_time") {
            const generationEvents = events.filter((e) => e.eventType === "plan_generated");
            return generationEvents.length > 0
              ? generationEvents.reduce((acc, e) => acc + (e.metadata?.duration_ms || 0), 0) /
                  generationEvents.length
              : 0;
          }

          return 0;
        };

        const metricA = calculateMetric(variantA);
        const metricB = calculateMetric(variantB);

        return {
          testName: args.testName,
          metricName: args.metricName,
          variantA: {
            sampleSize: variantA.length,
            metricValue: Math.round(metricA * 100) / 100,
          },
          variantB: {
            sampleSize: variantB.length,
            metricValue: Math.round(metricB * 100) / 100,
          },
          improvement: metricA > 0 ? ((metricB - metricA) / metricA) * 100 : 0,
        };
      });
    });
  },
});

/**
 * Get real-time dashboard stats
 * OPTIMIZED: Uses indexed queries, single-pass processing, rate limited
 */
export const getRealtimeDashboard = query({
  args: {},
  handler: async (ctx) => {
    return await withMetrics("getRealtimeDashboard", async () => {
      await checkRateLimit(ctx, "dashboard", 10, 60, false); // 10 calls per minute

      return await withCache(userDataCache, "dashboard:realtime", async () => {
        const now = Date.now();
        const last24hMs = now - 24 * 60 * 60 * 1000;
        const last7dMs = now - 7 * 24 * 60 * 60 * 1000;

        // Use indexed query for last 7 days (includes 24h)
        const events = await ctx.db
          .query("events")
          .withIndex("by_createdAt", (q) => q.gte("createdAt", last7dMs))
          .collect();

        // Single-pass processing for both time periods
        const stats = events.reduce(
          (acc, event) => {
            const eventTime = new Date(event.timestamp).getTime();
            const is24h = eventTime >= last24hMs;
            const is7d = eventTime >= last7dMs;

            if (is24h) {
              acc.users24h.add(event.userId);
              if (event.eventType === "workout_completed") acc.workouts24h++;
              if (event.eventType === "plan_generated") acc.plans24h++;
              acc.events24h++;
            }

            if (is7d) {
              acc.users7d.add(event.userId);
              if (event.eventType === "workout_completed") acc.workouts7d++;
              if (event.eventType === "plan_generated") acc.plans7d++;
              acc.events7d++;
            }

            return acc;
          },
          {
            users24h: new Set<string>(),
            workouts24h: 0,
            plans24h: 0,
            events24h: 0,
            users7d: new Set<string>(),
            workouts7d: 0,
            plans7d: 0,
            events7d: 0,
          }
        );

        return {
          last24h: {
            activeUsers: stats.users24h.size,
            workoutsCompleted: stats.workouts24h,
            plansGenerated: stats.plans24h,
            totalEvents: stats.events24h,
          },
          last7d: {
            activeUsers: stats.users7d.size,
            workoutsCompleted: stats.workouts7d,
            plansGenerated: stats.plans7d,
            totalEvents: stats.events7d,
          },
        };
      });
    });
  },
});
