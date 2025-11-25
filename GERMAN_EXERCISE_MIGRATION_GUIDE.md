# German Exercise Migration Guide

**Purpose:** Generate German translations for all 1,601 exercises in the database
**Status:** ✅ New optimized script ready (`translateExercisesToGerman.ts`)
**Time:** ~30-40 minutes
**Cost:** ~$0.20-0.30 (Gemini 2.0 Flash)

---

## Current Status

### ✅ Completed
- German UI is 100% translated (all components)
- Convex schema updated with German fields (`explanation_de`, `muscles_worked_de`, `form_cue_de`, `common_mistake_de`)
- geminiService.ts modified to accept language parameter
- Convex mutation `updateExerciseWithGerman` created
- ✨ **NEW:** Optimized batch translation script: `scripts/translateExercisesToGerman.ts`
  - Processes 20 exercises per batch
  - Uses Gemini 2.0 Flash (faster, cheaper)
  - Includes muscle name translation mappings
  - Automatic rate limiting (2s between batches)
  - Progress tracking and error recovery

### ⏳ Remaining
- Run migration to generate German exercise explanations (1,591 remaining)
- Test German exercise explanations in app

---

## Prerequisites

**Before running the migration:**

1. **Convex must be running:**
   ```bash
   npx convex dev
   ```

2. **Environment variables must be set in `.env.local`:**
   ```
   VITE_CONVEX_URL=https://your-project.convex.cloud
   GEMINI_API_KEY=your_gemini_api_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Convex schema must be deployed:**
   ```bash
   npx convex deploy
   ```
   This deploys the schema changes (German exercise fields).

4. **Exercise database must be populated:**
   - You should have 700+ exercises in the `exerciseCache` table
   - Verify: Check Convex dashboard → Data → exerciseCache

---

## Known Issue with Migration Script

**Problem:** The `getAllExercises` query returns a paginated result:
```typescript
{
  page: Exercise[],
  continueCursor: string | null
}
```

But the script tries to use it as a direct array.

**Fix Needed in `scripts/generateGermanExerciseExplanations.ts`:**

Line 115-116 currently:
```typescript
const result = await client.query(api.queries.getAllExercises, { limit: 1000 });
const exercises = result.page;
```

**Issue:** `result.page` might be undefined if database is empty or query fails.

**Better fix:**
```typescript
const result = await client.query(api.queries.getAllExercises, { limit: 1000 });

if (!result || !result.page) {
  console.error('No exercises found in database');
  console.error('Make sure exercise database is populated first');
  process.exit(1);
}

const exercises = result.page;
```

---

## Alternative: Fetch All Exercises Without Pagination

**Create a new query in `convex/queries.ts`:**

```typescript
// Add this to convex/queries.ts
export const getAllExercisesNoPagination = query({
  args: {},
  handler: async (ctx) => {
    const exercises = await ctx.db.query("exerciseCache").collect();
    return exercises;
  },
});
```

**Then update the migration script line 115:**
```typescript
// Old:
const result = await client.query(api.queries.getAllExercises, { limit: 1000 });
const exercises = result.page;

// New:
const exercises = await client.query(api.queries.getAllExercisesNoPagination, {});
```

---

## Running the Migration

### Using the New Optimized Script

**Script Location:** `/scripts/translateExercisesToGerman.ts`

**Features:**
- ✅ Batch processing (20 exercises at a time)
- ✅ Built-in muscle name translations
- ✅ Automatic rate limiting
- ✅ Progress tracking
- ✅ Error recovery
- ✅ Uses Gemini 2.0 Flash (cheaper, faster)

### Step 1: Run the Migration

```bash
npx tsx scripts/translateExercisesToGerman.ts
```

**Expected output:**
```
🚀 Starting German translation of all exercises...

📥 Fetching exercises from Convex...
📊 Total exercises: 1,601
🔄 Exercises needing translation: 1,591
✅ Already translated: 10

📦 Processing 80 batches of 20 exercises

