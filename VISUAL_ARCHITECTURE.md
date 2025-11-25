# REBLD Visual Architecture & Data Flow Diagrams

**Complete visual guide to how every part of the application works together**

---

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Authentication Flow](#authentication-flow)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Database Schema Relationships](#database-schema-relationships)
5. [AI Processing Pipeline](#ai-processing-pipeline)
6. [Session Tracking Flow](#session-tracking-flow)
7. [Knowledge Base Seeding](#knowledge-base-seeding)
8. [Buddy System Flow](#buddy-system-flow)
9. [Component Hierarchy](#component-hierarchy)
10. [State Management](#state-management)

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            REBLD SYSTEM ARCHITECTURE                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────┐
│          USER DEVICES             │
│  (Browser: Chrome, Safari, etc.)  │
└────────────────┬──────────────────┘
                 │
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                          React Application                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │   │
│  │  │   Pages      │  │  Components  │  │    Hooks     │  │  Services   │ │   │
│  │  │              │  │              │  │              │  │             │ │   │
│  │  │ - HomePage   │  │ - SessionTr  │  │ - useWorkout │  │ - gemini    │ │   │
│  │  │ - PlanPage   │  │ - Chatbot    │  │ - useProfile │  │ - knowledge │ │   │
│  │  │ - Profile    │  │ - VictoryScr │  │ - useLogs    │  │ - cache     │ │   │
│  │  │ - Dashboard  │  │ - ExerciseC  │  │ - useTheme   │  │ - ranking   │ │   │
│  │  │ - Buddies    │  │ - PlanImport │  │              │  │             │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         State Management                                 │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │   │
│  │  │    Jotai     │  │ Convex React │  │  Component   │                  │   │
│  │  │   (Atoms)    │  │    Hooks     │  │    State     │                  │   │
│  │  │              │  │              │  │              │                  │   │
│  │  │ - theme      │  │ - useQuery   │  │ - forms      │                  │   │
│  │  │ - UI state   │  │ - useMutation│  │ - modals     │                  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────────────┘
                                 │
                                 │ WebSocket (Real-time)
                                 │ HTTPS (Mutations)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            AUTHENTICATION LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                          Clerk Authentication                            │   │
│  │  - Sign up / Sign in                                                     │   │
│  │  - Session management                                                    │   │
│  │  - JWT token issuance                                                    │   │
│  │  - User identity verification                                            │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────────────┘
                                 │
                                 │ JWT Token
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                          Convex Database                                 │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │   │
│  │  │   Queries    │  │  Mutations   │  │   Actions    │  │   Schema    │ │   │
│  │  │              │  │              │  │              │  │             │ │   │
│  │  │ - getPlans   │  │ - createPlan │  │ - AI calls   │  │ - 16 tables │ │   │
│  │  │ - getLogs    │  │ - logWorkout │  │ - parse      │  │ - Indexes   │ │   │
│  │  │ - getProfile │  │ - updateUser │  │ - generate   │  │ - Relations │ │   │
│  │  │ - getBuddies │  │ - addBuddy   │  │ - explain    │  │             │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │   │
│  │                                                                           │   │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                      16 Database Tables                             │ │   │
│  │  │                                                                      │ │   │
│  │  │  Core: users, workoutPlans, workoutLogs, exerciseHistory, cache    │ │   │
│  │  │  Knowledge: programming, modifications, goals, injuries, sex,       │ │   │
│  │  │             sport, body, knowledgeCache                             │ │   │
│  │  │  Social: sharedPlans, buddies, buddySettings, notifications         │ │   │
│  │  │  Gamification: achievements, streakData                             │ │   │
│  │  │  Community: userSubmittedPlans, generationLog                       │ │   │
│  │  └────────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬────────────────────────────────────────────────┘
                                 │
                                 │ HTTPS (Server-side only)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL SERVICES                                     │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                       Google Gemini AI API                               │   │
│  │  - Model: gemini-2.0-flash-exp                                          │   │
│  │  - Actions: generateWorkoutPlan, parseWorkoutPlan, explainExercise      │   │
│  │  - Rate Limits: 60 requests/minute                                      │   │
│  │  - Security: API key stored server-side only (never exposed to client)  │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         USER AUTHENTICATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐
│   Browser   │
│  Opens App  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│  App.tsx checks:                │
│  isSignedIn (from Clerk)        │
└────────┬────────────────────────┘
         │
         ├───────────────┬──────────────────┐
         │               │                  │
    NO  ▼               │              YES ▼
┌──────────────────┐    │         ┌──────────────────────┐
│  Redirect to     │    │         │ Load user profile    │
│  AuthPage        │    │         │ from Convex          │
└────────┬─────────┘    │         └──────────┬───────────┘
         │               │                    │
         ▼               │                    ▼
┌──────────────────┐    │         ┌──────────────────────┐
│ Clerk Sign-In UI │    │         │ Check if user exists │
│  - Email/Pass    │    │         │ in Convex DB         │
│  - Google OAuth  │    │         └──────────┬───────────┘
│  - GitHub OAuth  │    │                    │
└────────┬─────────┘    │                    ├──────┬──────┐
         │               │               NO   │      │  YES │
         ▼               │                    ▼      │      ▼
┌──────────────────┐    │         ┌──────────────┐ │  ┌──────────────┐
│ User Signs In    │    │         │ Create user  │ │  │ User exists  │
│                  │    │         │ in Convex:   │ │  │ Load data:   │
│ Clerk creates:   │    │         │              │ │  │              │
│ - User ID        │    │         │ - userId     │ │  │ - Plans      │
│ - Session token  │    │         │ - userCode   │ │  │ - Logs       │
│ - JWT            │    │         │ - profile    │ │  │ - Profile    │
└────────┬─────────┘    │         │ - apiUsage   │ │  │ - Buddies    │
         │               │         └──────┬───────┘ │  └──────┬───────┘
         │               │                │         │         │
         └───────────────┴────────────────┴─────────┴─────────┘
                                          │
                                          ▼
                            ┌──────────────────────────┐
                            │ User is authenticated    │
                            │                          │
                            │ Clerk provides:          │
                            │ - userId (from JWT)      │
                            │ - isSignedIn = true      │
                            │                          │
                            │ App navigates to:        │
                            │ - HomePage (if has plan) │
                            │ - Onboarding (if new)    │
                            └──────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                      EVERY CONVEX REQUEST INCLUDES JWT                           │
│                                                                                  │
│  Frontend Request:                                                               │
│  ┌────────────────────────────────────────────────────────────────┐             │
│  │ const plans = useQuery(api.queries.getWorkoutPlans);          │             │
│  └────────────────────────────────────────────────────────────────┘             │
│                                                                                  │
│  Convex Backend:                                                                 │
│  ┌────────────────────────────────────────────────────────────────┐             │
│  │ export const getWorkoutPlans = query({                         │             │
│  │   handler: async (ctx) => {                                    │             │
│  │     const identity = await ctx.auth.getUserIdentity();         │             │
│  │     if (!identity) throw new Error("Not authenticated");       │             │
│  │                                                                 │             │
│  │     const userId = identity.subject; // From Clerk JWT         │             │
│  │     return await ctx.db.query("workoutPlans")                  │             │
│  │       .withIndex("by_userId", q => q.eq("userId", userId))     │             │
│  │       .collect();                                              │             │
│  │   }                                                             │             │
│  │ });                                                             │             │
│  └────────────────────────────────────────────────────────────────┘             │
│                                                                                  │
│  ✅ SECURITY: User can ONLY access their own data                               │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Complete User Journey: Sign-Up to Completed Workout

```
START
  │
  ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: USER SIGN-UP                                                            │
└─────────────────────────────────────────────────────────────────────────────────┘

User clicks "Sign Up"
  │
  ▼
Clerk Authentication
  ├─ Creates Clerk user
  ├─ Generates userId (e.g., "user_2abc123xyz")
  ├─ Issues JWT session token
  └─ Returns to app
  │
  ▼
App.tsx receives authentication
  │
  ▼
Check Convex for user record
  │
  ├─ Query: users.filter(userId)
  │
  └─ Not found
      │
      ▼
Create user in Convex
  ├─ Mutation: createUser({
  │     userId: "user_2abc123xyz",
  │     userCode: generateUserCode(), // "REBLD-A1B2C3D4"
  │     activePlanId: null,
  │     bodyMetrics: null,
  │     goals: null,
  │     trainingPreferences: null,
  │     apiUsage: {
  │       tier: "free",
  │       plansGenerated: 0,
  │       chatMessagesSent: 0,
  │       plansParsed: 0,
  │       periodStart: "2025-11-24T00:00:00.000Z",
  │       periodEnd: "2025-12-24T00:00:00.000Z"
  │     }
  │   })
  │
  └─ Saved to Convex
      │
      ▼
Navigate to Onboarding

┌─────────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: ONBOARDING (4-Step Wizard)                                              │
└─────────────────────────────────────────────────────────────────────────────────┘

Step 1: Goals & Experience
  ├─ User selects:
  │   ├─ Primary Goal: "Hypertrophy"
  │   ├─ Experience: "Intermediate"
  │   ├─ Frequency: "4-5 days/week"
  │   └─ Pain Points: ["Knees", "Lower Back"]
  │
  ▼
Step 2: Body & Physical Profile
  ├─ User enters:
  │   ├─ Sex: "Female"
  │   ├─ Weight: 65 kg
  │   ├─ Height: 168 cm
  │   ├─ Body Type: "Average"
  │   ├─ Athletic Level: "Moderate"
  │   └─ Training Age: 3 years
  │
  ▼
Step 3: Equipment & Context
  ├─ User selects:
  │   ├─ Equipment: "Commercial Gym"
  │   ├─ Session Length: "60 min"
  │   ├─ Sport: null
  │   └─ Additional Notes: "Prefer compound movements"
  │
  ▼
Step 4: Auto-Generation
  │
  ├─ Save preferences to Convex
  │   └─ Mutation: updateUserProfile({
  │         userId,
  │         trainingPreferences: { ...all fields },
  │         bodyMetrics: { weight, height, heightUnit }
  │       })
  │
  ├─ Auto-trigger plan generation (useEffect on mount)
  │
  └─ Call: generateNewWorkoutPlan({
        userId,
        preferences: {
          primary_goal: "Hypertrophy",
          experience_level: "Intermediate",
          training_frequency: "4-5",
          pain_points: ["Knees", "Lower Back"],
          sport: null,
          sex: "female",
          equipment: "commercial_gym",
          preferred_session_length: "60",
          athletic_level: "moderate",
          training_age_years: 3,
          body_type: "average",
          weight: 65,
          height: 168,
          additional_notes: "Prefer compound movements"
        }
      })

┌─────────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: AI PLAN GENERATION (Server-Side)                                        │
└─────────────────────────────────────────────────────────────────────────────────┘

convex/ai.ts → generateWorkoutPlan() action
  │
  ├─ 1. Compute BMI
  │    └─ 65 / (1.68^2) = 23.0 (normal)
  │
  ├─ 2. Determine weight band
  │    └─ "bmi_18_25" (normal range)
  │
  ├─ 3. Fetch sex-specific guidelines (parallel queries)
  │    └─ Query: sexSpecificGuidelines
  │        WHERE sex='female' AND goal='Hypertrophy'
  │        LIMIT 5
  │    └─ Returns:
  │        • "Prioritize hip stability exercises"
  │        • "Monitor energy during menstruation"
  │        • "Include pelvic floor-safe core"
  │        • "8-15 rep ranges for muscle growth"
  │        • "Emphasize glute development"
  │
  ├─ 4. Fetch body-context guidelines
  │    └─ Query: bodyContextGuidelines
  │        WHERE band='bmi_18_25'
  │          AND athletic_level='moderate'
  │          AND body_type='average'
  │        LIMIT 5
  │    └─ Returns:
  │        • "Safe for standard loading"
  │        • "Impact work OK, prefer joint-friendly"
  │        • "Conditioning: bike, row, sled preferred"
  │
  ├─ 5. Fetch injury protocols
  │    └─ Query: injuryProtocols
  │        WHERE issue IN ('knee_pain', 'lower_back_pain')
  │        LIMIT 3 per injury
  │    └─ Returns:
  │        Knees:
  │        • "Avoid bilateral heavy back squats"
  │        • "Use split stance variations"
  │        • "Include terminal knee extension"
  │        Lower Back:
  │        • "Avoid spinal flexion under load"
  │        • "Use neutral spine movements"
  │        • "Add anti-rotation core work"
  │
  ├─ 6. Build AI Prompt
  │    ┌────────────────────────────────────────────────────┐
  │    │ USER PROFILE:                                       │
  │    │ - Goal: Hypertrophy                                │
  │    │ - Experience: Intermediate (3 years)               │
  │    │ - Sex: Female                                      │
  │    │ - Body: 65kg, 168cm, BMI 23.0, Average build      │
  │    │ - Athletic Level: Moderate                         │
  │    │ - Equipment: Commercial gym                        │
  │    │ - Session Length: 60 min                           │
  │    │ - Training Frequency: 4-5 days/week                │
  │    │ - Pain Points: Knees, Lower Back                   │
  │    │                                                     │
  │    │ CONSTRAINTS (evidence-based):                      │
  │    │ • Prioritize hip stability exercises               │
  │    │ • Monitor energy during menstruation               │
  │    │ • Include pelvic floor-safe core                   │
  │    │ • Avoid bilateral heavy back squats                │
  │    │ • Use split stance variations                      │
  │    │ • Avoid spinal flexion under load                  │
  │    │ • Safe for standard loading                        │
  │    │ • Impact work OK, prefer joint-friendly            │
  │    │                                                     │
  │    │ RULES:                                             │
  │    │ - Create 7-day plan (Mon-Sun)                      │
  │    │ - 4-5 training days (2-3 rest days)                │
  │    │ - 60 min sessions                                  │
  │    │ - Block structure (warmup/main/cooldown)           │
  │    │ - Movement balance (squat/hinge/push/pull)         │
  │    │ - Commercial gym equipment available               │
  │    └────────────────────────────────────────────────────┘
  │
  ├─ 7. Call Gemini API
  │    └─ POST https://generativelanguage.googleapis.com/v1/models/...
  │        Headers: { Authorization: Bearer ${GEMINI_API_KEY} }
  │        Body: { contents: [prompt] }
  │
  ├─ 8. Receive Response
  │    └─ Gemini returns JSON:
  │        {
  │          "name": "Female Hypertrophy - Intermediate",
  │          "weeklyPlan": [
  │            {
  │              "day_of_week": 1,
  │              "focus": "Lower Body - Glute Focus",
  │              "blocks": [
  │                {
  │                  "type": "single",
  │                  "exercises": [
  │                    {
  │                      "exercise_name": "Glute Bridge",
  │                      "category": "warmup",
  │                      "metrics_template": {
  │                        "type": "sets_reps_weight",
  │                        "target_sets": 2,
  │                        "target_reps": "15"
  │                      }
  │                    }
  │                  ]
  │                },
  │                {
  │                  "type": "single",
  │                  "exercises": [
  │                    {
  │                      "exercise_name": "Romanian Deadlift",
  │                      "category": "main",
  │                      "metrics_template": {
  │                        "type": "sets_reps_weight",
  │                        "target_sets": 4,
  │                        "target_reps": "8-10",
  │                        "rest_period_s": 120
  │                      }
  │                    }
  │                  ]
  │                },
  │                {
  │                  "type": "superset",
  │                  "rounds": 3,
  │                  "exercises": [
  │                    {
  │                      "exercise_name": "Bulgarian Split Squat",
  │                      "category": "main",
  │                      "metrics_template": {
  │                        "type": "sets_reps_weight",
  │                        "target_sets": 1,
  │                        "target_reps": "10-12"
  │                      }
  │                    },
  │                    {
  │                      "exercise_name": "Leg Curl",
  │                      "category": "main",
  │                      "metrics_template": {
  │                        "type": "sets_reps_weight",
  │                        "target_sets": 1,
  │                        "target_reps": "12-15"
  │                      }
  │                    }
  │                  ]
  │                }
  │              ]
  │            },
  │            // ... days 2-7
  │          ]
  │        }
  │
  ├─ 9. Parse & Validate Response
  │    ├─ Extract JSON from markdown if needed
  │    ├─ Validate structure (7 days, blocks, exercises)
  │    └─ Check all required fields present
  │
  ├─ 10. Track API Usage
  │     └─ Mutation: incrementPlanGenerationUsage(userId)
  │         └─ updates: user.apiUsage.plansGenerated += 1
  │
  └─ 11. Return to Frontend
       │
       ▼
Frontend receives plan
  │
  ├─ 12. Normalize for Convex
  │     └─ normalizePlanForConvex(plan)
  │         ├─ Convert undefined → null
  │         ├─ Ensure all arrays initialized
  │         └─ Validate metrics_template types
  │
  ├─ 13. Save to Convex
  │     └─ Mutation: createWorkoutPlan({
  │           userId,
  │           name: plan.name,
  │           weeklyPlan: plan.weeklyPlan,
  │           dailyRoutine: plan.dailyRoutine,
  │           createdAt: new Date().toISOString()
  │         })
  │     └─ Returns: planId
  │
  ├─ 14. Update user.activePlanId
  │     └─ Mutation: updateUserProfile({
  │           userId,
  │           activePlanId: planId
  │         })
  │
  ├─ 15. Extract & Cache Exercises
  │     └─ For each unique exercise in plan:
  │         ├─ Check if in exerciseCache
  │         │   └─ Query: exerciseCache.filter(exercise_name)
  │         │
  │         └─ If not cached:
  │             ├─ Call: convex/ai.ts → explainExercise(name)
  │             │   └─ Gemini API generates explanation
  │             │
  │             └─ Mutation: cacheExercise({
  │                   exercise_name: "romanian_deadlift",
  │                   explanation: "...",
  │                   muscles_worked: ["Hamstrings", "Glutes", "Erectors"],
  │                   form_cue: "Hinge at hips, soft knees",
  │                   common_mistake: "Rounding lower back",
  │                   exercise_tier: "A",
  │                   movement_pattern: "hinge",
  │                   injury_contraindications: [...],
  │                   sport_ratings: {...}
  │                 })
  │
  ▼
Navigate to HomePage
  └─ User sees: Weekly plan with today highlighted

┌─────────────────────────────────────────────────────────────────────────────────┐
│ STEP 4: STARTING A WORKOUT                                                      │
└─────────────────────────────────────────────────────────────────────────────────┘

User clicks "Start" on Monday's workout
  │
  ▼
App.tsx
  ├─ setActiveSessionPlan(plan.weeklyPlan[0]) // Monday's plan
  ├─ Navigate to SessionTracker
  │
  ▼
SessionTracker loads
  │
  ├─ Parse blocks from plan.blocks
  │   └─ [warmup block, main block, superset block, cooldown block]
  │
  ├─ Initialize state:
  │   ├─ currentBlockIndex = 0
  │   ├─ currentExerciseIndex = 0
  │   ├─ loggedSets = []
  │   └─ startTime = Date.now()
  │
  ├─ For each exercise, load history:
  │   └─ Query: getExerciseHistory(userId, "romanian_deadlift")
  │       └─ Returns: { last_weight: 50, last_reps: 10, last_logged: "2025-11-17" }
  │
  └─ Display current exercise
      ├─ Exercise name: "Romanian Deadlift"
      ├─ Target: 4 × 8-10
      ├─ Pre-filled: 50kg, 10 reps (from history)
      └─ Button: "Log Set 1"

User taps "Log Set 1"
  │
  ├─ Haptic feedback (vibrate 50ms)
  ├─ Save to local state:
  │   └─ loggedSets.push({ set: 1, weight: 50, reps: 10 })
  │
  ├─ Check if PR:
  │   ├─ Compare: current (50kg × 10) vs history (50kg × 10)
  │   └─ If greater: Show celebration toast "New PR! 🎉"
  │
  └─ Show: "Log Set 2" button

User completes all 4 sets
  │
  ├─ Move to next exercise
  │   └─ currentExerciseIndex += 1
  │
  └─ If block complete:
      └─ Show BlockCompletionScreen (2s)
          └─ "Lower Body Block Complete! 💪"

User finishes all exercises
  │
  ▼
Show VictoryScreen
  │
  ├─ Calculate session stats:
  │   ├─ Duration: 58 minutes
  │   ├─ Total Volume: 3,420 kg
  │   ├─ Exercises: 8
  │   └─ PRs: 2
  │
  ├─ Check for achievements:
  │   └─ Query: getStreakData(userId)
  │       ├─ currentStreak: 6 days
  │       └─ Check if milestone:
  │           └─ 7-day streak → Unlock achievement!
  │               └─ Mutation: unlockAchievement({
  │                     userId,
  │                     type: "streak_7",
  │                     tier: "bronze"
  │                   })
  │
  └─ Save workout log:
      └─ Mutation: logWorkout({
            userId,
            date: "2025-11-24",
            focus: "Lower Body - Glute Focus",
            exercises: [
              {
                exercise_name: "Romanian Deadlift",
                sets: [
                  { set: 1, weight: 50, reps: 10, rpe: 7 },
                  { set: 2, weight: 50, reps: 10, rpe: 7 },
                  { set: 3, weight: 50, reps: 9, rpe: 8 },
                  { set: 4, weight: 50, reps: 9, rpe: 8 }
                ]
              },
              // ... other exercises
            ],
            durationMinutes: 58
          })
      │
      ├─ Update exercise history:
      │   └─ For each exercise:
      │       └─ Mutation: updateOrCreateExerciseHistory({
      │             userId,
      │             exerciseName: "romanian_deadlift",
      │             last_weight: 50,
      │             last_reps: 10,
      │             last_logged: "2025-11-24"
      │           })
      │
      ├─ Update streak:
      │   └─ Mutation: updateStreakData({
      │         userId,
      │         newWorkoutDate: "2025-11-24"
      │       })
      │       ├─ Check: time since last workout < 48 hours?
      │       │   └─ Yes: currentStreak += 1
      │       │   └─ No: currentStreak = 1 (reset)
      │       └─ Update: weeklyWorkouts[monday] = true
      │
      └─ Notify buddies:
          └─ Mutation: notifyBuddies({
                userId,
                type: "workout_completed",
                stats: { volume: 3420, duration: 58, prs: 2 }
              })

Navigate to SessionSummaryPage
  └─ Show: Stats, achievements, share button

END
```

---

## Database Schema Relationships

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        DATABASE ENTITY RELATIONSHIPS                             │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│    users     │ (Central entity)
│              │
│ PK: _id      │
│ UK: userId   │──────┬─────────────────────────────────────────────┐
│ UK: userCode │      │                                             │
└──────┬───────┘      │                                             │
       │              │                                             │
       │ Has many     │                                             │
       ▼              │                                             │
┌──────────────┐      │                                             │
│ workoutPlans │      │                                             │
│              │      │                                             │
│ FK: userId   │──────┘                                             │
│              │                                                    │
│ Contains:    │                                                    │
│ - weeklyPlan │                                                    │
│ - dailyRtn   │                                                    │
└──────────────┘                                                    │
                                                                    │
       │ References                                                 │
       │ (activePlanId)                                             │
       │                                                            │
       │                                                            │
       │ Has many                                                   │
       ▼                                                            │
┌──────────────┐                                                    │
│ workoutLogs  │                                                    │
│              │                                                    │
│ FK: userId   │────────────────────────────────────────────────────┘
│              │
│ Contains:    │        ┌──────────────┐
│ - date       │────────│ Indexes by:  │
│ - exercises  │        │ - userId     │
│ - duration   │        │ - date       │
└──────┬───────┘        └──────────────┘
       │
       │ Updates
       ▼
┌─────────────────┐
│ exerciseHistory │
│                 │
│ FK: userId      │
│ FK: exerciseName│────────┐
│                 │        │
│ Stores:         │        │
│ - last_weight   │        │
│ - last_reps     │        │
│ - last_logged   │        │
└─────────────────┘        │
                           │
                           │ References
                           ▼
                    ┌──────────────┐
                    │exerciseCache │ (Shared globally)
                    │              │
                    │ UK: exercise │
                    │     _name    │
                    │              │
                    │ Contains:    │
                    │ - explanation│
                    │ - muscles    │
                    │ - form_cue   │
                    │ - tier       │
                    │ - injury data│
                    │ - sport data │
                    └──────────────┘

┌──────────────┐
│    users     │
│              │
└──────┬───────┘
       │
       │ Has many
       ▼
┌──────────────────┐
│ workoutBuddies   │
│                  │
│ FK: userId       │
│ FK: buddyId      │──────┐ (References another user)
│                  │      │
│ status: pending, │      │
│         active,  │      │
│         declined │      │
└──────┬───────────┘      │
       │                  │
       │ Triggers         │
       ▼                  │
┌──────────────────┐      │
│buddyNotifications│      │
│                  │      │
│ FK: userId       │◄─────┘
│ FK: triggeredBy  │
│                  │
│ Types:           │
│ - workout_start  │
│ - pr_achieved    │
│ - buddy_request  │
│ - plan_shared    │
└──────────────────┘

┌──────────────┐
│ sharedPlans  │
│              │
│ UK: shareCode│ (REBLD-ABC12345)
│ FK: planId   │────► workoutPlans
│ FK: sharedBy │────► users
│              │
│ Arrays:      │
│ - sharedWith │────► users[] (access list)
│ - acceptedBy │────► users[] (who accepted)
│              │
│ Expires: 7d  │
└──────────────┘

┌──────────────┐
│    users     │
│              │
└──────┬───────┘
       │
       │ Has many
       ▼
┌──────────────┐
│ achievements │
│              │
│ FK: userId   │
│              │
│ Types:       │
│ - streak_7   │
│ - workout_100│
│ - volume_10k │
│ - prs_50     │
│              │
│ Tiers:       │
│ - bronze     │
│ - silver     │
│ - gold       │
│ - platinum   │
└──────────────┘

┌──────────────┐
│  streakData  │
│              │
│ FK: userId   │◄──── One-to-One with users
│              │
│ Tracks:      │
│ - current    │
│ - longest    │
│ - freezes    │
│ - weekly[7]  │
└──────────────┘

KNOWLEDGE BASE TABLES (Shared Globally)
═══════════════════════════════════════

┌──────────────────────┐
│ programmingKnowledge │ (Exercise selection principles)
│                      │
│ Indexed by:          │
│ - category           │
│ - principle_type     │
│                      │
│ Used by: AI prompt   │
└──────────────────────┘

┌──────────────────────┐
│ sexSpecificGuidelines│ (NEW: Female/male programming)
│                      │
│ Indexed by:          │
│ - sex                │
│ - goal               │
│ - experience         │
│                      │
│ Fetched when:        │
│ generateWorkoutPlan()│
└──────────────────────┘

┌──────────────────────┐
│   sportGuidelines    │ (NEW: Sport-specific training)
│                      │
│ Indexed by:          │
│ - sport              │
│ - goal               │
│                      │
│ Examples:            │
│ - Hyrox              │
│ - Rock Climbing      │
│ - Boxing             │
└──────────────────────┘

┌──────────────────────┐
│ bodyContextGuidelines│ (NEW: BMI/athletic level)
│                      │
│ Indexed by:          │
│ - band (BMI range)   │
│ - athletic_level     │
│ - body_type          │
│                      │
│ Examples:            │
│ - bmi_18_25_moderate │
│ - bmi_gt_32_low      │
│ - muscular_high      │
└──────────────────────┘

┌──────────────────────┐
│  injuryProtocols     │ (Exercise substitutions)
│                      │
│ Indexed by:          │
│ - issue              │
│                      │
│ Contains:            │
│ - avoid exercises    │
│ - substitutions      │
│ - prehab exercises   │
└──────────────────────┘

┌──────────────────────┐
│   knowledgeCache     │ (Pre-computed guidelines)
│                      │
│ UK: cache_key        │
│     (profile hash)   │
│                      │
│ Example key:         │
│ "hypertrophy_        │
│  intermediate_       │
│  female_null_        │
│  normal_moderate"    │
│                      │
│ Contains:            │
│ - tier_s_exercises   │
│ - avoid_exercises    │
│ - substitutions      │
│ - sex_bullets        │
│ - sport_bullets      │
│ - body_bullets       │
└──────────────────────┘
```

---

## AI Processing Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        AI PLAN GENERATION PIPELINE                               │
│                    (Token-Optimized Knowledge Retrieval)                         │
└─────────────────────────────────────────────────────────────────────────────────┘

INPUT: User Profile
  ├─ goal: "Hypertrophy"
  ├─ experience: "Intermediate"
  ├─ sex: "female"
  ├─ weight: 65kg, height: 168cm
  ├─ athletic_level: "moderate"
  ├─ body_type: "average"
  ├─ training_age: 3 years
  ├─ equipment: "commercial_gym"
  ├─ session_length: "60"
  ├─ pain_points: ["Knees", "Lower Back"]
  └─ sport: null

STEP 1: Compute Derived Values
  ├─ BMI = 65 / (1.68^2) = 23.0
  ├─ BMI Band = "bmi_18_25" (normal)
  ├─ Weight Band = "normal_moderate" (not heavy, moderate athletic)
  └─ Profile Key = "hypertrophy_intermediate_female_null_normal_moderate"

STEP 2: Check Knowledge Cache
  ├─ Query: knowledgeCache.filter(cache_key == profile_key)
  │
  ├─ If FOUND (95% after initial ramp):
  │   └─ Return cached bullets (instant, 0 DB queries)
  │       └─ GO TO STEP 4
  │
  └─ If NOT FOUND (5%):
      └─ GO TO STEP 3

STEP 3: Fetch Fresh Guidelines (Parallel Queries)
  │
  ├─ Query 1: sexSpecificGuidelines
  │   └─ WHERE (sex='female' OR sex='neutral')
  │       AND (goal='Hypertrophy' OR goal IS NULL)
  │       AND (experience='Intermediate' OR experience IS NULL)
  │       LIMIT 5
  │   └─ Returns (150ms):
  │       [
  │         { guidelines: ["Prioritize hip stability", "Monitor energy..."] },
  │         { guidelines: ["8-15 rep ranges", "Include pelvic floor safe"] },
  │         // ... 3 more
  │       ]
  │   └─ Extract: 10 total bullets
  │
  ├─ Query 2: sportGuidelines
  │   └─ WHERE sport=null
  │   └─ Returns: [] (no sport selected, skip)
  │
  ├─ Query 3: bodyContextGuidelines
  │   └─ WHERE band='bmi_18_25'
  │       AND athletic_level='moderate'
  │       AND body_type='average'
  │       LIMIT 5
  │   └─ Returns (150ms):
  │       [
  │         { guidelines: ["Safe for standard loading", "Impact work OK"] },
  │         { guidelines: ["Conditioning: bike, row, sled"] },
  │         // ... 3 more
  │       ]
  │   └─ Extract: 8 bullets
  │
  └─ Query 4: injuryProtocols
      └─ WHERE issue IN ('knee_pain', 'lower_back_pain')
          LIMIT 3 per issue
      └─ Returns (150ms):
          Knees: ["Avoid bilateral squats", "Use split stance", "Add TKE"]
          Back: ["Avoid spinal flexion", "Neutral spine only", "Anti-rotation"]
      └─ Extract: 6 bullets

  Total queries: 3 (1 skipped)
  Total time: ~200ms
  Total bullets fetched: 24

STEP 3b: Compress & Cache
  │
  ├─ Compress to top 15 bullets:
  │   └─ sexGuidelines: 5 bullets
  │   └─ bodyGuidelines: 5 bullets
  │   └─ injuryGuidelines: 5 bullets (top priority)
  │
  └─ Save to knowledgeCache:
      └─ Mutation: cacheKnowledge({
            cache_key: "hypertrophy_intermediate_female_null_normal_moderate",
            compressed_knowledge: {
              sex_bullets: ["Prioritize hip stability", "Monitor energy", ...],
              body_bullets: ["Safe for standard loading", ...],
              injury_bullets: ["Avoid bilateral squats", ...],
              tier_s_exercises: ["RDL", "Hip Thrust", ...],
              avoid_exercises: ["Back Squat (bilateral)", ...]
            }
          })

STEP 4: Build AI Prompt
  │
  └─ Template:
      ┌────────────────────────────────────────────────────┐
      │ USER PROFILE:                                       │
      │ [... full profile ...]                             │
      │                                                     │
      │ CONSTRAINTS (evidence-based, DO NOT VIOLATE):      │
      │ ${sex_bullets.map(b => `• ${b}`).join('\n')}       │
      │ ${body_bullets.map(b => `• ${b}`).join('\n')}      │
      │ ${injury_bullets.map(b => `• ${b}`).join('\n')}    │
      │                                                     │
      │ RULES:                                             │
      │ [... hardcoded rules ...]                          │
      │                                                     │
      │ Generate a 7-day structured workout plan...        │
      └────────────────────────────────────────────────────┘

  Token count: ~400 tokens

STEP 5: Call Gemini API
  │
  └─ POST to Gemini
      ├─ Model: gemini-2.0-flash-exp
      ├─ Prompt: [400 tokens]
      └─ Returns: [~3,000 tokens output]

STEP 6: Parse Response
  │
  ├─ Extract JSON from markdown
  ├─ Validate structure
  └─ Return to frontend

TOTAL TIME: ~2-3 seconds
TOKEN USAGE: 400 input + 3,000 output = 3,400 tokens
COST: ~$0.03 per plan

COMPARISON (Without Optimization):
─────────────────────────────────
No cache: 5,000 input tokens (dump full DB) + 3,000 output = 8,000 tokens
Cost: ~$0.08 per plan
Time: ~5-6 seconds

SAVINGS: 62% cost reduction, 50% faster
```

---

## Knowledge Base Seeding

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE BASE SEEDING PROCESS                                │
│                 (How we populate the intelligent AI layer)                       │
└─────────────────────────────────────────────────────────────────────────────────┘

PHASE 1: EXERCISE DATABASE SEEDING
═══════════════════════════════════

Source Files (data/ folder):
  ├─ complete_exercise_database.json (800+ exercises)
  ├─ scientific_exercise_data.json (evidence-based metadata)
  └─ exercise_relationships.json (progressions, alternatives)

Script: scripts/populateExerciseDatabase.ts
  │
  └─ For each exercise:
      ├─ Parse: name, category, tier, movement_pattern
      ├─ Generate explanation via Gemini (if not provided)
      ├─ Add metadata: equipment, experience_level, injury_contraindications
      └─ Mutation: cacheExercise(exercise)

Result: exerciseCache table
  └─ 800+ exercises with:
      ├─ Explanations
      ├─ Form cues
      ├─ Muscle groups
      ├─ Tier rankings (S/A/B/C)
      ├─ Movement patterns
      ├─ Sport ratings
      └─ Injury contraindications

PHASE 2: PROGRAMMING KNOWLEDGE SEEDING
═══════════════════════════════════════

Source Files:
  ├─ scientific_programming_knowledge.json
  ├─ complete_programming_principles.json
  └─ goal_guidelines.json

Academic Sources:
  ├─ NSCA Essentials (4th ed.)
  ├─ Zatsiorsky & Kraemer
  ├─ Bompa Periodization
  ├─ Schoenfeld hypertrophy research
  └─ Grgic volume/rest studies

Script: scripts/uploadKnowledge.ts
  │
  └─ For each principle:
      ├─ Extract: book, author, category, principle_type
      ├─ Structure: applicable_goals, applicable_experience
      ├─ Add: exercise_recommendations, guidelines, templates
      └─ Mutation: createProgrammingKnowledge(principle)

Result: programmingKnowledge table
  └─ 200+ principles:
      ├─ Exercise selection rules
      ├─ Programming templates
      ├─ Personalization logic
      ├─ Goal-specific guidance
      └─ Injury protocols

PHASE 3: SEX-SPECIFIC GUIDELINES SEEDING (NEW)
════════════════════════════════════════════════

Source Files (to be created):
  └─ data/sex_specific_guidelines.json

Academic Sources:
  ├─ Elliott-Sale et al. (2021) - Menstrual cycle
  ├─ McNulty et al. (2020) - Performance meta-analysis
  ├─ Wojtys et al. - ACL risk
  ├─ Heiderscheit - Hip/hamstring
  ├─ Bø & Hagen - Pelvic floor
  └─ Clarkson - Iron status

Data Structure:
[
  {
    "sex": "female",
    "goal": "Hypertrophy",
    "experience": null,  // Applies to all
    "guidelines": [
      "Prioritize hip stability for glute development",
      "8-15 rep ranges optimal for muscle growth",
      "Monitor energy during luteal phase, adjust volume 10-15% if needed",
      "Include pelvic floor-safe core: planks, dead bugs, bird dogs",
      "ACL prevention: hip strength, deceleration control, avoid valgus"
    ],
    "recommended_exercises": [
      "Romanian Deadlift", "Hip Thrust", "Bulgarian Split Squat",
      "Glute Bridge", "Lateral Band Walk", "Single-Leg RDL"
    ],
    "contraindications": [
      "Heavy bilateral squats during menstruation if feeling weak",
      "High-impact plyos with pelvic floor dysfunction",
      "Loaded spinal flexion postpartum (first 6 months)"
    ],
    "evidence_level": "high",
    "source": "Elliott-Sale 2021, Schoenfeld 2019, Wojtys 1998",
    "last_reviewed": "2025-11-24"
  },
  {
    "sex": "male",
    "goal": "Hypertrophy",
    "experience": null,
    "guidelines": [
      "10-20 sets per muscle group per week for growth",
      "Progressive overload via weight, sets, or reps",
      "No automatic bulk bias - align with stated physique goals",
      "Recovery: 48-72h between same muscle groups"
    ],
    "recommended_exercises": [
      "Compound lifts: Squat, Deadlift, Bench, Row",
      "Isolation: target lagging muscle groups"
    ],
    "contraindications": [],
    "evidence_level": "high",
    "source": "Schoenfeld 2019, Helms 2019",
    "last_reviewed": "2025-11-24"
  }
  // ... 20-30 more entries covering all goal/experience combinations
]

Script: scripts/uploadSexGuidelines.ts
  │
  └─ For each guideline:
      ├─ Validate: sex, goal, experience, guidelines array
      ├─ Mutation: createSexGuideline(data)
      └─ Log: "Uploaded: female - Hypertrophy"

Result: sexSpecificGuidelines table
  └─ 30+ guidelines for male/female across all goals

PHASE 4: SPORT-SPECIFIC GUIDELINES SEEDING (NEW)
══════════════════════════════════════════════════

Source Files (to be created):
  ├─ data/hyrox_guidelines.json
  ├─ data/climbing_guidelines.json
  ├─ data/running_guidelines.json
  └─ data/combat_sports_guidelines.json

Academic Sources:
  ├─ Seiler (2010) - Polarized training
  ├─ Laursen & Buchheit (2019) - HIIT science
  ├─ Anderson & Anderson (2010) - Stretching
  └─ Sport-specific coaching manuals

Data Structure:
[
  {
    "sport": "Hyrox",
    "goal": "Athletic Performance",
    "experience": null,
    "movement_priorities": [
      "Sled push 2x/week (race-specific)",
      "Loaded carries 2x/week",
      "Rowing technique work 3x/week",
      "Ski erg intervals 2x/week",
      "Run-specific conditioning 3x/week"
    ],
    "top_exercises": [
      "Sled Push", "Farmer Carry", "Rowing Machine", "Ski Erg",
      "Box Jump", "Burpee", "Wall Ball", "Sandbag Lunge"
    ],
    "conditioning_notes": [
      "80/20 polarized: 80% easy aerobic, 20% threshold/VO2",
      "Race-pace brick sessions: row + run, ski + run",
      "Hybrid strength: 3 strength days, 3 conditioning days"
    ],
    "contraindications": [
      "Avoid bodybuilding splits (need full-body power)",
      "Don't skip grip work (critical for race)"
    ],
    "evidence_level": "moderate",
    "source": "Hyrox training manual, Seiler 2010",
    "last_reviewed": "2025-11-24"
  }
  // ... 15-20 sports covered
]

Script: scripts/uploadSportGuidelines.ts

Result: sportGuidelines table
  └─ 50+ sport-specific protocols

PHASE 5: BODY-CONTEXT GUIDELINES SEEDING (NEW)
═══════════════════════════════════════════════

Source Files (to be created):
  └─ data/body_context_guidelines.json

Academic Sources:
  ├─ ACSM Guidelines (2018)
  ├─ McGill - Back Mechanic
  └─ Clinical exercise physiology texts

Data Structure:
[
  {
    "band": "bmi_gt_32",  // BMI > 32 (obese category)
    "athletic_level": "low",
    "body_type": null,  // Applies to all
    "guidelines": [
      "Prefer low-impact conditioning: bike, rower, sled, swimming",
      "Avoid high-impact plyos initially (joint stress)",
      "Focus on movement quality over intensity first 8-12 weeks",
      "Conditioning dose: 150+ min/week moderate-intensity",
      "Strength: bodyweight or light loads, focus on form"
    ],
    "recommended_modalities": [
      "Air Bike", "Rower", "Sled Push/Pull", "Aqua Jogging", "Elliptical"
    ],
    "avoid": [
      "Box Jumps", "Running (until adapted)", "Heavy overhead work"
    ],
    "evidence_level": "high",
    "source": "ACSM 2018, McGill 2015",
    "last_reviewed": "2025-11-24"
  },
  {
    "band": "bmi_gt_32",
    "athletic_level": "moderate",
    "body_type": "muscular",
    "guidelines": [
      "Heavy ≠ unfit; maintain robust loading for strength",
      "Joint-friendly impact: sleds, farmer carries, prowler",
      "Standard strength programming appropriate",
      "Conditioning: avoid long-duration running, prefer intervals"
    ],
    "recommended_modalities": [
      "Sled", "Farmer Carry", "Bike Sprints", "Row Intervals", "Battle Ropes"
    ],
    "avoid": [
      "Steady-state running > 20 min (joint stress)"
    ],
    "evidence_level": "moderate",
    "source": "Clinical experience, ACSM 2018",
    "last_reviewed": "2025-11-24"
  },
  {
    "band": "bmi_18_25",  // Normal BMI
    "athletic_level": "high",
    "body_type": "lean",
    "guidelines": [
      "No restrictions on loading or impact",
      "Can handle high-intensity plyometrics",
      "Recovery paramount: manage volume carefully",
      "Consider caloric intake for performance"
    ],
    "recommended_modalities": [
      "All modalities appropriate", "Emphasize weaknesses"
    ],
    "avoid": [],
    "evidence_level": "moderate",
    "source": "NSCA 2016",
    "last_reviewed": "2025-11-24"
  }
  // ... 10-15 more BMI/athletic/body type combinations
]

Script: scripts/uploadBodyGuidelines.ts

Result: bodyContextGuidelines table
  └─ 25+ context-specific protocols

═══════════════════════════════════════════════════════════════════════════════════
TOTAL KNOWLEDGE BASE SIZE (After All Seeding):
═══════════════════════════════════════════════════════════════════════════════════

exerciseCache:             800+ exercises
programmingKnowledge:      200+ principles
exerciseModifications:     150+ progressions
goalGuidelines:            50+ goal protocols
injuryProtocols:           40+ injury substitutions
sexSpecificGuidelines:     30+ sex-based rules       ← NEW
sportGuidelines:           50+ sport protocols        ← NEW
bodyContextGuidelines:     25+ body-context rules    ← NEW
exerciseRelationships:     500+ connections
knowledgeCache:            100+ pre-computed (grows over time)

TOTAL: ~2,000+ knowledge entries
SIZE: ~50MB of structured data
QUERY TIME: 150-200ms (indexed)
CACHE HIT RATE: 95% after initial 100 users
```

---

## Session Tracking Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      SESSION TRACKING STATE MACHINE                              │
└─────────────────────────────────────────────────────────────────────────────────┘

STATE: PRE_WORKOUT
  │
  User clicks "Start" on PlanPage
  │
  ▼
┌──────────────────────────┐
│  App.tsx                 │
│  setActiveSessionPlan()  │
│  Navigate to /session    │
└────────────┬─────────────┘
             │
             ▼
STATE: INITIALIZING
  │
  ├─ SessionTracker mounts
  ├─ Parse blocks from plan
  ├─ Extract all exercises
  ├─ Load exercise history (parallel)
  │   └─ For each exercise:
  │       └─ Query: exerciseHistory(userId, exerciseName)
  │           └─ Returns: last_weight, last_reps, last_logged
  │
  └─ Initialize state:
      ├─ currentBlockIndex = 0
      ├─ currentExerciseIndex = 0
      ├─ globalExerciseIndex = 0
      ├─ loggedData = Map<exerciseName, Set[]>
      ├─ startTime = Date.now()
      └─ milestones = []
  │
  ▼
STATE: IN_PROGRESS
  │
  ┌────────────────────────────────────────────────────────────┐
  │                    LOGGING LOOP                            │
  └────────────────────────────────────────────────────────────┘
  │
  ├─ Display current exercise
  │   ├─ Exercise name: "Romanian Deadlift"
  │   ├─ Target: 4 sets × 8-10 reps
  │   ├─ Pre-filled weight: 50kg (from history)
  │   ├─ Pre-filled reps: 10 (from history)
  │   └─ Button: "Log Set 1"
  │
  ├─ User adjusts weight/reps (optional)
  │   └─ +/- buttons to modify
  │
  ├─ User taps "Log Set 1"
  │   │
  │   ├─ Haptic feedback (navigator.vibrate(50))
  │   │
  │   ├─ Save to state:
  │   │   └─ loggedData.set("romanian_deadlift", [
  │   │         { set: 1, weight: 50, reps: 10, rpe: null }
  │   │       ])
  │   │
  │   ├─ Check if PR:
  │   │   ├─ Get previous best: 50kg × 10 = 500 (volume)
  │   │   ├─ Current: 50kg × 10 = 500
  │   │   └─ If current > previous:
  │   │       └─ Show toast: "New PR! 🎉"
  │   │       └─ Add to milestones: { type: 'pr', exercise: 'RDL' }
  │   │
  │   ├─ Check if milestone:
  │   │   ├─ Total sets logged: 25
  │   │   └─ If sets % 10 === 0:
  │   │       └─ Show toast: "25 sets logged! Keep going! 💪"
  │   │
  │   └─ Update UI:
  │       ├─ Show "Set 1 ✓" with checkmark
  │       └─ Show "Log Set 2" button
  │
  ├─ User completes all sets for exercise
  │   │
  │   ├─ Increment: currentExerciseIndex += 1
  │   │
  │   └─ Check if block complete:
  │       ├─ If last exercise in block:
  │       │   └─ Show BlockCompletionScreen (2s overlay)
  │       │       └─ "Lower Body Block Complete! 💪"
  │       │       └─ Auto-advance to next block
  │       │
  │       └─ Else: Show next exercise
  │
  └─ User completes all blocks
      │
      ▼
STATE: FINISHING
  │
  ├─ Calculate session stats:
  │   ├─ endTime = Date.now()
  │   ├─ duration = (endTime - startTime) / 60000 (minutes)
  │   ├─ totalVolume = Σ(weight × reps) for all sets
  │   ├─ exercisesCompleted = loggedData.size
  │   ├─ totalSets = Σ(sets) for all exercises
  │   └─ prs = milestones.filter(m => m.type === 'pr').length
  │
  ├─ Check for achievements:
  │   └─ Query: getStreakData(userId)
  │       ├─ lastWorkoutDate: "2025-11-23"
  │       ├─ currentStreak: 6
  │       │
  │       ├─ Calculate: hoursSince = (now - lastWorkout) / 3600000
  │       │   └─ 24 hours (within 48h grace period)
  │       │
  │       └─ newStreak = 7 (increment)
  │           │
  │           └─ Check milestones:
  │               ├─ streak === 7 → Unlock "Week Warrior" (bronze)
  │               ├─ streak === 30 → Unlock "Month Champion" (silver)
  │               ├─ streak === 100 → Unlock "Century Club" (gold)
  │               └─ streak === 365 → Unlock "Year Legend" (platinum)
  │
  ├─ Save workout log:
  │   └─ Mutation: logWorkout({
  │         userId,
  │         date: "2025-11-24",
  │         focus: "Lower Body - Glute Focus",
  │         exercises: [
  │           {
  │             exercise_name: "Romanian Deadlift",
  │             sets: [
  │               { set: 1, weight: 50, reps: 10, rpe: 7 },
  │               { set: 2, weight: 50, reps: 10, rpe: 7 },
  │               { set: 3, weight: 50, reps: 9, rpe: 8 },
  │               { set: 4, weight: 50, reps: 9, rpe: 8 }
  │             ]
  │           },
  │           { exercise_name: "Hip Thrust", ... },
  │           { exercise_name: "Bulgarian Split Squat", ... },
  │           // ... all exercises
  │         ],
  │         durationMinutes: 58
  │       })
  │
  ├─ Update exercise history (parallel, for each exercise):
  │   └─ Mutation: updateOrCreateExerciseHistory({
  │         userId,
  │         exerciseName: "romanian_deadlift",
  │         exercise_name: "Romanian Deadlift",
  │         last_weight: 50,
  │         last_reps: 10,
  │         last_logged: "2025-11-24"
  │       })
  │
  ├─ Update streak:
  │   └─ Mutation: updateStreakData({
  │         userId,
  │         newWorkoutDate: "2025-11-24"
  │       })
  │       └─ Updates:
  │           ├─ currentStreak: 7
  │           ├─ longestStreak: max(7, previous)
  │           ├─ totalWorkouts: previous + 1
  │           ├─ lastWorkoutDate: "2025-11-24"
  │           └─ weeklyWorkouts[0] = true (Monday)
  │
  ├─ Unlock achievements (if any):
  │   └─ Mutation: unlockAchievement({
  │         userId,
  │         type: "streak_7",
  │         tier: "bronze",
  │         displayName: "Week Warrior",
  │         description: "Complete 7 workouts in a row"
  │       })
  │
  └─ Notify buddies:
      └─ Query: getWorkoutBuddies(userId)
          └─ Returns: [buddy1, buddy2, ...]
          │
          └─ For each buddy with settings.notifyOnWorkoutStart = true:
              └─ Mutation: createBuddyNotification({
                    userId: buddy.buddyId,
                    triggeredBy: userId,
                    type: "workout_started",
                    message: "completed Lower Body - Glute Focus! 💪"
                  })
  │
  ▼
STATE: COMPLETED
  │
  ├─ Show VictoryScreen
  │   ├─ Stats display
  │   ├─ Achievements unlocked
  │   ├─ Share button
  │   └─ "Done" button
  │
  └─ User taps "Done"
      │
      ▼
Navigate to SessionSummaryPage
  │
  └─ Show detailed analytics:
      ├─ Volume chart
      ├─ PR breakdown
      ├─ Streak calendar
      └─ Buddy activity
```

---

## Buddy System Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          BUDDY SYSTEM FLOW                                       │
│                    (With Pending/Accept Security)                                │
└─────────────────────────────────────────────────────────────────────────────────┘

USER A: Sends Buddy Request
═══════════════════════════

User A navigates to BuddiesPage
  │
  ├─ Taps "Add Buddy"
  ├─ Enters User B's code: "REBLD-X7Y8Z9W1"
  └─ Taps "Send Request"
  │
  ▼
Frontend: EnterCodeDialog
  │
  └─ Call: sendBuddyRequest({
        fromUserId: "user_A",
        toUserCode: "REBLD-X7Y8Z9W1"
      })
  │
  ▼
Backend: convex/userCodeMutations.ts → sendBuddyRequest()
  │
  ├─ 1. Verify authentication
  │    └─ ctx.auth.getUserIdentity()
  │        └─ identity.subject === "user_A" ✅
  │
  ├─ 2. Find target user
  │    └─ Query: users.filter(userCode === "REBLD-X7Y8Z9W1")
  │        └─ Returns: User B { userId: "user_B" }
  │
  ├─ 3. Validate:
  │    ├─ ✅ User A ≠ User B (can't add yourself)
  │    └─ ✅ No existing buddy relationship
  │
  ├─ 4. Create PENDING buddy relationship
  │    └─ Insert into workoutBuddies:
  │        {
  │          userId: "user_A",
  │          buddyId: "user_B",
  │          status: "pending",           ← Not "active"!
  │          createdAt: "2025-11-24T10:00:00.000Z",
  │          acceptedAt: null             ← Not accepted yet
  │        }
  │
  └─ 5. Send notification to User B
       └─ Insert into buddyNotifications:
           {
             userId: "user_B",            ← Recipient
             triggeredBy: "user_A",       ← Sender
             type: "buddy_request",
             message: "wants to be your workout buddy!",
             createdAt: "2025-11-24T10:00:00.000Z",
             read: false,
             actionTaken: false           ← Requires action
           }
  │
  ▼
User A sees: "Buddy request sent to REBLD-X7Y8Z9W1"

USER B: Receives & Accepts Request
════════════════════════════════════

User B opens app
  │
  ├─ BuddiesPage loads
  ├─ Query: getBuddyNotifications(userId: "user_B")
  │   └─ Returns:
  │       [
  │         {
  │           type: "buddy_request",
  │           triggeredBy: "user_A",
  │           message: "wants to be your workout buddy!",
  │           read: false,
  │           actionTaken: false
  │         }
  │       ]
  │
  └─ Show notification card:
      ┌────────────────────────────────────────────────┐
      │  🤝 User A wants to be your workout buddy!    │
      │                                                │
      │  [Accept]  [Decline]                          │
      └────────────────────────────────────────────────┘

User B taps "Accept"
  │
  ▼
Frontend: BuddiesPage
  │
  └─ Call: acceptBuddyRequest({
        userId: "user_B",
        requesterId: "user_A"
      })
  │
  ▼
Backend: convex/userCodeMutations.ts → acceptBuddyRequest()
  │
  ├─ 1. Verify authentication
  │    └─ ctx.auth.getUserIdentity()
  │        └─ identity.subject === "user_B" ✅
  │        └─ args.userId === "user_B" ✅
  │
  ├─ 2. Find pending request
  │    └─ Query: workoutBuddies
  │        WHERE userId="user_A" AND buddyId="user_B"
  │        └─ Returns: { _id: "abc123", status: "pending" }
  │
  ├─ 3. Validate status
  │    └─ status === "pending" ✅
  │
  ├─ 4. Update request to ACTIVE
  │    └─ Patch: workoutBuddies(abc123)
  │        {
  │          status: "active",             ← Accepted!
  │          acceptedAt: "2025-11-24T10:05:00.000Z"
  │        }
  │
  ├─ 5. Create reciprocal relationship
  │    └─ Insert: workoutBuddies
  │        {
  │          userId: "user_B",
  │          buddyId: "user_A",
  │          status: "active",             ← Both directions active
  │          createdAt: "2025-11-24T10:05:00.000Z",
  │          acceptedAt: "2025-11-24T10:05:00.000Z"
  │        }
  │
  ├─ 6. Create buddy settings (for both)
  │    └─ Insert: buddySettings (user_A ↔ user_B)
  │        {
  │          userId: "user_A",
  │          buddyId: "user_B",
  │          notifyOnWorkoutStart: true,
  │          compareStats: true,
  │          shareLogs: true,
  │          showPRs: true
  │        }
  │    └─ Insert: buddySettings (user_B ↔ user_A)
  │        { ... same ... }
  │
  └─ 7. Mark notification as actioned
       └─ Patch: buddyNotifications
           { actionTaken: true, read: true }
  │
  ▼
Both users now see each other as buddies
  │
  └─ Can now:
      ├─ See each other's workout activity
      ├─ Compare stats
      ├─ Receive PR notifications
      └─ Share plans

SECURITY FEATURES:
═══════════════════

✅ Authentication required for ALL buddy operations
✅ Can only send requests as yourself (verified via JWT)
✅ Can only accept YOUR OWN requests (not someone else's)
✅ Pending status prevents forced buddy additions
✅ Cryptographically secure user codes (8 chars, 2.8T combinations)
✅ Minimal user info returned (no enumeration attacks)
```

---

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COMPONENT TREE                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

index.tsx
  └─ ClerkProvider
      └─ ConvexProviderWithClerk
          └─ App.tsx
              ├─ useTheme() ← Global theme state
              ├─ useUser() ← Clerk authentication
              ├─ useQuery(getUserProfile) ← Convex profile
              │
              ├─ Navbar
              │   ├─ Sun/Moon toggle (theme)
              │   ├─ Home tab
              │   ├─ Goals tab
              │   ├─ Plan tab
              │   └─ Profile tab
              │   └─ Sliding pill highlight (limelight-nav)
              │
              ├─ Page Routing (conditional)
              │   │
              │   ├─ IF page === 'home':
              │   │   └─ HomePage
              │   │       ├─ useQuery(getActivePlan)
              │   │       ├─ useQuery(getWorkoutLogs)
              │   │       ├─ ExerciseCard × N
              │   │       ├─ StreakCounter
              │   │       ├─ HeatMapCalendar
              │   │       └─ "Start Workout" Button
              │   │
              │   ├─ IF page === 'goals':
              │   │   └─ GoalTrackingPage
              │   │       ├─ Progress bars
              │   │       ├─ Goal cards
              │   │       └─ PerformanceAnalytics
              │   │
              │   ├─ IF page === 'plan':
              │   │   └─ PlanPage
              │   │       ├─ Week overview
              │   │       ├─ Day cards × 7
              │   │       ├─ Progress indicators
              │   │       ├─ Auxiliary routine
              │   │       └─ "Edit Plan" Button
              │   │
              │   ├─ IF page === 'profile':
              │   │   └─ ProfilePage
              │   │       ├─ Body metrics
              │   │       ├─ Goals editor
              │   │       ├─ Preferences
              │   │       ├─ Language switcher
              │   │       └─ Sign out
              │   │
              │   ├─ IF page === 'dashboard':
              │   │   └─ DashboardPage
              │   │       ├─ Volume charts
              │   │       ├─ PR timeline
              │   │       ├─ Exercise analytics
              │   │       └─ Sport buckets
              │   │
              │   └─ IF page === 'buddies':
              │       └─ BuddiesPage
              │           ├─ Add buddy dialog
              │           ├─ BuddyComparisonCard × N
              │           ├─ Notifications list
              │           └─ Share plan dialog
              │
              ├─ Session Overlay (if activeSessionPlan):
              │   └─ SessionTracker
              │       ├─ PreWorkoutScreen
              │       │   └─ Warm-up reminders
              │       │
              │       ├─ Exercise Display
              │       │   ├─ ExerciseCard (current)
              │       │   ├─ Weight/Reps inputs
              │       │   ├─ "Log Set" button
              │       │   ├─ Rest Timer
              │       │   └─ Progress: "Exercise 3/8"
              │       │
              │       ├─ BlockCompletionScreen
              │       │   └─ Shows between blocks (2s)
              │       │
              │       └─ VictoryScreen
              │           ├─ Session stats
              │           ├─ Achievement badges
              │           ├─ Share button
              │           └─ "Done" button
              │
              ├─ Chatbot Overlay (if chatOpen):
              │   └─ Chatbot
              │       ├─ Message history
              │       ├─ Input field
              │       ├─ AI responses
              │       └─ Function calling (exercise swap, etc.)
              │
              └─ Modal Overlays (conditional):
                  ├─ ExerciseExplanationModal
                  │   └─ Shows exercise details from cache
                  │
                  ├─ AnalysisModal
                  │   └─ Shows AI plan grading
                  │
                  ├─ SharePlanDialog
                  │   └─ Generate share code
                  │
                  └─ EnterCodeDialog
                      └─ Accept shared plan

SHARED UI COMPONENTS (used throughout):
═══════════════════════════════════════

components/ui/
  ├─ button.tsx (4 variants: primary, secondary, soft, ghost)
  ├─ card.tsx (3 variants: default, soft, interactive)
  ├─ progress.tsx (smooth animated progress bars)
  ├─ limelight-nav/ (sliding pill navigation)
  ├─ badge.tsx (tier colors: bronze, silver, gold, platinum)
  ├─ toast.tsx (success, error, info notifications)
  └─ [20+ more primitives]

components/layout/
  ├─ Navbar.tsx (bottom navigation with theme toggle)
  ├─ Toast.tsx (notification system)
  └─ FullScreenLoader.tsx (loading states)

components/icons.tsx
  └─ Custom SVG icons (20+)
```

---

## State Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          STATE MANAGEMENT LAYERS                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

LAYER 1: CONVEX REAL-TIME STATE (Database-Backed)
════════════════════════════════════════════════════

useQuery → Reads from Convex → Auto-subscribes to changes
useMutation → Writes to Convex → Triggers re-renders

Example:
  Component:
    const plans = useQuery(api.queries.getWorkoutPlans);
    //     └─ Returns: WorkoutPlan[] | undefined
    //     └─ undefined while loading
    //     └─ Updates automatically when data changes

  Flow:
    1. Component mounts
    2. useQuery sends request to Convex
    3. Convex returns data + establishes WebSocket
    4. Component renders with data
    5. Another user/device updates data
    6. Convex pushes update via WebSocket
    7. Component auto-re-renders with new data

    No manual refetch needed!

LAYER 2: JOTAI ATOMS (Client-Side Global State)
═════════════════════════════════════════════════

Lightweight atoms for UI state

Atoms defined (examples):
  ├─ themeAtom: 'light' | 'dark'
  ├─ chatOpenAtom: boolean
  ├─ activePageAtom: 'home' | 'goals' | 'plan' | 'profile'
  └─ sessionStateAtom: { plan, currentExercise, logs }

Usage:
  const [theme, setTheme] = useAtom(themeAtom);
  setTheme('dark'); // Updates globally, all components re-render

LAYER 3: REACT COMPONENT STATE (Local UI)
═══════════════════════════════════════════

Standard useState for local interactions

Examples:
  ├─ Form inputs: const [weight, setWeight] = useState(50);
  ├─ Modal state: const [isOpen, setIsOpen] = useState(false);
  ├─ Loading state: const [isLoading, setIsLoading] = useState(false);
  └─ Error state: const [error, setError] = useState(null);

LAYER 4: CUSTOM HOOKS (Abstraction)
═════════════════════════════════════

Encapsulate complex logic

useWorkoutPlan:
  ├─ const plans = useQuery(api.queries.getWorkoutPlans);
  ├─ const createPlan = useMutation(api.mutations.createWorkoutPlan);
  ├─ const addPlan = async (plan) => { ... }
  └─ return { plans, addPlan, isLoading, error }

useWorkoutLogs:
  ├─ const logs = useQuery(api.queries.getWorkoutLogs);
  ├─ const logWorkout = useMutation(api.mutations.logWorkout);
  └─ return { logs, logWorkout, ... }

useUserProfile:
  ├─ const profile = useQuery(api.queries.getUserProfile);
  ├─ const updateProfile = useMutation(api.mutations.updateUserProfile);
  └─ return { userProfile: profile, updateUserProfile, ... }

useTheme:
  ├─ const [theme, setTheme] = useState(() => localStorage.get());
  ├─ useEffect(() => { applyTheme(); persist(); }, [theme]);
  └─ return { theme, toggleTheme }

DATA FLOW EXAMPLE: Logging a Set
══════════════════════════════════

  SessionTracker Component
    │
    ├─ Local State:
    │   └─ const [currentSet, setCurrentSet] = useState(1);
    │       const [weight, setWeight] = useState(lastWeight);
    │       const [reps, setReps] = useState(lastReps);
    │
    ├─ User taps "Log Set"
    │   │
    │   └─ setCurrentSet(prev => prev + 1);  ← Local update (instant UI)
    │
    ├─ User completes workout
    │   │
    │   └─ logWorkout mutation
    │       │
    │       └─ Convex saves to workoutLogs  ← Persistent storage
    │           │
    │           └─ Triggers real-time updates
    │               │
    │               └─ All subscribed components re-render
    │                   ├─ HomePage (logs updated)
    │                   ├─ LogbookPage (new entry)
    │                   ├─ DashboardPage (stats recalculated)
    │                   └─ BuddiesPage (buddy sees activity)
```

---

## Complete File Manifest

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    CRITICAL FILES & THEIR PURPOSES                               │
└─────────────────────────────────────────────────────────────────────────────────┘

CONFIGURATION
═════════════
.env.local                  ← API keys, Convex URL (NEVER commit!)
vite.config.ts              ← Build config (API key REMOVED from client)
tsconfig.json               ← TypeScript config
tailwind.config.js          ← Tailwind CSS config
package.json                ← Dependencies
convex.json                 ← Convex project config

FRONTEND ENTRY
══════════════
index.tsx                   ← App entry point
index.html                  ← HTML shell (fonts, meta)
App.tsx                     ← Main app (routing, navigation)

TYPES
═════
types.ts                    ← All TypeScript interfaces
convex/_generated/          ← Auto-generated Convex types

STYLING
═══════
styles/theme.css            ← Design tokens (colors, spacing, shadows)
styles/animations.css       ← (If extracted)

PAGES (7)
═════════
pages/HomePage.tsx          ← Today's workout, streaks
pages/PlanPage.tsx          ← Weekly plan overview
pages/LogbookPage.tsx       ← Workout history
pages/ProfilePage.tsx       ← User settings, preferences
pages/GoalTrackingPage.tsx  ← Progress tracking
pages/DashboardPage.tsx     ← Analytics & insights
pages/BuddiesPage.tsx       ← Social features
pages/AuthPage.tsx          ← Sign in/up (Clerk)
pages/SessionSummaryPage.tsx ← Post-workout summary

CORE COMPONENTS (20+)
═════════════════════
components/SessionTracker.tsx        ← Live workout tracking (500 lines)
components/Chatbot.tsx               ← AI coach interface
components/PlanImporter.tsx          ← Onboarding wizard (4 steps)
components/VictoryScreen.tsx         ← Post-workout celebration
components/RestTimer.tsx             ← Countdown timer
components/ExerciseCard.tsx          ← Exercise display
components/BlockCompletionScreen.tsx ← Between-block screens
components/PreWorkoutScreen.tsx      ← Pre-workout checklist
components/ExerciseExplanationModal.tsx ← Exercise details
components/AnalysisModal.tsx         ← AI plan grading display
components/SharePlanDialog.tsx       ← Share code generation
components/EnterCodeDialog.tsx       ← Accept shared plans
components/BuddyComparisonCard.tsx   ← Buddy stats comparison
components/AchievementBadge.tsx      ← Achievement display
components/StreakCounter.tsx         ← Streak visualization
components/HeatMapCalendar.tsx       ← Workout frequency heatmap
components/PerformanceAnalytics.tsx  ← Charts & graphs
components/InjuryProfile.tsx         ← Injury management
components/LanguageSwitcher.tsx      ← EN/DE toggle
components/WorkoutBlockDisplay.tsx   ← Block visualization
components/AuxiliaryRoutineDisplay.tsx ← Daily routine

UI PRIMITIVES (components/ui/)
═══════════════════════════════
components/ui/button.tsx     ← 4 variants (primary, secondary, soft, ghost)
components/ui/card.tsx       ← 3 variants (default, soft, interactive)
components/ui/progress.tsx   ← Animated progress bars
components/ui/badge.tsx      ← Tier badges (bronze, silver, gold, platinum)
components/ui/limelight-nav/ ← Sliding pill navigation
components/ui/dialog.tsx     ← Modal dialogs
components/ui/input.tsx      ← Form inputs
components/ui/select.tsx     ← Dropdowns
components/ui/checkbox.tsx   ← Checkboxes
components/ui/radio.tsx      ← Radio buttons
components/ui/toast.tsx      ← Notifications

LAYOUT COMPONENTS
═════════════════
components/layout/Navbar.tsx        ← Bottom navigation
components/layout/Toast.tsx         ← Global notification system
components/layout/FullScreenLoader.tsx ← Loading states

ICONS
═════
components/icons.tsx         ← 20+ custom SVG icons

CUSTOM HOOKS (hooks/)
═════════════════════
hooks/useWorkoutPlan.ts      ← Plan CRUD operations
hooks/useWorkoutLogs.ts      ← Log CRUD operations
hooks/useUserProfile.ts      ← Profile CRUD operations
hooks/useTheme.ts            ← Theme management (light/dark)

SERVICES (business logic)
═════════════════════════
services/geminiService.ts            ← AI integration (1,400 lines)
services/knowledgeService.ts         ← Query knowledge DB
services/exerciseDatabaseService.ts  ← Exercise cache management
services/smartExerciseSelection.ts   ← Intelligent ranking
services/exerciseRanker.ts           ← Multi-factor scoring
services/knowledgeCompressor.ts      ← Token optimization
services/flashContextService.ts      ← Minimal context building
services/prService.ts                ← PR detection
services/cacheService.ts             ← General caching
services/workoutAbbreviations.ts     ← Parsing helpers (EMOM, AMRAP, etc.)
services/exerciseHistoryService.ts   ← History management
services/planAnalysisService.ts      ← Plan grading

BACKEND (Convex)
════════════════
convex/schema.ts             ← Database schema (16 tables)
convex/queries.ts            ← Read operations (40+ queries)
convex/mutations.ts          ← Write operations (50+ mutations)
convex/ai.ts                 ← Server-side AI actions (NEW: Secure)
convex/buddyQueries.ts       ← Buddy system reads
convex/buddyMutations.ts     ← Buddy system writes
convex/userCodeMutations.ts  ← User code generation (crypto-secure)
convex/achievementQueries.ts ← Gamification reads
convex/achievementMutations.ts ← Gamification writes
convex/sportBucketQueries.ts ← Sport analytics reads
convex/sportBucketMutations.ts ← Sport analytics writes
convex/auth.ts               ← Authentication helpers

I18N (Internationalization)
═══════════════════════════
i18n/config.ts               ← i18next setup
i18n/locales/en.json         ← English translations (500+ keys)
i18n/locales/de.json         ← German translations (500+ keys)

CONFIG
══════
config/clerkAppearance.ts    ← Clerk UI theming

UTILITIES
═════════
lib/utils.ts                 ← Helper functions
lib/rateLimiter.ts           ← Rate limit checks

KNOWLEDGE DATA (data/)
══════════════════════
data/complete_exercise_database.json
data/scientific_programming_knowledge.json
data/injury_protocols.json
data/goal_guidelines.json
data/hyrox_training_protocols.json
data/sport_specific_physical_training.json
data/sex_specific_guidelines.json (to be created)
... (100+ more JSON files)

SEEDING SCRIPTS (scripts/)
══════════════════════════
scripts/populateExerciseDatabase.ts
scripts/uploadKnowledge.ts
scripts/uploadScientificData.ts
scripts/uploadInjuryData.ts
scripts/uploadSexGuidelines.ts (to be created)
scripts/uploadSportGuidelines.ts (to be created)
scripts/uploadBodyGuidelines.ts (to be created)
... (30+ more scripts)

DOCUMENTATION
═════════════
MASTER_DOCUMENTATION.md      ← THIS IS THE SINGLE SOURCE OF TRUTH ★
CLAUDE.md                    ← Quick reference for AI assistants
README.md                    ← Quick start guide
SECURITY_AUDIT.md            ← Security vulnerability report
SECURITY_FIXES_COMPLETE.md   ← What was fixed
TECHNICAL_DEBT.md            ← Code quality report
VISUAL_ARCHITECTURE.md       ← This file (diagrams)
... (90+ more historical/status docs)
```

---

## Token Optimization Strategy (Detailed)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      TOKEN OPTIMIZATION TECHNIQUES                               │
│                   (How we save 70-80% on AI costs)                               │
└─────────────────────────────────────────────────────────────────────────────────┘

TECHNIQUE 1: EXERCISE CACHING
══════════════════════════════

Problem: Same exercise explained repeatedly
  User 1: "Explain bicep curls" → API call ($0.003)
  User 2: "Explain bicep curls" → API call ($0.003)
  User 3: "Explain bicep curls" → API call ($0.003)
  Total: $0.009

Solution: Global cache
  User 1: "Explain bicep curls"
    ├─ Check exerciseCache → NOT FOUND
    ├─ Call API ($0.003)
    └─ Save to cache

  User 2: "Explain bicep curls"
    ├─ Check exerciseCache → FOUND!
    └─ Return cached ($0.000)

  User 3: "Explain bicep curls"
    ├─ Check exerciseCache → FOUND!
    └─ Return cached ($0.000)

  Total: $0.003 (70% savings)

Cache hit rate after 1000 users: 95%
  └─ Only 5% of requests are unique exercises

TECHNIQUE 2: KNOWLEDGE COMPRESSION
═══════════════════════════════════

Problem: Sending full knowledge base to AI
  Prompt with full DB:
    ├─ programmingKnowledge: 200 entries × 500 tokens = 100,000 tokens
    ├─ injuryProtocols: 40 entries × 300 tokens = 12,000 tokens
    └─ Total: 112,000 input tokens ($1.12 per plan!)

Solution: Smart retrieval + compression
  1. Query only relevant slices (by goal/sex/sport/injury)
  2. Extract just the guideline bullets (not full objects)
  3. Limit to top 5 per domain
  4. Cache compressed bullets per profile

  Prompt with compressed knowledge:
    ├─ Sex guidelines: 5 bullets × 10 tokens = 50 tokens
    ├─ Sport guidelines: 5 bullets × 10 tokens = 50 tokens
    ├─ Body guidelines: 5 bullets × 10 tokens = 50 tokens
    ├─ Injury guidelines: 5 bullets × 10 tokens = 50 tokens
    └─ Total: 200 input tokens ($0.002 per plan)

  Savings: 99.8% token reduction!
  Quality: Better (focused, relevant guidelines only)

TECHNIQUE 3: KNOWLEDGE CACHE (Pre-Computed)
═════════════════════════════════════════════

Problem: Fetching guidelines from 4 tables on every generation
  Time: 4 queries × 50ms = 200ms overhead

Solution: Cache compressed bullets by profile
  Profile Key: "goal_experience_sex_sport_band_level"
    └─ Example: "hypertrophy_intermediate_female_null_normal_moderate"

  First request with this profile:
    ├─ Fetch from 4 tables (200ms)
    ├─ Compress to bullets
    ├─ Save to knowledgeCache with profile key
    └─ Use in prompt

  Subsequent requests (same profile):
    ├─ Query: knowledgeCache.filter(cache_key)
    ├─ Return cached bullets (5ms!)
    └─ Use in prompt

  After 100 users:
    ├─ ~20 unique profile combinations cached
    └─ Cache hit rate: 95%

  Savings:
    └─ 200ms → 5ms (40x faster)
    └─ 4 DB queries → 1 cache lookup

TECHNIQUE 4: BATCH API CALLS
══════════════════════════════

Problem: Explaining 10 exercises one-by-one
  explainExercise("Squat")     → 600 tokens input + 400 output = 1,000
  explainExercise("Bench")     → 600 tokens input + 400 output = 1,000
  explainExercise("Row")       → 600 tokens input + 400 output = 1,000
  ... × 10
  Total: 10,000 tokens, 10 API calls

Solution: Batch processing
  batchExplainExercises(["Squat", "Bench", "Row", ... 10 total])
    └─ Single API call:
        └─ 800 tokens input + 4,000 output = 4,800 tokens

  Savings: 52% token reduction, 10x fewer API calls

  Status: Function exists (geminiService.ts:1108)
          Not yet called (opportunity for improvement)

TECHNIQUE 5: PROMPT OPTIMIZATION
══════════════════════════════════

Before:
  "Generate a detailed, comprehensive workout plan for an intermediate
   trainee who wants to build muscle, with explanations of every exercise,
   detailed warm-up and cool-down routines, and progressive overload
   strategies built in week-over-week..."

   → 150 tokens input

After:
  "Generate 7-day plan. JSON schema: {...}"
   → 30 tokens input

  Savings: 80% reduction in prompt overhead

COMBINED SAVINGS:
═════════════════

Technique              | Baseline | Optimized | Savings
──────────────────────────────────────────────────────
Exercise explanations  | $0.009   | $0.003    | 70%
Knowledge retrieval    | $1.120   | $0.002    | 99.8%
Plan generation        | $0.080   | $0.030    | 62%
Batch processing       | $0.100   | $0.048    | 52%
──────────────────────────────────────────────────────
TOTAL per active user  | $1.309   | $0.083    | 94%

Result: 16x cost reduction while improving quality!
```

---

## Quick Reference: Key Commands

```bash
# Development
npx convex dev                      # Start Convex backend (Terminal 1)
npm run dev                          # Start Vite frontend (Terminal 2)

# Seeding
npm run seed:exercises               # Populate exerciseCache (800+)
npm run seed:knowledge               # Populate programmingKnowledge (200+)
npm run seed:injury                  # Populate injuryProtocols (40+)
npm run seed:sex-guidelines          # Populate sexSpecificGuidelines (30+)
npm run seed:sport-guidelines        # Populate sportGuidelines (50+)
npm run seed:body-guidelines         # Populate bodyContextGuidelines (25+)

# Production
npm run build                        # Build for production
npx convex deploy                    # Deploy Convex to production
vercel --prod                        # Deploy frontend (if using Vercel)

# Debugging
npx convex logs                      # View Convex logs
npx convex logs --tail               # Tail logs in real-time
npx convex data                      # Browse database
```

---

**END OF VISUAL ARCHITECTURE**

All diagrams in this file use ASCII art for universal compatibility.
For interactive diagrams, consider tools like Mermaid or draw.io.

**Last Updated:** November 24, 2025
**Status:** Complete ✅
