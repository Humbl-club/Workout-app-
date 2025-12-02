/**
 * Comprehensive script to fill ALL injury data and relationships
 * Runs directly through Convex MCP - no AI, just systematic rule-based logic
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = "https://reminiscent-owl-650.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

// Comprehensive injury mapping based on movement patterns and muscle groups
const INJURY_RULES = {
  // LOWER BODY - KNEE
  knee_pain: {
    affected_patterns: ["squat", "hinge"],
    affected_muscles: ["quadriceps", "hamstrings"],
    high_risk: ["squat", "lunge", "leg_extension", "jump", "bulgarian"],
    exercises: {
      absolute: ["box_jump", "depth_jump", "pistol_squat"],
      caution: ["squat", "lunge", "leg_extension", "step_up", "bulgarian"],
      monitor: ["deadlift", "hip_thrust", "leg_press"]
    }
  },

  // LOWER BODY - LOWER BACK
  lower_back_pain: {
    affected_patterns: ["hinge", "squat"],
    affected_muscles: ["erector_spinae"],
    high_risk: ["deadlift", "good_morning", "back_extension"],
    exercises: {
      absolute: ["deadlift", "good_morning", "jefferson_curl"],
      caution: ["squat", "row", "overhead_press", "romanian"],
      monitor: ["hip_thrust", "plank", "side_plank"]
    }
  },

  // UPPER BODY - SHOULDER
  shoulder_impingement: {
    affected_patterns: ["push_vertical", "pull_vertical"],
    affected_muscles: ["deltoid", "rotator_cuff"],
    high_risk: ["overhead_press", "pull_up", "upright_row"],
    exercises: {
      absolute: ["overhead_press", "upright_row", "behind_neck"],
      caution: ["bench_press", "pull_up", "dip", "lateral_raise"],
      monitor: ["push_up", "row", "face_pull"]
    }
  },

  // UPPER BODY - WRIST
  wrist_pain: {
    affected_patterns: ["push_horizontal", "squat"],
    affected_muscles: ["forearm"],
    high_risk: ["front_squat", "push_up", "handstand"],
    exercises: {
      absolute: [],
      caution: ["front_squat", "push_up", "bench_press", "handstand"],
      monitor: ["plank", "row"]
    }
  },

  // UPPER BODY - ELBOW
  elbow_tendonitis: {
    affected_patterns: ["pull_vertical", "pull_horizontal", "push_horizontal"],
    affected_muscles: ["biceps", "triceps"],
    high_risk: ["pull_up", "curl", "tricep_extension"],
    exercises: {
      absolute: [],
      caution: ["pull_up", "row", "bench_press", "close_grip", "curl", "extension"],
      monitor: ["lat_pulldown", "cable_row"]
    }
  },

  // HIP
  hip_impingement: {
    affected_patterns: ["squat", "hinge"],
    affected_muscles: ["glutes", "hip_flexors"],
    high_risk: ["deep_squat", "sumo", "pigeon"],
    exercises: {
      absolute: [],
      caution: ["squat", "sumo_deadlift", "bulgarian", "pigeon"],
      monitor: ["hip_thrust", "lunge"]
    }
  },

  // ANKLE
  ankle_instability: {
    affected_patterns: ["squat", "plyometric"],
    affected_muscles: ["calves"],
    high_risk: ["box_jump", "lunge", "single_leg"],
    exercises: {
      absolute: ["box_jump", "depth_jump", "broad_jump"],
      caution: ["lunge", "single_leg", "step_up", "calf_raise"],
      monitor: ["squat"]
    }
  },

  // ROTATOR CUFF
  rotator_cuff: {
    affected_patterns: ["push_horizontal", "push_vertical", "pull_vertical"],
    affected_muscles: ["rotator_cuff", "deltoid"],
    high_risk: ["overhead_press", "bench_press"],
    exercises: {
      absolute: ["overhead_press", "snatch"],
      caution: ["bench_press", "dip", "pull_up"],
      monitor: ["row", "face_pull"]
    }
  }
};

// Exercise relationship rules
const RELATIONSHIP_RULES = {
  // Squat progressions
  progressions: [
    ["goblet_squat", "front_squat", 75, 20],
    ["box_squat", "barbell_back_squat", 80, 15],
    ["front_squat", "barbell_back_squat", 85, 10],
    ["bodyweight_squat", "goblet_squat", 70, 25],
    ["split_squat", "bulgarian_split_squat", 80, 15],

    // Deadlift progressions
    ["romanian_deadlift", "conventional_deadlift", 75, 25],
    ["trap_bar_deadlift", "conventional_deadlift", 80, 10],
    ["kettlebell_deadlift", "trap_bar_deadlift", 70, 20],

    // Press progressions
    ["push_up", "dumbbell_bench_press", 65, 30],
    ["incline_push_up", "push_up", 75, 20],
    ["dumbbell_bench_press", "barbell_bench_press", 80, 15],
    ["pike_push_up", "overhead_press", 70, 25],

    // Pull progressions
    ["lat_pulldown", "assisted_pull_up", 80, 20],
    ["assisted_pull_up", "pull_up", 90, 30],
    ["pull_up", "weighted_pull_up", 95, 20],
    ["inverted_row", "barbell_row", 70, 25],

    // Hip thrust progressions
    ["glute_bridge", "single_leg_glute_bridge", 75, 40],
    ["glute_bridge", "hip_thrust", 80, 25],
    ["hip_thrust", "hip_thrust_barbell", 90, 30],

    // Core progressions
    ["plank", "plank_weighted", 85, 25],
    ["dead_bug", "ab_wheel", 60, 45],
    ["side_plank", "side_plank_advanced", 85, 20]
  ],

  // Alternatives (same movement pattern, different equipment/angle)
  alternatives: [
    ["barbell_back_squat", "front_squat", 85, 0],
    ["barbell_back_squat", "leg_press", 60, 0],
    ["conventional_deadlift", "sumo_deadlift", 85, 0],
    ["conventional_deadlift", "trap_bar_deadlift", 80, -5],
    ["bench_press", "dumbbell_bench_press", 90, 0],
    ["overhead_press", "dumbbell_overhead_press", 85, 0],
    ["pull_up", "lat_pulldown", 85, -15],
    ["pull_up", "chin_up", 90, -10],
    ["barbell_row", "dumbbell_row", 85, -5],
    ["barbell_row", "cable_row", 80, 0]
  ],

  // Antagonist pairs
  antagonists: [
    ["bench_press", "barbell_row", 40, 0],
    ["overhead_press", "pull_up", 40, 0],
    ["leg_extension", "leg_curl", 60, 0],
    ["bicep_curl", "tricep_extension", 70, 0],
    ["hip_flexor", "glute_bridge", 50, 0]
  ]
};

function shouldHaveInjuryData(exercise: any, injuryType: string): {
  severity: "absolute" | "caution" | "monitor" | null;
  reason: string;
  modifications: string[];
  alternatives: string[];
} | null {
  const name = exercise.exercise_name.toLowerCase();
  const pattern = exercise.movement_pattern;
  const muscles = exercise.muscles_worked || [];

  const rule = INJURY_RULES[injuryType as keyof typeof INJURY_RULES];
  if (!rule) return null;

  // Check if exercise name contains high-risk keywords
  const nameMatch = Object.entries(rule.exercises).find(([severity, keywords]) =>
    (keywords as string[]).some(keyword => name.includes(keyword.toLowerCase()))
  );

  if (nameMatch) {
    const [severity] = nameMatch;
    return {
      severity: severity as any,
      reason: getReason(injuryType, severity as any, pattern),
      modifications: getModifications(injuryType, severity as any),
      alternatives: getAlternatives(injuryType, pattern)
    };
  }

  // Check movement pattern
  if (rule.affected_patterns?.includes(pattern)) {
    return {
      severity: "monitor",
      reason: getReason(injuryType, "monitor", pattern),
      modifications: getModifications(injuryType, "monitor"),
      alternatives: getAlternatives(injuryType, pattern)
    };
  }

  return null;
}

function getReason(injuryType: string, severity: string, pattern: string): string {
  const reasons: Record<string, Record<string, string>> = {
    knee_pain: {
      absolute: "Extreme knee flexion and impact forces that can severely aggravate existing knee issues",
      caution: "Deep knee flexion under load increases patellofemoral joint stress",
      monitor: "Moderate knee involvement, generally well-tolerated with proper form"
    },
    lower_back_pain: {
      absolute: "High spinal loading with potential for shear forces on lumbar discs",
      caution: "Spinal loading requires core bracing and neutral spine maintenance",
      monitor: "Minimal spinal load when performed with proper form"
    },
    shoulder_impingement: {
      absolute: "Overhead position significantly narrows subacromial space under load",
      caution: "Shoulder positioning can aggravate impingement with improper form",
      monitor: "Generally safe but maintain proper shoulder mechanics"
    },
    wrist_pain: {
      caution: "Extended wrist position under load can aggravate wrist issues",
      monitor: "Minimal wrist stress with neutral positioning"
    },
    elbow_tendonitis: {
      caution: "High elbow flexion/extension load can stress tendons",
      monitor: "Moderate elbow involvement, focus on controlled movement"
    },
    hip_impingement: {
      caution: "Deep hip flexion can aggravate femoroacetabular impingement",
      monitor: "Moderate hip range of motion required"
    },
    ankle_instability: {
      absolute: "High impact and balance requirements unsafe with ankle instability",
      caution: "Single-leg stability challenge may be difficult",
      monitor: "Bilateral stance provides stability"
    },
    rotator_cuff: {
      absolute: "High rotator cuff load under overhead position",
      caution: "Significant shoulder stabilization required",
      monitor: "Moderate shoulder involvement"
    }
  };

  return reasons[injuryType]?.[severity] || `May affect ${injuryType}`;
}

function getModifications(injuryType: string, severity: string): string[] {
  if (severity === "absolute") return [];

  const mods: Record<string, string[]> = {
    knee_pain: ["Reduce depth", "Widen stance", "Use box to control depth", "Reduce load"],
    lower_back_pain: ["Reduce load", "Focus on core bracing", "Use belt", "Limit range of motion"],
    shoulder_impingement: ["Use neutral grip", "Reduce range of motion", "Focus on scapular retraction"],
    wrist_pain: ["Use wrist wraps", "Perform on fists", "Use handles/grips"],
    elbow_tendonitis: ["Reduce load", "Focus on controlled tempo", "Use neutral grip"],
    hip_impingement: ["Reduce depth", "Widen stance", "Limit flexion range"],
    ankle_instability: ["Use support", "Start with bilateral stance", "Build ankle stability first"],
    rotator_cuff: ["Reduce weight", "Focus on control", "Avoid overhead position"]
  };

  return mods[injuryType] || ["Modify as needed", "Reduce intensity"];
}

function getAlternatives(injuryType: string, pattern: string): string[] {
  const alts: Record<string, string[]> = {
    knee_pain: ["leg_press", "hip_thrust", "step_ups", "glute_bridge"],
    lower_back_pain: ["belt_squat", "leg_press", "hip_thrust", "cable_exercises"],
    shoulder_impingement: ["incline_press", "landmine_press", "cable_press", "push_ups"],
    wrist_pain: ["dumbbell_exercises", "cable_exercises", "machine_exercises"],
    elbow_tendonitis: ["machine_exercises", "cable_exercises", "lighter_dumbbells"],
    hip_impingement: ["partial_range_exercises", "leg_press", "step_ups"],
    ankle_instability: ["seated_exercises", "machine_exercises", "supported_exercises"],
    rotator_cuff: ["cable_exercises", "resistance_band_work", "machine_press"]
  };

  return alts[injuryType] || ["modified_version", "machine_alternative"];
}

async function fillInjuryData() {
  console.log("🏥 Filling injury contraindications for ALL exercises...\n");

  const exercises = await convex.query(api.queries.getAllExercisesNoPagination);
  console.log(`Found ${exercises.length} exercises\n`);

  let updateCount = 0;

  for (const exercise of exercises) {
    // Skip if already has injury data
    if (exercise.injury_contraindications && exercise.injury_contraindications.length > 0) {
      continue;
    }

    const injuryData: any[] = [];

    // Check each injury type
    for (const injuryType of Object.keys(INJURY_RULES)) {
      const data = shouldHaveInjuryData(exercise, injuryType);
      if (data) {
        injuryData.push({
          injury_type: injuryType,
          severity: data.severity,
          reason: data.reason,
          safe_modifications: data.modifications,
          alternative_exercises: data.alternatives
        });
      }
    }

    if (injuryData.length > 0) {
      try {
        await convex.mutation(api.sportBucketMutations.updateExerciseInjuryData, {
          exercise_name: exercise.exercise_name,
          injury_contraindications: injuryData,
          therapeutic_benefits: []
        });

        updateCount++;
        console.log(`✅ [${updateCount}] ${exercise.exercise_name}: Added ${injuryData.length} injury entries`);

        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`❌ Error updating ${exercise.exercise_name}:`, error);
      }
    }
  }

  console.log(`\n✨ Injury data complete: ${updateCount} exercises updated`);
}

async function fillRelationships() {
  console.log("\n🔗 Filling exercise relationships...\n");

  let count = 0;

  // Progressions
  for (const [primary, related, similarity, strengthDiff] of RELATIONSHIP_RULES.progressions) {
    try {
      await convex.mutation(api.mutations.addExerciseRelationship, {
        primary_exercise: primary,
        related_exercise: related,
        relationship_type: "progression",
        similarity_score: similarity,
        strength_difference: strengthDiff,
        notes: `${related} is harder than ${primary}`
      });
      count++;
      console.log(`✅ [${count}] ${primary} → ${related} (progression)`);
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      // Might already exist, skip
    }
  }

  // Alternatives
  for (const [primary, related, similarity, strengthDiff] of RELATIONSHIP_RULES.alternatives) {
    try {
      await convex.mutation(api.mutations.addExerciseRelationship, {
        primary_exercise: primary,
        related_exercise: related,
        relationship_type: "alternative",
        similarity_score: similarity,
        strength_difference: strengthDiff,
        notes: `Similar exercise with different equipment/angle`
      });
      count++;
      console.log(`✅ [${count}] ${primary} ↔ ${related} (alternative)`);
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      // Might already exist, skip
    }
  }

  // Antagonists
  for (const [primary, related, similarity, strengthDiff] of RELATIONSHIP_RULES.antagonists) {
    try {
      await convex.mutation(api.mutations.addExerciseRelationship, {
        primary_exercise: primary,
        related_exercise: related,
        relationship_type: "antagonist",
        similarity_score: similarity,
        strength_difference: strengthDiff,
        notes: `Opposite muscle groups for balanced training`
      });
      count++;
      console.log(`✅ [${count}] ${primary} ↔ ${related} (antagonist)`);
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      // Might already exist, skip
    }
  }

  console.log(`\n✨ Relationships complete: ${count} relationships created`);
}

async function main() {
  try {
    await fillInjuryData();
    await fillRelationships();
    console.log("\n🎉 ALL DONE! Database fully enhanced.");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
