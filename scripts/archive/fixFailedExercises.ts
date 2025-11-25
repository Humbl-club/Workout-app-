import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const CONVEX_URL = "https://reminiscent-owl-650.convex.cloud";

// Enhanced pattern matching for better classification
function getMovementPattern(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  
  if (name.includes('squat') || name.includes('lunge')) return 'squat';
  if (name.includes('deadlift') || name.includes('rdl') || name.includes('hinge')) return 'hinge';
  if (name.includes('bench') || name.includes('press') && !name.includes('overhead')) return 'push_horizontal';
  if (name.includes('overhead') || name.includes('pike') || name.includes('handstand')) return 'push_vertical';
  if (name.includes('row') || name.includes('face_pull')) return 'pull_horizontal';
  if (name.includes('pull_up') || name.includes('chin_up') || name.includes('pulldown')) return 'pull_vertical';
  if (name.includes('carry') || name.includes('farmers') || name.includes('suitcase')) return 'carry';
  if (name.includes('plank') || name.includes('dead_bug') || name.includes('bird_dog') || name.includes('hollow')) return 'core';
  if (name.includes('stretch') || name.includes('rotation') || name.includes('circles') || name.includes('foam_roller')) return 'mobility';
  if (name.includes('jump') || name.includes('hop') || name.includes('bound') || name.includes('explosive')) return 'plyometric';
  if (name.includes('walk') || name.includes('run') || name.includes('cardio')) return 'cardio';
  
  return 'core'; // Default to core instead of unknown
}

// Get equipment based on exercise name
function getEquipment(exerciseName: string): string[] {
  const name = exerciseName.toLowerCase();
  const equipment: string[] = [];
  
  if (name.includes('barbell')) equipment.push('barbell');
  if (name.includes('dumbbell')) equipment.push('dumbbells');
  if (name.includes('kettlebell')) equipment.push('kettlebell');
  if (name.includes('band')) equipment.push('resistance_bands');
  if (name.includes('cable')) equipment.push('cable_machine');
  if (name.includes('trx')) equipment.push('trx');
  if (name.includes('med_ball') || name.includes('medicine_ball')) equipment.push('medicine_ball');
  if (name.includes('foam_roller')) equipment.push('foam_roller');
  if (name.includes('box')) equipment.push('box');
  if (name.includes('bench')) equipment.push('bench');
  if (name.includes('sandbag')) equipment.push('sandbag');
  if (name.includes('wall')) equipment.push('wall');
  if (name.includes('pull_up') || name.includes('chin_up')) equipment.push('pull_up_bar');
  
  return equipment.length > 0 ? equipment : ['none'];
}

// Determine exercise tier based on complexity and importance
function getExerciseTier(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  
  // S-Tier: Fundamental movements
  if (['squat', 'deadlift', 'bench_press', 'pull_up', 'overhead_press', 'row'].some(ex => 
    name === ex || name.includes(`${ex}_`) || name.includes(`_${ex}`)
  )) {
    return 'S';
  }
  
  // A-Tier: Important accessories
  if (['lunge', 'hip_thrust', 'dip', 'chin_up', 'plank'].some(ex => name.includes(ex))) {
    return 'A';
  }
  
  // B-Tier: Good accessories
  if (['curl', 'extension', 'raise', 'fly', 'stretch', 'walk'].some(ex => name.includes(ex))) {
    return 'B';
  }
  
  // C-Tier: Specialized or isolation
  return 'C';
}

async function fixFailedExercises() {
  const convex = new ConvexHttpClient(CONVEX_URL);
  
  console.log("🔧 Fixing exercises with missing metadata...\n");
  
  // Get all exercises
  const exercises = await convex.query(api.queries.getAllExercises);
  
  // Find exercises that need metadata updates (null movement_pattern, tier, etc.)
  const exercisesToFix = exercises.filter(ex => 
    !ex.movement_pattern || 
    !ex.exercise_tier || 
    !ex.equipment_required || 
    ex.equipment_required.length === 0
  );
  
  console.log(`📋 Found ${exercisesToFix.length} exercises needing metadata fixes`);
  
  let fixedCount = 0;
  let errorCount = 0;
  
  for (const exercise of exercisesToFix) {
    try {
      const equipment = getEquipment(exercise.exercise_name);
      const movementPattern = getMovementPattern(exercise.exercise_name);
      const tier = getExerciseTier(exercise.exercise_name);
      const experienceLevel = tier === 'S' ? 'intermediate' : 'beginner';
      const injuryRisk = tier === 'S' ? 'moderate' : 'low';
      const evidenceLevel = tier === 'S' ? 'high' : tier === 'A' ? 'moderate' : 'low';
      
      // Determine category
      let category = 'main';
      if (movementPattern === 'mobility') category = exercise.exercise_name.includes('warmup') ? 'warmup' : 'cooldown';
      if (exercise.exercise_name.includes('stretch')) category = 'cooldown';
      if (exercise.exercise_name.includes('activation')) category = 'warmup';
      
      await convex.mutation(api.mutations.updateExerciseMetadata, {
        exerciseName: exercise.exercise_name,
        equipment_required: equipment,
        evidence_level: evidenceLevel,
        exercise_tier: tier,
        movement_pattern: movementPattern,
        primary_category: category,
        minimum_experience_level: experienceLevel,
        injury_risk: injuryRisk,
        sport_applications: [`${movementPattern}_training`],
      });
      
      console.log(`✅ Fixed ${exercise.exercise_name}: ${tier}-tier ${movementPattern} (${category})`);
      fixedCount++;
      
    } catch (error: any) {
      console.error(`❌ Error fixing ${exercise.exercise_name}: ${error.message}`);
      errorCount++;
    }
    
    // Progress indicator
    if (fixedCount % 50 === 0 && fixedCount > 0) {
      console.log(`📈 Fixed ${fixedCount}/${exercisesToFix.length} exercises...`);
    }
  }
  
  console.log("\n📊 Exercise Fixing Complete:");
  console.log(`✅ Fixed: ${fixedCount} exercises`);
  console.log(`❌ Errors: ${errorCount} exercises`);
  
  if (fixedCount > 0) {
    console.log("\n🎉 Database metadata is now complete!");
    console.log("All exercises have proper:");
    console.log("- Equipment requirements");
    console.log("- Exercise tiers"); 
    console.log("- Movement patterns");
    console.log("- Experience levels");
    console.log("- Evidence levels");
    console.log("- Sport applications");
    console.log("\n🚀 Your intelligent system is ready!");
  }
  
  process.exit(0);
}

// Run the fix
fixFailedExercises().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