🔄 Batch 1/80 (20 exercises)
✅ Saved: dynamic_warm-up
✅ Saved: safety_bar_squat
✅ Saved: barbell_back_squat
... (17 more)
📊 Progress: 20/1,591 (1.3%)
⏳ Waiting 2 seconds before next batch...

🔄 Batch 2/80 (20 exercises)
✅ Saved: deadlift
✅ Saved: pull_up
... (18 more)
📊 Progress: 40/1,591 (2.5%)
⏳ Waiting 2 seconds before next batch...

[... continues for ~30-40 minutes ...]

============================================================
📊 TRANSLATION COMPLETE
============================================================
✅ Successfully translated: 1,591
❌ Failed: 0
📈 Total: 1,601
🎯 Coverage: 100.00%

✨ Translation script completed!
```

**Duration:** ~30-40 minutes (2 seconds between batches × 80 batches)
**Cost:** ~$0.20-0.30

### Step 2: Verify Translations

**Check in Convex Dashboard:**
1. Go to dashboard.convex.dev
2. Data → exerciseCache
3. Click any exercise
4. Verify German fields populated:
   - `explanation_de`
   - `muscles_worked_de`
   - `form_cue_de`
   - `common_mistake_de`

**Example verified exercise:**
```json
{
  "exercise_name": "barbell_back_squat",
  "explanation_de": "Die Langhantel-Kniebeuge ist eine fundamentale...",
  "muscles_worked_de": ["Quadrizeps", "Großer Gesäßmuskel", ...],
  "form_cue_de": "Halte einen verspannten Rumpf...",
  "common_mistake_de": "Rundrücken..."
}
```

---

## Troubleshooting

### Error: "No exercises found"

**Cause:** Exercise database is empty or query failed

**Fix:**
1. Check Convex dashboard → Data → exerciseCache (should have 700+ entries)
2. If empty, populate first:
   ```bash
   npx tsx scripts/populateExerciseDatabase.ts
   ```

### Error: "VITE_CONVEX_URL not set"

**Cause:** Environment variable missing

**Fix:**
1. Check `.env.local` file exists in project root
2. Add: `VITE_CONVEX_URL=https://your-project.convex.cloud`
3. Get URL from Convex dashboard or `npx convex dev` output

### Error: "GEMINI_API_KEY not set"

**Cause:** API key missing

**Fix:**
1. Get API key from https://aistudio.google.com/app/apikey
2. Add to `.env.local`: `GEMINI_API_KEY=your_key`

### Error: "exercises.slice is not a function"

**Cause:** Query returns undefined or wrong format

**Fix:** Use the alternative approach above (create `getAllExercisesNoPagination` query)

### Error: Rate limit exceeded

**Cause:** Gemini API rate limit (60 requests/minute)

**Fix:** Script already has 1.2s delay per exercise (50 requests/minute). If you still hit limits:
1. Increase delay in line 97: `await delay(2000);` (30 requests/minute)
2. Or run in smaller batches with `--limit=100`

---

## Verifying Success

### 1. Check Database

**Convex Dashboard:**
1. Go to dashboard.convex.dev
2. Click your project
3. Go to Data → exerciseCache
4. Click any exercise
5. Verify fields exist:
   - `explanation_de` (German explanation)
   - `muscles_worked_de` (German muscle names)
   - `form_cue_de` (German form cue)
   - `common_mistake_de` (German mistake warning)

### 2. Test in App

**Start the app:**
```bash
npm run dev
```

**Switch to German:**
1. Click language switcher (DE flag)
2. Navigate to any workout
3. Click exercise name to see explanation modal
4. Should display German text

**If it works:** ✅ Migration successful!

### 3. Check Coverage

**Run this query in Convex dashboard Data tab:**
```
exerciseCache.filter(e => e.explanation_de != null).length
```

**Expected:** Should match total exercise count (~700+)

---

## Alternative: Manual Testing

If the script doesn't work, you can test the German generation manually:

### Test Single Exercise

**In Convex dashboard → Functions tab:**

1. Select `mutations.updateExerciseWithGerman`
2. Enter args:
   ```json
   {
     "exerciseName": "romanian_deadlift",
     "explanation_de": "Test German explanation",
     "muscles_worked_de": ["Hamstrings", "Gesäßmuskel"],
     "form_cue_de": "Test cue in German",
     "common_mistake_de": "Test mistake in German"
   }
   ```
