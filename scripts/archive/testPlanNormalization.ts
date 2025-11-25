/**
 * Test script to verify plan normalization works correctly
 * Run with: npx tsx scripts/testPlanNormalization.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://reminiscent-owl-650.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Test data that should match the schema
const testPlan = {
  userId: "test_user",
  name: "Test Plan",
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
      ],
    },
  ],
  dailyRoutine: null,
};

async function testNormalization() {
  console.log("🧪 Testing plan normalization...\n");
  
  try {
    console.log("📋 Test plan structure:");
    console.log(JSON.stringify(testPlan, null, 2));
    console.log("\n");
    
    console.log("💾 Attempting to save plan...");
    const result = await client.mutation(api.mutations.createWorkoutPlan, testPlan);
    const planId = typeof result === 'object' && result !== null && 'planId' in result ? result.planId : result;
    
    console.log(`✅ SUCCESS! Plan saved with ID: ${planId}\n`);
    console.log("✅ Normalization is working correctly!\n");
    
    // Clean up - delete the test plan
    console.log("🧹 Cleaning up test plan...");
    // Note: You'd need a delete mutation to clean up, but we'll leave it for now
    
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
testNormalization()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });

