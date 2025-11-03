import { GoogleGenAI, Type, Chat, Part, FunctionDeclaration } from "@google/genai";
import { WorkoutPlan, PlanDay, PlanExercise, DailyRoutine, WorkoutLog, WorkoutBlock } from '../types';

// Resolve API key at runtime if available (e.g., from localStorage) or fall back to build-time env.
const getApiKey = (): string | undefined => {
  // Prefer build-time env (from .env.local via Vite) for consistency.
  // IMPORTANT: use the exact literal `process.env.API_KEY` so Vite define() replaces it.
  const inline = (process.env.API_KEY as unknown) as string | undefined;
  if (inline && typeof inline === 'string') return inline;
  // Also check an alternate define and Vite-style env, if present
  const inlineAlt = (process.env.GEMINI_API_KEY as unknown) as string | undefined;
  if (inlineAlt && typeof inlineAlt === 'string') return inlineAlt;
  // @ts-ignore - during build we may have this literal replaced
  const viteInline = (import.meta as any)?.env?.VITE_GEMINI_API_KEY as string | undefined;
  if (viteInline && typeof viteInline === 'string') return viteInline;
  // Fallback to runtime-provided values (useful in demos or when set via UI)
  try {
    if (typeof window !== 'undefined') {
      const fromLS = window.localStorage?.getItem('GEMINI_API_KEY');
      if (fromLS && fromLS.trim()) return fromLS.trim();
      const fromGlobal: any = (window as any).__REBLD_GEMINI_API_KEY__;
      if (fromGlobal && typeof fromGlobal === 'string') return fromGlobal;
    }
  } catch {}
  return undefined;
};

