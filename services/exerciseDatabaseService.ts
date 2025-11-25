import { WorkoutPlan, PlanDay, WorkoutBlock } from '../types';
import { explainExerciseDetailed } from './geminiService';

/**
 * User Preferences Type - matches the updated users table schema
 */
export interface UserPreferences {
  trainingPreferences?: {
    primary_goal?: string;
    goal_explanation?: string | null;
    experience_level?: string;
    training_frequency?: string;
    pain_points?: string[];
    sport?: string | null;
    sport_specific?: string | null;
    additional_notes?: string | null;
    last_updated?: string;
    sex?: 'male' | 'female' | 'other' | null;
    equipment?: 'minimal' | 'home_gym' | 'commercial_gym' | null;
    preferred_session_length?: '30' | '45' | '60' | '75' | null;
    athletic_level?: 'low' | 'moderate' | 'high' | null;
    training_age_years?: number | null;
    body_type?: 'lean' | 'average' | 'muscular' | null;
  } | null;
  bodyMetrics?: {
    weight?: number | null;
    height?: number | null;
    heightUnit?: 'cm' | 'ft' | null;
    bodyFatPercentage?: number | null;
    measurements?: {
      chest?: number | null;
      waist?: number | null;
      hips?: number | null;
      biceps?: number | null;
      thighs?: number | null;
    } | null;
    lastUpdated?: string | null;
  } | null;
  injuryProfile?: {
    current_injuries?: Array<{
      injury_type: string;
      severity: 'mild' | 'moderate' | 'severe';
      affected_area: string;
      date_reported: string;
      notes?: string | null;
    }>;
    injury_history?: Array<{
      injury_type: string;
      date_occurred: string;
      date_recovered?: string | null;
      recurring: boolean;
    }>;
    movement_restrictions?: string[];
    pain_triggers?: string[];
    last_updated?: string;
  } | null;
}

/**
 * Exercise Database Service
 * 
 * Strategy (as requested):
 * 1. Plans are AI-generated based on latest scientific/evidence-based sources (NO database lookup during generation)
 * 2. After plan creation, extract all exercises and save to database with detailed explanations
 * 3. Exercises accumulate in database over time - every new exercise gets added
 * 4. When users swap exercises later, they can browse the database
 * 5. Focus: Create BEST plan possible. If exercises happen to be in DB, great. If not, create new ones and add them.
 * 
 * NEW: Now includes user-aware filtering based on equipment, experience level, and injury profile
 */

/**
 * Extract all unique exercises from a workout plan
 */
export const extractExercisesFromPlan = (plan: WorkoutPlan): Array<{
  exercise_name: string;
  notes?: string;
  category: 'warmup' | 'main' | 'cooldown';
}> => {
  const exerciseMap = new Map<string, { exercise_name: string; notes?: string; category: 'warmup' | 'main' | 'cooldown' }>();

  // Helper to add exercise to map (deduplicates by lowercase name)
  const addExercise = (ex: { exercise_name: string; notes?: string | null; category: 'warmup' | 'main' | 'cooldown' }) => {
    const key = ex.exercise_name.toLowerCase().trim();
    if (!exerciseMap.has(key)) {
      exerciseMap.set(key, {
        exercise_name: ex.exercise_name,
        notes: ex.notes || undefined,
        category: ex.category,
      });
    }
  };

  // Flatten all exercises from weekly plan (more efficient than nested loops)
  const weeklyExercises = plan.weeklyPlan
    .flatMap(day => day.blocks)
    .flatMap(block => block.exercises);
  
  weeklyExercises.forEach(addExercise);

  // Extract from daily routine if present
  if (plan.dailyRoutine?.exercises) {
    plan.dailyRoutine.exercises.forEach(addExercise);
  }

  return Array.from(exerciseMap.values());
};

/**
 * Save exercises from an already-extracted list to the database
 * This is the optimized version that uses server-side extracted exercises
 * 
 * @param exercises - Already extracted exercises (from server-side extraction)
 * @param cacheExerciseMutation - Convex mutation function to save exercises
 */
