export interface BaseMetricTemplate {
  type: string;
  target_sets?: number | null;
  target_reps?: string | null;
  reps_per_set?: (string | number)[]; // For complex schemes like descending reps
  rest_period_s?: number | null;
  one_rep_max_percentage?: string | null;
  incline?: string | null;
  speed?: string | null;
  resistance?: string | null;
  pulse_target?: string | null;
  has_drop_set?: boolean; // For special instructions
}

export interface SetsRepsWeightTemplate extends BaseMetricTemplate {
  type: 'sets_reps_weight';
}

export interface SetsRepsWeightTempoTemplate extends BaseMetricTemplate {
  type: 'sets_reps_weight_tempo';
  target_tempo: string;
}

export interface SetsDurationTemplate extends BaseMetricTemplate {
  type: 'sets_duration';
  target_duration_s: number | null;
}

export interface SetsDistanceRestTemplate extends BaseMetricTemplate {
  type: 'sets_distance_rest';
  target_distance_m: number;
  target_rest_s: number;
}

export interface DistanceTimeTemplate extends BaseMetricTemplate {
  type: 'distance_time';
  target_distance_km: number;
}

export interface DurationOnlyTemplate extends BaseMetricTemplate {
  type: 'duration_only';
  target_duration_minutes: number;
}

export type MetricTemplate = 
  | SetsRepsWeightTemplate
  | SetsRepsWeightTempoTemplate
  | SetsDurationTemplate
  | SetsDistanceRestTemplate
  | DistanceTimeTemplate
  | DurationOnlyTemplate;

export interface PlanExercise {
  exercise_name: string;
  notes?: string | null;
  metrics_template: MetricTemplate;
  original_exercise_name?: string;
  rpe?: string | null;
  category: 'warmup' | 'main' | 'cooldown';
}

// NEW BLOCK-BASED ARCHITECTURE
export interface BaseBlock {
  type: 'single' | 'superset' | 'amrap';
  title?: string;
  exercises: PlanExercise[];
}

export interface SingleExerciseBlock extends BaseBlock {
  type: 'single';
}

export interface SupersetBlock extends BaseBlock {
  type: 'superset';
  rounds: number;
}

export interface AmrapBlock extends BaseBlock {
  type: 'amrap';
  duration_minutes: number;
}

export type WorkoutBlock = SingleExerciseBlock | SupersetBlock | AmrapBlock;


export interface PlanDay {
  day_of_week: number; // 1=Mon, 7=Sun
  focus: string;
  notes?: string;
  blocks: WorkoutBlock[];
}

export interface DailyRoutine {
    focus: string;
    notes?: string;
    exercises: PlanExercise[]; // Kept simple for now, can be upgraded to blocks later if needed
}

export interface WorkoutPlan {
    id?: string;
    name: string;
    weeklyPlan: PlanDay[];
    dailyRoutine?: DailyRoutine;
    createdAt?: string; // ISO date string
    
    // NEW: Auxiliary routines for comprehensive training
    auxiliaryRoutines?: {
        mobility?: AuxiliaryRoutine[];
        stretching?: AuxiliaryRoutine[];
        activation?: AuxiliaryRoutine[];
        recovery?: AuxiliaryRoutine[];
        sportDrills?: AuxiliaryRoutine[];
    };
    
    // NEW: Daily habits separate from main workouts
    dailyRoutines?: {
        morning?: DailyHabit[];
        preWorkout?: DailyHabit[];
        postWorkout?: DailyHabit[];
        evening?: DailyHabit[];
    };
}

// NEW: Auxiliary routine types
export interface AuxiliaryRoutine {
    id: string;
    name: string;
    frequency: "daily" | "3x_week" | "pre_workout" | "post_workout" | "as_needed";
    duration_minutes: number;
    exercises: AuxiliaryExercise[];
    notes?: string;
    sport_specific?: string;
}

export interface AuxiliaryExercise {
    exercise_name: string;
    category: "mobility" | "stretching" | "activation" | "recovery" | "drill";
    metrics_template: MetricsTemplate;
    notes?: string;
}

export interface DailyHabit {
    name: string;
    time_of_day: "morning" | "afternoon" | "evening" | "pre_workout" | "post_workout";
    exercises: SimpleExercise[];
    duration_minutes: number;
    mandatory: boolean;
    reminder_time?: string; // e.g., "07:00" for 7 AM
}

