/**
 * Exercise Auto-Enhancement Service
 *
 * Automatically fills exercise data for new exercises using rule-based logic
 * Ensures consistency and uniformity across all exercise entries
 * Same scientific approach as injury protocol filling
 */

import { api } from "../convex/_generated/api";
import type { ConvexHttpClient } from "convex/browser";

interface ExerciseEnhancementData {
  exercise_name: string;
  tier: "S" | "A" | "B" | "C";
  movement_pattern: string;
  primary_muscles: string[];
  secondary_muscles: string[];
  equipment_required: string[];
  difficulty_level: "beginner" | "intermediate" | "advanced";
  injury_contraindications: string[];
  form_cues: string[];
  common_mistakes: string[];
  progressions: string[];
  regressions: string[];
  sport_ratings?: Record<string, number>;
  goal_ratings?: Record<string, number>;
}

export class ExerciseAutoEnhancementService {
  private convex: ConvexHttpClient;

  constructor(convex: ConvexHttpClient) {
    this.convex = convex;
  }

  /**
   * Automatically enhance a new exercise based on rule-based logic
   */
  async enhanceExercise(exerciseName: string): Promise<ExerciseEnhancementData> {
    const normalized = exerciseName.toLowerCase().replace(/_/g, " ");

    // Step 1: Determine tier based on exercise type
    const tier = this.determineTier(normalized);

    // Step 2: Determine movement pattern
    const movementPattern = this.determineMovementPattern(normalized);

    // Step 3: Determine primary and secondary muscles
    const { primary, secondary } = this.determineMuscles(normalized, movementPattern);

    // Step 4: Determine equipment
    const equipment = this.determineEquipment(normalized);

    // Step 5: Determine difficulty level
    const difficulty = this.determineDifficulty(normalized, tier);

    // Step 6: Determine injury contraindications
    const contraindications = this.determineContraindications(normalized, movementPattern);

    // Step 7: Generate form cues
    const formCues = this.generateFormCues(normalized, movementPattern);

    // Step 8: Generate common mistakes
    const commonMistakes = this.generateCommonMistakes(normalized, movementPattern);

    // Step 9: Determine progressions and regressions
    const { progressions, regressions } = this.determineProgressionsRegressions(normalized, tier);

    // Step 10: Calculate sport ratings
    const sportRatings = this.calculateSportRatings(normalized, movementPattern, tier);

    // Step 11: Calculate goal ratings
    const goalRatings = this.calculateGoalRatings(normalized, movementPattern, tier);

    return {
      exercise_name: exerciseName,
      tier,
      movement_pattern: movementPattern,
      primary_muscles: primary,
      secondary_muscles: secondary,
      equipment_required: equipment,
      difficulty_level: difficulty,
      injury_contraindications: contraindications,
      form_cues: formCues,
      common_mistakes: commonMistakes,
      progressions,
      regressions,
      sport_ratings: sportRatings,
      goal_ratings: goalRatings,
    };
  }

  /**
   * TIER DETERMINATION - Based on compound vs isolation, functional value
   */
  private determineTier(exercise: string): "S" | "A" | "B" | "C" {
    // S-Tier: Big compound movements, powerlifting movements, olympic lifts
    const sTierKeywords = [
      "squat", "deadlift", "bench press", "overhead press", "pull up", "chin up",
      "power clean", "snatch", "clean and jerk", "front squat", "dip",
      "barbell row", "hip thrust", "push press"
    ];

    // A-Tier: Compound movements, functional exercises
    const aTierKeywords = [
      "lunge", "step up", "bulgarian split", "romanian deadlift", "row",
      "lat pulldown", "push up", "plank", "farmer carry", "goblet squat",
      "landmine press", "single leg", "box jump"
    ];

    // B-Tier: Accessory compounds, machine exercises
    const bTierKeywords = [
      "leg press", "leg curl", "leg extension", "cable", "machine",
      "face pull", "lateral raise", "curl", "tricep extension", "calf raise"
    ];

    // C-Tier: Pure isolation, very specific exercises
    // (default if no match)

    if (sTierKeywords.some(keyword => exercise.includes(keyword))) return "S";
    if (aTierKeywords.some(keyword => exercise.includes(keyword))) return "A";
    if (bTierKeywords.some(keyword => exercise.includes(keyword))) return "B";
    return "C";
  }

