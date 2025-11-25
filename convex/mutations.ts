import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Ensure user exists - creates user if doesn't exist (called on sign-in)
export const ensureUserExists = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      const newUserId = await ctx.db.insert("users", {
        userId: args.userId,
        activePlanId: null,
        lastProgressionApplied: null,
        bodyMetrics: null,
        goals: null,
        trainingPreferences: null,
      });
      const newUser = await ctx.db.get(newUserId);
      return newUser;
    }

    return user;
  },
});

// Upsert sex-specific guideline
export const upsertSexSpecificGuideline = mutation({
  args: {
    sex: v.union(v.literal("male"), v.literal("female"), v.literal("other"), v.literal("neutral")),
    goal: v.optional(v.union(v.string(), v.null())),
    experience: v.optional(v.union(v.string(), v.null())),
    guidelines: v.array(v.string()),
    recommended_exercises: v.optional(v.array(v.string())),
    contraindications: v.optional(v.array(v.string())),
    evidence_level: v.optional(v.union(v.literal("high"), v.literal("moderate"), v.literal("low"), v.null())),
    source: v.optional(v.string()),
    last_reviewed: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const goalValue = args.goal ?? null;
    const experienceValue = args.experience ?? null;
    
    // Find existing record by unique key (sex, goal, experience)
    const candidates = await ctx.db
      .query("sexSpecificGuidelines")
      .withIndex("by_sex_goal_exp", (q) => q.eq("sex", args.sex))
      .collect();
    
    const existing = candidates.find(
      (r) => 
        (r.goal === goalValue || (r.goal === null && goalValue === null)) &&
        (r.experience === experienceValue || (r.experience === null && experienceValue === null))
    );

    const data = {
      sex: args.sex,
      goal: goalValue,
      experience: experienceValue,
      guidelines: args.guidelines,
      recommended_exercises: args.recommended_exercises || [],
      contraindications: args.contraindications || [],
      evidence_level: args.evidence_level || null,
      source: args.source || null,
      last_reviewed: args.last_reviewed || new Date().toISOString(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("sexSpecificGuidelines", data);
    }
  },
});

// Upsert sport guideline
export const upsertSportGuideline = mutation({
  args: {
    sport: v.string(),
    goal: v.optional(v.union(v.string(), v.null())),
    experience: v.optional(v.union(v.string(), v.null())),
    movement_priorities: v.array(v.string()),
    top_exercises: v.array(v.string()),
    conditioning_notes: v.optional(v.array(v.string())),
    contraindications: v.optional(v.array(v.string())),
    evidence_level: v.optional(v.union(v.literal("high"), v.literal("moderate"), v.literal("low"), v.null())),
    source: v.optional(v.string()),
    last_reviewed: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const goalValue = args.goal ?? null;
    const experienceValue = args.experience ?? null;
    
    // Find existing record by unique key (sport, goal, experience)
    const candidates = await ctx.db
      .query("sportGuidelines")
      .withIndex("by_sport_goal_exp", (q) => q.eq("sport", args.sport))
      .collect();
    
    const existing = candidates.find(
      (r) => 
        (r.goal === goalValue || (r.goal === null && goalValue === null)) &&
        (r.experience === experienceValue || (r.experience === null && experienceValue === null))
    );

    const data = {
      sport: args.sport,
      goal: goalValue,
      experience: experienceValue,
      movement_priorities: args.movement_priorities,
      top_exercises: args.top_exercises,
      conditioning_notes: args.conditioning_notes || [],
      contraindications: args.contraindications || [],
      evidence_level: args.evidence_level || null,
      source: args.source || null,
      last_reviewed: args.last_reviewed || new Date().toISOString(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("sportGuidelines", data);
    }
  },
});

// Upsert body-context guideline
export const upsertBodyContextGuideline = mutation({
  args: {
    band: v.string(),
    athletic_level: v.optional(v.union(v.literal("low"), v.literal("moderate"), v.literal("high"), v.null())),
    body_type: v.optional(v.union(v.literal("lean"), v.literal("average"), v.literal("muscular"), v.null())),
    guidelines: v.array(v.string()),
    recommended_modalities: v.optional(v.array(v.string())),
    avoid: v.optional(v.array(v.string())),
    evidence_level: v.optional(v.union(v.literal("high"), v.literal("moderate"), v.literal("low"), v.null())),
    source: v.optional(v.string()),
    last_reviewed: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const athleticLevelValue = args.athletic_level ?? null;
    const bodyTypeValue = args.body_type ?? null;
    
    // Find existing record by unique key (band, athletic_level, body_type)
    const candidates = await ctx.db
      .query("bodyContextGuidelines")
      .withIndex("by_band_level_type", (q) => q.eq("band", args.band))
      .collect();
    
    const existing = candidates.find(
      (r) => 
        (r.athletic_level === athleticLevelValue || (r.athletic_level === null && athleticLevelValue === null)) &&
        (r.body_type === bodyTypeValue || (r.body_type === null && bodyTypeValue === null))
    );

    const data = {
      band: args.band,
      athletic_level: athleticLevelValue,
      body_type: bodyTypeValue,
      guidelines: args.guidelines,
      recommended_modalities: args.recommended_modalities || [],
      avoid: args.avoid || [],
      evidence_level: args.evidence_level || null,
      source: args.source || null,
      last_reviewed: args.last_reviewed || new Date().toISOString(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("bodyContextGuidelines", data);
    }
  },
});

// Update user profile
export const updateUserProfile = mutation({
  args: {
    userId: v.string(),
    activePlanId: v.optional(v.union(v.id("workoutPlans"), v.null())),
    lastProgressionApplied: v.optional(v.union(v.string(), v.null())),
    bodyMetrics: v.optional(v.any()),
    goals: v.optional(v.array(v.any())),
    trainingPreferences: v.optional(v.any()),
    injuryProfile: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updates: any = {};
    if (args.activePlanId !== undefined) {
      updates.activePlanId = args.activePlanId;
    }
    if (args.lastProgressionApplied !== undefined) {
      updates.lastProgressionApplied = args.lastProgressionApplied;
    }
    if (args.bodyMetrics !== undefined) {
      updates.bodyMetrics = args.bodyMetrics;
    }
    if (args.goals !== undefined) {
      updates.goals = args.goals;
    }
    if (args.trainingPreferences !== undefined) {
      updates.trainingPreferences = args.trainingPreferences;
    }
    if (args.injuryProfile !== undefined) {
      updates.injuryProfile = args.injuryProfile;
    }

    await ctx.db.patch(user._id, updates);
  },
});

// Update injury profile (dedicated mutation for better structure)
export const updateInjuryProfile = mutation({
  args: {
    userId: v.string(),
    injuryProfile: v.object({
      current_injuries: v.array(v.object({
        injury_type: v.string(),
        severity: v.union(v.literal("mild"), v.literal("moderate"), v.literal("severe")),
        affected_area: v.string(),
        date_reported: v.string(),
        notes: v.union(v.string(), v.null()),
      })),
      injury_history: v.array(v.object({
        injury_type: v.string(),
        date_occurred: v.string(),
        date_recovered: v.union(v.string(), v.null()),
        recurring: v.boolean(),
      })),
      movement_restrictions: v.array(v.string()),
      pain_triggers: v.array(v.string()),
      last_updated: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      injuryProfile: args.injuryProfile,
    });
  },
});

// Create a new workout plan
export const createWorkoutPlan = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    weeklyPlan: v.array(v.any()),
    dailyRoutine: v.optional(v.union(v.any(), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    // Normalize weeklyPlan to ensure all blocks have required fields and match schema exactly
    const normalizedWeeklyPlan = args.weeklyPlan.map((day: any) => {
      // Ensure day has required fields
      if (!day.blocks || !Array.isArray(day.blocks)) {
        throw new Error(`Invalid day structure: missing blocks array for day ${day.day_of_week}`);
      }
      
      return {
        day_of_week: typeof day.day_of_week === "number" ? day.day_of_week : parseInt(day.day_of_week),
        focus: String(day.focus || ""),
        notes: day.notes ?? null,
        blocks: day.blocks.map((block: any, blockIndex: number) => {
          // Validate block has required fields
          if (!block || typeof block !== "object") {
            throw new Error(`Invalid block at index ${blockIndex}: block is not an object`);
          }
          if (!block.type || typeof block.type !== "string") {
            throw new Error(`Invalid block at index ${blockIndex}: missing or invalid type field`);
          }
          if (!Array.isArray(block.exercises)) {
            throw new Error(`Invalid block at index ${blockIndex}: exercises must be an array`);
          }
          
          // Normalize block type - ensure it's a valid literal
          let blockType = String(block.type).toLowerCase();
          if (blockType !== "single" && blockType !== "superset" && blockType !== "amrap") {
            console.warn(`[WARN] Invalid block type "${block.type}" at index ${blockIndex}, defaulting to "single"`);
            blockType = "single"; // Use normalized type
          }
          
          // Normalize exercises first - ensure only schema-allowed fields
          const normalizedExercises = block.exercises.map((ex: any, exIndex: number) => {
            if (!ex || typeof ex !== "object") {
              throw new Error(`Invalid exercise at block ${blockIndex}, exercise ${exIndex}: not an object`);
            }
            if (!ex.exercise_name || typeof ex.exercise_name !== "string") {
              throw new Error(`Invalid exercise at block ${blockIndex}, exercise ${exIndex}: missing or invalid exercise_name`);
            }
            if (!ex.category || typeof ex.category !== "string") {
              throw new Error(`Invalid exercise at block ${blockIndex}, exercise ${exIndex}: missing or invalid category`);
            }
            return {
              exercise_name: String(ex.exercise_name),
              category: ex.category === "warmup" || ex.category === "main" || ex.category === "cooldown" 
                ? ex.category 
                : "main", // Default to main if invalid
              metrics_template: ex.metrics_template ?? {},
              notes: ex.notes ?? null,
              original_exercise_name: ex.original_exercise_name ?? null,
              rpe: ex.rpe ?? null,
            };
          });

          // Build normalized block based on type - only include fields required by schema
          // Use explicit object construction to ensure no extra fields leak through
          if (blockType === "superset") {
            // Superset block: requires rounds, no duration_minutes
            // Handle various input formats for rounds - be very defensive
            let rounds: number = 3; // Default fallback
            if (block.rounds !== undefined && block.rounds !== null) {
              if (typeof block.rounds === "number" && isFinite(block.rounds) && block.rounds > 0) {
                rounds = block.rounds;
              } else if (typeof block.rounds === "string") {
                const parsed = parseFloat(block.rounds);
                if (!isNaN(parsed) && isFinite(parsed) && parsed > 0) {
                  rounds = parsed;
                }
              }
            }
            
            // Final validation - ensure rounds is always a valid positive number
            if (!isFinite(rounds) || rounds <= 0) {
              console.warn(`[WARN] Invalid rounds value for superset block at index ${blockIndex}, defaulting to 3`);
              rounds = 3;
            }
            
            return {
              type: "superset" as const,
              title: block.title ?? null,
              rounds: rounds,
              exercises: normalizedExercises,
            };
          } else if (blockType === "amrap") {
            // AMRAP block: requires duration_minutes, no rounds
            // Handle various input formats for duration - be very defensive
            let duration: number = 10; // Default fallback
            if (block.duration_minutes !== undefined && block.duration_minutes !== null) {
              if (typeof block.duration_minutes === "number" && isFinite(block.duration_minutes) && block.duration_minutes > 0) {
                duration = block.duration_minutes;
              } else if (typeof block.duration_minutes === "string") {
                const parsed = parseFloat(block.duration_minutes);
                if (!isNaN(parsed) && isFinite(parsed) && parsed > 0) {
                  duration = parsed;
                }
              }
            }
            
            // Final validation - ensure duration is always a valid positive number
            if (!isFinite(duration) || duration <= 0) {
              console.warn(`[WARN] Invalid duration_minutes value for AMRAP block at index ${blockIndex}, defaulting to 10`);
              duration = 10;
            }
            
            return {
              type: "amrap" as const,
              title: block.title ?? null,
              duration_minutes: duration,
              exercises: normalizedExercises,
            };
          } else {
            // Single block: only type, title, exercises (no rounds or duration_minutes)
            return {
              type: "single" as const,
              title: block.title ?? null,
              exercises: normalizedExercises,
            };
          }
        }),
      };
    });

    // Debug: Log first block to verify structure before insert
    if (normalizedWeeklyPlan[0]?.blocks[0]) {
      const firstBlock = normalizedWeeklyPlan[0].blocks[0];
      console.log("[DEBUG] First block structure:", JSON.stringify(firstBlock, null, 2));
      console.log("[DEBUG] First block type:", firstBlock.type);
      console.log("[DEBUG] First block keys:", Object.keys(firstBlock));
    }

    // Extract unique exercises server-side (FAST - runs in Convex)
    const exerciseMap = new Map<string, { exercise_name: string; notes?: string; category: 'warmup' | 'main' | 'cooldown' }>();
    
    // Helper to add exercise to map (deduplicates by lowercase name)
    const addExercise = (ex: { exercise_name: string; notes?: string | null; category: 'warmup' | 'main' | 'cooldown' }) => {
      const key = ex.exercise_name.toLowerCase().trim();
      if (!exerciseMap.has(key)) {
        exerciseMap.set(key, {
          exercise_name: ex.exercise_name,
          notes: ex.notes || undefined,
          category: ex.category,
        });
      }
    };

    // Extract from weekly plan (already normalized, so we can iterate directly)
    normalizedWeeklyPlan.forEach(day => {
      day.blocks.forEach(block => {
        block.exercises.forEach(addExercise);
      });
    });

    // Extract from daily routine if present
    const normalizedDailyRoutine = args.dailyRoutine || null;
    if (normalizedDailyRoutine?.exercises) {
      normalizedDailyRoutine.exercises.forEach(addExercise);
    }

    const extractedExercises = Array.from(exerciseMap.values());

    const planId = await ctx.db.insert("workoutPlans", {
      userId,
      name: args.name,
      weeklyPlan: normalizedWeeklyPlan,
      dailyRoutine: normalizedDailyRoutine,
      createdAt: new Date().toISOString(),
    });

    // Set as active plan
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      // Create user if doesn't exist
      await ctx.db.insert("users", {
        userId,
        activePlanId: planId,
        lastProgressionApplied: null,
        bodyMetrics: null,
        goals: null,
        trainingPreferences: null,
      });
    } else {
      await ctx.db.patch(user._id, { activePlanId: planId });
    }

    // Return both planId and extracted exercises for client to use
    return {
      planId,
      extractedExercises,
    };
  },
});

// Update an existing workout plan
export const updateWorkoutPlan = mutation({
  args: {
    userId: v.string(),
    planId: v.id("workoutPlans"),
    name: v.optional(v.string()),
    weeklyPlan: v.optional(v.array(v.any())),
    dailyRoutine: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;
    const plan = await ctx.db.get(args.planId);

    if (!plan || plan.userId !== userId) {
      throw new Error("Plan not found or unauthorized");
    }

    const updates: any = {};
    if (args.name !== undefined) {
      updates.name = args.name;
    }
    if (args.weeklyPlan !== undefined) {
      updates.weeklyPlan = args.weeklyPlan;
    }
    if (args.dailyRoutine !== undefined) {
      updates.dailyRoutine = args.dailyRoutine;
    }

    await ctx.db.patch(args.planId, updates);
  },
});

// Delete a workout plan
export const deleteWorkoutPlan = mutation({
  args: {
    userId: v.string(),
    planId: v.id("workoutPlans"),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;
    const plan = await ctx.db.get(args.planId);

    if (!plan || plan.userId !== userId) {
      throw new Error("Plan not found or unauthorized");
    }

    // If this is the active plan, clear it
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (user && user.activePlanId === args.planId) {
      await ctx.db.patch(user._id, { activePlanId: null });
    }

    await ctx.db.delete(args.planId);
  },
});

// Set active plan
export const setActivePlan = mutation({
  args: {
    userId: v.string(),
    planId: v.id("workoutPlans"),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;
    const plan = await ctx.db.get(args.planId);

    if (!plan || plan.userId !== userId) {
      throw new Error("Plan not found or unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, { activePlanId: args.planId });
  },
});

// Add a workout log
export const addWorkoutLog = mutation({
  args: {
    userId: v.string(),
    focus: v.string(),
    exercises: v.array(v.any()),
    durationMinutes: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;

    await ctx.db.insert("workoutLogs", {
      userId,
      date: new Date().toISOString(),
      focus: args.focus,
      exercises: args.exercises,
      durationMinutes: args.durationMinutes || null,
    });
  },
});

// Save exercise history
export const saveExerciseHistory = mutation({
  args: {
    userId: v.string(),
    exerciseName: v.string(),
    weight: v.number(),
    reps: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;
    const normalized = args.exerciseName.toLowerCase().replace(/\s+/g, "_");

    const existing = await ctx.db
      .query("exerciseHistory")
      .withIndex("by_userId_exerciseName", (q) =>
        q.eq("userId", userId).eq("exerciseName", normalized)
      )
      .first();

    const historyData = {
      userId,
      exerciseName: normalized,
      exercise_name: args.exerciseName,
      last_weight: args.weight,
      last_reps: args.reps,
      last_logged: new Date().toISOString(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, historyData);
    } else {
      await ctx.db.insert("exerciseHistory", historyData);
    }
  },
});

// Cache exercise explanation with FULL metadata
export const cacheExerciseExplanation = mutation({
  args: {
    exerciseName: v.string(),
    explanation: v.string(),
    muscles_worked: v.optional(v.array(v.string())),
    form_cue: v.optional(v.string()),
    common_mistake: v.optional(v.string()),
    source: v.union(v.literal("gemini_ultra"), v.literal("gemini_api"), v.literal("scientific_textbooks"), v.literal("generated_data")),
    // NEW: Full metadata fields
    equipment_required: v.optional(v.array(v.string())),
    contraindications: v.optional(v.array(v.string())),
    movement_pattern: v.optional(v.union(
      v.literal("squat"), v.literal("hinge"), v.literal("push_horizontal"), v.literal("push_vertical"),
      v.literal("pull_horizontal"), v.literal("pull_vertical"), v.literal("carry"), v.literal("core"),
      v.literal("mobility"), v.literal("plyometric"), v.literal("cardio"), v.literal("unknown")
    )),
    exercise_tier: v.optional(v.union(v.literal("S"), v.literal("A"), v.literal("B"), v.literal("C"))),
    primary_category: v.optional(v.union(v.literal("warmup"), v.literal("main"), v.literal("cooldown"))),
    injury_risk: v.optional(v.union(v.literal("low"), v.literal("moderate"), v.literal("high"))),
    evidence_level: v.optional(v.union(v.literal("high"), v.literal("moderate"), v.literal("low"))),
    minimum_experience_level: v.optional(v.string()),
    normalized_name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Use normalized name if provided, otherwise normalize the provided name
    const normalized = args.normalized_name 
      ? args.normalized_name.toLowerCase().trim().replace(/\s+/g, "_")
      : args.exerciseName.toLowerCase().trim().replace(/\s+/g, "_");
    const now = new Date().toISOString();

    const existing = await ctx.db
      .query("exerciseCache")
      .withIndex("by_exerciseName", (q) => q.eq("exercise_name", normalized))
      .first();

    // Use provided values or preserve existing or set defaults
    const cacheData: any = {
      exercise_name: normalized,
      explanation: args.explanation,
      muscles_worked: args.muscles_worked || existing?.muscles_worked || null,
      form_cue: args.form_cue || existing?.form_cue || null,
      common_mistake: args.common_mistake || existing?.common_mistake || null,
      generated_at: existing?.generated_at || now,
      hit_count: (existing?.hit_count || 0) + 1,
      last_accessed: now,
      source: args.source,
      // NEW: Use provided metadata or preserve existing
      equipment_required: args.equipment_required && args.equipment_required.length > 0 
        ? args.equipment_required 
        : (existing?.equipment_required || []),
      contraindications: args.contraindications !== undefined 
        ? args.contraindications 
        : (existing?.contraindications || []),
      movement_pattern: args.movement_pattern || existing?.movement_pattern || null,
      exercise_tier: args.exercise_tier || existing?.exercise_tier || null,
      primary_category: args.primary_category || existing?.primary_category || null,
      injury_risk: args.injury_risk || existing?.injury_risk || null,
      evidence_level: args.evidence_level || existing?.evidence_level || null,
      // Use provided value, preserve existing, or use smart default based on exercise characteristics
      minimum_experience_level: args.minimum_experience_level || existing?.minimum_experience_level || 
        (args.injury_risk === "high" ? "advanced" : 
         args.injury_risk === "moderate" ? "intermediate" : "beginner"),
      // Preserve other existing fields
      value_score: existing?.value_score || null,
      sport_applications: existing?.sport_applications || null,
      global_usage_count: existing?.global_usage_count || 0,
      last_30_day_usage: existing?.last_30_day_usage || 0,
      verified_by_expert: existing?.verified_by_expert || null,
      last_reviewed: existing?.last_reviewed || null,
    };

    if (existing) {
      await ctx.db.patch(existing._id, cacheData);
    } else {
      // Set defaults for new entries
      const newCacheData = {
        ...cacheData,
        global_usage_count: 0,
        last_30_day_usage: 0,
        // Ensure arrays are never null
        equipment_required: cacheData.equipment_required || [],
        contraindications: cacheData.contraindications || [],
        // Ensure minimum_experience_level is never null (use smart default based on exercise characteristics)
        minimum_experience_level: cacheData.minimum_experience_level || 
          (cacheData.injury_risk === "high" ? "advanced" : 
           cacheData.injury_risk === "moderate" ? "intermediate" : "beginner"),
      };
      
      await ctx.db.insert("exerciseCache", newCacheData);
    }
  },
});

// Update exercise with German translations
export const updateExerciseWithGerman = mutation({
  args: {
    exerciseName: v.string(),
    explanation_de: v.string(),
    muscles_worked_de: v.array(v.string()),
    form_cue_de: v.string(),
    common_mistake_de: v.string(),
  },
  handler: async (ctx, args) => {
    const normalized = args.exerciseName.toLowerCase().trim().replace(/\s+/g, "_");

    const existing = await ctx.db
      .query("exerciseCache")
      .withIndex("by_exerciseName", (q) => q.eq("exercise_name", normalized))
      .first();

    if (!existing) {
      throw new Error(`Exercise not found: ${args.exerciseName}`);
    }

    await ctx.db.patch(existing._id, {
      explanation_de: args.explanation_de,
      muscles_worked_de: args.muscles_worked_de,
      form_cue_de: args.form_cue_de,
      common_mistake_de: args.common_mistake_de,
    });
  },
});

// Update cached exercise hit count and last accessed
export const updateCachedExerciseAccess = mutation({
  args: {
    exerciseName: v.string(),
  },
  handler: async (ctx, args) => {
    const normalized = args.exerciseName.toLowerCase().trim().replace(/\s+/g, "_");
    const cached = await ctx.db
      .query("exerciseCache")
      .withIndex("by_exerciseName", (q) => q.eq("exercise_name", normalized))
      .first();

    if (cached) {
      await ctx.db.patch(cached._id, {
        hit_count: (cached.hit_count || 0) + 1,
        last_accessed: new Date().toISOString(),
      });
    }
  },
});

// Save programming knowledge from books
export const saveProgrammingKnowledge = mutation({
  args: {
    book_title: v.string(),
    author: v.string(),
    category: v.union(
      v.literal("mobility"),
      v.literal("athletic"),
      v.literal("bodybuilding"),
      v.literal("aesthetics"),
      v.literal("running"),
      v.literal("sport")
    ),
    principle_type: v.union(
      v.literal("exercise_selection"),
      v.literal("programming"),
      v.literal("personalization"),
      v.literal("goal_specific"),
      v.literal("injury_protocol")
    ),
    title: v.string(),
    description: v.string(),
    applicable_goals: v.array(v.string()),
    applicable_experience: v.array(v.string()),
    exercise_recommendations: v.optional(v.any()),
    guidelines: v.optional(v.array(v.any())),
    programming_templates: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("programmingKnowledge", {
      ...args,
      extracted_at: new Date().toISOString(),
    });
  },
});

// Update exercise metadata comprehensively
export const updateExerciseMetadata = mutation({
  args: {
    exerciseName: v.string(),
    equipment_required: v.optional(v.array(v.string())),
    evidence_level: v.optional(v.union(v.literal("high"), v.literal("moderate"), v.literal("low"))),
    exercise_tier: v.optional(v.union(v.literal("S"), v.literal("A"), v.literal("B"), v.literal("C"))),
    movement_pattern: v.optional(v.union(
      v.literal("squat"), v.literal("hinge"), v.literal("push_horizontal"), v.literal("push_vertical"),
      v.literal("pull_horizontal"), v.literal("pull_vertical"), v.literal("carry"), v.literal("core"),
      v.literal("mobility"), v.literal("plyometric"), v.literal("cardio"), v.literal("unknown")
    )),
    primary_category: v.optional(v.union(v.literal("warmup"), v.literal("main"), v.literal("cooldown"))),
    minimum_experience_level: v.optional(v.string()),
    injury_risk: v.optional(v.union(v.literal("low"), v.literal("moderate"), v.literal("high"))),
    sport_applications: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const normalized = args.exerciseName.toLowerCase().trim().replace(/\s+/g, "_");
    
    const existing = await ctx.db
      .query("exerciseCache")
      .withIndex("by_exerciseName", (q) => q.eq("exercise_name", normalized))
      .first();
    
    if (!existing) {
      throw new Error(`Exercise ${args.exerciseName} not found`);
    }
    
    const updateData: any = {
      last_accessed: new Date().toISOString(),
    };
    
    // Only update provided fields
    if (args.equipment_required !== undefined) updateData.equipment_required = args.equipment_required;
    if (args.evidence_level !== undefined) updateData.evidence_level = args.evidence_level;
    if (args.exercise_tier !== undefined) updateData.exercise_tier = args.exercise_tier;
    if (args.movement_pattern !== undefined) updateData.movement_pattern = args.movement_pattern;
    if (args.primary_category !== undefined) updateData.primary_category = args.primary_category;
    if (args.minimum_experience_level !== undefined) updateData.minimum_experience_level = args.minimum_experience_level;
    if (args.injury_risk !== undefined) updateData.injury_risk = args.injury_risk;
    if (args.sport_applications !== undefined) updateData.sport_applications = args.sport_applications;
    
    await ctx.db.patch(existing._id, updateData);
  },
});

// Save exercise modifications
export const saveExerciseModification = mutation({
  args: {
    base_exercise: v.string(),
    book_source: v.string(),
    category: v.string(),
    progressions: v.array(v.any()),
    regressions: v.array(v.any()),
    modifications: v.optional(v.any()),
    equipment_alternatives: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const normalized = args.base_exercise.toLowerCase().trim().replace(/\s+/g, "_");
    
    // Check if modification exists for this exercise
    const existing = await ctx.db
      .query("exerciseModifications")
      .withIndex("by_exercise", (q) => q.eq("base_exercise", normalized))
      .first();

    if (existing) {
      // Merge: combine progressions/regressions from multiple sources
      await ctx.db.patch(existing._id, {
        progressions: [...existing.progressions, ...args.progressions],
        regressions: [...existing.regressions, ...args.regressions],
        // Merge modifications and alternatives
        modifications: { ...existing.modifications, ...args.modifications },
        equipment_alternatives: { ...existing.equipment_alternatives, ...args.equipment_alternatives },
      });
    } else {
      await ctx.db.insert("exerciseModifications", {
        base_exercise: normalized,
        ...args,
        extracted_at: new Date().toISOString(),
      });
    }
  },
});

// Save goal-specific guidelines
export const saveGoalGuidelines = mutation({
  args: {
    goal: v.string(),
    book_source: v.string(),
    primary_exercises: v.array(v.any()),
    exercise_order: v.string(),
    volume_guidelines: v.string(),
    periodization: v.string(),
    programming_details: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("goalGuidelines", {
      ...args,
      extracted_at: new Date().toISOString(),
    });
  },
});

// Save injury protocol
export const saveInjuryProtocol = mutation({
  args: {
    issue: v.string(),
    book_source: v.string(),
    exercises_to_avoid: v.array(v.any()),
    exercise_substitutions: v.array(v.any()),
    prehab_exercises: v.array(v.any()),
    warning_signs: v.array(v.string()),
    when_to_progress: v.string(),
    when_to_regress: v.string(),
  },
  handler: async (ctx, args) => {
    const normalized = args.issue.toLowerCase().trim().replace(/\s+/g, "_");
    
    // Check if protocol exists for this issue
    const existing = await ctx.db
      .query("injuryProtocols")
      .withIndex("by_issue", (q) => q.eq("issue", normalized))
      .first();

    if (existing) {
      // Merge: combine substitutions and prehab from multiple sources
      await ctx.db.patch(existing._id, {
        exercises_to_avoid: [...existing.exercises_to_avoid, ...args.exercises_to_avoid],
        exercise_substitutions: [...existing.exercise_substitutions, ...args.exercise_substitutions],
        prehab_exercises: [...existing.prehab_exercises, ...args.prehab_exercises],
        warning_signs: [...existing.warning_signs, ...args.warning_signs],
      });
    } else {
      await ctx.db.insert("injuryProtocols", {
        issue: normalized,
        ...args,
        extracted_at: new Date().toISOString(),
      });
    }
  },
});

// Update user exercise preferences
export const updateUserExercisePreference = mutation({
  args: {
    userId: v.string(),
    exerciseName: v.string(),
    updates: v.object({
      personal_rating: v.optional(v.union(v.number(), v.null())),
      personal_notes: v.optional(v.union(v.string(), v.null())),
      preferred_sets: v.optional(v.union(v.number(), v.null())),
      preferred_reps: v.optional(v.union(v.string(), v.null())),
      preferred_rest: v.optional(v.union(v.number(), v.null())),
      personal_modifications: v.optional(v.union(v.string(), v.null())),
      is_favorite: v.optional(v.boolean()),
      never_suggest: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const normalized = args.exerciseName.toLowerCase().trim().replace(/\s+/g, "_");
    
    const existing = await ctx.db
      .query("userExercisePreferences")
      .withIndex("by_userId_exercise", (q) => 
        q.eq("userId", args.userId).eq("exerciseName", normalized)
      )
      .first();
    
    const now = new Date().toISOString();
    const data = {
      userId: args.userId,
      exerciseName: normalized,
      last_updated: now,
      ...args.updates,
    };
    
    if (existing) {
      await ctx.db.patch(existing._id, data);
    } else {
      await ctx.db.insert("userExercisePreferences", {
        userId: args.userId,
        exerciseName: normalized,
        last_updated: now,
        personal_rating: args.updates.personal_rating ?? null,
        personal_notes: args.updates.personal_notes ?? null,
        preferred_sets: args.updates.preferred_sets ?? null,
        preferred_reps: args.updates.preferred_reps ?? null,
        preferred_rest: args.updates.preferred_rest ?? null,
        personal_modifications: args.updates.personal_modifications ?? null,
        is_favorite: args.updates.is_favorite ?? false,
        never_suggest: args.updates.never_suggest ?? false,
      });
    }
  },
});

// Update user exercise analytics (called after workout completion)
export const updateUserExerciseAnalytics = mutation({
  args: {
    userId: v.string(),
    exerciseName: v.string(),
    sets: v.array(
      v.object({
        weight: v.union(v.number(), v.string()),
        reps: v.union(v.number(), v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const normalized = args.exerciseName.toLowerCase().trim().replace(/\s+/g, "_");
    
    // Calculate analytics
    let totalVolume = 0;
    let bestWeight = 0;
    let bestReps = 0;
    
    args.sets.forEach((set) => {
      const weight = typeof set.weight === 'string' ? parseFloat(set.weight) : set.weight;
      const reps = typeof set.reps === 'string' ? parseFloat(set.reps) : set.reps;
      
      if (!isNaN(weight) && !isNaN(reps)) {
        totalVolume += weight * reps;
        if (weight > bestWeight) bestWeight = weight;
        if (reps > bestReps) bestReps = reps;
      }
    });
    
    const existing = await ctx.db
      .query("userExerciseAnalytics")
      .withIndex("by_userId_exercise", (q) => 
        q.eq("userId", args.userId).eq("exerciseName", normalized)
      )
      .first();
    
    const now = new Date().toISOString();
    
    if (existing) {
      const newTotalSets = existing.total_sets_completed + args.sets.length;
      const newTotalVolume = existing.total_volume + totalVolume;
      const newBestWeight = bestWeight > (existing.best_weight || 0) ? bestWeight : existing.best_weight;
      const newBestReps = bestReps > (existing.best_reps || 0) ? bestReps : existing.best_reps;
      
      // Determine strength trend (simplified - could be more sophisticated)
      let strengthTrend = existing.strength_trend;
      if (newBestWeight > (existing.best_weight || 0) || newBestReps > (existing.best_reps || 0)) {
        strengthTrend = "improving";
      }
      
      await ctx.db.patch(existing._id, {
        total_sets_completed: newTotalSets,
        total_volume: newTotalVolume,
        best_weight: newBestWeight,
        best_reps: newBestReps,
        strength_trend: strengthTrend,
        last_pr_date: (newBestWeight > (existing.best_weight || 0) || newBestReps > (existing.best_reps || 0)) 
          ? now 
          : existing.last_pr_date,
      });
    } else {
      await ctx.db.insert("userExerciseAnalytics", {
        userId: args.userId,
        exerciseName: normalized,
        total_sets_completed: args.sets.length,
        total_volume: totalVolume,
        best_weight: bestWeight > 0 ? bestWeight : null,
        best_reps: bestReps > 0 ? bestReps : null,
        strength_trend: null,
        last_pr_date: null,
        injury_incidents: [],
      });
    }
    
    // Also update global exercise usage count
    const exerciseCache = await ctx.db
      .query("exerciseCache")
      .withIndex("by_exerciseName", (q) => q.eq("exercise_name", normalized))
      .first();
    
    if (exerciseCache) {
      await ctx.db.patch(exerciseCache._id, {
        global_usage_count: (exerciseCache.global_usage_count || 0) + 1,
        last_30_day_usage: (exerciseCache.last_30_day_usage || 0) + 1,
      });
    }
  },
});

// Record injury incident for an exercise
export const recordExerciseInjury = mutation({
  args: {
    userId: v.string(),
    exerciseName: v.string(),
    severity: v.union(
      v.literal("minor"),
      v.literal("moderate"),
      v.literal("severe")
    ),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    const normalized = args.exerciseName.toLowerCase().trim().replace(/\s+/g, "_");
    
    const existing = await ctx.db
      .query("userExerciseAnalytics")
      .withIndex("by_userId_exercise", (q) => 
        q.eq("userId", args.userId).eq("exerciseName", normalized)
      )
      .first();
    
    const incident = {
      date: new Date().toISOString(),
      severity: args.severity,
      notes: args.notes,
    };
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        injury_incidents: [...(existing.injury_incidents || []), incident],
      });
    } else {
      await ctx.db.insert("userExerciseAnalytics", {
        userId: args.userId,
        exerciseName: normalized,
        total_sets_completed: 0,
        total_volume: 0,
        best_weight: null,
        best_reps: null,
        strength_trend: null,
        last_pr_date: null,
        injury_incidents: [incident],
      });
    }
  },
});

// Update exercise cache with enhanced classification data
export const updateExerciseClassification = mutation({
  args: {
    exerciseName: v.string(),
    primary_category: v.optional(
      v.union(v.literal("warmup"), v.literal("main"), v.literal("cooldown"))
    ),
    exercise_tier: v.optional(
      v.union(v.literal("S"), v.literal("A"), v.literal("B"), v.literal("C"))
    ),
    value_score: v.optional(v.number()),
    movement_pattern: v.optional(
      v.union(
        v.literal("squat"),
        v.literal("hinge"),
        v.literal("push_horizontal"),
        v.literal("push_vertical"),
        v.literal("pull_horizontal"),
        v.literal("pull_vertical"),
        v.literal("carry"),
        v.literal("core"),
        v.literal("mobility"),
        v.literal("plyometric"),
        v.literal("cardio")
      )
    ),
    sport_applications: v.optional(v.array(v.string())),
    evidence_level: v.optional(
      v.union(v.literal("high"), v.literal("moderate"), v.literal("low"))
    ),
    injury_risk: v.optional(
      v.union(v.literal("low"), v.literal("moderate"), v.literal("high"))
    ),
    verified_by_expert: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const normalized = args.exerciseName.toLowerCase().trim().replace(/\s+/g, "_");
    
    const existing = await ctx.db
      .query("exerciseCache")
      .withIndex("by_exerciseName", (q) => q.eq("exercise_name", normalized))
      .first();
    
    if (!existing) {
      throw new Error(`Exercise ${args.exerciseName} not found in cache`);
    }
    
    const updates: any = {};
    if (args.primary_category !== undefined) updates.primary_category = args.primary_category;
    if (args.exercise_tier !== undefined) updates.exercise_tier = args.exercise_tier;
    if (args.value_score !== undefined) updates.value_score = args.value_score;
    if (args.movement_pattern !== undefined) updates.movement_pattern = args.movement_pattern;
    if (args.sport_applications !== undefined) updates.sport_applications = args.sport_applications;
    if (args.evidence_level !== undefined) updates.evidence_level = args.evidence_level;
    if (args.injury_risk !== undefined) updates.injury_risk = args.injury_risk;
    if (args.verified_by_expert !== undefined) {
      updates.verified_by_expert = args.verified_by_expert;
      updates.last_reviewed = new Date().toISOString();
    }
    
    await ctx.db.patch(existing._id, updates);
  },
});

// Cache compressed knowledge for token optimization
export const cacheCompressedKnowledge = mutation({
  args: {
    cache_key: v.string(),
    user_goal: v.string(),
    user_experience: v.string(),
    user_constraints: v.array(v.string()),
    compressed_knowledge: v.object({
      tier_s_exercises: v.array(v.string()),
      tier_a_exercises: v.array(v.string()),
      tier_b_exercises: v.array(v.string()),
      avoid_exercises: v.array(v.string()),
      substitutions: v.object({}),
      programming_rules: v.array(v.string()),
      warmup_pool: v.array(v.string()),
      cooldown_pool: v.array(v.string()),
      sex_bullets: v.optional(v.array(v.string())),
      sport_bullets: v.optional(v.array(v.string())),
      body_bullets: v.optional(v.array(v.string())),
      injury_bullets: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    // Check if cache already exists
    const existing = await ctx.db
      .query("knowledgeCache")
      .withIndex("by_key", (q) => q.eq("cache_key", args.cache_key))
      .first();
    
    if (existing) {
      // Update existing cache
      await ctx.db.patch(existing._id, {
        compressed_knowledge: args.compressed_knowledge,
        generated_at: new Date().toISOString(),
        usage_count: 0,
        last_used: new Date().toISOString(),
      });
      return existing._id;
    } else {
      // Create new cache entry
      return await ctx.db.insert("knowledgeCache", {
        cache_key: args.cache_key,
        user_goal: args.user_goal,
        user_experience: args.user_experience,
        user_constraints: args.user_constraints,
        compressed_knowledge: args.compressed_knowledge,
        generated_at: new Date().toISOString(),
        usage_count: 0,
        last_used: new Date().toISOString(),
      });
    }
  },
});

// Cache compressed guidelines (specialized for guideline caching)
export const cacheCompressedGuidelines = mutation({
  args: {
    cache_key: v.string(),
    user_goal: v.string(),
    user_experience: v.string(),
    user_constraints: v.array(v.string()),
    compressed_knowledge: v.object({
      tier_s_exercises: v.array(v.string()),
      tier_a_exercises: v.array(v.string()),
      tier_b_exercises: v.array(v.string()),
      avoid_exercises: v.array(v.string()),
      substitutions: v.object({}),
      programming_rules: v.array(v.string()),
      warmup_pool: v.array(v.string()),
      cooldown_pool: v.array(v.string()),
      sex_bullets: v.optional(v.array(v.string())),
      sport_bullets: v.optional(v.array(v.string())),
      body_bullets: v.optional(v.array(v.string())),
      injury_bullets: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    // Check if cache already exists
    const existing = await ctx.db
      .query("knowledgeCache")
      .withIndex("by_key", (q) => q.eq("cache_key", args.cache_key))
      .first();
    
    const now = new Date().toISOString();
    
    if (existing) {
      // Update existing cache
      await ctx.db.patch(existing._id, {
        compressed_knowledge: args.compressed_knowledge,
        last_used: now,
      });
      return existing._id;
    } else {
      // Create new cache entry
      return await ctx.db.insert("knowledgeCache", {
        cache_key: args.cache_key,
        user_goal: args.user_goal,
        user_experience: args.user_experience,
        user_constraints: args.user_constraints,
        compressed_knowledge: args.compressed_knowledge,
        generated_at: now,
        usage_count: 0,
        last_used: now,
      });
    }
  },
});

// Increment knowledge cache usage count
export const incrementKnowledgeCacheUsage = mutation({
  args: {
    cache_key: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("knowledgeCache")
      .withIndex("by_key", (q) => q.eq("cache_key", args.cache_key))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        usage_count: existing.usage_count + 1,
        last_used: new Date().toISOString(),
      });
    }
  },
});

// Log plan generation attempt (for analytics)
export const logGenerationAttempt = mutation({
  args: {
    profile_key: v.string(),
    user_id: v.optional(v.union(v.string(), v.null())),
    success: v.boolean(),
    validation_errors: v.array(v.string()),
    attempt_count: v.number(),
    goal: v.optional(v.string()),
    experience: v.optional(v.string()),
    sport: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generationLog", {
      profile_key: args.profile_key,
      user_id: args.user_id || null,
      success: args.success,
      validation_errors: args.validation_errors,
      timestamp: new Date().toISOString(),
      attempt_count: args.attempt_count,
      goal: args.goal,
      experience: args.experience,
      sport: args.sport,
    });
  },
});

// Add exercise relationships
export const addExerciseRelationship = mutation({
  args: {
    primary_exercise: v.string(),
    related_exercise: v.string(),
    relationship_type: v.union(
      v.literal("progression"),
      v.literal("regression"),
      v.literal("alternative"),
      v.literal("compound_to_isolation"),
      v.literal("similar_pattern"),
      v.literal("antagonist")
    ),
    strength_difference: v.optional(v.number()),
    similarity_score: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalized_primary = args.primary_exercise.toLowerCase().replace(/\s+/g, '_');
    const normalized_related = args.related_exercise.toLowerCase().replace(/\s+/g, '_');
    
    return await ctx.db.insert("exerciseRelationships", {
      primary_exercise: normalized_primary,
      related_exercise: normalized_related,
      relationship_type: args.relationship_type,
      strength_difference: args.strength_difference || null,
      similarity_score: args.similarity_score,
      notes: args.notes || null,
    });
  },
});

// Save sex-specific guidelines
export const saveSexSpecificGuidelines = mutation({
  args: {
    sex: v.union(v.literal("male"), v.literal("female"), v.literal("other"), v.literal("neutral")),
    goal: v.optional(v.union(v.string(), v.null())),
    experience: v.optional(v.union(v.string(), v.null())),
    guidelines: v.array(v.string()),
    recommended_exercises: v.optional(v.array(v.string())),
    contraindications: v.optional(v.array(v.string())),
    evidence_level: v.optional(v.union(v.literal("high"), v.literal("moderate"), v.literal("low"), v.null())),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sexSpecificGuidelines", {
      sex: args.sex,
      goal: args.goal || null,
      experience: args.experience || null,
      guidelines: args.guidelines,
      recommended_exercises: args.recommended_exercises || [],
      contraindications: args.contraindications || [],
      evidence_level: args.evidence_level || null,
      source: args.source || null,
      last_reviewed: new Date().toISOString(),
    });
  },
});


// Save sport-specific guidelines
export const saveSportGuidelines = mutation({
  args: {
    sport: v.string(),
    goal: v.optional(v.union(v.string(), v.null())),
    experience: v.optional(v.union(v.string(), v.null())),
    movement_priorities: v.array(v.string()),
    top_exercises: v.array(v.string()),
    conditioning_notes: v.optional(v.array(v.string())),
    contraindications: v.optional(v.array(v.string())),
    evidence_level: v.optional(v.union(v.literal("high"), v.literal("moderate"), v.literal("low"), v.null())),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sportGuidelines", {
      sport: args.sport,
      goal: args.goal || null,
      experience: args.experience || null,
      movement_priorities: args.movement_priorities,
      top_exercises: args.top_exercises,
      conditioning_notes: args.conditioning_notes || [],
      contraindications: args.contraindications || [],
      evidence_level: args.evidence_level || null,
      source: args.source || null,
      last_reviewed: new Date().toISOString(),
    });
  },
});


// Save body context guidelines
export const saveBodyContextGuidelines = mutation({
  args: {
    band: v.string(),
    athletic_level: v.optional(v.union(v.literal("low"), v.literal("moderate"), v.literal("high"), v.null())),
    body_type: v.optional(v.union(v.literal("lean"), v.literal("average"), v.literal("muscular"), v.null())),
    guidelines: v.array(v.string()),
    recommended_modalities: v.optional(v.array(v.string())),
    avoid: v.optional(v.array(v.string())),
    evidence_level: v.optional(v.union(v.literal("high"), v.literal("moderate"), v.literal("low"), v.null())),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("bodyContextGuidelines", {
      band: args.band,
      athletic_level: args.athletic_level || null,
      body_type: args.body_type || null,
      guidelines: args.guidelines,
      recommended_modalities: args.recommended_modalities || [],
      avoid: args.avoid || [],
      evidence_level: args.evidence_level || null,
      source: args.source || null,
      last_reviewed: new Date().toISOString(),
    });
  },
});


// Update or create sport bucket entry
export const updateSportBucket = mutation({
  args: {
    sport: v.string(),
    exercise_name: v.string(),
    usage_count: v.optional(v.number()),
    success_rate: v.optional(v.number()),
    avg_performance_score: v.optional(v.number()),
    typical_sets: v.optional(v.number()),
    typical_reps: v.optional(v.union(v.number(), v.null())),
    typical_duration_s: v.optional(v.union(v.number(), v.null())),
    typical_weight_ratio: v.optional(v.union(v.number(), v.null())),
    placement_stats: v.optional(v.object({
      warmup_count: v.number(),
      main_count: v.number(),
      cooldown_count: v.number(),
    })),
    created_by_user: v.id("users"),
    confidence_score: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const normalized = args.exercise_name.toLowerCase().trim().replace(/\s+/g, "_");
    
    const existing = await ctx.db
      .query("sportBuckets")
      .withIndex("by_sport_exercise", (q) => 
        q.eq("sport", args.sport).eq("exercise_name", normalized)
      )
      .first();
    
    const now = new Date().toISOString();
    const data = {
      sport: args.sport,
      exercise_name: normalized,
      usage_count: args.usage_count ?? (existing?.usage_count ?? 0),
      success_rate: args.success_rate ?? (existing?.success_rate ?? 0),
      avg_performance_score: args.avg_performance_score ?? (existing?.avg_performance_score ?? 0),
      typical_sets: args.typical_sets ?? (existing?.typical_sets ?? 1),
      typical_reps: args.typical_reps ?? (existing?.typical_reps ?? null),
      typical_duration_s: args.typical_duration_s ?? (existing?.typical_duration_s ?? null),
      typical_weight_ratio: args.typical_weight_ratio ?? (existing?.typical_weight_ratio ?? null),
      placement_stats: args.placement_stats ?? (existing?.placement_stats ?? {
        warmup_count: 0,
        main_count: 0,
        cooldown_count: 0,
      }),
      created_by_user: args.created_by_user,
      last_updated: now,
      confidence_score: args.confidence_score ?? (existing?.confidence_score ?? 0),
    };
    
    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("sportBuckets", data);
    }
  },
});

