/**
 * Generate German Exercise Explanations
 *
 * Usage:
 * npx tsx scripts/generateGermanExerciseExplanations.ts --dry-run
 * npx tsx scripts/generateGermanExerciseExplanations.ts --limit=10
 * npx tsx scripts/generateGermanExerciseExplanations.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { GoogleGenAI } from "@google/genai";

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const skipExisting = args.includes('--skip-existing');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : undefined;

const CONVEX_URL = process.env.VITE_CONVEX_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!CONVEX_URL) {
  console.error('Error: VITE_CONVEX_URL not set in .env.local');
  process.exit(1);
}

if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY not set in .env.local');
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateGermanExplanation(exerciseName: string) {
  const prompt = `You are an expert exercise physiologist. Provide a comprehensive explanation of the exercise "${exerciseName}" IN GERMAN (Deutsch).

Provide in JSON format:
{
  "explanation": "3-5 sentences explaining the exercise in German",
  "muscles_worked": ["German anatomical terms", "e.g. Quadrizeps, Gesäßmuskel"],
  "form_cue": "Most important form cue in German",
  "common_mistake": "Most common mistake in German"
}

IMPORTANT: All text must be in German.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt
  });

  const text = response.text;

  // Extract JSON
  let jsonText = text;
  if (text.includes('```json')) {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match) jsonText = match[1];
  } else if (text.includes('```')) {
    const match = text.match(/```\n([\s\S]*?)\n```/);
    if (match) jsonText = match[1];
  }

  return JSON.parse(jsonText);
}

async function processExercise(exercise: any, index: number, total: number) {
  try {
    console.log('[' + (index + 1) + '/' + total + '] ' + exercise.exercise_name);

    if (skipExisting && exercise.explanation_de) {
      console.log('  Skipping (already translated)');
      return { skipped: true };
    }

    if (isDryRun) {
      console.log('  DRY RUN - Would generate German');
      return { skipped: true };
    }

    console.log('  Generating German explanation...');
    const germanData = await generateGermanExplanation(exercise.exercise_name);

    await client.mutation(api.mutations.updateExerciseWithGerman, {
      exerciseName: exercise.exercise_name,
      explanation_de: germanData.explanation,
      muscles_worked_de: germanData.muscles_worked,
      form_cue_de: germanData.form_cue,
      common_mistake_de: germanData.common_mistake
    });

    console.log('  Success!');
    await delay(1200); // Rate limiting
    return { success: true };
  } catch (error) {
    console.error('  Error: ' + (error instanceof Error ? error.message : 'Unknown'));
    return { error: true };
  }
}

async function main() {
  console.log('German Exercise Migration\n');

  if (isDryRun) console.log('MODE: Dry Run\n');
  if (limit) console.log('LIMIT: ' + limit + ' exercises\n');

  const startTime = Date.now();

  try {
    console.log('Fetching exercises...');
    // Try the no-pagination query first, fallback to paginated query
    let exercises: any[] = [];
    try {
      exercises = await client.query(api.queries.getAllExercisesNoPagination, {});
      console.log('✓ Used getAllExercisesNoPagination query');
    } catch (error) {
      // Fallback to paginated query if no-pagination doesn't exist yet
      console.log('⚠ getAllExercisesNoPagination error:', error instanceof Error ? error.message : String(error));
      console.log('⚠ Falling back to getAllExercises...');
      const result = await client.query(api.queries.getAllExercises, { limit: 1000 });
      console.log('Debug - result keys:', Object.keys(result));
      console.log('Debug - result.exercises:', result.exercises ? result.exercises.length : 'undefined');
      console.log('Debug - result.page:', result.page ? result.page.length : 'undefined');
      exercises = result.exercises || result.page || [];
      console.log('✓ Got result from getAllExercises, exercises.length:', exercises.length);
    }
    
    if (!exercises || exercises.length === 0) {
      console.error('❌ No exercises found in database');
      console.error('Make sure exercise database is populated first');
      console.error('Run: npx tsx scripts/populateExerciseDatabase.ts');
      process.exit(1);
    }
    console.log('Found: ' + exercises.length + ' total\n');

    const toProcess = limit ? exercises.slice(0, limit) : exercises;
    console.log('Will process: ' + toProcess.length + '\n');

    let successful = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < toProcess.length; i++) {
      const result = await processExercise(toProcess[i], i, toProcess.length);
      if (result.success) successful++;
      else if (result.skipped) skipped++;
      else if (result.error) failed++;
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const cost = ((toProcess.length * 700) / 1000000) * 0.075;

    console.log('\n-------------------------');
    console.log('SUMMARY:');
    console.log('Total: ' + toProcess.length);
    console.log('Success: ' + successful);
    console.log('Skipped: ' + skipped);
    console.log('Failed: ' + failed);
    console.log('Time: ' + duration + 's');
    console.log('Est. Cost: $' + cost.toFixed(3));

    if (isDryRun) {
      console.log('\nDRY RUN - No changes made');
    } else if (successful > 0) {
      console.log('\nCOMPLETE! Exercises now have German explanations');
    }
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
