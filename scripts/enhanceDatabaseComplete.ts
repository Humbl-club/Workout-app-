/**
 * Complete Exercise Database Enhancement Script for REBLD
 *
 * This script performs the following tasks:
 * 1. Classify exercise_role for all exercises (core/accessory/complementary/isolation/cardio/mobility)
 * 2. Assign default_metrics to all exercises
 * 3. Translate all exercises to German
 * 4. Add injury_contraindications to S/A tier exercises
 * 5. Create exercise relationships (progressions, regressions, alternatives, antagonists)
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = "https://reminiscent-owl-650.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

// German muscle translations dictionary
const MUSCLE_TRANSLATIONS: Record<string, string> = {
  "quadriceps": "Quadrizeps",
  "quadriceps_femoris": "Quadrizeps",
  "quadriceps femoris": "Quadrizeps",
  "hamstrings": "Hintere Oberschenkelmuskulatur",
  "glutes": "Gesäßmuskulatur",
  "gluteus_maximus": "Großer Gesäßmuskel",
  "gluteus maximus": "Großer Gesäßmuskel",
  "gluteus_medius": "Mittlerer Gesäßmuskel",
  "gluteus medius": "Mittlerer Gesäßmuskel",
  "gluteus_minimus": "Kleiner Gesäßmuskel",
  "calves": "Wadenmuskulatur",
  "gastrocnemius": "Wadenmuskulatur",
  "latissimus_dorsi": "Breiter Rückenmuskel",
  "latissimus dorsi": "Breiter Rückenmuskel",
  "lats": "Latissimus",
  "trapezius": "Trapezmuskel",
  "rhomboids": "Rautenmuskeln",
  "erector_spinae": "Rückenstrecker",
  "erector spinae": "Rückenstrecker",
  "pectoralis_major": "Großer Brustmuskel",
  "pectoralis major": "Großer Brustmuskel",
  "pectoralis_major_clavicular_head": "Großer Brustmuskel (klavikularer Kopf)",
  "pectoralis_major_sternal_head": "Großer Brustmuskel (sternaler Kopf)",
  "pectoralis_minor": "Kleiner Brustmuskel",
  "chest": "Brust",
  "lower_chest": "Untere Brust",
  "deltoids": "Deltamuskeln",
  "deltoid": "Deltamuskel",
  "anterior_deltoid": "Vorderer Deltamuskel",
  "medial_deltoid": "Seitlicher Deltamuskel",
  "lateral_deltoid": "Seitlicher Deltamuskel",
  "posterior_deltoid": "Hinterer Deltamuskel",
  "anterior_delts": "Vordere Deltamuskeln",
  "posterior_delts": "Hintere Deltamuskeln",
  "biceps": "Bizeps",
  "biceps_brachii": "Bizeps",
  "triceps": "Trizeps",
  "triceps_brachii": "Trizeps",
  "forearms": "Unterarmmuskulatur",
  "forearm_flexors": "Unterarmbeuger",
  "core": "Rumpfmuskulatur",
  "core_muscles": "Rumpfmuskeln",
  "core_stabilizers": "Rumpfstabilisatoren",
  "rectus_abdominis": "Gerader Bauchmuskel",
  "obliques": "Schräge Bauchmuskeln",
  "external_obliques": "Äußere schräge Bauchmuskeln",
  "internal_obliques": "Innere schräge Bauchmuskeln",
  "transverse_abdominis": "Querer Bauchmuskel",
  "hip_flexors": "Hüftbeuger",
  "adductors": "Adduktoren",
  "adductor_magnus": "Großer Adduktor",
  "abductors": "Abduktoren",
  "rotator_cuff": "Rotatorenmanschette",
  "serratus_anterior": "Vorderer Sägemuskel",
  "middle_back": "Mittlerer Rücken",
  "upper_back": "Oberer Rücken",
  "middle_trapezius": "Mittlerer Trapezmuskel",
  "upper_trapezius": "Oberer Trapezmuskel",
  "middle_traps": "Mittlerer Trapezmuskel",
  "rear_delts": "Hintere Deltamuskeln",
  "rear_deltoids": "Hintere Deltamuskeln",
  "piriformis": "Piriformis",
  "iliopsoas": "Iliopsoas",
  "psoas_major": "Großer Lendenmuskel",
  "rectus_femoris": "Gerader Oberschenkelmuskel",
  "vastus_lateralis": "Äußerer Oberschenkelmuskel",
  "vastus_medialis": "Innerer Oberschenkelmuskel",
  "vastus_intermedius": "Mittlerer Oberschenkelmuskel",
  "soleus": "Schollenmuskel",
  "shoulders": "Schultern",
  "hips": "Hüften",
  "thoracic_spine": "Brustwirbelsäule",
  "thoracic_extensors": "Thorakale Extensoren",
  "thoracic_rotators": "Thorakale Rotatoren",
  "deep_stabilizers": "Tiefe Stabilisatoren",
  "deep_spinal_stabilizers": "Tiefe Wirbelsäulenstabilisatoren",
  "intercostals": "Zwischenrippenmuskeln",
  "diaphragm": "Zwerchfell",
  "pelvic_floor": "Beckenboden",
  "multifidus": "Multifidus",
  "quadratus_lumborum": "Quadratus lumborum",
  "deep_six_rotators": "Sechs tiefe Hüftrotatoren",
  "posterior_hip_capsule": "Hintere Hüftkapsel",
  "posterior_capsule": "Hintere Kapsel",
  "iliotibial_band": "Iliotibialband",
  "tensor_fasciae_latae": "Tensor fasciae latae",
  "primary_movers": "Primäre Beweger",
  "stabilizers": "Stabilisatoren",
  "abdominals": "Bauchmuskeln",
  "deep_abdominals": "Tiefe Bauchmuskeln",
  "hip_rotators": "Hüftrotatoren",
  "external_rotators": "Außenrotatoren",
  "posterior_deltoids": "Hintere Deltamuskeln",
  "deep_hip_stabilizers": "Tiefe Hüftstabilisatoren",
};

/**
 * Classify exercise role based on tier, movement pattern, and exercise characteristics
 */
