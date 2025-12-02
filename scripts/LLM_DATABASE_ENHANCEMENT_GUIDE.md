# LLM Database Enhancement Guide for REBLD

**Purpose:** This guide instructs an LLM with Convex database access to complete the exercise database enhancement, German translations, injury profile population, and exercise relationship mapping.

---

## 1. CURRENT STATE & ACCESS

### Convex Project
- **Project URL:** `https://reminiscent-owl-650.convex.cloud`
- **Convex Dashboard:** Check via `npx convex dashboard`
- **Dev sync:** `npx convex dev --once`

### Key Tables to Modify
| Table | Purpose | Records |
|-------|---------|---------|
| `exerciseCache` | Global exercise database | ~166 exercises |
| `exerciseRelationships` | Exercise progressions/alternatives | Sparse |
| `injuryProtocols` | Injury-specific exercise guidance | Partial |

### How to Read Data
```typescript
// Use Convex MCP tools or create a query
// Example: Get all exercises
const exercises = await ctx.db.query("exerciseCache").collect();
```

### How to Update Data
```typescript
// Use the mutation: updateExerciseRoleAndTranslations
await ctx.mutation(api.mutations.updateExerciseRoleAndTranslations, {
  exerciseName: "barbell_back_squat",
  exercise_role: "core",
  display_name_de: "Kniebeugen mit Langhantel",
  explanation_de: "...",
  form_cue_de: "...",
  common_mistake_de: "...",
  muscles_worked_de: ["Quadrizeps", "Gesäßmuskulatur", "..."],
  default_metrics: { type: "sets_reps_weight", sets: 4, reps: 8 }
});
```

---

## 2. TASK 1: GERMAN TRANSLATIONS

### What Needs Translation
For EVERY exercise in `exerciseCache`, populate:
- `display_name_de` - German name (e.g., "Bankdrücken" for "Bench Press")
- `explanation_de` - Full German explanation
- `form_cue_de` - German form cue
- `common_mistake_de` - German common mistake
- `muscles_worked_de` - German muscle names array

### Anatomical Terms Dictionary
Use these exact translations for muscles:
```
quadriceps → Quadrizeps
hamstrings → Hintere Oberschenkelmuskulatur / Beinbeuger
glutes / gluteus maximus → Gesäßmuskulatur / Großer Gesäßmuskel
gluteus medius → Mittlerer Gesäßmuskel
calves / gastrocnemius → Wadenmuskulatur
latissimus dorsi → Latissimus dorsi / Breiter Rückenmuskel
trapezius → Trapezmuskel
rhomboids → Rautenmuskeln
erector spinae → Rückenstrecker
pectoralis major → Großer Brustmuskel
pectoralis minor → Kleiner Brustmuskel
deltoids → Deltamuskeln / Schultermuskulatur
  - anterior deltoid → Vorderer Deltamuskel
  - lateral deltoid → Seitlicher Deltamuskel
  - posterior deltoid → Hinterer Deltamuskel
biceps brachii → Bizeps
triceps brachii → Trizeps
forearms → Unterarmmuskulatur
core → Rumpfmuskulatur
rectus abdominis → Gerader Bauchmuskel
obliques → Schräge Bauchmuskeln
transverse abdominis → Querer Bauchmuskel
hip flexors → Hüftbeuger
adductors → Adduktoren
abductors → Abduktoren
rotator cuff → Rotatorenmanschette
serratus anterior → Vorderer Sägemuskel
```

### Example Translation
**English:**
```json
{
  "exercise_name": "barbell_back_squat",
  "explanation": "The back squat is a fundamental compound movement...",
  "form_cue": "Drive through whole foot, chest up, knees track over toes",
  "common_mistake": "Forward knee drift increases patellofemoral stress",
  "muscles_worked": ["quadriceps", "glutes", "hamstrings", "core"]
}
```

