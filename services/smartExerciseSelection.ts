import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";

interface ExerciseScore {
  exercise_name: string;
  total_score: number;
  components: {
    sport_relevance: number;
    injury_safety: number;
    user_performance: number;
    category_fit: number;
    therapeutic_value: number;
  };
  modifications: string[];
  alternatives: string[];
}

export class SmartExerciseSelectionService {
  private convex: ConvexClient;
  private cache: Map<string, any>;
  
  constructor(convexClient: ConvexClient) {
    this.convex = convexClient;
    this.cache = new Map();
  }
  
  /**
   * Get intelligent exercise recommendations for a user
   */
  async getSmartExercises(
    userId: string,
    sport: string | null,
    category: 'warmup' | 'main' | 'cooldown',
    count: number = 20
  ): Promise<ExerciseScore[]> {
    // 1. Get user profile with injuries
    const user = await this.convex.query(api.queries.getUser, { userId });
    if (!user) throw new Error("User not found");
    
    const injuries = user.injuryProfile?.current_injuries || [];
    const sportSpecific = user.trainingPreferences?.sport_specific || sport;
    
    // 2. Try sport-specific bucket first
    let exercises: any[] = [];
    if (sportSpecific) {
      const cacheKey = `sport_${sportSpecific}_${category}`;
      if (this.cache.has(cacheKey)) {
        exercises = this.cache.get(cacheKey);
      } else {
        const sportExercises = await this.convex.query(
          api.sportBucketQueries.getSportBucketExercises,
          {
            sport: sportSpecific,
            minScore: 60, // Only get decent performers
            minUsageCount: 3, // Need some confidence
            category,
          }
        );
        
        // If we have enough sport-specific exercises, use them
        if (sportExercises.length >= count) {
          exercises = sportExercises;
          this.cache.set(cacheKey, exercises);
        }
      }
    }
    
    // 3. If not enough sport-specific, get safe exercises
    if (exercises.length < count) {
      const safeExercises = await this.convex.query(
        api.sportBucketQueries.getSafeExercisesForUser,
        {
          userId,
          category,
          sport: sportSpecific,
        }
      );
      
      // Merge with existing exercises
      const exerciseNames = new Set(exercises.map(e => e.exercise_name));
      for (const safe of safeExercises) {
        if (!exerciseNames.has(safe.exercise_name)) {
          exercises.push(safe);
        }
      }
    }
    
    // 4. Score all exercises
    const scoredExercises = await this.scoreExercises(
      exercises,
      userId,
      sportSpecific,
      category,
      injuries
    );
    
    // 5. Return top N
    return scoredExercises
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, count);
  }
  
  /**
   * Score exercises based on multiple factors
   */
  private async scoreExercises(
    exercises: any[],
    userId: string,
    sport: string | null,
    category: 'warmup' | 'main' | 'cooldown',
    injuries: any[]
  ): Promise<ExerciseScore[]> {
    const scores: ExerciseScore[] = [];
    
    for (const exercise of exercises) {
      // Get user performance history
      const performanceData = await this.convex.query(
        api.sportBucketQueries.getUserExercisePerformance,
        {
          userId,
          exercise_name: exercise.exercise_name,
          sport,
          limit: 10,
        }
      );
      
      // Calculate component scores
      const sportRelevance = this.calculateSportRelevance(exercise, sport);
      const injurySafety = this.calculateInjurySafety(exercise, injuries);
      const userPerformance = this.calculateUserPerformance(performanceData);
      const categoryFit = this.calculateCategoryFit(exercise, category);
      const therapeuticValue = this.calculateTherapeuticValue(exercise, injuries);
      
      // Calculate total score (weighted)
      const totalScore = (
        sportRelevance * 0.25 +
        injurySafety * 0.30 +
        userPerformance * 0.20 +
        categoryFit * 0.15 +
        therapeuticValue * 0.10
      );
      
      scores.push({
        exercise_name: exercise.exercise_name,
        total_score: totalScore,
        components: {
          sport_relevance: sportRelevance,
          injury_safety: injurySafety,
          user_performance: userPerformance,
          category_fit: categoryFit,
          therapeutic_value: therapeuticValue,
        },
        modifications: exercise.suggested_modifications || [],
        alternatives: exercise.alternative_exercises || [],
      });
    }
    
    return scores;
  }
  
  private calculateSportRelevance(exercise: any, sport: string | null): number {
    if (!sport || !exercise.sport_ratings) return 50;
    
    const sportKey = sport as keyof typeof exercise.sport_ratings;
    const rating = exercise.sport_ratings[sportKey];
    
    // Convert 0-10 rating to 0-100 score
    return rating ? rating * 10 : 50;
  }
  
  private calculateInjurySafety(exercise: any, injuries: any[]): number {
    if (injuries.length === 0) return 100;
    if (!exercise.injury_contraindications) return 90;
    
    let safetyScore = 100;
    
    for (const injury of injuries) {
      const contraindication = exercise.injury_contraindications.find(
        (c: any) => c.injury_type === injury.injury_type
      );
      
      if (contraindication) {
        switch (contraindication.severity) {
          case "absolute":
            return 0; // Never do this
          case "caution":
            safetyScore -= 30; // Reduce but don't eliminate
            break;
          case "monitor":
            safetyScore -= 10; // Minor reduction
            break;
        }
      }
    }
    
    return Math.max(0, safetyScore);
  }
  
  private calculateUserPerformance(performanceData: any): number {
    if (!performanceData || performanceData.performances.length === 0) {
      return 70; // Default score for new exercises
    }
    
    const { summary } = performanceData;
    
    // Base score on completion rate, PR rate, and RPE
    let score = 50;
    
    // Completion rate (0-40 points)
    score += summary.completionRate * 40;
    
    // PR rate (0-20 points)
    score += summary.prRate * 20;
    
    // RPE adjustment (-10 to +10 points)
    // Lower RPE is better for sustainability
    if (summary.avgRpe > 0) {
      const rpeAdjustment = (7 - summary.avgRpe) * 2;
      score += Math.max(-10, Math.min(10, rpeAdjustment));
    }
    
    // Penalty for high skip rate
    score -= summary.skipRate * 20;
    
    // Penalty for high substitute rate
    score -= summary.substituteRate * 10;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private calculateCategoryFit(exercise: any, category: 'warmup' | 'main' | 'cooldown'): number {
    // Check primary category
    if (exercise.primary_category === category) return 100;
    
    // Check placement stats if from sport bucket
    if (exercise.placement_stats) {
      const stats = exercise.placement_stats;
      const total = stats.warmup_count + stats.main_count + stats.cooldown_count;
      
      if (total > 0) {
        const categoryCount = stats[`${category}_count`];
        return (categoryCount / total) * 100;
      }
    }
    
    // Default scores based on exercise characteristics
    if (category === 'warmup') {
      // Warmups should be lower intensity, mobility focused
      if (exercise.movement_pattern === 'mobility') return 90;
      if (exercise.exercise_tier === 'C' || exercise.exercise_tier === 'B') return 70;
      return 40;
    } else if (category === 'main') {
      // Main exercises should be compound, higher value
      if (exercise.exercise_tier === 'S' || exercise.exercise_tier === 'A') return 90;
      if (exercise.exercise_tier === 'B') return 70;
      return 40;
    } else { // cooldown
      // Cooldowns should be recovery focused
      if (exercise.movement_pattern === 'mobility') return 80;
      if (exercise.therapeutic_benefits?.length > 0) return 70;
      return 40;
    }
  }
  
  private calculateTherapeuticValue(exercise: any, injuries: any[]): number {
    if (!exercise.therapeutic_benefits || injuries.length === 0) return 50;
    
    let therapeuticScore = 50;
    
    // Check if exercise helps with any current injuries
    for (const injury of injuries) {
      const benefit = exercise.therapeutic_benefits.find(
        (b: any) => b.condition.includes(injury.affected_area.toLowerCase())
      );
      
      if (benefit) {
        switch (benefit.benefit_level) {
          case "high":
            therapeuticScore += 30;
            break;
          case "moderate":
            therapeuticScore += 20;
            break;
          case "low":
            therapeuticScore += 10;
            break;
        }
      }
    }
    
    return Math.min(100, therapeuticScore);
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
  
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
let smartSelectionService: SmartExerciseSelectionService | null = null;

export function getSmartExerciseSelectionService(convexClient: ConvexClient): SmartExerciseSelectionService {
  if (!smartSelectionService) {
    smartSelectionService = new SmartExerciseSelectionService(convexClient);
  }
  return smartSelectionService;
}
