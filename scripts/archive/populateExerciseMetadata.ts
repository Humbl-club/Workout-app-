import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = "https://reminiscent-owl-650.convex.cloud";

// Comprehensive exercise metadata based on exercise science
const exerciseMetadata: { [key: string]: any } = {
  // COMPOUND MOVEMENTS - S TIER
  "barbell_back_squat": {
    equipment_required: ["barbell", "squat_rack"],
    evidence_level: "high",
    exercise_tier: "S",
    movement_pattern: "squat",
    primary_category: "main",
    minimum_experience_level: "intermediate",
    injury_risk: "moderate",
    sport_applications: ["powerlifting", "olympic_lifting", "general_strength"],
    sport_ratings: { boxing: 5, hyrox: 9, rock_climbing: 6, basketball: 9, soccer: 8, tennis: 7, running: 7, swimming: 5, cycling: 7, general_fitness: 10 },
    injury_contraindications: [
      { injury_type: "knee_pain", severity: "caution", reason: "High knee flexion under load", safe_modifications: ["Box squat", "Partial range"], alternative_exercises: ["leg_press", "goblet_squat"] },
      { injury_type: "lower_back", severity: "caution", reason: "Spinal loading", safe_modifications: ["Front squat", "Safety bar"], alternative_exercises: ["belt_squat", "leg_press"] }
    ]
  },
  
  "deadlift": {
    equipment_required: ["barbell"],
    evidence_level: "high",
    exercise_tier: "S",
    movement_pattern: "hinge",
    primary_category: "main",
    minimum_experience_level: "intermediate",
    injury_risk: "moderate",
    sport_applications: ["powerlifting", "strongman", "general_strength"],
    sport_ratings: { boxing: 6, hyrox: 8, rock_climbing: 7, basketball: 7, soccer: 7, tennis: 7, running: 6, swimming: 5, cycling: 5, general_fitness: 10 },
    injury_contraindications: [
      { injury_type: "lower_back", severity: "absolute", reason: "High spinal loading", safe_modifications: [], alternative_exercises: ["trap_bar_deadlift", "romanian_deadlift"] },
      { injury_type: "knee_pain", severity: "monitor", reason: "Moderate knee involvement", safe_modifications: ["Elevated deadlift"], alternative_exercises: ["hip_thrust"] }
    ]
  },
  
  "pull_up": {
    equipment_required: ["pull_up_bar"],
    evidence_level: "high",
    exercise_tier: "S",
    movement_pattern: "pull_vertical",
    primary_category: "main",
    minimum_experience_level: "intermediate",
    injury_risk: "low",
    sport_applications: ["climbing", "gymnastics", "military"],
    sport_ratings: { boxing: 7, hyrox: 6, rock_climbing: 10, basketball: 6, soccer: 5, tennis: 6, running: 4, swimming: 8, cycling: 3, general_fitness: 9 },
    injury_contraindications: [
      { injury_type: "shoulder_impingement", severity: "caution", reason: "Overhead pulling", safe_modifications: ["Neutral grip", "Assisted"], alternative_exercises: ["lat_pulldown", "inverted_row"] }
    ]
  },
  
  "bench_press": {
    equipment_required: ["barbell", "bench"],
    evidence_level: "high",
    exercise_tier: "S",
    movement_pattern: "push_horizontal",
    primary_category: "main",
    minimum_experience_level: "intermediate",
    injury_risk: "moderate",
    sport_applications: ["powerlifting", "football", "general_strength"],
    sport_ratings: { boxing: 8, hyrox: 5, rock_climbing: 4, basketball: 6, soccer: 5, tennis: 6, running: 3, swimming: 5, cycling: 3, general_fitness: 9 },
    injury_contraindications: [
      { injury_type: "shoulder_impingement", severity: "caution", reason: "Horizontal pressing", safe_modifications: ["Incline press", "Dumbbells"], alternative_exercises: ["push_ups", "dumbbell_press"] }
    ]
  },
  
  "plank": {
    equipment_required: [],
    evidence_level: "high",
    exercise_tier: "A",
    movement_pattern: "core",
    primary_category: "main",
    minimum_experience_level: "beginner",
    injury_risk: "low",
    sport_applications: ["core_stability", "injury_prevention"],
    sport_ratings: { boxing: 8, hyrox: 7, rock_climbing: 8, basketball: 7, soccer: 7, tennis: 7, running: 8, swimming: 7, cycling: 7, general_fitness: 9 },
    injury_contraindications: [
      { injury_type: "lower_back", severity: "monitor", reason: "Requires neutral spine", safe_modifications: ["Incline plank"], alternative_exercises: ["dead_bug"] }
    ]
  },
  
  // DEFAULT CATEGORIES FOR PATTERN MATCHING
  "_squat_": {
    movement_pattern: "squat",
    primary_category: "main",
    sport_ratings: { boxing: 5, hyrox: 7, rock_climbing: 6, basketball: 8, soccer: 8, tennis: 7, running: 7, swimming: 5, cycling: 7, general_fitness: 8 }
  },
  
  "_deadlift_": {
    movement_pattern: "hinge",
    primary_category: "main", 
    sport_ratings: { boxing: 6, hyrox: 8, rock_climbing: 7, basketball: 7, soccer: 7, tennis: 7, running: 6, swimming: 5, cycling: 5, general_fitness: 9 }
  },
  
  "_press_": {
    movement_pattern: "push_horizontal",
    primary_category: "main",
    sport_ratings: { boxing: 7, hyrox: 6, rock_climbing: 5, basketball: 6, soccer: 5, tennis: 6, running: 3, swimming: 6, cycling: 3, general_fitness: 8 }
  },
  
  "_pull_": {
    movement_pattern: "pull_vertical",
    primary_category: "main",
    sport_ratings: { boxing: 7, hyrox: 6, rock_climbing: 9, basketball: 6, soccer: 5, tennis: 6, running: 4, swimming: 8, cycling: 3, general_fitness: 8 }
  },
  
  "_row_": {
    movement_pattern: "pull_horizontal", 
    primary_category: "main",
    sport_ratings: { boxing: 7, hyrox: 6, rock_climbing: 8, basketball: 5, soccer: 5, tennis: 6, running: 4, swimming: 8, cycling: 4, general_fitness: 8 }
  },
  
  "_lunge_": {
    movement_pattern: "squat",
    primary_category: "main",
    sport_ratings: { boxing: 6, hyrox: 7, rock_climbing: 6, basketball: 8, soccer: 8, tennis: 8, running: 7, swimming: 4, cycling: 6, general_fitness: 8 }
  },
  
  "_stretch_": {
    movement_pattern: "mobility",
    primary_category: "cooldown",
    evidence_level: "moderate",
    exercise_tier: "B",
    minimum_experience_level: "beginner",
    injury_risk: "low",
    equipment_required: [],
    sport_ratings: { boxing: 6, hyrox: 5, rock_climbing: 7, basketball: 6, soccer: 7, tennis: 7, running: 8, swimming: 6, cycling: 6, general_fitness: 7 }
  },
  
  "_warmup_": {
    movement_pattern: "mobility",
    primary_category: "warmup",
    evidence_level: "moderate", 
    exercise_tier: "B",
    minimum_experience_level: "beginner",
    injury_risk: "low",
    equipment_required: [],
    sport_ratings: { boxing: 7, hyrox: 6, rock_climbing: 7, basketball: 7, soccer: 7, tennis: 7, running: 8, swimming: 7, cycling: 7, general_fitness: 8 }
  },
  
  "_walk_": {
    movement_pattern: "cardio",
    primary_category: "warmup",
    evidence_level: "high",
    exercise_tier: "B",
    minimum_experience_level: "beginner", 
    injury_risk: "low",
    equipment_required: [],
    sport_ratings: { boxing: 5, hyrox: 6, rock_climbing: 4, basketball: 5, soccer: 6, tennis: 5, running: 8, swimming: 3, cycling: 4, general_fitness: 7 }
  },
  
  "_run_": {
    movement_pattern: "cardio", 
    primary_category: "main",
    evidence_level: "high",
    exercise_tier: "A",
    minimum_experience_level: "beginner",
    injury_risk: "moderate",
    equipment_required: [],
    sport_ratings: { boxing: 7, hyrox: 9, rock_climbing: 5, basketball: 7, soccer: 8, tennis: 7, running: 10, swimming: 4, cycling: 5, general_fitness: 8 }
  }
};