**German Translation:**
```json
{
  "display_name_de": "Kniebeugen mit Langhantel",
  "explanation_de": "Die Kniebeuge ist eine grundlegende Verbundübung, die die größten Muskelgruppen des Unterkörpers beansprucht. Sie entwickelt Beinkraft, Hüftmobilität und Rumpfstabilität. Der Bewegungsablauf beginnt mit einer kontrollierten Abwärtsbewegung durch Beugung von Hüfte und Knien, gefolgt von einer kraftvollen Aufwärtsbewegung.",
  "form_cue_de": "Durch den ganzen Fuß drücken, Brust raus, Knie folgen den Zehenspitzen",
  "common_mistake_de": "Nach vorne wandernde Knie erhöhen die Belastung der Kniescheibe erheblich",
  "muscles_worked_de": ["Quadrizeps", "Gesäßmuskulatur", "Beinbeuger", "Rumpfmuskulatur"]
}
```

### Process
1. Query ALL exercises: `await ctx.db.query("exerciseCache").collect()`
2. For each exercise WITHOUT `explanation_de`:
   - Translate `explanation` to German (professional, anatomically correct)
   - Translate `form_cue` to German
   - Translate `common_mistake` to German
   - Map `muscles_worked` array to German using dictionary above
   - Create `display_name_de` (industry-standard German name)
3. Update using `updateExerciseRoleAndTranslations` mutation

---

## 3. TASK 2: EXERCISE ROLE CLASSIFICATION

### Role Definitions
Every exercise needs `exercise_role` assigned:

| Role | Definition | Examples |
|------|------------|----------|
| `core` | Fundamental compound movements that form program foundation. Multi-joint, high neural demand. | Squat, Bench Press, Deadlift, Row, Overhead Press, Pull-up, Hip Thrust |
| `accessory` | Support lifts that address weak points and assist core movements. | DB Fly, Leg Curl, Lat Pulldown, Face Pull, Tricep Extension, Leg Press |
| `complementary` | Sport-specific or goal-specific movements not in standard strength training. | Sled Push, Farmer Carry, Box Jump, Medicine Ball Throw, Kettlebell Swing |
| `isolation` | Single-joint movements targeting one muscle. Finishers. | Bicep Curl, Lateral Raise, Calf Raise, Wrist Curl, Shrug |
| `cardio` | Cardiovascular/conditioning exercises. | Long Run, Tempo Run, Rowing, Cycling, SkiErg |
| `mobility` | Movement preparation, stretching, recovery work. | Cat-Cow, Hip 90/90, World's Greatest Stretch, Foam Rolling |

### Classification Rules
1. **S-Tier + Multi-joint compound = `core`**
2. **A-Tier + supports a core lift = `accessory`**
3. **Sport-specific (Hyrox stations, Olympic lifts) = `complementary`**
4. **Single muscle isolation = `isolation`**
5. **Movement pattern = cardio = `cardio`**
6. **Movement pattern = mobility OR category = warmup/cooldown = `mobility`**

### Process
1. Query all exercises
2. For each exercise, determine role based on:
   - `movement_pattern` field
   - `exercise_tier` field
   - `primary_category` field
   - Exercise name analysis
3. Update with `updateExerciseRoleAndTranslations({ exerciseName, exercise_role })`

---

## 4. TASK 3: INJURY CONTRAINDICATIONS

### Current Schema for Injury Data
Each exercise can have `injury_contraindications` array:
```typescript
injury_contraindications: v.optional(v.array(v.object({
  injury_type: v.string(),        // "knee_pain", "lower_back", "shoulder_impingement"
  severity: v.union(
    v.literal("absolute"),        // NEVER do this exercise
    v.literal("caution"),         // Can do with modifications
    v.literal("monitor")          // OK but watch for issues
  ),
  reason: v.string(),             // Why this exercise is problematic
  safe_modifications: v.array(v.string()),     // How to modify safely
  alternative_exercises: v.array(v.string()),  // What to do instead
}))),
```

