import { db } from '../firebase';
import { collection, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { explainExercise } from './geminiService';

/**
 * Exercise Explanation Caching Service
 * Checks Firebase cache before calling Gemini API
 * Populated using your Gemini Ultra subscription
 */

interface CachedExercise {
  exercise_name: string;
  explanation: string;
  muscles_worked?: string[];
  form_cue?: string;
  common_mistake?: string;
  generated_at: any;
  hit_count: number;
  last_accessed: any;
  source: 'gemini_ultra' | 'gemini_api';
}

/**
 * Get cached exercise explanation from Firebase
 * Returns null if not cached
 */
export const getCachedExplanation = async (exerciseName: string): Promise<string | null> => {
  try {
    const normalized = exerciseName.toLowerCase().trim().replace(/\s+/g, '_');
    const docRef = doc(db, 'exercises_cache', normalized);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as CachedExercise;

      // Update hit count and last accessed
      await setDoc(docRef, {
        hit_count: (data.hit_count || 0) + 1,
        last_accessed: serverTimestamp()
      }, { merge: true });

      return data.explanation;
    }

    return null;
  } catch (error) {
    console.error('Error getting cached explanation:', error);
    return null;
  }
};

/**
 * Cache an exercise explanation to Firebase
 */
export const cacheExplanation = async (
  exerciseName: string,
  explanation: string,
  source: 'gemini_ultra' | 'gemini_api' = 'gemini_api'
) => {
  try {
    const normalized = exerciseName.toLowerCase().trim().replace(/\s+/g, '_');
    await setDoc(doc(db, 'exercises_cache', normalized), {
      exercise_name: exerciseName,
      explanation,
      generated_at: serverTimestamp(),
      hit_count: 1,
      last_accessed: serverTimestamp(),
      source
    });
  } catch (error) {
    console.error('Error caching explanation:', error);
  }
};

/**
 * Get exercise explanation with caching
 * Checks cache first, falls back to API
 */
export const getExerciseExplanationWithCache = async (
  exerciseName: string,
  exerciseNotes?: string
): Promise<string> => {
  // Try cache first
  const cached = await getCachedExplanation(exerciseName);
  if (cached) {
    console.log(`Cache HIT for: ${exerciseName}`);
    return cached;
  }

  console.log(`Cache MISS for: ${exerciseName} - calling API`);

  // Not cached - call Gemini API
  const explanation = await explainExercise(exerciseName, exerciseNotes);

  // Cache it for next time
  await cacheExplanation(exerciseName, explanation, 'gemini_api');

  return explanation;
};

/**
 * Batch upload exercise explanations (for manual population via Gemini Ultra)
 * You'll use this to upload the JSON you generate on gemini.google.com
 */
export const batchUploadExercises = async (exercises: Array<{
  name: string;
  explanation: string;
  muscles?: string[];
  form_cue?: string;
  mistake?: string;
}>) => {
  const batch = exercises.map(async (ex) => {
    const normalized = ex.name.toLowerCase().trim().replace(/\s+/g, '_');
    return setDoc(doc(db, 'exercises_cache', normalized), {
      exercise_name: ex.name,
      explanation: ex.explanation,
      muscles_worked: ex.muscles || [],
      form_cue: ex.form_cue || '',
      common_mistake: ex.mistake || '',
      generated_at: serverTimestamp(),
      hit_count: 0,
      last_accessed: serverTimestamp(),
      source: 'gemini_ultra'
    });
  });

  await Promise.all(batch);
  console.log(`Successfully uploaded ${exercises.length} exercises to cache`);
};
