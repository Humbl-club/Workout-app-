/**
 * Comprehensive workout abbreviation and colloquial term dictionary
 * Used for intelligent parsing of various workout formats
 */

export const WORKOUT_ABBREVIATIONS = {
  // Movement abbreviations
  movements: {
    // Pull movements
    "T2B": "Toes to Bar",
    "TTB": "Toes to Bar",
    "C2B": "Chest to Bar Pull-ups",
    "CTB": "Chest to Bar Pull-ups", 
    "MU": "Muscle Ups",
    "BMU": "Bar Muscle Ups",
    "RMU": "Ring Muscle Ups",
    "PU": "Pull-ups",
    "CU": "Chin-ups",
    
    // Jump rope
    "DU": "Double Unders",
    "SU": "Single Unders",
    "TU": "Triple Unders",
    
    // Push movements
    "HSPU": "Handstand Push-ups",
    "HRPU": "Hand Release Push-ups",
    "DHPU": "Deficit Handstand Push-ups",
    "PHSPU": "Parallette Handstand Push-ups",
    
    // Olympic lifts
    "PC": "Power Clean",
    "SC": "Squat Clean",
    "HC": "Hang Clean",
    "HPC": "Hang Power Clean",
    "PS": "Power Snatch",
    "SS": "Squat Snatch",
    "HS": "Hang Snatch",
    "HPS": "Hang Power Snatch",
    "C&J": "Clean and Jerk",
    
    // Squats
    "OHS": "Overhead Squat",
    "FS": "Front Squat",
    "BS": "Back Squat",
    "GS": "Goblet Squat",
    "PS": "Pistol Squat",
    "BOS": "Box Squat",
    
    // Deadlifts
    "DL": "Deadlift",
    "SDL": "Sumo Deadlift",
    "RDL": "Romanian Deadlift",
    "SLDL": "Stiff Leg Deadlift",
    "TBD": "Trap Bar Deadlift",
    
    // Presses
    "BP": "Bench Press",
    "SP": "Shoulder Press",
    "MP": "Military Press",
    "PP": "Push Press",
    "PJ": "Push Jerk",
    "SJ": "Split Jerk",
    "THP": "Thruster",
    
    // Core
    "GHD": "Glute Ham Developer",
    "GHR": "Glute Ham Raise",
    "K2E": "Knees to Elbows",
    "K2C": "Knees to Chest",
    "V-up": "V-ups",
    "ABMAT": "AbMat Sit-ups",
    
    // Gymnastics
    "BMU": "Bar Muscle-up",
    "RMU": "Ring Muscle-up",
    "RD": "Ring Dips",
    "BD": "Bar Dips",
    "RC": "Rope Climb",
    "LRC": "Legless Rope Climb",
    
    // Other
    "WB": "Wall Balls",
    "BOB": "Ball Over Box",
    "BBJO": "Burpee Box Jump Over",
    "BBJ": "Burpee Box Jump",
    "BRP": "Burpee",
    "MCU": "Man Makers",
    "DT": "Devil's Press",
  },
  
  // Equipment abbreviations  
  equipment: {
    "KB": "Kettlebell",
    "DB": "Dumbbell", 
    "BB": "Barbell",
    "BW": "Bodyweight",
    "MB": "Medicine Ball",
    "SB": "Slam Ball",
    "WB": "Wall Ball",
    "AB": "Ab Mat",
    "ABMAT": "Ab Mat",
    "GHD": "Glute Ham Developer",
    "TRX": "Suspension Trainer",
    "RB": "Resistance Band",
    "PB": "Plyo Box",
    "BX": "Box",
    "RW": "Rower",
    "AB": "Assault Bike",
    "AAB": "Assault Air Bike",
    "SKI": "Ski Erg",
    "BIKE": "Bike Erg",
  },
  
  // Format abbreviations
  formats: {
    "EMOM": "Every Minute on the Minute",
    "E2MOM": "Every 2 Minutes on the Minute",
    "E3MOM": "Every 3 Minutes on the Minute",
    "E4MOM": "Every 4 Minutes on the Minute",
    "E5MOM": "Every 5 Minutes on the Minute",
    "AMRAP": "As Many Rounds As Possible",
    "AMREP": "As Many Reps As Possible",
    "RFT": "Rounds For Time",
    "FT": "For Time",
    "NFT": "Not For Time",
    "AFAP": "As Fast As Possible",
    "WOD": "Workout of the Day",
    "MetCon": "Metabolic Conditioning",
    "TABATA": "20s work / 10s rest × 8 rounds",
    "HIIT": "High Intensity Interval Training",
    "RX": "As Prescribed",
    "RX+": "Advanced Version",
  },
  
  // Units and measurements
  units: {
    "lb": "pounds",
    "lbs": "pounds",
    "#": "pounds",
    "kg": "kilograms",
    "kgs": "kilograms",
    "m": "meters",
    "yd": "yards",
    "yds": "yards",
    "mi": "miles",
    "km": "kilometers",
    "cal": "calories",
    "cals": "calories",
    "'": "feet",
    "ft": "feet",
    '"': "inches",
    "in": "inches",
    "sec": "seconds",
    "min": "minutes",
    "hr": "hours",
    "hrs": "hours",
  },
  
  // Intensity markers
  intensity: {
    "@": "at",
    "RPE": "Rate of Perceived Exertion",
    "RIR": "Reps in Reserve",
    "1RM": "1 Rep Max",
    "%": "percent",
    "ME": "Max Effort",
    "DE": "Dynamic Effort",
    "RE": "Repetition Effort",
    "TM": "Training Max",
    "AMX": "As Many as Possible",
    "UB": "Unbroken",
    "TNG": "Touch and Go",
  }
};

