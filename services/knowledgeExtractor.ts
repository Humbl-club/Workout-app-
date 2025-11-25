/**
 * Knowledge Extractor Service
 * 
 * Extracts programming principles, exercise selection guidelines, and personalization
 * strategies from books (not just exercise lists)
 * 
 * This knowledge teaches the AI HOW to select exercises and structure programs
 * based on individual needs, goals, limitations, and experience levels.
 */

import { GoogleGenAI, Type } from '@google/genai';

// Get API key (same logic as geminiService)
const getApiKey = (): string | undefined => {
  const inline = (process.env.API_KEY as unknown) as string | undefined;
  if (inline && typeof inline === 'string') return inline;
  const inlineAlt = (process.env.GEMINI_API_KEY as unknown) as string | undefined;
  if (inlineAlt && typeof inlineAlt === 'string') return inlineAlt;
  const viteInline = (import.meta as any)?.env?.VITE_GEMINI_API_KEY as string | undefined;
  if (viteInline && typeof viteInline === 'string') return viteInline;
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

/**
 * Types for extracted knowledge
 */
export interface ProgrammingPrinciple {
  type: 'exercise_selection' | 'programming' | 'personalization' | 'goal_specific' | 'injury_protocol';
  title: string;
  description: string;
  applicable_goals: string[];
  applicable_experience: string[];
  exercise_recommendations?: Array<{
    exercise_name: string;
    when_to_use: string;
    alternatives: string[];
    modifications?: Record<string, string>;
    programming?: {
      sets?: string;
      reps?: string;
      rest?: string;
      frequency?: string;
      progression?: string;
    };
  }>;
  guidelines?: Array<{
    rule: string;
    rationale: string;
    applies_to: string[];
  }>;
}

export interface ExerciseModification {
  base_exercise: string;
  progressions: Array<{
    exercise_name: string;
    description: string;
    prerequisite: string;
    programming_adjustment: string;
  }>;
  regressions: Array<{
    exercise_name: string;
    description: string;
    when_to_use: string;
    programming_adjustment: string;
  }>;
  modifications?: Record<string, {
    alternative: string;
    rationale: string;
    programming: string;
  }>;
  equipment_alternatives?: Record<string, string>;
}

export interface GoalGuidelines {
  goal: string;
  primary_exercises: Array<{
    exercise_name: string;
    priority: number;
    rationale: string;
    programming: {
      sets?: string;
      reps?: string;
      rest?: string;
      frequency?: string;
      progression?: string;
    };
  }>;
  exercise_order: string;
  volume_guidelines: string;
  periodization: string;
}

export interface InjuryProtocol {
  issue: string;
  exercises_to_avoid: Array<{
    exercise: string;
    reason: string;
  }>;
  exercise_substitutions: Array<{
    avoid: string;
    use_instead: string;
    rationale: string;
  }>;
  prehab_exercises: Array<{
    exercise_name: string;
    frequency: string;
    rationale: string;
  }>;
  warning_signs: string[];
  when_to_progress: string;
  when_to_regress: string;
}

/**
 * Extract programming principles from book content
 */
export const extractProgrammingPrinciples = async (
  bookTitle: string,
  bookAuthor: string,
  bookContent: string,
  category: 'mobility' | 'athletic' | 'bodybuilding' | 'aesthetics' | 'running' | 'sport'
): Promise<{
  principles: ProgrammingPrinciple[];
  programming_templates?: Record<string, any>;
}> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are an expert exercise scientist analyzing "${bookTitle}" by ${bookAuthor}.

Extract the core programming principles and exercise selection guidelines from this book.

Focus on:
1. **Exercise Selection Criteria**: When to choose specific exercises, what makes an exercise appropriate for certain goals/situations
2. **Programming Patterns**: Sets/reps schemes, rest periods, frequency, exercise order
3. **Personalization Strategies**: How to modify programs for different individuals, progressions/regressions
4. **Goal-Specific Guidelines**: How programming differs for strength, hypertrophy, athletic performance, etc.
5. **Injury/Limitation Protocols**: Exercise substitutions, modifications, warning signs

**Book Content:**
${bookContent}

Extract ALL programming principles, guidelines, and knowledge. Return as JSON.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      principles: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: {
              type: Type.STRING,
              description: "One of: 'exercise_selection', 'programming', 'personalization', 'goal_specific', 'injury_protocol'"
            },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            applicable_goals: { type: Type.ARRAY, items: { type: Type.STRING } },
            applicable_experience: { type: Type.ARRAY, items: { type: Type.STRING } },
            exercise_recommendations: {
              type: Type.ARRAY,
              items: { type: Type.OBJECT },
              nullable: true
            },
            guidelines: {
              type: Type.ARRAY,
              items: { type: Type.OBJECT },
              nullable: true
            },
          },
          required: ["type", "title", "description", "applicable_goals", "applicable_experience"],
        },
      },
      programming_templates: {
        type: Type.OBJECT,
        nullable: true,
      },
    },
    required: ["principles"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
  } catch (error: any) {
    console.error(`Error extracting principles from ${bookTitle}:`, error);
    throw new Error(`Failed to extract principles: ${error.message}`);
  }
};