// Equipment mapping based on exercise name patterns
function getEquipment(exerciseName: string): string[] {
  const name = exerciseName.toLowerCase();
  const equipment: string[] = [];
  
  if (name.includes('barbell')) equipment.push('barbell');
  if (name.includes('dumbbell')) equipment.push('dumbbells');
  if (name.includes('kettlebell')) equipment.push('kettlebell');
  if (name.includes('band')) equipment.push('resistance_bands');
  if (name.includes('cable')) equipment.push('cable_machine');
  if (name.includes('machine')) equipment.push('machine');
  if (name.includes('trx')) equipment.push('trx');
  if (name.includes('medicine_ball') || name.includes('med_ball')) equipment.push('medicine_ball');
  if (name.includes('foam_roller')) equipment.push('foam_roller');
  if (name.includes('box')) equipment.push('box');
  if (name.includes('bench')) equipment.push('bench');
  if (name.includes('rack')) equipment.push('squat_rack');
  if (name.includes('pull_up') || name.includes('chin_up')) equipment.push('pull_up_bar');
  if (name.includes('sled')) equipment.push('sled');
  if (name.includes('wall_ball')) equipment.push('wall_ball');
  
  return equipment.length > 0 ? equipment : ['none'];
}

// Determine exercise tier based on compound vs isolation
function getExerciseTier(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  
  // S-Tier: Fundamental compounds
  if (['squat', 'deadlift', 'bench_press', 'pull_up', 'overhead_press'].some(ex => name.includes(ex))) {
    return 'S';
  }
  
  // A-Tier: Important compounds and key accessories
  if (['row', 'lunge', 'dip', 'chin_up', 'hip_thrust', 'plank'].some(ex => name.includes(ex))) {
    return 'A';
  }
  
  // B-Tier: Good accessories and isolation
  if (['curl', 'extension', 'raise', 'fly', 'shrug', 'calf'].some(ex => name.includes(ex))) {
    return 'B';
  }
  
  // C-Tier: Specialized or less essential
  return 'C';
}

