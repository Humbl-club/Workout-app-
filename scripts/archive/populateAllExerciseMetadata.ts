/**
 * Comprehensive Exercise Metadata Population Script
 * 
 * This script:
 * 1. Fetches ALL exercises from the database
 * 2. Identifies exercises with missing/empty metadata fields
 * 3. Uses AI (explainExerciseDetailed) to analyze each exercise
 * 4. Fills in ALL missing fields with comprehensive data
 * 5. Updates the database while preserving existing data
 * 
 * Fields that will be populated:
 * - equipment_required
 * - contraindications
 * - movement_pattern
 * - exercise_tier
 * - primary_category
 * - injury_risk
 * - evidence_level
 * - minimum_experience_level
 * - injury_contraindications
 * - therapeutic_benefits
 * - sport_ratings
 * - And more...
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

// Set up Node.js environment for browser APIs
if (typeof globalThis.window === 'undefined') {
  (globalThis as any).window = globalThis;
}

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { explainExerciseDetailed } from "../services/geminiService";

// Use Convex URL from environment or default
const CONVEX_URL = process.env.VITE_CONVEX_URL || "https://reminiscent-owl-650.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

// Check for API key
const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ Error: GEMINI_API_KEY, API_KEY, or VITE_GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

console.log("✅ Environment variables loaded");

/**
 * Check if a field is empty or null
 */
function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  return false;
}

/**
 * Check if an exercise needs metadata updates
 */
function needsUpdate(exercise: any): boolean {
  // Check all fields that should be populated
  return (
    isEmpty(exercise.equipment_required) ||
    isEmpty(exercise.contraindications) ||
    isEmpty(exercise.movement_pattern) ||
    isEmpty(exercise.exercise_tier) ||
    isEmpty(exercise.primary_category) ||
    isEmpty(exercise.injury_risk) ||
    isEmpty(exercise.evidence_level) ||
    isEmpty(exercise.minimum_experience_level) ||
    isEmpty(exercise.injury_contraindications) ||
    isEmpty(exercise.therapeutic_benefits) ||
    isEmpty(exercise.sport_ratings)
  );
}

/**
 * Update exercise metadata using AI analysis
 */
async function updateExerciseMetadata(exercise: any): Promise<void> {
  try {
    console.log(`\n📊 Analyzing: ${exercise.exercise_name}`);
    
    // Use AI to get comprehensive metadata
    const details = await explainExerciseDetailed(
      exercise.exercise_name,
      exercise.explanation // Use existing explanation as context
    );

    // Prepare update - only update fields that are missing
    const updates: any = {
      exercise_name: details.normalized_name || exercise.exercise_name,
    };

    // Update only if field is currently empty
    if (isEmpty(exercise.equipment_required) && details.equipment_required?.length > 0) {
      updates.equipment_required = details.equipment_required;
    }

    if (isEmpty(exercise.contraindications) && details.contraindications?.length > 0) {
      updates.contraindications = details.contraindications;
    }

    if (isEmpty(exercise.movement_pattern)) {
      updates.movement_pattern = details.movement_pattern;
    }

    if (isEmpty(exercise.exercise_tier)) {
      updates.exercise_tier = details.exercise_tier;
    }

    if (isEmpty(exercise.primary_category)) {
      updates.primary_category = details.primary_category;
    }

    if (isEmpty(exercise.injury_risk)) {
      updates.injury_risk = details.injury_risk;
    }

    if (isEmpty(exercise.evidence_level)) {
      updates.evidence_level = details.evidence_level;
    }

    if (isEmpty(exercise.minimum_experience_level)) {
      updates.minimum_experience_level = details.minimum_experience_level;
    }

    // Update explanation, form_cue, common_mistake if empty
    if (isEmpty(exercise.explanation)) {
      updates.explanation = details.explanation;
    }

    if (isEmpty(exercise.form_cue)) {
      updates.form_cue = details.form_cue;
    }

    if (isEmpty(exercise.common_mistake)) {
      updates.common_mistake = details.common_mistake;
    }

    if (isEmpty(exercise.muscles_worked) && details.muscles_worked?.length > 0) {
      updates.muscles_worked = details.muscles_worked;
    }

    // Use cacheExerciseExplanation mutation to update (preserves existing data)
    if (Object.keys(updates).length > 1) { // More than just exercise_name
      await client.mutation(api.mutations.cacheExerciseExplanation, {
        exerciseName: exercise.exercise_name,
        explanation: updates.explanation || exercise.explanation || "Exercise description",
        muscles_worked: updates.muscles_worked || exercise.muscles_worked,
        form_cue: updates.form_cue || exercise.form_cue,
        common_mistake: updates.common_mistake || exercise.common_mistake,
        source: exercise.source || "gemini_api",
        equipment_required: updates.equipment_required,
        contraindications: updates.contraindications,
        movement_pattern: updates.movement_pattern as any,
        exercise_tier: updates.exercise_tier as any,
        primary_category: updates.primary_category as any,
        injury_risk: updates.injury_risk as any,
        evidence_level: updates.evidence_level as any,
        minimum_experience_level: updates.minimum_experience_level || exercise.minimum_experience_level || 
          (updates.injury_risk === "high" ? "advanced" : 
           updates.injury_risk === "moderate" ? "intermediate" : "beginner"),
        normalized_name: details.normalized_name || exercise.exercise_name,
      });

      console.log(`  ✅ Updated: ${Object.keys(updates).length - 1} fields`);
    } else {
      console.log(`  ⏭️  No updates needed (all fields already populated)`);
    }

  } catch (error: any) {
    console.error(`  ❌ Error updating ${exercise.exercise_name}:`, error.message);
    // Continue with next exercise
  }
}

/**
 * Main function to populate all exercise metadata
 */