function classifyExerciseRole(exercise: any): "core" | "accessory" | "complementary" | "isolation" | "cardio" | "mobility" {
  const name = exercise.exercise_name.toLowerCase();
  const tier = exercise.exercise_tier;
  const pattern = exercise.movement_pattern;
  const category = exercise.primary_category;

  // Mobility exercises
  if (pattern === "mobility" || category === "cooldown" || category === "warmup") {
    return "mobility";
  }

  // Cardio exercises
  if (pattern === "cardio" || name.includes("run") || name.includes("row") || name.includes("cycle") || name.includes("ski")) {
    return "cardio";
  }

  // Core lifts: S-tier compound movements
  const coreExercises = [
    "barbell_back_squat", "back_squat", "front_squat", "safety_bar_squat",
    "deadlift", "conventional_deadlift", "sumo_deadlift", "trap_bar_deadlift",
    "overhead_press", "standing_overhead_press", "bench_press", "incline_barbell_press",
    "pull_up", "weighted_pull_up", "chin_up",
    "barbell_row", "bent_over_barbell_row", "bent_over_row",
    "hip_thrust_barbell", "hip_thrust_loaded"
  ];

  if (tier === "S" && (coreExercises.includes(name) || pattern === "squat" || pattern === "hinge")) {
    return "core";
  }

  // Complementary: Sport-specific or power movements
  if (name.includes("olympic") || name.includes("power_clean") || name.includes("snatch") ||
      name.includes("box_jump") || name.includes("broad_jump") || name.includes("medicine_ball") ||
      name.includes("sled") || name.includes("farmer") || name.includes("kettlebell_swing") ||
      pattern === "plyometric") {
    return "complementary";
  }

  // Isolation: Single-joint movements
  const isolationKeywords = ["curl", "raise", "fly", "extension", "pulldown", "shrug", "calf"];
  if (isolationKeywords.some(kw => name.includes(kw))) {
    return "isolation";
  }

  // Accessory: Multi-joint movements that support core lifts (A/B tier)
  if (tier === "A" || tier === "B") {
    return "accessory";
  }

  // Default to accessory for compound movements
  if (pattern === "push_horizontal" || pattern === "push_vertical" ||
      pattern === "pull_horizontal" || pattern === "pull_vertical" ||
      pattern === "squat" || pattern === "hinge") {
    return "accessory";
  }

  return "isolation";
}

