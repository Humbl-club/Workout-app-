/**
 * Add Injury Contraindications to REBLD Exercise Database
 *
 * This script adds comprehensive injury_contraindications to S and A tier exercises
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

const CONVEX_URL = "https://reminiscent-owl-650.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

/**
 * Define injury contraindications for common exercises
 */
const INJURY_DATA: Record<string, any[]> = {
  // SQUAT VARIATIONS
  "barbell_back_squat": [
    {
      injury_type: "knee_pain",
      severity: "caution",
      reason: "Deep flexion increases patellofemoral joint stress. Full depth may aggravate existing knee issues.",
      safe_modifications: [
        "Limit depth to parallel or above",
        "Use box squat to control depth",
        "Widen stance to reduce knee travel",
        "Focus on sitting back rather than down"
      ],
      alternative_exercises: ["leg_press", "hip_thrust", "romanian_deadlift", "step_ups"]
    },
    {
      injury_type: "lower_back_pain",
      severity: "caution",
      reason: "Spinal loading with flexion moment. Requires strong bracing and neutral spine.",
      safe_modifications: [
        "Use safety squat bar to reduce forward lean",
        "Front squat variation reduces spinal load",
        "Belt squat eliminates axial loading",
        "Reduce load and focus on perfect bracing"
      ],
      alternative_exercises: ["belt_squat", "leg_press", "goblet_squat", "split_squat"]
    }
  ],

  "front_squat": [
    {
      injury_type: "wrist_pain",
      severity: "caution",
      reason: "Clean grip requires significant wrist extension under load.",
      safe_modifications: [
        "Use cross-arm grip",
        "Use straps to reduce wrist stress",
        "Improve wrist mobility before loading",
        "Use goblet squat as alternative"
      ],
      alternative_exercises: ["goblet_squat", "safety_bar_squat", "leg_press"]
    },
    {
      injury_type: "shoulder_mobility_issues",
      severity: "caution",
      reason: "Requires significant shoulder external rotation and thoracic extension.",
      safe_modifications: [
        "Use cross-arm grip",
        "Improve thoracic mobility first",
        "Use safety squat bar"
      ],
      alternative_exercises: ["safety_bar_squat", "goblet_squat", "hack_squat"]
    }
  ],

  "bulgarian_split_squat": [
    {
      injury_type: "knee_pain",
      severity: "monitor",
      reason: "Single-leg loading can stress patellar tendon if front knee travels too far forward.",
      safe_modifications: [
        "Reduce rear foot elevation",
        "Focus on hip hinge pattern",
        "Keep torso more upright",
        "Reduce range of motion"
      ],
      alternative_exercises: ["step_ups", "reverse_lunge", "leg_press_single_leg"]
    },
    {
      injury_type: "hip_impingement",
      severity: "caution",
      reason: "Deep hip flexion in rear leg can aggravate hip impingement.",
      safe_modifications: [
        "Lower rear foot elevation",
        "Perform reverse lunge instead",
        "Limit depth"
      ],
      alternative_exercises: ["reverse_lunge", "step_ups", "single_leg_rdl"]
    }
  ],

  // HINGE VARIATIONS
  "deadlift": [
    {
      injury_type: "lower_back_pain",
      severity: "absolute",
      reason: "High spinal loading with flexion/shear forces. Can aggravate disc herniation or acute lower back pain.",
      safe_modifications: [],
      alternative_exercises: ["trap_bar_deadlift", "romanian_deadlift", "hip_thrust", "back_extension"]
    },
    {
      injury_type: "knee_pain",
      severity: "monitor",
      reason: "Moderate knee flexion and quad involvement. Generally well-tolerated.",
      safe_modifications: ["Use elevated deadlift to reduce knee flexion"],
      alternative_exercises: ["romanian_deadlift", "hip_thrust", "glute_ham_raise"]
    }
  ],

  "conventional_deadlift": [
    {
      injury_type: "lower_back_pain",
      severity: "absolute",
      reason: "Maximum spinal loading. Requires perfect technique and healthy spine.",
      safe_modifications: [],
      alternative_exercises: ["trap_bar_deadlift", "romanian_deadlift", "hip_thrust"]
    },
    {
      injury_type: "hamstring_strain",
      severity: "caution",
      reason: "High eccentric loading on hamstrings during descent.",
      safe_modifications: [
        "Reduce range of motion",
        "Use trap bar variation",
        "Focus on Romanian deadlift first"
      ],
      alternative_exercises: ["trap_bar_deadlift", "hip_thrust", "back_extension"]
    }
  ],

  "romanian_deadlift": [
    {
      injury_type: "lower_back_pain",
      severity: "caution",
      reason: "Moderate spinal loading with hip hinge. Less stressful than conventional deadlift.",
      safe_modifications: [
        "Reduce range of motion",
        "Use dumbbells for better balance",
        "Perform single-leg version with lighter load"
      ],
      alternative_exercises: ["hip_thrust", "back_extension", "glute_ham_raise"]
    },
    {
      injury_type: "hamstring_strain",
      severity: "monitor",
      reason: "Targets hamstrings with eccentric loading. Can be therapeutic if loaded properly.",
      safe_modifications: [
        "Reduce range to pain-free zone",
        "Use lighter loads",
        "Perform isometric holds"
      ],
      alternative_exercises: ["glute_bridge", "hip_thrust", "leg_curl_light"]
    }
  ],

  // PRESSING VARIATIONS
  "bench_press": [
    {
      injury_type: "shoulder_impingement",
      severity: "caution",
      reason: "Wide grip and bottom position can impinge shoulder joint.",
      safe_modifications: [
        "Use closer grip",
        "Reduce range of motion",
        "Use dumbbells for natural path",
        "Focus on shoulder blade retraction"
      ],
      alternative_exercises: ["incline_press", "floor_press", "push_ups", "dips"]
    },
    {
      injury_type: "elbow_tendonitis",
      severity: "caution",
      reason: "High triceps involvement can aggravate medial/lateral epicondylitis.",
      safe_modifications: [
        "Use neutral grip with dumbbells",
        "Reduce volume",
        "Use wrist wraps for support"
      ],
      alternative_exercises: ["dumbbell_press", "machine_press", "push_ups"]
    }
  ],

  "overhead_press": [
    {
      injury_type: "shoulder_impingement",
      severity: "absolute",
      reason: "Overhead position with load significantly narrows subacromial space.",
      safe_modifications: [],
      alternative_exercises: ["incline_press", "landmine_press", "pike_push_up"]
    },
    {
      injury_type: "lower_back_pain",
      severity: "caution",
      reason: "Standing variation requires core bracing. Can hyperextend lumbar spine.",
      safe_modifications: [
        "Use seated variation",
        "Focus on core bracing",
        "Use push press for lighter loads",
        "Reduce range of motion"
      ],
      alternative_exercises: ["seated_overhead_press", "landmine_press", "incline_press"]
    }
  ],

  "incline_barbell_press": [
    {
      injury_type: "shoulder_impingement",
      severity: "monitor",
      reason: "Incline angle reduces impingement risk compared to flat bench.",
      safe_modifications: [
        "Use 30-degree incline (not 45)",
        "Use dumbbells for natural path",
        "Focus on shoulder blade retraction"
      ],
      alternative_exercises: ["dumbbell_incline_press", "landmine_press", "pike_push_up"]
    }
  ],

  "incline_dumbbell_press": [
    {
      injury_type: "shoulder_impingement",
      severity: "monitor",
      reason: "Dumbbell path allows for natural movement pattern.",
      safe_modifications: [
        "Use 30-degree incline",
        "Neutral grip reduces stress",
        "Limit depth to pain-free range"
      ],
      alternative_exercises: ["landmine_press", "pike_push_up", "machine_press"]
    }
  ],

  // PULLING VARIATIONS
  "pull_up": [
    {
      injury_type: "shoulder_impingement",
      severity: "caution",
      reason: "Overhead pulling can impinge rotator cuff, especially with wide grip.",
      safe_modifications: [
        "Use neutral grip",
        "Use assisted pull-up machine",
        "Reduce range to avoid impingement zone",
        "Focus on scapular pull-ups first"
      ],
      alternative_exercises: ["lat_pulldown", "inverted_row", "cable_row"]
    },
    {
      injury_type: "elbow_tendonitis",
      severity: "caution",
      reason: "High biceps and forearm involvement.",
      safe_modifications: [
        "Use wider grip to reduce biceps load",
        "Use straps to reduce forearm stress",
        "Perform lat pulldowns instead"
      ],
      alternative_exercises: ["lat_pulldown", "straight_arm_pulldown", "cable_row"]
    }
  ],

  "bent_over_barbell_row": [
    {
      injury_type: "lower_back_pain",
      severity: "caution",
      reason: "Hip hinge position places isometric load on spinal erectors.",
      safe_modifications: [
        "Use chest-supported row",
        "Perform cable row instead",
        "Use lighter load with perfect form",
        "Reduce hip hinge angle (more upright)"
      ],
      alternative_exercises: ["chest_supported_row", "cable_row", "inverted_row", "dumbbell_row"]
    },
    {
      injury_type: "shoulder_impingement",
      severity: "monitor",
      reason: "Pulling to lower chest/abdomen generally safe. Avoid pulling too high.",
      safe_modifications: [
        "Pull to lower abdomen, not chest",
        "Use underhand grip for different angle",
        "Focus on elbow drive, not hand path"
      ],
      alternative_exercises: ["cable_row", "t-bar_row", "chest_supported_row"]
    }
  ],

  // HIP DOMINANT
  "hip_thrust": [
    {
      injury_type: "lower_back_pain",
      severity: "monitor",
      reason: "Pure hip extension with minimal spinal load. Generally therapeutic.",
      safe_modifications: [
        "Avoid overextending at top",
        "Focus on glute squeeze, not back arch",
        "Use pause at top for control"
      ],
      alternative_exercises: ["glute_bridge", "back_extension", "cable_pull_through"]
    }
  ],

  "hip_thrust_barbell": [
    {
      injury_type: "hip_impingement",
      severity: "monitor",
      reason: "Deep hip flexion at bottom may aggravate FAI.",
      safe_modifications: [
        "Reduce range of motion",
        "Use pause at top",
        "Focus on glute activation over range"
      ],
      alternative_exercises: ["glute_bridge", "back_extension", "cable_pull_through"]
    }
  ],

  // CORE/STABILITY
  "plank": [
    {
      injury_type: "lower_back_pain",
      severity: "monitor",
      reason: "Anti-extension core exercise. Generally therapeutic for back pain when performed correctly.",
      safe_modifications: [
        "Perform on knees if needed",
        "Reduce hold time",
        "Focus on posterior pelvic tilt",
        "Ensure no sagging hips"
      ],
      alternative_exercises: ["dead_bug", "bird_dog", "pallof_press"]
    }
  ],

  // UNILATERAL LOWER
  "walking_lunges": [
    {
      injury_type: "knee_pain",
      severity: "caution",
      reason: "Front knee can travel forward significantly, increasing patellofemoral stress.",
      safe_modifications: [
        "Reverse lunge instead (reduces forward travel)",
        "Shorter stride length",
        "Focus on vertical shin",
        "Reduce load"
      ],
      alternative_exercises: ["reverse_lunge", "step_ups", "bulgarian_split_squat"]
    },
    {
      injury_type: "ankle_instability",
      severity: "caution",
      reason: "Single-leg balance challenge may be difficult with ankle issues.",
      safe_modifications: [
        "Use stationary lunges first",
        "Hold onto support for balance",
        "Build ankle stability separately"
      ],
      alternative_exercises: ["leg_press_single_leg", "step_ups_low", "bulgarian_split_squat_supported"]
    }
  ],

  // POWER/PLYOMETRIC
  "medicine_ball_slam": [
    {
      injury_type: "lower_back_pain",
      severity: "caution",
      reason: "Explosive flexion/extension can stress lumbar spine if technique is poor.",
      safe_modifications: [
        "Reduce intensity",
        "Focus on hip hinge, not spine flexion",
        "Use lighter ball",
        "Perform kneeling slams"
      ],
      alternative_exercises: ["cable_woodchop", "kettlebell_swing_light", "battle_ropes"]
    },
    {
      injury_type: "shoulder_pain",
      severity: "monitor",
      reason: "Overhead position with dynamic load.",
      safe_modifications: [
        "Reduce range of motion",
        "Focus on core-driven slam",
        "Use chest pass variation"
      ],
      alternative_exercises: ["battle_ropes", "cable_woodchop", "kettlebell_swing"]
    }
  ],

  "box_jump": [
    {
      injury_type: "knee_pain",
      severity: "caution",
      reason: "High impact landing forces increase knee stress.",
      safe_modifications: [
        "Step down instead of jumping down",
        "Use lower box height",
        "Focus on soft landing",
        "Build landing mechanics first"
      ],
      alternative_exercises: ["box_step_ups", "broad_jump", "kettlebell_swing"]
    },
    {
      injury_type: "ankle_instability",
      severity: "absolute",
      reason: "Landing requires significant ankle stability. High injury risk.",
      safe_modifications: [],
      alternative_exercises: ["step_ups", "sled_push", "kettlebell_swing"]
    }
  ],
};

