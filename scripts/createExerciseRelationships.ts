/**
 * Create Exercise Relationships for REBLD Database
 *
 * This script creates comprehensive exercise relationships:
 * - Progressions (easier → harder)
 * - Regressions (harder → easier)
 * - Alternatives (same difficulty, different approach)
 * - Antagonists (opposite muscle groups)
 * - Compound to isolation breakdowns
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = "https://reminiscent-owl-650.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

/**
 * Define exercise relationships
 * Format: [primary_exercise, related_exercise, type, similarity_score, strength_difference, notes]
 */
const RELATIONSHIPS = [
  // SQUAT PROGRESSIONS
  ["goblet_squat", "front_squat", "progression", 75, 20, "Front squat adds barbell complexity and loading"],
  ["front_squat", "back_squat", "progression", 80, 15, "Back squat typically allows 10-15% more load"],
  ["back_squat", "pause_squat", "progression", 85, 10, "Pause increases time under tension"],
  ["box_squat", "back_squat", "progression", 80, 10, "Box squat teaches depth control"],

  // SQUAT ALTERNATIVES
  ["barbell_back_squat", "front_squat", "alternative", 85, 0, "Front squat emphasizes quads more, reduces spinal load"],
  ["barbell_back_squat", "safety_bar_squat", "alternative", 90, -5, "Safety bar shifts load forward, easier on shoulders"],
  ["barbell_back_squat", "leg_press", "alternative", 60, 0, "Leg press removes spinal loading"],
  ["front_squat", "goblet_squat", "alternative", 70, -20, "Goblet squat is more accessible, lighter load"],

  // DEADLIFT PROGRESSIONS
  ["romanian_deadlift", "conventional_deadlift", "progression", 75, 25, "Conventional deadlift adds greater range and load"],
  ["trap_bar_deadlift", "conventional_deadlift", "progression", 80, 10, "Conventional requires more technique"],

  // DEADLIFT ALTERNATIVES
  ["conventional_deadlift", "sumo_deadlift", "alternative", 85, 0, "Sumo emphasizes quads more, different stance"],
  ["conventional_deadlift", "trap_bar_deadlift", "alternative", 80, -5, "Trap bar reduces spinal stress"],
  ["deadlift", "romanian_deadlift", "alternative", 75, -15, "RDL focuses on hamstrings, less overall load"],

  // PRESSING PROGRESSIONS
  ["push_up", "incline_dumbbell_press", "progression", 65, 20, "Adding external load increases difficulty"],
  ["incline_dumbbell_press", "incline_barbell_press", "progression", 85, 10, "Barbell allows heavier loading"],
  ["incline_barbell_press", "bench_press", "progression", 80, 15, "Flat bench typically stronger than incline"],
  ["dumbbell_press", "barbell_bench_press", "progression", 80, 15, "Barbell allows progressive overload"],

  // PRESSING ALTERNATIVES
  ["bench_press", "dumbbell_bench_press", "alternative", 90, 0, "Dumbbells allow natural movement path"],
  ["bench_press", "machine_chest_press", "alternative", 75, -10, "Machine provides stability"],
  ["overhead_press", "seated_overhead_press", "alternative", 85, -10, "Seated removes leg drive"],
  ["overhead_press", "push_press", "alternative", 75, 15, "Push press adds leg drive for more load"],

  // PULLING PROGRESSIONS
  ["lat_pulldown", "assisted_pull_up", "progression", 80, 20, "Assisted pull-up progresses toward bodyweight"],
  ["assisted_pull_up", "pull_up", "progression", 90, 30, "Full bodyweight pull-up"],
  ["pull_up", "weighted_pull_up", "progression", 95, 20, "Adding weight increases difficulty"],
  ["inverted_row", "barbell_row", "progression", 70, 25, "Barbell row adds external load"],

  // PULLING ALTERNATIVES
  ["pull_up", "lat_pulldown", "alternative", 85, -15, "Lat pulldown allows load control"],
  ["pull_up", "chin_up", "alternative", 90, -10, "Chin-up emphasizes biceps more"],
  ["barbell_row", "cable_row", "alternative", 80, 0, "Cable provides constant tension"],
  ["barbell_row", "dumbbell_row", "alternative", 85, -5, "Dumbbell allows unilateral work"],
  ["bent_over_barbell_row", "chest_supported_row", "alternative", 75, -10, "Chest support removes lower back stress"],

  // HIP THRUST PROGRESSIONS
  ["glute_bridge", "single_leg_glute_bridge", "progression", 75, 40, "Single leg doubles difficulty"],
  ["glute_bridge", "hip_thrust", "progression", 80, 25, "Elevated position increases range"],
  ["hip_thrust", "hip_thrust_barbell", "progression", 90, 30, "Adding barbell allows heavy loading"],

  // HIP THRUST ALTERNATIVES
  ["hip_thrust", "back_extension", "alternative", 60, -20, "Back extension emphasizes erectors more"],
  ["hip_thrust_barbell", "cable_pull_through", "alternative", 65, -25, "Cable provides different resistance curve"],

  // UNILATERAL LEG PROGRESSIONS
  ["reverse_lunge", "walking_lunges", "progression", 85, 10, "Walking adds balance challenge"],
  ["step_ups", "bulgarian_split_squat", "progression", 75, 20, "BSS increases range and difficulty"],
  ["bulgarian_split_squat", "bulgarian_split_squat_elevated", "progression", 90, 15, "Higher elevation increases range"],

  // UNILATERAL LEG ALTERNATIVES
  ["bulgarian_split_squat", "step_ups", "alternative", 75, -15, "Step-ups reduce balance demand"],
  ["walking_lunges", "reverse_lunge", "alternative", 85, -10, "Reverse lunge easier on knees"],
  ["single_leg_rdl", "bulgarian_split_squat", "alternative", 60, 0, "Different movement pattern, similar difficulty"],

  // CORE PROGRESSIONS
  ["plank", "plank_with_weight", "progression", 90, 25, "Adding weight increases demand"],
  ["plank", "ab_wheel_rollout", "progression", 60, 40, "Rollout significantly harder"],
  ["side_plank", "side_plank_advanced", "progression", 85, 20, "Advanced variation adds complexity"],
  ["dead_bug", "ab_wheel_rollout", "progression", 50, 45, "Large difficulty jump"],

  // COMPOUND TO ISOLATION - SQUAT
  ["barbell_back_squat", "leg_extension", "compound_to_isolation", 40, 0, "Leg extension isolates quads"],
  ["barbell_back_squat", "leg_curl", "compound_to_isolation", 40, 0, "Leg curl isolates hamstrings"],
  ["barbell_back_squat", "calf_raise", "compound_to_isolation", 30, 0, "Calf raise isolates calves"],

  // COMPOUND TO ISOLATION - DEADLIFT
  ["deadlift", "leg_curl", "compound_to_isolation", 45, 0, "Leg curl isolates hamstrings"],
  ["deadlift", "back_extension", "compound_to_isolation", 50, 0, "Back extension isolates erectors"],
  ["deadlift", "shrug", "compound_to_isolation", 35, 0, "Shrug isolates traps"],

  // COMPOUND TO ISOLATION - BENCH PRESS
  ["bench_press", "pec_fly", "compound_to_isolation", 45, 0, "Fly isolates chest"],
  ["bench_press", "tricep_pushdown", "compound_to_isolation", 40, 0, "Pushdown isolates triceps"],
  ["bench_press", "front_raise", "compound_to_isolation", 30, 0, "Front raise isolates anterior delt"],

  // COMPOUND TO ISOLATION - OVERHEAD PRESS
  ["overhead_press", "lateral_raise", "compound_to_isolation", 45, 0, "Lateral raise isolates side delts"],
  ["overhead_press", "front_raise", "compound_to_isolation", 40, 0, "Front raise isolates front delts"],
  ["overhead_press", "tricep_extension", "compound_to_isolation", 40, 0, "Extension isolates triceps"],

  // COMPOUND TO ISOLATION - ROWS
  ["barbell_row", "bicep_curl", "compound_to_isolation", 40, 0, "Curl isolates biceps"],
  ["barbell_row", "face_pull", "compound_to_isolation", 45, 0, "Face pull isolates rear delts"],
  ["barbell_row", "rear_delt_fly", "compound_to_isolation", 40, 0, "Fly isolates rear delts"],

  // COMPOUND TO ISOLATION - PULL-UPS
  ["pull_up", "bicep_curl", "compound_to_isolation", 40, 0, "Curl isolates biceps"],
  ["pull_up", "straight_arm_pulldown", "compound_to_isolation", 50, 0, "Pulldown isolates lats"],

  // ANTAGONIST PAIRS
  ["bench_press", "barbell_row", "antagonist", 40, 0, "Chest push vs back pull"],
  ["overhead_press", "pull_up", "antagonist", 40, 0, "Vertical push vs vertical pull"],
  ["leg_extension", "leg_curl", "antagonist", 60, 0, "Quad extension vs hamstring flexion"],
  ["bicep_curl", "tricep_extension", "antagonist", 70, 0, "Biceps vs triceps"],
  ["hip_flexor_work", "glute_bridge", "antagonist", 50, 0, "Hip flexors vs glutes"],

  // MOBILITY/WARMUP SIMILAR PATTERNS
  ["cat_cow_stretch", "thoracic_spine_rotation", "similar_pattern", 70, 0, "Both address spine mobility"],
  ["worlds_greatest_stretch", "pigeon_stretch", "similar_pattern", 65, 0, "Both address hip mobility"],
  ["arm_circles", "band_pull_aparts", "similar_pattern", 60, 0, "Both warm up shoulders"],
  ["leg_swings", "walking_lunges", "similar_pattern", 55, 0, "Both dynamic hip work"],

  // POWER/PLYOMETRIC PROGRESSIONS
  ["box_step_ups", "box_jump", "progression", 65, 35, "Jump adds plyometric demand"],
  ["broad_jump", "box_jump", "progression", 75, 15, "Box jump adds vertical component"],
  ["kettlebell_swing", "power_clean", "progression", 50, 40, "Power clean adds significant complexity"],

  // POWER/PLYOMETRIC ALTERNATIVES
  ["box_jump", "broad_jump", "alternative", 75, 0, "Different direction, similar power output"],
  ["medicine_ball_slam", "kettlebell_swing", "alternative", 60, 0, "Both explosive hip extension"],
  ["power_clean", "power_snatch", "alternative", 80, 5, "Similar movement, different catch position"],
];

