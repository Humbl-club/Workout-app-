/**
 * Enhance Existing Exercises with Intelligence Data
 * Updates exercises with tier ratings, scores, and metadata
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const enhancedData = [
  {
    exercise_name: "barbell_back_squat",
    primary_category: "main",
    exercise_tier: "S",
    value_score: 98,
    movement_pattern: "squat",
    sport_applications: ["powerlifting", "football", "basketball", "general_strength"],
    evidence_level: "high",
    injury_risk: "moderate",
    equipment_required: ["barbell", "squat_rack"],
    minimum_experience_level: "intermediate",
    contraindications: ["acute_knee_injury", "severe_back_injury"]
  },
  {
    exercise_name: "deadlift", 
    primary_category: "main",
    exercise_tier: "S",
    value_score: 100,
    movement_pattern: "hinge",
    sport_applications: ["powerlifting", "strongman", "general_strength"],
    evidence_level: "high", 
    injury_risk: "moderate",
    equipment_required: ["barbell", "weight_plates"],
    minimum_experience_level: "intermediate",
    contraindications: ["acute_back_injury", "disc_herniation"]
  },
  {
    exercise_name: "pull_up",
    primary_category: "main",
    exercise_tier: "S", 
    value_score: 92,
    movement_pattern: "pull_vertical",
    sport_applications: ["climbing", "gymnastics", "general_strength"],
    evidence_level: "high",
    injury_risk: "low",
    equipment_required: ["pull_up_bar"],
    minimum_experience_level: "intermediate",
    contraindications: ["shoulder_impingement", "elbow_tendonitis"]
  },
  {
    exercise_name: "push_up",
    primary_category: "main",
    exercise_tier: "A",
    value_score: 88,
    movement_pattern: "push_horizontal", 
    sport_applications: ["general_fitness", "military", "bodyweight_training"],
    evidence_level: "high",
    injury_risk: "low",
    equipment_required: ["none"],
    minimum_experience_level: "beginner",
    contraindications: ["wrist_injury", "shoulder_dislocation"]
  },
  {
    exercise_name: "overhead_press",
    primary_category: "main",
    exercise_tier: "S",
    value_score: 93,
    movement_pattern: "push_vertical",
    sport_applications: ["olympic_lifting", "strongman", "overhead_sports"],
    evidence_level: "high",
    injury_risk: "moderate", 
    equipment_required: ["barbell"],
    minimum_experience_level: "intermediate",
    contraindications: ["shoulder_impingement", "rotator_cuff_injury"]
  },
  {
    exercise_name: "hip_thrust",
    primary_category: "main",
    exercise_tier: "A",
    value_score: 90,
    movement_pattern: "hinge",
    sport_applications: ["glute_development", "aesthetics", "athletic_performance"],
    evidence_level: "high",
    injury_risk: "low",
    equipment_required: ["barbell", "bench"],
    minimum_experience_level: "beginner", 
    contraindications: ["lower_back_injury"]
  },
  {
    exercise_name: "bulgarian_split_squat",
    primary_category: "main",
    exercise_tier: "A",
    value_score: 85,
    movement_pattern: "squat",
    sport_applications: ["running", "basketball", "unilateral_strength"],
    evidence_level: "high",
    injury_risk: "low",
    equipment_required: ["bench"],
    minimum_experience_level: "intermediate",
    contraindications: ["severe_knee_injury", "ankle_instability"]
  },
  {
    exercise_name: "worlds_greatest_stretch", 
    primary_category: "warmup",
    exercise_tier: "A",
    value_score: 88,
    movement_pattern: "mobility",
    sport_applications: ["general_warmup", "mobility", "movement_prep"],
    evidence_level: "moderate",
    injury_risk: "low",
    equipment_required: ["none"],
    minimum_experience_level: "beginner",
    contraindications: ["acute_hip_injury", "back_injury"]
  },
  {
    exercise_name: "cat_cow_stretch",
    primary_category: "warmup", 
    exercise_tier: "A",
    value_score: 82,
    movement_pattern: "mobility",
    sport_applications: ["spine_health", "general_warmup", "back_mobility"],
    evidence_level: "moderate",
    injury_risk: "low",
    equipment_required: ["none"],
    minimum_experience_level: "beginner",
    contraindications: ["acute_spinal_injury"]
  },
  {
    exercise_name: "band_pull_aparts",
    primary_category: "warmup",
    exercise_tier: "A", 
    value_score: 85,
    movement_pattern: "pull_horizontal",
    sport_applications: ["shoulder_health", "posture_improvement", "general_warmup"],
    evidence_level: "moderate",
    injury_risk: "low",
    equipment_required: ["resistance_band"],
    minimum_experience_level: "beginner",
    contraindications: ["acute_shoulder_injury"]
  }
];

async function enhanceExistingExercises() {
  const convex = new ConvexHttpClient("https://reminiscent-owl-650.convex.cloud");
  
  console.log('🚀 ENHANCING EXERCISES WITH INTELLIGENCE DATA');
  console.log(`📊 Updating: ${enhancedData.length} exercises`);
  
  let successCount = 0;
  
  for (const exercise of enhancedData) {
    try {
      await convex.mutation(api.mutations.updateCachedExercise, {
        exerciseName: exercise.exercise_name,
        primaryCategory: exercise.primary_category as any,
        exerciseTier: exercise.exercise_tier as any,
        valueScore: exercise.value_score,
        movementPattern: exercise.movement_pattern as any,
        sportApplications: exercise.sport_applications,
        evidenceLevel: exercise.evidence_level as any,
        injuryRisk: exercise.injury_risk as any,
        equipmentRequired: exercise.equipment_required,
        minimumExperienceLevel: exercise.minimum_experience_level,
        contraindications: exercise.contraindications,
      });
      
      successCount++;
      console.log(`✅ ${exercise.exercise_name} → Tier ${exercise.exercise_tier} (Score: ${exercise.value_score})`);
      
    } catch (error: any) {
      console.error(`❌ ${exercise.exercise_name}: ${error.message}`);
    }
  }

  console.log('\n🎉 INTELLIGENCE ENHANCEMENT COMPLETE!');
  console.log(`✅ Enhanced: ${successCount} exercises`);
  console.log('\n🧠 Your AI now has:');
  console.log('✅ Exercise tier ratings (S/A/B/C)');
  console.log('✅ Value scores (0-100)');
  console.log('✅ Movement pattern classification');
  console.log('✅ Sport-specific applications');
  console.log('✅ Evidence levels and safety data');
  console.log('✅ Equipment requirements and contraindications');
  console.log('\n🎯 TEST THE INTELLIGENCE:');
  console.log('1. Create a new workout plan');
  console.log('2. Set goal to "Aesthetic Physique"'); 
  console.log('3. Add explanation: "I want a bigger butt"');
  console.log('4. Watch AI prioritize hip thrusts and glute exercises!');
}

enhanceExistingExercises().catch(console.error);