/**
 * Main function to add injury data
 */
async function addInjuryData() {
  console.log("🏥 Starting injury contraindications enhancement...\n");

  try {
    // Get all S and A tier exercises
    console.log("📊 Fetching S and A tier exercises...");
    const allExercises = await convex.query(api.queries.getAllExercisesNoPagination);
    const targetExercises = allExercises.filter(
      (ex: any) => ex.exercise_tier === "S" || ex.exercise_tier === "A"
    );

    console.log(`✅ Found ${targetExercises.length} S/A tier exercises\n`);

    let updateCount = 0;
    let skippedCount = 0;

    for (const exercise of targetExercises) {
      const injuryData = INJURY_DATA[exercise.exercise_name];

      if (injuryData) {
        console.log(`💉 Adding injury data for: ${exercise.exercise_name}`);
        console.log(`   └─ ${injuryData.length} contraindication(s)`);

        try {
          // Use the sportBucketMutations.updateExerciseInjuryData mutation
          await convex.mutation(api.sportBucketMutations.updateExerciseInjuryData, {
            exercise_name: exercise.exercise_name,
            injury_contraindications: injuryData,
            therapeutic_benefits: [] // Can be added later
          });

          updateCount++;
          console.log(`   ✅ Updated successfully\n`);
        } catch (error) {
          console.error(`   ❌ Error:`, error);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        skippedCount++;
        console.log(`⏭️  Skipping ${exercise.exercise_name} (no injury data defined)`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📈 INJURY DATA SUMMARY");
    console.log("=".repeat(60));
    console.log(`S/A tier exercises: ${targetExercises.length}`);
    console.log(`Updated with injury data: ${updateCount}`);
    console.log(`Skipped (no data): ${skippedCount}`);
    console.log("=".repeat(60));

    console.log("\n✨ Injury contraindications enhancement completed!");

  } catch (error) {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run the enhancement
addInjuryData()
  .then(() => {
    console.log("\n✅ Script completed. Exiting...");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
