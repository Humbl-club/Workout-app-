/**
 * Fill goalGuidelines table with goal-specific programming rules
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = "https://reminiscent-owl-650.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

const GOAL_GUIDELINES = [
  {
    goal: "strength",
    book_source: "Science and Practice of Strength Training (Zatsiorsky)",
    primary_exercises: [
      { name: "barbell_back_squat", priority: 1 },
      { name: "deadlift", priority: 2 },
      { name: "bench_press", priority: 3 },
      { name: "overhead_press", priority: 4 },
      { name: "barbell_row", priority: 5 }
    ],
    volume_guidelines: "3-6 sets × 1-5 reps @ 85-95% 1RM, 3-5 min rest",
    periodization: "Linear for beginners, undulating for intermediates, block for advanced",
    exercise_order: "Power movements → Heavy compounds → Accessories → Isolation",
    programming_details: {
      frequency: "3-6x per week for main lifts",
      intensity: "85-95% 1RM",
      volume: "10-25 sets per muscle per week",
      rest: "3-5 minutes between sets",
      progression: "Add 2.5-5 lbs per week"
    }
  },
  {
    goal: "aesthetic",
    book_source: "Science and Development of Muscle Hypertrophy (Schoenfeld)",
    primary_exercises: [
      { name: "barbell_back_squat", priority: 1 },
      { name: "romanian_deadlift", priority: 2 },
      { name: "bench_press", priority: 3 },
      { name: "barbell_row", priority: 4 },
      { name: "overhead_press", priority: 5 },
      { name: "pull_up", priority: 6 }
    ],
    volume_guidelines: "3-5 sets × 6-12 reps @ 65-85% 1RM, 1-3 min rest",
    periodization: "Undulating periodization with volume progression",
    exercise_order: "Compounds → Compound accessories → Isolation",
    programming_details: {
      frequency: "4-6x per week (2x per muscle group minimum)",
      intensity: "65-85% 1RM",
      volume: "10-20 sets per muscle per week",
      rest: "1-3 minutes between sets",
      progression: "Progressive overload via weight, reps, or sets"
    }
  },
  {
    goal: "athletic",
    book_source: "Principles and Practice of Resistance Training (Stone)",
    primary_exercises: [
      { name: "power_clean", priority: 1 },
      { name: "front_squat", priority: 2 },
      { name: "deadlift", priority: 3 },
      { name: "push_press", priority: 4 },
      { name: "box_jump", priority: 5 },
      { name: "single_leg_rdl", priority: 6 }
    ],
    volume_guidelines: "Power: 3-6 sets × 1-5 reps, Strength: 3-5 sets × 3-6 reps",
    periodization: "Block periodization with power, strength, and hypertrophy phases",
    exercise_order: "Power → Strength → Hypertrophy → Mobility",
    programming_details: {
      frequency: "4-6x per week",
      intensity: "Power: 30-80% 1RM, Strength: 80-90% 1RM",
      volume: "Medium volume (12-18 sets per muscle per week)",
      rest: "3-5 min for power/strength, 2-3 min for accessories",
      progression: "Focus on velocity and explosiveness"
    }
  },
  {
    goal: "running",
    book_source: "Daniels' Running Formula",
    primary_exercises: [
      { name: "single_leg_rdl", priority: 1 },
      { name: "bulgarian_split_squat", priority: 2 },
      { name: "nordic_curl", priority: 3 },
      { name: "calf_raise", priority: 4 },
      { name: "hip_thrust", priority: 5 },
      { name: "plank", priority: 6 }
    ],
    volume_guidelines: "2-3 sets × 8-12 reps, 1-2 min rest, light to moderate load",
    periodization: "Base building → Specific strength → Maintenance during race season",
    exercise_order: "Plyometrics → Single-leg strength → Core → Mobility",
    programming_details: {
      frequency: "2-3x per week (not on hard running days)",
      intensity: "60-75% 1RM",
      volume: "Low volume (8-12 sets per muscle per week)",
      rest: "1-2 minutes between sets",
      progression: "Focus on single-leg stability and eccentric strength"
    }
  },
  {
    goal: "mobility",
    book_source: "Becoming a Supple Leopard (Starrett)",
    primary_exercises: [
      { name: "worlds_greatest_stretch", priority: 1 },
      { name: "90_90_hip_stretch", priority: 2 },
      { name: "thoracic_spine_rotation", priority: 3 },
      { name: "cat_cow", priority: 4 },
      { name: "ankle_mobility_drill", priority: 5 },
      { name: "shoulder_dislocations", priority: 6 }
    ],
    volume_guidelines: "2-3 sets × 30-60s holds or 10-15 reps, daily practice",
    periodization: "Daily practice with progressive range of motion improvements",
    exercise_order: "Dynamic mobility → Static stretching → Loaded stretching",
    programming_details: {
      frequency: "Daily or 6-7x per week",
      intensity: "Comfortable stretch, no pain",
      volume: "10-15 min per session",
      rest: "Minimal rest between stretches",
      progression: "Increase range of motion gradually"
    }
  },
  {
    goal: "powerlifting",
    book_source: "The Science of Lifting (Greg Nuckols)",
    primary_exercises: [
      { name: "barbell_back_squat", priority: 1 },
      { name: "deadlift", priority: 2 },
      { name: "bench_press", priority: 3 },
      { name: "front_squat", priority: 4 },
      { name: "romanian_deadlift", priority: 5 },
      { name: "close_grip_bench_press", priority: 6 }
    ],
    volume_guidelines: "Competition lifts: 3-8 sets × 1-6 reps @ 75-95% 1RM, 3-5 min rest",
    periodization: "Block periodization: Hypertrophy → Strength → Peaking → Competition",
    exercise_order: "Competition lifts → Competition variations → Accessories",
    programming_details: {
      frequency: "Squat 2-4x, Bench 2-4x, Deadlift 1-3x per week",
      intensity: "Hypertrophy: 65-80%, Strength: 80-90%, Peaking: 90-100%",
      volume: "High volume off-season (20-30 sets/week), low volume peaking (8-12 sets/week)",
      rest: "3-5 minutes for competition lifts",
      progression: "Periodized toward competition date"
    }
  },
  {
    goal: "bodybuilding",
    book_source: "The Muscle and Strength Pyramid: Training (Helms)",
    primary_exercises: [
      { name: "barbell_back_squat", priority: 1 },
      { name: "romanian_deadlift", priority: 2 },
      { name: "bench_press", priority: 3 },
      { name: "barbell_row", priority: 4 },
      { name: "overhead_press", priority: 5 },
      { name: "leg_press", priority: 6 },
      { name: "leg_curl", priority: 7 },
      { name: "lateral_raise", priority: 8 }
    ],
    volume_guidelines: "3-4 sets × 6-12 reps @ 65-85% 1RM, 1-2 min rest, high volume",
    periodization: "Volume progression with strategic deloads every 3-4 weeks",
    exercise_order: "Weak points → Compounds → Isolation → Pump work",
    programming_details: {
      frequency: "5-6x per week (each muscle 2-3x per week)",
      intensity: "65-85% 1RM with occasional heavy work",
      volume: "15-25 sets per muscle per week",
      rest: "1-2 minutes for compounds, 30-90s for isolation",
      progression: "Progressive overload with focus on mind-muscle connection"
    }
  },
  {
    goal: "sport",
    book_source: "The Science and Practice of Strength Training (Zatsiorsky)",
    primary_exercises: [
      { name: "power_clean", priority: 1 },
      { name: "front_squat", priority: 2 },
      { name: "box_jump", priority: 3 },
      { name: "single_leg_rdl", priority: 4 },
      { name: "lateral_lunge", priority: 5 },
      { name: "medicine_ball_throw", priority: 6 }
    ],
    volume_guidelines: "Power: 3-5 sets × 1-5 reps, Strength: 3-4 sets × 4-6 reps",
    periodization: "Sport-specific periodization aligned with competitive season",
    exercise_order: "Sport-specific power → General strength → Prehab → Mobility",
    programming_details: {
      frequency: "3-4x per week in-season, 4-6x off-season",
      intensity: "Power: 30-80% 1RM, Strength: 75-90% 1RM",
      volume: "Low to moderate (10-15 sets per muscle per week)",
      rest: "Full recovery between power sets (3-5 min)",
      progression: "Focus on transfer to sport performance"
    }
  }
];

async function fillGoalGuidelines() {
  console.log("🎯 Filling goal guidelines table...\n");

  let count = 0;

  for (const guideline of GOAL_GUIDELINES) {
    try {
      await convex.mutation(api.mutations.saveGoalGuidelines, guideline);
      count++;
      console.log(`✅ [${count}/${GOAL_GUIDELINES.length}] Goal: ${guideline.goal}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Error adding ${guideline.goal}:`, error);
    }
  }

  console.log(`\n✨ Goal guidelines complete: ${count} entries added`);
}

fillGoalGuidelines()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
