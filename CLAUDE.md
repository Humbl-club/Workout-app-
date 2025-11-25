# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL RULE: Single Source of Truth

**MASTER_DOCUMENTATION.md is the SINGLE SOURCE OF TRUTH for this project.**

**MANDATORY: After ANY significant change (new features, architecture updates, security fixes, design changes, database schema modifications), you MUST update MASTER_DOCUMENTATION.md to reflect the current state.**

**What constitutes a "significant change":**
- New features added
- Database schema modifications
- Security improvements
- Design system changes
- API integrations
- Component architecture changes
- Data flow modifications
- New dependencies or tools
- UI/UX improvements
- Performance optimizations

**How to update MASTER_DOCUMENTATION.md:**
1. Read the relevant section of MASTER_DOCUMENTATION.md first
2. Update with the new information (be specific, include code examples)
3. Add entry to "Recent Improvements" section with date and detailed summary
4. Update any affected diagrams, flowcharts, or architecture sections
5. If schema changed, update the database schema section
6. If new features added, update the features list and architecture
7. Keep all code examples accurate and tested

**Why this matters:**
- Future AI assistants need accurate information to be productive
- Developers joining the project rely on this doc for onboarding
- Prevents knowledge loss across sessions and team members
- Maintains consistency across all documentation
- Serves as definitive guide for how the application works

**Related Documentation (secondary, reference only):**
- CLAUDE.md (this file) - Quick reference for AI assistants
- README.md - Quick start guide for new developers
- VISUAL_ARCHITECTURE.md - Diagrams, flowcharts, and visual schemas
- DESIGN_SYSTEM.md - Complete design reference

## ⛔ CRITICAL RULE: NO NEW MARKDOWN FILES

**NEVER create new .md files in this project.**

**The ONLY markdown files that should exist:**
1. **MASTER_DOCUMENTATION.md** - Single source of truth (main doc)
2. **VISUAL_ARCHITECTURE.md** - System diagrams and flowcharts
3. **CLAUDE.md** - AI assistant instructions (this file)
4. **README.md** - Public quick start guide
5. **CLERK_SETUP.md** - Authentication setup guide
6. **CONVEX_SETUP_GUIDE.md** - Database setup guide
7. **DESIGN_SYSTEM.md** - Design token reference
8-10. **Temporary:** 3 feature implementation guides (delete after completion)

**If you need to document something:**
- ✅ Update MASTER_DOCUMENTATION.md (95% of cases)
- ✅ Update VISUAL_ARCHITECTURE.md (if adding diagrams)
- ✅ Update CLAUDE.md (if changing dev patterns)
- ✅ Update DESIGN_SYSTEM.md (if changing design tokens)

**NEVER create:**
- ❌ STATUS.md files
- ❌ COMPLETE.md files
- ❌ PLAN.md files
- ❌ REPORT.md files
- ❌ GUIDE.md files (unless approved setup guide)
- ❌ Any other markdown file

**Why this rule exists:**
- Prevents documentation fragmentation
- Maintains single source of truth
- Easy for developers to find information
- Reduces from 105 files to 10 files (90% reduction achieved)

**Enforcement:**
- This rule is non-negotiable
- Violations should be flagged in code review
- AI assistants must follow this strictly

## Project Overview

REBLD is an AI-powered workout app built with React, Vite, TypeScript, Convex (real-time database), and Clerk (authentication). The app uses Google's Gemini AI to generate personalized workout plans, parse user-submitted plans, provide exercise explanations, and offer intelligent coaching through a chatbot interface.

## Build & Development Commands

```bash
# Install dependencies
npm install

# Development server (runs on port 3000)
npm run dev

# Production build
npm build

# Preview production build
npm preview

# Expose local dev server via tunnel
npm run tunnel
```

**Important:** Before running the dev server, ensure both Convex and Clerk are configured (see Setup section below).

## Initial Setup

### 1. Clerk Authentication
- Publishable key required in `.env.local` as `VITE_CLERK_PUBLISHABLE_KEY`
- Get key from: https://dashboard.clerk.com/last-active?path=api-keys
- See [CLERK_SETUP.md](./CLERK_SETUP.md) for detailed setup

### 2. Convex Database
- Run `npx convex dev` to initialize and link Convex project
- This auto-generates `VITE_CONVEX_URL` in `.env.local`
- Keep `npx convex dev` running during development (watches for schema/function changes)
- Use `npx convex dev --once` for one-time operations or CI/CD
- Schema changes auto-sync when dev server is running
- Type definitions regenerate automatically in `convex/_generated/`
- See [CONVEX_SETUP_GUIDE.md](./CONVEX_SETUP_GUIDE.md) for details

