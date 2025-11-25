import { ConvexReactClient } from "convex/react";
import { api } from "../convex/_generated/api";
import { GoogleGenAI } from '@google/generative-ai';
import { getApiKey } from './geminiService';

/**
 * Enhanced chatbot service that provides Flash with database context
 * to match Pro-level quality at Flash cost
 */
export class EnhancedChatService {
  private convex: ConvexReactClient;
  private ai: any;
  
  constructor(convexClient: ConvexReactClient) {
    this.convex = convexClient;
    const apiKey = getApiKey();
    if (!apiKey) throw new Error("API key required");
    this.ai = new GoogleGenAI({ apiKey });
  }
  
  /**
   * Send a message with rich database context
   */
  async sendMessageWithContext(
    chatSession: any,
    message: string,
    userId: string,
    plan: any,
    dayOfWeek: number
  ): Promise<any> {
    // Check if message is about exercise substitution
    const isSwapRequest = this.isExerciseSwapRequest(message);
    
    if (isSwapRequest) {
      const exerciseName = this.extractExerciseName(message);
      if (exerciseName) {
        const context = await this.buildSwapContext(exerciseName, userId);
        const enhancedMessage = this.enhanceSwapMessage(message, context);
        return await chatSession.sendMessage(enhancedMessage);
      }
    }
    
    // For non-swap messages, send as normal
    return await chatSession.sendMessage(message);
  }
  
  /**
   * Build comprehensive context for exercise swapping
   */
  private async buildSwapContext(exerciseName: string, userId: string) {
    const [exercise, user, alternatives] = await Promise.all([
      this.convex.query(api.queries.getCachedExercise, { exerciseName }),
      this.convex.query(api.queries.getUserProfile, { userId }),
      this.getSmartAlternatives(exerciseName, userId)
    ]);
    
    return {
      target_exercise: exercise,
      user_profile: user,
      alternatives,
    };
  }
  
  /**
   * Get smart alternatives based on user profile
   */
  private async getSmartAlternatives(exerciseName: string, userId: string) {
    const exercise = await this.convex.query(api.queries.getCachedExercise, { exerciseName });
    const user = await this.convex.query(api.queries.getUserProfile, { userId });
    
    if (!exercise || !user) return [];
    
    const allExercises = await this.convex.query(api.queries.getAllExercises, {}) || [];
    const sport = user.trainingPreferences?.sport_specific;
    const injuries = user.injuryProfile?.current_injuries || [];
    
    // Filter and score alternatives
    const alternatives = allExercises
      .filter(alt => {
        // Same movement pattern preferred
        if (alt.movement_pattern !== exercise.movement_pattern) return false;
        
        // Don't suggest the same exercise
        if (alt.exercise_name === exercise.exercise_name) return false;
        
        // Check injury safety
        if (injuries.length > 0 && alt.injury_contraindications) {
          const hasAbsoluteContra = alt.injury_contraindications.some((contra: any) =>
            injuries.some(injury => 
              injury.injury_type === contra.injury_type && contra.severity === 'absolute'
            )
          );
          if (hasAbsoluteContra) return false;
        }
        
        return true;
      })
      .map(alt => ({
        ...alt,
        sport_rating: sport && alt.sport_ratings ? alt.sport_ratings[sport] || 5 : 5,
        tier_score: this.getTierScore(alt.exercise_tier),
      }))
      .sort((a, b) => (b.sport_rating + b.tier_score) - (a.sport_rating + a.tier_score));
    
    return alternatives.slice(0, 10); // Top 10 alternatives
  }
  
  /**
   * Convert tier to numeric score for sorting
   */
  private getTierScore(tier: string | null): number {
    switch (tier) {
      case 'S': return 10;
      case 'A': return 8;
      case 'B': return 6;
      case 'C': return 4;
      default: return 3;
    }
  }
  
  /**
   * Enhance swap message with database context
   */
  private enhanceSwapMessage(originalMessage: string, context: any): string {
    const { target_exercise, user_profile, alternatives } = context;
    const sport = user_profile?.trainingPreferences?.sport_specific;
    const injuries = user_profile?.injuryProfile?.current_injuries || [];
    
    let enhancedMessage = originalMessage + '\n\n**DATABASE CONTEXT:**\n';
    
    // Target exercise info
    enhancedMessage += `**Current Exercise:** ${target_exercise.exercise_name}\n`;
    enhancedMessage += `- Tier: ${target_exercise.exercise_tier || 'Unknown'}\n`;
    enhancedMessage += `- Pattern: ${target_exercise.movement_pattern || 'unknown'}\n`;
    enhancedMessage += `- Equipment: ${target_exercise.equipment_required?.join(', ') || 'none'}\n`;
    
    if (sport && target_exercise.sport_ratings) {
      enhancedMessage += `- ${sport} Rating: ${target_exercise.sport_ratings[sport] || 5}/10\n`;
    }
    
    // User context
    if (sport) {
      enhancedMessage += `**User Sport:** ${sport}\n`;
    }
    
    if (injuries.length > 0) {
      enhancedMessage += `**User Injuries:** ${injuries.map(i => i.injury_type).join(', ')}\n`;
    }
    
    // Top alternatives with ratings
    if (alternatives.length > 0) {
      enhancedMessage += `**Top Alternatives:**\n`;
      alternatives.slice(0, 5).forEach((alt: any) => {
        enhancedMessage += `- ${alt.exercise_name} (${alt.exercise_tier}-tier, ${alt.sport_rating}/10 sport rating)\n`;
      });
    }
    
    enhancedMessage += '\nUse this context to make an intelligent recommendation.';
    
    return enhancedMessage;
  }
  
  /**
   * Check if message is about exercise swapping
   */
  private isExerciseSwapRequest(message: string): boolean {
    const swapKeywords = ['swap', 'replace', 'substitute', 'change', 'switch'];
    return swapKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }
  
  /**
   * Extract exercise name from swap request
   */
  private extractExerciseName(message: string): string | null {
    // Look for quoted exercise names
    const quotedMatch = message.match(/"([^"]+)"/);
    if (quotedMatch) return quotedMatch[1];
    
    // Look for common patterns
    const patterns = [
      /swap (.*?) for/i,
      /replace (.*?) with/i,
      /substitute (.*?) for/i,
      /change (.*?) to/i,
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) return match[1].trim();
    }
    
    return null;
  }
}

/**
 * Factory function to create enhanced chat service
 */
export function createEnhancedChatService(convexClient: ConvexReactClient): EnhancedChatService {
  return new EnhancedChatService(convexClient);
}