### Common Injury Types to Map
```
knee_pain / knee_injury
lower_back_pain / lumbar_dysfunction
shoulder_impingement / shoulder_pain
rotator_cuff_injury
wrist_injury
hip_impingement
ankle_instability
neck_pain / cervical_issues
elbow_tendonitis / tennis_elbow
disc_herniation
sciatica
IT_band_syndrome
shin_splints
plantar_fasciitis
```

### Example Injury Mapping
```json
{
  "exercise_name": "barbell_back_squat",
  "injury_contraindications": [
    {
      "injury_type": "knee_pain",
      "severity": "caution",
      "reason": "Deep flexion increases patellofemoral joint stress. Full depth may aggravate existing knee issues.",
      "safe_modifications": [
        "Limit depth to parallel or above",
        "Use box squat to control depth",
        "Widen stance to reduce knee travel",
        "Focus on sitting back rather than down"
      ],
      "alternative_exercises": [
        "leg_press",
        "hip_thrust",
        "romanian_deadlift",
        "step_ups_low_box"
      ]
    },
    {
      "injury_type": "lower_back_pain",
      "severity": "caution",
      "reason": "Spinal loading with flexion moment. Requires strong bracing and neutral spine.",
      "safe_modifications": [
        "Use safety squat bar to reduce forward lean",
        "Front squat variation reduces spinal load",
        "Belt squat eliminates axial loading",
        "Reduce load and focus on perfect bracing"
      ],
      "alternative_exercises": [
        "belt_squat",
        "leg_press",
        "goblet_squat_light",
        "split_squat"
      ]
    }
  ]
}
```

### Process for Each Exercise
1. Analyze the movement pattern and joints involved
2. Identify which injuries would contraindicate or require caution
3. For each relevant injury:
   - Determine severity (absolute/caution/monitor)
   - Write medical/biomechanical reason
   - List 2-4 safe modifications
   - List 3-5 alternative exercises that DON'T stress the same area
4. Update exercise record

### Injury → Body Part → Exercises to Avoid/Modify
| Injury | Primary Stress | Exercises to Flag |
|--------|---------------|-------------------|
| knee_pain | Flexion under load, shear forces | Squats, Lunges, Leg Extensions, Jump exercises |
| lower_back_pain | Spinal flexion/extension under load | Deadlifts, Good Mornings, Bent Rows, Sit-ups |
| shoulder_impingement | Overhead, behind-neck, internal rotation | Overhead Press, Upright Row, Behind-neck Press, Dips |
| rotator_cuff | Overhead, external rotation under load | Overhead Press, Bench Press (wide), Lateral Raise |
| wrist_injury | Wrist extension under load | Front Squat (clean grip), Push-ups, Bench Press |
| hip_impingement | Deep hip flexion, internal rotation | Deep Squats, Sumo Deadlift, Frog Stretch |
| ankle_instability | Single-leg balance, jumping | Lunges, Bulgarian Split Squat, Box Jumps |

---

## 5. TASK 4: EXERCISE RELATIONSHIPS

### Current Schema
```typescript
exerciseRelationships: defineTable({
  primary_exercise: v.string(),      // Normalized exercise name
  related_exercise: v.string(),      // Normalized exercise name
  relationship_type: v.union(
    v.literal("progression"),        // related is harder version
    v.literal("regression"),         // related is easier version
    v.literal("alternative"),        // same difficulty, different focus
    v.literal("compound_to_isolation"), // compound → isolation breakdown
    v.literal("similar_pattern"),    // same movement pattern
    v.literal("antagonist")          // opposite muscle groups
  ),
  strength_difference: v.union(v.number(), v.null()), // -50 to +50
  similarity_score: v.number(),      // 0-100
  notes: v.union(v.string(), v.null()),
})
```

### Key Relationships to Create

