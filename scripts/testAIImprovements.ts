/**
 * Test AI Generation Improvements
 *
 * Tests the new retry logic, JSON extraction, duration estimation, and HR guidance
 */

import { GoogleGenAI } from "@google/genai";
import {
  extractAndParseJSON,
  generateWithRetry,
  estimateWorkoutDuration,
  addDurationEstimates,
  getHeartRateGuidance,
  getDurationConstraintPrompt,
} from "../convex/utils/aiHelpers";
import { validateWorkoutPlan } from "../convex/planValidator";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in environment");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

console.log("\n🧪 TESTING AI IMPROVEMENTS\n");
console.log("=" .repeat(60));

// Test 1: JSON Extraction with markdown wrappers
console.log("\n📝 Test 1: Robust JSON Extraction");
console.log("-".repeat(60));

const testCases = [
  {
    name: "Markdown wrapper",
    input: '```json\n{"name": "Test Plan", "weeklyPlan": []}\n```',
  },
  {
    name: "Extra text before",
    input: 'Here is your plan:\n{"name": "Test Plan", "weeklyPlan": []}',
  },
  {
    name: "Trailing commas",
    input: '{"name": "Test Plan", "weeklyPlan": [],}',
  },
  {
    name: "Clean JSON",
    input: '{"name": "Test Plan", "weeklyPlan": []}',
  },
];

for (const testCase of testCases) {
  try {
    const result = extractAndParseJSON(testCase.input);
    console.log(`✅ ${testCase.name}: SUCCESS`);
    console.log(`   Extracted: ${result.name}`);
  } catch (error: any) {
    console.log(`❌ ${testCase.name}: FAILED - ${error.message}`);
  }
}

// Test 2: Duration Estimation
console.log("\n⏱️  Test 2: Workout Duration Estimation");
console.log("-".repeat(60));

const sampleDay = {
  day_of_week: 1,
  focus: "Upper Body",
  blocks: [
    {
      type: "single",
      exercises: [
        {
          exercise_name: "Dynamic Stretching",
          category: "warmup",
          metrics_template: { type: "duration_only" },
        },
        {
          exercise_name: "Shoulder Circles",
          category: "warmup",
          metrics_template: { type: "duration_only" },
        },
      ],
    },
    {
      type: "single",
      exercises: [
        {
          exercise_name: "Bench Press",
          category: "main",
          metrics_template: { type: "sets_reps_weight", target_sets: 4 },
          rest_seconds: 180,
        },
        {
          exercise_name: "Rows",
          category: "main",
          metrics_template: { type: "sets_reps_weight", target_sets: 3 },
          rest_seconds: 120,
        },
      ],
    },
    {
      type: "single",
      exercises: [
        {
          exercise_name: "Treadmill Run",
          category: "main",
          metrics_template: { type: "duration_only", duration_minutes: 30 },
        },
      ],
    },
    {
      type: "single",
      exercises: [
        {
          exercise_name: "Chest Stretch",
          category: "cooldown",
          metrics_template: { type: "duration_only" },
        },
        {
          exercise_name: "Hamstring Stretch",
          category: "cooldown",
          metrics_template: { type: "duration_only" },
        },
      ],
    },
  ],
};

const estimatedDuration = estimateWorkoutDuration(sampleDay);
console.log(`✅ Estimated duration: ${estimatedDuration} minutes`);
console.log(`   Breakdown:`);
console.log(`   - Warmup: 2 exercises × 1 min = 2 min`);
console.log(`   - Bench Press: 4 sets × 3.5 min = 14 min`);
console.log(`   - Rows: 3 sets × 2.5 min = 7.5 min`);
console.log(`   - Cardio: 30 min`);
console.log(`   - Cooldown: 2 exercises × 1 min = 2 min`);
console.log(`   Expected: ~55-60 min`);

// Test 3: Heart Rate Guidance Prompt
console.log("\n❤️  Test 3: Heart Rate Zone Guidance");
console.log("-".repeat(60));

