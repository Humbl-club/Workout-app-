import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import injuryMatrixData from "../data/exercise_injury_matrix.json";

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://humorous-ox-302.convex.cloud";

async function uploadInjuryData() {
  const convex = new ConvexClient(CONVEX_URL);
  
  console.log("🏥 Starting injury data upload...");
  console.log("📊 First, let me check which exercises exist in the database...\n");
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  // Get all exercises from the database
  const existingExercises = await convex.query(api.queries.getAllExercises);
  const exerciseNames = new Set(existingExercises.map(ex => ex.exercise_name));
  
  console.log(`📋 Found ${existingExercises.length} exercises in database`);
  console.log(`🎯 Attempting to update ${Object.keys(injuryMatrixData.injury_data).length} exercises with injury data\n`);
  
  for (const [exerciseName, data] of Object.entries(injuryMatrixData.injury_data)) {
    // Check if exercise exists
    if (!exerciseNames.has(exerciseName)) {
      console.log(`⏭️  Skipping ${exerciseName} - not found in database`);
      skippedCount++;
      continue;
    }
    
    try {
      // Update injury contraindications
      if (data.injury_contraindications && data.injury_contraindications.length > 0) {
        await convex.mutation(api.sportBucketMutations.updateExerciseInjuryData, {
          exercise_name: exerciseName,
          injury_contraindications: data.injury_contraindications,
          therapeutic_benefits: data.therapeutic_benefits || [],
        });
        
        console.log(`✅ Updated injury data for ${exerciseName}`);
      }
      
      // Update sport ratings
      if (data.sport_ratings) {
        await convex.mutation(api.sportBucketMutations.updateExerciseSportRatings, {
          exercise_name: exerciseName,
          sport_ratings: data.sport_ratings,
        });
        
        console.log(`⭐ Updated sport ratings for ${exerciseName}`);
      }
      
      successCount++;
    } catch (error) {
      console.error(`❌ Error updating ${exerciseName}:`, error);
      errorCount++;
    }
  }
  
  console.log("\n📊 Injury Data Upload Complete:");
  console.log(`✅ Success: ${successCount} exercises updated`);
  console.log(`⏭️  Skipped: ${skippedCount} exercises (not in database)`);
  console.log(`❌ Errors: ${errorCount} exercises`);
  
  if (skippedCount > 0) {
    console.log("\n💡 To add the missing exercises:");
    console.log("1. Generate a workout plan that includes these exercises");
    console.log("2. Or manually add them to the database");
    console.log("3. Then run this script again");
  }
  
  process.exit(0);
}

// Run the upload
uploadInjuryData().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
