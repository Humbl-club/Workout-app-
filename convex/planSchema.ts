/**
 * Unified Plan Schema for REBLD AI Workout System
 *
 * This file defines the SINGLE SOURCE OF TRUTH for plan structure.
 * Both the parser (custom plans) and generator (AI plans) use these schemas.
 */

// Session duration rules - guides AI on exercise count based on time
export const SESSION_DURATION_RULES: Record<string, { exercises: string; supersets: string; restMinutes: string }> = {
  '30': { exercises: '4-6', supersets: '0-1', restMinutes: '60-90' },
  '45': { exercises: '6-8', supersets: '1-2', restMinutes: '60-90' },
  '60': { exercises: '8-10', supersets: '2-3', restMinutes: '90-120' },
  '90': { exercises: '10-14', supersets: '2-4', restMinutes: '90-120' },
  '120': { exercises: '12-16', supersets: '3-5', restMinutes: '120-150' },
  '150+': { exercises: '15-20', supersets: '4-6', restMinutes: '120-180' },
};

// Valid session lengths for type safety
export type SessionLength = '30' | '45' | '60' | '90' | '120' | '150+';

// Periodization phases
export type PeriodizationPhase = 'base' | 'build' | 'peak' | 'taper' | 'recovery';

// Block types for workout structure
export type BlockType = 'single' | 'superset' | 'amrap' | 'circuit' | 'emom';

/**
 * JSON Schema Prompt for AI Generation/Parsing
 * Include this in prompts to ensure consistent output structure
 */
export const PLAN_SCHEMA_PROMPT = `
**OUTPUT JSON SCHEMA:**
{
  "name": "Plan Name",
  "description": "Brief plan description",
  "periodization": {  // ONLY include if user has a target_date goal
    "total_weeks": 16,
    "current_week": 1,
    "phase": "base|build|peak|taper|recovery",
    "phase_description": "Brief description of current phase focus"
  },
  "weeklyPlan": [{
    "day_of_week": 1,  // 1=Monday, 7=Sunday
    "focus": "Upper Body",
    "notes": "Optional day notes",

    // For SINGLE session days, use "blocks":
    "blocks": [{
      "type": "single|superset|amrap|circuit|emom",
      "exercises": [...],
      "rounds": 4,  // For superset/circuit
      "duration_minutes": 10,  // For amrap/emom
      "notes": "Block notes"
    }],

    // For 2x DAILY sessions, use "sessions" instead of "blocks":
    "sessions": [{
      "session_name": "AM Cardio",
      "time_of_day": "morning|evening",
      "estimated_duration": 45,
      "blocks": [...]
    }]
  }]
}

**BLOCK TYPES:**
- "single": Standard exercises (sets × reps or duration)
- "superset": 2-4 exercises performed back-to-back, has "rounds" field
- "amrap": As Many Rounds As Possible, has "duration_minutes" field
- "circuit": 4+ exercises with minimal rest, has "rounds" field
- "emom": Every Minute On the Minute, has "duration_minutes" field

**EXERCISE FORMAT:**
{
  "exercise_name": "Barbell Back Squat",
  "category": "warmup|main|cooldown",
  "metrics_template": {
    "type": "SetsRepsWeight|SetsDuration|SetsReps|SetsDurationWeight|Distance|Tempo",
    "sets": 4,
    "reps": "8-10",  // Can be number or range string
    "weight": "75%",  // Optional, can be kg, lbs, or percentage
    "duration_seconds": 30,  // For timed exercises
    "distance_meters": 1000,  // For cardio
    "tempo": "3-1-2-0"  // For tempo training (eccentric-pause-concentric-pause)
  },
  "rest_seconds": 90,
  "rpe": 7,  // Rate of Perceived Exertion (1-10)
  "notes": "Exercise-specific notes"
}
`;

/**
 * Prompt section for 2x daily training structure
 */
export const TWO_A_DAY_PROMPT = `
**2x DAILY TRAINING STRUCTURE:**
When user trains twice per day, output "sessions" array instead of "blocks":

{
  "day_of_week": 1,
  "focus": "Strength + Cardio",
  "sessions": [
    {
      "session_name": "AM Cardio",
      "time_of_day": "morning",
      "estimated_duration": 45,
      "blocks": [
        {
          "type": "single",
          "exercises": [
            { "exercise_name": "Treadmill Run", "metrics_template": { "type": "Distance", "distance_meters": 5000 } }
          ]
        }
      ]
    },
    {
      "session_name": "PM Strength",
      "time_of_day": "evening",
      "estimated_duration": 60,
      "blocks": [
        {
          "type": "superset",
          "rounds": 4,
          "exercises": [
            { "exercise_name": "Barbell Bench Press", "metrics_template": { "type": "SetsRepsWeight", "sets": 4, "reps": 8 } },
            { "exercise_name": "Dumbbell Row", "metrics_template": { "type": "SetsRepsWeight", "sets": 4, "reps": 10 } }
          ]
        }
      ]
    }
  ]
}

SPLIT RECOMMENDATIONS BY TRAINING TYPE:
- "cardio_strength": AM = Cardio/HIIT, PM = Resistance training
- "strength_skill": AM = Heavy compounds, PM = Skill/accessory work
- "competition_prep": AM = Sport-specific, PM = General conditioning
`;

/**
 * Prompt section for periodization
 */