const hrGuidance = getHeartRateGuidance();
console.log("✅ Heart rate guidance generated:");
console.log(hrGuidance.substring(0, 200) + "...");

// Test 4: Duration Constraint Prompt
console.log("\n🎯 Test 4: Duration Constraint Prompt");
console.log("-".repeat(60));

const durationPrompt = getDurationConstraintPrompt(60);
console.log("✅ Duration constraint for 60-minute sessions:");
console.log(durationPrompt.substring(0, 200) + "...");

// Test 5: Plan Post-Processing (Duration Estimates)
console.log("\n🔧 Test 5: Add Duration Estimates to Plan");
console.log("-".repeat(60));

const samplePlan = {
  name: "Test Plan",
  weeklyPlan: [
    sampleDay,
    {
      day_of_week: 2,
      focus: "2x Daily Training",
      sessions: [
        {
          session_name: "AM Cardio",
          time_of_day: "morning",
          blocks: [
            {
              type: "single",
              exercises: [
                {
                  exercise_name: "Treadmill Run",
                  category: "main",
                  metrics_template: { type: "duration_only", duration_minutes: 45 },
                },
              ],
            },
          ],
        },
        {
          session_name: "PM Strength",
          time_of_day: "evening",
          blocks: [
            {
              type: "single",
              exercises: [
                {
                  exercise_name: "Squats",
                  category: "main",
                  metrics_template: { type: "sets_reps_weight", target_sets: 5 },
                  rest_seconds: 180,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

addDurationEstimates(samplePlan);

console.log("✅ Duration estimates added:");
console.log(`   Day 1 (single session): ${samplePlan.weeklyPlan[0].estimated_duration} min`);
console.log(`   Day 2 AM session: ${samplePlan.weeklyPlan[1].sessions![0].estimated_duration} min`);
console.log(`   Day 2 PM session: ${samplePlan.weeklyPlan[1].sessions![1].estimated_duration} min`);

// Test 6: Retry Logic (Simulated)
console.log("\n🔄 Test 6: Retry Logic with Validation");
console.log("-".repeat(60));

console.log("Testing retry logic with a simple AI generation...");

const simplePrompt = `Generate a minimal valid workout plan with this structure:
{
  "name": "Simple Test Plan",
  "weeklyPlan": [
    {
      "day_of_week": 1,
      "focus": "Full Body",
      "blocks": [
        {
          "type": "single",
          "exercises": [
            {
              "exercise_name": "Push-ups",
              "category": "main",
              "metrics_template": { "type": "sets_reps", "target_sets": 3, "target_reps": 10 }
            }
          ]
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
}

CRITICAL: Return ONLY valid JSON matching this exact structure.`;

try {
  console.log("⏳ Calling AI with retry logic (this may take 10-20 seconds)...");

  const result = await generateWithRetry(
    ai.models,
    {
      model: "gemini-2.5-flash",
      contents: simplePrompt,
      config: {
        responseMimeType: "application/json",
      },
    },
    validateWorkoutPlan,
    3 // Max 3 attempts
  );

  console.log("✅ Generation successful with retry logic!");
  console.log(`   Plan name: ${result.name}`);
  console.log(`   Days in plan: ${result.weeklyPlan?.length || 0}`);

  const validation = validateWorkoutPlan(result);
  console.log(`   Validation: ${validation.valid ? "✅ VALID" : "❌ INVALID"}`);
  if (validation.errors.length > 0) {
    console.log(`   Errors: ${validation.errors.join(", ")}`);
  }
  if (validation.warnings.length > 0) {
    console.log(`   Warnings: ${validation.warnings.join(", ")}`);
  }
} catch (error: any) {
  console.log(`❌ Generation failed: ${error.message}`);
}

console.log("\n" + "=".repeat(60));
console.log("🎉 ALL TESTS COMPLETED");
console.log("=".repeat(60) + "\n");
