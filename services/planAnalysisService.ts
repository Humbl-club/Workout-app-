import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string | undefined => {
  const inline = (process.env.API_KEY as unknown) as string | undefined;
  if (inline && typeof inline === 'string') return inline;
  const inlineAlt = (process.env.GEMINI_API_KEY as unknown) as string | undefined;
  if (inlineAlt && typeof inlineAlt === 'string') return inlineAlt;
  const viteInline = (import.meta as any)?.env?.VITE_GEMINI_API_KEY as string | undefined;
  if (viteInline && typeof viteInline === 'string') return viteInline;
  return undefined;
};

/**
 * Analyze a user-submitted workout plan and provide athletic grading
 */
export async function analyzePlan(planText: string): Promise<{
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  analysis: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    scoreBreakdown: {
      balance: number;
      progression: number;
      recovery: number;
      specificity: number;
      overall: number;
    };
  };
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const genAI = new GoogleGenAI({ apiKey });
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            grade: { type: "string", enum: ["A", "B", "C", "D", "F"] },
            category: { type: "string" },
            difficulty: { type: "string", enum: ["Beginner", "Intermediate", "Advanced"] },
            strengths: { type: "array", items: { type: "string" } },
            weaknesses: { type: "array", items: { type: "string" } },
            suggestions: { type: "array", items: { type: "string" } },
            balance: { type: "number" },
            progression: { type: "number" },
            recovery: { type: "number" },
            specificity: { type: "number" },
            overall: { type: "number" }
          },
          required: ["grade", "category", "difficulty", "strengths", "weaknesses", "suggestions", "balance", "progression", "recovery", "specificity", "overall"]
        }
      }
    });

    const prompt = `You are an elite strength & conditioning coach. Analyze this workout plan and provide an objective athletic grade.

PLAN TO ANALYZE:
${planText}

GRADING CRITERIA:

**Balance (0-100):**
- Push/Pull ratio
- Upper/Lower split
- Compound vs isolation
- Muscle group coverage

**Progression (0-100):**
- Progressive overload strategy
- Periodization
- Deload weeks
- Volume progression

**Recovery (0-100):**
- Rest days
- Training frequency
- Workout duration
- Intensity management

**Specificity (0-100):**
- Goal alignment
- Exercise selection quality
- Training frequency appropriateness

**Overall Score:**
Average of above 4 scores

**GRADE SCALE:**
- A (90-100): Elite programming
- B (80-89): Solid programming
- C (70-79): Adequate with issues
- D (60-69): Poor programming
- F (<60): Dangerous or ineffective

Provide:
1. Overall grade (A-F)
2. Category (Strength, Hypertrophy, Athletic, etc.)
3. Difficulty (Beginner, Intermediate, Advanced)
4. 3-5 strengths
5. 3-5 weaknesses
6. 3-5 specific suggestions
7. Score breakdown (0-100 for each criteria)

Return as JSON matching the schema.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const parsed = JSON.parse(text);

    return {
      grade: parsed.grade,
      category: parsed.category,
      difficulty: parsed.difficulty,
      analysis: {
        strengths: parsed.strengths,
        weaknesses: parsed.weaknesses,
        suggestions: parsed.suggestions,
        scoreBreakdown: {
          balance: parsed.balance,
          progression: parsed.progression,
          recovery: parsed.recovery,
          specificity: parsed.specificity,
          overall: parsed.overall
        }
      }
    };
  } catch (error) {
    console.error('Plan analysis error:', error);
    throw new Error('Failed to analyze plan');
  }
}
