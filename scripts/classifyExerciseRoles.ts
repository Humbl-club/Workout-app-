/**
 * Classify Exercise Roles Script
 *
 * Assigns exercise_role to all exercises in the database:
 * - core: Fundamental compound movements (Squat, Bench, Deadlift, Row, OHP, Pull-up)
 * - accessory: Support lifts for weak points (DB Fly, Leg Curl, Tricep Extensions)
 * - complementary: Sport-specific additions (Sled Push, Farmer Carry, Box Jump)
 * - isolation: Single muscle focus, finishers (Bicep Curl, Lateral Raise, Calf Raise)
 * - cardio: Cardiovascular/conditioning (Running, Cycling, SkiErg, Rowing)
 * - mobility: Movement prep and recovery (Stretches, Foam Rolling, CARs)
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Exercise role classification rules
const ROLE_CLASSIFICATIONS: Record<string, {
  exercise_role: "core" | "accessory" | "complementary" | "isolation" | "cardio" | "mobility";
  display_name_de?: string;
}> = {
  // ==================== CORE EXERCISES (Fundamental compounds) ====================
  barbell_back_squat: { exercise_role: "core", display_name_de: "Kniebeugen mit Langhantel" },
  barbell_back_squat_competition: { exercise_role: "core", display_name_de: "Wettkampf-Kniebeugen" },
  front_squat: { exercise_role: "core", display_name_de: "Frontkniebeugen" },
  front_squat_olympic_style: { exercise_role: "core", display_name_de: "Olympische Frontkniebeugen" },
  conventional_deadlift: { exercise_role: "core", display_name_de: "Konventionelles Kreuzheben" },
  conventional_deadlift_competition: { exercise_role: "core", display_name_de: "Wettkampf-Kreuzheben" },
  sumo_deadlift: { exercise_role: "core", display_name_de: "Sumo-Kreuzheben" },
  bench_press: { exercise_role: "core", display_name_de: "Bankdrücken" },
  bench_press_competition: { exercise_role: "core", display_name_de: "Wettkampf-Bankdrücken" },
  overhead_press: { exercise_role: "core", display_name_de: "Schulterdrücken" },
  overhead_press_standing: { exercise_role: "core", display_name_de: "Stehendes Schulterdrücken" },
  pull_up: { exercise_role: "core", display_name_de: "Klimmzug" },
  barbell_row: { exercise_role: "core", display_name_de: "Langhantelrudern" },
  pendlay_row: { exercise_role: "core", display_name_de: "Pendlay-Rudern" },
  hip_thrust: { exercise_role: "core", display_name_de: "Hüftstoß" },
  romanian_deadlift: { exercise_role: "core", display_name_de: "Rumänisches Kreuzheben" },

  // ==================== ACCESSORY EXERCISES (Support lifts) ====================
  dumbbell_bench_press: { exercise_role: "accessory", display_name_de: "Kurzhantel-Bankdrücken" },
  incline_barbell_press: { exercise_role: "accessory", display_name_de: "Schrägbankdrücken" },
  incline_dumbbell_press: { exercise_role: "accessory", display_name_de: "Kurzhantel-Schrägbankdrücken" },
  dumbbell_fly: { exercise_role: "accessory", display_name_de: "Kurzhantel-Fliegende" },
  cable_fly: { exercise_role: "accessory", display_name_de: "Kabelzug-Fliegende" },
  lat_pulldown: { exercise_role: "accessory", display_name_de: "Latzug" },
  cable_row: { exercise_role: "accessory", display_name_de: "Kabelrudern" },
  dumbbell_row: { exercise_role: "accessory", display_name_de: "Kurzhantelrudern" },
  leg_press: { exercise_role: "accessory", display_name_de: "Beinpresse" },
  hack_squat: { exercise_role: "accessory", display_name_de: "Hackenschmidt-Kniebeuge" },
  leg_curl: { exercise_role: "accessory", display_name_de: "Beincurls" },
  leg_extension: { exercise_role: "accessory", display_name_de: "Beinstrecker" },
  face_pull: { exercise_role: "accessory", display_name_de: "Face Pull" },
  tricep_pushdown: { exercise_role: "accessory", display_name_de: "Trizepsdrücken am Kabel" },
  tricep_extension: { exercise_role: "accessory", display_name_de: "Trizepsstrecker" },
  close_grip_bench_press: { exercise_role: "accessory", display_name_de: "Enges Bankdrücken" },
  push_press: { exercise_role: "accessory", display_name_de: "Push Press" },
  push_press_explosive: { exercise_role: "accessory", display_name_de: "Explosives Push Press" },
  bulgarian_split_squat: { exercise_role: "accessory", display_name_de: "Bulgarische Kniebeuge" },
  walking_lunge: { exercise_role: "accessory", display_name_de: "Ausfallschritte" },
  goblet_squat: { exercise_role: "accessory", display_name_de: "Goblet Squat" },
  goblet_squat_deep: { exercise_role: "accessory", display_name_de: "Tiefe Goblet Squat" },
  single_leg_rdl: { exercise_role: "accessory", display_name_de: "Einbeiniges Rumänisches Kreuzheben" },
  good_morning: { exercise_role: "accessory", display_name_de: "Good Morning" },
  glute_bridge: { exercise_role: "accessory", display_name_de: "Glute Bridge" },

  // ==================== COMPLEMENTARY (Sport-specific) ====================
  sled_push: { exercise_role: "complementary", display_name_de: "Schlittendrücken" },
  sled_pull: { exercise_role: "complementary", display_name_de: "Schlittenziehen" },
  farmer_carry: { exercise_role: "complementary", display_name_de: "Farmers Walk" },
  farmer_carries: { exercise_role: "complementary", display_name_de: "Farmers Walk" },
  wall_ball: { exercise_role: "complementary", display_name_de: "Wall Ball" },
  box_jump: { exercise_role: "complementary", display_name_de: "Kastensprung" },
  depth_jump: { exercise_role: "complementary", display_name_de: "Tiefsprung" },
  medicine_ball_slam: { exercise_role: "complementary", display_name_de: "Medizinballwürfe" },
  medicine_ball_throw: { exercise_role: "complementary", display_name_de: "Medizinballwurf" },
  kettlebell_swing: { exercise_role: "complementary", display_name_de: "Kettlebell Swing" },
  turkish_get_up: { exercise_role: "complementary", display_name_de: "Turkish Get-Up" },
  battle_ropes: { exercise_role: "complementary", display_name_de: "Battle Ropes" },
  burpee: { exercise_role: "complementary", display_name_de: "Burpees" },
  burpee_broad_jump: { exercise_role: "complementary", display_name_de: "Burpee mit Weitsprung" },
  thruster: { exercise_role: "complementary", display_name_de: "Thrusters" },
  clean_and_jerk: { exercise_role: "complementary", display_name_de: "Stoßen" },
  snatch: { exercise_role: "complementary", display_name_de: "Reißen" },
  power_clean: { exercise_role: "complementary", display_name_de: "Power Clean" },
  hang_clean: { exercise_role: "complementary", display_name_de: "Hang Clean" },
  lateral_bound: { exercise_role: "complementary", display_name_de: "Seitlicher Sprung" },
  nordic_hamstring_curl: { exercise_role: "complementary", display_name_de: "Nordic Hamstring Curl" },

  // ==================== ISOLATION (Single muscle) ====================
  bicep_curl: { exercise_role: "isolation", display_name_de: "Bizepscurl" },
  dumbbell_curl: { exercise_role: "isolation", display_name_de: "Kurzhantel-Bizepscurl" },
  hammer_curl: { exercise_role: "isolation", display_name_de: "Hammercurls" },
  preacher_curl: { exercise_role: "isolation", display_name_de: "Scott-Curls" },
  lateral_raise: { exercise_role: "isolation", display_name_de: "Seitheben" },
  front_raise: { exercise_role: "isolation", display_name_de: "Frontheben" },
  rear_delt_fly: { exercise_role: "isolation", display_name_de: "Reverse Flys" },
  calf_raise: { exercise_role: "isolation", display_name_de: "Wadenheben" },
  calf_raises: { exercise_role: "isolation", display_name_de: "Wadenheben" },
  wrist_curl: { exercise_role: "isolation", display_name_de: "Handgelenkscurls" },
  shrug: { exercise_role: "isolation", display_name_de: "Schulterheben" },
  ab_crunch: { exercise_role: "isolation", display_name_de: "Bauchpressen" },
  russian_twist: { exercise_role: "isolation", display_name_de: "Russian Twist" },

  // ==================== CARDIO (Cardiovascular) ====================
  long_run: { exercise_role: "cardio", display_name_de: "Langer Lauf" },
  tempo_run: { exercise_role: "cardio", display_name_de: "Tempolauf" },
  easy_run: { exercise_role: "cardio", display_name_de: "Lockerer Lauf" },
  interval_run_400m: { exercise_role: "cardio", display_name_de: "400m-Intervalle" },
  race_pace_run: { exercise_role: "cardio", display_name_de: "Wettkampftempo-Lauf" },
  swimming_endurance: { exercise_role: "cardio", display_name_de: "Ausdauerschwimmen" },
  cycling_endurance: { exercise_role: "cardio", display_name_de: "Ausdauerradfahren" },
  rowing_cardio: { exercise_role: "cardio", display_name_de: "Rudern (Cardio)" },
  skierg_cardio: { exercise_role: "cardio", display_name_de: "SkiErg" },
  assault_bike: { exercise_role: "cardio", display_name_de: "Assault Bike" },
  jump_rope: { exercise_role: "cardio", display_name_de: "Seilspringen" },

  // ==================== MOBILITY (Movement prep/recovery) ====================
  worlds_greatest_stretch: { exercise_role: "mobility", display_name_de: "World's Greatest Stretch" },
  cat_cow: { exercise_role: "mobility", display_name_de: "Katze-Kuh" },
  cat_cow_stretch: { exercise_role: "mobility", display_name_de: "Katze-Kuh-Dehnung" },
  hip_90_90: { exercise_role: "mobility", display_name_de: "90/90 Hüftmobilität" },
  pigeon_stretch: { exercise_role: "mobility", display_name_de: "Taube-Dehnung" },
  hip_flexor_stretch: { exercise_role: "mobility", display_name_de: "Hüftbeuger-Dehnung" },
  thoracic_rotation: { exercise_role: "mobility", display_name_de: "Brustwirbelsäulen-Rotation" },
  shoulder_cars: { exercise_role: "mobility", display_name_de: "Schulter CARs" },
  hip_cars: { exercise_role: "mobility", display_name_de: "Hüft CARs" },
  foam_rolling: { exercise_role: "mobility", display_name_de: "Faszienrolle" },
  band_pull_aparts: { exercise_role: "mobility", display_name_de: "Band Pull-Aparts" },
  dead_bug: { exercise_role: "mobility", display_name_de: "Dead Bug" },
  bird_dog: { exercise_role: "mobility", display_name_de: "Bird Dog" },
  overhead_squat_assessment: { exercise_role: "mobility", display_name_de: "Overhead Squat Bewertung" },

  // Core/Stability exercises (classify as accessory or core based on function)
  plank: { exercise_role: "accessory", display_name_de: "Unterarmstütz" },
  side_plank: { exercise_role: "accessory", display_name_de: "Seitlicher Unterarmstütz" },
  pallof_press: { exercise_role: "accessory", display_name_de: "Pallof Press" },
  hanging_leg_raise: { exercise_role: "accessory", display_name_de: "Beinheben hängend" },
  ab_wheel_rollout: { exercise_role: "accessory", display_name_de: "Ab-Wheel Rollout" },
  hollow_body_hold: { exercise_role: "accessory", display_name_de: "Hollow Body Hold" },
};

// Default role assignment based on movement pattern
function getDefaultRole(movementPattern: string | null, tier: string | null, category: string | null):
  "core" | "accessory" | "complementary" | "isolation" | "cardio" | "mobility" {

  // Cardio pattern
  if (movementPattern === "cardio") return "cardio";

  // Mobility pattern
  if (movementPattern === "mobility") return "mobility";

  // Warmup/cooldown category usually mobility
  if (category === "warmup" || category === "cooldown") return "mobility";

  // S-tier usually core, A-tier usually accessory
  if (tier === "S") return "core";
  if (tier === "A") return "accessory";

  // B/C tier usually isolation or complementary
  if (tier === "B" || tier === "C") return "isolation";

  // Plyometric pattern usually complementary
  if (movementPattern === "plyometric") return "complementary";

  // Carry pattern usually complementary
  if (movementPattern === "carry") return "complementary";

  // Default to accessory
  return "accessory";
}

async function classifyExerciseRoles() {
  // Get Convex URL from environment or use default
  const convexUrl = process.env.VITE_CONVEX_URL || "https://reminiscent-owl-650.convex.cloud";
  const convex = new ConvexHttpClient(convexUrl);

  console.log("🏋️ EXERCISE ROLE CLASSIFICATION");
  console.log("================================");
  console.log(`📊 Classifying exercises into roles:`);
  console.log("   • core - Fundamental compounds (Squat, Bench, Deadlift)");
  console.log("   • accessory - Support lifts (DB Fly, Leg Curl)");
  console.log("   • complementary - Sport-specific (Sled Push, Box Jump)");
  console.log("   • isolation - Single muscle (Bicep Curl, Lateral Raise)");
  console.log("   • cardio - Cardiovascular (Running, Cycling)");
  console.log("   • mobility - Movement prep (Stretches, CARs)");
  console.log("");

  // Get all exercises from the database
  let allExercises: Array<{ exercise_name: string; movement_pattern?: string | null; exercise_tier?: string | null; primary_category?: string | null }> = [];
  try {
    // Use a query to get all exercises - we'll need to add this query
    console.log("📥 Fetching exercises from database...");
    // Note: You may need to create a query for this
  } catch (error) {
    console.log("⚠️  Using predefined classification list instead");
  }

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  // Classify each predefined exercise
  for (const [exerciseName, classification] of Object.entries(ROLE_CLASSIFICATIONS)) {
    try {
      await convex.mutation(api.mutations.updateExerciseRoleAndTranslations, {
        exerciseName: exerciseName,
        exercise_role: classification.exercise_role,
        display_name_de: classification.display_name_de,
      });

      successCount++;
      const roleEmoji = {
        core: "💎",
        accessory: "🔧",
        complementary: "🎯",
        isolation: "💪",
        cardio: "🏃",
        mobility: "🧘",
      }[classification.exercise_role] || "📦";

      console.log(`${roleEmoji} ${exerciseName} → ${classification.exercise_role}${classification.display_name_de ? ` (DE: ${classification.display_name_de})` : ""}`);
    } catch (error: any) {
      if (error.message.includes("not found")) {
        skipCount++;
        console.log(`⏭️  ${exerciseName} - not in database (will be created on first use)`);
      } else {
        errorCount++;
        console.error(`❌ ${exerciseName}: ${error.message}`);
      }
    }
  }

  console.log("");
  console.log("🎉 CLASSIFICATION COMPLETE!");
  console.log("===========================");
  console.log(`✅ Classified: ${successCount} exercises`);
  console.log(`⏭️  Skipped (not in DB): ${skipCount} exercises`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log("");
  console.log("📝 ROLE DEFINITIONS:");
  console.log("💎 CORE - Program foundation (2-3 per session)");
  console.log("🔧 ACCESSORY - Support & balance (2-4 per session)");
  console.log("🎯 COMPLEMENTARY - Sport-specific (1-3 if needed)");
  console.log("💪 ISOLATION - Finishers only (0-2 per session)");
  console.log("🏃 CARDIO - Conditioning work");
  console.log("🧘 MOBILITY - Warm-up/cool-down");
}

// Run the script
classifyExerciseRoles().catch(console.error);