  /**
   * MOVEMENT PATTERN DETERMINATION
   */
  private determineMovementPattern(exercise: string): string {
    // Squat patterns
    if (exercise.includes("squat")) return "squat";

    // Hinge patterns
    if (exercise.includes("deadlift") || exercise.includes("rdl") ||
        exercise.includes("romanian") || exercise.includes("good morning") ||
        exercise.includes("hip hinge")) return "hinge";

    // Push patterns
    if (exercise.includes("press") || exercise.includes("push") ||
        exercise.includes("dip") || exercise.includes("bench")) return "push";

    // Pull patterns
    if (exercise.includes("pull") || exercise.includes("row") ||
        exercise.includes("chin") || exercise.includes("lat")) return "pull";

    // Lunge patterns
    if (exercise.includes("lunge") || exercise.includes("step up") ||
        exercise.includes("split squat")) return "lunge";

    // Carry patterns
    if (exercise.includes("carry") || exercise.includes("farmer") ||
        exercise.includes("suitcase")) return "carry";

    // Core patterns
    if (exercise.includes("plank") || exercise.includes("bird dog") ||
        exercise.includes("dead bug") || exercise.includes("pallof")) return "anti-movement";

    // Olympic lifts
    if (exercise.includes("clean") || exercise.includes("snatch") ||
        exercise.includes("jerk")) return "olympic";

    // Isolation
    if (exercise.includes("curl") || exercise.includes("extension") ||
        exercise.includes("raise") || exercise.includes("fly")) return "isolation";

    return "accessory";
  }

  /**
   * MUSCLE GROUP DETERMINATION
   */
  private determineMuscles(exercise: string, movementPattern: string): { primary: string[], secondary: string[] } {
    let primary: string[] = [];
    let secondary: string[] = [];

    switch (movementPattern) {
      case "squat":
        primary = ["quadriceps", "glutes"];
        secondary = ["hamstrings", "core", "erectors"];
        break;
      case "hinge":
        primary = ["hamstrings", "glutes", "erectors"];
        secondary = ["lats", "traps", "core"];
        break;
      case "push":
        if (exercise.includes("overhead") || exercise.includes("shoulder")) {
          primary = ["deltoids", "triceps"];
          secondary = ["upper chest", "core"];
        } else if (exercise.includes("incline")) {
          primary = ["upper chest", "deltoids", "triceps"];
          secondary = ["core"];
        } else {
          primary = ["chest", "triceps"];
          secondary = ["deltoids", "core"];
        }
        break;
      case "pull":
        if (exercise.includes("row")) {
          primary = ["lats", "rhomboids", "traps"];
          secondary = ["biceps", "rear delts"];
        } else {
          primary = ["lats", "biceps"];
          secondary = ["traps", "rhomboids", "rear delts"];
        }
        break;
      case "lunge":
        primary = ["quadriceps", "glutes"];
        secondary = ["hamstrings", "core", "stabilizers"];
        break;
      case "carry":
        primary = ["core", "traps", "forearms"];
        secondary = ["shoulders", "glutes"];
        break;
      case "anti-movement":
        primary = ["core", "obliques"];
        secondary = ["shoulders", "glutes"];
        break;
      case "olympic":
        primary = ["full body", "power"];
        secondary = ["explosiveness", "coordination"];
        break;
      case "isolation":
        if (exercise.includes("curl")) {
          primary = ["biceps"];
          secondary = ["forearms"];
        } else if (exercise.includes("tricep")) {
          primary = ["triceps"];
          secondary = [];
        } else if (exercise.includes("lateral raise")) {
          primary = ["deltoids"];
          secondary = [];
        } else if (exercise.includes("leg curl")) {
          primary = ["hamstrings"];
          secondary = [];
        } else if (exercise.includes("leg extension")) {
          primary = ["quadriceps"];
          secondary = [];
        } else {
          primary = ["specific muscle"];
          secondary = [];
        }
        break;
      default:
        primary = ["multiple"];
        secondary = ["stabilizers"];
    }

    return { primary, secondary };
  }

