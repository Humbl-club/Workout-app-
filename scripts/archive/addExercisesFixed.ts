import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Use the correct Convex URL that other scripts are using
const CONVEX_URL = "https://reminiscent-owl-650.convex.cloud";

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

async function addExercises() {
  const convex = new ConvexHttpClient(CONVEX_URL);
  
  console.log("💪 Adding exercises to Convex database...");
  console.log(`📍 Using URL: ${CONVEX_URL}\n`);
  
  let successCount = 0;
  let skipCount = 0;
  
  for (const exercise of exercisesToAdd) {
    try {
      await convex.mutation(api.mutations.cacheExerciseExplanation, {
        exerciseName: exercise.exercise_name,
        explanation: exercise.explanation,
        muscles_worked: exercise.muscles_worked,
        form_cue: exercise.form_cue,
        common_mistake: exercise.common_mistake,
        source: "gemini_api",
      });
      
      console.log(`✅ Added ${exercise.exercise_name}`);
      successCount++;
      
    } catch (error: any) {
      if (error.toString().includes("already exists")) {
        console.log(`⏭️  ${exercise.exercise_name} already exists`);
        skipCount++;
      } else {
        console.error(`❌ Error adding ${exercise.exercise_name}:`, error.toString());
      }
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Added: ${successCount} exercises`);
  console.log(`⏭️  Skipped: ${skipCount} exercises`);
  console.log(`📋 Total: ${exercisesToAdd.length} exercises`);
  
  if (successCount > 0 || skipCount === exercisesToAdd.length) {
    console.log("\n🎯 Exercises are ready! Now you can run the injury data upload.");
  }
  
  process.exit(0);
}

// Run the script
addExercises().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
