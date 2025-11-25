import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import injuryMatrixData from "../data/exercise_injury_matrix.json";

// Use the correct Convex URL
const CONVEX_URL = "https://reminiscent-owl-650.convex.cloud";

async function uploadInjuryData() {
  const convex = new ConvexHttpClient(CONVEX_URL);
  
  console.log("🏥 Starting injury data upload...");
  console.log(`📍 Using URL: ${CONVEX_URL}\n`);
  
  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  
  // Get all exercises from the database to verify they exist
  const existingExercises = await convex.query(api.queries.getAllExercises);
  const exerciseNames = new Set(existingExercises.map(ex => ex.exercise_name));
  
  console.log(`📋 Found ${existingExercises.length} exercises in database`);
  console.log(`🎯 Processing ${Object.keys(injuryMatrixData.injury_data).length} exercises for injury data\n`);
  
  for (const [exerciseName, data] of Object.entries(injuryMatrixData.injury_data)) {
    // Check if exercise exists
    if (!exerciseNames.has(exerciseName)) {
      console.log(`⏭️  Skipping ${exerciseName} - not in database`);
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
  
  if (successCount > 0) {
    console.log("\n🎉 Injury data has been added! The system is now injury-aware.");
    console.log("Users can manage their injuries in the Profile page.");
  }
  
  process.exit(0);
}

// Run the upload
uploadInjuryData().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
