import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import injuryMatrixData from "../data/exercise_injury_matrix.json";

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://humorous-ox-302.convex.cloud";

async function uploadInjuryData() {
  const convex = new ConvexClient(CONVEX_URL);
  
  console.log("🏥 Starting injury data upload...");
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [exerciseName, data] of Object.entries(injuryMatrixData.injury_data)) {
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
  console.log(`✅ Success: ${successCount} exercises`);
  console.log(`❌ Errors: ${errorCount} exercises`);
  
  process.exit(0);
}

// Run the upload
uploadInjuryData().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
