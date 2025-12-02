/**
 * Fill programmingKnowledge table with scientific programming principles
 * Based on evidence from leading strength training textbooks
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = "https://reminiscent-owl-650.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

const PROGRAMMING_KNOWLEDGE = [
  // EXERCISE SELECTION PRINCIPLES
  {
    title: "Multi-Joint Exercise Priority",
    category: "athletic",
    principle_type: "exercise_selection",
    description: "Prioritize multi-joint compound movements that recruit multiple muscle groups simultaneously for maximum efficiency and functional carryover",
    applicable_goals: ["strength", "athletic", "powerlifting"],
    applicable_experience: ["beginner", "intermediate", "advanced"],
    author: "Zatsiorsky & Kraemer",
    book_title: "Science and Practice of Strength Training",
    exercise_recommendations: {
      tier_s: ["squat", "deadlift", "bench_press", "overhead_press", "pull_up"],
      tier_a: ["front_squat", "romanian_deadlift", "barbell_row", "dip"],
      avoid: []
    }
  },
  {
    title: "Exercise Order - Power Before Strength",
    category: "athletic",
    principle_type: "programming",
    description: "Perform explosive power exercises (Olympic lifts, plyometrics) at the start of sessions when the nervous system is fresh, before heavy strength work",
    applicable_goals: ["athletic", "sport"],
    applicable_experience: ["intermediate", "advanced"],
    author: "Mike Stone",
    book_title: "Principles and Practice of Resistance Training",
    guidelines: [
      "Power exercises first (cleans, snatches, jumps)",
      "Heavy compound lifts second (squats, deadlifts)",
      "Accessory work third",
      "Isolation work last"
    ]
  },
  {
    title: "Hypertrophy Volume Guidelines",
    category: "bodybuilding",
    principle_type: "programming",
    description: "Optimal hypertrophy occurs with 10-20 sets per muscle group per week, with progressive overload applied across mesocycles",
    applicable_goals: ["aesthetic", "bodybuilding"],
    applicable_experience: ["intermediate", "advanced"],
    author: "Brad Schoenfeld",
    book_title: "Science and Development of Muscle Hypertrophy",
    guidelines: [
      "10-20 sets per muscle per week for hypertrophy",
      "6-12 rep range optimal for muscle growth",
      "1-3 min rest for hypertrophy",
      "Train each muscle 2x per week minimum",
      "Progressive overload via weight, reps, or sets"
    ]
  },
  {
    title: "Strength Development - High Load Low Volume",
    category: "athletic",
    principle_type: "programming",
    description: "Maximal strength development requires high loads (>85% 1RM) with lower volumes (1-5 reps) and longer rest periods (3-5 min)",
    applicable_goals: ["strength", "powerlifting"],
    applicable_experience: ["intermediate", "advanced"],
    author: "Zatsiorsky & Kraemer",
    book_title: "Science and Practice of Strength Training",
    guidelines: [
      "85-95% 1RM for maximal strength",
      "1-5 reps per set",
      "3-5 min rest between sets",
      "Focus on squat, deadlift, bench, overhead press",
      "Frequency: 3-6x per week for main lifts"
    ]
  },
  {
    title: "Running Economy and Strength Training",
    category: "running",
    principle_type: "personalization",
    description: "Distance runners benefit from 2-3 strength sessions per week focused on single-leg stability, plyometrics, and hip/core strength without excessive muscle mass gain",
    applicable_goals: ["running", "endurance"],
    applicable_experience: ["beginner", "intermediate", "advanced"],
    author: "Jack Daniels",
    book_title: "Daniels' Running Formula",
    exercise_recommendations: {
      tier_s: ["single_leg_rdl", "bulgarian_split_squat", "nordic_curl"],
      tier_a: ["calf_raise", "hip_thrust", "plank", "side_plank"],
      avoid: ["heavy_back_squat", "heavy_deadlift", "bodybuilding_accessories"]
    }
  },
  {
    title: "Mobility Work Integration",
    category: "mobility",
    principle_type: "programming",
    description: "Dynamic mobility before training, static stretching after. Daily mobility work improves movement quality and reduces injury risk",
    applicable_goals: ["mobility", "aesthetic", "athletic"],
    applicable_experience: ["beginner", "intermediate", "advanced"],
    author: "Kelly Starrett",
    book_title: "Becoming a Supple Leopard",
    guidelines: [
      "Dynamic stretching pre-workout (leg swings, arm circles)",
      "Static stretching post-workout (hold 30-60s)",
      "Daily joint mobility (ankle, hip, thoracic spine)",
      "Foam rolling for recovery and trigger point release",
      "Address movement restrictions before loading"
    ]
  },
  {
    title: "Periodization for Beginners",
    category: "athletic",
    principle_type: "programming",
    description: "Beginners benefit from linear periodization: gradually increase load week-to-week while maintaining high frequency and volume",
    applicable_goals: ["strength", "aesthetic", "athletic"],
    applicable_experience: ["beginner"],
    author: "Mark Rippetoe",
    book_title: "Starting Strength",
    guidelines: [
      "Add 5-10 lbs per session for lower body",
      "Add 2.5-5 lbs per session for upper body",
      "Train 3x per week full body",
      "Focus on squat, deadlift, press, row, pull-up",
      "Continue linear progression until stalling"
    ]
  },
  {
    title: "Block Periodization for Advanced Athletes",
    category: "athletic",
    principle_type: "programming",
    description: "Advanced athletes require block periodization: accumulation (volume), intensification (intensity), realization (peaking) phases",
    applicable_goals: ["strength", "powerlifting", "athletic"],
    applicable_experience: ["advanced"],
    author: "Vladimir Issurin",
    book_title: "Block Periodization",
    guidelines: [
      "Accumulation: High volume, moderate intensity (3-4 weeks)",
      "Intensification: Moderate volume, high intensity (2-3 weeks)",
      "Realization: Low volume, very high intensity (1-2 weeks)",
      "Deload: Active recovery (1 week)",
      "Repeat cycle for continuous progress"
    ]
  },
  {
    title: "Core Training for Spinal Stability",
    category: "athletic",
    principle_type: "exercise_selection",
    description: "Core training should prioritize anti-movement patterns (anti-extension, anti-rotation, anti-lateral flexion) over spinal flexion for functional stability",
    applicable_goals: ["athletic", "strength", "aesthetic"],
    applicable_experience: ["beginner", "intermediate", "advanced"],
    author: "Stuart McGill",
    book_title: "Low Back Disorders",
    exercise_recommendations: {
      tier_s: ["plank", "side_plank", "bird_dog", "dead_bug", "pallof_press"],
      tier_a: ["ab_wheel", "farmer_carry", "suitcase_carry"],
      avoid: ["sit_ups", "crunches", "repeated_spinal_flexion"]
    }
  },
  {
    title: "Female-Specific Programming Considerations",
    category: "aesthetics",
    principle_type: "personalization",
    description: "Women can handle higher relative volumes, recover faster between sets, and benefit from higher frequency training compared to men due to hormonal differences",
    applicable_goals: ["aesthetic", "strength"],
    applicable_experience: ["beginner", "intermediate", "advanced"],
    author: "Lyle McDonald",
    book_title: "The Women's Book",
    guidelines: [
      "Women can handle more volume per session",
      "Shorter rest periods (1-2 min) work well",
      "Higher training frequency (4-6x/week) effective",
      "Focus on glute development with hip thrusts, RDLs",
      "Upper body needs more frequency due to lower starting strength"
    ]
  },
  {
    title: "Deload Week Necessity",
    category: "athletic",
    principle_type: "programming",
    description: "Scheduled deloads every 3-6 weeks allow for recovery, supercompensation, and long-term progress by managing fatigue accumulation",
    applicable_goals: ["strength", "aesthetic", "athletic"],
    applicable_experience: ["intermediate", "advanced"],
    author: "Mike Israetel",
    book_title: "The Renaissance Periodization Handbook",
    guidelines: [
      "Reduce volume by 40-60% during deload week",
      "Maintain intensity (same weights, fewer sets)",
      "Schedule every 3-6 weeks depending on training age",
      "Active recovery: mobility, light cardio, technique work",
      "Return to training refreshed and ready for progression"
    ]
  },
  {
    title: "Concurrent Training - Cardio and Strength",
    category: "athletic",
    principle_type: "programming",
    description: "When combining cardio and strength training, separate by at least 6 hours or perform cardio after strength to minimize interference effect",
    applicable_goals: ["athletic", "aesthetic"],
    applicable_experience: ["intermediate", "advanced"],
    author: "Alex Viada",
    book_title: "The Hybrid Athlete",
    guidelines: [
      "Strength training before cardio if same session",
      "Separate by 6+ hours if possible",
      "Low-intensity cardio (zone 2) has minimal interference",
      "High-intensity intervals impair strength gains",
      "Prioritize based on primary goal"
    ]
  }
];

async function fillProgrammingKnowledge() {
  console.log("📚 Filling programming knowledge table...\n");

  let count = 0;

  for (const knowledge of PROGRAMMING_KNOWLEDGE) {
    try {
      await convex.mutation(api.mutations.saveProgrammingKnowledge, knowledge);
      count++;
      console.log(`✅ [${count}/${PROGRAMMING_KNOWLEDGE.length}] ${knowledge.title}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ Error adding ${knowledge.title}:`, error);
    }
  }

  console.log(`\n✨ Programming knowledge complete: ${count} entries added`);
}

fillProgrammingKnowledge()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