  /**
   * EQUIPMENT DETERMINATION
   */
  private determineEquipment(exercise: string): string[] {
    const equipment: string[] = [];

    if (exercise.includes("barbell")) equipment.push("barbell");
    if (exercise.includes("dumbbell")) equipment.push("dumbbells");
    if (exercise.includes("kettlebell")) equipment.push("kettlebell");
    if (exercise.includes("cable")) equipment.push("cable machine");
    if (exercise.includes("machine") || exercise.includes("leg press") ||
        exercise.includes("lat pulldown")) equipment.push("machine");
    if (exercise.includes("band") || exercise.includes("resistance band")) equipment.push("resistance band");
    if (exercise.includes("trx") || exercise.includes("suspension")) equipment.push("suspension trainer");
    if (exercise.includes("box") || exercise.includes("step up")) equipment.push("box/bench");
    if (exercise.includes("pull up") || exercise.includes("chin up")) equipment.push("pull-up bar");
    if (exercise.includes("dip")) equipment.push("dip bars");

    // Bodyweight exercises
    if (exercise.includes("push up") || exercise.includes("plank") ||
        exercise.includes("air squat") || exercise.includes("bodyweight")) {
      equipment.push("bodyweight");
    }

    if (equipment.length === 0) equipment.push("varies");

    return equipment;
  }

  /**
   * DIFFICULTY LEVEL DETERMINATION
   */
  private determineDifficulty(exercise: string, tier: string): "beginner" | "intermediate" | "advanced" {
    // Advanced: Olympic lifts, advanced variations, high skill
    const advancedKeywords = [
      "power clean", "snatch", "clean and jerk", "pistol squat",
      "handstand", "muscle up", "deficit", "paused"
    ];

    // Beginner: Simple movements, machines, bodyweight basics
    const beginnerKeywords = [
      "machine", "leg press", "lat pulldown", "cable",
      "goblet squat", "dumbbell", "assisted", "band"
    ];

    if (advancedKeywords.some(keyword => exercise.includes(keyword))) return "advanced";
    if (beginnerKeywords.some(keyword => exercise.includes(keyword))) return "beginner";
    if (tier === "S") return "intermediate"; // S-tier barbell movements are intermediate+

    return "intermediate";
  }

  /**
   * INJURY CONTRAINDICATIONS DETERMINATION
   */
  private determineContraindications(exercise: string, movementPattern: string): string[] {
    const contraindications: string[] = [];

    // Knee-heavy movements
    if (exercise.includes("squat") || exercise.includes("lunge") ||
        exercise.includes("leg extension") || exercise.includes("jump")) {
      contraindications.push("knee_pain");
    }

    // Spinal loading movements
    if (exercise.includes("deadlift") || exercise.includes("squat") ||
        exercise.includes("good morning") || exercise.includes("bent over")) {
      contraindications.push("lower_back_pain");
    }

    // Overhead movements
    if (exercise.includes("overhead") || exercise.includes("shoulder press") ||
        exercise.includes("pull up") || exercise.includes("snatch")) {
      contraindications.push("shoulder_impingement");
    }

    // Hip flexion movements
    if (exercise.includes("deep squat") || exercise.includes("pistol") ||
        exercise.includes("sumo")) {
      contraindications.push("hip_impingement");
    }

    // Wrist-loading movements
    if (exercise.includes("front squat") || exercise.includes("push up") ||
        exercise.includes("handstand")) {
      contraindications.push("wrist_pain");
    }

    // Elbow-intensive movements
    if (exercise.includes("curl") || exercise.includes("tricep extension") ||
        exercise.includes("close grip")) {
      contraindications.push("elbow_tendonitis");
    }

    return contraindications;
  }

  /**
   * FORM CUES GENERATION
   */
  private generateFormCues(exercise: string, movementPattern: string): string[] {
    const cues: string[] = [];

    switch (movementPattern) {
      case "squat":
        cues.push("Chest up, core braced");
        cues.push("Knees track over toes");
        cues.push("Push through heels");
        cues.push("Full depth (hip crease below knee)");
        break;
      case "hinge":
        cues.push("Neutral spine, hinge at hips");
        cues.push("Push hips back, not down");
        cues.push("Feel stretch in hamstrings");
        cues.push("Drive hips forward to stand");
        break;
      case "push":
        cues.push("Scapular retraction and depression");
        cues.push("Core engaged throughout");
        cues.push("Controlled eccentric, explosive concentric");
        cues.push("Full range of motion");
        break;
      case "pull":
        cues.push("Initiate with scapular retraction");
        cues.push("Pull with elbows, not hands");
        cues.push("Squeeze shoulder blades at top");
        cues.push("Control the negative");
        break;
      case "lunge":
        cues.push("Front knee over ankle");
        cues.push("Back knee drops straight down");
        cues.push("Torso upright");
        cues.push("Push through front heel");
        break;
      case "carry":
        cues.push("Shoulders packed, core braced");
        cues.push("Walk with control");
        cues.push("Maintain upright posture");
        break;
      case "anti-movement":
        cues.push("Brace core as if taking a punch");
        cues.push("Breathe steadily, don't hold breath");
        cues.push("Maintain neutral spine");
        break;
      default:
        cues.push("Controlled tempo");
        cues.push("Full range of motion");
        cues.push("Focus on target muscle");
    }

    return cues;
  }