3. Run mutation
4. Check if exercise updated

**If this works:** Migration script just needs query fix

---

## Cost Breakdown

**Using Gemini 2.0 Flash (gemini-2.0-flash-exp):**

**Per Batch (20 exercises):**
- Input tokens: ~2,000 (exercise data + prompt)
- Output tokens: ~4,000 (German translations)
- Total per batch: ~6,000 tokens
- Cost per batch: ~$0.003

**Full Database (1,601 exercises = 80 batches):**
- Total tokens: ~480,000
- Input cost: $0.06 (160k × $0.075/1M)
- Output cost: $0.24 (320k × $0.30/1M)
- **Total: ~$0.30**

**Very affordable!** Less than the cost of a coffee ☕

---

## Expected Results

After successful migration:

**Before:**
```json
{
  "exercise_name": "romanian_deadlift",
  "explanation": "Romanian Deadlift is a hip hinge movement...",
  "form_cue": "Hinge at hips, keep soft knees",
  "common_mistake": "Rounding lower back"
}
```

**After:**
```json
{
  "exercise_name": "romanian_deadlift",
  "explanation": "Romanian Deadlift is a hip hinge movement...",
  "explanation_de": "Rumänisches Kreuzheben ist eine Hüftbeugebewegung...",
  "form_cue": "Hinge at hips, keep soft knees",
  "form_cue_de": "An den Hüften beugen, Knie leicht gebeugt halten",
  "common_mistake": "Rounding lower back",
  "common_mistake_de": "Abrunden des unteren Rückens"
}
```

---

## Next Steps After Migration

### 1. Update ExerciseExplanationModal

**File:** `components/ExerciseExplanationModal.tsx`

**Add language detection:**
```typescript
import { useTranslation } from 'react-i18next';

export default function ExerciseExplanationModal({ exercise }) {
  const { i18n } = useTranslation();
  const isGerman = i18n.language === 'de';

  const explanation = isGerman && exercise.explanation_de
    ? exercise.explanation_de
    : exercise.explanation;

  const formCue = isGerman && exercise.form_cue_de
    ? exercise.form_cue_de
    : exercise.form_cue;

  // ... etc for muscles_worked and common_mistake

  return (
    <div>
      <p>{explanation}</p>
      <p>{formCue}</p>
      {/* ... */}
    </div>
  );
}
```

### 2. Test Language Switching

1. Start app
2. Click German flag
3. View exercise explanation
4. Should show German text
5. Switch to English
6. Should show English text

### 3. Deploy to Production

```bash
# Deploy updated Convex schema & mutations
npx convex deploy --prod

# Build frontend
npm run build

# Deploy to Vercel/Netlify
vercel --prod
```

---

## Fallback: Launch Without German Exercises

**If migration is problematic:**

**Option:** Launch with 100% German UI, English exercise explanations

**Reasoning:**
- German UI is perfect (100% translated)
- English exercise explanations are acceptable
- Most fitness terms are international (Romanian Deadlift, etc.)
- Can add German exercises post-launch if users request

**To do this:**
1. Skip migration entirely
2. Deploy app as-is
3. Monitor user feedback
4. Add German exercises in v1.1 if needed

---

## Summary for LLM

**Task:** Generate German translations for all exercises in database

**What's Done:**
- Schema has German fields
- Service supports German language parameter
- Mutation exists to update exercises
- Migration script created

**What's Needed:**
1. Fix query in migration script (handle pagination/undefined)
2. Run script with `--limit=10` first (test)
3. Run full migration
4. Update ExerciseExplanationModal to show German text
5. Test language switching

**Estimated Time:** 1-2 hours
**Priority:** Medium (nice-to-have, not blocking launch)

**Alternative:** Skip this entirely and launch with English exercise explanations. German UI is 100% complete and that's what matters most.

---

**Last Updated:** November 24, 2025
**Status:** Ready for handoff
**Next Session:** Run migration or decide to skip it
