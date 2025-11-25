/**
 * Upload Generated Database Content
 * Script to upload the generated exercises, knowledge, and relationships to Convex
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from 'fs';
import * as path from 'path';

// Load generated data
const exercisesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/generated_exercises.json'), 'utf8'));
const knowledgeData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/programming_knowledge.json'), 'utf8'));
const relationshipsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/exercise_relationships.json'), 'utf8'));
const injuryData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/injury_protocols.json'), 'utf8'));
const guidelinesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/goal_guidelines.json'), 'utf8'));

async function uploadGeneratedData() {
  const convex = new ConvexHttpClient(process.env.CONVEX_URL!);
  
  console.log('🚀 Starting database population...');

  try {
    // 1. Upload Exercises
    console.log('\n📋 Uploading exercises...');
    let exerciseCount = 0;
    for (const exercise of exercisesData.exercises) {
      try {
        await convex.mutation(api.mutations.cacheExerciseExplanation, {
          exerciseName: exercise.exercise_name,
          explanation: exercise.explanation,
          musclesWorked: exercise.muscles_worked,
          formCue: exercise.form_cue,
          commonMistake: exercise.common_mistake,
          source: "generated_data" as any,
          // Enhanced fields
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
        exerciseCount++;
        console.log(`✅ Uploaded: ${exercise.exercise_name}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${exercise.exercise_name}:`, error);
      }
    }
    console.log(`🎯 Uploaded ${exerciseCount} exercises`);

    // 2. Upload Programming Knowledge
    console.log('\n📚 Uploading programming knowledge...');
    let knowledgeCount = 0;
    for (const knowledge of knowledgeData.knowledge) {
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
        knowledgeCount++;
        console.log(`✅ Uploaded: ${knowledge.title}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${knowledge.title}:`, error);
      }
    }
    console.log(`🎯 Uploaded ${knowledgeCount} knowledge entries`);

    // 3. Upload Exercise Relationships
    console.log('\n🔗 Uploading exercise relationships...');
    let relationshipCount = 0;
    for (const rel of relationshipsData.relationships) {
      try {
        await convex.mutation(api.mutations.addExerciseRelationship, {
          primary_exercise: rel.primary_exercise,
          related_exercise: rel.related_exercise,
          relationship_type: rel.relationship_type as any,
          strength_difference: rel.strength_difference,
          similarity_score: rel.similarity_score,
          notes: rel.notes,
        });
        relationshipCount++;
        console.log(`✅ Added relationship: ${rel.primary_exercise} -> ${rel.related_exercise}`);
      } catch (error) {
        console.error(`❌ Failed to add relationship ${rel.primary_exercise} -> ${rel.related_exercise}:`, error);
      }
    }
    console.log(`🎯 Uploaded ${relationshipCount} relationships`);

    // 4. Upload Injury Protocols
    console.log('\n🏥 Uploading injury protocols...');
    let protocolCount = 0;
    for (const protocol of injuryData.protocols) {
      try {
        await convex.mutation(api.mutations.saveInjuryProtocol, {
          issue: protocol.issue,
          bookSource: protocol.book_source,
          exercisesToAvoid: protocol.exercises_to_avoid,
          exerciseSubstitutions: protocol.exercise_substitutions,
          prehabExercises: protocol.prehab_exercises,
          warningSigns: protocol.warning_signs,
          whenToProgress: protocol.when_to_progress,
          whenToRegress: protocol.when_to_regress,
        });
        protocolCount++;
        console.log(`✅ Uploaded protocol: ${protocol.issue}`);
      } catch (error) {
        console.error(`❌ Failed to upload protocol ${protocol.issue}:`, error);
      }
    }
    console.log(`🎯 Uploaded ${protocolCount} injury protocols`);

    // 5. Upload Goal Guidelines
    console.log('\n🎯 Uploading goal guidelines...');
    let guidelineCount = 0;
    for (const guideline of guidelinesData.guidelines) {
      try {
        await convex.mutation(api.mutations.saveGoalGuidelines, {
          goal: guideline.goal,
          bookSource: guideline.book_source,
          primaryExercises: guideline.primary_exercises,
          exerciseOrder: guideline.exercise_order,
          volumeGuidelines: guideline.volume_guidelines,
          periodization: guideline.periodization,
        });
        guidelineCount++;
        console.log(`✅ Uploaded guideline: ${guideline.goal}`);
      } catch (error) {
        console.error(`❌ Failed to upload guideline ${guideline.goal}:`, error);
      }
    }
    console.log(`🎯 Uploaded ${guidelineCount} goal guidelines`);

    // Summary
    console.log('\n🎉 DATABASE POPULATION COMPLETE!');
    console.log(`📋 Exercises: ${exerciseCount}`);
    console.log(`📚 Knowledge: ${knowledgeCount}`);
    console.log(`🔗 Relationships: ${relationshipCount}`);
    console.log(`🏥 Injury Protocols: ${protocolCount}`);
    console.log(`🎯 Goal Guidelines: ${guidelineCount}`);
    console.log(`📊 Total Records: ${exerciseCount + knowledgeCount + relationshipCount + protocolCount + guidelineCount}`);

  } catch (error) {
    console.error('💥 Upload failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  uploadGeneratedData();
}

export { uploadGeneratedData };
