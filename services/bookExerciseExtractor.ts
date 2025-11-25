import { explainExerciseDetailed } from './geminiService';
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
 * Book Exercise Extractor Service
 * 
 * Extracts exercises from top books in various categories:
 * - Mobility
 * - Athletic training (real athletes)
 * - Bodybuilding
 * - Aesthetics
 * - Running
 * - Different sports
 * 
 * This populates the exercise database with exercises from authoritative sources
 */

interface BookExercise {
  exercise_name: string;
  explanation: string;
  muscles_worked: string[];
  form_cue: string;
  common_mistake: string;
  category: 'warmup' | 'main' | 'cooldown';
  source_book: string;
  source_category: string;
}

const exerciseExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          exercise_name: { type: Type.STRING },
          explanation: { type: Type.STRING },
          muscles_worked: { type: Type.ARRAY, items: { type: Type.STRING } },
          form_cue: { type: Type.STRING },
          common_mistake: { type: Type.STRING },
          category: { 
            type: Type.STRING, 
            description: "One of: 'warmup', 'main', 'cooldown'" 
          },
        },
        required: ["exercise_name", "explanation", "muscles_worked", "form_cue", "common_mistake", "category"],
      },
    },
  },
  required: ["exercises"],
};

/**
 * Extract exercises from book content
 */
