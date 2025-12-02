/**
 * Health Metrics Mutations & Queries
 *
 * Track body metrics, vitals, nutrition, and recovery data over time.
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Log health metrics for a specific date
 * Upserts (updates if exists, creates if not)
 */
export const logHealthMetrics = mutation({
  args: {
    userId: v.string(),
    date: v.string(), // YYYY-MM-DD format

    // Body metrics
    weight: v.optional(v.number()),
    bodyFat: v.optional(v.number()),
    muscleMass: v.optional(v.number()),

    // Measurements (cm)
    chest: v.optional(v.number()),
    waist: v.optional(v.number()),
    hips: v.optional(v.number()),
    biceps: v.optional(v.number()),
    thighs: v.optional(v.number()),
    calves: v.optional(v.number()),
    shoulders: v.optional(v.number()),
    neck: v.optional(v.number()),

    // Vitals
    restingHeartRate: v.optional(v.number()),
    bloodPressureSystolic: v.optional(v.number()),
    bloodPressureDiastolic: v.optional(v.number()),

    // Activity & Recovery
    sleepHours: v.optional(v.number()),
    sleepQuality: v.optional(v.number()),
    stepsToday: v.optional(v.number()),
    activeMinutes: v.optional(v.number()),

    // Nutrition
    caloriesConsumed: v.optional(v.number()),
    proteinGrams: v.optional(v.number()),
    carbsGrams: v.optional(v.number()),
    fatGrams: v.optional(v.number()),
    waterLiters: v.optional(v.number()),

    // Subjective ratings (1-10)
    energyLevel: v.optional(v.number()),
    moodRating: v.optional(v.number()),
    stressLevel: v.optional(v.number()),
    sorenessLevel: v.optional(v.number()),

    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if entry exists for this date
    const existing = await ctx.db
      .query("healthMetrics")
      .withIndex("by_userId_date", (q) => q.eq("userId", args.userId).eq("date", args.date))
      .first();

    const data = {
      userId: args.userId,
      date: args.date,
      weight: args.weight ?? null,
      bodyFat: args.bodyFat ?? null,
      muscleMass: args.muscleMass ?? null,
      chest: args.chest ?? null,
      waist: args.waist ?? null,
      hips: args.hips ?? null,
      biceps: args.biceps ?? null,
      thighs: args.thighs ?? null,
      calves: args.calves ?? null,
      shoulders: args.shoulders ?? null,
      neck: args.neck ?? null,
      restingHeartRate: args.restingHeartRate ?? null,
      bloodPressureSystolic: args.bloodPressureSystolic ?? null,
      bloodPressureDiastolic: args.bloodPressureDiastolic ?? null,
      sleepHours: args.sleepHours ?? null,
      sleepQuality: args.sleepQuality ?? null,
      stepsToday: args.stepsToday ?? null,
      activeMinutes: args.activeMinutes ?? null,
      caloriesConsumed: args.caloriesConsumed ?? null,
      proteinGrams: args.proteinGrams ?? null,
      carbsGrams: args.carbsGrams ?? null,
      fatGrams: args.fatGrams ?? null,
      waterLiters: args.waterLiters ?? null,
      energyLevel: args.energyLevel ?? null,
      moodRating: args.moodRating ?? null,
      stressLevel: args.stressLevel ?? null,
      sorenessLevel: args.sorenessLevel ?? null,
      notes: args.notes ?? null,
      createdAt: new Date().toISOString(),
    };

    if (existing) {
      // Update existing entry
      await ctx.db.patch(existing._id, data);
      return { success: true, id: existing._id, updated: true };
    } else {
      // Create new entry
      const id = await ctx.db.insert("healthMetrics", data);
      return { success: true, id, updated: false };
    }
  },
});

/**
 * Get health metrics for a specific date
 */
export const getMetricsForDate = query({
  args: {
    userId: v.string(),
    date: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const metrics = await ctx.db
      .query("healthMetrics")
      .withIndex("by_userId_date", (q) => q.eq("userId", args.userId).eq("date", args.date))
      .first();

    return metrics;
  },
});

/**
 * Get health metrics history (last N days)
 */
