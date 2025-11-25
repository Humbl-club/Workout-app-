import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profiles - stores user settings and preferences
  // userId is the Clerk user ID
  users: defineTable({
    userId: v.string(), // Same as auth token subject
    userCode: v.optional(v.string()), // Unique permanent code for buddy connections (REBLD-ABC123)
    activePlanId: v.union(v.id("workoutPlans"), v.null()),
    lastProgressionApplied: v.union(v.string(), v.null()), // ISO date string
    bodyMetrics: v.union(
      v.object({
        weight: v.union(v.number(), v.null()),
        height: v.union(v.number(), v.null()),
        heightUnit: v.union(v.literal("cm"), v.literal("ft"), v.null()),
        bodyFatPercentage: v.union(v.number(), v.null()),
        measurements: v.union(
          v.object({
            chest: v.union(v.number(), v.null()),
            waist: v.union(v.number(), v.null()),
            hips: v.union(v.number(), v.null()),
            biceps: v.union(v.number(), v.null()),
            thighs: v.union(v.number(), v.null()),
          }),
          v.null()
        ),
        lastUpdated: v.union(v.string(), v.null()), // ISO date string
      }),
      v.null()
    ),
    goals: v.union(
      v.array(
        v.object({
          type: v.union(
            v.literal("workout_count"),
            v.literal("weight_loss"),
            v.literal("strength_gain"),
            v.literal("custom")
          ),
          title: v.string(),
          target: v.number(),
          current: v.number(),
          deadline: v.union(v.string(), v.null()), // ISO date string
          createdAt: v.union(v.string(), v.null()), // ISO date string
        })
      ),
      v.null()
    ),
    // User training preferences (from onboarding) - optional for backward compatibility
    trainingPreferences: v.optional(v.union(
      v.object({
        primary_goal: v.string(), // "Aesthetic Physique", "Strength & Power", etc.
        goal_explanation: v.union(v.string(), v.null()), // User's own words about their goal
        experience_level: v.string(), // "Beginner", "Intermediate", "Advanced"
        training_frequency: v.string(), // "2-3", "3-4", "4-5", "5+"
        pain_points: v.array(v.string()), // ["Knees", "Lower Back", etc.]
        sport: v.union(v.string(), v.null()), // Sport-specific training
        sport_specific: v.union(v.string(), v.null()), // Elite sport-specific protocols  
        additional_notes: v.union(v.string(), v.null()), // Free-form notes
        last_updated: v.string(), // ISO date string
        // Expanded profile
        sex: v.union(v.literal("male"), v.literal("female"), v.literal("other"), v.null()),
        equipment: v.union(v.literal("minimal"), v.literal("home_gym"), v.literal("commercial_gym"), v.null()),
        preferred_session_length: v.union(v.literal("30"), v.literal("45"), v.literal("60"), v.literal("75"), v.null()),
        athletic_level: v.union(v.literal("low"), v.literal("moderate"), v.literal("high"), v.null()),
        training_age_years: v.union(v.number(), v.null()),
        body_type: v.union(v.literal("lean"), v.literal("average"), v.literal("muscular"), v.null()),
        comfort_flags: v.optional(v.array(v.string())),
      }),
      v.null()
    )),
    
    // NEW: Injury profile for personalized exercise selection
    injuryProfile: v.optional(v.object({
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
    })),

    // API usage tracking for rate limiting
    apiUsage: v.optional(v.object({
      tier: v.union(v.literal("free"), v.literal("premium")),
      plansGenerated: v.number(),
      chatMessagesSent: v.number(),
      plansParsed: v.number(),
      periodStart: v.string(), // ISO date
      periodEnd: v.string(), // ISO date
      lastReset: v.union(v.string(), v.null())
    })),
  })
    .index("by_userId", ["userId"])
    .index("by_userCode", ["userCode"])
    .index("by_activePlan", ["activePlanId"]),

  // Workout plans - user's workout programs
  workoutPlans: defineTable({
    userId: v.string(),
    name: v.string(),
    weeklyPlan: v.array(
      v.object({
        day_of_week: v.number(),
        focus: v.string(),
        notes: v.union(v.string(), v.null()),
        blocks: v.array(
          v.union(
            // Single exercise block
            v.object({
              type: v.literal("single"),
              title: v.union(v.string(), v.null()),
              exercises: v.array(
                v.object({
                  exercise_name: v.string(),
                  notes: v.union(v.string(), v.null()),
                  metrics_template: v.any(), // Flexible for different metric types
                  original_exercise_name: v.union(v.string(), v.null()),
                  rpe: v.union(v.string(), v.null()),
                  category: v.union(
                    v.literal("warmup"),
                    v.literal("main"),
                    v.literal("cooldown")
                  ),
                })
              ),
            }),
            // Superset block
            v.object({
              type: v.literal("superset"),
              title: v.union(v.string(), v.null()),
              rounds: v.number(),
              exercises: v.array(
                v.object({
                  exercise_name: v.string(),
                  notes: v.union(v.string(), v.null()),
                  metrics_template: v.any(),
                  original_exercise_name: v.union(v.string(), v.null()),
                  rpe: v.union(v.string(), v.null()),
                  category: v.union(
                    v.literal("warmup"),
                    v.literal("main"),
                    v.literal("cooldown")
                  ),
                })
              ),
            }),
            // AMRAP block
            v.object({
              type: v.literal("amrap"),
              title: v.union(v.string(), v.null()),
              duration_minutes: v.number(),
              exercises: v.array(
                v.object({
                  exercise_name: v.string(),
                  notes: v.union(v.string(), v.null()),
                  metrics_template: v.any(),
                  original_exercise_name: v.union(v.string(), v.null()),
                  rpe: v.union(v.string(), v.null()),
                  category: v.union(
                    v.literal("warmup"),
                    v.literal("main"),
                    v.literal("cooldown")
                  ),
                })
              ),
            })
          )
        ),
      })
    ),
    dailyRoutine: v.union(
      v.object({
        focus: v.string(),
        notes: v.union(v.string(), v.null()),
        exercises: v.array(
          v.object({
            exercise_name: v.string(),
            notes: v.union(v.string(), v.null()),
            metrics_template: v.any(),
            original_exercise_name: v.union(v.string(), v.null()),
            rpe: v.union(v.string(), v.null()),
            category: v.union(
              v.literal("warmup"),
              v.literal("main"),
              v.literal("cooldown")
            ),
          })
        ),
      }),
      v.null()
    ),
    createdAt: v.string(), // ISO date string
  })
    .index("by_userId", ["userId"])
    .index("by_userId_createdAt", ["userId", "createdAt"]),

  // Workout logs - completed workout sessions
  workoutLogs: defineTable({
    userId: v.string(),
    date: v.string(), // ISO date string
    focus: v.string(),
    exercises: v.array(
      v.object({
        exercise_name: v.string(),
        sets: v.array(
          v.union(
            v.object({
              set: v.number(),
              weight: v.union(v.number(), v.string()),
              reps: v.union(v.number(), v.string()),
              rpe: v.union(v.number(), v.null()),
            }),
            v.object({
              set: v.number(),
              duration_s: v.union(v.number(), v.string()),
            }),
            v.object({
              set: v.number(),
              distance_m: v.union(v.number(), v.string()),
              rest_s: v.union(v.number(), v.string()),
            })
          )
        ),
      })
    ),
    durationMinutes: v.union(v.number(), v.null()),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_date", ["userId", "date"]),

  // Exercise history - last weight/reps used per exercise per user
  exerciseHistory: defineTable({
    userId: v.string(),
    exerciseName: v.string(), // Normalized: lowercase with underscores
    exercise_name: v.string(), // Original exercise name
    last_weight: v.number(),
    last_reps: v.number(),
    last_logged: v.string(), // ISO date string
  })
    .index("by_userId", ["userId"])
    .index("by_userId_exerciseName", ["userId", "exerciseName"]),

  // Exercise cache - global exercise explanations (shared across all users)
  exerciseCache: defineTable({
    exercise_name: v.string(), // Normalized: lowercase with underscores
    explanation: v.string(),
    muscles_worked: v.union(v.array(v.string()), v.null()),
    form_cue: v.union(v.string(), v.null()),
    common_mistake: v.union(v.string(), v.null()),
    // German translations (optional for backward compatibility)
    explanation_de: v.optional(v.string()),
    muscles_worked_de: v.optional(v.array(v.string())),
    form_cue_de: v.optional(v.string()),
    common_mistake_de: v.optional(v.string()),
    generated_at: v.string(), // ISO date string
    hit_count: v.number(),
    last_accessed: v.string(), // ISO date string
    source: v.union(v.literal("gemini_ultra"), v.literal("gemini_api"), v.literal("scientific_textbooks"), v.literal("generated_data")),
    // NEW: Enhanced fields for exercise classification and value (all optional for backward compatibility)
    primary_category: v.optional(v.union(
      v.literal("warmup"),
      v.literal("main"),
      v.literal("cooldown"),
      v.null()
    )),
    exercise_tier: v.optional(v.union(
      v.literal("S"),
      v.literal("A"),
      v.literal("B"),
      v.literal("C"),
      v.null()
    )),
    value_score: v.optional(v.union(v.number(), v.null())), // 0-100
    movement_pattern: v.optional(v.union(
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
      v.literal("cardio"),
      v.literal("unknown"),
      v.null()
    )),
    sport_applications: v.optional(v.union(v.array(v.string()), v.null())),
    evidence_level: v.optional(v.union(
      v.literal("high"),
      v.literal("moderate"),
      v.literal("low"),
      v.null()
    )),
    injury_risk: v.optional(v.union(
      v.literal("low"),
      v.literal("moderate"),
      v.literal("high"),
      v.null()
    )),
    global_usage_count: v.optional(v.number()), // Track usage across all users
    last_30_day_usage: v.optional(v.number()),
    verified_by_expert: v.optional(v.union(v.boolean(), v.null())),
    last_reviewed: v.optional(v.union(v.string(), v.null())), // ISO date string
    // NEW: Enhanced fields for complete exercise data (optional for backward compatibility)
    equipment_required: v.optional(v.array(v.string())), // ["barbell", "dumbbells", "none"]
    minimum_experience_level: v.optional(v.string()), // "beginner", "intermediate", "advanced"
    contraindications: v.optional(v.array(v.string())), // ["pregnancy", "hypertension", "back_injury"]
    
    // NEW: Enhanced injury and sport-specific data
    injury_contraindications: v.optional(v.array(v.object({
      injury_type: v.string(), // "knee_pain", "lower_back", "shoulder_impingement"
      severity: v.union(
        v.literal("absolute"), // Never do this
        v.literal("caution"),  // Can do with modifications
        v.literal("monitor")   // OK but watch for issues
      ),
      reason: v.string(),
      safe_modifications: v.array(v.string()),
      alternative_exercises: v.array(v.string()),
    }))),
    
    therapeutic_benefits: v.optional(v.array(v.object({
      condition: v.string(), // "knee_stability", "shoulder_health"
      benefit_level: v.union(
        v.literal("high"),
        v.literal("moderate"),
        v.literal("low")
      ),
      explanation: v.string(),
      recommended_protocol: v.union(v.string(), v.null()),
    }))),
    
    sport_ratings: v.optional(v.object({
      boxing: v.union(v.number(), v.null()),
      hyrox: v.union(v.number(), v.null()),
      rock_climbing: v.union(v.number(), v.null()),
      basketball: v.union(v.number(), v.null()),
      soccer: v.union(v.number(), v.null()),
      tennis: v.union(v.number(), v.null()),
      running: v.union(v.number(), v.null()),
      swimming: v.union(v.number(), v.null()),
      cycling: v.union(v.number(), v.null()),
      general_fitness: v.union(v.number(), v.null()),
    })),
  }).index("by_exerciseName", ["exercise_name"])
    .index("by_tier", ["exercise_tier"])
    .index("by_category", ["primary_category"]),

  // Programming knowledge from books - teaches AI HOW to select exercises
  programmingKnowledge: defineTable({
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
    exercise_recommendations: v.optional(v.any()), // Complex nested structure
    guidelines: v.optional(v.array(v.any())),
    programming_templates: v.optional(v.any()),
    extracted_at: v.string(), // ISO date string
  })
    .index("by_category", ["category"])
    .index("by_principle_type", ["principle_type"])
    .index("by_category_type", ["category", "principle_type"]),

  // Exercise modifications - progressions, regressions, alternatives
  exerciseModifications: defineTable({
    base_exercise: v.string(), // Normalized exercise name
    book_source: v.string(), // "Book Title by Author"
    category: v.string(),
    progressions: v.array(v.any()), // Easier → Harder
    regressions: v.array(v.any()), // Harder → Easier
    modifications: v.optional(v.any()), // For injuries/limitations
    equipment_alternatives: v.optional(v.any()),
    extracted_at: v.string(), // ISO date string
  }).index("by_exercise", ["base_exercise"]),

  // Goal-specific exercise selection guidelines
  goalGuidelines: defineTable({
    goal: v.string(), // "strength", "hypertrophy", "athletic", "aesthetics", "mobility"
    book_source: v.string(),
    primary_exercises: v.array(v.any()),
    exercise_order: v.string(),
    volume_guidelines: v.string(),
    periodization: v.string(),
    programming_details: v.optional(v.any()),
    extracted_at: v.string(), // ISO date string
  }).index("by_goal", ["goal"]),

  // Injury and limitation protocols
  injuryProtocols: defineTable({
    issue: v.string(), // "lower_back_pain", "shoulder_impingement", "knee_pain", etc.
    book_source: v.string(),
    exercises_to_avoid: v.array(v.any()),
    exercise_substitutions: v.array(v.any()),
    prehab_exercises: v.array(v.any()),
    warning_signs: v.array(v.string()),
    when_to_progress: v.string(),
    when_to_regress: v.string(),
    extracted_at: v.string(), // ISO date string
  }).index("by_issue", ["issue"]),

  // NEW: Sex-specific guidelines
  sexSpecificGuidelines: defineTable({
    sex: v.union(v.literal("male"), v.literal("female"), v.literal("other"), v.literal("neutral")),
    goal: v.union(v.string(), v.null()),
    experience: v.union(v.string(), v.null()),
    guidelines: v.array(v.string()), // concise bullets (avoid/safe/volume/intensity)
    recommended_exercises: v.optional(v.array(v.string())),
    contraindications: v.optional(v.array(v.string())),
    evidence_level: v.optional(v.union(v.literal("high"), v.literal("moderate"), v.literal("low"), v.null())),
    source: v.optional(v.string()),
    last_reviewed: v.optional(v.string()),
  }).index("by_sex_goal_exp", ["sex", "goal", "experience"]),

  // NEW: Sport-specific guidelines (compact, prompt-ready)
  sportGuidelines: defineTable({
    sport: v.string(),
    goal: v.union(v.string(), v.null()),
    experience: v.union(v.string(), v.null()),
    movement_priorities: v.array(v.string()), // e.g., "squat pattern 2x/week", "rotational power 2-3x"
    top_exercises: v.array(v.string()),
    conditioning_notes: v.optional(v.array(v.string())),
    contraindications: v.optional(v.array(v.string())),
    evidence_level: v.optional(v.union(v.literal("high"), v.literal("moderate"), v.literal("low"), v.null())),
    source: v.optional(v.string()),
    last_reviewed: v.optional(v.string()),
  }).index("by_sport_goal_exp", ["sport", "goal", "experience"]),

  // NEW: Body-context guidelines (weight/BMI/athletic level/body type)
  bodyContextGuidelines: defineTable({
    band: v.string(), // e.g., "bmi_gt_32", "bmi_27_32", "muscular_high", "low_impact_needed"
    athletic_level: v.union(v.literal("low"), v.literal("moderate"), v.literal("high"), v.null()),
    body_type: v.union(v.literal("lean"), v.literal("average"), v.literal("muscular"), v.null()),
    guidelines: v.array(v.string()), // bullets for impact scaling, conditioning modes, loading caps
    recommended_modalities: v.optional(v.array(v.string())), // e.g., "sled push", "air bike"
    avoid: v.optional(v.array(v.string())),
    evidence_level: v.optional(v.union(v.literal("high"), v.literal("moderate"), v.literal("low"), v.null())),
    source: v.optional(v.string()),
    last_reviewed: v.optional(v.string()),
  }).index("by_band_level_type", ["band", "athletic_level", "body_type"]),

  // User-specific exercise preferences (per user)
  userExercisePreferences: defineTable({
    userId: v.string(),
    exerciseName: v.string(), // Normalized: lowercase with underscores
    personal_rating: v.union(v.number(), v.null()), // 1-5 rating
    personal_notes: v.union(v.string(), v.null()),
    preferred_sets: v.union(v.number(), v.null()),
    preferred_reps: v.union(v.string(), v.null()),
    preferred_rest: v.union(v.number(), v.null()), // seconds
    personal_modifications: v.union(v.string(), v.null()),
    is_favorite: v.boolean(),
    never_suggest: v.boolean(), // User blacklist
    last_updated: v.string(), // ISO date string
  })
    .index("by_userId", ["userId"])
    .index("by_userId_exercise", ["userId", "exerciseName"]),

  // User exercise analytics (per user)
  userExerciseAnalytics: defineTable({
    userId: v.string(),
    exerciseName: v.string(), // Normalized: lowercase with underscores
    total_sets_completed: v.number(),
    total_volume: v.number(), // Total weight × reps
    best_weight: v.union(v.number(), v.null()),
    best_reps: v.union(v.number(), v.null()),
    strength_trend: v.union(
      v.literal("improving"),
      v.literal("maintaining"),
      v.literal("declining"),
      v.null()
    ),
    last_pr_date: v.union(v.string(), v.null()), // ISO date string
    injury_incidents: v.array(
      v.object({
        date: v.string(), // ISO date string
        severity: v.union(
          v.literal("minor"),
          v.literal("moderate"),
          v.literal("severe")
        ),
        notes: v.string(),
      })
    ),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_exercise", ["userId", "exerciseName"]),

  // Exercise relationships - progressions, alternatives, patterns
  exerciseRelationships: defineTable({
    primary_exercise: v.string(), // Normalized exercise name
    related_exercise: v.string(), // Normalized exercise name
    relationship_type: v.union(
      v.literal("progression"), // related is harder
      v.literal("regression"), // related is easier
      v.literal("alternative"), // same difficulty, different focus
      v.literal("compound_to_isolation"), // compound -> isolation breakdown
      v.literal("similar_pattern"), // same movement pattern
      v.literal("antagonist") // opposite muscle groups
    ),
    strength_difference: v.union(v.number(), v.null()), // -50 to +50, how much harder/easier
    similarity_score: v.number(), // 0-100, how similar the exercises are
    notes: v.union(v.string(), v.null()),
  }).index("by_primary", ["primary_exercise"])
    .index("by_type", ["relationship_type"]),

  // Knowledge cache for compressed decision trees (token optimization)
  knowledgeCache: defineTable({
    cache_key: v.string(), // "aesthetic_intermediate_knee_pain"
    user_goal: v.string(),
    user_experience: v.string(),
    user_constraints: v.array(v.string()), // pain points, equipment limitations
    compressed_knowledge: v.object({
      tier_s_exercises: v.array(v.string()),
      tier_a_exercises: v.array(v.string()),
      tier_b_exercises: v.array(v.string()),
      avoid_exercises: v.array(v.string()),
      substitutions: v.object({}), // key-value pairs of exercise substitutions
      programming_rules: v.array(v.string()),
      warmup_pool: v.array(v.string()),
      cooldown_pool: v.array(v.string()),
      // Optional: Guideline bullets for token optimization
      sex_bullets: v.optional(v.array(v.string())),
      sport_bullets: v.optional(v.array(v.string())),
      body_bullets: v.optional(v.array(v.string())),
      injury_bullets: v.optional(v.array(v.string())),
    }),
    generated_at: v.string(), // ISO date string
    usage_count: v.number(),
    last_used: v.string(), // ISO date string
  }).index("by_key", ["cache_key"])
    .index("by_goal_experience", ["user_goal", "user_experience"]),
    
  // NEW: Sport-specific exercise buckets
  sportBuckets: defineTable({
    sport: v.string(), // "boxing", "hyrox", "rock_climbing", etc.
    exercise_name: v.string(), // normalized name
    
    // Performance tracking
    usage_count: v.number(), // Times used in this sport
    success_rate: v.number(), // 0-1, completion rate
    avg_performance_score: v.number(), // 0-100
    
    // Volume patterns
    typical_sets: v.number(),
    typical_reps: v.union(v.number(), v.null()),
    typical_duration_s: v.union(v.number(), v.null()),
    typical_weight_ratio: v.union(v.number(), v.null()), // % of user's capacity
    
    // Placement data
    placement_stats: v.object({
      warmup_count: v.number(),
      main_count: v.number(),
      cooldown_count: v.number(),
    }),
    
    // Metadata
    created_by_user: v.id("users"),
    last_updated: v.string(),
    confidence_score: v.number(), // Based on sample size
  })
    .index("by_sport", ["sport"])
    .index("by_sport_exercise", ["sport", "exercise_name"])
    .index("by_performance", ["sport", "avg_performance_score"]),
    
  // NEW: Exercise performance tracking
  exercisePerformance: defineTable({
    user_id: v.string(),
    exercise_name: v.string(),
    sport_context: v.union(v.string(), v.null()),
    session_id: v.union(v.id("workoutLogs"), v.null()),
    
    // Performance data
    completed: v.boolean(),
    skipped: v.boolean(),
    substituted: v.boolean(),
    substitute_reason: v.union(v.string(), v.null()),
    
    // Metrics
    actual_sets: v.union(v.number(), v.null()),
    actual_reps: v.union(v.number(), v.null()),
    actual_weight: v.union(v.number(), v.null()),
    actual_duration_s: v.union(v.number(), v.null()),
    
    // Subjective data
    rpe: v.union(v.number(), v.null()), // 1-10
    form_quality: v.union(v.number(), v.null()), // 1-5
    pain_experienced: v.union(v.boolean(), v.null()),
    pain_location: v.union(v.string(), v.null()),
    
    // Context
    was_pr: v.boolean(),
    notes: v.union(v.string(), v.null()),
    timestamp: v.string(),
  })
    .index("by_user", ["user_id"])
    .index("by_user_exercise", ["user_id", "exercise_name"])
    .index("by_user_sport", ["user_id", "sport_context"]),

  // Generation logging for analytics and debugging
  generationLog: defineTable({
    profile_key: v.string(), // Hashed profile key (goal_experience_sex_sport_etc)
    user_id: v.union(v.string(), v.null()), // Optional: user ID if available
    success: v.boolean(),
    validation_errors: v.array(v.string()), // Empty if success=true
    timestamp: v.string(), // ISO date string
    attempt_count: v.number(), // How many attempts before success/failure
    goal: v.optional(v.string()),
    experience: v.optional(v.string()),
    sport: v.optional(v.string()),
  })
    .index("by_profile_key", ["profile_key"])
    .index("by_timestamp", ["timestamp"])
    .index("by_success", ["success"]),

  // Workout Buddy System - Social Features
  sharedPlans: defineTable({
    shareCode: v.string(), // "REBLD-ABC123"
    planId: v.id("workoutPlans"),
    sharedBy: v.string(), // userId who shared
    sharedWith: v.array(v.string()), // userIds with access
    planName: v.string(),
    createdAt: v.string(),
    expiresAt: v.string(), // 7 days from creation
    acceptedBy: v.array(v.string()), // userIds who accepted
    isActive: v.boolean()
  }).index("by_shareCode", ["shareCode"])
    .index("by_sharedBy", ["sharedBy"])
    .index("by_planId", ["planId"]),

  workoutBuddies: defineTable({
    userId: v.string(),
    buddyId: v.string(),
    sharedPlanId: v.union(v.id("workoutPlans"), v.null()),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("declined")),
    createdAt: v.string(),
    acceptedAt: v.union(v.string(), v.null())
  }).index("by_userId", ["userId"])
    .index("by_buddyId", ["buddyId"])
    .index("by_pair", ["userId", "buddyId"]),

  buddySettings: defineTable({
    userId: v.string(),
    buddyId: v.string(),
    notifyOnWorkoutStart: v.boolean(),
    compareStats: v.boolean(),
    shareLogs: v.boolean(),
    showPRs: v.boolean()
  }).index("by_userId", ["userId"])
    .index("by_pair", ["userId", "buddyId"]),

  buddyNotifications: defineTable({
    userId: v.string(), // recipient
    triggeredBy: v.string(), // buddy who triggered
    type: v.union(
      v.literal("workout_started"),
      v.literal("pr_achieved"),
      v.literal("buddy_request"),
      v.literal("plan_shared")
    ),
    relatedPlanId: v.union(v.id("workoutPlans"), v.null()),
    relatedShareCode: v.union(v.string(), v.null()),
    message: v.string(),
    createdAt: v.string(),
    read: v.boolean(),
    actionTaken: v.boolean()
  }).index("by_userId", ["userId"])
    .index("by_userId_read", ["userId", "read"]),

  // Streaks & Achievements System
  achievements: defineTable({
    userId: v.string(),
    type: v.string(), // "streak_7", "workouts_100", "volume_10000", "prs_50"
    unlockedAt: v.string(), // ISO date
    displayName: v.string(),
    description: v.string(),
    icon: v.string(), // emoji or icon name
    tier: v.union(v.literal("bronze"), v.literal("silver"), v.literal("gold"), v.literal("platinum"))
  }).index("by_userId", ["userId"])
    .index("by_type", ["type"])
    .index("by_userId_type", ["userId", "type"]),

  streakData: defineTable({
    userId: v.string(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastWorkoutDate: v.string(), // ISO date
    streakFreezes: v.number(), // Available freezes (premium gets 1/month)
    lastFreezeUsed: v.union(v.string(), v.null()),
    totalWorkouts: v.number(),
    weeklyWorkouts: v.array(v.boolean()) // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  }).index("by_userId", ["userId"]),

  // User Submitted Plans - Community Plans
  userSubmittedPlans: defineTable({
    userId: v.string(),
    title: v.string(),
    originalText: v.string(), // Original markdown/text submitted
    parsedPlan: v.any(), // Parsed workout plan structure
    athleticGrade: v.union(v.literal("A"), v.literal("B"), v.literal("C"), v.literal("D"), v.literal("F")),
    gradeAnalysis: v.object({
      strengths: v.array(v.string()),
      weaknesses: v.array(v.string()),
      suggestions: v.array(v.string()),
      scoreBreakdown: v.object({
        balance: v.number(), // 0-100
        progression: v.number(),
        recovery: v.number(),
        specificity: v.number(),
        overall: v.number()
      })
    }),
    category: v.string(), // "Strength", "Hypertrophy", "Athletic", etc.
    difficulty: v.union(v.literal("Beginner"), v.literal("Intermediate"), v.literal("Advanced")),
    isPublic: v.boolean(), // Can other users see/copy this plan?
    likes: v.number(),
    copies: v.number(),
    createdAt: v.string(),
    lastUpdated: v.string()
  }).index("by_userId", ["userId"])
    .index("by_isPublic", ["isPublic"])
    .index("by_category", ["category"])
    .index("by_grade", ["athleticGrade"]),

  // Progress Photos - Track physical transformation over time
  progressPhotos: defineTable({
    userId: v.string(),
    photoUrl: v.string(),
    photoType: v.union(v.literal("front"), v.literal("side"), v.literal("back")),
    date: v.string(),
    aiAnalysis: v.optional(v.object({
      bodyFatEstimate: v.number(),
      muscleChanges: v.string(),
      improvements: v.array(v.string()),
      suggestions: v.array(v.string()),
      confidence: v.number()
    })),
    comparedTo: v.union(v.id("progressPhotos"), v.null()),
    createdAt: v.string()
  }).index("by_userId", ["userId"])
    .index("by_userId_date", ["userId", "date"]),
});