### 3. Gemini API
- Add `GEMINI_API_KEY` and `VITE_GEMINI_API_KEY` to `.env.local`
- Used for AI workout plan generation and chatbot

## Architecture Overview

### Frontend Structure
- **Entry Point:** `index.tsx` wraps app in `ClerkProvider` → `ConvexProvider` → `App`
- **Main App:** `App.tsx` manages navigation, session state, and page routing
- **Page Components:** `pages/`
  - Core: HomePage, PlanPage, ProfilePage, GoalTrackingPage, AuthPage, LogbookPage, DashboardPage
  - Social: BuddiesPage (buddy connections and activity)
  - Session: SessionSummaryPage (post-workout achievements and stats)
- **Shared Components:** `components/` (SessionTracker, Chatbot, ExerciseCard, modals, etc.)
- **Custom Hooks:** `hooks/` (useWorkoutPlan, useWorkoutLogs, useUserProfile, useTheme)
- **UI Components:** Tailwind CSS with shadcn/ui component library (`components/ui/`)
- **Path Alias:** `@/` resolves to project root (configured in `vite.config.ts`)

### State Management
- **Jotai** for lightweight global state (atoms)
- **Convex React hooks** for real-time database queries (`useQuery`, `useMutation`)
- Component-level state for UI interactions

### Database Architecture (Convex)

**Core Tables:**
- `users` - User profiles, preferences, body metrics, goals, injury profiles, unique permanent `userCode` (REBLD-ABC123 format)
- `workoutPlans` - Structured workout programs (weeklyPlan + dailyRoutine)
- `workoutLogs` - Completed workout sessions with exercises and metrics
- `exerciseHistory` - Last weight/reps used per exercise per user
- `exerciseCache` - Global exercise explanations (shared across users, includes metadata like tier, movement pattern, sport ratings, injury contraindications)

**Knowledge Base Tables** (for intelligent AI coaching):
- `programmingKnowledge` - Exercise selection principles from scientific textbooks
- `exerciseModifications` - Progressions, regressions, alternatives
- `goalGuidelines` - Goal-specific programming rules
- `injuryProtocols` - Exercise substitutions and prehab protocols
- `sexSpecificGuidelines` - Gender-specific programming considerations
- `sportGuidelines` - Sport-specific movement priorities and top exercises
- `bodyContextGuidelines` - BMI/body-type-based exercise recommendations
- `knowledgeCache` - Pre-computed decision trees for token optimization

**Analytics Tables:**
- `userExercisePreferences` - Per-user exercise ratings and preferences
- `userExerciseAnalytics` - Volume, PRs, injury incidents
- `exerciseRelationships` - Progressions, alternatives, movement patterns
- `sportBuckets` - Sport-specific exercise performance data per sport
- `exercisePerformance` - Detailed performance tracking per session (RPE, form quality, pain incidents)

**Social Features Tables:**
- `sharedPlans` - Shared workout plans with unique codes (REBLD-ABC123), 7-day expiration
- `workoutBuddies` - Buddy relationships (pending/active/declined status)
- `buddySettings` - Per-buddy notification preferences
- `buddyNotifications` - Real-time activity feed (workout starts, PRs, buddy requests)

**Gamification Tables:**
- `achievements` - Unlocked achievements with tiers (bronze/silver/gold/platinum)
- `streakData` - Current/longest streaks, workout frequency tracking

**Community Tables:**
- `userSubmittedPlans` - Community plans with AI grading (A-F scale) and analysis
- `generationLog` - Plan generation analytics for debugging

**Schema Location:** `convex/schema.ts`
**Type Definitions:** `types.ts` mirrors the Convex schema

### AI Services

**geminiService.ts** - Core AI integration
- `parseWorkoutPlan()` - Converts text/markdown workout plans into structured JSON
- `generateWorkoutPlan()` - Creates personalized plans from user preferences
- `explainExercise()` - Generates exercise explanations with form cues
- `handleChatMessage()` - Chatbot with function calling for plan modifications

**Advanced Parsing Features:**
- Handles abbreviations (EMOM, AMRAP, RPE, 1RM, etc.) via `workoutAbbreviations.ts`
- Recognizes workout formats: supersets (A1/A2), giant sets, AMRAPs, ladders, clusters
- Block-based architecture: `single`, `superset`, `amrap` blocks
- Metric templates: sets/reps/weight, tempo, duration, distance, etc.