/**
 * Main function to create relationships
 */
async function createRelationships() {
  console.log("🔗 Starting exercise relationships creation...\n");

  try {
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < RELATIONSHIPS.length; i++) {
      const [primary, related, type, similarity, strengthDiff, notes] = RELATIONSHIPS[i];
      const progress = `[${i + 1}/${RELATIONSHIPS.length}]`;

      try {
        console.log(`${progress} ${primary} → ${related} (${type})`);

        await convex.mutation(api.mutations.addExerciseRelationship, {
          primary_exercise: primary,
          related_exercise: related,
          relationship_type: type as any,
          similarity_score: similarity,
          strength_difference: strengthDiff || null,
          notes: notes || null,
        });

        successCount++;
        console.log(`  ✅ Created successfully`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error:`, error);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📈 RELATIONSHIPS SUMMARY");
    console.log("=".repeat(60));
    console.log(`Total relationships: ${RELATIONSHIPS.length}`);
    console.log(`Successfully created: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log("=".repeat(60));

    // Breakdown by type
    const typeCounts: Record<string, number> = {};
    RELATIONSHIPS.forEach(r => {
      const type = r[2];
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    console.log("\nRelationships by type:");
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    console.log("\n✨ Relationship creation completed!");

  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the enhancement
createRelationships()
  .then(() => {
    console.log("\n✅ Script completed. Exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