export const saveExercisesFromExtractedList = async (
  exercises: Array<{ exercise_name: string; notes?: string; category: 'warmup' | 'main' | 'cooldown' }>,
  cacheExerciseMutation: (args: any) => Promise<void>
): Promise<void> => {
  if (exercises.length === 0) {
    console.log("No exercises to save");
    return;
  }

  console.log(`📚 Saving ${exercises.length} unique exercises to database (extracted server-side)...`);

  // Process exercises sequentially to avoid rate limits and ensure all are saved
  for (const exercise of exercises) {
    try {
      // Generate detailed, comprehensive explanation with FULL metadata
      const details = await explainExerciseDetailed(
        exercise.exercise_name,
        exercise.notes
      );

      // Use normalized name if different from original
      const finalName = details.normalized_name !== exercise.exercise_name 
        ? details.normalized_name 
        : exercise.exercise_name;

      // Log if name was corrected
      if (details.normalized_name !== exercise.exercise_name) {
        console.log(`⚠️  Exercise name corrected: "${exercise.exercise_name}" → "${details.normalized_name}"`);
      }

      // Save to database with ALL metadata (will update if exists, create if new)
      await cacheExerciseMutation({
        exerciseName: finalName,
        explanation: details.explanation,
        muscles_worked: details.muscles_worked,
        form_cue: details.form_cue,
        common_mistake: details.common_mistake,
        source: 'gemini_api',
        equipment_required: details.equipment_required,
        contraindications: details.contraindications,
        movement_pattern: details.movement_pattern,
        exercise_tier: details.exercise_tier,
        primary_category: details.primary_category || exercise.category,
        injury_risk: details.injury_risk,
        evidence_level: details.evidence_level,
        minimum_experience_level: details.minimum_experience_level,
        normalized_name: details.normalized_name,
      });

      console.log(`✓ Saved exercise to database: ${finalName} (equipment: ${details.equipment_required?.join(', ') || 'none'})`);
    } catch (error) {
      console.error(`✗ Failed to save exercise ${exercise.exercise_name}:`, error);
      // Continue with other exercises even if one fails
    }
    
    // Small delay between exercises to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`✅ Finished building exercise database: ${exercises.length} exercises processed`);
};

/**
 * Save exercises from a plan to the database (legacy - extracts client-side)
 * @deprecated Use saveExercisesFromExtractedList instead for better performance
 * 
 * @param plan - The workout plan containing exercises
 * @param cacheExerciseMutation - Convex mutation function to save exercises
 */
export const saveExercisesFromPlan = async (
  plan: WorkoutPlan,
  cacheExerciseMutation: (args: {
    exerciseName: string;
    explanation: string;
    muscles_worked?: string[];
    form_cue?: string;
    common_mistake?: string;
    source: 'gemini_ultra' | 'gemini_api';
    equipment_required?: string[];
    contraindications?: string[];
    movement_pattern?: string;
    exercise_tier?: 'S' | 'A' | 'B' | 'C';
    primary_category?: 'warmup' | 'main' | 'cooldown';
    injury_risk?: 'low' | 'moderate' | 'high';
    evidence_level?: 'high' | 'moderate' | 'low';
    minimum_experience_level?: string;
    normalized_name?: string;
  }) => Promise<void>
): Promise<void> => {
  const exercises = extractExercisesFromPlan(plan);
  return saveExercisesFromExtractedList(exercises, cacheExerciseMutation);
};

/**
 * Check if an exercise is compatible with user's equipment preferences
 * 
 * @param exerciseName - Name of the exercise
 * @param equipmentRequired - Equipment required for the exercise (from cache)
 * @param userEquipment - User's available equipment preference
 * @returns true if exercise is compatible with user's equipment
 */
export const isExerciseCompatibleWithEquipment = (
  exerciseName: string,
  equipmentRequired: string[] | undefined | null,
  userEquipment: 'minimal' | 'home_gym' | 'commercial_gym' | null | undefined
): boolean => {
  if (!userEquipment) return true; // No preference = allow all
  
  const exerciseLower = exerciseName.toLowerCase();
  const equipmentLower = (equipmentRequired || []).map(eq => eq.toLowerCase());
  
  // Bodyweight exercises are always compatible
  const bodyweightKeywords = ['bodyweight', 'body weight', 'no equipment', 'none', 'push-up', 'pull-up', 'sit-up', 'plank', 'squat', 'lunge', 'burpee'];
  const isBodyweight = equipmentLower.length === 0 || 
    bodyweightKeywords.some(keyword => 
      exerciseLower.includes(keyword) || equipmentLower.some(eq => eq.includes(keyword))
    );
  
  if (isBodyweight) return true;
  
  // Equipment compatibility mapping
  const minimalEquipment = ['resistance band', 'band', 'dumbbell', 'db', 'kettlebell', 'kb'];
  const homeGymEquipment = [...minimalEquipment, 'barbell', 'bench', 'pull-up bar', 'pullup bar', 'pull up bar', 'cable'];
  const commercialGymEquipment = [...homeGymEquipment, 'machine', 'cable machine', 'smith machine', 'leg press', 'sled'];
  
  const hasCompatibleEquipment = (equipment: string[]) => {
    return equipment.some(eq => {
      const eqLower = eq.toLowerCase();
      switch (userEquipment) {
        case 'minimal':
          return minimalEquipment.some(allowed => eqLower.includes(allowed));
        case 'home_gym':
          return homeGymEquipment.some(allowed => eqLower.includes(allowed));
        case 'commercial_gym':
          return commercialGymEquipment.some(allowed => eqLower.includes(allowed));
        default:
          return true;
      }
    });
  };
  
  if (equipmentLower.length === 0) return true; // Unknown equipment = allow
  return hasCompatibleEquipment(equipmentLower);
};

/**
 * Check if an exercise is appropriate for user's experience level
 * 
 * @param minimumExperienceLevel - Minimum experience level required (from cache)
 * @param userExperienceLevel - User's experience level
 * @returns true if exercise matches user's experience level
 */
export const isExerciseAppropriateForExperience = (
  minimumExperienceLevel: string | undefined | null,
  userExperienceLevel: string | undefined | null
): boolean => {
  if (!minimumExperienceLevel || !userExperienceLevel) return true; // Unknown = allow
  
  const levelHierarchy: Record<string, number> = {
    'beginner': 1,
    'novice': 1,
    'intermediate': 2,
    'advanced': 3,
    'expert': 4,
  };
  
  const minLevel = levelHierarchy[minimumExperienceLevel.toLowerCase()] || 1;
  const userLevel = levelHierarchy[userExperienceLevel.toLowerCase()] || 2;
  
  return userLevel >= minLevel;
};

/**
 * Check if an exercise is safe for user based on injury profile
 * 
 * @param exerciseName - Name of the exercise
 * @param exerciseContraindications - Contraindications from cache
 * @param userInjuryProfile - User's injury profile
 * @returns Object with isSafe flag and reason if unsafe
 */
export const isExerciseSafeForInjuries = (
  exerciseName: string,
  exerciseContraindications: string[] | undefined | null,
  userInjuryProfile: UserPreferences['injuryProfile']
): { isSafe: boolean; reason?: string } => {
  if (!userInjuryProfile) return { isSafe: true };
  
  const exerciseLower = exerciseName.toLowerCase();
  const currentInjuries = userInjuryProfile.current_injuries || [];
  const restrictions = userInjuryProfile.movement_restrictions || [];
  const painTriggers = userInjuryProfile.pain_triggers || [];
  
  // Check against movement restrictions
  for (const restriction of restrictions) {
    const restrictionLower = restriction.toLowerCase();
    if (exerciseLower.includes(restrictionLower)) {
      return { isSafe: false, reason: `Exercise involves restricted movement: ${restriction}` };
    }
  }
  
  // Check against pain triggers
  for (const trigger of painTriggers) {
    const triggerLower = trigger.toLowerCase();
    if (exerciseLower.includes(triggerLower)) {
      return { isSafe: false, reason: `Exercise may trigger pain: ${trigger}` };
    }
  }
  
  // Check against current injuries
  for (const injury of currentInjuries) {
    const injuryAreaLower = injury.affected_area.toLowerCase();
    const injuryTypeLower = injury.injury_type.toLowerCase();
    
    // Check if exercise name mentions the affected area
    if (exerciseLower.includes(injuryAreaLower)) {
      return { isSafe: false, reason: `Exercise targets injured area: ${injury.affected_area}` };
    }
    
    // Check contraindications
    if (exerciseContraindications) {
      const matchingContra = exerciseContraindications.find(contra => 
        contra.toLowerCase().includes(injuryAreaLower) || 
        contra.toLowerCase().includes(injuryTypeLower)
      );
      if (matchingContra) {
        return { isSafe: false, reason: `Exercise contraindicated for: ${injury.injury_type}` };
      }
    }
  }
  
  return { isSafe: true };
};

/**
 * Filter exercises based on user preferences
 * 
 * @param exercises - Array of exercises with metadata
 * @param userPreferences - User's preferences and profile
 * @returns Filtered array of compatible exercises
 */
export const filterExercisesByUserPreferences = <T extends {
  exercise_name: string;
  equipment_required?: string[] | null;
  minimum_experience_level?: string | null;
  contraindications?: string[] | null;
}>(
  exercises: T[],
  userPreferences: UserPreferences
): T[] => {
  return exercises.filter(exercise => {
    // Check equipment compatibility
    const equipmentCompatible = isExerciseCompatibleWithEquipment(
      exercise.exercise_name,
      exercise.equipment_required,
      userPreferences.trainingPreferences?.equipment
    );
    
    if (!equipmentCompatible) return false;
    
    // Check experience level
    const experienceAppropriate = isExerciseAppropriateForExperience(
      exercise.minimum_experience_level,
      userPreferences.trainingPreferences?.experience_level
    );
    
    if (!experienceAppropriate) return false;
    
    // Check injury safety
    const safetyCheck = isExerciseSafeForInjuries(
      exercise.exercise_name,
      exercise.contraindications,
      userPreferences.injuryProfile
    );
    
    if (!safetyCheck.isSafe) return false;
    
    return true;
  });
};