**Knowledge & Exercise Services:**
- `knowledgeService.ts` - Queries programming knowledge from database
- `knowledgeCompressor.ts` - Creates compressed decision trees for token efficiency
- `flashContextService.ts` - Builds minimal context for AI calls (cost optimization)
- `exerciseDatabaseService.ts` - Manages exercise cache CRUD
- `smartExerciseSelection.ts` - Intelligent exercise ranking based on goals/injuries
- `exerciseRanker.ts` - Scores exercises using multi-factor algorithm

### Block-Based Workout Structure

Workouts are organized into **blocks** rather than flat exercise lists:

```typescript
type WorkoutBlock = SingleExerciseBlock | SupersetBlock | AmrapBlock

// Single exercise (standard sets × reps)
{ type: 'single', exercises: [...] }

// Superset (A1/A2 alternating)
{ type: 'superset', rounds: 4, exercises: [...] }

// AMRAP (as many rounds as possible)
{ type: 'amrap', duration_minutes: 10, exercises: [...] }
```

Each block contains `PlanExercise[]` with:
- `exercise_name` (string)
- `metrics_template` (flexible metric type: SetsRepsWeight, SetsDuration, etc.)
- `category` ('warmup' | 'main' | 'cooldown')
- `notes`, `rpe`, etc.

### Key Patterns

**Convex Data Flow:**
1. React component uses `useQuery(api.queries.getWorkoutPlans, { userId })`
2. Convex returns real-time data from cloud
3. Component re-renders automatically when data changes
4. Mutations via `useMutation(api.mutations.createWorkoutPlan)`

**Plan Normalization:**
- When saving plans to Convex, use `normalizePlanForConvex()` in `useWorkoutPlan.ts`
- Ensures all fields match Convex validators (null vs undefined, proper types)
- Critical: `metrics_template` can be `v.any()` for flexibility

**Exercise Caching:**
- First time an exercise is explained, save to `exerciseCache` table
- Future requests check cache first (reduces API calls)
- Cache includes: explanation, muscles_worked, form_cue, common_mistake, metadata

**Session Tracking:**
- `SessionTracker` component handles live workout sessions
- Collects logged sets/reps/weight per exercise
- On finish, saves to `workoutLogs` and updates `exerciseHistory`

### Internationalization (i18n)

- **Setup:** `i18n/config.ts` initializes i18next with browser language detection
- **Translations:** `i18n/locales/en.json`, `i18n/locales/de.json`
- **Usage:** `const { t } = useTranslation();` then `t('key.path')`
- **Language switching:** `LanguageSwitcher` component in `components/`

### Theming

- **CSS Variables:** `styles/theme.css` defines light/dark mode vars
- **Hook:** `useTheme()` provides `theme` and `toggleTheme()`
- **Implementation:** Toggles `data-theme="dark"` attribute on `<html>`

### Social Features (Buddy System)

**Plan Sharing:**
- Users can share plans via unique codes (format: "REBLD-ABC123")
- `SharePlanDialog` and `EnterCodeDialog` components handle sharing flow
- Plans expire 7 days after creation
- Track who accepted shared plans via `acceptedBy` array in `sharedPlans` table

**Buddy System:**
- Each user gets permanent `userCode` assigned on profile creation (generated via `userCodeMutations.ts`)
- Buddies can compare stats, share workout logs, see PRs
- `BuddiesPage` displays buddy connections and activity
- Notifications for workout starts, PRs, and buddy requests
- Related components: `BuddyComparisonCard`, `BuddyWorkoutLog`

**Convex Queries/Mutations:**
- `buddyQueries.ts` - Get shared plans, workout buddies
- `buddyMutations.ts` - Create/accept buddy relationships, manage notifications

### Achievements & Streak System

**Streak Tracking:**
- `streakData` table tracks current/longest streaks per user
- Streaks remain active within 48 hours of last workout
- `StreakCounter` component displays real-time streak status
- Premium users get streak freezes (1/month)
- `weeklyWorkouts` array tracks Mon-Sun activity for heatmap visualization

**Achievements:**
- `achievements` table stores unlocked achievements
- Types: streak milestones (`streak_7`), workout count (`workouts_100`), volume, PRs
- Tiers: bronze, silver, gold, platinum
- `AchievementBadge` component displays unlocked achievements
- `VictoryScreen` shows newly unlocked achievements after workout completion

**HeatMap Calendar:**
- `HeatMapCalendar` component visualizes workout frequency over time
- Uses `streakData.weeklyWorkouts` and `workoutLogs` for activity data

### AI Plan Analysis & Grading

