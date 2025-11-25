import { ConvexReactClient } from "convex/react";
import { api } from "../convex/_generated/api";

interface ExerciseContext {
  exercise: any;
  alternatives: any[];
  sport_specific_alternatives: any[];
  injury_safe_alternatives: any[];
  similar_exercises: any[];
}

export class FlashContextService {
  private convex: ConvexReactClient;
  
  constructor(convexClient: ConvexReactClient) {
    this.convex = convexClient;
  }
  
  /**
   * Get rich exercise context for Flash to make Pro-quality decisions
   */
  async getExerciseContext(
    exerciseName: string, 
    userId: string, 
    reason?: string
  ): Promise<ExerciseContext> {
    // Get the target exercise with full metadata
    const exercise = await this.convex.query(api.queries.getCachedExercise, {
      exerciseName
    });
    
    if (!exercise) {
      throw new Error(`Exercise ${exerciseName} not found`);
    }
    
    // Get user profile for personalization
    const user = await this.convex.query(api.queries.getUserProfile, { userId });
    const sport = user?.trainingPreferences?.sport_specific;
    const injuries = user?.injuryProfile?.current_injuries || [];
    
    // Get alternatives based on context
    const [alternatives, sportSpecificAlts, injurySafeAlts, similarExercises] = await Promise.all([
      this.getGeneralAlternatives(exercise),
      sport ? this.getSportSpecificAlternatives(exercise, sport) : [],
      this.getInjurySafeAlternatives(exercise, injuries, reason),
      this.getSimilarExercises(exercise),
    ]);
    
    return {
      exercise,
      alternatives,
      sport_specific_alternatives: sportSpecificAlts,
      injury_safe_alternatives: injurySafeAlts,
      similar_exercises: similarExercises,
    };
  }
  
  /**
   * Build compressed knowledge for Flash prompt
   */
  buildFlashPromptContext(context: ExerciseContext, reason?: string): string {
    const { exercise } = context;
    
    let prompt = `**EXERCISE TO REPLACE:** ${exercise.exercise_name}
**TIER:** ${exercise.exercise_tier || 'Unknown'} (S=fundamental, A=important, B=good, C=specialized)
**PATTERN:** ${exercise.movement_pattern || 'unknown'}
**EQUIPMENT:** ${exercise.equipment_required?.join(', ') || 'none'}
**INJURY RISK:** ${exercise.injury_risk || 'unknown'}

`;

    // Add injury-specific context
    if (reason?.toLowerCase().includes('pain') || context.injury_safe_alternatives.length > 0) {
      prompt += `**🏥 INJURY-SAFE ALTERNATIVES:**\n`;
      context.injury_safe_alternatives.slice(0, 5).forEach(alt => {
        prompt += `- ${alt.exercise_name} (${alt.exercise_tier}-tier ${alt.movement_pattern})\n`;
      });
      prompt += '\n';
    }
    
    // Add sport-specific context
    if (context.sport_specific_alternatives.length > 0) {
      prompt += `**🏆 SPORT-SPECIFIC ALTERNATIVES:**\n`;
      context.sport_specific_alternatives.slice(0, 5).forEach(alt => {
        prompt += `- ${alt.exercise_name} (Rating: ${alt.sport_rating}/10)\n`;
      });
      prompt += '\n';
    }
    
    // Add similar exercises
    if (context.similar_exercises.length > 0) {
      prompt += `**🔄 SIMILAR EXERCISES (same pattern):**\n`;
      context.similar_exercises.slice(0, 5).forEach(alt => {
        prompt += `- ${alt.exercise_name} (${alt.exercise_tier}-tier)\n`;
      });
      prompt += '\n';
    }
    
    prompt += `**SELECTION PRIORITY:**
1. If PAIN mentioned → Use injury-safe alternatives
2. If sport-specific user → Prioritize high sport ratings
3. If equipment issue → Match available equipment
4. If preference → Use similar movement pattern

**DECISION FRAMEWORK:**
- Same tier or higher is better
- Match or improve sport rating
- Never suggest exercises with injury contraindications
- Prefer evidence-backed exercises (high > moderate > low)`;
    
    return prompt;
  }
  
  private async getGeneralAlternatives(exercise: any): Promise<any[]> {
    return await this.convex.query(api.queries.getAllExercises, {
      category: exercise.primary_category,
    }) || [];
  }
  
  private async getSportSpecificAlternatives(exercise: any, sport: string): Promise<any[]> {
    const alternatives = await this.convex.query(api.queries.getAllExercises, {}) || [];
    
    return alternatives
      .filter(alt => alt.sport_ratings && alt.sport_ratings[sport] >= 7)
      .map(alt => ({
        ...alt,
        sport_rating: alt.sport_ratings[sport]
      }))
      .sort((a, b) => b.sport_rating - a.sport_rating);
  }
  
