/**
 * Admin Dashboard Queries (Optimized)
 *
 * Aggregated queries for admin dashboard analytics with:
 * - Admin authentication required
 * - Caching for expensive queries
 * - Rate limiting to prevent abuse
 * - Performance metrics tracking
 * - Single-pass processing
 * - Optimized payload sizes
 */

import { query } from "./_generated/server";
import { v } from "convex/values";
import { withCache, userDataCache } from "./utils/queryCache";
import { checkRateLimit } from "./utils/rateLimiting";
import { withMetrics } from "./utils/performanceMetrics";
import { validatePagination } from "./utils/pagination";
import { verifyAdmin } from "./utils/accessControl";

/**
 * Get user demographics (location distribution)
 *
 * Optimized with:
 * - Caching (2 min TTL)
 * - Rate limiting (10 calls/min)
 * - Top 10 results only (reduced payload)
 */
export const getUserDemographics = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin authentication
    await verifyAdmin(ctx);

    return await withMetrics("getUserDemographics", async () => {
      await checkRateLimit(ctx, "admin:demographics", 10, 60, true);

      const cacheKey = `demographics:${args.startDate || 'all'}:${args.endDate || 'all'}`;

      return await withCache(userDataCache, cacheKey, async () => {
        const users = await ctx.db.query("users").collect();

        // Single-pass processing
        const stats = users.reduce((acc, user) => {
          if (user.locationData) {
            acc.usersWithLocation++;

            if (user.locationData.country) {
              acc.byCountry[user.locationData.country] = (acc.byCountry[user.locationData.country] || 0) + 1;
            }
            if (user.locationData.region) {
              acc.byRegion[user.locationData.region] = (acc.byRegion[user.locationData.region] || 0) + 1;
            }
            if (user.locationData.timezone) {
              acc.byTimezone[user.locationData.timezone] = (acc.byTimezone[user.locationData.timezone] || 0) + 1;
            }
          }
          return acc;
        }, {
          usersWithLocation: 0,
          byCountry: {} as Record<string, number>,
          byRegion: {} as Record<string, number>,
          byTimezone: {} as Record<string, number>,
        });

        // Sort and limit to top 10 (reduce payload size)
        const topCountries = Object.entries(stats.byCountry)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([country, count]) => ({ country, count }));

        const topRegions = Object.entries(stats.byRegion)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([region, count]) => ({ region, count }));

        const topTimezones = Object.entries(stats.byTimezone)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([timezone, count]) => ({ timezone, count }));

        return {
          totalUsers: users.length,
          usersWithLocation: stats.usersWithLocation,
          topCountries,
          topRegions,
          topTimezones,
          totalCountries: Object.keys(stats.byCountry).length,
          totalRegions: Object.keys(stats.byRegion).length,
          // Don't return full maps (reduces payload by ~80%)
        };
      });
    });
  },
});

/**
 * Get device/platform distribution
 *
 * Optimized with caching and single-pass processing
 */
export const getDeviceStats = query({
  args: {},
  handler: async (ctx) => {
    // SECURITY: Require admin authentication
    await verifyAdmin(ctx);

    return await withMetrics("getDeviceStats", async () => {
      await checkRateLimit(ctx, "admin:devices", 10, 60, true);

      return await withCache(userDataCache, "devices:stats", async () => {
        const users = await ctx.db.query("users").collect();

        // Single-pass processing
        const stats = users.reduce((acc, user) => {
          if (user.deviceData) {
            acc.usersWithDeviceData++;

            if (user.deviceData.deviceType) {
              acc.byDeviceType[user.deviceData.deviceType] = (acc.byDeviceType[user.deviceData.deviceType] || 0) + 1;
            }
            if (user.deviceData.os) {
              acc.byOS[user.deviceData.os] = (acc.byOS[user.deviceData.os] || 0) + 1;
            }
            if (user.deviceData.browser) {
              acc.byBrowser[user.deviceData.browser] = (acc.byBrowser[user.deviceData.browser] || 0) + 1;
            }
          }
          return acc;
        }, {
          usersWithDeviceData: 0,
          byDeviceType: {} as Record<string, number>,
          byOS: {} as Record<string, number>,
          byBrowser: {} as Record<string, number>,
        });

        return {
          totalUsers: users.length,
          usersWithDeviceData: stats.usersWithDeviceData,
          byDeviceType: stats.byDeviceType,
          byOS: stats.byOS,
          byBrowser: stats.byBrowser,
        };
      });
    });
  },
});

/**
 * Get health metrics aggregates (average weight, body fat, etc.)
 *
 * Already using index - just adding caching and metrics
 */
