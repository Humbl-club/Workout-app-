/**
 * PLAN VALIDATOR - Runtime Validation
 *
 * Validates AI-generated plans to ensure they follow ALL rules.
 * This runs BEFORE saving plans to the database.
 *
 * Purpose: Catch and reject invalid plans from AI
 */

import { METRICS_TEMPLATES } from "./metricsTemplateReference";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface Exercise {
  exercise_name: string;
  category: string;
  metrics_template: any;
  [key: string]: any;
}

interface Block {
  type: string;
  exercises: Exercise[];
  [key: string]: any;
}

interface Session {
  session_name: string;
  time_of_day: string;
  blocks: Block[];
  [key: string]: any;
}

interface Day {
  day_of_week: number;
  focus: string;
  blocks?: Block[];
  sessions?: Session[];
  [key: string]: any;
}

interface Plan {
  name: string;
  weeklyPlan: Day[];
  [key: string]: any;
}

/**
 * Validate complete workout plan
 */
export function validateWorkoutPlan(plan: Plan): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic structure validation
  if (!plan.name || plan.name.trim() === '') {
    errors.push('Plan must have a name');
  }

  if (!plan.weeklyPlan || !Array.isArray(plan.weeklyPlan)) {
    errors.push('Plan must have weeklyPlan array');
    return { valid: false, errors, warnings };
  }

  if (plan.weeklyPlan.length === 0) {
    errors.push('weeklyPlan cannot be empty');
    return { valid: false, errors, warnings };
  }

  if (plan.weeklyPlan.length !== 7) {
    errors.push(`weeklyPlan must have exactly 7 days (found ${plan.weeklyPlan.length})`);
  }

  // Validate each day
  plan.weeklyPlan.forEach((day, dayIndex) => {
    validateDay(day, dayIndex, errors, warnings);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a single day
 */
function validateDay(day: Day, dayIndex: number, errors: string[], warnings: string[]): void {
  const dayLabel = `Day ${dayIndex + 1} (${day.focus || 'unnamed'})`;

  // Check day_of_week
  if (typeof day.day_of_week !== 'number' || day.day_of_week < 1 || day.day_of_week > 7) {
    errors.push(`${dayLabel}: day_of_week must be 1-7 (found: ${day.day_of_week})`);
  }

  // Check focus
  if (!day.focus || day.focus.trim() === '') {
    warnings.push(`${dayLabel}: Missing focus description`);
  }

  // Check for blocks OR sessions (not both, not neither)
  const hasBlocks = day.blocks && Array.isArray(day.blocks) && day.blocks.length > 0;
  const hasSessions = day.sessions && Array.isArray(day.sessions) && day.sessions.length > 0;

  if (!hasBlocks && !hasSessions) {
    // Only error if it's not a rest day
    const isRestDay = day.focus?.toLowerCase().includes('rest') ||
                      day.focus?.toLowerCase().includes('recovery') ||
                      day.focus?.toLowerCase().includes('off');

    if (!isRestDay) {
      errors.push(`${dayLabel}: Must have either 'blocks' or 'sessions' array (not a rest day)`);
    }
    return; // Skip further validation for rest days
  }

  if (hasBlocks && hasSessions) {
    errors.push(`${dayLabel}: Cannot have BOTH 'blocks' and 'sessions' - use one or the other`);
  }

  // Validate blocks
  if (hasBlocks && day.blocks) {
    day.blocks.forEach((block, blockIndex) => {
      validateBlock(block, blockIndex, dayLabel, errors, warnings);
    });
  }

  // Validate sessions (2x daily training)
  if (hasSessions && day.sessions) {
    if (day.sessions.length !== 2) {
      warnings.push(`${dayLabel}: sessions array should have exactly 2 sessions for twice-daily training (found ${day.sessions.length})`);
    }

    day.sessions.forEach((session, sessionIndex) => {
      validateSession(session, sessionIndex, dayLabel, errors, warnings);
    });
  }
}

/**
 * Validate a session (for 2x daily training)
 */
function validateSession(session: Session, sessionIndex: number, dayLabel: string, errors: string[], warnings: string[]): void {
  const sessionLabel = `${dayLabel} > Session ${sessionIndex + 1}`;

  // Check required fields
  if (!session.session_name || session.session_name.trim() === '') {
    errors.push(`${sessionLabel}: Missing session_name`);
  }

  if (!session.time_of_day) {
    errors.push(`${sessionLabel}: Missing time_of_day`);
  } else if (session.time_of_day !== 'morning' && session.time_of_day !== 'evening') {
    warnings.push(`${sessionLabel}: time_of_day should be 'morning' or 'evening' (found: ${session.time_of_day})`);
  }

  if (!session.blocks || !Array.isArray(session.blocks) || session.blocks.length === 0) {
    errors.push(`${sessionLabel}: Must have blocks array with at least one block`);
    return;
  }

  // Validate blocks within session
  session.blocks.forEach((block, blockIndex) => {
    validateBlock(block, blockIndex, sessionLabel, errors, warnings);
  });
}

/**
 * Validate a workout block
 */
function validateBlock(block: Block, blockIndex: number, parentLabel: string, errors: string[], warnings: string[]): void {
  const blockLabel = `${parentLabel} > Block ${blockIndex + 1}`;

  // Check block type
  const validBlockTypes = ['single', 'superset', 'amrap', 'circuit', 'emom'];
  if (!block.type) {
    errors.push(`${blockLabel}: Missing 'type' field`);
  } else if (!validBlockTypes.includes(block.type)) {
    errors.push(`${blockLabel}: Invalid block type '${block.type}' (must be: ${validBlockTypes.join(', ')})`);
  }

  // Check exercises
  if (!block.exercises || !Array.isArray(block.exercises) || block.exercises.length === 0) {
    errors.push(`${blockLabel}: Must have exercises array with at least one exercise`);
    return;
  }

  // Validate each exercise
  block.exercises.forEach((exercise, exerciseIndex) => {
    validateExercise(exercise, exerciseIndex, blockLabel, errors, warnings);
  });

  // Block-specific validation
  if (block.type === 'superset' || block.type === 'circuit') {
    if (!block.rounds || typeof block.rounds !== 'number' || block.rounds < 1) {
      errors.push(`${blockLabel}: ${block.type} must have 'rounds' field (number >= 1)`);
    }
  }

  if (block.type === 'amrap' || block.type === 'emom') {
    if (!block.duration_minutes || typeof block.duration_minutes !== 'number' || block.duration_minutes < 1) {
      errors.push(`${blockLabel}: ${block.type} must have 'duration_minutes' field (number >= 1)`);
    }
  }
}

/**
 * Validate a single exercise - MOST CRITICAL VALIDATION
 */
function validateExercise(exercise: Exercise, exerciseIndex: number, blockLabel: string, errors: string[], warnings: string[]): void {
  const exerciseLabel = `${blockLabel} > Exercise ${exerciseIndex + 1} (${exercise.exercise_name || 'unnamed'})`;

  // Check exercise name
  if (!exercise.exercise_name || exercise.exercise_name.trim() === '') {
    errors.push(`${exerciseLabel}: Missing exercise_name`);
  }

  // Check category
  const validCategories = ['warmup', 'main', 'cooldown'];
  if (!exercise.category) {
    errors.push(`${exerciseLabel}: Missing 'category' field`);
  } else if (!validCategories.includes(exercise.category)) {
    errors.push(`${exerciseLabel}: Invalid category '${exercise.category}' (must be: ${validCategories.join(', ')})`);
  }

  // ═══════════════════════════════════════════════════════════
  // CRITICAL: Metrics Template Validation
  // ═══════════════════════════════════════════════════════════

  if (!exercise.metrics_template) {
    errors.push(`${exerciseLabel}: MISSING metrics_template - this is MANDATORY!`);
    return;
  }

  if (typeof exercise.metrics_template !== 'object') {
    errors.push(`${exerciseLabel}: metrics_template must be an object`);
    return;
  }

  const template = exercise.metrics_template;

  // Check 'type' field
  if (!template.type) {
    errors.push(`${exerciseLabel}: metrics_template missing 'type' field - MUST specify template type!`);
    return;
  }

  // Validate against known templates
  const validTemplateTypes = Object.keys(METRICS_TEMPLATES);
  if (!validTemplateTypes.includes(template.type)) {
    errors.push(`${exerciseLabel}: Invalid metrics template type '${template.type}'. Must be one of: ${validTemplateTypes.join(', ')}`);
    return;
  }

  // Get template definition
  const templateDef = METRICS_TEMPLATES[template.type];

  // Check required fields
  templateDef.requiredFields.forEach(field => {
    if (template[field] === undefined || template[field] === null) {
      errors.push(`${exerciseLabel}: metrics_template type '${template.type}' requires field '${field}' (currently missing or null)`);
    }
  });

  // Type-specific validation
  if (template.type === 'duration_only') {
    // Accept both field names: duration_minutes OR target_duration_minutes
    let durationMin = template.duration_minutes ?? template.target_duration_minutes;
    // Handle string values - extract the number
    if (typeof durationMin === 'string') {
      const numMatch = durationMin.match(/(\d+)/);
      durationMin = numMatch ? parseInt(numMatch[1], 10) : null;
    }
    // Special case: "Complete Rest" or "Rest" exercises don't need a valid duration
    const exerciseName = (exercise.exercise_name || '').toLowerCase();
    const isRestExercise = exerciseName.includes('rest') || exerciseName.includes('recovery');
    if (!isRestExercise && (typeof durationMin !== 'number' || durationMin <= 0)) {
      errors.push(`${exerciseLabel}: duration_only requires duration_minutes to be a positive number`);
    }
  }

  if (template.type === 'sets_reps_weight' || template.type === 'sets_reps') {
    if (typeof template.target_sets !== 'number' || template.target_sets <= 0) {
      errors.push(`${exerciseLabel}: ${template.type} requires target_sets to be a positive number`);
    }
    // target_reps can be number or string (range like "8-10")
    if (template.target_reps === undefined || template.target_reps === null) {
      errors.push(`${exerciseLabel}: ${template.type} requires target_reps`);
    }
  }

  if (template.type === 'sets_duration') {
    if (typeof template.target_sets !== 'number' || template.target_sets <= 0) {
      errors.push(`${exerciseLabel}: sets_duration requires target_sets to be a positive number`);
    }
    // Accept multiple field names: duration_seconds, target_duration_s, target_duration_seconds, hold_seconds
    let durationSec = template.duration_seconds ?? template.target_duration_s ?? template.target_duration_seconds ?? template.hold_seconds;
    // Handle string values like "30 each side" - extract the number
    if (typeof durationSec === 'string') {
      const numMatch = durationSec.match(/(\d+)/);
      durationSec = numMatch ? parseInt(numMatch[1], 10) : null;
    }
    if (typeof durationSec !== 'number' || durationSec <= 0) {
      errors.push(`${exerciseLabel}: sets_duration requires duration_seconds to be a positive number`);
    }
  }

  if (template.type === 'sets_duration_rest') {
    // Accept both field names: sets OR target_sets
    const sets = template.sets ?? template.target_sets;
    if (typeof sets !== 'number' || sets <= 0) {
      errors.push(`${exerciseLabel}: sets_duration_rest requires sets to be a positive number`);
    }
    // Accept both field names: duration_seconds OR work_duration_s
    const durationSec = template.duration_seconds ?? template.work_duration_s;
    if (typeof durationSec !== 'number' || durationSec <= 0) {
      errors.push(`${exerciseLabel}: sets_duration_rest requires duration_seconds to be a positive number`);
    }
    // Accept both field names: rest_seconds OR rest_duration_s
    const restSec = template.rest_seconds ?? template.rest_duration_s;
    if (typeof restSec !== 'number' || restSec < 0) {
      errors.push(`${exerciseLabel}: sets_duration_rest requires rest_seconds to be a non-negative number`);
    }
  }

  if (template.type === 'distance_time') {
    const hasKm = template.distance_km !== undefined && template.distance_km !== null;
    const hasMeters = template.distance_m !== undefined && template.distance_m !== null;

    if (!hasKm && !hasMeters) {
      errors.push(`${exerciseLabel}: distance_time requires either distance_km OR distance_m`);
    }
    if (hasKm && hasMeters) {
      warnings.push(`${exerciseLabel}: distance_time has BOTH distance_km and distance_m - use only one`);
    }
  }
}

/**
 * Validate and provide helpful error messages
 */
export function validateAndExplain(plan: Plan): { valid: boolean; message: string } {
  const result = validateWorkoutPlan(plan);

  if (result.valid) {
    return {
      valid: true,
      message: 'Plan validation passed! All exercises have correct metrics templates.',
    };
  }

  let message = '🚨 PLAN VALIDATION FAILED\n\n';
  message += `Found ${result.errors.length} error(s):\n\n`;

  result.errors.forEach((error, index) => {
    message += `${index + 1}. ${error}\n`;
  });

  if (result.warnings.length > 0) {
    message += `\n⚠️  ${result.warnings.length} warning(s):\n\n`;
    result.warnings.forEach((warning, index) => {
      message += `${index + 1}. ${warning}\n`;
    });
  }

  return {
    valid: false,
    message,
  };
}
