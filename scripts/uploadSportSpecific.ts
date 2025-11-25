/**
 * Upload Sport-Specific Training Protocols
 * Elite-level training from Olympic coaches and professional athletes
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load sport-specific data
const runningTraining = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/running_marathon_training.json'), 'utf8'));
const climbingTraining = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/climbing_training_protocols.json'), 'utf8'));
const combatTraining = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/combat_sports_training.json'), 'utf8'));
const olympicTraining = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/olympic_elite_training.json'), 'utf8'));

async function uploadSportSpecific() {
  const convex = new ConvexHttpClient("https://reminiscent-owl-650.convex.cloud");
  
  console.log('🚀 UPLOADING ELITE SPORT-SPECIFIC TRAINING PROTOCOLS');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🏃 RUNNING: Marathon, triathlon, elite endurance protocols');
  console.log('🧗 ROCK CLIMBING: Finger strength, power endurance, high rocks preparation');  
  console.log('🥊 COMBAT SPORTS: Boxing, MMA, striking and grappling power');
  console.log('🏋️ OLYMPIC TRAINING: Elite athletic preparation and periodization');
  console.log('═══════════════════════════════════════════════════════');
  
  let totalSuccess = 0;
  let totalFailures = 0;

  // Upload Running Training
  console.log('\n🏃 UPLOADING ELITE RUNNING PROTOCOLS...');
  for (const exercise of runningTraining.exercises) {
    try {
      await convex.mutation(api.mutations.cacheExerciseExplanation, {
        exerciseName: exercise.exercise_name,
        explanation: exercise.scientific_explanation,
        muscles_worked: exercise.muscles_worked,
        form_cue: exercise.form_cue,
        common_mistake: exercise.common_mistake,
        source: "scientific_textbooks" as any,
      });
      totalSuccess++;
      console.log(`✅ RUNNING: ${exercise.exercise_name} (${exercise.sport_application})`);
    } catch (error: any) {
      totalFailures++;
      console.error(`❌ RUNNING: ${exercise.exercise_name}`);
    }
  }

  // Upload Climbing Training  
  console.log('\n🧗 UPLOADING ROCK CLIMBING PROTOCOLS...');
  for (const exercise of climbingTraining.exercises) {
    try {
      await convex.mutation(api.mutations.cacheExerciseExplanation, {
        exerciseName: exercise.exercise_name,
        explanation: exercise.scientific_explanation,
        muscles_worked: exercise.muscles_worked,
        form_cue: exercise.form_cue,
        common_mistake: exercise.common_mistake,
        source: "scientific_textbooks" as any,
      });
      totalSuccess++;
      console.log(`✅ CLIMBING: ${exercise.exercise_name} (${exercise.sport_application})`);
    } catch (error: any) {
      totalFailures++;
      console.error(`❌ CLIMBING: ${exercise.exercise_name}`);
    }
  }

  // Upload Combat Sports Training
  console.log('\n🥊 UPLOADING COMBAT SPORTS PROTOCOLS...');
  for (const exercise of combatTraining.exercises) {
    try {
      await convex.mutation(api.mutations.cacheExerciseExplanation, {
        exerciseName: exercise.exercise_name,
        explanation: exercise.scientific_explanation,
        muscles_worked: exercise.muscles_worked,
        form_cue: exercise.form_cue,
        common_mistake: exercise.common_mistake,
        source: "scientific_textbooks" as any,
      });
      totalSuccess++;
      console.log(`✅ COMBAT: ${exercise.exercise_name} (${exercise.sport_application})`);
    } catch (error: any) {
      totalFailures++;
      console.error(`❌ COMBAT: ${exercise.exercise_name}`);
    }
  }

  // Upload Olympic Training
  console.log('\n🏋️ UPLOADING OLYMPIC ELITE PROTOCOLS...');
  for (const exercise of olympicTraining.exercises) {
    try {
      await convex.mutation(api.mutations.cacheExerciseExplanation, {
        exerciseName: exercise.exercise_name,
        explanation: exercise.scientific_explanation,
        muscles_worked: exercise.muscles_worked,
        form_cue: exercise.form_cue,
        common_mistake: exercise.common_mistake,
        source: "scientific_textbooks" as any,
      });
      totalSuccess++;
      console.log(`✅ OLYMPIC: ${exercise.exercise_name} (${exercise.sport_application})`);
    } catch (error: any) {
      totalFailures++;
      console.error(`❌ OLYMPIC: ${exercise.exercise_name}`);
    }
  }

  console.log('\n🎉 ELITE SPORT-SPECIFIC UPLOAD COMPLETE!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Sport-Specific Protocols Uploaded: ${totalSuccess}`);
  console.log(`❌ Failed Uploads: ${totalFailures}`);
  console.log(`📊 New Database Total: 882+ general + ${totalSuccess} sport-specific`);
  
  console.log('\n🏆 YOUR AI NOW HAS ELITE SPORT KNOWLEDGE:');
  console.log('🏃 RUNNING: Olympic marathon training, VDOT protocols, elite endurance');
  console.log('🧗 CLIMBING: Hangboard protocols, campus training, finger strength');
  console.log('🥊 COMBAT: Professional fighter preparation, power development');
  console.log('🏋️ OLYMPIC: Elite periodization, competition preparation');
  
  console.log('\n🎯 SPORT-SPECIFIC AI INTELLIGENCE:');
  console.log('✅ Marathon training with Olympic-level periodization');
  console.log('✅ Rock climbing finger strength and power endurance');
  console.log('✅ Boxing/MMA striking power and conditioning');
  console.log('✅ Olympic sport peaking and competition preparation');
  
  console.log('\n🚀 TEST SPORT-SPECIFIC INTELLIGENCE:');
  console.log('Try goals like:');
  console.log('"I want to climb 5.12+ routes" → AI uses hangboard protocols');
  console.log('"I want to run a sub-3 marathon" → AI uses Daniels/Pfitzinger methods');
  console.log('"I want knockout power" → AI uses Dempsey biomechanics');
  console.log('"I want to compete at Olympics" → AI uses elite periodization');
}

uploadSportSpecific().catch(console.error);
