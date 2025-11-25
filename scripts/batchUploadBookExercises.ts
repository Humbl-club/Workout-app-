/**
 * Batch Upload Book Exercises to Convex Database
 * 
 * This script processes extracted exercises from books and uploads them to Convex
 * 
 * Usage:
 * 1. Extract exercises from books using Gemini Ultra (see BOOK_POPULATION_GUIDE.md)
 * 2. Save JSON files in ./book_exercises/ directory
 * 3. Run: npx tsx scripts/batchUploadBookExercises.ts
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface BookExercise {
  exercise_name: string;
  explanation: string;
  muscles_worked: string[];
  form_cue: string;
  common_mistake: string;
  category: 'warmup' | 'main' | 'cooldown';
  source_book?: string;
  source_category?: string;
}

interface ExerciseCache {
  exercises: BookExercise[];
}

/**
 * Normalize exercise name for deduplication
 */
function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

/**
 * Deduplicate exercises based on normalized name
 * Keeps the most comprehensive explanation
 */
function deduplicateExercises(exercises: BookExercise[]): BookExercise[] {
  const exerciseMap = new Map<string, BookExercise>();

  for (const exercise of exercises) {
    const normalized = normalizeExerciseName(exercise.exercise_name);
    
    if (!exerciseMap.has(normalized)) {
      exerciseMap.set(normalized, exercise);
    } else {
      // Merge: keep longer explanation, combine muscles_worked
      const existing = exerciseMap.get(normalized)!;
      
      if (exercise.explanation.length > existing.explanation.length) {
        existing.explanation = exercise.explanation;
      }
      
      // Merge muscles_worked arrays
      const allMuscles = new Set([
        ...(existing.muscles_worked || []),
        ...(exercise.muscles_worked || [])
      ]);
      existing.muscles_worked = Array.from(allMuscles);
      
      // Use better form_cue (longer = more detailed)
      if (exercise.form_cue.length > existing.form_cue.length) {
        existing.form_cue = exercise.form_cue;
      }
      
      // Use better common_mistake
      if (exercise.common_mistake.length > existing.common_mistake.length) {
        existing.common_mistake = exercise.common_mistake;
      }
      
      // Merge source books
      if (exercise.source_book && !existing.source_book?.includes(exercise.source_book)) {
        existing.source_book = `${existing.source_book || ''}, ${exercise.source_book}`.trim();
      }
    }
  }

  return Array.from(exerciseMap.values());
}

/**
 * Load all exercise JSON files from directory
 */
function loadAllExercises(directory: string): BookExercise[] {
  const allExercises: BookExercise[] = [];
  
  try {
    const files = readdirSync(directory).filter(f => f.endsWith('.json'));
    
    console.log(`📚 Found ${files.length} JSON files in ${directory}`);
    
    for (const file of files) {
      try {
        const filePath = join(directory, file);
        const content = readFileSync(filePath, 'utf-8');
        const parsed: ExerciseCache = JSON.parse(content);
        
        if (parsed.exercises && Array.isArray(parsed.exercises)) {
          allExercises.push(...parsed.exercises);
          console.log(`  ✓ Loaded ${parsed.exercises.length} exercises from ${file}`);
        } else {
          console.warn(`  ⚠ ${file} doesn't have 'exercises' array`);
        }
      } catch (error) {
        console.error(`  ✗ Failed to load ${file}:`, error);
      }
    }
  } catch (error) {
    console.error(`Failed to read directory ${directory}:`, error);
  }
  
  return allExercises;
}

/**
 * Upload exercises to Convex
 * 
 * Note: This requires Convex mutations to be available
 * You'll need to adapt this to work with your Convex setup
 */
async function uploadToConvex(
  exercises: BookExercise[],
  cacheExerciseMutation: (args: {
    exerciseName: string;
    explanation: string;
    muscles_worked?: string[];
    form_cue?: string;
    common_mistake?: string;
    source: 'gemini_ultra' | 'gemini_api';
  }) => Promise<void>
): Promise<void> {
  console.log(`\n📤 Uploading ${exercises.length} exercises to Convex...\n`);
  
  let uploaded = 0;
  let failed = 0;
  
  for (const exercise of exercises) {
    try {
      await cacheExerciseMutation({
        exerciseName: exercise.exercise_name,
        explanation: exercise.explanation,
        muscles_worked: exercise.muscles_worked,
        form_cue: exercise.form_cue,
        common_mistake: exercise.common_mistake,
        source: 'gemini_ultra',
      });
      
      uploaded++;
      if (uploaded % 10 === 0) {
        console.log(`  Progress: ${uploaded}/${exercises.length}`);
      }
    } catch (error) {
      console.error(`  ✗ Failed to upload ${exercise.exercise_name}:`, error);
      failed++;
    }
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n✅ Upload complete!`);
  console.log(`   Uploaded: ${uploaded}`);
  console.log(`   Failed: ${failed}`);
}

/**
 * Main execution
 */
async function main() {
  const exercisesDir = join(process.cwd(), 'book_exercises');
  
  console.log('📚 Batch Upload Book Exercises to Convex\n');
  console.log(`Reading exercises from: ${exercisesDir}\n`);
  
  // Load all exercises
  const allExercises = loadAllExercises(exercisesDir);
  
  if (allExercises.length === 0) {
    console.error('❌ No exercises found! Make sure JSON files are in ./book_exercises/');
    process.exit(1);
  }
  
  console.log(`\n📊 Total exercises loaded: ${allExercises.length}`);
  
  // Deduplicate
  console.log('\n🔄 Deduplicating exercises...');
  const uniqueExercises = deduplicateExercises(allExercises);
  console.log(`   Unique exercises: ${uniqueExercises.length}`);
  console.log(`   Duplicates removed: ${allExercises.length - uniqueExercises.length}`);
  
  // Save deduplicated exercises to file
  const outputPath = join(process.cwd(), 'book_exercises', 'all_exercises_deduplicated.json');
  const fs = require('fs');
  fs.writeFileSync(
    outputPath,
    JSON.stringify({ exercises: uniqueExercises }, null, 2)
  );
  console.log(`\n💾 Saved deduplicated exercises to: ${outputPath}`);
  
  // Note: Actual upload requires Convex client setup
  // Uncomment and configure when ready:
  /*
  import { ConvexHttpClient } from "convex/browser";
  import { api } from "../convex/_generated/api";
  
  const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);
  
  await uploadToConvex(uniqueExercises, async (args) => {
    await client.mutation(api.mutations.cacheExerciseExplanation, args);
  });
  */
  
  console.log('\n✅ Processing complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Review the deduplicated exercises file');
  console.log('   2. Configure Convex client in this script');
  console.log('   3. Uncomment upload code and run again');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { loadAllExercises, deduplicateExercises, uploadToConvex };