  private async getInjurySafeAlternatives(exercise: any, injuries: any[], reason?: string): Promise<any[]> {
    if (injuries.length === 0) return [];
    
    const allExercises = await this.convex.query(api.queries.getAllExercises, {}) || [];
    const injuryTypes = injuries.map(i => i.injury_type);
    
    // Find exercises that don't have contraindications for user's injuries
    return allExercises.filter(alt => {
      if (!alt.injury_contraindications) return true;
      
      // Check if this alternative is safe for user's injuries
      for (const injuryType of injuryTypes) {
        const contraindication = alt.injury_contraindications.find(
          (c: any) => c.injury_type === injuryType
        );
        
        if (contraindication && contraindication.severity === "absolute") {
          return false; // Unsafe
        }
      }
      
      return true;
    });
  }
  
  private async getSimilarExercises(exercise: any): Promise<any[]> {
    const allExercises = await this.convex.query(api.queries.getAllExercises, {}) || [];
    
    return allExercises.filter(alt => 
      alt.movement_pattern === exercise.movement_pattern &&
      alt.exercise_name !== exercise.exercise_name
    );
  }
}

// Enhanced chatbot initialization with database context
export async function initializeChatSessionWithContext(
  plan: any, 
  dayOfWeek: number,
  convexClient: ConvexReactClient
): Promise<any> {
  const contextService = new FlashContextService(convexClient);
  
  // Build rich system context from database
  const dbContext = await buildDatabaseContext(convexClient);
  
  const systemInstruction = [
    'You are REBLD Assistant, powered by a comprehensive exercise intelligence database.',
    'You have access to 700+ exercises with complete metadata including:',
    '- Exercise tiers (S=fundamental, A=important, B=good, C=specialized)',
    '- Movement patterns (squat, hinge, push/pull horizontal/vertical, etc.)',
    '- Equipment requirements and alternatives',
    '- Injury contraindications and safe modifications',
    '- Sport-specific ratings (0-10 for each sport)',
    '- Evidence levels (high/moderate/low)',
    '- Experience requirements (beginner/intermediate/advanced)',
    '',
    '**DATABASE INTELLIGENCE:**',
    dbContext,
    '',
    '**EXERCISE SUBSTITUTION PROTOCOL:**',
    '1. Ask WHY they want to swap (pain/preference/equipment/other)',
    '2. Use database to find alternatives:',
    '   - If PAIN: Filter by injury contraindications',
    '   - If SPORT: Prioritize high sport ratings', 
    '   - If EQUIPMENT: Match available equipment',
    '   - If PREFERENCE: Same movement pattern, similar tier',
    '3. Explain WHY your suggestion is better',
    '4. Call substituteExercise with the best option',
    '',
    'You have Pro-level intelligence through database access, not just reasoning.',
  ].join('\n');
  
  // Use the existing initialization but with enhanced context
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey });
  
  // ... rest of function
  return ai.chats.create({
    model: 'gemini-2.5-flash', // Flash with database intelligence
    config: {
      systemInstruction,
      // ... tools etc
    }
  });
}

async function buildDatabaseContext(convex: ConvexReactClient): Promise<string> {
  const exercises = await convex.query(api.queries.getAllExercises, {}) || [];
  
  // Build tier distribution
  const tierCounts = exercises.reduce((acc, ex) => {
    const tier = ex.exercise_tier || 'Unknown';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {} as any);
  
  // Build movement pattern distribution
  const patternCounts = exercises.reduce((acc, ex) => {
    const pattern = ex.movement_pattern || 'unknown';
    acc[pattern] = (acc[pattern] || 0) + 1;
    return acc;
  }, {} as any);
  
  return `
**EXERCISE DATABASE STATS:**
- Total exercises: ${exercises.length}
- S-tier (fundamental): ${tierCounts.S || 0}
- A-tier (important): ${tierCounts.A || 0} 
- B-tier (good): ${tierCounts.B || 0}
- C-tier (specialized): ${tierCounts.C || 0}

**MOVEMENT PATTERNS AVAILABLE:**
- Squat: ${patternCounts.squat || 0} exercises
- Hinge: ${patternCounts.hinge || 0} exercises  
- Push: ${(patternCounts.push_horizontal || 0) + (patternCounts.push_vertical || 0)} exercises
- Pull: ${(patternCounts.pull_horizontal || 0) + (patternCounts.pull_vertical || 0)} exercises
- Core: ${patternCounts.core || 0} exercises
- Mobility: ${patternCounts.mobility || 0} exercises
- Cardio: ${patternCounts.cardio || 0} exercises
- Plyometric: ${patternCounts.plyometric || 0} exercises

**INJURY SAFETY:**
- ${exercises.filter(e => e.injury_contraindications?.length > 0).length} exercises have injury data
- Safe alternatives available for all common injuries
`;
}
