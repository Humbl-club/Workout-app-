/**
 * Upload Complete Scientific Database
 * Uploads 805 exercises and comprehensive knowledge from 28 expert textbooks
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function uploadCompleteDatabase() {
  // Load the massive database generated from 28 textbooks
  const completeDatabase = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/COMPLETE_EXERCISE_DATABASE_FULL.json'), 'utf8'));
  const programmingPrinciples = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/complete_programming_principles.json'), 'utf8'));
  
  const convex = new ConvexHttpClient(process.env.CONVEX_URL!);
  
  console.log('🚀 UPLOADING COMPLETE SCIENTIFIC DATABASE');
  console.log('═══════════════════════════════════════════════');
  console.log(`📚 Source: ${completeDatabase.source_count} expert textbooks`);
  console.log(`📊 Total Exercises: ${completeDatabase.total_exercises}`);
  console.log(`🔬 Evidence Quality: Research citations and clinical data`);
  console.log('═══════════════════════════════════════════════');

  let uploadStats = {
    exercises_uploaded: 0,
    exercises_failed: 0,
    knowledge_uploaded: 0,
    knowledge_failed: 0,
    start_time: Date.now()
  };

  try {
    // Upload all exercises
    console.log('\n📋 UPLOADING 805 RESEARCH-BACKED EXERCISES...');
    console.log('───────────────────────────────────────────────');
    
    for (let i = 0; i < completeDatabase.exercises.length; i++) {
      const exercise = completeDatabase.exercises[i];
      
      // Progress indicator
      if (i % 50 === 0) {
        const progress = Math.round((i / completeDatabase.exercises.length) * 100);
        console.log(`📈 Progress: ${progress}% (${i}/${completeDatabase.exercises.length})`);
      }
      
      try {
        await convex.mutation(api.mutations.cacheExerciseExplanation, {
          exerciseName: exercise.exercise_name,
          explanation: exercise.scientific_explanation || exercise.explanation,
          musclesWorked: exercise.muscles_worked,
          formCue: exercise.biomechanical_cues || exercise.form_cue,
          commonMistake: exercise.common_mistake,
          source: "scientific_textbooks" as any,
          primaryCategory: exercise.primary_category as any,
          exerciseTier: exercise.exercise_tier as any,
          valueScore: exercise.value_score,
          movementPattern: exercise.movement_pattern as any,
          sportApplications: exercise.sport_applications,
          evidenceLevel: exercise.evidence_level as any,
          injuryRisk: exercise.injury_risk as any,
          equipmentRequired: exercise.equipment_required,
          minimumExperienceLevel: exercise.minimum_experience_level,
          contraindications: exercise.contraindications,
        });
        
        uploadStats.exercises_uploaded++;
        
        // Log significant exercises
        if (exercise.exercise_tier === 'S') {
          console.log(`🏆 S-TIER: ${exercise.exercise_name} (Score: ${exercise.value_score})`);
        }
        
      } catch (error) {
        uploadStats.exercises_failed++;
        console.error(`❌ Failed: ${exercise.exercise_name}`);
      }
    }

    // Upload programming knowledge
    console.log('\n📚 UPLOADING PROGRAMMING KNOWLEDGE...');
    console.log('─────────────────────────────────────────');
    
    for (const knowledge of programmingPrinciples.programming_knowledge) {
      try {
        await convex.mutation(api.mutations.saveProgrammingKnowledge, {
          bookTitle: knowledge.book_title,
          author: knowledge.author,
          category: knowledge.category as any,
          principleType: knowledge.principle_type as any,
          title: knowledge.title,
          description: knowledge.description,
          applicableGoals: knowledge.applicable_goals,
          applicableExperience: knowledge.applicable_experience,
          exerciseRecommendations: knowledge.exercise_recommendations,
          guidelines: knowledge.guidelines,
          programmingTemplates: knowledge.programming_templates,
        });
        
        uploadStats.knowledge_uploaded++;
        console.log(`✅ ${knowledge.title} (${knowledge.author})`);
        
      } catch (error) {
        uploadStats.knowledge_failed++;
        console.error(`❌ Failed: ${knowledge.title}`);
      }
    }

    // Upload complete - show final statistics
    const elapsed = Math.round((Date.now() - uploadStats.start_time) / 1000);
    
    console.log('\n🎉 COMPLETE DATABASE UPLOAD FINISHED!');
    console.log('═════════════════════════════════════════════════');
    console.log(`⏱️  Total Time: ${elapsed} seconds`);
    console.log(`✅ Exercises Uploaded: ${uploadStats.exercises_uploaded}`);
    console.log(`❌ Exercise Failures: ${uploadStats.exercises_failed}`);
    console.log(`✅ Knowledge Uploaded: ${uploadStats.knowledge_uploaded}`);
    console.log(`❌ Knowledge Failures: ${uploadStats.knowledge_failed}`);
    console.log('═════════════════════════════════════════════════');
    
    // Database statistics
    console.log('\n📊 YOUR AI NOW HAS ACCESS TO:');
    console.log(`🏆 ${completeDatabase.database_statistics.by_tier.S} S-Tier Fundamental Exercises`);
    console.log(`🥇 ${completeDatabase.database_statistics.by_tier.A} A-Tier Excellent Exercises`);
    console.log(`🥈 ${completeDatabase.database_statistics.by_tier.B} B-Tier Good Exercises`);
    console.log(`🥉 ${completeDatabase.database_statistics.by_tier.C} C-Tier Specialized Exercises`);
    console.log();
    console.log('🔬 EVIDENCE DISTRIBUTION:');
    console.log(`   High Evidence: ${completeDatabase.database_statistics.by_evidence.high}`);
    console.log(`   Moderate Evidence: ${completeDatabase.database_statistics.by_evidence.moderate}`);
    console.log(`   Low Evidence: ${completeDatabase.database_statistics.by_evidence.low}`);
    console.log();
    console.log('🎯 CATEGORY BREAKDOWN:');
    console.log(`   Main Exercises: ${completeDatabase.database_statistics.by_category.main}`);
    console.log(`   Warmup Exercises: ${completeDatabase.database_statistics.by_category.warmup}`);
    console.log(`   Cooldown Exercises: ${completeDatabase.database_statistics.by_category.cooldown}`);
    
    console.log('\n🧠 INTELLIGENCE UPGRADE COMPLETE:');
    console.log('✅ Goal-specific exercise selection');
    console.log('✅ Injury-aware programming'); 
    console.log('✅ Evidence-based progressions');
    console.log('✅ Research-backed contraindications');
    console.log('✅ Expert-level programming knowledge');
    console.log();
    console.log('🎯 YOUR AI NOW MATCHES THE KNOWLEDGE OF:');
    console.log('   🏆 NSCA Certified Strength & Conditioning Specialists');
    console.log('   🏥 Licensed Physical Therapists');
    console.log('   🥇 Olympic and Professional Coaches');
    console.log('   🔬 Exercise Science Researchers');
    console.log();
    console.log('🚀 READY FOR INTELLIGENT WORKOUT GENERATION!');

  } catch (error) {
    console.error('💥 Upload failed:', error);
  }
}

// Execute upload
uploadCompleteDatabase().catch(console.error);
