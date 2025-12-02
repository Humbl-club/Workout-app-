/**
 * Batch Translate Exercises to German
 *
 * This script fetches all exercises from the Convex database and
 * generates German translations for display names, explanations,
 * form cues, and common mistakes.
 *
 * Usage: npx tsx scripts/batchTranslateExercises.ts
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// German anatomical terminology dictionary
const GERMAN_MUSCLE_TRANSLATIONS: Record<string, string> = {
  // Major muscle groups
  "chest": "Brustmuskulatur",
  "pectoralis major": "Großer Brustmuskel",
  "pectoralis minor": "Kleiner Brustmuskel",
  "back": "Rückenmuskulatur",
  "latissimus dorsi": "Breiter Rückenmuskel",
  "lats": "Latissimus",
  "trapezius": "Trapezmuskel",
  "traps": "Trapezmuskel",
  "rhomboids": "Rautenmuskeln",
  "erector spinae": "Rückenstrecker",
  "lower back": "Unterer Rücken",

  // Shoulders
  "shoulders": "Schultermuskulatur",
  "deltoids": "Deltamuskeln",
  "anterior deltoid": "Vorderer Deltamuskel",
  "lateral deltoid": "Seitlicher Deltamuskel",
  "posterior deltoid": "Hinterer Deltamuskel",
  "front delts": "Vordere Schulter",
  "side delts": "Seitliche Schulter",
  "rear delts": "Hintere Schulter",
  "rotator cuff": "Rotatorenmanschette",

  // Arms
  "biceps": "Bizeps",
  "biceps brachii": "Zweiköpfiger Armmuskel",
  "triceps": "Trizeps",
  "triceps brachii": "Dreiköpfiger Armmuskel",
  "forearms": "Unterarme",
  "brachialis": "Armbeuger",
  "brachioradialis": "Oberarmspeichenmuskel",

  // Core
  "core": "Rumpfmuskulatur",
  "abs": "Bauchmuskeln",
  "abdominals": "Bauchmuskulatur",
  "rectus abdominis": "Gerader Bauchmuskel",
  "obliques": "Schräge Bauchmuskeln",
  "internal obliques": "Innere schräge Bauchmuskeln",
  "external obliques": "Äußere schräge Bauchmuskeln",
  "transverse abdominis": "Querer Bauchmuskel",

  // Legs
  "quadriceps": "Quadrizeps",
  "quads": "Oberschenkelvorderseite",
  "rectus femoris": "Gerader Oberschenkelmuskel",
  "vastus lateralis": "Äußerer Schenkelmuskel",
  "vastus medialis": "Innerer Schenkelmuskel",
  "hamstrings": "Beinbeuger",
  "biceps femoris": "Zweiköpfiger Oberschenkelmuskel",
  "semitendinosus": "Halbsehnenmuskel",
  "semimembranosus": "Plattsehnenmuskel",

  // Glutes & Hips
  "glutes": "Gesäßmuskulatur",
  "gluteus maximus": "Großer Gesäßmuskel",
  "gluteus medius": "Mittlerer Gesäßmuskel",
  "gluteus minimus": "Kleiner Gesäßmuskel",
  "hip flexors": "Hüftbeuger",
  "hip adductors": "Hüftadduktoren",
  "hip abductors": "Hüftabduktoren",
  "psoas": "Hüftbeugermuskel",
  "iliacus": "Darmbeinmuskel",

  // Lower leg
  "calves": "Wadenmuskulatur",
  "gastrocnemius": "Zwillingswadenmuskel",
  "soleus": "Schollenmuskel",
  "tibialis anterior": "Vorderer Schienbeinmuskel",
};

// Common exercise name translations
const GERMAN_EXERCISE_NAMES: Record<string, string> = {
  // Compound movements
  "barbell_back_squat": "Langhantel-Kniebeuge",
  "front_squat": "Frontkniebeuge",
  "goblet_squat": "Goblet-Kniebeuge",
  "deadlift": "Kreuzheben",
  "romanian_deadlift": "Rumänisches Kreuzheben",
  "sumo_deadlift": "Sumo-Kreuzheben",
  "bench_press": "Bankdrücken",
  "incline_bench_press": "Schrägbankdrücken",
  "decline_bench_press": "Negativ-Bankdrücken",
  "overhead_press": "Schulterdrücken",
  "military_press": "Militärpresse",
  "push_press": "Stoßdrücken",

  // Pull movements
  "pull_up": "Klimmzug",
  "chin_up": "Klimmzug im Untergriff",
  "lat_pulldown": "Latzug",
  "barbell_row": "Langhantelrudern",
  "bent_over_row": "Vorgebeugtes Rudern",
  "dumbbell_row": "Kurzhantelrudern",
  "cable_row": "Kabelrudern",
  "face_pull": "Face Pull",
  "t_bar_row": "T-Bar-Rudern",

  // Push movements
  "push_up": "Liegestütz",
  "dip": "Dips",
  "dumbbell_press": "Kurzhantel-Drücken",
  "chest_fly": "Fliegende Bewegung",
  "cable_crossover": "Kabelzug-Crossover",

  // Leg exercises
  "leg_press": "Beinpresse",
  "leg_curl": "Beinbeuger",
  "leg_extension": "Beinstrecker",
  "lunges": "Ausfallschritte",
  "walking_lunges": "Gehende Ausfallschritte",
  "bulgarian_split_squat": "Bulgarische Kniebeuge",
  "step_up": "Step-Ups",
  "hip_thrust": "Hip Thrust",
  "glute_bridge": "Glute Bridge",
  "calf_raise": "Wadenheben",

  // Core exercises
  "plank": "Unterarmstütz",
  "side_plank": "Seitlicher Unterarmstütz",
  "dead_bug": "Dead Bug",
  "bird_dog": "Vierfüßlerstand-Diagonale",
  "ab_rollout": "Ab-Rollout",
  "hanging_leg_raise": "Hängendes Beinheben",
  "russian_twist": "Russischer Twist",
  "pallof_press": "Pallof Press",
  "cable_woodchop": "Kabel-Holzhacker",

  // Isolation exercises
  "bicep_curl": "Bizeps-Curl",
  "hammer_curl": "Hammer-Curl",
  "tricep_pushdown": "Trizeps-Drücken",
  "tricep_extension": "Trizeps-Extension",
  "lateral_raise": "Seitheben",
  "front_raise": "Frontheben",
  "rear_delt_fly": "Reverse Flys",
  "shrug": "Schulterheben",

  // Olympic lifts
  "clean": "Umsetzen",
  "snatch": "Reißen",
  "clean_and_jerk": "Stoßen",
  "power_clean": "Power Clean",
  "hang_clean": "Hang Clean",

  // Cardio
  "long_run": "Langer Lauf",
  "tempo_run": "Tempolauf",
  "easy_run": "Lockerer Lauf",
  "interval_run_400m": "400m-Intervalle",
  "race_pace_run": "Wettkampftempo-Lauf",
  "swimming_endurance": "Ausdauerschwimmen",
  "cycling_endurance": "Ausdauerradfahren",
  "rowing_cardio": "Ruder-Cardio",
  "skierg_cardio": "SkiErg-Cardio",

  // Warmup & Mobility
  "worlds_greatest_stretch": "World's Greatest Stretch",
  "cat_cow_stretch": "Katze-Kuh-Dehnung",
  "band_pull_aparts": "Band Pull Aparts",
  "arm_circles": "Armkreisen",
  "leg_swings": "Beinschwünge",
  "hip_circles": "Hüftkreisen",
  "ankle_mobility": "Sprunggelenk-Mobilität",
  "thoracic_rotation": "Brustwirbelsäulen-Rotation",
  "foam_rolling": "Faszienrolle",
  "dynamic_stretching": "Dynamisches Dehnen",
};

interface ExerciseToTranslate {
  _id: string;
  exercise_name: string;
  display_name?: string;
  display_name_de?: string;
  explanation?: string;
  form_cue?: string;
  common_mistake?: string;
  muscles_worked?: string[];
}

/**
 * Translate muscle names to German
 */
