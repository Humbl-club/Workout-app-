import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://humorous-ox-302.convex.cloud";

// Just the exercises we need for injury data
const exercisesToAdd = [
  {
    exercise_name: "barbell_back_squat",
    explanation: "Compound lower body exercise with barbell on upper back. Fundamental for leg and glute development.",
    muscles_worked: ["quadriceps", "glutes", "hamstrings", "core"],
    form_cue: "Chest up, knees over toes, drive through heels",
    common_mistake: "Knees caving or excessive forward lean"
  },
  {
    exercise_name: "pull_up",
    explanation: "Pull yourself up to a bar. Excellent for back and bicep development.",
    muscles_worked: ["lats", "biceps", "middle_back"],
    form_cue: "Full hang to chin over bar",
    common_mistake: "Incomplete range of motion"
  },
  {
    exercise_name: "plank",
    explanation: "Isometric core hold. Fundamental for core stability.",
    muscles_worked: ["core", "abs", "lower_back"],
    form_cue: "Straight line head to heels",
    common_mistake: "Hips sagging or too high"
  },
  {
    exercise_name: "bench_press",
    explanation: "Press barbell from chest. Primary chest builder.",
    muscles_worked: ["chest", "shoulders", "triceps"],
    form_cue: "Shoulder blades back, controlled descent",
    common_mistake: "Bouncing or excessive elbow flare"
  },
  {
    exercise_name: "deadlift",
    explanation: "Lift loaded barbell from floor. Full posterior chain.",
    muscles_worked: ["hamstrings", "glutes", "back", "traps"],
    form_cue: "Neutral spine, hips and shoulders together",
    common_mistake: "Rounding back"
  }
];

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function addExercisesWithRetry() {
  console.log("💪 Adding exercises with retry logic...\n");
  
  let convex: ConvexClient | null = null;
  let retries = 0;
  const maxRetries = 3;
  
  // Try to establish connection
  while (retries < maxRetries && !convex) {
    try {
      convex = new ConvexClient(CONVEX_URL);
      console.log("✅ Connected to Convex");
      break;
    } catch (error) {
      retries++;
      console.log(`⚠️ Connection attempt ${retries} failed, retrying...`);
      await sleep(2000 * retries); // Exponential backoff
    }
  }
  
  if (!convex) {
    console.error("❌ Could not connect to Convex after 3 attempts");
    process.exit(1);
  }
  
  let successCount = 0;
  
  // Add exercises one by one with delays
  for (const exercise of exercisesToAdd) {
    console.log(`\n🔄 Adding ${exercise.exercise_name}...`);
    
    let added = false;
    let exerciseRetries = 0;
    
    while (exerciseRetries < 3 && !added) {
      try {
        await convex.mutation(api.mutations.cacheExerciseExplanation, {
          exerciseName: exercise.exercise_name,
          explanation: exercise.explanation,
          muscles_worked: exercise.muscles_worked,
          form_cue: exercise.form_cue,
          common_mistake: exercise.common_mistake,
          source: "gemini_api" as const,
        });
        
        console.log(`✅ Successfully added ${exercise.exercise_name}`);
        successCount++;
        added = true;
        
        // Wait between exercises
        await sleep(1000);
        
      } catch (error: any) {
        exerciseRetries++;
        if (error.message?.includes("WebSocket")) {
          console.log(`⚠️ Connection issue, retry ${exerciseRetries}/3...`);
          await sleep(2000 * exerciseRetries);
        } else {
          console.error(`❌ Error: ${error.message}`);
          break; // Don't retry non-connection errors
        }
      }
    }
  }
  
  console.log(`\n✅ Added ${successCount}/${exercisesToAdd.length} exercises`);
  
  if (successCount === exercisesToAdd.length) {
    console.log("\n🎯 Now you can run the injury data upload!");
    console.log("Run: npx tsx scripts/uploadInjuryDataSafe.ts");
  }
  
  process.exit(0);
}

// Run with error handling
addExercisesWithRetry().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
