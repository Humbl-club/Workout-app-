import { query } from "./_generated/server";
import { v } from "convex/values";

// Get user profile
export const getUserProfile = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return user;
  },
});

// Get all workout plans for the current user
export const getWorkoutPlans = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const plans = await ctx.db
      .query("workoutPlans")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", args.userId)
      )
      .order("desc")
      .collect();

    return plans;
  },
});

// Get active workout plan
export const getActivePlan = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user || !user.activePlanId) {
      return null;
    }

    const plan = await ctx.db.get(user.activePlanId);
    return plan || null;
  },
});

// Get workout logs for the current user
export const getWorkoutLogs = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("workoutLogs")
      .withIndex("by_userId_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return logs;
  },
});

// Get exercise history for a specific exercise
export const getExerciseHistory = query({
  args: {
    userId: v.string(),
    exerciseName: v.string(),
  },
  handler: async (ctx, args) => {
    const normalized = args.exerciseName.toLowerCase().replace(/\s+/g, "_");
    const history = await ctx.db
      .query("exerciseHistory")
      .withIndex("by_userId_exerciseName", (q) =>
        q.eq("userId", args.userId).eq("exerciseName", normalized)
      )
      .first();

    return history;
  },
});

// Get cached exercise explanation
export const getCachedExercise = query({
  args: {
    exerciseName: v.string(),
  },
  handler: async (ctx, args) => {
    const normalized = args.exerciseName.toLowerCase().trim().replace(/\s+/g, "_");
    const cached = await ctx.db
      .query("exerciseCache")
      .withIndex("by_exerciseName", (q) => q.eq("exercise_name", normalized))
      .first();

    return cached;
  },
});