export const PERIODIZATION_PROMPT = `
**PERIODIZATION STRUCTURE:**
When user has a target_date for their goal, include periodization:

PHASE DISTRIBUTION (% of total weeks):
- BASE (35%): Build aerobic base, learn movement patterns, moderate volume
- BUILD (35%): Increase intensity, sport-specific training, peak volume
- PEAK (15%): High intensity, reduced volume, competition simulation
- TAPER (15%): Reduced volume & intensity, maintain sharpness, recovery focus

PHASE CHARACTERISTICS:
| Phase | Volume | Intensity | Focus |
|-------|--------|-----------|-------|
| Base | High | Low-Moderate | Foundation, technique, general fitness |
| Build | High | Moderate-High | Sport-specific, progressive overload |
| Peak | Moderate | High | Competition simulation, mental prep |
| Taper | Low | Low-Moderate | Recovery, maintenance, freshness |

OUTPUT FORMAT:
{
  "periodization": {
    "total_weeks": 16,
    "current_week": 1,
    "phase": "base",
    "phase_description": "Building aerobic foundation and movement proficiency",
    "weeks_in_phase": 6,
    "phase_end_week": 6
  }
}
`;

/**
 * Prompt section for superset/complex training
 */
export const SUPERSET_PROMPT = `
**SUPERSET & COMPLEX TRAINING:**

SUPERSET (2 exercises):
{
  "type": "superset",
  "rounds": 4,
  "rest_between_rounds": 90,
  "exercises": [
    { "exercise_name": "A1: Bench Press", ... },
    { "exercise_name": "A2: Bent-Over Row", ... }
  ]
}

GIANT SET (3-4 exercises):
{
  "type": "superset",
  "rounds": 3,
  "rest_between_rounds": 120,
  "exercises": [
    { "exercise_name": "A1: Squat", ... },
    { "exercise_name": "A2: Romanian Deadlift", ... },
    { "exercise_name": "A3: Walking Lunges", ... }
  ]
}

CIRCUIT (4+ exercises, minimal rest):
{
  "type": "circuit",
  "rounds": 3,
  "rest_between_rounds": 180,
  "exercises": [
    { "exercise_name": "Burpees", "metrics_template": { "type": "SetsReps", "reps": 10 } },
    { "exercise_name": "Box Jumps", "metrics_template": { "type": "SetsReps", "reps": 12 } },
    { "exercise_name": "Battle Ropes", "metrics_template": { "type": "SetsDuration", "duration_seconds": 30 } },
    { "exercise_name": "Kettlebell Swings", "metrics_template": { "type": "SetsReps", "reps": 15 } }
  ]
}

AMRAP (timed):
{
  "type": "amrap",
  "duration_minutes": 10,
  "exercises": [
    { "exercise_name": "Pull-ups", "metrics_template": { "type": "SetsReps", "reps": 5 } },
    { "exercise_name": "Push-ups", "metrics_template": { "type": "SetsReps", "reps": 10 } },
    { "exercise_name": "Air Squats", "metrics_template": { "type": "SetsReps", "reps": 15 } }
  ]
}

EMOM (Every Minute On the Minute):
{
  "type": "emom",
  "duration_minutes": 12,
  "exercises": [
    { "exercise_name": "Odd: Power Cleans", "metrics_template": { "type": "SetsReps", "reps": 3 } },
    { "exercise_name": "Even: Box Jumps", "metrics_template": { "type": "SetsReps", "reps": 5 } }
  ]
}
`;

/**
 * Get session length guidance for AI prompt - for STRENGTH sessions only
 */
export function getSessionLengthGuidance(length: SessionLength): string {
  const rules = SESSION_DURATION_RULES[length];
  if (!rules) return '';

  return `
**STRENGTH SESSION LENGTH: ${length} MINUTES (LIFTING ONLY)**
Target STRENGTH/WEIGHTS workout duration: ${length} minutes
- Total STRENGTH exercises per session: ${rules.exercises}
- Supersets/circuits: ${rules.supersets}
- Average rest between sets: ${rules.restMinutes} seconds

CRITICAL DISTINCTION:
- This ${length}-minute constraint applies to LIFTING/WEIGHT TRAINING only
- Cardio duration is determined SEPARATELY by user preferences or goals
- For 2x daily training: AM cardio gets its own duration, PM strength gets ${length} min
- Do NOT try to fit cardio within the ${length}-minute strength constraint
`;
}

/**
 * Patterns for parsing 2x/day sessions from user-submitted plans
 */
export const TWO_A_DAY_PATTERNS = {
  // Pattern: "Day 1A" / "Day 1B"
  dayAB: /day\s*(\d+)\s*([ab])/i,

  // Pattern: "Morning Session" / "Evening Session"
  morningEvening: /\b(morning|evening|am|pm)\s*(session|workout|training)?\b/i,

  // Pattern: "Session 1:" / "Session 2:"
  sessionNumber: /session\s*(\d+)\s*:/i,

  // Pattern: "Workout A:" / "Workout B:"
  workoutAB: /workout\s*([ab])\s*:/i,
};

/**
 * Detect if text contains 2x/day training indicators
 */
export function detectTwoADayFormat(text: string): boolean {
  const patterns = Object.values(TWO_A_DAY_PATTERNS);
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Get complete schema prompt for AI
 * Combines all relevant sections based on user preferences
 */
export function getCompleteSchemaPrompt(options: {
  sessionLength?: SessionLength;
  hasTwoADay?: boolean;
  hasTargetDate?: boolean;
  includeSupersetExamples?: boolean;
}): string {
  const parts: string[] = [PLAN_SCHEMA_PROMPT];

  if (options.sessionLength) {
    parts.push(getSessionLengthGuidance(options.sessionLength));
  }

  if (options.hasTwoADay) {
    parts.push(TWO_A_DAY_PROMPT);
  }

  if (options.hasTargetDate) {
    parts.push(PERIODIZATION_PROMPT);
  }

  if (options.includeSupersetExamples) {
    parts.push(SUPERSET_PROMPT);
  }

  return parts.join('\n\n');
}