// Record exercise performance
export const recordExercisePerformance = mutation({
  args: {
    user_id: v.string(),
    exercise_name: v.string(),
    sport_context: v.optional(v.union(v.string(), v.null())),
    session_id: v.optional(v.union(v.id("workoutLogs"), v.null())),
    completed: v.boolean(),
    skipped: v.boolean(),
    substituted: v.boolean(),
    substitute_reason: v.optional(v.union(v.string(), v.null())),
    actual_sets: v.optional(v.union(v.number(), v.null())),
    actual_reps: v.optional(v.union(v.number(), v.null())),
    actual_weight: v.optional(v.union(v.number(), v.null())),
    actual_duration_s: v.optional(v.union(v.number(), v.null())),
    rpe: v.optional(v.union(v.number(), v.null())),
    form_quality: v.optional(v.union(v.number(), v.null())),
    pain_experienced: v.optional(v.union(v.boolean(), v.null())),
    pain_location: v.optional(v.union(v.string(), v.null())),
    was_pr: v.boolean(),
    notes: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const normalized = args.exercise_name.toLowerCase().trim().replace(/\s+/g, "_");
    
    return await ctx.db.insert("exercisePerformance", {
      user_id: args.user_id,
      exercise_name: normalized,
      sport_context: args.sport_context || null,
      session_id: args.session_id || null,
      completed: args.completed,
      skipped: args.skipped,
      substituted: args.substituted,
      substitute_reason: args.substitute_reason || null,
      actual_sets: args.actual_sets || null,
      actual_reps: args.actual_reps || null,
      actual_weight: args.actual_weight || null,
      actual_duration_s: args.actual_duration_s || null,
      rpe: args.rpe || null,
      form_quality: args.form_quality || null,
      pain_experienced: args.pain_experienced || null,
      pain_location: args.pain_location || null,
      was_pr: args.was_pr,
      notes: args.notes || null,
      timestamp: new Date().toISOString(),
    });
  },
});

