# Exercise Translation Script

Translates all 1,601 exercises from English to German using Gemini AI.

## Quick Start

```bash
# Ensure Convex is running
npx convex dev

# Run the translation script
npx tsx scripts/translateExercisesToGerman.ts
```

**Duration:** ~30-40 minutes
**Cost:** ~$0.30 (Gemini 2.0 Flash API)

## Features

- ✅ **Batch Processing:** Translates 20 exercises at a time
- ✅ **Smart Resume:** Skips exercises that already have German translations
- ✅ **Rate Limiting:** 2-second delay between batches to avoid API limits
- ✅ **Progress Tracking:** Real-time progress updates
- ✅ **Error Recovery:** Continues on errors, reports failures at end
- ✅ **Muscle Mappings:** Pre-defined German anatomical terms for common muscles

## Prerequisites

1. **Convex Running:**
   ```bash
   npx convex dev
   ```

2. **Environment Variables:** (in `.env.local`)
   ```env
   VITE_CONVEX_URL=https://your-project.convex.cloud
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Database Populated:**
   - Should have 1,601 exercises in `exerciseCache` table
   - Verify in Convex Dashboard → Data → exerciseCache

## What Gets Translated

For each exercise, the script translates:

1. **`explanation`** → **`explanation_de`**
   - Full exercise description
   - Purpose and benefits
   - Primary/secondary muscles

2. **`muscles_worked`** → **`muscles_worked_de`**
   - Array of muscle names
   - Uses anatomical German terms
   - Example: "Quadriceps" → "Quadrizeps"

3. **`form_cue`** → **`form_cue_de`**
   - Execution cues
   - Technique tips

4. **`common_mistake`** → **`common_mistake_de`**
   - Common errors
   - How to avoid them

## German Muscle Name Mappings

The script includes 60+ pre-defined muscle translations:

| English | German |
|---------|--------|
| Quadriceps | Quadrizeps |
| Glutes | Gesäßmuskeln |
| Hamstrings | Hamstrings |
| Lats | Latissimus |
| Core | Rumpf |
| Chest | Brust |
| Shoulders | Schultern |
| Triceps | Trizeps |
| Biceps | Bizeps |

See full mapping in the script.

## Translation Guidelines

The script instructs Gemini to:

- Use **"du"** (informal) for all instructions
- Maintain **anatomical accuracy**
- Use **proper German fitness terminology**
- Be **concise but clear**
- Preserve **technical meaning**

## Progress Output

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
```

## Final Summary

```
============================================================
📊 TRANSLATION COMPLETE
============================================================
✅ Successfully translated: 1,591
❌ Failed: 0
📈 Total: 1,601
🎯 Coverage: 100.00%

✨ Translation script completed!
```

## Verifying Results

**In Convex Dashboard:**
1. Go to dashboard.convex.dev
2. Navigate to Data → exerciseCache
3. Click any exercise
4. Check for German fields:
   - `explanation_de` ✓
   - `muscles_worked_de` ✓
   - `form_cue_de` ✓
   - `common_mistake_de` ✓

**In the App:**
1. Start dev server: `npm run dev`
2. Switch language to German (DE flag)
3. View any exercise explanation modal
4. Should display German text

## Troubleshooting

### Error: "VITE_CONVEX_URL not found"
**Fix:** Add to `.env.local`:
```env
VITE_CONVEX_URL=https://your-project.convex.cloud
```

### Error: "GEMINI_API_KEY not found"
**Fix:** Add to `.env.local`:
```env
GEMINI_API_KEY=your_api_key_here
```
Get key from: https://aistudio.google.com/app/apikey

### Error: "No exercises found"
**Fix:** Populate database first:
```bash
npx tsx scripts/populateExerciseDatabase.ts
```

### Rate Limit Errors
**Fix:** Increase delay between batches.

In `translateExercisesToGerman.ts`, change line:
```typescript
await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds
```
To:
```typescript
await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds
```

### Translation Quality Issues
**Fix:** The script uses temperature=0.3 for consistent translations.