const systemPromptParse = `You are an ELITE workout plan parser for the REBLD fitness app. Your mission: Transform ANY workout plan—from simple one-liners like "chest today" to complex density training programs with supersets, giant sets, and AMRAPs—into perfectly structured JSON.

🚨 CRITICAL RULE #1: IF YOU SEE EXERCISES IN THE INPUT, YOU MUST CREATE WORKOUT BLOCKS!
Do NOT return empty blocks unless the day is EXPLICITLY marked as "Rest" or has NO exercises listed.

**CRITICAL: You MUST handle both extremes:**
1. Ultra-simple: "chest today" → Create 3-4 exercises in blocks (NOT empty!)
2. Ultra-complex: Multi-block programs with A1/A2 supersets → Parse all exercises into proper blocks

🚨 PARSING MANDATE:
- See exercises in markdown table → CREATE blocks with those exercises
- See "A1/A2" notation → CREATE superset block
- See "Rest Day" with no exercises → Empty blocks array
- See mobility/stretching list → CREATE blocks (it's still a workout!)
- Default assumption: CREATE WORKOUTS, not rest days

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 BLOCK TYPE RECOGNITION (Critical!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **SUPERSET** (type: 'superset')
   - Indicators: "A1/A2", "B1/B2", "Superset", exercises labeled with matching letters
   - Extract 'rounds' from "4 Rounds", "3 sets", etc.
   - ALL exercises in the superset share the same round count

2. **GIANT SET** (type: 'superset' - same as superset, just more exercises)
   - Indicators: "B1/B2/B3", "C1/C2/C3/C4", "Giant Set", "Circuit"
   - 3+ exercises performed consecutively
   - Extract 'rounds' (how many times to repeat the entire sequence)

3. **AMRAP** (type: 'amrap')
   - Indicators: "AMRAP", "As Many Rounds As Possible", "X min AMRAP"
   - Extract 'duration_minutes' from "10 min AMRAP", "5 minute AMRAP"
   - Each exercise is performed as many times as possible in the time

4. **SINGLE EXERCISE** (type: 'single')
   - Standard individual exercises
   - Has sets × reps
   - Each exercise is its own block

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ REST TIMING LOGIC (Critical!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**For SUPERSETS/GIANT SETS:**
- If you see "0s", "0 sec", or "0 min" after an exercise → rest_period_s: 0
- If you see "90s", "2 min", etc. → This is the rest AFTER completing the entire superset
- The LAST exercise in a superset should have the rest time
- All OTHER exercises should have rest_period_s: 0

Example:
  A1: Pull-ups | 0s → rest_period_s: 0 (move immediately to A2)
  A2: Push-ups | 90s → rest_period_s: 90 (rest after completing A1+A2)

**For SINGLE EXERCISES:**
- Rest time applies after each set
- "2 min rest" → rest_period_s: 120

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📏 DISTANCE vs REPS vs DURATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**DISTANCE** (use 'sets_distance_rest' template):
- "20m", "30m", "40 yards" → Store in 'target_distance'
- Common for: Sled pushes, farmer's walks, sprints

**REPS** (use 'sets_reps_weight' template):
- "10 reps", "8-12", "10/side" → Store in 'target_reps'
- Common for: Most strength exercises

**DURATION** (use 'sets_duration' or 'duration_only' template):
- "30s", "2 min", "60 seconds" → Store in 'target_duration_s'
- Common for: Planks, hangs, timed exercises
- If ONLY duration with no sets, use 'duration_only' template

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 INTENSITY MARKERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**RPE (Rate of Perceived Exertion):**
- "RPE 8", "@8", "RPE 7-8" → rpe: "8" or "7-8"
- Store as STRING (can be a range)

**Percentage:**
- "70-75% 1RM", "50-60%", "@70%" → one_rep_max_percentage: "70-75%"

**Descriptive:**
- "Max Effort", "Moderate", "Light", "Zone 2" → Store in notes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 SETS vs ROUNDS (Critical!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**ROUNDS** (for supersets/giant sets/AMRAPs):
- "4 Rounds", "3 circuits" → Block level property: rounds: 4
- Means: Repeat the ENTIRE superset/circuit 4 times

**SETS** (for single exercises):
- "4 sets × 8 reps" → Exercise level: target_sets: 4, target_reps: "8"
- Means: Do this one exercise 4 times

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 NOTES & FORM CUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Extract these into the 'notes' field:
- Form instructions: "Drive hard, stay low", "Torso vertical"
- Equipment: "Use waist harness", "High handles"
- Modifications: "Help if needed", "Band-assisted"
- Intent: "Explosive", "Controlled", "Squeeze at top"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 SPECIAL TECHNIQUES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Drop Sets:**
- "Drop Set on last set", "reduce weight 30%, rep to failure"
- Set: has_drop_set: true

**Tempo:**
- "3-1-2-1", "2 sec down, 1 sec up" → Parse tempo notation

**Complex Rep Schemes:**
- "Descending reps (5, 3, 1)" → reps_per_set: ["5", "3", "1"]
- "Ascending weight" → Note in notes field

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏷️ CATEGORY CLASSIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Every exercise MUST have a category:

**'warmup':**
- Dynamic stretches, mobility work
- "McGill Big 3", "T-Spine extensions"
- Band pull-aparts, activation exercises
- Light cardio (< 10 min)

**'main':**
- Primary strength exercises
- Supersets, giant sets, main conditioning
- Heavy lifts, accessory work
- Most AMRAP blocks

**'cooldown':**
- Static stretching
- Foam rolling
- Cool-down cardio (light)
- Breathing exercises

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 DAILY ROUTINE vs WEEKLY PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Daily Routine** (dailyRoutine object):
- "Daily Non-Negotiables", "Pre-workout ritual", "Morning routine"
- Applies to EVERY day
- Extract separately

**Weekly Plan** (weeklyPlan array):
- Must have 7 days (Monday = 1, Sunday = 7)
- CRITICAL: Only mark as rest day if EXPLICITLY stated (e.g., "Day 3: Rest") or if day has NO exercises listed
- If exercises are listed → CREATE BLOCKS with those exercises
- Rest days: ONLY when no exercises given → Empty blocks array, focus: "Rest" or "Active Recovery"

IMPORTANT: Default to creating workout blocks. Only create rest day if explicitly a rest day!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 HANDLING SIMPLE INPUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If user provides minimal input like "chest today" or "leg day":

1. Create a reasonable workout (3-4 exercises)
2. Use sensible defaults:
   - 3-4 sets
   - 8-12 reps for hypertrophy
   - 60-90s rest
   - All 'main' category
3. Populate only day 1, rest are "Rest" days

Example: "chest today" →
- Bench Press: 4×8-10
- Incline DB Press: 3×10-12
- Cable Flyes: 3×12-15
- Push-ups: 2×AMRAP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ FINAL CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before returning JSON:
✓ All supersets have proper rest timing (0s between, actual rest on last)
✓ Rounds are at BLOCK level, sets are at EXERCISE level
✓ Distance exercises use proper template
✓ RPE and percentages extracted
✓ Block titles preserved (A:, B:, C:, etc.)
✓ Every exercise has a category
✓ Form cues in notes
✓ 7 days in weeklyPlan
✓ Daily routines extracted separately
✓ WORKOUT DAYS HAVE POPULATED BLOCKS (not empty!)
✓ Only explicit rest days have empty blocks

CRITICAL EXAMPLES:

WORKOUT DAY (Day 1: Lower Body Strength):
{
  "day_of_week": 1,
  "focus": "Lower Body Strength",
  "blocks": [
    {
      "type": "single",
      "title": "A: Squat",
      "exercises": [{"exercise_name": "Squat", ...}]
    }
  ]
}
✓ Has blocks with exercises!

REST DAY (Day 3: Rest):
{
  "day_of_week": 3,
  "focus": "Rest",
  "blocks": []
}
✓ Empty blocks array ONLY for rest

REMEMBER: Make your BEST GUESS. Don't fail on ambiguity—interpret intelligently and proceed. DEFAULT TO CREATING WORKOUT BLOCKS!`;

