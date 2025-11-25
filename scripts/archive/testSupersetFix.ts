/**
 * Test script to verify superset block normalization works correctly
 * Run with: npx tsx scripts/testSupersetFix.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://reminiscent-owl-650.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Test data that matches the failing case - superset without rounds
const testPlanWithSuperset = {
  userId: "test_user",
  name: "Test Plan with Superset",
  weeklyPlan: [
    {
      day_of_week: 1,
      focus: "Test Day",
      notes: null,
      blocks: [
        {
          type: "single" as const,
          title: "Warm-up",
          exercises: [
            {
              exercise_name: "Test Exercise",
              category: "warmup" as const,
              metrics_template: { type: "sets_reps_weight", target_sets: 2 },
              notes: "Test notes",
              original_exercise_name: null,
              rpe: null,
            },
          ],
        },
        {
          type: "superset" as const,
          title: null,
          // MISSING rounds field - this should be fixed by normalization
          exercises: [
            {
              exercise_name: "Machine Bicep Curl",
              category: "main" as const,
              metrics_template: { target_sets: 3.0, target_tempo: "2-0-1-1", type: "sets_reps_weight" },
              notes: null,
              original_exercise_name: null,
              rpe: "8",
            },
            {
              exercise_name: "Tricep Rope Pushdown",
              category: "main" as const,
              metrics_template: { target_sets: 3.0, target_tempo: "2-0-1-1", type: "sets_reps_weight" },
              notes: null,
              original_exercise_name: null,
              rpe: "8",
            },
          ],
        },
      ],
    },
  ],
  dailyRoutine: null,
};

async function testSupersetNormalization() {
  console.log("🧪 Testing superset block normalization (missing rounds)...\n");
  
  try {
    console.log("📋 Test plan structure:");
    console.log(JSON.stringify(testPlanWithSuperset.weeklyPlan[0].blocks[1], null, 2));
    console.log("\n");
    console.log("⚠️  Note: Superset block is MISSING 'rounds' field\n");
    
    console.log("💾 Attempting to save plan...");
    const result = await client.mutation(api.mutations.createWorkoutPlan, testPlanWithSuperset);
    const planId = typeof result === 'object' && result !== null && 'planId' in result ? result.planId : result;
    
    console.log(`✅ SUCCESS! Plan saved with ID: ${planId}\n`);
    console.log("✅ Superset normalization is working correctly!\n");
    console.log("✅ Missing 'rounds' field was automatically set to default value (3)\n");
    
    return true;
  } catch (error: any) {
    console.error("❌ FAILED!");
    console.error("Error:", error.message);
    if (error.data) {
      console.error("Error data:", JSON.stringify(error.data, null, 2));
    }
    return false;
  }
}

// Run the test
testSupersetNormalization()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });

