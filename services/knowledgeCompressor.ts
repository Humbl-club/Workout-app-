/**
 * Knowledge Compression Service
 * Compresses programming knowledge into decision trees for token optimization
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

export interface CompressedKnowledge {
  tier_s_exercises: string[];
  tier_a_exercises: string[];
  tier_b_exercises: string[];
  avoid_exercises: string[];
  substitutions: Record<string, string>;
  programming_rules: string[];
  warmup_pool: string[];
  cooldown_pool: string[];
}

export interface ExerciseDecisionContext {
  goal: string;
  experience: string;
  pain_points: string[];
  sport?: string;
  equipment?: string[];
}

/**
 * Compress knowledge for a specific user context
 */
export async function compressKnowledgeForContext(
  context: ExerciseDecisionContext,
  convex: ConvexHttpClient
): Promise<CompressedKnowledge> {
  
  // 1. Get relevant programming knowledge
  const knowledge = await convex.query(api.queries.getProgrammingKnowledge, {
    goal: context.goal,
    experience: context.experience
  });

  // 2. Get injury protocols for pain points
  const injuryProtocols = [];
  for (const painPoint of context.pain_points) {
    const protocols = await convex.query(api.queries.getInjuryProtocols, {
      issue: painPoint
    });
    injuryProtocols.push(...protocols);
  }

  // 3. Get all exercises and filter by tier/suitability
  const allExercises = await convex.query(api.queries.getAllExercises, {});
  
  const compressed: CompressedKnowledge = {
    tier_s_exercises: [],
    tier_a_exercises: [],
    tier_b_exercises: [],
    avoid_exercises: [],
    substitutions: {},
    programming_rules: [],
    warmup_pool: [],
    cooldown_pool: []
  };

  // 4. Process exercises by tier and suitability
  allExercises.forEach(exercise => {
    // Check if exercise should be avoided due to injury
    const shouldAvoid = injuryProtocols.some(protocol =>
      protocol.exercises_to_avoid?.some((avoid: any) =>
        avoid.exercise?.toLowerCase() === exercise.exercise_name.toLowerCase()
      )
    );

    if (shouldAvoid) {
      compressed.avoid_exercises.push(exercise.exercise_name);
      return;
    }

    // Check experience level requirement
    if (exercise.minimum_experience_level && 
        !isExperienceAppropriate(exercise.minimum_experience_level, context.experience)) {
      return; // Skip exercises too advanced/basic
    }

    // Categorize by tier and category
    switch (exercise.exercise_tier) {
      case 'S':
        compressed.tier_s_exercises.push(exercise.exercise_name);
        break;
      case 'A':
        compressed.tier_a_exercises.push(exercise.exercise_name);
        break;
      case 'B':
        compressed.tier_b_exercises.push(exercise.exercise_name);
        break;
    }

    // Add to warmup/cooldown pools
    if (exercise.primary_category === 'warmup') {
      compressed.warmup_pool.push(exercise.exercise_name);
    } else if (exercise.primary_category === 'cooldown') {
      compressed.cooldown_pool.push(exercise.exercise_name);
    }
  });

  // 5. Process substitutions from injury protocols
  injuryProtocols.forEach(protocol => {
    protocol.exercise_substitutions?.forEach((sub: any) => {
      if (sub.avoid && sub.use_instead) {
        compressed.substitutions[sub.avoid] = sub.use_instead;
      }
    });
  });

  // 6. Extract programming rules from knowledge
  knowledge.forEach(k => {
    k.guidelines?.forEach((guideline: any) => {
      if (guideline.rule && guideline.applies_to?.includes(context.experience)) {
        compressed.programming_rules.push(guideline.rule);
      }
    });
  });

  return compressed;
}

/**
 * Check if exercise experience requirement matches user level
 */
function isExperienceAppropriate(exerciseLevel: string, userLevel: string): boolean {
  const levels = ['beginner', 'intermediate', 'advanced'];
  const exerciseIndex = levels.indexOf(exerciseLevel.toLowerCase());
  const userIndex = levels.indexOf(userLevel.toLowerCase());
  
  // Allow exercises at user level or below (can't be too advanced)
  return exerciseIndex <= userIndex;
}

/**
 * Generate cache key for decision tree
 */
export function generateCacheKey(context: ExerciseDecisionContext): string {
  const parts = [
    context.goal.toLowerCase().replace(/\s+/g, '_'),
    context.experience.toLowerCase(),
    context.pain_points.sort().join('_').toLowerCase().replace(/\s+/g, '_')
  ];
  
  if (context.sport) {
    parts.push(context.sport.toLowerCase().replace(/\s+/g, '_'));
  }
  
  return parts.filter(p => p.length > 0).join('_');
}

/**
 * Check if cached knowledge is still fresh (< 24 hours old)
 */
export function isCacheFresh(generatedAt: string): boolean {
  const generated = new Date(generatedAt);
  const now = new Date();
  const hoursOld = (now.getTime() - generated.getTime()) / (1000 * 60 * 60);
  return hoursOld < 24;
}

/**
 * Create compressed prompt for Gemini (reduces tokens by ~80%)
 */
export function createCompressedPrompt(
  context: ExerciseDecisionContext,
  compressed: CompressedKnowledge
): string {
  return `REBLD Workout Planner for ${context.goal} (${context.experience} level)

EXERCISE SELECTION RULES:
MUST USE (S-Tier): ${compressed.tier_s_exercises.slice(0, 15).join(', ')}
SHOULD USE (A-Tier): ${compressed.tier_a_exercises.slice(0, 20).join(', ')}
CAN USE (B-Tier): ${compressed.tier_b_exercises.slice(0, 25).join(', ')}

NEVER USE: ${compressed.avoid_exercises.join(', ')}

SUBSTITUTIONS:
${Object.entries(compressed.substitutions)
  .map(([from, to]) => `Replace "${from}" with "${to}"`)
  .join('\n')}

WARMUP POOL: ${compressed.warmup_pool.slice(0, 20).join(', ')}
COOLDOWN POOL: ${compressed.cooldown_pool.slice(0, 15).join(', ')}

PROGRAMMING RULES:
${compressed.programming_rules.slice(0, 10).join('\n')}

Generate a 7-day workout plan following these rules exactly. Use ONLY exercises from the approved lists above.`;
}
