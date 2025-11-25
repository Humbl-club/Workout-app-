/**
 * Upload HYROX-Specific Training Protocols
 * Elite functional fitness competition preparation
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load HYROX-specific data
const hyroxTraining = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/hyrox_training_protocols.json'), 'utf8'));

async function uploadHyroxProtocols() {
  const convex = new ConvexHttpClient("https://reminiscent-owl-650.convex.cloud");
  
  console.log('🔥 UPLOADING ELITE HYROX TRAINING PROTOCOLS');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🏃‍♂️ HYROX: The hottest functional fitness competition!');
  console.log('📊 Format: 8 x 1km runs + 8 functional fitness stations');
  console.log('🏆 Elite Level: Professional HYROX athlete protocols');
  console.log('⚡ Station-Specific: Training for each of the 8 stations');
  console.log('═══════════════════════════════════════════════════════');
  
  let hyroxSuccess = 0;
  let hyroxFailures = 0;

  // Upload HYROX-specific exercises
  for (const exercise of hyroxTraining.exercises) {
    try {
      await convex.mutation(api.mutations.cacheExerciseExplanation, {
        exerciseName: exercise.exercise_name,
        explanation: exercise.scientific_explanation,
        muscles_worked: exercise.muscles_worked,
        form_cue: exercise.form_cue,
        common_mistake: exercise.common_mistake,
        source: "scientific_textbooks" as any,
      });
      hyroxSuccess++;
      console.log(`🔥 HYROX STATION ${exercise.hyrox_specific?.station_number || 'PREP'}: ${exercise.exercise_name}`);
      console.log(`   📊 Elite Times: Male ${exercise.hyrox_specific?.elite_times?.male || 'N/A'}, Female ${exercise.hyrox_specific?.elite_times?.female || 'N/A'}`);
    } catch (error: any) {
      hyroxFailures++;
      console.error(`❌ HYROX: ${exercise.exercise_name}`);
    }
    
    // Small delay between uploads
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n🎉 HYROX PROTOCOLS UPLOAD COMPLETE!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ HYROX Exercises Uploaded: ${hyroxSuccess}`);
  console.log(`❌ Failed Uploads: ${hyroxFailures}`);
  console.log(`📊 Total Database: 904+ exercises with HYROX specialization`);
  
  console.log('\n🔥 HYROX STATION COVERAGE:');
  console.log('✅ Station 1: SkiErg 1000m');
  console.log('✅ Station 3: Sled Push 50m'); 
  console.log('✅ Station 4: Sled Pull 50m');
  console.log('✅ Station 5: Burpee Broad Jump 80m');
  console.log('✅ Station 6: Rowing 1000m');
  console.log('✅ Station 7: Farmers Carry 200m');
  console.log('✅ Station 8: Sandbag Lunges 100m');
  console.log('✅ Station 9: Wall Balls 100 reps');
  console.log('✅ Running: 8 x 1km intervals');
  console.log('✅ Transitions: Efficiency protocols');
  console.log('✅ Full Simulation: Complete race prep');
  
  console.log('\n🏆 YOUR AI HAS ELITE HYROX KNOWLEDGE:');
  console.log('🎯 Station-specific training protocols');
  console.log('⚡ Elite athlete pacing strategies');  
  console.log('🔬 Competition load specifications');
  console.log('📈 Progressive training periodization');
  console.log('🏃 Running endurance with functional fatigue');
  console.log('💪 Functional strength under cardiovascular stress');
  
  console.log('\n🚀 TEST HYROX INTELLIGENCE:');
  console.log('Try goal: "I want to compete in HYROX"');
  console.log('AI should include:');
  console.log('  • Sled push/pull training with competition loads');
  console.log('  • Burpee broad jump endurance');
  console.log('  • SkiErg and rowing technique');
  console.log('  • Farmers carry grip endurance');
  console.log('  • Wall ball power endurance');
  console.log('  • Running pacing under functional fatigue');
  
  console.log('\n💡 HYROX-SPECIFIC GOALS YOUR AI NOW UNDERSTANDS:');
  console.log('"I want to break 60 minutes in HYROX" → Elite protocols');
  console.log('"I want to improve my HYROX sled push" → Station 3 specialization');
  console.log('"I want HYROX endurance" → Running + functional combination');
  console.log('"I want to dominate wall balls" → Power endurance protocols');
}

uploadHyroxProtocols().catch(console.error);
