import { db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Save exercise history for auto-fill next time
 */
export const saveExerciseHistory = async (
  userId: string | undefined,
  exerciseName: string,
  weight: number,
  reps: number
) => {
  if (!userId) return;

  const normalized = exerciseName.toLowerCase().replace(/\s+/g, '_');
  await setDoc(doc(db, `users/${userId}/exercise_history`, normalized), {
    exercise_name: exerciseName,
    last_weight: weight,
    last_reps: reps,
    last_logged: serverTimestamp()
  });
};

/**
 * Get exercise history for auto-fill
 */
export const getExerciseHistory = async (
  userId: string | undefined,
  exerciseName: string
): Promise<{ weight: number; reps: number } | null> => {
  if (!userId) return null;

  const normalized = exerciseName.toLowerCase().replace(/\s+/g, '_');
  const docRef = doc(db, `users/${userId}/exercise_history`, normalized);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const data = snap.data();
    return {
      weight: data.last_weight,
      reps: data.last_reps
    };
  }

  return null;
};