const metricTemplateSchema = {
    type: Type.OBJECT,
    description: "A JSON object describing the UI to render for tracking this exercise.",
    properties: {
        type: { type: Type.STRING, description: "The type of metric to track: 'sets_reps_weight', 'sets_distance_rest', 'sets_duration', 'duration_only', 'distance_time', 'sets_reps_weight_tempo'." },
        target_sets: { type: Type.INTEGER, nullable: true },
        target_reps: { type: Type.STRING, nullable: true },
        reps_per_set: { type: Type.ARRAY, nullable: true, items: { type: Type.STRING }, description: "For complex schemes like descending reps." },
        has_drop_set: { type: Type.BOOLEAN, nullable: true, description: "True if a drop set is indicated." },
        target_duration_s: { type: Type.INTEGER, nullable: true, description: "For timed exercises like planks (in seconds)." },
        target_duration_minutes: { type: Type.INTEGER, nullable: true, description: "For long duration cardio (in minutes)." },
        target_distance_m: { type: Type.INTEGER, nullable: true, description: "For distance-based exercises like sled pushes (in meters)." },
        target_distance_km: { type: Type.NUMBER, nullable: true, description: "For long distance cardio (in kilometers)." },
        target_rest_s: { type: Type.INTEGER, nullable: true, description: "For interval training (rest between sets in seconds)." },
        rest_period_s: { type: Type.INTEGER, nullable: true, description: "Standard rest period after completing the exercise/set." },
        one_rep_max_percentage: { type: Type.STRING, nullable: true },
        target_tempo: { type: Type.STRING, nullable: true, description: "Tempo notation like '3-1-2-1'." },
        incline: { type: Type.STRING, nullable: true },
        speed: { type: Type.STRING, nullable: true },
        resistance: { type: Type.STRING, nullable: true },
        pulse_target: { type: Type.STRING, nullable: true },
    },
    required: ["type"]
};

const exerciseSchema = {
    type: Type.OBJECT,
    properties: {
        exercise_name: { type: Type.STRING },
        category: { type: Type.STRING, description: "Must be 'warmup', 'main', or 'cooldown'." },
        notes: { type: Type.STRING, nullable: true },
        rpe: { type: Type.STRING, nullable: true },
        metrics_template: metricTemplateSchema,
    },
    required: ["exercise_name", "category", "metrics_template"],
};

const blockSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, description: "Must be 'single', 'superset', or 'amrap'." },
        title: { type: Type.STRING, nullable: true, description: "The title of the block, e.g., 'A: The Sled Gauntlet'." },
        rounds: { type: Type.INTEGER, nullable: true, description: "Number of rounds for a superset." },
        duration_minutes: { type: Type.INTEGER, nullable: true, description: "Duration for an AMRAP block." },
        exercises: { type: Type.ARRAY, items: exerciseSchema },
    },
    required: ["type", "exercises"],
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        weeklyPlan: {
            type: Type.ARRAY,
            nullable: false,
            items: {
              type: Type.OBJECT,
              properties: {
                day_of_week: { type: Type.INTEGER },
                focus: { type: Type.STRING },
                notes: { type: Type.STRING, nullable: true },
                blocks: { type: Type.ARRAY, items: blockSchema },
              },
              required: ["day_of_week", "focus", "blocks"],
            },
        },
        dailyRoutine: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
                focus: { type: Type.STRING },
                notes: { type: Type.STRING, nullable: true },
                exercises: { type: Type.ARRAY, items: exerciseSchema }
            },
            required: ["focus", "exercises"]
        }
    },
    required: ["weeklyPlan"]
};