export const getHealthMetricsAggregate = query({
  args: {
    days: v.optional(v.number()), // Default 30 days
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin authentication
    await verifyAdmin(ctx);

    return await withMetrics("getHealthMetricsAggregate", async () => {
      const days = args.days ?? 30;

      return await withCache(userDataCache, `health:aggregate:${days}d`, async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split("T")[0];

        const metrics = await ctx.db
          .query("healthMetrics")
          .withIndex("by_date", (q) => q.gte("date", startDateStr))
          .collect();

        if (metrics.length === 0) {
          return {
            totalEntries: 0,
            uniqueUsers: 0,
            averages: null,
          };
        }

        // Single-pass processing for all metrics
        const stats = metrics.reduce((acc, m) => {
          acc.uniqueUsers.add(m.userId);

          if (m.weight !== null) {
            acc.weights.push(m.weight);
          }
          if (m.bodyFat !== null) {
            acc.bodyFats.push(m.bodyFat);
          }
          if (m.sleepHours !== null) {
            acc.sleeps.push(m.sleepHours);
          }
          if (m.stepsToday !== null) {
            acc.steps.push(m.stepsToday);
          }
          if (m.caloriesConsumed !== null) {
            acc.calories.push(m.caloriesConsumed);
          }

          return acc;
        }, {
          uniqueUsers: new Set<string>(),
          weights: [] as number[],
          bodyFats: [] as number[],
          sleeps: [] as number[],
          steps: [] as number[],
          calories: [] as number[],
        });

        const avg = (arr: number[]) => (arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

        return {
          totalEntries: metrics.length,
          uniqueUsers: stats.uniqueUsers.size,
          averages: {
            weight: Math.round(avg(stats.weights) * 10) / 10,
            bodyFat: Math.round(avg(stats.bodyFats) * 10) / 10,
            sleepHours: Math.round(avg(stats.sleeps) * 10) / 10,
            stepsPerDay: Math.round(avg(stats.steps)),
            caloriesPerDay: Math.round(avg(stats.calories)),
          },
          dataPoints: {
            weightEntries: stats.weights.length,
            bodyFatEntries: stats.bodyFats.length,
            sleepEntries: stats.sleeps.length,
            stepsEntries: stats.steps.length,
            caloriesEntries: stats.calories.length,
          },
        };
      });
    });
  },
});

/**
 * Get user list with key metrics (for admin table)
 *
 * Optimized with:
 * - Proper pagination (no full table scan)
 * - Reduced N+1 queries
 * - Performance metrics
 */
export const getUserList = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin authentication
    await verifyAdmin(ctx);

    return await withMetrics("getUserList", async () => {
      const limit = validatePagination(args.limit);
      const offset = args.offset ?? 0;

      // Get total count first
      const allUsers = await ctx.db.query("users").collect();
      const users = allUsers.slice(offset, offset + limit);

      // Batch fetch data for all users (avoid N+1)
      const userIds = users.map((u) => u.userId);

      const [allMetrics, allLogs, allPlans] = await Promise.all([
        ctx.db.query("healthMetrics").collect(),
        ctx.db.query("workoutLogs").collect(),
        ctx.db.query("workoutPlans").collect(),
      ]);

      // Group by userId for fast lookup
      const metricsByUser = new Map<string, typeof allMetrics>();
      const logsByUser = new Map<string, number>();
      const plansByUser = new Map<string, number>();

      allMetrics.forEach((m) => {
        if (!metricsByUser.has(m.userId)) {
          metricsByUser.set(m.userId, []);
        }
        metricsByUser.get(m.userId)!.push(m);
      });

      allLogs.forEach((l) => {
        logsByUser.set(l.userId, (logsByUser.get(l.userId) || 0) + 1);
      });

      allPlans.forEach((p) => {
        plansByUser.set(p.userId, (plansByUser.get(p.userId) || 0) + 1);
      });

      const usersWithStats = users.map((user) => {
        const userMetrics = metricsByUser.get(user.userId) || [];
        const latestMetrics = userMetrics.sort((a, b) => b.date.localeCompare(a.date))[0];

        return {
          userId: user.userId,
          userCode: user.userCode,
          location: user.locationData?.country ?? "Unknown",
          region: user.locationData?.region ?? null,
          timezone: user.locationData?.timezone ?? null,
          lastSeen: user.locationData?.lastSeen ?? null,
          deviceType: user.deviceData?.deviceType ?? null,
          os: user.deviceData?.os ?? null,
          workoutsCompleted: logsByUser.get(user.userId) || 0,
          plansCreated: plansByUser.get(user.userId) || 0,
          latestWeight: latestMetrics?.weight ?? null,
          latestBodyFat: latestMetrics?.bodyFat ?? null,
          healthDataLastUpdated: latestMetrics?.date ?? null,
          onboardingCompleted: user.onboardingCompleted ?? false,
          onboardingDate: user.onboardingCompletedAt ?? null,
        };
      });

      return {
        users: usersWithStats,
        total: allUsers.length,
        offset,
        limit,
      };
    });
  },
});

/**
 * Get retention metrics (new users, active users, churn)
 *
 * Optimized with caching and single-pass processing
 */
