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
    createdAt?: any;
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
    id?: string; // ID is assigned by Firestore, so optional on creation
    date: any; // Can be ISO string or Firestore Timestamp
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

// User Profile types
export interface UserProfile {
    lastProgressionApplied?: any; // Firestore Timestamp
    bodyMetrics?: BodyMetrics;
    goals?: UserGoal[];
}

// Body Metrics
export interface BodyMetrics {
    weight?: number; // in lbs or kg
    bodyFatPercentage?: number;
    measurements?: {
        chest?: number;
        waist?: number;
        hips?: number;
        biceps?: number;
        thighs?: number;
    };
    lastUpdated?: any; // Firestore Timestamp
}

// User Goals
export interface UserGoal {
    id?: string;
    type: 'workout_count' | 'weight_loss' | 'strength_gain' | 'custom';
    title: string; // e.g., "Complete 30 workouts"
    target: number; // e.g., 30
    current: number; // e.g., 18
    deadline?: any; // Firestore Timestamp
    createdAt?: any;
}

// Personal Records
export interface PersonalRecord {
    exercise_name: string;
    weight: number;
    reps: number;
    date: any; // Firestore Timestamp
    previousBest?: {
        weight: number;
        reps: number;
        date: any;
    };
}