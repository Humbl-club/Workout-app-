/**
 * Upload Extracted Knowledge to Convex Database
 * 
 * This script processes knowledge extracted from books and uploads it to Convex
 * 
 * Usage:
 * 1. Extract knowledge from books using Gemini Ultra (see KNOWLEDGE_EXTRACTION_GUIDE.md)
 * 2. Save JSON files in ./book_knowledge/ directory
 * 3. Run: npx tsx scripts/uploadKnowledge.ts
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface KnowledgeFile {
  book_title: string;
  author: string;
  category: string;
  principles?: any[];
  exercise_modifications?: any[];
  goal_guidelines?: any[];
  injury_protocols?: any[];
  programming_templates?: any;
}

/**
 * Load all knowledge JSON files from directory
 */
function loadAllKnowledge(directory: string): KnowledgeFile[] {
  const allKnowledge: KnowledgeFile[] = [];
  
  try {
    const files = readdirSync(directory).filter(f => f.endsWith('.json'));
    
    console.log(`📚 Found ${files.length} knowledge files in ${directory}`);
    
    for (const file of files) {
      try {
        const filePath = join(directory, file);
        const content = readFileSync(filePath, 'utf-8');
        const parsed: KnowledgeFile = JSON.parse(content);
        
        allKnowledge.push(parsed);
        console.log(`  ✓ Loaded knowledge from ${file}`);
      } catch (error) {
        console.error(`  ✗ Failed to load ${file}:`, error);
      }
    }
  } catch (error) {
    console.error(`Failed to read directory ${directory}:`, error);
  }
  
  return allKnowledge;
}

/**
 * Upload knowledge to Convex
 * 
 * Note: This requires Convex mutations to be available
 * You'll need to adapt this to work with your Convex setup
 */
