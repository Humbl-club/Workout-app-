import { v } from "convex/values";
import { query } from "./_generated/server";

// Get sport-specific exercises sorted by performance
export const getSportBucketExercises = query({
  args: {
    sport: v.string(),
    minScore: v.optional(v.number()),
    minUsageCount: v.optional(v.number()),
    category: v.optional(v.union(v.literal("warmup"), v.literal("main"), v.literal("cooldown"))),
  },
  handler: async (ctx, args) => {
    let exercises = await ctx.db
      .query("sportBuckets")
      .withIndex("by_sport", q => q.eq("sport", args.sport))
      .collect();
    
    // Filter by minimum score
    if (args.minScore !== undefined) {
      exercises = exercises.filter(ex => ex.avg_performance_score >= args.minScore);
    }
    
    // Filter by minimum usage count (confidence)
    if (args.minUsageCount !== undefined) {
      exercises = exercises.filter(ex => ex.usage_count >= args.minUsageCount);
    }
    
    // Filter by category preference
    if (args.category) {
      exercises = exercises.filter(ex => {
        const stats = ex.placement_stats;
        const total = stats.warmup_count + stats.main_count + stats.cooldown_count;
        if (total === 0) return false;
        
        // Check if this exercise is predominantly used in the requested category
        if (args.category === "warmup") {
          return stats.warmup_count / total > 0.4;
        } else if (args.category === "main") {
          return stats.main_count / total > 0.4;
        } else if (args.category === "cooldown") {
          return stats.cooldown_count / total > 0.4;
        }
        return true;
      });
    }
    
    // Sort by performance score and confidence
    return exercises.sort((a, b) => {
      // Weighted score: performance * confidence
      const scoreA = a.avg_performance_score * a.confidence_score;
      const scoreB = b.avg_performance_score * b.confidence_score;
      return scoreB - scoreA;
    });
  },
});

// Get user's exercise performance history
export const getUserExercisePerformance = query({
  args: {
    userId: v.string(),
    exercise_name: v.string(),
    sport: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const normalized = args.exercise_name.toLowerCase().trim().replace(/\s+/g, "_");
    
    let query = ctx.db
      .query("exercisePerformance")
      .withIndex("by_user_exercise", q => 
        q.eq("user_id", args.userId).eq("exercise_name", normalized)
      );
    
    let performances = await query.collect();
    
    // Filter by sport if specified
    if (args.sport) {
      performances = performances.filter(p => p.sport_context === args.sport);
    }
    
    // Sort by most recent first
    performances.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Limit if specified
    if (args.limit) {
      performances = performances.slice(0, args.limit);
    }
    
    // Calculate summary statistics
    const totalSessions = performances.length;
    const completedSessions = performances.filter(p => p.completed).length;
    const skippedSessions = performances.filter(p => p.skipped).length;
    const substitutedSessions = performances.filter(p => p.substituted).length;
    const prCount = performances.filter(p => p.was_pr).length;
    
    const avgRpe = performances
      .filter(p => p.rpe !== null)
      .reduce((sum, p) => sum + (p.rpe || 0), 0) / 
      performances.filter(p => p.rpe !== null).length || 0;
    
    return {
      performances,
      summary: {
        totalSessions,
        completionRate: totalSessions > 0 ? completedSessions / totalSessions : 0,
        skipRate: totalSessions > 0 ? skippedSessions / totalSessions : 0,
        substituteRate: totalSessions > 0 ? substitutedSessions / totalSessions : 0,
        prRate: totalSessions > 0 ? prCount / totalSessions : 0,
        avgRpe,
      },
    };
  },
});

// Get exercises that are safe for user's injuries
export const getSafeExercisesForUser = query({
  args: {
    userId: v.string(),
    category: v.optional(v.union(v.literal("warmup"), v.literal("main"), v.literal("cooldown"))),
    sport: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get user's injury profile
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", q => q.eq("userId", args.userId))
      .first();
    
    if (!user) throw new Error("User not found");
    
    const currentInjuries = user.injuryProfile?.current_injuries || [];
    const injuryTypes = currentInjuries.map(i => i.injury_type);
    
    // Get all exercises
    let exercises = await ctx.db.query("exerciseCache").collect();
    
    // Filter by category if specified
    if (args.category) {
      exercises = exercises.filter(ex => ex.primary_category === args.category);
    }
    
    // Filter out exercises with absolute contraindications
    const safeExercises = exercises.filter(ex => {
      if (!ex.injury_contraindications) return true;
      
      // Check each injury
      for (const injury of currentInjuries) {
        const contraindication = ex.injury_contraindications.find(
          c => c.injury_type === injury.injury_type
        );
        
        if (contraindication) {
          // Absolute contraindication - exclude this exercise
          if (contraindication.severity === "absolute") {
            return false;
          }
          // For caution/monitor - include but may need modifications
        }
      }
      
      return true;
    });
    
    // If sport specified, sort by sport rating
    if (args.sport && user.trainingPreferences?.sport_specific) {
      const sportKey = user.trainingPreferences.sport_specific as keyof typeof safeExercises[0]["sport_ratings"];
      safeExercises.sort((a, b) => {
        const ratingA = a.sport_ratings?.[sportKey] || 5;
        const ratingB = b.sport_ratings?.[sportKey] || 5;
        return ratingB - ratingA;
      });
    }
    
    // Include modification suggestions for caution exercises
    return safeExercises.map(ex => {
      const modifications: string[] = [];
      const alternatives: string[] = [];
      
      if (ex.injury_contraindications) {
        for (const injury of currentInjuries) {
          const contraindication = ex.injury_contraindications.find(
            c => c.injury_type === injury.injury_type
          );
          
          if (contraindication && contraindication.severity === "caution") {
            modifications.push(...contraindication.safe_modifications);
            alternatives.push(...contraindication.alternative_exercises);
          }
        }
      }
      
      return {
        ...ex,
        suggested_modifications: [...new Set(modifications)],
        alternative_exercises: [...new Set(alternatives)],
      };
    });
  },
});

