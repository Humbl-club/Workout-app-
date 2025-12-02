/**
 * Test Complex AI Generation Scenarios
 *
 * Tests 2x daily training, sport-specific programming, and duration constraints
 */

import { GoogleGenAI } from "@google/genai";
import { generateWithRetry, addDurationEstimates } from "../convex/utils/aiHelpers";
import { validateWorkoutPlan } from "../convex/planValidator";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in environment");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

console.log("\n🧪 TESTING COMPLEX GENERATION SCENARIOS\n");
console.log("=".repeat(60));

// Test 1: 2x Daily Training with Cardio + Strength
console.log("\n🏃 Test 1: 2x Daily Training (AM Cardio + PM Strength)");
console.log("-".repeat(60));

const twoADayPrompt = `Generate a 2x daily training plan for Monday with these requirements:

**STRUCTURE:**
- AM Session (morning): 45-minute cardio session
  - Treadmill Run: 45 minutes at Zone 2 (120-130 BPM)
- PM Session (evening): 60-minute strength session
  - Full body workout with compound movements
  - Include warmup and cooldown

**CRITICAL RULES:**
1. Use "sessions" array (NOT "blocks" at day level)
2. Each session must have "session_name", "time_of_day" ("morning" or "evening"), "estimated_duration", and "blocks"
3. Add heart rate guidance to cardio exercises in notes
4. Every exercise MUST have "category": "warmup" | "main" | "cooldown"

Return JSON:
{
  "name": "2x Daily Test Plan",
  "weeklyPlan": [
    {
      "day_of_week": 1,
      "focus": "Cardio + Strength",
      "sessions": [
        {
          "session_name": "AM Cardio",
          "time_of_day": "morning",
          "estimated_duration": 45,
          "blocks": [...]
        },
        {
          "session_name": "PM Strength",
          "time_of_day": "evening",
          "estimated_duration": 60,
          "blocks": [...]
        }
      ]
    },
    {
      "day_of_week": 2,
      "focus": "Rest",
      "blocks": []
    },
    {
      "day_of_week": 3,
      "focus": "Rest",
      "blocks": []
    },
    {
      "day_of_week": 4,
      "focus": "Rest",
      "blocks": []
    },
    {
      "day_of_week": 5,
      "focus": "Rest",
      "blocks": []
    },
    {
      "day_of_week": 6,
      "focus": "Rest",
      "blocks": []
    },
    {
      "day_of_week": 7,
      "focus": "Rest",
      "blocks": []
    }
  ]
}`;

try {
  console.log("⏳ Generating 2x daily plan (may take 20-30 seconds)...");

  const result = await generateWithRetry(
    ai.models,
    {
      model: "gemini-2.5-flash",
      contents: twoADayPrompt,
      config: {
        responseMimeType: "application/json",
      },
    },
    validateWorkoutPlan,
    3
  );

  addDurationEstimates(result);

  console.log("✅ 2x Daily Plan Generated Successfully!");
  console.log(`   Plan name: ${result.name}`);

  const day1 = result.weeklyPlan[0];
  if (day1.sessions && day1.sessions.length === 2) {
    console.log(`   ✅ Day 1 has 2 sessions`);
    console.log(`      - ${day1.sessions[0].session_name} (${day1.sessions[0].time_of_day}): ${day1.sessions[0].estimated_duration || "?"} min`);
    console.log(`      - ${day1.sessions[1].session_name} (${day1.sessions[1].time_of_day}): ${day1.sessions[1].estimated_duration || "?"} min`);

    // Check for heart rate guidance in cardio
    const amSession = day1.sessions[0];
    const cardioExercises = amSession.blocks?.flatMap((b: any) => b.exercises || []).filter((e: any) =>
      e.exercise_name?.toLowerCase().includes('treadmill') ||
      e.exercise_name?.toLowerCase().includes('run')
    );

    if (cardioExercises && cardioExercises.length > 0) {
      const hasHRGuidance = cardioExercises.some((e: any) =>
        e.notes?.includes('BPM') || e.notes?.includes('Zone')
      );
      console.log(`   ${hasHRGuidance ? '✅' : '⚠️'} Heart rate guidance in cardio: ${hasHRGuidance ? 'YES' : 'NO'}`);
    }
  } else {
    console.log(`   ❌ Day 1 does not have 2 sessions (found ${day1.sessions?.length || 0})`);
  }

  const validation = validateWorkoutPlan(result);
  console.log(`   Validation: ${validation.valid ? "✅ VALID" : "❌ INVALID"}`);
  if (validation.errors.length > 0) {
    console.log(`   Errors: ${validation.errors.join(", ")}`);
  }
} catch (error: any) {
  console.log(`❌ Test 1 failed: ${error.message}`);
}