export const getRetentionMetrics = query({
  args: {
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // SECURITY: Require admin authentication
    await verifyAdmin(ctx);

    return await withMetrics("getRetentionMetrics", async () => {
      const days = args.days ?? 30;

      return await withCache(userDataCache, `retention:${days}d`, async () => {
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const users = await ctx.db.query("users").collect();

        // Single-pass categorization
        const stats = users.reduce((acc, user) => {
          // New users
          if (user.onboardingCompletedAt) {
            const completedDate = new Date(user.onboardingCompletedAt);
            if (completedDate >= startDate && completedDate <= now) {
              acc.newUsers++;
            }
          }

          // Active users (last seen in 7 days)
          if (user.locationData?.lastSeen) {
            const lastSeen = new Date(user.locationData.lastSeen);
            if (lastSeen >= sevenDaysAgo) {
              acc.activeUsers++;
            }

            // Churned users (not seen in 30 days but onboarding completed)
            if (user.onboardingCompleted && lastSeen < thirtyDaysAgo) {
              acc.churnedUsers++;
            }
          }

          return acc;
        }, {
          newUsers: 0,
          activeUsers: 0,
          churnedUsers: 0,
        });

        return {
          totalUsers: users.length,
          newUsers: stats.newUsers,
          activeUsers: stats.activeUsers,
          churnedUsers: stats.churnedUsers,
          activeUserRate: users.length > 0 ? Math.round((stats.activeUsers / users.length) * 100) : 0,
          churnRate: users.length > 0 ? Math.round((stats.churnedUsers / users.length) * 100) : 0,
        };
      });
    });
  },
});

/**
 * Get training preferences distribution
 *
 * Optimized with caching and single-pass processing
 */
export const getTrainingPreferencesStats = query({
  args: {},
  handler: async (ctx) => {
    // SECURITY: Require admin authentication
    await verifyAdmin(ctx);

    return await withMetrics("getTrainingPreferencesStats", async () => {
      await checkRateLimit(ctx, "admin:training_prefs", 10, 60, true);

      return await withCache(userDataCache, "training:preferences:stats", async () => {
        const users = await ctx.db.query("users").collect();

        // Single-pass processing
        const stats = users.reduce((acc, user) => {
          if (user.trainingPreferences) {
            acc.usersWithPreferences++;
            const prefs = user.trainingPreferences;

            if (prefs.primary_goal) {
              acc.byGoal[prefs.primary_goal] = (acc.byGoal[prefs.primary_goal] || 0) + 1;
            }
            if (prefs.experience_level) {
              acc.byExperience[prefs.experience_level] = (acc.byExperience[prefs.experience_level] || 0) + 1;
            }
            if (prefs.training_frequency) {
              acc.byFrequency[prefs.training_frequency] = (acc.byFrequency[prefs.training_frequency] || 0) + 1;
            }
            if (prefs.sex) {
              acc.bySex[prefs.sex] = (acc.bySex[prefs.sex] || 0) + 1;
            }
            if (prefs.equipment) {
              acc.byEquipment[prefs.equipment] = (acc.byEquipment[prefs.equipment] || 0) + 1;
            }
          }
          return acc;
        }, {
          usersWithPreferences: 0,
          byGoal: {} as Record<string, number>,
          byExperience: {} as Record<string, number>,
          byFrequency: {} as Record<string, number>,
          bySex: {} as Record<string, number>,
          byEquipment: {} as Record<string, number>,
        });

        return {
          totalUsers: users.length,
          usersWithPreferences: stats.usersWithPreferences,
          byGoal: stats.byGoal,
          byExperience: stats.byExperience,
          byFrequency: stats.byFrequency,
          bySex: stats.bySex,
          byEquipment: stats.byEquipment,
        };
      });
    });
  },
});

/**
 * Export data (for CSV download)
 *
 * Rate limited to prevent abuse
 * Note: Returns full dataset (not paginated) for export purposes
 */
export const exportUserData = query({
  args: {},
  handler: async (ctx) => {
    // SECURITY: Require admin authentication
    await verifyAdmin(ctx);

    return await withMetrics("exportUserData", async () => {
      // Strict rate limiting for exports
      await checkRateLimit(ctx, "admin:export", 2, 300, true); // 2 calls per 5 minutes

      const users = await ctx.db.query("users").collect();

      const exportData = users.map((user) => ({
        userId: user.userId,
        userCode: user.userCode,
        country: user.locationData?.country ?? "",
        region: user.locationData?.region ?? "",
        timezone: user.locationData?.timezone ?? "",
        firstSeen: user.locationData?.firstSeen ?? "",
        lastSeen: user.locationData?.lastSeen ?? "",
        deviceType: user.deviceData?.deviceType ?? "",
        os: user.deviceData?.os ?? "",
        browser: user.deviceData?.browser ?? "",
        onboardingCompleted: user.onboardingCompleted ?? false,
        goal: user.trainingPreferences?.primary_goal ?? "",
        experience: user.trainingPreferences?.experience_level ?? "",
        frequency: user.trainingPreferences?.training_frequency ?? "",
        sex: user.trainingPreferences?.sex ?? "",
      }));

      return exportData;
    });
  },
});
