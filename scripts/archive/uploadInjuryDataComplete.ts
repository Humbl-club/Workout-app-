import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = "https://reminiscent-owl-650.convex.cloud";

// Complete sport ratings with all required fields
const exerciseData = {
  "barbell_back_squat": {
    sport_ratings: {
      boxing: 5,
      hyrox: 8,
      rock_climbing: 6,
      basketball: 9,
      soccer: 8,
      tennis: 7,
      running: 7,
      swimming: 5,
      cycling: 6,
      general_fitness: 9
    }
  },
  "pull_up": {
    sport_ratings: {
      boxing: 7,
      hyrox: 6,
      rock_climbing: 10,
      basketball: 6,
      soccer: 5,
      tennis: 6,
      running: 4,
      swimming: 8,
      cycling: 3,
      general_fitness: 8
    }
  },
  "plank": {
    sport_ratings: {
      boxing: 8,
      hyrox: 7,
      rock_climbing: 8,
      basketball: 7,
      soccer: 7,
      tennis: 7,
      running: 8,
      swimming: 7,
      cycling: 7,
      general_fitness: 9
    }
  },
  "bench_press": {
    sport_ratings: {
      boxing: 8,
      hyrox: 5,
      rock_climbing: 4,
      basketball: 6,
      soccer: 5,
      tennis: 6,
      running: 3,
      swimming: 5,
      cycling: 3,
      general_fitness: 8
    }
  },
  "deadlift": {
    sport_ratings: {
      boxing: 6,
      hyrox: 8,
      rock_climbing: 7,
      basketball: 7,
      soccer: 7,
      tennis: 7,
      running: 6,
      swimming: 5,
      cycling: 5,
      general_fitness: 9
    }
  }
};

async function uploadSportRatings() {
  const convex = new ConvexHttpClient(CONVEX_URL);
  
  console.log("⭐ Updating sport ratings with complete data...\n");
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [exerciseName, data] of Object.entries(exerciseData)) {
    try {
      await convex.mutation(api.sportBucketMutations.updateExerciseSportRatings, {
        exercise_name: exerciseName,
        sport_ratings: data.sport_ratings,
      });
      
      console.log(`✅ Updated sport ratings for ${exerciseName}`);
      successCount++;
      
    } catch (error: any) {
      console.error(`❌ Error updating ${exerciseName}:`, error.message);
      errorCount++;
    }
  }
  
  console.log("\n📊 Sport Ratings Update Complete:");
  console.log(`✅ Success: ${successCount} exercises`);
  console.log(`❌ Errors: ${errorCount} exercises`);
  
  if (successCount > 0) {
    console.log("\n🎉 Sport ratings have been added!");
    console.log("The system now knows which exercises are best for each sport.");
  }
  
  process.exit(0);
}

// Run the upload
uploadSportRatings().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
