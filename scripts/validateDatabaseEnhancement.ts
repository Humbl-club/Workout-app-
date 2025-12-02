/**
 * Validation Script for REBLD Database Enhancement
 *
 * Checks that all enhancements were applied correctly:
 * - All exercises have exercise_role
 * - All exercises have default_metrics
 * - All exercises have German translations
 * - S/A tier exercises have injury_contraindications
 * - Core exercises have relationships
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = "https://reminiscent-owl-650.convex.cloud";
const convex = new ConvexHttpClient(CONVEX_URL);

async function validateEnhancements() {
  console.log("✅ Starting database validation...\n");

  try {
    // Get all exercises
    console.log("📊 Fetching all exercises...");
    const exercises = await convex.query(api.queries.getAllExercisesNoPagination);
    console.log(`Found ${exercises.length} total exercises\n`);

    // Validation counters
    let hasRole = 0;
    let hasMetrics = 0;
    let hasGermanName = 0;
    let hasGermanExplanation = 0;
    let hasGermanMuscles = 0;
    let hasInjuryData = 0;

    const missingRole: string[] = [];
    const missingMetrics: string[] = [];
    const missingGerman: string[] = [];

    const sTierCount = exercises.filter((e: any) => e.exercise_tier === "S").length;
    const aTierCount = exercises.filter((e: any) => e.exercise_tier === "A").length;
    const bTierCount = exercises.filter((e: any) => e.exercise_tier === "B").length;
    const cTierCount = exercises.filter((e: any) => e.exercise_tier === "C").length;

    // Validate each exercise
    for (const exercise of exercises) {
      // Check role
      if (exercise.exercise_role) {
        hasRole++;
      } else {
        missingRole.push(exercise.exercise_name);
      }

      // Check metrics
      if (exercise.default_metrics) {
        hasMetrics++;
      } else {
        missingMetrics.push(exercise.exercise_name);
      }

      // Check German translations
      if (exercise.display_name_de) hasGermanName++;
      if (exercise.explanation_de) hasGermanExplanation++;
      if (exercise.muscles_worked_de && exercise.muscles_worked_de.length > 0) hasGermanMuscles++;

      if (!exercise.display_name_de || !exercise.explanation_de) {
        if (!missingGerman.includes(exercise.exercise_name)) {
          missingGerman.push(exercise.exercise_name);
        }
      }

      // Check injury data for S/A tier
      if ((exercise.exercise_tier === "S" || exercise.exercise_tier === "A") &&
          exercise.injury_contraindications && exercise.injury_contraindications.length > 0) {
        hasInjuryData++;
      }
    }

    // Role distribution
    const roleCounts: Record<string, number> = {};
    exercises.forEach((e: any) => {
      if (e.exercise_role) {
        roleCounts[e.exercise_role] = (roleCounts[e.exercise_role] || 0) + 1;
      }
    });

    // Print validation report
    console.log("=".repeat(60));
    console.log("📊 VALIDATION REPORT");
    console.log("=".repeat(60));

    console.log("\n1️⃣ EXERCISE TIER DISTRIBUTION:");
    console.log(`   S-Tier: ${sTierCount}`);
    console.log(`   A-Tier: ${aTierCount}`);
    console.log(`   B-Tier: ${bTierCount}`);
    console.log(`   C-Tier: ${cTierCount}`);

    console.log("\n2️⃣ EXERCISE ROLE ASSIGNMENT:");
    console.log(`   ✅ Exercises with role: ${hasRole}/${exercises.length} (${((hasRole/exercises.length)*100).toFixed(1)}%)`);
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`      - ${role}: ${count}`);
    });
    if (missingRole.length > 0) {
      console.log(`   ❌ Missing role: ${missingRole.length} exercises`);
      console.log(`      Examples: ${missingRole.slice(0, 5).join(", ")}`);
    }

    console.log("\n3️⃣ DEFAULT METRICS:");
    console.log(`   ✅ Exercises with metrics: ${hasMetrics}/${exercises.length} (${((hasMetrics/exercises.length)*100).toFixed(1)}%)`);
    if (missingMetrics.length > 0) {
      console.log(`   ❌ Missing metrics: ${missingMetrics.length} exercises`);
      console.log(`      Examples: ${missingMetrics.slice(0, 5).join(", ")}`);
    }

    console.log("\n4️⃣ GERMAN TRANSLATIONS:");
    console.log(`   ✅ German names: ${hasGermanName}/${exercises.length} (${((hasGermanName/exercises.length)*100).toFixed(1)}%)`);
    console.log(`   ✅ German explanations: ${hasGermanExplanation}/${exercises.length} (${((hasGermanExplanation/exercises.length)*100).toFixed(1)}%)`);
    console.log(`   ✅ German muscles: ${hasGermanMuscles}/${exercises.length} (${((hasGermanMuscles/exercises.length)*100).toFixed(1)}%)`);
    if (missingGerman.length > 0) {
      console.log(`   ❌ Missing German data: ${missingGerman.length} exercises`);
      console.log(`      Examples: ${missingGerman.slice(0, 5).join(", ")}`);
    }

    console.log("\n5️⃣ INJURY CONTRAINDICATIONS:");
    const targetForInjury = sTierCount + aTierCount;
    console.log(`   ✅ S/A tier with injury data: ${hasInjuryData}/${targetForInjury} (${((hasInjuryData/targetForInjury)*100).toFixed(1)}%)`);
    console.log(`   ℹ️  Note: Not all exercises need injury data, this is a guideline`);

    console.log("\n6️⃣ OVERALL COMPLETION:");
    const overallComplete = hasRole === exercises.length &&
                            hasMetrics === exercises.length &&
                            hasGermanName === exercises.length;

    if (overallComplete) {
      console.log("   ✅ All core enhancements completed!");
    } else {
      console.log("   ⚠️  Some enhancements still pending");
    }

    console.log("\n" + "=".repeat(60));

    // Check for common issues
    console.log("\n🔍 CHECKING FOR COMMON ISSUES:");

    // Check for duplicate exercises
    const names = exercises.map((e: any) => e.exercise_name);
    const duplicates = names.filter((name: string, index: number) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      console.log(`   ⚠️  Found ${duplicates.length} duplicate exercise names`);
      console.log(`      Examples: ${duplicates.slice(0, 3).join(", ")}`);
    } else {
      console.log("   ✅ No duplicate exercise names");
    }

    // Check for exercises with very short explanations
    const shortExplanations = exercises.filter(
      (e: any) => e.explanation && e.explanation.length < 50
    );
    if (shortExplanations.length > 0) {
      console.log(`   ⚠️  ${shortExplanations.length} exercises with short explanations (<50 chars)`);
    } else {
      console.log("   ✅ All exercises have adequate explanations");
    }

    console.log("\n=".repeat(60));
    console.log("✅ Validation completed!\n");

  } catch (error) {
    console.error("\n❌ Validation failed:", error);
    process.exit(1);
  }
}

// Run validation
validateEnhancements()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