// Get all exercises from database (for browsing/swapping exercises)
export const getAllExercises = query({
  args: {
    category: v.optional(v.union(v.literal("warmup"), v.literal("main"), v.literal("cooldown"))),
    searchTerm: v.optional(v.string()),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("exerciseCache");
    
    // For pagination, use paginateQuery
    // Use exercise_name for consistent ordering (more reliable than default ordering)
    const limit = args.limit || 100;
    const result = await query.order("asc").paginate({ 
      cursor: args.cursor || null,
      numItems: limit 
    });
    
    let exercises = result.page;
    
    // Filter by category if provided
    if (args.category) {
      exercises = exercises.filter(ex => ex.primary_category === args.category);
    }
    
    // Filter by search term if provided
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      exercises = exercises.filter(ex => 
        ex.exercise_name.toLowerCase().includes(searchLower) ||
        ex.explanation?.toLowerCase().includes(searchLower) ||
        ex.muscles_worked?.some(m => m.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by hit_count (most popular first) or alphabetically
    // NOTE: This sorting happens AFTER pagination, so it doesn't affect cursor position
    exercises.sort((a, b) => {
      if (a.hit_count !== b.hit_count) {
        return (b.hit_count || 0) - (a.hit_count || 0);
      }
      return a.exercise_name.localeCompare(b.exercise_name);
    });
    
    // Only return continueCursor if:
    // 1. The original pagination has more items (result.continueCursor exists)
    // 2. We got results from the original page (not filtered out)
    // This prevents infinite loops when all results are filtered out
    // BUT: Since sorting happens AFTER pagination, we need to be careful
    // The cursor is based on the original order, not the sorted order
    const shouldContinue = result.continueCursor !== null && result.page.length > 0;
    
    return {
      exercises,
      continueCursor: shouldContinue ? result.continueCursor : null,
    };
  },
});

// Get all exercises without pagination (for migration scripts)
export const getAllExercisesNoPagination = query({
  args: {},
  handler: async (ctx) => {
    const exercises = await ctx.db.query("exerciseCache").collect();
    return exercises;
  },
});

// Get programming knowledge for plan generation
export const getProgrammingKnowledge = query({
  args: {
    category: v.optional(v.union(
      v.literal("mobility"),
      v.literal("athletic"),
      v.literal("bodybuilding"),
      v.literal("aesthetics"),
      v.literal("running"),
      v.literal("sport")
    )),
    principle_type: v.optional(v.union(
      v.literal("exercise_selection"),
      v.literal("programming"),
      v.literal("personalization"),
      v.literal("goal_specific"),
      v.literal("injury_protocol")
    )),
    goal: v.optional(v.string()),
    experience: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let knowledge;
    
    if (args.category && args.principle_type) {
      knowledge = await ctx.db
        .query("programmingKnowledge")
        .withIndex("by_category_type", (q) =>
          q.eq("category", args.category!).eq("principle_type", args.principle_type!)
        )
        .collect();
    } else if (args.category) {
      knowledge = await ctx.db
        .query("programmingKnowledge")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .collect();
    } else if (args.principle_type) {
      knowledge = await ctx.db
        .query("programmingKnowledge")
        .withIndex("by_principle_type", (q) => q.eq("principle_type", args.principle_type!))
        .collect();
    } else {
      knowledge = await ctx.db.query("programmingKnowledge").collect();
    }
    
    // Filter by goal/experience if provided
    if (args.goal || args.experience) {
      knowledge = knowledge.filter(k => {
        const matchesGoal = !args.goal || k.applicable_goals.includes(args.goal);
        const matchesExperience = !args.experience || k.applicable_experience.includes(args.experience);
        return matchesGoal && matchesExperience;
      });
    }
    
    return knowledge;
  },
});

// Get exercise modifications (progressions/regressions)
export const getExerciseModifications = query({
  args: {
    exerciseName: v.string(),
  },
  handler: async (ctx, args) => {
    const normalized = args.exerciseName.toLowerCase().trim().replace(/\s+/g, "_");
    const modifications = await ctx.db
      .query("exerciseModifications")
      .withIndex("by_exercise", (q) => q.eq("base_exercise", normalized))
      .first();
    
    return modifications;
  },
});

// Get goal-specific guidelines
export const getGoalGuidelines = query({
  args: {
    goal: v.string(),
  },
  handler: async (ctx, args) => {
    const guidelines = await ctx.db
      .query("goalGuidelines")
      .withIndex("by_goal", (q) => q.eq("goal", args.goal))
      .collect();
    
    return guidelines;
  },
});

// Get injury protocols
export const getInjuryProtocols = query({
  args: {
    issue: v.string(),
  },
  handler: async (ctx, args) => {
    const normalized = args.issue.toLowerCase().trim().replace(/\s+/g, "_");
    const protocols = await ctx.db
      .query("injuryProtocols")
      .withIndex("by_issue", (q) => q.eq("issue", normalized))
      .collect();
    
    return protocols;
  },
});

// Sex-specific guidelines
export const getSexSpecificGuidelines = query({
  args: {
    sex: v.string(),
    goal: v.optional(v.union(v.string(), v.null())),
    experience: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const sex = args.sex || "neutral";
    const bySex = await ctx.db
      .query("sexSpecificGuidelines")
      .withIndex("by_sex_goal_exp", q => q.eq("sex", sex))
      .collect();
    const neutral = await ctx.db
      .query("sexSpecificGuidelines")
      .withIndex("by_sex_goal_exp", q => q.eq("sex", "neutral"))
      .collect();

    const filterByGoalExp = (items: any[]) => items.filter(item => {
      // Match if goal is undefined/null OR item.goal matches args.goal (including null)
      const goalMatch = args.goal === undefined || 
        (args.goal === null && item.goal === null) || 
        (args.goal !== null && item.goal === args.goal);
      // Match if experience is undefined/null OR item.experience matches args.experience (including null)
      const expMatch = args.experience === undefined || 
        (args.experience === null && item.experience === null) || 
        (args.experience !== null && item.experience === args.experience);
      return goalMatch && expMatch;
    });

    return [...filterByGoalExp(bySex), ...filterByGoalExp(neutral)];
  },
});

// Sport guidelines
export const getSportGuidelines = query({
  args: {
    sport: v.string(),
    goal: v.optional(v.string()),
    experience: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("sportGuidelines")
      .withIndex("by_sport_goal_exp", q => q.eq("sport", args.sport))
      .collect();

    return records.filter(item => {
      const goalMatch = !args.goal || !item.goal || item.goal === args.goal;
      const expMatch = !args.experience || !item.experience || item.experience === args.experience;
      return goalMatch && expMatch;
    });
  },
});

// Body context guidelines
export const getBodyContextGuidelines = query({
  args: {
    band: v.optional(v.string()),
    athletic_level: v.optional(v.union(v.literal("low"), v.literal("moderate"), v.literal("high"), v.null())),
    body_type: v.optional(v.union(v.literal("lean"), v.literal("average"), v.literal("muscular"), v.null())),
  },
  handler: async (ctx, args) => {
    let records = await ctx.db.query("bodyContextGuidelines").collect();
    if (args.band) {
      records = records.filter(r => r.band === args.band);
    }
    if (args.athletic_level !== undefined) {
      records = records.filter(r => 
        (r.athletic_level === args.athletic_level) || 
        (args.athletic_level === null && r.athletic_level === null)
      );
    }
    if (args.body_type !== undefined) {
      records = records.filter(r => 
        (r.body_type === args.body_type) || 
        (args.body_type === null && r.body_type === null)
      );
    }
    return records;
  },
});

// ---------- Analytics: distributions ----------

// Goals distribution from user trainingPreferences
export const getGoalsDistribution = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const counts: Record<string, number> = {};
    users.forEach(u => {
      const goal = u.trainingPreferences?.primary_goal || "unspecified";
      counts[goal] = (counts[goal] || 0) + 1;
    });
    return counts;
  },
});

