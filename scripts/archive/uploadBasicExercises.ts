/**
 * Upload Basic Exercise Set
 * Start with high-quality exercises that work with current schema
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const basicExercises = [
  {
    exercise_name: "barbell_back_squat",
    explanation: "The barbell back squat is a fundamental compound movement that targets the quadriceps, glutes, and hamstrings while engaging the core for stability. Performed with a barbell positioned on the upper back, this exercise involves descending into a squat position and returning to standing. It's considered the king of lower body exercises due to its ability to build overall strength, power, and muscle mass.",
    muscles_worked: ["quadriceps", "glutes", "hamstrings", "calves", "core", "upper_back"],
    form_cue: "Drive through your heels and keep your chest up throughout the movement",
    common_mistake: "Allowing knees to cave inward or leaning too far forward",
    source: "scientific_textbooks"
  },
  {
    exercise_name: "deadlift",
    explanation: "The deadlift is a hip-hinge movement that involves lifting a loaded barbell from the floor to hip level. It primarily targets the posterior chain including glutes, hamstrings, and erector spinae while engaging the lats, traps, and core. Often called the most functional exercise, it mimics real-world lifting patterns and builds tremendous strength and power.",
    muscles_worked: ["glutes", "hamstrings", "erector_spinae", "lats", "traps", "core"],
    form_cue: "Keep the bar close to your body and drive your hips forward",
    common_mistake: "Rounding the back or letting the bar drift away from the body",
    source: "scientific_textbooks"
  },
  {
    exercise_name: "pull_up",
    explanation: "The pull-up is a bodyweight exercise performed by hanging from a bar and pulling the body up until the chin clears the bar. It primarily targets the latissimus dorsi, rhomboids, and biceps while engaging the core for stability. This exercise is excellent for developing upper body pulling strength.",
    muscles_worked: ["lats", "rhomboids", "biceps", "rear_delts", "core"],
    form_cue: "Pull your chest to the bar and control the descent",
    common_mistake: "Using momentum or not achieving full range of motion",
    source: "scientific_textbooks"
  },
  {
    exercise_name: "push_up",
    explanation: "The push-up is a fundamental bodyweight exercise that targets the chest, shoulders, and triceps while engaging the core for stability. Performed in a plank position, it involves lowering the body to the ground and pressing back up.",
    muscles_worked: ["chest", "anterior_delts", "triceps", "core"],
    form_cue: "Keep your body in a straight line from head to heels",
    common_mistake: "Sagging hips or flaring elbows too wide",
    source: "scientific_textbooks"
  },
  {
    exercise_name: "overhead_press",
    explanation: "The overhead press is a standing exercise that involves pressing a barbell or dumbbells from shoulder level to overhead. It primarily targets the shoulders and triceps while engaging the core for stability.",
    muscles_worked: ["anterior_delts", "medial_delts", "triceps", "core", "upper_back"],
    form_cue: "Drive the weight straight up and slightly back, finishing over your ears",
    common_mistake: "Pressing forward instead of up or arching the back excessively",
    source: "scientific_textbooks"
  },
  {
    exercise_name: "hip_thrust",
    explanation: "The hip thrust is a glute-focused exercise performed with the upper back supported on a bench and feet planted on the ground. A barbell is positioned across the hips, and the movement involves driving the hips up to create a straight line from knees to shoulders.",
    muscles_worked: ["glutes", "hamstrings", "core"],
    form_cue: "Squeeze your glutes at the top and pause briefly",
    common_mistake: "Overextending the back or not fully engaging the glutes",
    source: "scientific_textbooks"
  },
  {
    exercise_name: "bulgarian_split_squat",
    explanation: "The Bulgarian split squat is a single-leg exercise performed with the rear foot elevated on a bench or platform. This unilateral movement primarily targets the quadriceps and glutes while challenging balance and stability.",
    muscles_worked: ["quadriceps", "glutes", "hamstrings", "calves", "core"],
    form_cue: "Keep most of your weight on your front leg and drive up through your heel",
    common_mistake: "Putting too much weight on the back leg or leaning forward",
    source: "scientific_textbooks"
  },
  {
    exercise_name: "worlds_greatest_stretch",
    explanation: "The World's Greatest Stretch is a comprehensive mobility exercise that combines a lunge position with thoracic spine rotation and hip flexor stretching. This movement addresses multiple areas of tightness simultaneously, including hip flexors, thoracic spine, and shoulders.",
    muscles_worked: ["hip_flexors", "thoracic_spine", "shoulders", "glutes"],
    form_cue: "Hold each position for 2-3 seconds and feel the stretch through multiple areas",
    common_mistake: "Rushing through the movement or not maintaining proper lunge position",
    source: "scientific_textbooks"
  },
  {
    exercise_name: "cat_cow_stretch",
    explanation: "The cat-cow stretch is performed on hands and knees, alternating between arching the back (cow) and rounding it (cat). This mobility exercise improves spinal flexibility, activates the core muscles, and helps establish proper spinal movement patterns.",
    muscles_worked: ["erector_spinae", "core", "hip_flexors"],
    form_cue: "Move slowly and deliberately, feeling each vertebra",
    common_mistake: "Moving too quickly or not using full range of motion",
    source: "scientific_textbooks"
  },
  {
    exercise_name: "band_pull_aparts",
    explanation: "Band pull-aparts are performed by holding a resistance band with arms extended and pulling the band apart by squeezing the shoulder blades together. This exercise activates the posterior deltoids, rhomboids, and middle trapezius.",
    muscles_worked: ["posterior_delts", "rhomboids", "middle_traps"],
    form_cue: "Keep your arms straight and focus on squeezing your shoulder blades",
    common_mistake: "Using the arms instead of the back muscles",
    source: "scientific_textbooks"
  }
];

async function uploadBasicExercises() {
  const convex = new ConvexHttpClient("https://reminiscent-owl-650.convex.cloud");
  
  console.log('🚀 UPLOADING HIGH-QUALITY EXERCISE SET');
  console.log(`📊 Total: ${basicExercises.length} exercises`);
  
  let successCount = 0;
  let failureCount = 0;

  for (const exercise of basicExercises) {
    try {
      await convex.mutation(api.mutations.cacheExerciseExplanation, {
        exerciseName: exercise.exercise_name,
        explanation: exercise.explanation,
        muscles_worked: exercise.muscles_worked,
        form_cue: exercise.form_cue,
        common_mistake: exercise.common_mistake,
        source: exercise.source as any,
      });
      
      successCount++;
      console.log(`✅ ${exercise.exercise_name}`);
      
    } catch (error: any) {
      failureCount++;
      console.error(`❌ ${exercise.exercise_name}: ${error.message}`);
    }
  }

  console.log('\n🎉 UPLOAD COMPLETE!');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  
  if (successCount > 0) {
    console.log('\n🧠 Database now contains research-backed exercises!');
    console.log('🎯 Try creating a workout plan to test the intelligence');
  }
}

uploadBasicExercises().catch(console.error);