async function uploadToConvex(
  knowledge: KnowledgeFile[],
  mutations: {
    saveProgrammingKnowledge: (args: any) => Promise<void>;
    saveExerciseModification: (args: any) => Promise<void>;
    saveGoalGuidelines: (args: any) => Promise<void>;
    saveInjuryProtocol: (args: any) => Promise<void>;
  }
): Promise<void> {
  console.log(`\n📤 Uploading knowledge from ${knowledge.length} books to Convex...\n`);
  
  let principlesUploaded = 0;
  let modificationsUploaded = 0;
  let guidelinesUploaded = 0;
  let protocolsUploaded = 0;
  let failed = 0;
  
  for (const book of knowledge) {
    try {
      console.log(`\n📖 Processing: ${book.book_title} by ${book.author}`);
      
      // Upload principles
      if (book.principles && Array.isArray(book.principles)) {
        for (const principle of book.principles) {
          try {
            await mutations.saveProgrammingKnowledge({
              book_title: book.book_title,
              author: book.author,
              category: book.category,
              principle_type: principle.type,
              title: principle.title,
              description: principle.description,
              applicable_goals: principle.applicable_goals || [],
              applicable_experience: principle.applicable_experience || [],
              exercise_recommendations: principle.exercise_recommendations,
              guidelines: principle.guidelines,
              programming_templates: book.programming_templates,
            });
            principlesUploaded++;
          } catch (error) {
            console.error(`  ✗ Failed to upload principle "${principle.title}":`, error);
            failed++;
          }
        }
        console.log(`  ✓ Uploaded ${book.principles.length} principles`);
      }
      
      // Upload exercise modifications
      if (book.exercise_modifications && Array.isArray(book.exercise_modifications)) {
        for (const mod of book.exercise_modifications) {
          try {
            await mutations.saveExerciseModification({
              base_exercise: mod.base_exercise,
              book_source: `${book.book_title} by ${book.author}`,
              category: book.category,
              progressions: mod.progressions || [],
              regressions: mod.regressions || [],
              modifications: mod.modifications,
              equipment_alternatives: mod.equipment_alternatives,
            });
            modificationsUploaded++;
          } catch (error) {
            console.error(`  ✗ Failed to upload modification for "${mod.base_exercise}":`, error);
            failed++;
          }
        }
        console.log(`  ✓ Uploaded ${book.exercise_modifications.length} exercise modifications`);
      }
      
      // Upload goal guidelines
      if (book.goal_guidelines && Array.isArray(book.goal_guidelines)) {
        for (const guideline of book.goal_guidelines) {
          try {
            await mutations.saveGoalGuidelines({
              goal: guideline.goal,
              book_source: `${book.book_title} by ${book.author}`,
              primary_exercises: guideline.primary_exercises || [],
              exercise_order: guideline.exercise_order,
              volume_guidelines: guideline.volume_guidelines,
              periodization: guideline.periodization,
              programming_details: guideline.programming_details,
            });
            guidelinesUploaded++;
          } catch (error) {
            console.error(`  ✗ Failed to upload guideline for "${guideline.goal}":`, error);
            failed++;
          }
        }
        console.log(`  ✓ Uploaded ${book.goal_guidelines.length} goal guidelines`);
      }
      
      // Upload injury protocols
      if (book.injury_protocols && Array.isArray(book.injury_protocols)) {
        for (const protocol of book.injury_protocols) {
          try {
            await mutations.saveInjuryProtocol({
              issue: protocol.issue,
              book_source: `${book.book_title} by ${book.author}`,
              exercises_to_avoid: protocol.exercises_to_avoid || [],
              exercise_substitutions: protocol.exercise_substitutions || [],
              prehab_exercises: protocol.prehab_exercises || [],
              warning_signs: protocol.warning_signs || [],
              when_to_progress: protocol.when_to_progress,
              when_to_regress: protocol.when_to_regress,
            });
            protocolsUploaded++;
          } catch (error) {
            console.error(`  ✗ Failed to upload protocol for "${protocol.issue}":`, error);
            failed++;
          }
        }
        console.log(`  ✓ Uploaded ${book.injury_protocols.length} injury protocols`);
      }
      
      // Small delay between books
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`✗ Failed to process ${book.book_title}:`, error);
      failed++;
    }
  }
  
  console.log(`\n✅ Upload complete!`);
  console.log(`   Principles: ${principlesUploaded}`);
  console.log(`   Modifications: ${modificationsUploaded}`);
  console.log(`   Goal Guidelines: ${guidelinesUploaded}`);
  console.log(`   Injury Protocols: ${protocolsUploaded}`);
  console.log(`   Failed: ${failed}`);
}

/**
 * Main execution
 */
async function main() {
  const knowledgeDir = join(process.cwd(), 'book_knowledge');
  
  console.log('📚 Upload Book Knowledge to Convex\n');
  console.log(`Reading knowledge from: ${knowledgeDir}\n`);
  
  // Load all knowledge
  const allKnowledge = loadAllKnowledge(knowledgeDir);
  
  if (allKnowledge.length === 0) {
    console.error('❌ No knowledge files found! Make sure JSON files are in ./book_knowledge/');
    process.exit(1);
  }
  
  console.log(`\n📊 Total knowledge files loaded: ${allKnowledge.length}`);
  
  // Note: Actual upload requires Convex client setup
  // Uncomment and configure when ready:
  /*
  import { ConvexHttpClient } from "convex/browser";
  import { api } from "../convex/_generated/api";
  
  const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);
  
  await uploadToConvex(allKnowledge, {
    saveProgrammingKnowledge: async (args) => {
      await client.mutation(api.mutations.saveProgrammingKnowledge, args);
    },
    saveExerciseModification: async (args) => {
      await client.mutation(api.mutations.saveExerciseModification, args);
    },
    saveGoalGuidelines: async (args) => {
      await client.mutation(api.mutations.saveGoalGuidelines, args);
    },
    saveInjuryProtocol: async (args) => {
      await client.mutation(api.mutations.saveInjuryProtocol, args);
    },
  });
  */
  
  console.log('\n✅ Processing complete!');
  console.log('\n📝 Next steps:');
  console.log('   1. Review the knowledge files');
  console.log('   2. Configure Convex client in this script');
  console.log('   3. Uncomment upload code and run again');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { loadAllKnowledge, uploadToConvex };