// Sports distribution from user trainingPreferences
export const getSportsDistribution = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const counts: Record<string, number> = {};
    users.forEach(u => {
      const sport = u.trainingPreferences?.sport || "unspecified";
      counts[sport] = (counts[sport] || 0) + 1;
    });
    return counts;
  },
});

// Pain points frequency across users
export const getPainPointsFrequency = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const counts: Record<string, number> = {};
    users.forEach(u => {
      const pains: string[] = u.trainingPreferences?.pain_points || [];
      pains.forEach(p => {
        counts[p] = (counts[p] || 0) + 1;
      });
    });
    return counts;
  },
});

// Get user exercise preferences
export const getUserExercisePreferences = query({
  args: {
    userId: v.string(),
    exerciseName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.exerciseName) {
      const normalized = args.exerciseName.toLowerCase().trim().replace(/\s+/g, "_");
      const preference = await ctx.db
        .query("userExercisePreferences")
        .withIndex("by_userId_exercise", (q) => 
          q.eq("userId", args.userId).eq("exerciseName", normalized)
        )
        .first();
      return preference;
    } else {
      // Get all preferences for user
      const preferences = await ctx.db
        .query("userExercisePreferences")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();
      return preferences;
    }
  },
});

// Get user exercise analytics
export const getUserExerciseAnalytics = query({
  args: {
    userId: v.string(),
    exerciseName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.exerciseName) {
      const normalized = args.exerciseName.toLowerCase().trim().replace(/\s+/g, "_");
      const analytics = await ctx.db
        .query("userExerciseAnalytics")
        .withIndex("by_userId_exercise", (q) => 
          q.eq("userId", args.userId).eq("exerciseName", normalized)
        )
        .first();
      return analytics;
    } else {
      // Get all analytics for user
      const analytics = await ctx.db
        .query("userExerciseAnalytics")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();
      return analytics;
    }
  },
});

// Get exercises by category and value (for plan generation)
export const getExercisesByCategory = query({
  args: {
    category: v.union(v.literal("warmup"), v.literal("main"), v.literal("cooldown")),
    minValueScore: v.optional(v.number()),
    excludeUserBlacklist: v.optional(v.string()), // userId to exclude their blacklisted exercises
  },
  handler: async (ctx, args) => {
    let exercises = await ctx.db.query("exerciseCache").collect();
    
    // Filter by category
    exercises = exercises.filter(ex => ex.primary_category === args.category);
    
    // Filter by minimum value score if provided
    if (args.minValueScore !== undefined) {
      exercises = exercises.filter(ex => 
        ex.value_score !== null && ex.value_score >= args.minValueScore!
      );
    }
    
    // Exclude user's blacklisted exercises if userId provided
    if (args.excludeUserBlacklist) {
      const blacklisted = await ctx.db
        .query("userExercisePreferences")
        .withIndex("by_userId", (q) => q.eq("userId", args.excludeUserBlacklist!))
        .filter((q) => q.eq(q.field("never_suggest"), true))
        .collect();
      
      const blacklistedNames = new Set(blacklisted.map(b => b.exerciseName));
      exercises = exercises.filter(ex => !blacklistedNames.has(ex.exercise_name));
    }
    
    // Sort by value score (highest first), then by tier, then by usage
    return exercises.sort((a, b) => {
      // First by value score
      if ((a.value_score || 0) !== (b.value_score || 0)) {
        return (b.value_score || 0) - (a.value_score || 0);
      }
      // Then by tier (S > A > B > C)
      const tierOrder = { S: 4, A: 3, B: 2, C: 1 };
      const aTier = tierOrder[a.exercise_tier as keyof typeof tierOrder] || 0;
      const bTier = tierOrder[b.exercise_tier as keyof typeof tierOrder] || 0;
      if (aTier !== bTier) {
        return bTier - aTier;
      }
      // Finally by usage count
      return (b.global_usage_count || 0) - (a.global_usage_count || 0);
    });
  },
});