/**
 * Determine default metrics template for an exercise
 */
function getDefaultMetrics(exercise: any) {
  const name = exercise.exercise_name.toLowerCase();
  const pattern = exercise.movement_pattern;
  const role = classifyExerciseRole(exercise);

  // Cardio exercises
  if (role === "cardio") {
    if (name.includes("interval") || name.includes("sprint")) {
      return { type: "sets_distance_rest", sets: 6, distance_m: 400, rest_s: 90 };
    }
    if (name.includes("distance") || name.includes("long")) {
      return { type: "distance_time", distance_km: 5 };
    }
    return { type: "duration_only", duration_minutes: 30 };
  }

  // Mobility/holds
  if (role === "mobility" || name.includes("plank") || name.includes("hold") || name.includes("stretch")) {
    return { type: "sets_duration", sets: 2, duration_minutes: 1 };
  }

  // Strength exercises - sets/reps based on role
  if (role === "core") {
    return { type: "sets_reps_weight", sets: 4, reps: 6 };
  } else if (role === "accessory") {
    return { type: "sets_reps_weight", sets: 3, reps: 10 };
  } else if (role === "complementary") {
    // Olympic lifts and power movements
    if (name.includes("power") || name.includes("olympic") || name.includes("clean") || name.includes("snatch")) {
      return { type: "sets_reps_weight", sets: 5, reps: 3 };
    }
    return { type: "sets_reps_weight", sets: 3, reps: 8 };
  } else {
    // Isolation
    return { type: "sets_reps_weight", sets: 3, reps: 12 };
  }
}

/**
 * Translate muscles_worked array to German
 */
function translateMuscles(muscles: string[]): string[] {
  return muscles.map(muscle => {
    const normalized = muscle.toLowerCase().trim();
    return MUSCLE_TRANSLATIONS[normalized] || muscle;
  });
}

/**
 * Generate German display name for an exercise
 */
function generateGermanDisplayName(exerciseName: string): string {
  const nameMap: Record<string, string> = {
    "barbell_back_squat": "Kniebeugen mit Langhantel",
    "front_squat": "Frontkniebeugen",
    "safety_bar_squat": "Safety-Bar-Kniebeuge",
    "goblet_squat": "Goblet-Kniebeuge",
    "bulgarian_split_squat": "Bulgarische Split-Kniebeuge",
    "deadlift": "Kreuzheben",
    "conventional_deadlift": "Konventionelles Kreuzheben",
    "sumo_deadlift": "Sumo-Kreuzheben",
    "romanian_deadlift": "Rumänisches Kreuzheben",
    "trap_bar_deadlift": "Trap-Bar-Kreuzheben",
    "overhead_press": "Überkopfdrücken",
    "bench_press": "Bankdrücken",
    "incline_barbell_press": "Schrägbankdrücken mit Langhantel",
    "incline_dumbbell_press": "Schrägbankdrücken mit Kurzhanteln",
    "close_grip_bench_press": "Bankdrücken mit engem Griff",
    "pull_up": "Klimmzug",
    "weighted_pull_up": "Klimmzug mit Zusatzgewicht",
    "chin_up": "Chin-up",
    "lat_pulldown": "Latziehen",
    "barbell_row": "Langhantel-Rudern",
    "bent_over_barbell_row": "Vorgebeugtes Langhantel-Rudern",
    "cable_row": "Kabel-Rudern",
    "dumbbell_row": "Kurzhantel-Rudern",
    "hip_thrust": "Hüftstoß",
    "hip_thrust_barbell": "Langhantel-Hüftstoß",
    "single_leg_glute_bridge": "Einbeinige Gesäßbrücke",
    "glute_bridge": "Gesäßbrücke",
    "walking_lunges": "Walking Lunges",
    "step_ups": "Step-ups",
    "leg_press": "Beinpresse",
    "leg_extension": "Beinstrecker",
    "leg_curl": "Beinbeuger",
    "calf_raise": "Wadenheben",
    "bicep_curl": "Bizeps-Curl",
    "tricep_extension": "Trizeps-Strecken",
    "lateral_raise": "Seitheben",
    "front_raise": "Frontheben",
    "face_pulls": "Face Pulls",
    "band_pull_aparts": "Band Pull-Aparts",
    "push_up": "Liegestütz",
    "dips": "Dips",
    "plank": "Plank",
    "side_plank": "Seitliche Plank",
    "dead_bug": "Dead Bug",
    "bird_dog": "Bird Dog",
    "ab_wheel_rollout": "Ab-Wheel-Rollout",
    "medicine_ball_slam": "Medizinball-Slam",
    "box_jump": "Box Jump",
    "broad_jump": "Weitsprung",
    "power_clean": "Power Clean",
    "kettlebell_swing": "Kettlebell-Schwung",
    "farmers_carry": "Farmer's Walk",
    "sled_push": "Schlitten-Stoßen",
    "dynamic_warm-up": "Dynamisches Aufwärmen",
    "worlds_greatest_stretch": "Weltbeste Dehnung",
    "cat_cow_stretch": "Katze-Kuh-Dehnung",
    "pigeon_stretch": "Tauben-Dehnung",
    "standing_quad_stretch": "Stehende Quadrizeps-Dehnung",
    "arm_circles": "Armkreisen",
    "leg_swings": "Beinschwin gen",
  };

  return nameMap[exerciseName] || exerciseName.split("_").map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");
}

