/**
 * Upload Database with Fixed Schema Compatibility
 * Works with existing data in Convex
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadWithFixedSchema() {
  // Load the complete database
  const completeDatabase = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/COMPLETE_EXERCISE_DATABASE_FULL.json'), 'utf8'));
  
  const convex = new ConvexHttpClient("https://reminiscent-owl-650.convex.cloud");
  
  console.log('🚀 UPLOADING COMPLETE DATABASE WITH FIXED SCHEMA');
  console.log(`📊 Total Exercises: ${completeDatabase.total_exercises}`);

  let successCount = 0;
  let failureCount = 0;

  // Upload exercises with proper error handling
  for (let i = 0; i < completeDatabase.exercises.length; i++) {
    const exercise = completeDatabase.exercises[i];
    
    if (i % 100 === 0) {
      console.log(`📈 Progress: ${Math.round((i / completeDatabase.exercises.length) * 100)}%`);
    }
    
    try {
      await convex.mutation(api.mutations.cacheExerciseExplanation, {
        exerciseName: exercise.exercise_name,
        explanation: exercise.scientific_explanation || exercise.explanation,
        musclesWorked: exercise.muscles_worked || [],
        formCue: exercise.form_cue || "",
        commonMistake: exercise.common_mistake || "",
        source: "scientific_textbooks" as any,
        // Enhanced fields (optional)
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
      
      // Log S-tier exercises
      if (exercise.exercise_tier === 'S') {
        console.log(`🏆 S-TIER: ${exercise.exercise_name}`);
      }
      
    } catch (error) {
      failureCount++;
      console.error(`❌ Failed: ${exercise.exercise_name}`, error?.toString()?.slice(0, 100));
    }
    
    // Small delay to prevent rate limiting
    if (i % 50 === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n🎉 UPLOAD COMPLETE!');
  console.log(`✅ Successful uploads: ${successCount}`);
  console.log(`❌ Failed uploads: ${failureCount}`);
  console.log(`📈 Success rate: ${Math.round((successCount / (successCount + failureCount)) * 100)}%`);
  
  if (successCount > 0) {
    console.log('\n🧠 YOUR AI NOW HAS:');
    console.log(`📋 ${successCount} research-backed exercises`);
    console.log('✅ Goal-specific exercise selection');
    console.log('✅ Injury-aware programming');
    console.log('✅ Evidence-based recommendations');
    console.log('\n🚀 Try creating a new workout plan to see the intelligence!');
  }
}

uploadWithFixedSchema().catch(console.error);