export const COLLOQUIAL_TERMS = {
  // Block/section types
  blockTypes: {
    "buy in": "warmup_protocol",
    "buy-in": "warmup_protocol",
    "buyin": "warmup_protocol",
    "cash out": "finisher",
    "cash-out": "finisher",
    "cashout": "finisher",
    "finisher": "high_intensity_finish",
    "death by": "ascending_ladder",
    "chipper": "long_circuit",
    "ladder": "rep_progression",
    "pyramid": "ascending_descending",
    "complex": "movement_series",
    "circuit": "station_rotation",
    "superset": "paired_exercises",
    "giant set": "multiple_paired",
    "giantset": "multiple_paired",
    "tri-set": "three_paired",
    "triset": "three_paired",
    "quad set": "four_paired",
    "compound set": "same_muscle_paired",
    "pre-exhaust": "isolation_then_compound",
    "post-exhaust": "compound_then_isolation",
  },
  
  // Set types and techniques
  setTypes: {
    "back off": "reduced_weight_sets",
    "back off sets": "reduced_weight_sets",
    "backoff": "reduced_weight_sets",
    "working sets": "main_sets",
    "work sets": "main_sets",
    "feeder sets": "preparation_sets",
    "feeders": "preparation_sets",
    "warmup sets": "preparation_sets",
    "warm-up sets": "preparation_sets",
    "activation": "muscle_activation",
    "prehab": "injury_prevention",
    "cluster": "rest_pause_clusters",
    "cluster sets": "rest_pause_clusters",
    "rest-pause": "intra_set_rest",
    "rest pause": "intra_set_rest",
    "drop set": "weight_reduction",
    "dropset": "weight_reduction",
    "strip set": "weight_reduction",
    "mechanical drop": "movement_regression",
    "density": "time_based_volume",
    "density block": "time_based_volume",
    "myo reps": "effective_reps",
    "myo-reps": "effective_reps",
    "21s": "partial_rep_method",
    "partials": "partial_range",
    "pulses": "mini_reps",
    "pause reps": "tempo_pause",
    "paused": "tempo_pause",
    "tempo": "controlled_speed",
    "eccentric": "negative_emphasis",
    "negatives": "negative_emphasis",
    "isometric": "static_hold",
    "iso hold": "static_hold",
  },
  
  // Common phrases
  phrases: {
    "work up to": "progressive_loading",
    "build to": "progressive_loading",
    "ramp to": "progressive_loading",
    "find": "test_max",
    "establish": "test_max",
    "heavy single": "near_max_effort",
    "heavy double": "near_max_effort_2",
    "heavy triple": "near_max_effort_3",
    "touch and go": "continuous_reps",
    "TNG": "continuous_reps",
    "dead stop": "reset_each_rep",
    "from blocks": "elevated_start",
    "from deficit": "increased_range",
    "banded": "accommodating_resistance",
    "chains": "accommodating_resistance",
    "reverse band": "assisted_movement",
    "slingshot": "assisted_movement",
    "paused": "tempo_pause",
    "no belt": "raw_movement",
    "belted": "with_support",
    "straps": "grip_assistance",
    "hook grip": "olympic_grip",
    "mixed grip": "alternated_grip",
    "double overhand": "pronated_grip",
    "false grip": "thumbless_grip",
    "suicide grip": "thumbless_grip",
  },
  
  // Time/tempo indicators
  timing: {
    "fast": "explosive_tempo",
    "slow": "controlled_tempo",
    "explosive": "maximum_speed",
    "controlled": "deliberate_pace",
    "smooth": "fluid_movement",
    "strict": "no_momentum",
    "kipping": "momentum_assisted",
    "butterfly": "efficient_kipping",
    "for quality": "focus_on_form",
    "for time": "speed_priority",
    "unbroken": "continuous_reps",
    "broken": "rest_between_sets",
    "AHAP": "as_heavy_as_possible",
    "AFAP": "as_fast_as_possible",
    "ALAP": "as_long_as_possible",
    "steady": "consistent_pace",
    "sprint": "maximum_effort",
    "recovery": "easy_pace",
  }
};