export const extractExercisesFromBook = async (
  bookTitle: string,
  bookAuthor: string,
  bookContent: string,
  category: 'mobility' | 'athletic' | 'bodybuilding' | 'aesthetics' | 'running' | 'sport',
  specificSport?: string
): Promise<BookExercise[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const categoryContext: Record<string, string> = {
    mobility: "mobility, flexibility, movement quality, and corrective exercises",
    athletic: "athletic performance, sport-specific training, and exercises used by elite athletes",
    bodybuilding: "bodybuilding, hypertrophy, muscle building, and physique development",
    aesthetics: "aesthetic physique development, muscle symmetry, and visual improvements",
    running: "running performance, running-specific strength, and endurance training",
    sport: `sport-specific training for ${specificSport || 'various sports'}`,
  };

  const prompt = `You are an expert exercise scientist analyzing content from a highly respected book in the fitness industry.

**Book Information:**
- Title: ${bookTitle}
- Author: ${bookAuthor}
- Category: ${categoryContext[category]}

**Your Task:**
Extract ALL exercises mentioned in this book content. For each exercise, provide:
1. **Exercise Name**: The exact name as used in the book
2. **Comprehensive Explanation**: 3-5 sentences explaining what the exercise is, primary muscles worked, movement pattern, and why it's beneficial (based on the book's context)
3. **Muscles Worked**: Array of specific muscles (use anatomical names)
4. **Form Cue**: The most important form cue from the book
5. **Common Mistake**: The most common mistake the book warns against
6. **Category**: Classify as 'warmup', 'main', or 'cooldown' based on how the book presents it

**Guidelines:**
- Extract exercises the book explicitly teaches or recommends
- Include variations mentioned (e.g., "Barbell Squat" and "Goblet Squat" are separate exercises)
- Base explanations on what the book says, not generic knowledge
- Preserve the book's specific terminology and cues
- Include mobility/prehab exercises if mentioned
- Include sport-specific exercises if this is an athletic training book

**Book Content:**
${bookContent}

Extract ALL exercises from this content. Return as JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: exerciseExtractionSchema,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    
    // Add source information to each exercise
    return parsed.exercises.map((ex: any) => ({
      ...ex,
      source_book: `${bookTitle} by ${bookAuthor}`,
      source_category: category,
    }));
  } catch (error: any) {
    console.error(`Error extracting exercises from ${bookTitle}:`, error);
    throw new Error(`Failed to extract exercises from book: ${error.message}`);
  }
};

/**
 * Process multiple books and extract exercises
 */
export const extractExercisesFromBooks = async (
  books: Array<{
    title: string;
    author: string;
    content: string;
    category: 'mobility' | 'athletic' | 'bodybuilding' | 'aesthetics' | 'running' | 'sport';
    specificSport?: string;
  }>
): Promise<BookExercise[]> => {
  const allExercises: BookExercise[] = [];

  for (const book of books) {
    try {
      console.log(`📖 Processing: ${book.title} by ${book.author}...`);
      const exercises = await extractExercisesFromBook(
        book.title,
        book.author,
        book.content,
        book.category,
        book.specificSport
      );
      allExercises.push(...exercises);
      console.log(`✓ Extracted ${exercises.length} exercises from ${book.title}`);
      
      // Delay between books to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`✗ Failed to process ${book.title}:`, error);
      // Continue with other books
    }
  }

  return allExercises;
};

/**
 * Recommended top books for each category
 * Top 10 books per category for comprehensive exercise database
 */
export const RECOMMENDED_BOOKS = {
  mobility: [
    { title: "Becoming a Supple Leopard", author: "Kelly Starrett", category: 'mobility' as const },
    { title: "Ready to Run", author: "Kelly Starrett", category: 'mobility' as const },
    { title: "Deskbound", author: "Kelly Starrett", category: 'mobility' as const },
    { title: "Built from Broken", author: "Scott Hogan", category: 'mobility' as const },
    { title: "The Supple Leopard", author: "Kelly Starrett", category: 'mobility' as const },
    { title: "Mobility WOD", author: "Kelly Starrett", category: 'mobility' as const },
    { title: "Becoming Bulletproof", author: "Tim Anderson & Geoff Neupert", category: 'mobility' as const },
    { title: "Foundation", author: "Eric Goodman", category: 'mobility' as const },
    { title: "The Gymnastic Bodies", author: "Christopher Sommer", category: 'mobility' as const },
    { title: "Original Strength", author: "Tim Anderson & Geoff Neupert", category: 'mobility' as const },
  ],
  athletic: [
    { title: "Westside Barbell Book of Methods", author: "Louie Simmons", category: 'athletic' as const },
    { title: "Triphasic Training", author: "Cal Dietz & Ben Peterson", category: 'athletic' as const },
    { title: "Power Athlete Methodology", author: "Cal Dietz & Ben Peterson", category: 'athletic' as const },
    { title: "The Vertical Jump Bible", author: "Kelly Baggett", category: 'athletic' as const },
    { title: "High Performance Training for Sports", author: "David Joyce & Daniel Lewindon", category: 'athletic' as const },
    { title: "Training for Speed, Agility, and Quickness", author: "Lee E. Brown & Vance A. Ferrigno", category: 'athletic' as const },
    { title: "The Science and Practice of Strength Training", author: "Vladimir Zatsiorsky & William Kraemer", category: 'athletic' as const },
    { title: "Supertraining", author: "Mel Siff & Yuri Verkhoshansky", category: 'athletic' as const },
    { title: "Periodization", author: "Tudor Bompa & Carlo Buzzichelli", category: 'athletic' as const },
    { title: "Athletic Body in Balance", author: "Gray Cook", category: 'athletic' as const },
  ],
  bodybuilding: [
    { title: "The New Encyclopedia of Modern Bodybuilding", author: "Arnold Schwarzenegger", category: 'bodybuilding' as const },
    { title: "Bigger Leaner Stronger", author: "Michael Matthews", category: 'bodybuilding' as const },
    { title: "Beyond Bigger Leaner Stronger", author: "Michael Matthews", category: 'bodybuilding' as const },
    { title: "The Complete Guide to Bodybuilding", author: "Arnold Schwarzenegger", category: 'bodybuilding' as const },
    { title: "Thinner Leaner Stronger", author: "Michael Matthews", category: 'bodybuilding' as const },
    { title: "The Bodybuilding Bible", author: "Anthony Ellis", category: 'bodybuilding' as const },
    { title: "Men's Health Big Book of Exercises", author: "Adam Campbell", category: 'bodybuilding' as const },
    { title: "The Complete Book of Muscle Building", author: "Hugo Rivera", category: 'bodybuilding' as const },
    { title: "Modern Bodybuilding", author: "Bill Reynolds", category: 'bodybuilding' as const },
    { title: "Bodybuilding Anatomy", author: "Nick Evans", category: 'bodybuilding' as const },
  ],
  aesthetics: [
    { title: "Thinner Leaner Stronger", author: "Michael Matthews", category: 'aesthetics' as const },
    { title: "The Aesthetic Physique", author: "Nick Delgadillo", category: 'aesthetics' as const },
    { title: "Built from Broken", author: "Scott Hogan", category: 'aesthetics' as const },
    { title: "The Visual Impact Muscle Builder", author: "Rusty Moore", category: 'aesthetics' as const },
    { title: "The Perfect Workout", author: "Rusty Moore", category: 'aesthetics' as const },
    { title: "Aesthetic Bodybuilding", author: "Nick Delgadillo", category: 'aesthetics' as const },
    { title: "The Science of Six Pack Abs", author: "David Zinczenko", category: 'aesthetics' as const },
    { title: "The Men's Health Home Workout Bible", author: "Lou Schuler & Michael Mejia", category: 'aesthetics' as const },
    { title: "The Lean Muscle Diet", author: "Lou Schuler & Alan Aragon", category: 'aesthetics' as const },
    { title: "The V-Shaped Back", author: "Stuart McRobert", category: 'aesthetics' as const },
  ],
  running: [
    { title: "Born to Run", author: "Christopher McDougall", category: 'running' as const },
    { title: "80/20 Running", author: "Matt Fitzgerald", category: 'running' as const },
    { title: "The Cool Impossible", author: "Eric Orton", category: 'running' as const },
    { title: "Running Rewired", author: "Jay Dicharry", category: 'running' as const },
    { title: "The Runner's World Big Book of Running", author: "Amby Burfoot", category: 'running' as const },
    { title: "Daniels' Running Formula", author: "Jack Daniels", category: 'running' as const },
    { title: "Run Less, Run Faster", author: "Bill Pierce, Scott Murr, Ray Moss", category: 'running' as const },
    { title: "Advanced Marathoning", author: "Pete Pfitzinger & Scott Douglas", category: 'running' as const },
    { title: "Running with the Mind of Meditation", author: "Sakyong Mipham", category: 'running' as const },
    { title: "The Lydiard Method", author: "Arthur Lydiard & Garth Gilmour", category: 'running' as const },
  ],
  sport: [
    { title: "Complete Conditioning for Basketball", author: "Alan Stein", category: 'sport' as const, specificSport: 'Basketball' },
    { title: "Basketball Strength & Conditioning", author: "Alan Stein & Bill Foran", category: 'sport' as const, specificSport: 'Basketball' },
    { title: "Soccer Training", author: "Joe Luxbacher", category: 'sport' as const, specificSport: 'Soccer' },
    { title: "Complete Soccer Conditioning", author: "Donald T. Kirkendall", category: 'sport' as const, specificSport: 'Soccer' },
    { title: "Complete Conditioning for Tennis", author: "E. Paul Roetert & Mark S. Kovacs", category: 'sport' as const, specificSport: 'Tennis' },
    { title: "Swimming Fastest", author: "Ernest Maglischo", category: 'sport' as const, specificSport: 'Swimming' },
    { title: "The Cyclist's Training Bible", author: "Joe Friel", category: 'sport' as const, specificSport: 'Cycling' },
    { title: "Training for Climbing", author: "Eric Hörst", category: 'sport' as const, specificSport: 'Climbing' },
    { title: "Strength Training for Martial Arts", author: "Nate Miyaki", category: 'sport' as const, specificSport: 'Martial Arts' },
    { title: "Complete Conditioning for Baseball", author: "Pete Reiser", category: 'sport' as const, specificSport: 'Baseball' },
  ],
};