**Progressions (easier → harder):**
```
push_up → diamond_push_up → archer_push_up → one_arm_push_up
goblet_squat → front_squat → back_squat → pause_squat
lat_pulldown → assisted_pull_up → pull_up → weighted_pull_up
romanian_deadlift → conventional_deadlift → deficit_deadlift
hip_thrust → single_leg_hip_thrust → barbell_hip_thrust_elevated
plank → plank_with_weight → ab_wheel_rollout
```

**Alternatives (same goal, different execution):**
```
barbell_bench_press ↔ dumbbell_bench_press ↔ machine_chest_press
barbell_row ↔ cable_row ↔ dumbbell_row ↔ machine_row
back_squat ↔ front_squat ↔ leg_press ↔ hack_squat
conventional_deadlift ↔ sumo_deadlift ↔ trap_bar_deadlift
pull_up ↔ lat_pulldown ↔ cable_pullover
```

**Antagonists (opposite muscle groups):**
```
bench_press ↔ barbell_row
overhead_press ↔ pull_up
leg_curl ↔ leg_extension
bicep_curl ↔ tricep_extension
hip_flexor_work ↔ glute_bridge
```

**Compound to Isolation:**
```
bench_press → pec_fly, tricep_pushdown, front_raise
squat → leg_extension, leg_curl, calf_raise
deadlift → back_extension, leg_curl, grip_work
row → bicep_curl, rear_delt_fly, face_pull
```

### Process
1. For each core exercise, create relationship entries:
   - 2-3 progressions
   - 2-3 regressions
   - 3-4 alternatives
   - Relevant antagonists
   - Compound-to-isolation breakdown
2. Use mutation: `ctx.db.insert("exerciseRelationships", {...})`

---

## 6. TASK 5: DEFAULT METRICS

### Assign `default_metrics` to Every Exercise

**For Strength Exercises:**
```json
{
  "type": "sets_reps_weight",
  "sets": 3,
  "reps": 10
}
```

**For Cardio - Duration Based:**
```json
{
  "type": "duration_only",
  "duration_minutes": 30
}
```

**For Cardio - Distance Based:**
```json
{
  "type": "distance_time",
  "distance_km": 5
}
```

**For Interval Cardio:**
```json
{
  "type": "sets_distance_rest",
  "sets": 8,
  "distance_m": 400,
  "rest_s": 90
}
```

**For Timed Holds (Planks, etc.):**
```json
{
  "type": "sets_duration",
  "sets": 3,
  "duration_minutes": 1
}
```

### Default Sets/Reps by Exercise Type
| Exercise Type | Default Sets | Default Reps |
|--------------|--------------|--------------|
| Core compound (Squat, Bench, DL) | 4 | 6-8 |
| Accessory compound | 3 | 8-10 |
| Isolation | 3 | 12-15 |
| Power (Olympic lifts) | 5 | 3 |
| Mobility/Warmup | 2 | 10 |

---

## 7. TASK 6: DATABASE CLEANUP & NAMING

### Tables to Review
| Table | Issue | Action |
|-------|-------|--------|
| `exerciseCache` | Missing role, translations, injury data | Populate all fields |
| `exerciseRelationships` | Sparse data | Create comprehensive relationship map |
| `injuryProtocols` | Generic, not exercise-specific | Keep as general protocols |
| `sportGuidelines` | May need cardio exercise references | Add cardio exercise names |

### Field Consistency Checks
1. All `exercise_name` fields should be `lowercase_with_underscores`
2. All dates should be ISO format: `new Date().toISOString()`
3. All arrays should be initialized (not null) where schema expects array
4. `muscles_worked` should use consistent muscle names (see dictionary above)

### Potential Schema Improvements (Document but don't implement)
- Consider adding `video_url` field to `exerciseCache`
- Consider adding `difficulty_score` (1-10) to `exerciseCache`
- Consider adding `equipment_alternatives` to allow gym/home variations
- Consider adding `tempo_recommendation` for hypertrophy exercises

---

## 8. EXECUTION ORDER

### Phase 1: Foundation (Do First)
1. Query all exercises from `exerciseCache`
2. Assign `exercise_role` to each exercise
3. Assign `default_metrics` to each exercise