  /**
   * COMMON MISTAKES GENERATION
   */
  private generateCommonMistakes(exercise: string, movementPattern: string): string[] {
    const mistakes: string[] = [];

    switch (movementPattern) {
      case "squat":
        mistakes.push("Knees caving inward");
        mistakes.push("Excessive forward lean");
        mistakes.push("Not reaching depth");
        mistakes.push("Rising onto toes");
        break;
      case "hinge":
        mistakes.push("Rounding lower back");
        mistakes.push("Squatting instead of hinging");
        mistakes.push("Hyperextending at top");
        mistakes.push("Jerking the weight");
        break;
      case "push":
        mistakes.push("Flaring elbows excessively");
        mistakes.push("Bouncing off chest/not full ROM");
        mistakes.push("Arching lower back");
        mistakes.push("Not retracting scapula");
        break;
      case "pull":
        mistakes.push("Using momentum/swinging");
        mistakes.push("Pulling with arms only");
        mistakes.push("Shrugging shoulders");
        mistakes.push("Incomplete range of motion");
        break;
      case "lunge":
        mistakes.push("Front knee passing toes");
        mistakes.push("Leaning forward");
        mistakes.push("Short range of motion");
        mistakes.push("Poor balance/wobbling");
        break;
      default:
        mistakes.push("Using too much weight");
        mistakes.push("Rushing the movement");
        mistakes.push("Poor posture");
    }

    return mistakes;
  }

  /**
   * PROGRESSIONS AND REGRESSIONS
   */
  private determineProgressionsRegressions(exercise: string, tier: string): { progressions: string[], regressions: string[] } {
    const progressions: string[] = [];
    const regressions: string[] = [];

    // Squat progressions/regressions
    if (exercise.includes("squat")) {
      regressions.push("goblet_squat", "box_squat", "wall_sit");
      progressions.push("front_squat", "pause_squat", "deficit_squat");
    }

    // Deadlift progressions/regressions
    if (exercise.includes("deadlift")) {
      regressions.push("romanian_deadlift", "rack_pull", "kettlebell_deadlift");
      progressions.push("deficit_deadlift", "paused_deadlift", "snatch_grip_deadlift");
    }

    // Bench progressions/regressions
    if (exercise.includes("bench press")) {
      regressions.push("dumbbell_bench", "push_up", "floor_press");
      progressions.push("pause_bench", "close_grip_bench", "spoto_press");
    }

    // Pull-up progressions/regressions
    if (exercise.includes("pull up") || exercise.includes("chin up")) {
      regressions.push("assisted_pull_up", "lat_pulldown", "inverted_row");
      progressions.push("weighted_pull_up", "muscle_up", "l_sit_pull_up");
    }

    // Push-up progressions/regressions
    if (exercise.includes("push up")) {
      regressions.push("incline_push_up", "knee_push_up", "wall_push_up");
      progressions.push("deficit_push_up", "weighted_push_up", "plyometric_push_up");
    }

    // Lunge progressions/regressions
    if (exercise.includes("lunge")) {
      regressions.push("step_up", "split_squat", "static_lunge");
      progressions.push("bulgarian_split_squat", "walking_lunge", "deficit_lunge");
    }

    return { progressions, regressions };
  }