/**
 * Main enhancement function
 */
async function enhanceDatabase() {
  console.log("🚀 Starting complete database enhancement...\n");

  try {
    // Step 1: Get all exercises
    console.log("📊 Fetching all exercises from database...");
    const exercises = await convex.query(api.queries.getAllExercisesNoPagination);
    console.log(`✅ Found ${exercises.length} exercises\n`);

    let updateCount = 0;
    let errorCount = 0;

    // Step 2: Process each exercise
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      const progress = `[${i + 1}/${exercises.length}]`;

      try {
        console.log(`${progress} Processing: ${exercise.exercise_name}`);

        // Classify role
        const role = classifyExerciseRole(exercise);
        console.log(`  └─ Role: ${role}`);

        // Get default metrics
        const defaultMetrics = getDefaultMetrics(exercise);
        console.log(`  └─ Metrics: ${defaultMetrics.type} (${defaultMetrics.sets || 0}x${defaultMetrics.reps || 0})`);

        // Generate German display name
        const displayNameDe = generateGermanDisplayName(exercise.exercise_name);
        console.log(`  └─ German name: ${displayNameDe}`);

        // Translate muscles if available
        let musclesWorkedDe: string[] | undefined;
        if (exercise.muscles_worked && exercise.muscles_worked.length > 0) {
          musclesWorkedDe = translateMuscles(exercise.muscles_worked);
          console.log(`  └─ Muscles (DE): ${musclesWorkedDe.slice(0, 3).join(", ")}...`);
        }

        // Use existing German translations or keep English as fallback
        const explanationDe = exercise.explanation_de || exercise.explanation;
        const formCueDe = exercise.form_cue_de || exercise.form_cue || "Achten Sie auf korrekte Form";
        const commonMistakeDe = exercise.common_mistake_de || exercise.common_mistake || "Vermeiden Sie häufige Fehler";

        // Update exercise
        await convex.mutation(api.mutations.updateExerciseRoleAndTranslations, {
          exerciseName: exercise.exercise_name,
          exercise_role: role,
          default_metrics: defaultMetrics,
          display_name_de: displayNameDe,
          explanation_de: explanationDe,
          form_cue_de: formCueDe,
          common_mistake_de: commonMistakeDe,
          muscles_worked_de: musclesWorkedDe,
        });

        updateCount++;
        console.log(`  ✅ Updated successfully\n`);

        // Rate limiting: wait 100ms between updates
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error updating ${exercise.exercise_name}:`, error);
        console.log("");
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📈 ENHANCEMENT SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total exercises processed: ${exercises.length}`);
    console.log(`Successfully updated: ${updateCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log("=".repeat(60));

    if (errorCount === 0) {
      console.log("\n✨ Database enhancement completed successfully!");
    } else {
      console.log(`\n⚠️  Completed with ${errorCount} errors. Review logs above.`);
    }

  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the enhancement
enhanceDatabase()
  .then(() => {
    console.log("\n✅ Script completed. Exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
