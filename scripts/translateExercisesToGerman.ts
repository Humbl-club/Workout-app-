/**
 * REBLD - German Exercise Translation Script
 *
 * This script translates all exercises in the exerciseCache table from English to German.
 * It processes exercises in batches to optimize API usage and avoid rate limits.
 *
 * Prerequisites:
 * - Convex dev server running (npx convex dev)
 * - Gemini API key configured in .env.local
 *
 * Usage:
 * npx tsx scripts/translateExercisesToGerman.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { api } from "../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { GoogleGenAI } from "@google/genai";

const CONVEX_URL = process.env.VITE_CONVEX_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!CONVEX_URL) {
  throw new Error("VITE_CONVEX_URL not found in environment");
}

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY not found in environment");
}

const convex = new ConvexHttpClient(CONVEX_URL);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

interface Exercise {
  exercise_name: string;
  explanation: string;
  muscles_worked: string[];
  form_cue?: string;
  common_mistake?: string;
  explanation_de?: string;
  muscles_worked_de?: string[];
  form_cue_de?: string;
  common_mistake_de?: string;
}

/**
 * German anatomical term mappings for muscle names
 */
const muscleTranslations: Record<string, string> = {
  // Major muscle groups
  "quadriceps": "Quadrizeps",
  "quadriceps femoris": "Quadrizeps",
  "quadriceps_femoris": "Quadrizeps",
  "glutes": "Gesäßmuskeln",
  "gluteus maximus": "Großer Gesäßmuskel",
  "gluteus_maximus": "Großer Gesäßmuskel",
  "gluteus medius": "Mittlerer Gesäßmuskel",
  "gluteus_medius": "Mittlerer Gesäßmuskel",
  "gluteus minimus": "Kleiner Gesäßmuskel",
  "gluteus_minimus": "Kleiner Gesäßmuskel",
  "hamstrings": "Hamstrings",
  "calves": "Waden",
  "gastrocnemius": "Wadenmuskel",
  "soleus": "Schollenmuskel",

  // Back muscles
  "latissimus dorsi": "Breiter Rückenmuskel",
  "latissimus_dorsi": "Breiter Rückenmuskel",
  "lats": "Latissimus",
  "trapezius": "Trapezmuskel",
  "rhomboids": "Rautenmuskeln",
  "erector spinae": "Rückenstrecker",
  "erector_spinae": "Rückenstrecker",
  "multifidus": "Multifidus",
  "lower back": "Unterer Rücken",
  "lower_back": "Unterer Rücken",
  "middle back": "Mittlerer Rücken",
  "middle_back": "Mittlerer Rücken",
  "upper back": "Oberer Rücken",
  "upper_back": "Oberer Rücken",

  // Chest muscles
  "chest": "Brust",
  "pectoralis major": "Großer Brustmuskel",
  "pectoralis_major": "Großer Brustmuskel",
  "pectoralis major (clavicular head)": "Großer Brustmuskel (klavikularer Kopf)",
  "pectoralis_major_clavicular_head": "Großer Brustmuskel (klavikularer Kopf)",
  "pectoralis major (sternal head)": "Großer Brustmuskel (sternaler Kopf)",
  "pectoralis_major_sternal_head": "Großer Brustmuskel (sternaler Kopf)",
  "pectoralis minor": "Kleiner Brustmuskel",

  // Shoulder muscles
  "shoulders": "Schultern",
  "deltoids": "Deltamuskeln",
  "deltoid": "Deltamuskel",
  "anterior deltoid": "Vorderer Deltamuskel",
  "anterior_deltoid": "Vorderer Deltamuskel",
  "medial deltoid": "Mittlerer Deltamuskel",
  "medial_deltoid": "Mittlerer Deltamuskel",
  "posterior deltoid": "Hinterer Deltamuskel",
  "posterior_deltoid": "Hinterer Deltamuskel",
  "posterior deltoids": "Hintere Deltamuskeln",
  "posterior_delts": "Hintere Deltamuskeln",
  "rear deltoids": "Hintere Deltamuskeln",
  "rear_deltoids": "Hintere Deltamuskeln",
  "rotator cuff": "Rotatorenmanschette",
  "rotator_cuff": "Rotatorenmanschette",

  // Arm muscles
  "biceps": "Bizeps",
  "biceps brachii": "Bizeps",
  "biceps_brachii": "Bizeps",
  "triceps": "Trizeps",
  "triceps brachii": "Trizeps",
  "triceps_brachii": "Trizeps",
  "forearms": "Unterarme",
  "forearm flexors": "Unterarmbeuger",
  "forearm_flexors": "Unterarmbeuger",
  "brachialis": "Armbeuger",
  "brachioradialis": "Oberarmspeichenmuskel",

  // Core muscles
  "core": "Rumpf",
  "core muscles": "Rumpfmuskeln",
  "core_muscles": "Rumpfmuskeln",
  "core stabilizers": "Rumpfstabilisatoren",
  "core_stabilizers": "Rumpfstabilisatoren",
  "abdominals": "Bauchmuskeln",
  "abs": "Bauchmuskeln",
  "rectus abdominis": "Gerader Bauchmuskel",
  "rectus_abdominis": "Gerader Bauchmuskel",
  "obliques": "Schräge Bauchmuskeln",
  "external obliques": "Äußere schräge Bauchmuskeln",
  "external_obliques": "Äußere schräge Bauchmuskeln",
  "internal obliques": "Innere schräge Bauchmuskeln",
  "internal_obliques": "Innere schräge Bauchmuskeln",
  "transverse abdominis": "Querer Bauchmuskel",
  "transverse_abdominis": "Querer Bauchmuskel",

  // Hip muscles
  "hip flexors": "Hüftbeuger",
  "hip_flexors": "Hüftbeuger",
  "iliopsoas": "Iliopsoas",
  "psoas major": "Großer Lendenmuskel",
  "psoas_major": "Großer Lendenmuskel",
  "iliacus": "Darmbeinmuskel",
  "hip rotators": "Hüftrotatoren",
  "hip_rotators": "Hüftrotatoren",
  "piriformis": "Birnenförmiger Muskel",
  "adductors": "Adduktoren",
  "adductor magnus": "Großer Adduktor",
  "adductor_magnus": "Großer Adduktor",

  // Other
  "serratus anterior": "Vorderer Sägemuskel",
  "serratus_anterior": "Vorderer Sägemuskel",
  "quadratus lumborum": "Quadratus Lumborum",
  "quadratus_lumborum": "Quadratus Lumborum",
  "diaphragm": "Zwerchfell",
  "pelvic floor": "Beckenboden",
  "pelvic_floor": "Beckenboden",
  "intercostals": "Zwischenrippenmuskeln",
  "deep stabilizers": "Tiefe Stabilisatoren",
  "deep_stabilizers": "Tiefe Stabilisatoren",
  "deep abdominals": "Tiefe Bauchmuskeln",
  "deep_abdominals": "Tiefe Bauchmuskeln",
};