  /**
   * SPORT RATINGS CALCULATION
   */
  private calculateSportRatings(exercise: string, movementPattern: string, tier: string): Record<string, number> {
    const ratings: Record<string, number> = {};

    // Running
    if (exercise.includes("single leg") || exercise.includes("calf") ||
        exercise.includes("nordic") || movementPattern === "lunge") {
      ratings.running = tier === "S" ? 95 : tier === "A" ? 90 : 80;
    } else {
      ratings.running = 50;
    }

    // Basketball (power, jumping, lateral movement)
    if (exercise.includes("jump") || exercise.includes("power") ||
        exercise.includes("explosive") || movementPattern === "olympic") {
      ratings.basketball = tier === "S" ? 95 : tier === "A" ? 90 : 85;
    } else {
      ratings.basketball = 60;
    }

    // Swimming (pull strength, shoulder endurance)
    if (movementPattern === "pull" || exercise.includes("lat") ||
        exercise.includes("row")) {
      ratings.swimming = tier === "S" ? 90 : tier === "A" ? 85 : 75;
    } else {
      ratings.swimming = 55;
    }

    // Powerlifting
    if (exercise.includes("squat") || exercise.includes("bench") ||
        exercise.includes("deadlift")) {
      ratings.powerlifting = tier === "S" ? 100 : tier === "A" ? 90 : 70;
    } else {
      ratings.powerlifting = 40;
    }

    return ratings;
  }

  /**
   * GOAL RATINGS CALCULATION
   */
  private calculateGoalRatings(exercise: string, movementPattern: string, tier: string): Record<string, number> {
    const ratings: Record<string, number> = {};

    // Strength
    if (tier === "S" && (movementPattern === "squat" || movementPattern === "hinge" ||
        movementPattern === "push" || movementPattern === "pull")) {
      ratings.strength = 100;
    } else if (tier === "A") {
      ratings.strength = 85;
    } else {
      ratings.strength = 60;
    }

    // Aesthetic (hypertrophy)
    if (movementPattern === "isolation" || tier === "B" || tier === "C") {
      ratings.aesthetic = 90;
    } else if (tier === "A") {
      ratings.aesthetic = 85;
    } else {
      ratings.aesthetic = 70;
    }

    // Athletic
    if (movementPattern === "olympic" || exercise.includes("explosive") ||
        exercise.includes("jump") || exercise.includes("power")) {
      ratings.athletic = 95;
    } else if (tier === "S" || tier === "A") {
      ratings.athletic = 80;
    } else {
      ratings.athletic = 60;
    }

    // Mobility
    if (exercise.includes("stretch") || exercise.includes("mobility") ||
        exercise.includes("flexibility")) {
      ratings.mobility = 95;
    } else {
      ratings.mobility = 30;
    }

    return ratings;
  }

  /**
   * Save enhanced exercise to Convex database
   */
  async saveEnhancedExercise(enhancedData: ExerciseEnhancementData): Promise<void> {
    try {
      // Check if exercise already exists in cache
      const existing = await this.convex.query(api.queries.getExerciseFromCache, {
        exerciseName: enhancedData.exercise_name
      });

      if (existing) {
        // Update existing exercise with enhanced data
        await this.convex.mutation(api.mutations.updateExerciseCache, {
          exerciseName: enhancedData.exercise_name,
          ...enhancedData
        });
      } else {
        // Create new exercise cache entry
        await this.convex.mutation(api.mutations.saveExerciseToCache, {
          exerciseName: enhancedData.exercise_name,
          explanation: "Auto-generated exercise entry",
          musclesWorked: enhancedData.primary_muscles.join(", "),
          formCue: enhancedData.form_cues.join(". "),
          commonMistake: enhancedData.common_mistakes.join(". "),
          tier: enhancedData.tier,
          movementPattern: enhancedData.movement_pattern,
          equipment: enhancedData.equipment_required,
          difficultyLevel: enhancedData.difficulty_level,
          injuryContraindications: enhancedData.injury_contraindications,
          sportRatings: enhancedData.sport_ratings,
          goalRatings: enhancedData.goal_ratings
        });
      }
    } catch (error) {
      console.error(`Error saving enhanced exercise ${enhancedData.exercise_name}:`, error);
      throw error;
    }
  }

  /**
   * Batch enhance multiple exercises
   */
  async batchEnhanceExercises(exerciseNames: string[]): Promise<void> {
    console.log(`\n🚀 Auto-enhancing ${exerciseNames.length} exercises...\n`);

    for (let i = 0; i < exerciseNames.length; i++) {
      try {
        const exerciseName = exerciseNames[i];
        console.log(`[${i + 1}/${exerciseNames.length}] Enhancing: ${exerciseName}`);

        const enhanced = await this.enhanceExercise(exerciseName);
        await this.saveEnhancedExercise(enhanced);

        console.log(`✅ Enhanced ${exerciseName}`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`❌ Error enhancing ${exerciseNames[i]}:`, error);
      }
    }

    console.log(`\n✨ Batch enhancement complete!\n`);
  }
}

export default ExerciseAutoEnhancementService;
