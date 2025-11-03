# REBLD - Critical Fixes for Next Session

**Token Usage**: 581K/1M (58%)
**Status**: Mobile compact done, critical features needed
**Next**: Implement these fixes

---

## 🚨 Critical Issues to Fix

### **1. Add Exercise List View in SessionTracker**

**File**: components/SessionTracker.tsx

**Add after line 31**:
```tsx
const [showExerciseList, setShowExerciseList] = useState(false);
const [celebratedPRs, setCelebratedPRs] = useState<Set<string>>(new Set());
```

**Add button in header (after line 368)**:
```tsx
<button
  onClick={() => setShowExerciseList(!showExerciseList)}
  className="text-[10px] text-[var(--accent)] font-medium"
>
  {showExerciseList ? '▼' : '▶'} All ({allExercises.length})
</button>
```

**Add panel (after line 463)**:
```tsx
{showExerciseList && (
  <div className="mb-4 bg-[var(--surface)] border border-[var(--border)] rounded-md p-3 max-h-48 overflow-y-auto">
    <p className="text-[9px] uppercase text-[var(--text-tertiary)] font-bold mb-2">TODAY'S WORKOUT</p>
    {workoutBlocks.map((block, i) => (
      <div key={i} className="mb-2">
        <p className="text-[10px] font-bold text-[var(--text-secondary)] mb-1">{block.title}</p>
        {block.exercises.map((ex, j) => (
          <p key={j} className={`text-[11px] ${ex === currentExercise ? 'text-[var(--accent)] font-semibold' : 'text-[var(--text-tertiary)]'}`}>
            • {ex.exercise_name}
          </p>
        ))}
      </div>
    ))}
  </div>
)}
```

---

### **2. Fix PR Duplicate Bug**

**File**: components/SessionTracker.tsx lines 123-139

**Replace**:
```tsx
// Check for PR
if (shouldTrackPR(currentExercise.exercise_name)) {
  const prCheck = detectPR(...);

  if (prCheck.isPR) {
    // BUG: Shows every time for same weight
    // FIX: Only celebrate once per weight×reps combination
    const prKey = `${currentExercise.exercise_name}_${input.weight}_${input.reps}`;

    if (!celebratedPRs.has(prKey)) {
      setCelebratedPRs(prev => new Set(prev).add(prKey));
      haptic.heavy();
      setTimeout(() => {
        notify({
          type: 'success',
          message: `🏆 NEW PR! ${currentExercise.exercise_name} - ${input.weight} lbs × ${input.reps}`
        });
      }, 300);
    }
  }
}
```

---

### **3. Weight Persistence**

**Create**: services/exerciseHistoryService.ts

```tsx
import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export const saveExerciseHistory = async (
  userId: string,
  exerciseName: string,
  weight: number,
  reps: number
) => {
  const normalized = exerciseName.toLowerCase().replace(/\s+/g, '_');
  await setDoc(doc(db, `users/${userId}/exercise_history`, normalized), {
    exercise_name: exerciseName,
    last_weight: weight,
    last_reps: reps,
    last_logged: new Date().toISOString()
  });
};

export const getExerciseHistory = async (userId: string, exerciseName: string) => {
  const normalized = exerciseName.toLowerCase().replace(/\s+/g, '_');
  const docRef = doc(db, `users/${userId}/exercise_history`, normalized);
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
};
```

**Use in SessionTracker** (after logging set):
```tsx
// After line 119 (setLoggedData)
await saveExerciseHistory(
  auth.currentUser?.uid,
  currentExercise.exercise_name,
  Number(input.weight),
  Number(input.reps)
);
```

---

### **4. Auto-Adjust Plan** (Future/Optional)

**On PR, update plan**:
```tsx
if (prCheck.isPR) {
  // Celebrate
  // ...

  // Update plan (async, don't block workout)
  updatePlanWeights(
    activePlan,
    currentExercise.exercise_name,
    Number(input.weight)
  ).catch(console.error);
}
```

---

### **5. Related Exercise Adjustment** (Future/AI)

**Use Gemini to determine**:
```tsx
const related = await ai.findRelatedExercises(exerciseName);
// Suggest weight adjustments for related movements
```

---

## ✅ What's Already Done

- ✅ Compact mobile design
- ✅ BlockOverview (progress dots)
- ✅ "Coming Up" section
- ✅ Question marks on exercises
- ✅ Exercise explanation modal
- ✅ Instant workout start

---

## 🎯 Next Session Priority

1. Add exercise list view (CRITICAL)
2. Fix PR duplicate bug (CRITICAL)
3. Add weight persistence (IMPORTANT)
4. Test everything
5. Polish

**Estimated**: 2-3 hours

---

**Session Summary**: Mobile compact complete, workout overview improved, ready for final feature additions.

**Token usage**: 582K/1M - Ending session to preserve context for systematic execution.
