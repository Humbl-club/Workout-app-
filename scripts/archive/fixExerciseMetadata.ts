/**
 * Script to fix existing exercises in the database
 * - Validates exercise names (fixes invalid ones like "Cable Farmers Walk")
 * - Populates missing metadata (equipment, contraindications, etc.)
 * - Updates all exercises to have complete information
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { explainExerciseDetailed } from "../services/geminiService";

const CONVEX_URL = process.env.VITE_CONVEX_URL;
if (!CONVEX_URL) {
  throw new Error("VITE_CONVEX_URL environment variable not set");
}

const client = new ConvexHttpClient(CONVEX_URL);

async function fixExerciseMetadata() {
  console.log("🔍 Fetching all exercises from database...");
  
  // Get all exercises (we'll need to query them)
  // Note: This assumes there's a query to get all exercises
  // You may need to create one or paginate through them
  
  try {
    // First, let's check if we have a query to get all exercises
    // For now, we'll need to manually specify exercises to fix or create a query
    
    console.log("⚠️  This script needs a query to fetch all exercises.");
    console.log("📝 Please create a query in convex/queries.ts that returns all exercises, or");
    console.log("   manually specify exercise names to fix in this script.");
    
    // Example: Fix specific problematic exercises
    const exercisesToFix = [
      "Cable Farmers Walk",
      // Add more problematic exercise names here
    ];
    
    for (const exerciseName of exercisesToFix) {
      console.log(`\n🔧 Fixing: ${exerciseName}`);
      
      try {
        // Get comprehensive metadata
        const details = await explainExerciseDetailed(exerciseName);
        
        console.log(`  ✓ Normalized name: ${details.normalized_name}`);
        console.log(`  ✓ Equipment: ${details.equipment_required.join(', ') || 'none'}`);
        console.log(`  ✓ Contraindications: ${details.contraindications.length > 0 ? details.contraindications.join(', ') : 'none'}`);
        console.log(`  ✓ Movement pattern: ${details.movement_pattern}`);
        console.log(`  ✓ Tier: ${details.exercise_tier}`);
        
        // Update the exercise in the database
        await client.mutation(api.mutations.cacheExerciseExplanation, {
          exerciseName: details.normalized_name,
          explanation: details.explanation,
          muscles_worked: details.muscles_worked,
          form_cue: details.form_cue,
          common_mistake: details.common_mistake,
          source: "gemini_api",
          equipment_required: details.equipment_required,
          contraindications: details.contraindications,
          movement_pattern: details.movement_pattern as any,
          exercise_tier: details.exercise_tier,
          primary_category: details.primary_category,
          injury_risk: details.injury_risk,
          evidence_level: details.evidence_level,
          minimum_experience_level: details.minimum_experience_level,
          normalized_name: details.normalized_name,
        });
        
        console.log(`  ✅ Successfully updated: ${details.normalized_name}`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`  ❌ Failed to fix ${exerciseName}:`, error.message);
      }
    }
    
    console.log("\n✅ Finished fixing exercises!");
    
  } catch (error: any) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run the script
fixExerciseMetadata().catch(console.error);