// Test 2: Duration Constraint Enforcement
console.log("\n⏱️  Test 2: 60-Minute Duration Constraint");
console.log("-".repeat(60));

const durationConstraintPrompt = `Generate a single-session workout for Monday that MUST fit within 60 minutes.

**CRITICAL: SESSION DURATION CONSTRAINT**
User requested 60-minute workouts.
Your plan MUST fit within 60 ± 10 minutes.

**Duration Calculation:**
- Warmup: ~1 minute per exercise (5-7 min total)
- Strength work: 3 sets × (30s work + 2min rest) = ~8 minutes per exercise
- Cardio: Use duration_minutes directly
- Cooldown: ~1 minute per exercise (3-5 min total)
- Supersets: Count exercises separately, rest applies between rounds

**Example for 60-minute session:**
- Warmup: 7 exercises = 7 min
- Main work: 5 exercises × 8 min = 40 min
- Cooldown: 4 stretches = 4 min
- Total: 51 minutes ✓

Add "estimated_duration": 60 to the day.
If the plan exceeds 70 minutes, REMOVE exercises until it fits.

Return a plan with exactly this structure and calculate duration to fit 60 minutes:
{
  "name": "60-Minute Test Plan",
  "weeklyPlan": [
    {
      "day_of_week": 1,
      "focus": "Upper Body Strength",
      "estimated_duration": 60,
      "blocks": [
        {
          "type": "single",
          "exercises": [
            // 5-7 warmup exercises (~7 min)
            // 4-5 main exercises (~40 min)
            // 3-4 cooldown exercises (~4 min)
          ]
        }
      ]
    },
    // Days 2-7 as rest days
  ]
}

CRITICAL: Every exercise must have "category": "warmup" | "main" | "cooldown"`;

try {
  console.log("⏳ Generating duration-constrained plan (may take 20-30 seconds)...");

  const result = await generateWithRetry(
    ai.models,
    {
      model: "gemini-2.5-flash",
      contents: durationConstraintPrompt,
      config: {
        responseMimeType: "application/json",
      },
    },
    validateWorkoutPlan,
    3
  );

  addDurationEstimates(result);

  console.log("✅ Duration-Constrained Plan Generated Successfully!");
  console.log(`   Plan name: ${result.name}`);

  const day1 = result.weeklyPlan[0];
  const actualDuration = day1.estimated_duration || 0;
  const targetDuration = 60;
  const withinRange = actualDuration >= 50 && actualDuration <= 70;

  console.log(`   Target duration: ${targetDuration} ± 10 minutes`);
  console.log(`   Actual duration: ${actualDuration} minutes`);
  console.log(`   ${withinRange ? '✅' : '❌'} Duration ${withinRange ? 'within range' : 'OUT OF RANGE'}`);

  // Count exercises by category
  const exercises = day1.blocks?.flatMap((b: any) => b.exercises || []) || [];
  const warmup = exercises.filter((e: any) => e.category === 'warmup').length;
  const main = exercises.filter((e: any) => e.category === 'main').length;
  const cooldown = exercises.filter((e: any) => e.category === 'cooldown').length;

  console.log(`   Exercise breakdown: ${warmup} warmup + ${main} main + ${cooldown} cooldown`);

  const validation = validateWorkoutPlan(result);
  console.log(`   Validation: ${validation.valid ? "✅ VALID" : "❌ INVALID"}`);
  if (validation.errors.length > 0) {
    console.log(`   Errors: ${validation.errors.join(", ")}`);
  }
} catch (error: any) {
  console.log(`❌ Test 2 failed: ${error.message}`);
}

console.log("\n" + "=".repeat(60));
console.log("🎉 COMPLEX SCENARIO TESTS COMPLETED");
console.log("=".repeat(60) + "\n");