/**
 * Extract exercise modifications and progressions
 */
export const extractExerciseModifications = async (
  bookTitle: string,
  bookAuthor: string,
  bookContent: string
): Promise<ExerciseModification[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are analyzing "${bookTitle}" by ${bookAuthor}.

Extract exercise modifications, progressions, and regressions from this book.

For each exercise mentioned, identify:
- Progressions (easier → harder variations)
- Regressions (harder → easier variations)
- Modifications for injuries/limitations
- Equipment alternatives

**Book Content:**
${bookContent}

Return as JSON array of exercise modifications.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      exercise_modifications: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            base_exercise: { type: Type.STRING },
            progressions: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            regressions: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            modifications: { type: Type.OBJECT, nullable: true },
            equipment_alternatives: { type: Type.OBJECT, nullable: true },
          },
          required: ["base_exercise", "progressions", "regressions"],
        },
      },
    },
    required: ["exercise_modifications"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.exercise_modifications || [];
  } catch (error: any) {
    console.error(`Error extracting modifications from ${bookTitle}:`, error);
    throw new Error(`Failed to extract modifications: ${error.message}`);
  }
};

/**
 * Extract goal-specific guidelines
 */
export const extractGoalGuidelines = async (
  bookTitle: string,
  bookAuthor: string,
  bookContent: string
): Promise<GoalGuidelines[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are analyzing "${bookTitle}" by ${bookAuthor}.

Extract goal-specific exercise selection guidelines.

For each major goal (strength, hypertrophy, athletic performance, aesthetics, mobility), provide:
- Primary exercises (must-haves)
- Exercise priorities/order
- Sets/reps schemes
- Programming considerations

**Book Content:**
${bookContent}

Return as JSON array of goal guidelines.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      goal_guidelines: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            goal: { type: Type.STRING },
            primary_exercises: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            exercise_order: { type: Type.STRING },
            volume_guidelines: { type: Type.STRING },
            periodization: { type: Type.STRING },
          },
          required: ["goal", "primary_exercises", "exercise_order"],
        },
      },
    },
    required: ["goal_guidelines"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.goal_guidelines || [];
  } catch (error: any) {
    console.error(`Error extracting goal guidelines from ${bookTitle}:`, error);
    throw new Error(`Failed to extract goal guidelines: ${error.message}`);
  }
};

/**
 * Extract injury and limitation protocols
 */
export const extractInjuryProtocols = async (
  bookTitle: string,
  bookAuthor: string,
  bookContent: string
): Promise<InjuryProtocol[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are analyzing "${bookTitle}" by ${bookAuthor}.

Extract injury prevention and modification protocols.

For common issues (lower back pain, shoulder impingement, knee pain, etc.), provide:
- Warning signs to avoid certain exercises
- Exercise substitutions
- Prehab/rehab recommendations
- When to progress vs regress

**Book Content:**
${bookContent}

Return as JSON array of injury protocols.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      injury_protocols: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            issue: { type: Type.STRING },
            exercises_to_avoid: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            exercise_substitutions: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            prehab_exercises: { type: Type.ARRAY, items: { type: Type.OBJECT } },
            warning_signs: { type: Type.ARRAY, items: { type: Type.STRING } },
            when_to_progress: { type: Type.STRING },
            when_to_regress: { type: Type.STRING },
          },
          required: ["issue", "exercises_to_avoid", "exercise_substitutions"],
        },
      },
    },
    required: ["injury_protocols"],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.injury_protocols || [];
  } catch (error: any) {
    console.error(`Error extracting injury protocols from ${bookTitle}:`, error);
    throw new Error(`Failed to extract injury protocols: ${error.message}`);
  }
};

/**
 * Process a complete book and extract all knowledge types
 */
export const extractAllKnowledgeFromBook = async (
  bookTitle: string,
  bookAuthor: string,
  bookContent: string,
  category: 'mobility' | 'athletic' | 'bodybuilding' | 'aesthetics' | 'running' | 'sport'
): Promise<{
  principles: ProgrammingPrinciple[];
  modifications: ExerciseModification[];
  goalGuidelines: GoalGuidelines[];
  injuryProtocols: InjuryProtocol[];
  programmingTemplates?: Record<string, any>;
}> => {
  console.log(`📖 Extracting knowledge from: ${bookTitle}...`);

  const [principles, modifications, goalGuidelines, injuryProtocols] = await Promise.all([
    extractProgrammingPrinciples(bookTitle, bookAuthor, bookContent, category),
    extractExerciseModifications(bookTitle, bookAuthor, bookContent),
    extractGoalGuidelines(bookTitle, bookAuthor, bookContent),
    extractInjuryProtocols(bookTitle, bookAuthor, bookContent),
  ]);

  return {
    principles: principles.principles,
    modifications,
    goalGuidelines,
    injuryProtocols,
    programmingTemplates: principles.programming_templates,
  };
};