export const getMetricsHistory = query({
  args: {
    userId: v.string(),
    days: v.optional(v.number()), // Default 30 days
  },
  handler: async (ctx, args) => {
    const days = args.days ?? 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const metrics = await ctx.db
      .query("healthMetrics")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .order("desc")
      .collect();

    return metrics;
  },
});

/**
 * Get latest metrics (most recent entry)
 */
export const getLatestMetrics = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const latest = await ctx.db
      .query("healthMetrics")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    return latest;
  },
});

/**
 * Get metrics summary (weight trend, averages, etc.)
 */
export const getMetricsSummary = query({
  args: {
    userId: v.string(),
    days: v.optional(v.number()), // Default 30 days
  },
  handler: async (ctx, args) => {
    const days = args.days ?? 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const metrics = await ctx.db
      .query("healthMetrics")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("date"), startDateStr))
      .collect();

    if (metrics.length === 0) {
      return null;
    }

    // Calculate averages and trends
    const weightData = metrics.filter(m => m.weight !== null).map(m => m.weight!);
    const bodyFatData = metrics.filter(m => m.bodyFat !== null).map(m => m.bodyFat!);
    const sleepData = metrics.filter(m => m.sleepHours !== null).map(m => m.sleepHours!);
    const stepsData = metrics.filter(m => m.stepsToday !== null).map(m => m.stepsToday!);

    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    const latest = (arr: number[]) => arr.length > 0 ? arr[arr.length - 1] : null;
    const first = (arr: number[]) => arr.length > 0 ? arr[0] : null;

    const latestWeight = latest(weightData);
    const firstWeight = first(weightData);
    const weightChange = latestWeight && firstWeight ? latestWeight - firstWeight : null;

    return {
      entriesLogged: metrics.length,
      weight: {
        current: latestWeight,
        change: weightChange,
        average: avg(weightData),
      },
      bodyFat: {
        current: latest(bodyFatData),
        average: avg(bodyFatData),
      },
      sleep: {
        average: avg(sleepData),
      },
      steps: {
        average: avg(stepsData),
      },
    };
  },
});

/**
 * Delete health metrics entry
 */
export const deleteMetrics = mutation({
  args: {
    id: v.id("healthMetrics"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * Update user location and device data
 */
export const updateLocationData = mutation({
  args: {
    userId: v.string(),
    country: v.optional(v.string()),
    countryCode: v.optional(v.string()),
    region: v.optional(v.string()),
    city: v.optional(v.string()),
    timezone: v.optional(v.string()),
    ip: v.optional(v.string()),
    firstSeen: v.optional(v.string()),
    lastSeen: v.optional(v.string()),
    lastUpdated: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const now = new Date().toISOString();
    const isFirstSeen = !user.locationData;

    await ctx.db.patch(user._id, {
      locationData: {
        country: args.country ?? null,
        countryCode: args.countryCode ?? null,
        region: args.region ?? null,
        city: args.city ?? null,
        timezone: args.timezone ?? null,
        ip: args.ip ?? null,
        firstSeen: isFirstSeen ? now : user.locationData?.firstSeen ?? now,
        lastSeen: now,
        lastUpdated: now,
      },
    });

    return { success: true };
  },
});

/**
 * Update device data
 */
export const updateDeviceData = mutation({
  args: {
    userId: v.string(),
    deviceType: v.optional(v.union(v.literal("mobile"), v.literal("tablet"), v.literal("desktop"))),
    os: v.optional(v.string()),
    osVersion: v.optional(v.string()),
    browser: v.optional(v.string()),
    browserVersion: v.optional(v.string()),
    appVersion: v.optional(v.string()),
    screenWidth: v.optional(v.number()),
    screenHeight: v.optional(v.number()),
    language: v.optional(v.string()),
    lastUpdated: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      deviceData: {
        deviceType: args.deviceType ?? null,
        os: args.os ?? null,
        osVersion: args.osVersion ?? null,
        browser: args.browser ?? null,
        browserVersion: args.browserVersion ?? null,
        appVersion: args.appVersion ?? null,
        screenWidth: args.screenWidth ?? null,
        screenHeight: args.screenHeight ?? null,
        language: args.language ?? null,
        lastUpdated: new Date().toISOString(),
      },
    });

    return { success: true };
  },
});
