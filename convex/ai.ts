/**
 * Convex AI Actions - Server-side Gemini API calls
 *
 * SECURITY: API keys are kept server-side only, never exposed to client
 */

import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Parse a text workout plan into structured JSON
 * Server-side action to keep API key secure
 */
export const parseWorkoutPlan = action({
  args: {
    planText: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    // Dynamic import to avoid bundling issues
    const { GoogleGenerativeAI } = await import("@google/genai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const systemPrompt = `You are a workout plan parser. Parse the user's workout plan text into a structured JSON format.

Output JSON schema:
{
  "name": "Plan Name",
  "weeklyPlan": [
    {
      "day_of_week": 1-7 (1=Monday, 7=Sunday),
      "focus": "Workout focus (e.g., 'Upper Body', 'Rest')",
      "notes": "Optional notes",
      "blocks": [
        {
          "type": "single" | "superset" | "amrap",
          "title": "Optional block title",
          "rounds": number (for supersets),
          "duration_minutes": number (for AMRAPs),
          "exercises": [
            {
              "exercise_name": "Exercise name",
              "category": "warmup" | "main" | "cooldown",
              "notes": "Optional notes",
              "rpe": "6-7" (optional),
              "metrics_template": {
                "type": "sets_reps_weight",
                "target_sets": 3,
                "target_reps": "8-10",
                "rest_period_s": 90
              }
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- Parse ALL 7 days of the week
- If a day is rest, set focus to "Rest" with empty blocks array
- Recognize common formats: supersets (A1/A2), AMRAPs, EMOMs
- Extract sets, reps, weight guidance from text
- Return ONLY valid JSON, no markdown`;

    try {
      const result = await model.generateContent([
        systemPrompt,
        `User's plan text:\n\n${args.planText}`
      ]);

      const responseText = result.response.text();

      // Extract JSON from markdown code blocks if present
      let jsonString = responseText;
      if (responseText.includes('```json')) {
        const match = responseText.match(/```json\n([\s\S]*?)\n```/);
        if (match) jsonString = match[1];
      } else if (responseText.includes('```')) {
        const match = responseText.match(/```\n([\s\S]*?)\n```/);
        if (match) jsonString = match[1];
      }

      const parsedPlan = JSON.parse(jsonString);

      // Increment user's API usage
      await ctx.runMutation("mutations:incrementPlanParseUsage" as any, {
        userId: args.userId
      });

      return parsedPlan;
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to parse workout plan: ${error.message}`);
    }
  },
});

/**
 * Generate a personalized workout plan
 * Server-side action to keep API key secure
 */
export const generateWorkoutPlan = action({
  args: {
    userId: v.string(),
    preferences: v.object({
      primary_goal: v.string(),
      experience_level: v.string(),
      training_frequency: v.string(),
      pain_points: v.array(v.string()),
      sport: v.optional(v.string()),
      additional_notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const { GoogleGenerativeAI } = await import("@google/genai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const { primary_goal, experience_level, training_frequency, pain_points, sport, additional_notes } = args.preferences;

    const systemPrompt = `You are an expert strength & conditioning coach. Generate a personalized workout plan based on the user's goals and constraints.

User Profile:
- Goal: ${primary_goal}
- Experience: ${experience_level}
- Training Days/Week: ${training_frequency}
- Pain Points: ${pain_points.join(', ') || 'None'}
- Sport Focus: ${sport || 'General Fitness'}
${additional_notes ? `- Additional Notes: ${additional_notes}` : ''}

Generate a structured 7-day workout plan in JSON format (same schema as parseWorkoutPlan).

Requirements:
- Match training frequency (rest days on non-training days)
- Avoid exercises that aggravate pain points
- Progressive overload built in
- Sport-specific exercises if applicable
- Proper warm-up and cool-down
- Evidence-based exercise selection

Return ONLY valid JSON.`;

    try {
      const result = await model.generateContent(systemPrompt);
      const responseText = result.response.text();

      // Extract JSON
      let jsonString = responseText;
      if (responseText.includes('```json')) {
        const match = responseText.match(/```json\n([\s\S]*?)\n```/);
        if (match) jsonString = match[1];
      } else if (responseText.includes('```')) {
        const match = responseText.match(/```\n([\s\S]*?)\n```/);
        if (match) jsonString = match[1];
      }

      const generatedPlan = JSON.parse(jsonString);

      // Increment user's API usage
      await ctx.runMutation("mutations:incrementPlanGenerationUsage" as any, {
        userId: args.userId
      });

      return generatedPlan;
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate workout plan: ${error.message}`);
    }
  },
});

/**
 * Explain an exercise with form cues and tips
 * Server-side action to keep API key secure
 */
export const explainExercise = action({
  args: {
    exerciseName: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // First check if exercise explanation exists in cache
    const cached = await ctx.runQuery("queries:getExerciseFromCache" as any, {
      exerciseName: args.exerciseName
    });

    if (cached) {
      return {
        explanation: cached.explanation,
        muscles_worked: cached.muscles_worked,
        form_cue: cached.form_cue,
        common_mistake: cached.common_mistake,
        cached: true
      };
    }

    // Not in cache, generate explanation
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Gemini API key not configured");
    }

    const { GoogleGenerativeAI } = await import("@google/genai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Provide a concise explanation of the exercise: "${args.exerciseName}"

Format as JSON:
{
  "explanation": "Brief 2-3 sentence overview",
  "muscles_worked": ["Primary muscle 1", "Primary muscle 2"],
  "form_cue": "Single most important form cue",
  "common_mistake": "Most common mistake to avoid"
}

Return ONLY valid JSON.`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Extract JSON
      let jsonString = responseText;
      if (responseText.includes('```json')) {
        const match = responseText.match(/```json\n([\s\S]*?)\n```/);
        if (match) jsonString = match[1];
      } else if (responseText.includes('```')) {
        const match = responseText.match(/```\n([\s\S]*?)\n```/);
        if (match) jsonString = match[1];
      }

      const exerciseData = JSON.parse(jsonString);

      // Save to cache
      await ctx.runMutation("mutations:cacheExercise" as any, {
        exercise_name: args.exerciseName.toLowerCase().replace(/\s+/g, '_'),
        ...exerciseData,
        source: "gemini_api"
      });

      return {
        ...exerciseData,
        cached: false
      };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to explain exercise: ${error.message}`);
    }
  },
});
