/**
 * Exercise Ranking Service
 * Ranks exercises based on user preferences, goals, and historical data
 */

import { WorkoutLog, TrainingPreferences } from '../types';

export interface RankedExercise {
  exercise_name: string;
  explanation: string;
  muscles_worked: string[] | null;
  form_cue: string | null;
  common_mistake: string | null;
  primary_category: string | null;
  exercise_tier: string | null;
  value_score: number | null;
  movement_pattern: string | null;
  sport_applications: string[] | null;
  evidence_level: string | null;
  injury_risk: string | null;
  equipment_required: string[];
  minimum_experience_level: string;
  contraindications: string[];
  // Computed ranking fields
  final_score: number;
  ranking_factors: {
    base_value: number;
    goal_alignment: number;
    experience_match: number;
    injury_penalty: number;
    overuse_penalty: number;
    preference_boost: number;
    equipment_penalty: number;
  };
  recommendation_reason: string;
}

/**
 * Rank exercises for a specific user and context
 */
export function rankExercises(
  exercises: any[],
  preferences: TrainingPreferences | null,
  sessionHistory: WorkoutLog[],
  availableEquipment: string[] = ['barbell', 'dumbbells', 'bodyweight']
): RankedExercise[] {
  
  return exercises.map(exercise => {
    const factors = {
      base_value: exercise.value_score || 50,
      goal_alignment: 0,
      experience_match: 0,
      injury_penalty: 0,
      overuse_penalty: 0,
      preference_boost: 0,
      equipment_penalty: 0
    };

    // 1. Goal Alignment Scoring
    if (preferences?.primary_goal && preferences.goal_explanation) {
      factors.goal_alignment = calculateGoalAlignment(
        exercise,
        preferences.primary_goal,
        preferences.goal_explanation
      );
    }

    // 2. Experience Level Match
    if (preferences?.experience_level && exercise.minimum_experience_level) {
      factors.experience_match = calculateExperienceMatch(
        exercise.minimum_experience_level,
        preferences.experience_level
      );
    }

    // 3. Injury Risk Penalty
    if (preferences?.pain_points && preferences.pain_points.length > 0) {
      factors.injury_penalty = calculateInjuryPenalty(
        exercise,
        preferences.pain_points
      );
    }

    // 4. Overuse Penalty (avoid repeating same exercises too frequently)
    factors.overuse_penalty = calculateOverusePenalty(
      exercise.exercise_name,
      sessionHistory
    );

    // 5. Equipment Availability
    factors.equipment_penalty = calculateEquipmentPenalty(
      exercise.equipment_required || [],
      availableEquipment
    );

    // Calculate final score
    const final_score = Math.max(0, Math.min(100,
      factors.base_value +
      factors.goal_alignment +
      factors.experience_match -
      factors.injury_penalty -
      factors.overuse_penalty +
      factors.preference_boost -
      factors.equipment_penalty
    ));

    return {
      ...exercise,
      final_score,
      ranking_factors: factors,
      recommendation_reason: generateRecommendationReason(factors, exercise)
    };
  }).sort((a, b) => b.final_score - a.final_score);
}

/**
 * Calculate how well exercise aligns with user's specific goals
 */
function calculateGoalAlignment(
  exercise: any,
  primaryGoal: string,
  goalExplanation: string
): number {
  let score = 0;
  const explanation = goalExplanation.toLowerCase();
  const muscles = exercise.muscles_worked || [];

  // Aesthetic goals with specific body parts
  if (primaryGoal === 'Aesthetic Physique') {
    if (explanation.includes('bigger butt') || explanation.includes('glutes')) {
      if (muscles.includes('glutes')) score += 25;
    }
    if (explanation.includes('bigger arms') || explanation.includes('bicep') || explanation.includes('tricep')) {
      if (muscles.includes('biceps') || muscles.includes('triceps')) score += 25;
    }
    if (explanation.includes('abs') || explanation.includes('core') || explanation.includes('six pack')) {
      if (muscles.includes('core') || muscles.includes('abs')) score += 25;
    }
    if (explanation.includes('chest') || explanation.includes('pecs')) {
      if (muscles.includes('chest') || muscles.includes('pectorals')) score += 25;
    }
    if (explanation.includes('back') || explanation.includes('lats')) {
      if (muscles.includes('lats') || muscles.includes('rhomboids') || muscles.includes('rear_delts')) score += 25;
    }
  }

  // Strength goals
  if (primaryGoal === 'Strength & Power') {
    if (exercise.exercise_tier === 'S' && exercise.primary_category === 'main') {
      score += 20;
    }
    if (explanation.includes('stronger') || explanation.includes('lift more')) {
      if (['squat', 'hinge', 'push_vertical', 'pull_vertical'].includes(exercise.movement_pattern)) {
        score += 15;
      }
    }
  }

  // Athletic Performance
  if (primaryGoal === 'Athletic Performance') {
    if (exercise.movement_pattern === 'plyometric') score += 20;
    if (exercise.sport_applications?.length > 0) score += 15;
    if (explanation.includes('explosive') || explanation.includes('power')) {
      score += 15;
    }
  }

  return score;
}