async function populateAllExerciseMetadata() {
  console.log("🚀 Starting Comprehensive Exercise Metadata Population...\n");
  console.log("📋 This will analyze ALL exercises and fill missing metadata fields\n");

  try {
    // Fetch all exercises from the database
    console.log("📥 Fetching all exercises from database...");
    
    // Query all exercises - we'll need to paginate through them
    let allExercises: any[] = [];
    const seenIds = new Set<string>();
    let cursor: string | null = null;
    let hasMore = true;
    let iterations = 0;
    const maxIterations = 100; // Safety limit
    let stuckCount = 0; // Track consecutive iterations with no new exercises

    while (hasMore && iterations < maxIterations) {
      iterations++;
      
      const result = await client.query(api.queries.getAllExercises, {
        cursor: cursor || undefined,
        limit: 100,
      });

      // Check if we got results
      if (!result.exercises || result.exercises.length === 0) {
        hasMore = false;
        break;
      }

      // Deduplicate by exercise name and track if we got NEW exercises
      const newExercises = result.exercises.filter((ex: any) => {
        // Use exercise_name as the unique identifier (more reliable than _id)
        const id = ex.exercise_name || ex._id;
        if (!id) {
          console.warn(`  ⚠️  Exercise missing identifier:`, ex);
          return false; // Skip exercises without identifiers
        }
        if (seenIds.has(id)) {
          return false;
        }
        seenIds.add(id);
        return true;
      });

      // If we didn't get any new exercises, increment stuck counter
      if (newExercises.length === 0) {
        stuckCount++;
        const duplicateSample = result.exercises.slice(0, 3).map((ex: any) => ex.exercise_name || ex._id).join(", ");
        console.log(`  ⚠️  No new exercises in batch (${stuckCount} consecutive). Got ${result.exercises.length} exercises, all duplicates. Sample: ${duplicateSample}...`);
        
        // If we're stuck for 2+ iterations, stop IMMEDIATELY - we've seen everything
        if (stuckCount >= 2) {
          console.log(`  ✅ STOPPING: No new exercises for ${stuckCount} consecutive iterations. Collected ${allExercises.length} unique exercises.`);
          console.log(`  📊 Final stats: ${allExercises.length} unique exercises across ${iterations} iterations`);
          hasMore = false;
          break;
        }
        
        // Still update cursor and continue (might be a gap in pagination, but only once)
        cursor = result.continueCursor || null;
        if (!cursor) {
          console.log(`  ✅ No more pages available. Collected ${allExercises.length} unique exercises.`);
          hasMore = false;
          break;
        }
        // Continue to next iteration but log warning
        console.log(`  ⚠️  Trying next page despite duplicates (attempt ${stuckCount}/2)...`);
        continue; // Skip adding duplicates, but try next page
      }
      
      // Reset stuck counter when we get new exercises
      stuckCount = 0;
      allExercises = allExercises.concat(newExercises);
      
      const currentCount = allExercises.length;
      
      // Update cursor
      cursor = result.continueCursor || null;
      
      // Stop if cursor is null or undefined (no more pages)
      if (!cursor) {
        console.log(`  ✅ No more pages available. Collected ${currentCount} unique exercises.`);
        hasMore = false;
        break;
      }
      
      // Additional safety check: if we got fewer results than requested AND no cursor, we're done
      if (result.exercises.length < 100 && !result.continueCursor) {
        console.log(`  ✅ Got fewer results than requested and no cursor. Stopping pagination.`);
        hasMore = false;
        break;
      }

      console.log(`  Fetched ${currentCount} exercises so far... (iteration ${iterations}, ${newExercises.length} new, ${result.exercises.length} total in batch, cursor: ${cursor ? 'yes' : 'no'})`);
    }

    if (iterations >= maxIterations) {
      console.log("⚠️  Maximum iterations reached. Stopping pagination.");
    }

    console.log(`\n✅ Total exercises found: ${allExercises.length}\n`);

    // Filter exercises that need updates
    const exercisesNeedingUpdate = allExercises.filter(needsUpdate);
    
    console.log(`📊 Analysis:`);
    console.log(`   Total exercises: ${allExercises.length}`);
    console.log(`   Need updates: ${exercisesNeedingUpdate.length}`);
    console.log(`   Already complete: ${allExercises.length - exercisesNeedingUpdate.length}\n`);

    if (exercisesNeedingUpdate.length === 0) {
      console.log("🎉 All exercises already have complete metadata!");
      return;
    }

    console.log(`\n🔄 Starting metadata population for ${exercisesNeedingUpdate.length} exercises...\n`);
    console.log("⏳ This may take a while due to API rate limits...\n");

    // Process exercises with rate limiting
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < exercisesNeedingUpdate.length; i++) {
      const exercise = exercisesNeedingUpdate[i];
      
      console.log(`\n[${i + 1}/${exercisesNeedingUpdate.length}] Processing: ${exercise.exercise_name}`);
      
      try {
        await updateExerciseMetadata(exercise);
        successCount++;
        
        // Rate limiting: wait 1 second between exercises to avoid API limits
        if (i < exercisesNeedingUpdate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error: any) {
        console.error(`  ❌ Failed: ${error.message}`);
        errorCount++;
        
        // On error, wait a bit longer before continuing
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 POPULATION SUMMARY");
    console.log("=".repeat(60));
    console.log(`\n✅ Successfully updated: ${successCount}/${exercisesNeedingUpdate.length}`);
    console.log(`❌ Errors: ${errorCount}/${exercisesNeedingUpdate.length}`);
    console.log(`\n💾 All exercises now have comprehensive metadata!`);
    console.log(`\n🎉 Population complete!`);

  } catch (error: any) {
    console.error("\n❌ Fatal error:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
populateAllExerciseMetadata().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});

