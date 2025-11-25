/**
 * Script to populate exercise database from top books
 * 
 * Usage:
 * 1. Upload book PDFs/content to Gemini
 * 2. Extract text content from books
 * 3. Run this script to extract exercises and save to database
 * 
 * This can be run manually or integrated into a UI for admins
 */

import { extractExercisesFromBooks, RECOMMENDED_BOOKS } from '../services/bookExerciseExtractor';
import { cacheExerciseExplanation } from '../convex/mutations';

/**
 * Populate database with exercises from recommended books
 * 
 * Note: You'll need to provide the actual book content (text extracted from PDFs)
 * This is a template - you'll need to add the actual book content
 */
export const populateDatabaseFromBooks = async (
  cacheExerciseMutation: (args: {
    exerciseName: string;
    explanation: string;
    muscles_worked?: string[];
    form_cue?: string;
    common_mistake?: string;
    source: 'gemini_ultra' | 'gemini_api';
  }) => Promise<void>
) => {
  // Example: Books with their content
  // In practice, you'd extract this from PDFs or get it from Gemini Ultra
  const booksToProcess = [
    // Add book content here - you can get this from:
    // 1. Upload PDFs to Gemini Ultra and ask it to extract exercise sections
    // 2. Copy/paste relevant chapters
    // 3. Use Gemini to summarize and extract exercises
  ];

  console.log('📚 Starting exercise database population from books...');
  
  try {
    // Extract exercises from all books
    const allExercises = await extractExercisesFromBooks(booksToProcess);
    
    console.log(`\n✅ Extracted ${allExercises.length} total exercises from books`);
    
    // Save to database
    let saved = 0;
    let skipped = 0;
    
    for (const exercise of allExercises) {
      try {
        await cacheExerciseMutation({
          exerciseName: exercise.exercise_name,
          explanation: exercise.explanation,
          muscles_worked: exercise.muscles_worked,
          form_cue: exercise.form_cue,
          common_mistake: exercise.common_mistake,
          source: 'gemini_ultra', // Mark as from books/Ultra
        });
        saved++;
        console.log(`✓ Saved: ${exercise.exercise_name} (from ${exercise.source_book})`);
      } catch (error) {
        console.error(`✗ Failed to save ${exercise.exercise_name}:`, error);
        skipped++;
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total extracted: ${allExercises.length}`);
    console.log(`   Successfully saved: ${saved}`);
    console.log(`   Failed/skipped: ${skipped}`);
    console.log(`\n✅ Database population complete!`);
    
  } catch (error) {
    console.error('Error populating database:', error);
    throw error;
  }
};