// API Usage Tracking Mutations

export const incrementPlanUsage = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) return;

    const now = new Date();
    const apiUsage = user.apiUsage || {
      tier: "free",
      plansGenerated: 0,
      chatMessagesSent: 0,
      plansParsed: 0,
      periodStart: now.toISOString(),
      periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      lastReset: null
    };

    // Check if period expired
    if (new Date(apiUsage.periodEnd) < now) {
      // Reset usage
      apiUsage.plansGenerated = 0;
      apiUsage.chatMessagesSent = 0;
      apiUsage.plansParsed = 0;
      apiUsage.periodStart = now.toISOString();
      apiUsage.periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
      apiUsage.lastReset = now.toISOString();
    }

    apiUsage.plansGenerated += 1;

    await ctx.db.patch(user._id, { apiUsage });
  },
});

export const incrementChatUsage = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) return;

    const now = new Date();
    const apiUsage = user.apiUsage || {
      tier: "free",
      plansGenerated: 0,
      chatMessagesSent: 0,
      plansParsed: 0,
      periodStart: now.toISOString(),
      periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      lastReset: null
    };

    if (new Date(apiUsage.periodEnd) < now) {
      apiUsage.plansGenerated = 0;
      apiUsage.chatMessagesSent = 0;
      apiUsage.plansParsed = 0;
      apiUsage.periodStart = now.toISOString();
      apiUsage.periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
      apiUsage.lastReset = now.toISOString();
    }

    apiUsage.chatMessagesSent += 1;

    await ctx.db.patch(user._id, { apiUsage });
  },
});

export const incrementParseUsage = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) return;

    const now = new Date();
    const apiUsage = user.apiUsage || {
      tier: "free",
      plansGenerated: 0,
      chatMessagesSent: 0,
      plansParsed: 0,
      periodStart: now.toISOString(),
      periodEnd: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
      lastReset: null
    };

    if (new Date(apiUsage.periodEnd) < now) {
      apiUsage.plansGenerated = 0;
      apiUsage.chatMessagesSent = 0;
      apiUsage.plansParsed = 0;
      apiUsage.periodStart = now.toISOString();
      apiUsage.periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
      apiUsage.lastReset = now.toISOString();
    }

    apiUsage.plansParsed += 1;

    await ctx.db.patch(user._id, { apiUsage });
  },
});

export const upgradeToPremium = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) return;

    const apiUsage = user.apiUsage || {
      tier: "free",
      plansGenerated: 0,
      chatMessagesSent: 0,
      plansParsed: 0,
      periodStart: new Date().toISOString(),
      periodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
      lastReset: null
    };

    apiUsage.tier = "premium";

    await ctx.db.patch(user._id, { apiUsage });
  },
});