/**
 * Translate muscle names using the mapping table
 */
function translateMuscles(muscles: string[]): string[] {
  return muscles.map(muscle => {
    const normalized = muscle.toLowerCase().trim();
    const translation = muscleTranslations[normalized];

    if (translation) {
      return translation;
    }

    // If not in mapping, use AI to translate
    console.warn(`⚠️  No mapping for muscle: "${muscle}" - will use AI translation`);
    return muscle; // Will be translated by AI in batch
  });
}

/**
 * Translate a batch of exercises using Gemini
 */
async function translateBatch(exercises: Exercise[]): Promise<Map<string, any>> {
  const exercisesToTranslate = exercises.map(ex => ({
    name: ex.exercise_name,
    explanation: ex.explanation,
    form_cue: ex.form_cue || "",
    common_mistake: ex.common_mistake || "",
    muscles_worked: ex.muscles_worked || []
  }));

  const prompt = `You are a professional fitness translator specializing in German anatomical and exercise terminology.

Translate the following exercises from English to German. Maintain technical accuracy and use proper German fitness terminology.

TRANSLATION GUIDELINES:
- Use "du" (informal) for all instructions
- Maintain anatomical accuracy
- Keep fitness terms appropriate for German-speaking athletes
- Be concise but clear
- For muscle names, use proper German anatomical terms

EXERCISES TO TRANSLATE:
${JSON.stringify(exercisesToTranslate, null, 2)}

Return ONLY a valid JSON array with this exact structure:
[
  {
    "exercise_name": "original_name",
    "explanation_de": "German translation of explanation",
    "form_cue_de": "German translation of form cue",
    "common_mistake_de": "German translation of common mistake",
    "muscles_worked_de": ["German", "muscle", "names"]
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or formatting.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt
    });
    const text = response.text;

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    }

    const translations = JSON.parse(jsonText);

    // Create a map for easy lookup
    const translationMap = new Map();
    translations.forEach((t: any) => {
      translationMap.set(t.exercise_name, {
        explanation_de: t.explanation_de,
        form_cue_de: t.form_cue_de,
        common_mistake_de: t.common_mistake_de,
        muscles_worked_de: t.muscles_worked_de
      });
    });

    return translationMap;
  } catch (error) {
    console.error("❌ Translation batch failed:", error);
    throw error;
  }
}

/**
 * Save German translation to Convex
 */
async function saveTranslation(
  exerciseName: string,
  translation: {
    explanation_de: string;
    muscles_worked_de: string[];
    form_cue_de: string;
    common_mistake_de: string;
  }
) {
  try {
    await convex.mutation(api.mutations.updateExerciseWithGerman, {
      exerciseName,
      explanation_de: translation.explanation_de,
      muscles_worked_de: translation.muscles_worked_de,
      form_cue_de: translation.form_cue_de,
      common_mistake_de: translation.common_mistake_de,
    });
    console.log(`✅ Saved: ${exerciseName}`);
  } catch (error) {
    console.error(`❌ Failed to save ${exerciseName}:`, error);
    throw error;
  }
}

/**
 * Main translation function
 */
async function translateAllExercises() {
  console.log("🚀 Starting German translation of all exercises...\n");

  // Fetch all exercises
  console.log("📥 Fetching exercises from Convex...");
  const allExercises = await convex.query(api.queries.getAllExercisesNoPagination, {});

  console.log(`📊 Total exercises: ${allExercises.length}`);

  // Filter exercises that need translation
  const needsTranslation = allExercises.filter(
    (ex: Exercise) => !ex.explanation_de || !ex.muscles_worked_de || !ex.form_cue_de || !ex.common_mistake_de
  );

  console.log(`🔄 Exercises needing translation: ${needsTranslation.length}`);
  console.log(`✅ Already translated: ${allExercises.length - needsTranslation.length}\n`);

  if (needsTranslation.length === 0) {
    console.log("🎉 All exercises are already translated!");
    return;
  }

  // Process in batches of 20 (to stay within token limits)
  const BATCH_SIZE = 20;
  const batches = [];
  for (let i = 0; i < needsTranslation.length; i += BATCH_SIZE) {
    batches.push(needsTranslation.slice(i, i + BATCH_SIZE));
  }

  console.log(`📦 Processing ${batches.length} batches of ${BATCH_SIZE} exercises\n`);

  let translatedCount = 0;
  let failedCount = 0;
  const failedExercises: string[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`\n🔄 Batch ${i + 1}/${batches.length} (${batch.length} exercises)`);

    try {
      // Translate batch using AI
      const translations = await translateBatch(batch);

      // Save each translation
      for (const exercise of batch) {
        const translation = translations.get(exercise.exercise_name);

        if (!translation) {
          console.warn(`⚠️  No translation found for: ${exercise.exercise_name}`);
          failedCount++;
          failedExercises.push(exercise.exercise_name);
          continue;
        }

        try {
          await saveTranslation(exercise.exercise_name, translation);
          translatedCount++;
        } catch (saveError) {
          console.error(`❌ Save failed for: ${exercise.exercise_name}`);
          failedCount++;
          failedExercises.push(exercise.exercise_name);
        }
      }

      // Progress update
      const progress = ((i + 1) / batches.length * 100).toFixed(1);
      console.log(`📊 Progress: ${translatedCount}/${needsTranslation.length} (${progress}%)`);

      // Rate limiting: wait 2 seconds between batches to avoid API limits
      if (i < batches.length - 1) {
        console.log("⏳ Waiting 2 seconds before next batch...");
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (batchError) {
      console.error(`❌ Batch ${i + 1} failed completely:`, batchError);
      // Add all exercises in this batch to failed list
      batch.forEach(ex => {
        failedExercises.push(ex.exercise_name);
        failedCount++;
      });
    }
  }

  // Final summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 TRANSLATION COMPLETE");
  console.log("=".repeat(60));
  console.log(`✅ Successfully translated: ${translatedCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`📈 Total: ${allExercises.length}`);
  console.log(`🎯 Coverage: ${((allExercises.length - needsTranslation.length + translatedCount) / allExercises.length * 100).toFixed(2)}%`);

  if (failedExercises.length > 0) {
    console.log("\n❌ Failed exercises:");
    failedExercises.forEach(name => console.log(`  - ${name}`));
  }

  console.log("\n✨ Translation script completed!");
}

// Run the script
translateAllExercises()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