function translateMuscles(muscles: string[]): string[] {
  return muscles.map(muscle => {
    const lowerMuscle = muscle.toLowerCase();
    return GERMAN_MUSCLE_TRANSLATIONS[lowerMuscle] || muscle;
  });
}

/**
 * Get German exercise name from dictionary or generate from English
 */
function getGermanExerciseName(exerciseName: string): string {
  // Check dictionary first
  if (GERMAN_EXERCISE_NAMES[exerciseName]) {
    return GERMAN_EXERCISE_NAMES[exerciseName];
  }

  // Generate from English name by capitalizing and replacing underscores
  return exerciseName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
}

/**
 * Generate translation data for an exercise
 */
function generateTranslationData(exercise: ExerciseToTranslate) {
  const germanName = getGermanExerciseName(exercise.exercise_name);
  const germanMuscles = exercise.muscles_worked
    ? translateMuscles(exercise.muscles_worked)
    : undefined;

  return {
    exerciseName: exercise.exercise_name,
    display_name_de: germanName,
    muscles_worked_de: germanMuscles,
    // These would need AI translation for accuracy:
    explanation_de: undefined, // Requires AI
    form_cue_de: undefined,    // Requires AI
    common_mistake_de: undefined, // Requires AI
  };
}

async function batchTranslateExercises() {
  const convexUrl = process.env.VITE_CONVEX_URL || "https://reminiscent-owl-650.convex.cloud";
  const convex = new ConvexHttpClient(convexUrl);

  console.log('🇩🇪 BATCH GERMAN TRANSLATION SCRIPT');
  console.log('=====================================\n');

  // Fetch all exercises
  console.log('📚 Fetching all exercises from database...');

  try {
    const exercises = await convex.query(api.queries.getAllExercisesNoPagination) as ExerciseToTranslate[];

    console.log(`Found ${exercises.length} exercises\n`);

    // Filter exercises needing translation
    const needsTranslation = exercises.filter(e => !e.display_name_de);
    console.log(`📝 Exercises needing German translation: ${needsTranslation.length}\n`);

    // Generate translations
    const translations = needsTranslation.map(generateTranslationData);

    // Group by translation status
    const withDictionary = translations.filter(t =>
      GERMAN_EXERCISE_NAMES[t.exerciseName]
    );
    const needsManual = translations.filter(t =>
      !GERMAN_EXERCISE_NAMES[t.exerciseName]
    );

    console.log('📊 TRANSLATION STATUS:');
    console.log(`✅ Have dictionary translation: ${withDictionary.length}`);
    console.log(`⚠️  Need manual translation: ${needsManual.length}\n`);

    // Apply translations with dictionary entries
    console.log('🔄 Applying dictionary translations...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const translation of withDictionary) {
      try {
        await convex.mutation(api.mutations.updateExerciseRoleAndTranslations, {
          exerciseName: translation.exerciseName,
          display_name_de: translation.display_name_de,
          muscles_worked_de: translation.muscles_worked_de,
        });

        successCount++;
        console.log(`✅ ${translation.exerciseName} → ${translation.display_name_de}`);
      } catch (error: any) {
        errorCount++;
        console.error(`❌ ${translation.exerciseName}: ${error.message}`);
      }
    }

    console.log('\n=====================================');
    console.log('📊 TRANSLATION RESULTS:');
    console.log(`✅ Successfully translated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`⚠️  Need manual translation: ${needsManual.length}`);

    // Output exercises needing manual translation
    if (needsManual.length > 0) {
      console.log('\n📝 EXERCISES NEEDING MANUAL TRANSLATION:');
      console.log('Add these to GERMAN_EXERCISE_NAMES dictionary:\n');

      for (const t of needsManual) {
        console.log(`  "${t.exerciseName}": "TODO_GERMAN_NAME",`);
      }
    }

    console.log('\n💡 TIP: For full translations including explanations,');
    console.log('   use an AI service or the LLM_DATABASE_ENHANCEMENT_GUIDE.md');

  } catch (error: any) {
    console.error('Error fetching exercises:', error.message);
  }
}

// Export for use as module
export {
  GERMAN_MUSCLE_TRANSLATIONS,
  GERMAN_EXERCISE_NAMES,
  translateMuscles,
  getGermanExerciseName,
  generateTranslationData,
};

// Run if executed directly
batchTranslateExercises().catch(console.error);