export interface SimpleExercise {
    exercise_name: string;
    duration_s?: number;
    reps?: string;
    notes?: string;
}

// Logged Data Types
export interface LoggedSetSRW {
  set: number;
  weight: number | string;
  reps: number | string;
  rpe?: number | null;
}

export interface LoggedSetSRWT extends LoggedSetSRW {
  tempo: string;
}

export interface LoggedSetDuration {
  set: number;
  duration_s: number | string;
}

export interface LoggedSetSDR {
  set: number;
  distance_m: number | string;
  rest_s: number | string;
}

export interface LoggedExercise {
    exercise_name: string;
    sets: (LoggedSetSRW | LoggedSetDuration)[];
}

export interface WorkoutLog {
    id?: string; // ID is assigned by Convex, so optional on creation
    date: string; // ISO date string
    focus: string;
    exercises: LoggedExercise[];
    durationMinutes?: number;
}


// Chatbot types
export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    functionCall?: any;
}

// Training Preferences (from onboarding)
export interface TrainingPreferences {
    primary_goal: string; // "Aesthetic Physique", "Strength & Power", etc.
    goal_explanation?: string | null; // User's own words about their goal
    experience_level: string; // "Beginner", "Intermediate", "Advanced"
    training_frequency: string; // "2-3", "3-4", "4-5", "5+"
    pain_points: string[]; // ["Knees", "Lower Back", etc.]
    sport?: string | null; // Sport-specific training
    sport_specific?: string | null; // Elite sport-specific protocols
    additional_notes?: string | null; // Free-form notes
    last_updated: string; // ISO date string
    // New richer profile fields
    sex?: 'male' | 'female' | 'other';
    equipment?: 'minimal' | 'home_gym' | 'commercial_gym';
    preferred_session_length?: '30' | '45' | '60' | '75';
    athletic_level?: 'low' | 'moderate' | 'high';
    training_age_years?: number; // years of consistent training
    body_type?: 'lean' | 'average' | 'muscular';
    comfort_flags?: string[]; // user-requested avoids/preferences (e.g., "avoid_high_impact", "avoid_chest_dominant", "prefer_neutral_grip")
}

// User Profile types
export interface UserProfile {
    userCode?: string; // Unique permanent code for buddy connections (REBLD-ABC123)
    lastProgressionApplied?: string; // ISO date string
    bodyMetrics?: BodyMetrics;
    goals?: UserGoal[];
    trainingPreferences?: TrainingPreferences;
    apiUsage?: {
        tier: 'free' | 'premium';
        plansGenerated: number;
        chatMessagesSent: number;
        plansParsed: number;
        periodStart: string; // ISO date
        periodEnd: string; // ISO date
        lastReset?: string | null;
    };
}

// Body Metrics
export interface BodyMetrics {
    weight?: number; // in lbs or kg
    height?: number; // in cm or ft
    heightUnit?: 'cm' | 'ft';
    bodyFatPercentage?: number;
    measurements?: {
        chest?: number;
        waist?: number;
        hips?: number;
        biceps?: number;
        thighs?: number;
    };
    lastUpdated?: string; // ISO date string
}

// User Goals
export interface UserGoal {
    id?: string;
    type: 'workout_count' | 'weight_loss' | 'strength_gain' | 'custom';
    title: string; // e.g., "Complete 30 workouts"
    target: number; // e.g., 30
    current: number; // e.g., 18
    deadline?: string; // ISO date string
    createdAt?: string; // ISO date string
}

// Personal Records
export interface PersonalRecord {
    exercise_name: string;
    weight: number;
    reps: number;
    date: string; // ISO date string
    previousBest?: {
        weight: number;
        reps: number;
        date: string; // ISO date string
    };
}

// Progress Photos
export interface ProgressPhoto {
    _id: string;
    userId: string;
    photoUrl: string;
    photoType: 'front' | 'side' | 'back';
    date: string; // ISO date string
    aiAnalysis?: {
        bodyFatEstimate: number;
        muscleChanges: string;
        improvements: string[];
        suggestions: string[];
        confidence: number;
    };
    comparedTo: string | null; // ID of previous photo
    createdAt: string; // ISO date string
}