**User Submitted Plans:**
- Users can submit plans for AI analysis via `PlanImporter`
- AI grades plans A-F based on multi-factor scoring:
  - Balance (0-100): Exercise variety and muscle group coverage
  - Progression: Logical loading and periodization
  - Recovery: Adequate rest days and deload weeks
  - Specificity: Alignment with stated goals
- Returns strengths, weaknesses, and improvement suggestions
- Graded plans stored in `userSubmittedPlans` table
- Public plans can be browsed/copied by other users (community feature)

### Cost Optimization

The app includes several token-optimization strategies to reduce AI API costs:

- **Flash Context Service** (`flashContextService.ts`) - Builds minimal context for AI calls
- **Knowledge Compressor** (`knowledgeCompressor.ts`) - Pre-computes decision trees from knowledge base
- **Knowledge Cache** (`knowledgeCache` table) - Stores compressed guidelines by user profile
  - Cache keys format: `"goal_experience_constraints"` (e.g., "aesthetic_intermediate_knee_pain")
  - Contains: tier lists, avoid exercises, substitutions, programming rules
- **Validation:** `validateCostOptimization.ts` script checks token usage
- **Guideline Bullets:** Sex/sport/body/injury guidelines compressed into bullet arrays

### Auxiliary Routines

**Daily Routines:**
- Optional `dailyRoutine` field in workout plans
- Stores mobility work, stretching, or daily habits separate from weekly plan
- Uses simple exercise array (not block-based architecture yet)
- Displayed via `AuxiliaryRoutineDisplay` component

## Working with Workout Plans

### Plan Structure
```typescript
WorkoutPlan {
  name: string;
  weeklyPlan: PlanDay[];      // 7 days (day_of_week: 1-7)
  dailyRoutine?: DailyRoutine; // Optional daily habits
  createdAt: string;
}

PlanDay {
  day_of_week: number;         // 1=Mon, 7=Sun
  focus: string;               // "Upper Body", "Legs", etc.
  blocks: WorkoutBlock[];      // Array of exercise blocks
  notes?: string;
}
```

### Parsing User-Submitted Plans
1. User pastes text/markdown into `PlanImporter` (onboarding component)
2. `geminiService.parseWorkoutPlan()` sends to Gemini with structured prompt
3. AI returns JSON matching `WorkoutPlan` type
4. `normalizePlanForConvex()` cleans data
5. `createWorkoutPlan` mutation saves to Convex

### Generating AI Plans
1. User fills onboarding form (goals, experience, pain points, sport)
2. `geminiService.generateWorkoutPlan()` creates plan from preferences
3. Optionally uses `knowledgeService` to inject programming principles
4. Returns structured `WorkoutPlan` ready for Convex

## Scripts Directory

The `scripts/` directory contains data population and testing utilities:

**Exercise Database Population:**
- `populateExerciseDatabase.ts` - Main script for populating exercise cache
- `uploadKnowledge.ts` - Upload programming knowledge from scientific books
- `uploadScientificData.ts` - Upload evidence-based exercise data
- `uploadInjuryData*.ts` - Various injury protocol upload scripts
- `enhanceExistingExercises.ts` - Add metadata to existing exercises

**Testing & Validation:**
- `testParsing.ts` - Test workout plan parsing
- `testSupersetFix.ts` - Validate superset parsing
- `validateCostOptimization.ts` - Check token usage optimization

**Note:** These scripts are for database setup/migration. Most use Convex mutations and require proper auth setup.

## Troubleshooting

### Convex Connection Issues
- Ensure `npx convex dev` is running in background
- Check `.env.local` has `VITE_CONVEX_URL`
- Verify Convex deployment URL in dashboard matches env var

### Clerk Authentication Errors
- Verify `VITE_CLERK_PUBLISHABLE_KEY` is correct
- Check Clerk dashboard for app status
- Ensure Vite env vars use `VITE_` prefix

### Gemini API Failures
- Check API key is valid and has quota
- `geminiService.ts` has fallback logic for missing keys
- Error messages in console will indicate API issues

### Type Errors in Convex Mutations
- Run `npx convex dev` to regenerate types
- Check `convex/_generated/` for latest type definitions
- Ensure data matches schema validators in `convex/schema.ts`

## Code Style Notes

- **File Organization:** Components use PascalCase, utilities use camelCase
- **Type Safety:** Prefer interfaces from `types.ts` over inline types
- **Convex IDs:** Use `Id<"tableName">` from generated types
- **Null Handling:** Convex schema uses explicit `v.union(v.string(), v.null())`
- **Async Operations:** Use async/await, handle errors with try/catch
- **Component Structure:** Functional components with hooks, avoid class components