If you need more creative translations:
```typescript
generationConfig: {
  temperature: 0.5, // More creative
}
```

If you need more literal translations:
```typescript
generationConfig: {
  temperature: 0.1, // More literal
}
```

## Re-running the Script

**Safe to re-run!** The script automatically:
- Checks for existing German translations
- Only processes exercises missing translations
- Shows count of already-translated exercises

```bash
npx tsx scripts/translateExercisesToGerman.ts
```

Output will show:
```
✅ Already translated: 1,601
🔄 Exercises needing translation: 0

🎉 All exercises are already translated!
```

## Cost Optimization

**Current: ~$0.30 for 1,601 exercises**

To reduce cost further:
1. Use `gemini-1.5-flash` (slightly cheaper)
2. Increase batch size to 30 (fewer API calls)
3. Process only missing translations (script does this automatically)

## API Model

**Current Model:** `gemini-2.0-flash-exp`

**Why this model?**
- **Fast:** 2-3 seconds per batch
- **Cheap:** $0.075/$0.30 per 1M tokens
- **Quality:** Great for translations
- **Free Tier:** 1,500 requests/day

**Alternative models:**
- `gemini-1.5-flash` - Slightly cheaper
- `gemini-1.5-pro` - Better quality, 10x more expensive
- `gemini-2.0-flash-thinking-exp` - Reasoning model (overkill)

## Next Steps After Translation

1. **Update UI Components:**
   - Modify `ExerciseExplanationModal.tsx`
   - Show German text when language is DE

2. **Test Language Switching:**
   - Switch between EN/DE
   - Verify exercise explanations update

3. **Deploy to Production:**
   ```bash
   npx convex deploy --prod
   npm run build
   vercel --prod
   ```

## Script Architecture

```
translateExercisesToGerman.ts
│
├── muscleTranslations (mapping table)
├── translateMuscles() (uses mapping)
├── translateBatch() (Gemini API call)
├── saveTranslation() (Convex mutation)
└── translateAllExercises() (main orchestrator)
    ├── Fetch all exercises
    ├── Filter needing translation
    ├── Split into batches of 20
    └── For each batch:
        ├── Translate with Gemini
        ├── Save to Convex
        ├── Track progress
        └── Wait 2 seconds
```

## Performance

**Metrics:**
- **Batch Size:** 20 exercises
- **Batch Duration:** ~3-5 seconds
- **API Delay:** 2 seconds between batches
- **Total Batches:** 80 (for 1,601 exercises)
- **Total Duration:** ~30-40 minutes
- **Total Cost:** ~$0.30

**Optimization Potential:**
- Increase batch size to 30 → 28 minutes
- Reduce delay to 1s → 20 minutes
- Parallel batches → 10 minutes (risky, may hit rate limits)

## Example Translation

**Input (English):**
```json
{
  "exercise_name": "barbell_back_squat",
  "explanation": "The Barbell Back Squat is a fundamental compound lower body exercise...",
  "muscles_worked": ["Quadriceps femoris", "Gluteus maximus", "Hamstrings"],
  "form_cue": "Maintain a braced core, keep your chest up...",
  "common_mistake": "Rounding the lower back..."
}
```

**Output (German):**
```json
{
  "exercise_name": "barbell_back_squat",
  "explanation_de": "Die Langhantel-Kniebeuge ist eine fundamentale zusammengesetzte Unterkörperübung...",
  "muscles_worked_de": ["Quadrizeps", "Großer Gesäßmuskel", "Hamstrings"],
  "form_cue_de": "Halte einen verspannten Rumpf, die Brust oben...",
  "common_mistake_de": "Rundrücken im unteren Rückenbereich..."
}
```

## Credits

**Script:** Claude Code (Anthropic)
**AI Model:** Gemini 2.0 Flash (Google)
**Database:** Convex
**Language:** TypeScript

---

**Ready to translate?**

```bash
npx tsx scripts/translateExercisesToGerman.ts
```

Good luck! 🇩🇪 🏋️