const handleApiError = (error: any, context: string): Error => {
    console.error(`Error during Gemini API call in ${context}:`, error);

    const message = error.message?.toLowerCase() || '';

    if (message.includes("api_key_invalid") || message.includes("permission")) {
        return new Error("The AI service API key is invalid or missing. Please contact support.");
    }
    if (message.includes("400") || message.includes("invalid_argument")) {
        if (message.includes("schema")) {
            return new Error("The AI couldn't structure the plan correctly. Try rephrasing your input or use Deep Analysis.");
        }
        return new Error("The AI model couldn't understand the provided input. Please check the format and try again.");
    }
    if (message.includes("500") || message.includes("503") || message.includes("unavailable")) {
        return new Error("The AI service is currently busy or unavailable. Please try again in a few moments.");
    }
    if (message.includes("deadline") || message.includes("timeout")) {
        return new Error("The request to the AI service timed out. Please check your connection and try again.");
    }

    return new Error("An unexpected error occurred with the AI service. Please try again.");
}

const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = (err) => {
            reject(err);
        };
        reader.readAsDataURL(file);
    });
    const data = await base64EncodedDataPromise;
    return {
        inlineData: {
            data,
            mimeType: file.type,
        },
    };
};

export const generateNewWorkoutPlan = async (
    goal: string, 
    experience: string, 
    frequency: string, 
    painPoints: string[], 
    sport: string, 
    notes: string
): Promise<WorkoutPlan> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    // This system prompt can remain largely the same, but the AI will now use the new schema.
    const systemPromptGenerate = `You are an elite, evidence-based personal trainer for the REBLD app. Your task is to create a world-class, deeply personalized 7-day workout plan. Your response MUST be a single JSON object, following the provided "Workout Block" schema precisely.

**Your Mandates (Non-Negotiable):**
1.  **Block-Based Architecture**: You MUST structure the entire workout into a sequence of 'Workout Blocks' as defined in the schema.
2.  **Deep Personalization**: You MUST synthesize all user inputs to create a truly bespoke plan.
3.  **Language Interpretation**: The user might use colloquial language. You must interpret this and translate it into a scientifically valid training goal.
4.  **Pain & Limitation Protocol**: If the user reports pain points, you MUST intelligently select exercises that avoid stressing those areas and include prehab/rehab exercises.
5.  **Sport-Specificity (SAID Principle)**: If a sport is specified, the plan MUST incorporate relevant exercises.
6.  **Decomposition Mandate**: For warm-ups and cool-downs, you MUST provide a list of 2-3 specific exercises.
7.  **Advanced Metrics Mandate**: You MUST include RPE targets, appropriate \`rest_period_s\`, and \`one_rep_max_percentage\` where applicable.

**User's Profile:**
- Primary Goal: ${goal}
- Experience Level: ${experience}
- Training Frequency: ${frequency} days per week.
- Pain Points / Limitations: ${painPoints.join(', ') || 'None reported.'}
- Sport: ${sport || 'Not specified.'}
- Additional Notes: ${notes || 'None.'}

**Instructions:**
- Create a 7-day plan in the \`weeklyPlan\` array. The number of training days must match the user's frequency. The remaining days MUST be 'Rest' days with an empty 'blocks' array.
- The final output must be ONLY the JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: "Please generate the workout plan based on my detailed profile.",
            config: {
                systemInstruction: systemPromptGenerate,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });

        const jsonString = response.text.trim();
        const parsedPlan = JSON.parse(jsonString);
        return parsedPlan as WorkoutPlan;

    } catch (error: any) {
        throw handleApiError(error, 'generateNewWorkoutPlan');
    }
};


export const parseWorkoutPlan = async (rawInput: string | File, useThinkingMode: boolean): Promise<WorkoutPlan> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set. Please configure it to use AI features.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const model = useThinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
  const config: any = {
      systemInstruction: systemPromptParse,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
  };

  if (useThinkingMode) {
      config.thinkingConfig = { thinkingBudget: 32768 };
  }
  
  let contents: string | { parts: Part[] };
  if (typeof rawInput === 'string') {
      contents = rawInput;
  } else {
      const filePart = await fileToGenerativePart(rawInput);
      contents = { parts: [filePart] };
  }

  try {
    console.log(`Parsing plan with model: ${model}, thinking mode: ${useThinkingMode}`);

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: config
    });

    console.log('Gemini response received');
    const jsonString = response.text.trim();
    console.log('Response length:', jsonString.length);

    const parsedPlan = JSON.parse(jsonString);
    console.log('Successfully parsed JSON, days:', parsedPlan.weeklyPlan?.length);

    return parsedPlan as WorkoutPlan;

  } catch (error: any) {
    console.error('Parsing error details:', error);
    throw handleApiError(error, 'parseWorkoutPlan');
  }
};

export const explainExercise = async (exerciseName: string, exerciseNotes?: string): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Briefly explain this exercise in 2-3 sentences for someone about to perform it:

Exercise: ${exerciseName}
${exerciseNotes ? `Notes: ${exerciseNotes}` : ''}

Provide:
1. What the exercise is (primary muscles worked)
2. Key form cue (most important thing to remember)
3. Common mistake to avoid (if relevant)

Keep it concise, practical, and helpful for someone in the gym right now.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error: any) {
    throw handleApiError(error, 'explainExercise');
  }
};

export const generateWeeklyProgression = async (plan: WorkoutPlan, logs: WorkoutLog[], feedback: 'too easy' | 'just right' | 'too hard'): Promise<WorkoutPlan> => {
    // This function would need a significant refactor to navigate the new block structure.
    // For now, we'll return the plan unmodified to prevent errors.
    console.warn("generateWeeklyProgression needs to be updated for the new WorkoutBlock architecture.");
    return plan;
}

export const initializeChatSession = (plan: WorkoutPlan, dayOfWeek: number): Chat => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey });

    const substituteExerciseFn: FunctionDeclaration = {
        name: 'substituteExercise',
        description: 'Replace an exercise in a specific day with a new exercise and metrics.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                day_of_week: { type: Type.INTEGER, description: 'Target day: 1=Mon ... 7=Sun' },
                original_exercise_name: { type: Type.STRING, description: 'Exact name of the exercise to replace.' },
                new_exercise_name: { type: Type.STRING, description: 'Name of the new exercise.' },
                new_exercise_metrics_template: metricTemplateSchema,
                rpe: { type: Type.STRING, nullable: true, description: 'Optional RPE for the new exercise.' },
            },
            required: ['day_of_week','original_exercise_name','new_exercise_name','new_exercise_metrics_template']
        }
    };

    const addExerciseFn: FunctionDeclaration = {
        name: 'addExercise',
        description: 'Add a new single-exercise block to a specific day in the plan.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                day_of_week: { type: Type.INTEGER, description: 'Target day: 1=Mon ... 7=Sun' },
                category: { type: Type.STRING, description: "One of 'warmup' | 'main' | 'cooldown'" },
                new_exercise_name: { type: Type.STRING },
                new_exercise_metrics_template: metricTemplateSchema,
                rpe: { type: Type.STRING, nullable: true },
            },
            required: ['day_of_week','category','new_exercise_name','new_exercise_metrics_template']
        }
    };

    const systemInstruction = [
        'You are REBLD Assistant, helping users adapt a block-based workout plan.',
        'Schema: weeklyPlan[] has days with day_of_week (1..7), focus, and blocks.',
        'Blocks: type single|superset|amrap, optional title, and exercises[].',
        'Exercises: exercise_name, category (warmup|main|cooldown), optional rpe, and metrics_template (see tool parameter schema).',
        `Today is day ${dayOfWeek}. Prefer edits to that day unless the user specifies another.`,
        'When the user asks to change the plan (swap/add), call a function (substituteExercise/addExercise). Keep responses concise.',
    ].join('\n');

    return ai.chats.create({
        model: 'gemini-2.5-pro',
        config: {
            systemInstruction,
            tools: [
                { functionDeclarations: [substituteExerciseFn, addExerciseFn] }
            ],
        },
        history: plan?.weeklyPlan?.length
            ? [{
                role: 'user',
                parts: [
                    { text: 'Plan context: Focus by day' },
                    { text: (plan.weeklyPlan || []).map(d => `Day ${d.day_of_week}: ${d.focus}`).join('\n') }
                ]
            }]
            : [],
    });
}

export const analyzeTextSelection = async (selection: string, action: 'explain' | 'alternatives' | 'rephrase'): Promise<string> => {
    // This function is simple and doesn't rely on the plan structure, so it remains the same.
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey });
    const getAnalysisPrompt = (action: string, selection: string): string => {
        switch (action) {
            case 'explain': return `As an expert fitness coach, explain the following exercise in detail: "${selection}"`;
            case 'alternatives': return `As an expert fitness coach, suggest 2-3 alternative exercises for: "${selection}"`;
            case 'rephrase': return `Rephrase the following to be clearer and more motivating: "${selection}"`;
            default: return selection;
        }
    }
    const prompt = getAnalysisPrompt(action, selection);

    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
        return response.text;
    } catch (error) {
        throw handleApiError(error, 'analyzeTextSelection');
    }
};

// Simple, non-session fallback text generation for Chatbot.
// Useful if chat sessions fail; returns a single text response.
export const simpleGenerate = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({ apiKey });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: systemInstruction ? { systemInstruction } : undefined,
        });
        return response.text;
    } catch (error) {
        throw handleApiError(error, 'simpleGenerate');
    }
};