// Determine experience level required
function getExperienceLevel(exerciseName: string, tier: string): string {
  const name = exerciseName.toLowerCase();
  
  // Advanced: Complex barbell movements
  if (['clean', 'jerk', 'snatch'].some(ex => name.includes(ex))) {
    return 'advanced';
  }
  
  // Intermediate: Heavy compounds
  if (tier === 'S' && ['squat', 'deadlift', 'bench'].some(ex => name.includes(ex))) {
    return 'intermediate';
  }
  
  // Intermediate: Pull-ups and dips
  if (['pull_up', 'chin_up', 'dip'].some(ex => name.includes(ex))) {
    return 'intermediate';
  }
  
  return 'beginner';
}

// Determine injury risk
function getInjuryRisk(exerciseName: string, tier: string): string {
  const name = exerciseName.toLowerCase();
  
  // High risk: Complex movements or high loads
  if (['clean', 'jerk', 'snatch', 'heavy'].some(ex => name.includes(ex))) {
    return 'high';
  }
  
  // Moderate risk: Heavy compounds
  if (tier === 'S' && ['squat', 'deadlift', 'bench'].some(ex => name.includes(ex))) {
    return 'moderate';
  }
  
  // Moderate risk: Jumping/plyometric
  if (['jump', 'plyometric', 'box'].some(ex => name.includes(ex))) {
    return 'moderate';
  }
  
  return 'low';
}

