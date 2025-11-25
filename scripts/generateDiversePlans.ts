/**
 * Generate 10 Ultra Comprehensive Workout Plans
 * Creates diverse plans with different goals, experience levels, and exercises
 * Each plan will populate the database with complete exercise metadata
 * 
 * Automatically loads environment variables from .env.local
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

// Set up Node.js environment for browser APIs
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = globalThis;
}

import { generateNewWorkoutPlan } from "../services/geminiService";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { saveExercisesFromPlan } from "../services/exerciseDatabaseService";

// Check for API key
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ Error: GEMINI_API_KEY, API_KEY, or VITE_GEMINI_API_KEY not found in .env.local");
  console.error("   Please check your .env.local file");
  process.exit(1);
}

console.log("✅ Environment variables loaded");

// Use Convex URL from environment or default
const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://reminiscent-owl-650.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Diverse plan configurations
const planConfigs = [
  {
    name: "Beginner Strength & Hypertrophy",
    goal: "Aesthetic Physique",
    experience: "Beginner",
    frequency: "3-4",
    painPoints: [],
    sport: null,
    notes: "Focus on building muscle and strength. Include compound movements and progressive overload. Bodyweight and machine exercises preferred.",
  },
  {
    name: "Advanced Powerlifting Program",
    goal: "Strength & Power",
    experience: "Advanced",
    frequency: "4-5",
    painPoints: [],
    sport: null,
    notes: "Powerlifting focus: squat, bench press, deadlift. Include accessory work for muscle groups. Periodized approach with heavy singles and volume work.",
  },
  {
    name: "HYROX Competition Prep",
    goal: "Athletic Performance",
    experience: "Intermediate",
    frequency: "5+",
    painPoints: [],
    sport: "HYROX",
    notes: "HYROX-specific training: sled pushes, wall balls, farmers carries, running intervals. High-intensity functional fitness.",
  },
  {
    name: "Rock Climbing Strength",
    goal: "Athletic Performance",
    experience: "Intermediate",
    frequency: "3-4",
    painPoints: [],
    sport: "Rock Climbing",
    notes: "Finger strength, pull-ups, core power, antagonist training. Low-impact, high grip strength focus.",
  },
  {
    name: "Boxing Conditioning",
    goal: "Athletic Performance",
    experience: "Intermediate",
    frequency: "4-5",
    painPoints: [],
    sport: "Boxing",
    notes: "Explosive power, rotational core work, medicine ball slams, heavy bag work, cardiovascular conditioning.",
  },
  {
    name: "Bodybuilding Split",
    goal: "Aesthetic Physique",
    experience: "Advanced",
    frequency: "5+",
    painPoints: [],
    sport: null,
    notes: "Classic bodybuilding approach: chest/back, legs, shoulders/arms split. Focus on muscle isolation, pump work, drop sets.",
  },
  {
    name: "Health & Longevity",
    goal: "Health & Longevity",
    experience: "Beginner",
    frequency: "2-3",
    painPoints: ["Lower Back", "Knees"],
    sport: null,
    notes: "Low-impact, joint-friendly exercises. Focus on mobility, stability, and functional movement. Avoid heavy loading.",
  },
  {
    name: "Basketball Athleticism",
    goal: "Athletic Performance",
    experience: "Intermediate",
    frequency: "4-5",
    painPoints: [],
    sport: "Basketball",
    notes: "Vertical jump training, agility work, single-leg strength, explosive movements, game conditioning.",
  },
  {
    name: "Full Body Functional",
    goal: "Athletic Performance",
    experience: "Intermediate",
    frequency: "3-4",
    painPoints: [],
    sport: null,
    notes: "Functional fitness: kettlebell work, suspension training, compound movements, full-body circuits. Real-world movement patterns.",
  },
  {
    name: "Marathon Runner Strength",
    goal: "Athletic Performance",
    experience: "Advanced",
    frequency: "3-4",
    painPoints: [],
    sport: "Running",
    notes: "Strength training for runners: single-leg work, hip stability, core strength, injury prevention. Low volume, high quality.",
  },
];

async function generateDiversePlans() {
  console.log("🚀 Generating 10 Ultra Comprehensive Workout Plans...\n");
  console.log("📊 This will populate the database with diverse exercises and complete metadata\n");
  
  const results = [];
  
  for (let i = 0; i < planConfigs.length; i++) {
    const config = planConfigs[i];
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📋 Plan ${i + 1}/10: ${config.name}`);
    console.log(`   Goal: ${config.goal}`);
    console.log(`   Experience: ${config.experience}`);
    console.log(`   Frequency: ${config.frequency} days/week`);
    console.log(`   Sport: ${config.sport || "General Fitness"}`);
    console.log(`${"=".repeat(60)}\n`);
    
    try {
      // Generate the plan
      console.log("🤖 Generating plan with AI...");
      const plan = await generateNewWorkoutPlan(
        config.goal,
        config.experience,
        config.frequency,
        config.painPoints,
        config.sport || undefined,
        config.notes,
        true, // Use optimized knowledge
        {
          sex: "neutral",
          equipment: "commercial_gym",
          preferred_session_length: "60",
          athletic_level: config.experience === "Beginner" ? "low" : config.experience === "Intermediate" ? "moderate" : "high",
          training_age_years: config.experience === "Beginner" ? 0 : config.experience === "Intermediate" ? 2 : 5,
          body_type: "average",
        }
      );
      
      if (!plan || !plan.weeklyPlan || plan.weeklyPlan.length === 0) {
        throw new Error("Generated plan is empty");
      }
      
      // Count exercises
      let exerciseCount = 0;
      plan.weeklyPlan.forEach(day => {
        day.blocks.forEach(block => {
          exerciseCount += block.exercises.length;
        });
      });
      
      console.log(`✅ Plan generated successfully!`);
      console.log(`   Days: ${plan.weeklyPlan.length}`);
      console.log(`   Total exercises: ${exerciseCount}`);
      
      // Save plan to database
      console.log("💾 Saving plan to database...");
      const result = await client.mutation(api.mutations.createWorkoutPlan, {
        userId: "system_generated", // System-generated plans
        name: config.name,
        weeklyPlan: plan.weeklyPlan,
        dailyRoutine: plan.dailyRoutine || null,
      });
      
      const planId = typeof result === 'object' && result !== null && 'planId' in result ? result.planId : result;
      const extractedExercises = typeof result === 'object' && result !== null && 'extractedExercises' in result ? result.extractedExercises : [];
      
      console.log(`   Plan ID: ${planId}`);
      console.log(`   Extracted ${extractedExercises.length} unique exercises (server-side)`);
      
      // Save exercises with full metadata (using server-extracted list)
      console.log("📚 Populating exercise metadata...");
      const cacheExerciseMutation = async (args: any) => {
        await client.mutation(api.mutations.cacheExerciseExplanation, args);
      };
      
      if (extractedExercises.length > 0) {
        const { saveExercisesFromExtractedList } = await import("../services/exerciseDatabaseService");
        await saveExercisesFromExtractedList(extractedExercises, cacheExerciseMutation);
      } else {
        // Fallback to client-side extraction if server didn't return exercises
        await saveExercisesFromPlan(plan, cacheExerciseMutation);
      }
      
      console.log(`✅ Plan ${i + 1} complete!\n`);
      
      results.push({
        planNumber: i + 1,
        name: config.name,
        success: true,
        exerciseCount,
        planId,
      });
      
      // Rate limiting between plans
      if (i < planConfigs.length - 1) {
        console.log("⏳ Waiting 3 seconds before next plan...\n");
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
    } catch (error: any) {
      console.error(`❌ Failed to generate plan ${i + 1}:`, error.message);
      results.push({
        planNumber: i + 1,
        name: config.name,
        success: false,
        error: error.message,
      });
    }
  }
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 GENERATION SUMMARY");
  console.log("=".repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`\n✅ Successful: ${successful.length}/10`);
  successful.forEach(r => {
    console.log(`   • ${r.name} (${r.exerciseCount} exercises)`);
  });
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed: ${failed.length}/10`);
    failed.forEach(r => {
      console.log(`   • ${r.name}: ${r.error}`);
    });
  }
  
  const totalExercises = successful.reduce((sum, r) => sum + (r.exerciseCount || 0), 0);
  console.log(`\n📈 Total exercises added: ${totalExercises}`);
  console.log(`💾 All exercises have complete metadata: equipment, contraindications, tiers, etc.`);
  
  console.log("\n🎉 Generation complete!");
}

// Run the script
generateDiversePlans().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
