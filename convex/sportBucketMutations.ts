import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Update sport bucket when a plan is used
export const updateSportBucket = mutation({
  args: {
    sport: v.string(),
    exercise_name: v.string(),
    category: v.union(v.literal("warmup"), v.literal("main"), v.literal("cooldown")),
    placement: v.string(), // "warmup", "main", "cooldown"
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const normalized = args.exercise_name.toLowerCase().trim().replace(/\s+/g, "_");
    
    // Find existing sport bucket entry
    const existing = await ctx.db
      .query("sportBuckets")
      .withIndex("by_sport_exercise", q => 
        q.eq("sport", args.sport).eq("exercise_name", normalized)
      )
      .first();
    
    if (existing) {
      // Update placement stats
      const newPlacementStats = { ...existing.placement_stats };
      if (args.placement === "warmup") newPlacementStats.warmup_count++;
      else if (args.placement === "main") newPlacementStats.main_count++;
      else if (args.placement === "cooldown") newPlacementStats.cooldown_count++;
      
      await ctx.db.patch(existing._id, {
        usage_count: existing.usage_count + 1,
        placement_stats: newPlacementStats,
        last_updated: new Date().toISOString(),
      });
    } else {
      // Find the user to get their ID
      const user = await ctx.db
        .query("users")
        .withIndex("by_userId", q => q.eq("userId", args.userId))
        .first();
      
      if (!user) throw new Error("User not found");
      
      // Create new sport bucket entry
      await ctx.db.insert("sportBuckets", {
        sport: args.sport,
        exercise_name: normalized,
        usage_count: 1,
        success_rate: 1.0, // Start optimistic
        avg_performance_score: 80, // Start with good default
        typical_sets: 3, // Default
        typical_reps: 10, // Default
        typical_duration_s: null,
        typical_weight_ratio: null,
        placement_stats: {
          warmup_count: args.placement === "warmup" ? 1 : 0,
          main_count: args.placement === "main" ? 1 : 0,
          cooldown_count: args.placement === "cooldown" ? 1 : 0,
        },
        created_by_user: user._id,
        last_updated: new Date().toISOString(),
        confidence_score: 0.1, // Low confidence for new entry
      });
    }
  },
});

// Update sport bucket performance after exercise completion
export const updateSportBucketPerformance = mutation({
  args: {
    sport: v.string(),
    exercise_name: v.string(),
    success: v.boolean(),
    performance_score: v.number(), // 0-100
  },
  handler: async (ctx, args) => {
    const normalized = args.exercise_name.toLowerCase().trim().replace(/\s+/g, "_");
    
    const existing = await ctx.db
      .query("sportBuckets")
      .withIndex("by_sport_exercise", q => 
        q.eq("sport", args.sport).eq("exercise_name", normalized)
      )
      .first();
    
    if (existing) {
      // Update success rate (rolling average)
      const newSuccessRate = (existing.success_rate * existing.usage_count + (args.success ? 1 : 0)) / (existing.usage_count + 1);
      
      // Update performance score (rolling average)
      const newAvgScore = (existing.avg_performance_score * existing.usage_count + args.performance_score) / (existing.usage_count + 1);
      
      // Update confidence score based on sample size
      const newConfidence = Math.min(existing.usage_count / 20, 1); // Full confidence at 20 uses
      
      await ctx.db.patch(existing._id, {
        success_rate: newSuccessRate,
        avg_performance_score: newAvgScore,
        confidence_score: newConfidence,
        last_updated: new Date().toISOString(),
      });
    }
  },
});

// Save exercise performance data
export const saveExercisePerformance = mutation({
  args: {
    user_id: v.string(),
    exercise_name: v.string(),
    sport_context: v.union(v.string(), v.null()),
    session_id: v.union(v.id("workoutLogs"), v.null()),
    completed: v.boolean(),
    skipped: v.boolean(),
    substituted: v.boolean(),
    substitute_reason: v.union(v.string(), v.null()),
    actual_sets: v.union(v.number(), v.null()),
    actual_reps: v.union(v.number(), v.null()),
    actual_weight: v.union(v.number(), v.null()),
    actual_duration_s: v.union(v.number(), v.null()),
    rpe: v.union(v.number(), v.null()),
    form_quality: v.union(v.number(), v.null()),
    pain_experienced: v.union(v.boolean(), v.null()),
    pain_location: v.union(v.string(), v.null()),
    was_pr: v.boolean(),
    notes: v.union(v.string(), v.null()),
  },
  handler: async (ctx, args) => {
    const normalized = args.exercise_name.toLowerCase().trim().replace(/\s+/g, "_");
    
    await ctx.db.insert("exercisePerformance", {
      user_id: args.user_id,
      exercise_name: normalized,
      sport_context: args.sport_context,
      session_id: args.session_id,
      completed: args.completed,
      skipped: args.skipped,
      substituted: args.substituted,
      substitute_reason: args.substitute_reason,
      actual_sets: args.actual_sets,
      actual_reps: args.actual_reps,
      actual_weight: args.actual_weight,
      actual_duration_s: args.actual_duration_s,
      rpe: args.rpe,
      form_quality: args.form_quality,
      pain_experienced: args.pain_experienced,
      pain_location: args.pain_location,
      was_pr: args.was_pr,
      notes: args.notes,
      timestamp: new Date().toISOString(),
    });
  },
});

// Update user injury profile
export const updateUserInjuryProfile = mutation({
  args: {
    userId: v.string(),
    injuryProfile: v.object({
      current_injuries: v.array(v.object({
        injury_type: v.string(),
        severity: v.union(v.literal("mild"), v.literal("moderate"), v.literal("severe")),
        affected_area: v.string(),
        date_reported: v.string(),
        notes: v.union(v.string(), v.null()),
      })),
      injury_history: v.array(v.object({
        injury_type: v.string(),
        date_occurred: v.string(),
        date_recovered: v.union(v.string(), v.null()),
        recurring: v.boolean(),
      })),
      movement_restrictions: v.array(v.string()),
      pain_triggers: v.array(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .first();
    
    if (!user) throw new Error("User not found");
    
    await ctx.db.patch(user._id, {
      injuryProfile: {
        ...args.injuryProfile,
        last_updated: new Date().toISOString(),
      },
    });
  },
});

// Add injury data to an exercise
export const updateExerciseInjuryData = mutation({
  args: {
    exercise_name: v.string(),
    injury_contraindications: v.array(v.object({
      injury_type: v.string(),
      severity: v.union(v.literal("absolute"), v.literal("caution"), v.literal("monitor")),
      reason: v.string(),
      safe_modifications: v.array(v.string()),
      alternative_exercises: v.array(v.string()),
    })),
    therapeutic_benefits: v.array(v.object({
      condition: v.string(),
      benefit_level: v.union(v.literal("high"), v.literal("moderate"), v.literal("low")),
      explanation: v.string(),
      recommended_protocol: v.union(v.string(), v.null()),
    })),
  },
  handler: async (ctx, args) => {
    const normalized = args.exercise_name.toLowerCase().trim().replace(/\s+/g, "_");
    
    const existing = await ctx.db
      .query("exerciseCache")
      .withIndex("by_exerciseName", q => q.eq("exercise_name", normalized))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        injury_contraindications: args.injury_contraindications,
        therapeutic_benefits: args.therapeutic_benefits,
        last_accessed: new Date().toISOString(),
      });
    } else {
      throw new Error(`Exercise ${args.exercise_name} not found in cache`);
    }
  },
});

// Update sport ratings for an exercise
export const updateExerciseSportRatings = mutation({
  args: {
    exercise_name: v.string(),
    sport_ratings: v.object({
      boxing: v.union(v.number(), v.null()),
      hyrox: v.union(v.number(), v.null()),
      rock_climbing: v.union(v.number(), v.null()),
      basketball: v.union(v.number(), v.null()),
      soccer: v.union(v.number(), v.null()),
      tennis: v.union(v.number(), v.null()),
      running: v.union(v.number(), v.null()),
      swimming: v.union(v.number(), v.null()),
      cycling: v.union(v.number(), v.null()),
      general_fitness: v.union(v.number(), v.null()),
    }),
  },
  handler: async (ctx, args) => {
    const normalized = args.exercise_name.toLowerCase().trim().replace(/\s+/g, "_");
    
    const existing = await ctx.db
      .query("exerciseCache")
      .withIndex("by_exerciseName", q => q.eq("exercise_name", normalized))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        sport_ratings: args.sport_ratings,
        last_accessed: new Date().toISOString(),
      });
    } else {
      throw new Error(`Exercise ${args.exercise_name} not found in cache`);
    }
  },
});