async function populateAllExerciseMetadata() {
  const convex = new ConvexHttpClient(CONVEX_URL);
  
  console.log("🔬 Starting comprehensive exercise metadata population...");
  console.log("📊 This will analyze and populate ALL metadata fields\n");
  
  // Get all exercises
  const exercises = await convex.query(api.queries.getAllExercises);
  console.log(`📋 Found ${exercises.length} exercises to process\n`);
  
  let processedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;
  
  for (const exercise of exercises) {
    processedCount++;
    console.log(`\n🔄 [${processedCount}/${exercises.length}] Processing: ${exercise.exercise_name}`);
    
    try {
      // Get specific metadata or use pattern matching
      let metadata = exerciseMetadata[exercise.exercise_name] || {};
      
      // Pattern matching for generic exercises
      if (!metadata.movement_pattern) {
        for (const pattern in exerciseMetadata) {
          if (pattern.startsWith('_') && pattern.endsWith('_')) {
            const keyword = pattern.slice(1, -1);
            if (exercise.exercise_name.includes(keyword)) {
              metadata = { ...exerciseMetadata[pattern], ...metadata };
              break;
            }
          }
        }
      }
      
      // Fill in missing fields with intelligent defaults
      const equipment = metadata.equipment_required || getEquipment(exercise.exercise_name);
      const tier = metadata.exercise_tier || getExerciseTier(exercise.exercise_name);
      const experienceLevel = metadata.minimum_experience_level || getExperienceLevel(exercise.exercise_name, tier);
      const injuryRisk = metadata.injury_risk || getInjuryRisk(exercise.exercise_name, tier);
      const evidenceLevel = metadata.evidence_level || (tier === 'S' ? 'high' : tier === 'A' ? 'moderate' : 'low');
      
      // Update the exercise with comprehensive metadata
      await convex.mutation(api.mutations.updateExerciseMetadata, {
        exerciseName: exercise.exercise_name,
        equipment_required: equipment,
        evidence_level: evidenceLevel,
        exercise_tier: tier,
        movement_pattern: metadata.movement_pattern || 'unknown',
        primary_category: metadata.primary_category || 'main',
        minimum_experience_level: experienceLevel,
        injury_risk: injuryRisk,
        sport_applications: metadata.sport_applications || [],
      });
      
      // Update sport ratings if available
      if (metadata.sport_ratings) {
        await convex.mutation(api.sportBucketMutations.updateExerciseSportRatings, {
          exercise_name: exercise.exercise_name,
          sport_ratings: metadata.sport_ratings,
        });
      }
      
      // Update injury data if available
      if (metadata.injury_contraindications) {
        await convex.mutation(api.sportBucketMutations.updateExerciseInjuryData, {
          exercise_name: exercise.exercise_name,
          injury_contraindications: metadata.injury_contraindications,
          therapeutic_benefits: metadata.therapeutic_benefits || [],
        });
      }
      
      console.log(`✅ Updated: ${tier}-tier ${metadata.movement_pattern || 'unknown'} (${experienceLevel})`);
      updatedCount++;
      
    } catch (error: any) {
      console.error(`❌ Error updating ${exercise.exercise_name}:`, error.message);
      errorCount++;
    }
    
    // Progress indicator
    if (processedCount % 10 === 0) {
      console.log(`\n📈 Progress: ${processedCount}/${exercises.length} (${Math.round(processedCount/exercises.length*100)}%)`);
    }
  }
  
  console.log("\n📊 Metadata Population Complete:");
  console.log(`✅ Updated: ${updatedCount} exercises`);
  console.log(`❌ Errors: ${errorCount} exercises`);
  console.log(`📋 Total: ${exercises.length} exercises`);
  
  if (updatedCount > 0) {
    console.log("\n🎉 Database is now properly populated with:");
    console.log("- Equipment requirements");
    console.log("- Evidence levels"); 
    console.log("- Exercise tiers (S/A/B/C)");
    console.log("- Movement patterns");
    console.log("- Experience requirements");
    console.log("- Injury risk levels");
    console.log("- Sport applications");
    console.log("- Sport-specific ratings");
    console.log("\nYour intelligent exercise system is ready! 🚀");
  }
  
  process.exit(0);
}

// Run the comprehensive population
populateAllExerciseMetadata().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