/**
 * Resolve abbreviations in text
 * @param text - Input text with potential abbreviations
 * @returns Text with abbreviations expanded
 */
export function resolveAbbreviations(text: string): string {
  let resolved = text;
  
  // Sort by length descending to match longer abbreviations first
  const allAbbreviations = {
    ...WORKOUT_ABBREVIATIONS.movements,
    ...WORKOUT_ABBREVIATIONS.equipment,
    ...WORKOUT_ABBREVIATIONS.formats,
    ...WORKOUT_ABBREVIATIONS.units,
    ...WORKOUT_ABBREVIATIONS.intensity,
  };
  
  const sortedKeys = Object.keys(allAbbreviations).sort((a, b) => b.length - a.length);
  
  for (const abbr of sortedKeys) {
    const fullForm = allAbbreviations[abbr as keyof typeof allAbbreviations];
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    resolved = resolved.replace(regex, fullForm);
  }
  
  return resolved;
}

/**
 * Identify colloquial terms and their formal meanings
 * @param text - Input text with potential colloquial terms
 * @returns Map of found terms to their formal meanings
 */
export function identifyColloquialTerms(text: string): Map<string, string> {
  const found = new Map<string, string>();
  const lowerText = text.toLowerCase();
  
  // Check all colloquial term categories
  const allTerms = {
    ...COLLOQUIAL_TERMS.blockTypes,
    ...COLLOQUIAL_TERMS.setTypes,
    ...COLLOQUIAL_TERMS.phrases,
    ...COLLOQUIAL_TERMS.timing,
  };
  
  for (const [term, meaning] of Object.entries(allTerms)) {
    if (lowerText.includes(term)) {
      found.set(term, meaning);
    }
  }
  
  return found;
}

/**
 * Parse complex workout notation patterns
 */
export const WORKOUT_PATTERNS = {
  // Ladder patterns: "10-9-8-7-6-5-4-3-2-1"
  ladder: /(\d+(?:-\d+)+)(?:\s*(?:reps?|rounds?))?/i,
  
  // Pyramid patterns: "1-2-3-4-5-4-3-2-1"
  pyramid: /(\d+-\d+-\d+.*\d+-\d+-\d+)/i,
  
  // Cluster notation: "3.3.3 @ 85%"
  cluster: /(\d+(?:\.\d+)+)\s*@?\s*(\d+%?)/i,
  
  // Rest-pause: "15+5+5"
  restPause: /(\d+\+\d+(?:\+\d+)*)/i,
  
  // Wave loading: "3-2-1, 3-2-1"
  wave: /(\d+-\d+-\d+(?:,\s*\d+-\d+-\d+)+)/i,
  
  // EMOM variations: "EMOM 10", "E2MOM", etc.
  emom: /E(\d*)MOM\s*(?:x?\s*)?(\d+)?/i,
  
  // Time domains: "10 min", "30s", "2:00"
  timeDomain: /(\d+(?:\.\d+)?)\s*(min(?:ute)?s?|sec(?:ond)?s?|hr?s?|hours?)|(\d+):(\d+)/i,
  
  // Rep ranges: "8-12", "10-15"
  repRange: /(\d+)\s*-\s*(\d+)(?:\s*reps?)?/i,
  
  // Percentage: "70%", "@ 85%", "80-85%"
  percentage: /@?\s*(\d+(?:-\d+)?)\s*%/i,
  
  // RPE: "RPE 8", "@8", "@ RPE 7-8"
  rpe: /@?\s*(?:RPE\s*)?(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?)/i,
  
  // Sets x reps: "3x10", "5 x 5", "4×8-10"
  setsReps: /(\d+)\s*[x×]\s*(\d+(?:-\d+)?)/i,
  
  // Complex movements: "1+1+1"
  complex: /(\d+(?:\+\d+)+)/i,
  
  // Round notation: "3 rounds", "4 RDS"
  rounds: /(\d+)\s*(?:rounds?|rds?|circuits?)/i,
};

/**
 * Detect workout format from text
 */
export function detectWorkoutFormat(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Check for specific format indicators
  if (/emom|e\d+mom/i.test(text)) return 'emom';
  if (/amrap/i.test(text)) return 'amrap';
  if (/rft|for time/i.test(text)) return 'rft';
  if (/death by/i.test(text)) return 'death_by';
  if (/ladder/i.test(text)) return 'ladder';
  if (/pyramid/i.test(text)) return 'pyramid';
  if (/chipper/i.test(text)) return 'chipper';
  if (/a1.*a2|b1.*b2|c1.*c2/i.test(text)) return 'superset';
  if (/tabata/i.test(text)) return 'tabata';
  if (/cluster/i.test(text)) return 'cluster';
  if (/density/i.test(text)) return 'density';
  
  return 'standard';
}