/**
 * Calculate experience level appropriateness
 */
function calculateExperienceMatch(
  exerciseLevel: string,
  userLevel: string
): number {
  const levels = { beginner: 1, intermediate: 2, advanced: 3 };
  const exerciseLevelNum = levels[exerciseLevel.toLowerCase() as keyof typeof levels] || 2;
  const userLevelNum = levels[userLevel.toLowerCase() as keyof typeof levels] || 2;

  // Perfect match
  if (exerciseLevelNum === userLevelNum) return 10;
  
  // Exercise too advanced
  if (exerciseLevelNum > userLevelNum) return -20;
  
  // Exercise too basic (but still usable)
  if (exerciseLevelNum < userLevelNum) return 5;
  
  return 0;
}

/**
 * Calculate injury risk penalty based on user's pain points
 */
function calculateInjuryPenalty(
  exercise: any,
  painPoints: string[]
): number {
  let penalty = 0;

  // High injury risk exercises get general penalty
  if (exercise.injury_risk === 'high') penalty += 15;
  if (exercise.injury_risk === 'moderate') penalty += 5;

  // Specific contraindications
  painPoints.forEach(painPoint => {
    const contraindications = exercise.contraindications || [];
    if (contraindications.some((contra: string) => 
        contra.toLowerCase().includes(painPoint.toLowerCase()))) {
      penalty += 30; // Heavy penalty for direct contraindications
    }

    // Pattern-based penalties
    if (painPoint.toLowerCase().includes('knee')) {
      if (exercise.movement_pattern === 'squat') penalty += 10;
    }
    if (painPoint.toLowerCase().includes('shoulder')) {
      if (exercise.movement_pattern === 'push_vertical') penalty += 15;
    }
    if (painPoint.toLowerCase().includes('back')) {
      if (exercise.movement_pattern === 'hinge') penalty += 10;
    }
  });

  return penalty;
}

/**
 * Calculate overuse penalty (avoid same exercise too frequently)
 */
function calculateOverusePenalty(
  exerciseName: string,
  sessionHistory: WorkoutLog[]
): number {
  const recentSessions = sessionHistory
    .filter(log => {
      const logDate = new Date(log.date);
      const daysSince = (Date.now() - logDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 7; // Last 7 days
    });

  const usageCount = recentSessions.reduce((count, session) => {
    const exerciseUsed = session.exercises.some(ex => 
      ex.exerciseName?.toLowerCase() === exerciseName.toLowerCase()
    );
    return exerciseUsed ? count + 1 : count;
  }, 0);

  // Progressive penalty for overuse
  if (usageCount >= 4) return 25; // Used 4+ times in last week
  if (usageCount === 3) return 15; // Used 3 times
  if (usageCount === 2) return 5;  // Used 2 times
  return 0;
}

/**
 * Calculate equipment availability penalty
 */
function calculateEquipmentPenalty(
  requiredEquipment: string[],
  availableEquipment: string[]
): number {
  const missingEquipment = requiredEquipment.filter(req => 
    !availableEquipment.some(avail => 
      avail.toLowerCase().includes(req.toLowerCase())
    )
  );

  // Heavy penalty if required equipment is missing
  return missingEquipment.length * 40;
}

/**
 * Generate human-readable recommendation reason
 */
function generateRecommendationReason(
  factors: any,
  exercise: any
): string {
  const reasons: string[] = [];

  if (factors.goal_alignment > 15) {
    reasons.push("Excellent for your specific goals");
  }
  if (factors.experience_match > 5) {
    reasons.push("Perfect for your experience level");
  }
  if (factors.injury_penalty > 20) {
    reasons.push("⚠️ Consider alternatives due to injury risk");
  }
  if (factors.overuse_penalty > 15) {
    reasons.push("Used frequently recently - consider variety");
  }
  if (factors.equipment_penalty > 0) {
    reasons.push("Requires equipment you may not have");
  }
  if (exercise.exercise_tier === 'S') {
    reasons.push("Fundamental movement - highly recommended");
  }

  return reasons.length > 0 ? reasons.join(" • ") : "Standard recommendation";
}

/**
 * Get top exercises for a specific category (warmup/main/cooldown)
 */
export function getTopExercisesByCategory(
  rankedExercises: RankedExercise[],
  category: 'warmup' | 'main' | 'cooldown',
  count: number = 10
): RankedExercise[] {
  return rankedExercises
    .filter(ex => ex.primary_category === category)
    .slice(0, count);
}

/**
 * Get exercises avoiding specific movement patterns (for injury management)
 */
export function getExercisesAvoidingPatterns(
  rankedExercises: RankedExercise[],
  avoidPatterns: string[],
  count: number = 10
): RankedExercise[] {
  return rankedExercises
    .filter(ex => !avoidPatterns.includes(ex.movement_pattern || ''))
    .slice(0, count);
}