// Get exercises with therapeutic benefits for user's conditions
export const getTherapeuticExercises = query({
  args: {
    conditions: v.array(v.string()),
    minBenefitLevel: v.optional(v.union(v.literal("high"), v.literal("moderate"), v.literal("low"))),
  },
  handler: async (ctx, args) => {
    const exercises = await ctx.db.query("exerciseCache").collect();
    
    const benefitLevels = { high: 3, moderate: 2, low: 1 };
    const minLevel = args.minBenefitLevel ? benefitLevels[args.minBenefitLevel] : 1;
    
    // Find exercises with therapeutic benefits for the conditions
    const therapeuticExercises = exercises
      .filter(ex => ex.therapeutic_benefits && ex.therapeutic_benefits.length > 0)
      .map(ex => {
        const relevantBenefits = ex.therapeutic_benefits!.filter(benefit =>
          args.conditions.includes(benefit.condition)
        );
        
        if (relevantBenefits.length === 0) return null;
        
        // Calculate total benefit score
        const totalScore = relevantBenefits.reduce((sum, benefit) => 
          sum + benefitLevels[benefit.benefit_level], 0
        );
        
        return {
          exercise: ex,
          relevant_benefits: relevantBenefits,
          total_benefit_score: totalScore,
        };
      })
      .filter(item => item !== null && 
        item.relevant_benefits.some(b => benefitLevels[b.benefit_level] >= minLevel)
      );
    
    // Sort by total benefit score
    return therapeuticExercises.sort((a, b) => b!.total_benefit_score - a!.total_benefit_score);
  },
});

// Get sport bucket statistics
export const getSportBucketStats = query({
  args: {
    sport: v.string(),
  },
  handler: async (ctx, args) => {
    const exercises = await ctx.db
      .query("sportBuckets")
      .withIndex("by_sport", q => q.eq("sport", args.sport))
      .collect();
    
    if (exercises.length === 0) {
      return {
        totalExercises: 0,
        avgPerformanceScore: 0,
        highPerformers: [],
        lowPerformers: [],
        categoryDistribution: { warmup: 0, main: 0, cooldown: 0 },
      };
    }
    
    // Calculate statistics
    const totalUsage = exercises.reduce((sum, ex) => sum + ex.usage_count, 0);
    const avgScore = exercises.reduce((sum, ex) => sum + ex.avg_performance_score, 0) / exercises.length;
    
    // Get high and low performers
    const sorted = [...exercises].sort((a, b) => b.avg_performance_score - a.avg_performance_score);
    const highPerformers = sorted.slice(0, 10).map(ex => ({
      exercise_name: ex.exercise_name,
      score: ex.avg_performance_score,
      usage_count: ex.usage_count,
    }));
    const lowPerformers = sorted.slice(-10).reverse().map(ex => ({
      exercise_name: ex.exercise_name,
      score: ex.avg_performance_score,
      usage_count: ex.usage_count,
    }));
    
    // Calculate category distribution
    const categoryTotals = exercises.reduce((acc, ex) => {
      acc.warmup += ex.placement_stats.warmup_count;
      acc.main += ex.placement_stats.main_count;
      acc.cooldown += ex.placement_stats.cooldown_count;
      return acc;
    }, { warmup: 0, main: 0, cooldown: 0 });
    
    const totalPlacements = categoryTotals.warmup + categoryTotals.main + categoryTotals.cooldown;
    const categoryDistribution = {
      warmup: totalPlacements > 0 ? (categoryTotals.warmup / totalPlacements) * 100 : 0,
      main: totalPlacements > 0 ? (categoryTotals.main / totalPlacements) * 100 : 0,
      cooldown: totalPlacements > 0 ? (categoryTotals.cooldown / totalPlacements) * 100 : 0,
    };
    
    return {
      totalExercises: exercises.length,
      totalUsage,
      avgPerformanceScore: avgScore,
      highPerformers,
      lowPerformers,
      categoryDistribution,
    };
  },
});
