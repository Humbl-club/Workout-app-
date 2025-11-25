import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://humorous-ox-302.convex.cloud";

// Basic exercises from our injury matrix
const basicExercises = [
  {
    exercise_name: "barbell_back_squat",
    explanation: "A compound lower body exercise where you place a barbell on your upper back and squat down. Primary exercise for leg and glute development.",
    muscles_worked: ["quadriceps", "glutes", "hamstrings", "core"],
    form_cue: "Keep chest up, knees tracking over toes, drive through heels",
    common_mistake: "Knees caving inward or excessive forward lean",
    source: "gemini_api" as const
  },
  {
    exercise_name: "pull_up",
    explanation: "A compound upper body exercise where you pull yourself up to a bar. Excellent for back and bicep development.",
    muscles_worked: ["latissimus_dorsi", "biceps", "middle_back", "rear_delts"],
    form_cue: "Full hang at bottom, pull until chin over bar, control the descent",
    common_mistake: "Not using full range of motion or kipping excessively",
    source: "gemini_api" as const
  },
  {
    exercise_name: "plank",
    explanation: "An isometric core exercise where you hold your body in a straight line. Fundamental for core stability.",
    muscles_worked: ["rectus_abdominis", "transverse_abdominis", "obliques", "lower_back"],
    form_cue: "Maintain straight line from head to heels, breathe normally",
    common_mistake: "Hips sagging or raised too high",
    source: "gemini_api" as const
  },
  {
    exercise_name: "bench_press",
    explanation: "A compound upper body exercise where you press a barbell from your chest. Primary exercise for chest development.",
    muscles_worked: ["pectorals", "anterior_deltoids", "triceps"],
    form_cue: "Maintain arch, shoulder blades pulled back, press in slight arc",
    common_mistake: "Bouncing bar off chest or flaring elbows excessively",
    source: "gemini_api" as const
  },
  {
    exercise_name: "deadlift",
    explanation: "A compound full-body exercise where you lift a loaded barbell from the floor. Works entire posterior chain.",
    muscles_worked: ["hamstrings", "glutes", "erector_spinae", "traps", "lats"],
    form_cue: "Maintain neutral spine, push floor away, hips and shoulders rise together",
    common_mistake: "Rounding back or bar drifting away from body",
    source: "gemini_api" as const
  }
];

async function addBasicExercises() {
  const convex = new ConvexClient(CONVEX_URL);
  
  console.log("💪 Adding basic exercises for injury data...\n");
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const exercise of basicExercises) {
    try {
      await convex.mutation(api.mutations.cacheExerciseExplanation, {
        exerciseName: exercise.exercise_name,
        explanation: exercise.explanation,
        muscles_worked: exercise.muscles_worked,
        form_cue: exercise.form_cue,
        common_mistake: exercise.common_mistake,
        source: exercise.source,
      });
      
      console.log(`✅ Added ${exercise.exercise_name}`);
      successCount++;
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        console.log(`⏭️  ${exercise.exercise_name} already exists`);
      } else {
        console.error(`❌ Error adding ${exercise.exercise_name}:`, error.message);
        errorCount++;
      }
    }
  }
  
  console.log("\n📊 Exercise Addition Complete:");
  console.log(`✅ Success: ${successCount} exercises added`);
  console.log(`❌ Errors: ${errorCount} exercises`);
  console.log("\n🎯 Now you can run the injury data upload script!");
  
  process.exit(0);
}

// Run the script
addBasicExercises().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