// Get sport buckets for a specific sport
export const getSportBuckets = query({
  args: {
    sport: v.string(),
    exercise_name: v.optional(v.string()),
    minPerformanceScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let buckets;
    
    if (args.exercise_name) {
      const normalized = args.exercise_name.toLowerCase().trim().replace(/\s+/g, "_");
      const bucket = await ctx.db
        .query("sportBuckets")
        .withIndex("by_sport_exercise", (q) => 
          q.eq("sport", args.sport).eq("exercise_name", normalized)
        )
        .first();
      return bucket ? [bucket] : [];
    }
    
    buckets = await ctx.db
      .query("sportBuckets")
      .withIndex("by_sport", (q) => q.eq("sport", args.sport))
      .collect();
    
    // Filter by minimum performance score if provided
    if (args.minPerformanceScore !== undefined) {
      buckets = buckets.filter(b => b.avg_performance_score >= args.minPerformanceScore!);
    }
    
    // Sort by performance score (highest first)
    return buckets.sort((a, b) => b.avg_performance_score - a.avg_performance_score);
  },
});

// Get exercise performance for a user
export const getExercisePerformance = query({
  args: {
    user_id: v.string(),
    exercise_name: v.optional(v.string()),
    sport_context: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let performance;
    
    if (args.exercise_name && args.sport_context) {
      const normalized = args.exercise_name.toLowerCase().trim().replace(/\s+/g, "_");
      performance = await ctx.db
        .query("exercisePerformance")
        .withIndex("by_user_sport", (q) => 
          q.eq("user_id", args.user_id).eq("sport_context", args.sport_context)
        )
        .filter((q) => q.eq(q.field("exercise_name"), normalized))
        .order("desc")
        .collect();
    } else if (args.exercise_name) {
      const normalized = args.exercise_name.toLowerCase().trim().replace(/\s+/g, "_");
      performance = await ctx.db
        .query("exercisePerformance")
        .withIndex("by_user_exercise", (q) => 
          q.eq("user_id", args.user_id).eq("exercise_name", normalized)
        )
        .order("desc")
        .collect();
    } else {
      performance = await ctx.db
        .query("exercisePerformance")
        .withIndex("by_user", (q) => q.eq("user_id", args.user_id))
        .order("desc")
        .collect();
    }
    
    // Apply limit if provided
    if (args.limit) {
      performance = performance.slice(0, args.limit);
    }
    
    return performance;
  },
});

// Get cached compressed knowledge (for guideline caching)
export const getCachedCompressedKnowledge = query({
  args: {
    cache_key: v.string(),
  },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query("knowledgeCache")
      .withIndex("by_key", (q) => q.eq("cache_key", args.cache_key))
      .first();
    
    return cached;
  },
});

// Analytics: Get goal distribution
export const getGoalDistribution = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const goals: Record<string, number> = {};
    
    users.forEach(user => {
      const goal = user.trainingPreferences?.primary_goal || 'unspecified';
      goals[goal] = (goals[goal] || 0) + 1;
    });
    
    return goals;
  },
});

// Analytics: Get sport distribution
export const getSportDistribution = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const sports: Record<string, number> = {};
    
    users.forEach(user => {
      const sport = user.trainingPreferences?.sport || 'none';
      sports[sport] = (sports[sport] || 0) + 1;
    });
    
    return sports;
  },
});

// Analytics: Get experience level distribution
export const getExperienceDistribution = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const experience: Record<string, number> = {};
    
    users.forEach(user => {
      const exp = user.trainingPreferences?.experience_level || 'unspecified';
      experience[exp] = (experience[exp] || 0) + 1;
    });
    
    return experience;
  },
});

// Analytics: Get pain points distribution
export const getPainPointsDistribution = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const painPoints: Record<string, number> = {};
    
    users.forEach(user => {
      const points = user.trainingPreferences?.pain_points || [];
      points.forEach(point => {
        painPoints[point] = (painPoints[point] || 0) + 1;
      });
    });
    
    return painPoints;
  },
});

// Analytics: Get plan generation success/failure counts
export const getGenerationStats = query({
  args: {
    since: v.optional(v.string()), // ISO date string
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db.query("generationLog").collect();
    
    if (args.since) {
      logs = logs.filter(log => log.timestamp >= args.since!);
    }
    
    const total = logs.length;
    const successful = logs.filter(log => log.success).length;
    const failed = total - successful;
    
    // Get most common validation errors
    const errorCounts: Record<string, number> = {};
    logs.forEach(log => {
      log.validation_errors.forEach(error => {
        errorCounts[error] = (errorCounts[error] || 0) + 1;
      });
    });
    
    const topErrors = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([error, count]) => ({ error, count }));
    
    return {
      total,
      successful,
      failed,
      success_rate: total > 0 ? successful / total : 0,
      top_validation_errors: topErrors,
      avg_attempts: logs.length > 0
        ? logs.reduce((sum, log) => sum + log.attempt_count, 0) / logs.length
        : 0
    };
  },
});