### Phase 2: Translations
4. Translate all exercises to German (display_name_de, explanation_de, etc.)
5. Translate muscles_worked to German

### Phase 3: Injury Safety
6. Add `injury_contraindications` to each exercise
7. Ensure alternative_exercises reference valid exercise names

### Phase 4: Relationships
8. Create `exerciseRelationships` entries for all core exercises
9. Create progressions/regressions chains
10. Create alternative exercise mappings

### Phase 5: Validation
11. Query all exercises and verify no null required fields
12. Verify all referenced exercises in relationships exist
13. Verify all alternative exercises in injury data exist

---

## 9. MUTATIONS AVAILABLE

### Primary Mutation for Updates
```typescript
// convex/mutations.ts - updateExerciseRoleAndTranslations
api.mutations.updateExerciseRoleAndTranslations({
  exerciseName: string,
  exercise_role?: "core" | "accessory" | "complementary" | "isolation" | "cardio" | "mobility",
  display_name_de?: string,
  explanation_de?: string,
  form_cue_de?: string,
  common_mistake_de?: string,
  muscles_worked_de?: string[],
  default_metrics?: {
    type: "sets_reps_weight" | "duration_only" | "distance_time" | "sets_distance_rest" | "sets_duration",
    sets?: number,
    reps?: number,
    duration_minutes?: number,
    distance_m?: number,
    distance_km?: number,
    rest_s?: number,
  }
})
```

### For Injury Data (Need to create or use patch)
```typescript
// May need direct db.patch for injury_contraindications
await ctx.db.patch(exerciseId, {
  injury_contraindications: [...]
});
```

### For Relationships
```typescript
// Insert new relationship
await ctx.db.insert("exerciseRelationships", {
  primary_exercise: "barbell_back_squat",
  related_exercise: "front_squat",
  relationship_type: "alternative",
  strength_difference: 0,
  similarity_score: 85,
  notes: "Front squat emphasizes quads more, reduces spinal load"
});
```

---

## 10. VALIDATION CHECKLIST

After completing all tasks, verify:

- [ ] All ~166 exercises have `exercise_role` assigned
- [ ] All exercises have `display_name_de`
- [ ] All exercises have `explanation_de`
- [ ] All exercises have `default_metrics`
- [ ] All S/A tier exercises have `injury_contraindications`
- [ ] All core exercises have at least 3 relationships each
- [ ] All `alternative_exercises` in injury data are valid exercise names
- [ ] All German muscle names use consistent terminology
- [ ] No exercises have null/empty required fields

---

## 11. SAMPLE BATCH SCRIPT STRUCTURE

```typescript
// scripts/enhanceAllExercises.ts
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

async function enhanceDatabase() {
  const convex = new ConvexHttpClient("https://reminiscent-owl-650.convex.cloud");

  // 1. Get all exercises
  const exercises = await convex.query(api.queries.getAllExercises);

  // 2. Process each exercise
  for (const exercise of exercises) {
    // Determine role
    const role = classifyRole(exercise);

    // Generate German translation
    const germanData = await translateToGerman(exercise);

    // Determine injury contraindications
    const injuries = analyzeInjuryRisks(exercise);

    // Determine default metrics
    const metrics = getDefaultMetrics(exercise);

    // Update
    await convex.mutation(api.mutations.updateExerciseRoleAndTranslations, {
      exerciseName: exercise.exercise_name,
      exercise_role: role,
      ...germanData,
      default_metrics: metrics,
    });

    // Update injury data (separate patch)
    await convex.mutation(api.mutations.updateExerciseInjuryData, {
      exerciseName: exercise.exercise_name,
      injury_contraindications: injuries,
    });
  }

  // 3. Create relationships
  await createExerciseRelationships(convex);
}
```

---

**END OF GUIDE**

This document contains everything needed to complete the REBLD exercise database enhancement. The LLM should have Convex access and should process exercises in batches to avoid rate limits.
