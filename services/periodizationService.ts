/**
 * Periodization Service for REBLD Workout App
 *
 * Manages training phases for goal-based periodization programs.
 * Supports: Base → Build → Peak → Taper phases
 */

import type { Periodization, PeriodizationPhase } from '../types';

// Phase distribution percentages
const PHASE_DISTRIBUTION = {
  base: 0.35,   // 35% - Build foundation, moderate intensity
  build: 0.35,  // 35% - Sport-specific, progressive overload
  peak: 0.15,   // 15% - High intensity, competition simulation
  taper: 0.15,  // 15% - Recovery, maintain sharpness
};

// Phase characteristics for AI prompt generation
export const PHASE_CHARACTERISTICS: Record<PeriodizationPhase, {
  description: string;
  volume: 'low' | 'moderate' | 'high';
  intensity: 'low' | 'moderate' | 'high';
  focus: string[];
}> = {
  base: {
    description: 'Building aerobic foundation and movement proficiency',
    volume: 'high',
    intensity: 'moderate',
    focus: ['Aerobic base', 'Technique work', 'General fitness', 'Movement patterns'],
  },
  build: {
    description: 'Sport-specific training with progressive overload',
    volume: 'high',
    intensity: 'high',
    focus: ['Sport-specific work', 'Progressive overload', 'Strength gains', 'Power development'],
  },
  peak: {
    description: 'Competition simulation with high intensity',
    volume: 'moderate',
    intensity: 'high',
    focus: ['Competition simulation', 'Mental preparation', 'Race pace work', 'Tactical training'],
  },
  taper: {
    description: 'Recovery phase to maintain freshness for competition',
    volume: 'low',
    intensity: 'moderate',
    focus: ['Recovery', 'Sharpness', 'Mental readiness', 'Light maintenance'],
  },
  recovery: {
    description: 'Active recovery and deload phase',
    volume: 'low',
    intensity: 'low',
    focus: ['Active recovery', 'Mobility work', 'Sleep optimization', 'Stress reduction'],
  },
};

/**
 * Calculate periodization based on target date
 */
export function calculatePeriodization(
  targetDate: string,
  currentDate?: string
): Periodization | null {
  const target = new Date(targetDate);
  const now = currentDate ? new Date(currentDate) : new Date();

  // Calculate weeks until target
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const totalWeeks = Math.ceil((target.getTime() - now.getTime()) / msPerWeek);

  // Return null if target date has passed or is too close
  if (totalWeeks <= 0) {
    return null;
  }

  // Calculate phase durations
  const baseWeeks = Math.max(1, Math.floor(totalWeeks * PHASE_DISTRIBUTION.base));
  const buildWeeks = Math.max(1, Math.floor(totalWeeks * PHASE_DISTRIBUTION.build));
  const peakWeeks = Math.max(1, Math.floor(totalWeeks * PHASE_DISTRIBUTION.peak));
  const taperWeeks = Math.max(1, totalWeeks - baseWeeks - buildWeeks - peakWeeks);

  // For short programs, simplify phases
  if (totalWeeks <= 4) {
    return {
      total_weeks: totalWeeks,
      current_week: 1,
      phase: totalWeeks <= 2 ? 'taper' : 'peak',
      phase_description: totalWeeks <= 2
        ? 'Short taper - maintain fitness for competition'
        : 'Short peak - competition preparation',
      weeks_in_phase: totalWeeks,
      phase_end_week: totalWeeks,
    };
  }

  // Week 1 is always BASE phase
  return {
    total_weeks: totalWeeks,
    current_week: 1,
    phase: 'base',
    phase_description: PHASE_CHARACTERISTICS.base.description,
    weeks_in_phase: baseWeeks,
    phase_end_week: baseWeeks,
  };
}

/**
 * Get the current phase based on week number
 */
export function getCurrentPhase(
  periodization: Periodization,
  currentWeek: number
): PeriodizationPhase {
  const { total_weeks } = periodization;

  // Calculate phase boundaries
  const baseEnd = Math.floor(total_weeks * PHASE_DISTRIBUTION.base);
  const buildEnd = baseEnd + Math.floor(total_weeks * PHASE_DISTRIBUTION.build);
  const peakEnd = buildEnd + Math.floor(total_weeks * PHASE_DISTRIBUTION.peak);

  if (currentWeek <= baseEnd) return 'base';
  if (currentWeek <= buildEnd) return 'build';
  if (currentWeek <= peakEnd) return 'peak';
  return 'taper';
}

/**
 * Get phase details for the current week
 */
export function getPhaseDetails(
  periodization: Periodization,
  currentWeek: number
): {
  phase: PeriodizationPhase;
  weekInPhase: number;
  weeksRemainingInPhase: number;
  characteristics: typeof PHASE_CHARACTERISTICS[PeriodizationPhase];
} {
  const { total_weeks } = periodization;

  const baseEnd = Math.floor(total_weeks * PHASE_DISTRIBUTION.base);
  const buildEnd = baseEnd + Math.floor(total_weeks * PHASE_DISTRIBUTION.build);
  const peakEnd = buildEnd + Math.floor(total_weeks * PHASE_DISTRIBUTION.peak);

  let phase: PeriodizationPhase;
  let phaseStart: number;
  let phaseEnd: number;

  if (currentWeek <= baseEnd) {
    phase = 'base';
    phaseStart = 1;
    phaseEnd = baseEnd;
  } else if (currentWeek <= buildEnd) {
    phase = 'build';
    phaseStart = baseEnd + 1;
    phaseEnd = buildEnd;
  } else if (currentWeek <= peakEnd) {
    phase = 'peak';
    phaseStart = buildEnd + 1;
    phaseEnd = peakEnd;
  } else {
    phase = 'taper';
    phaseStart = peakEnd + 1;
    phaseEnd = total_weeks;
  }

  const weekInPhase = currentWeek - phaseStart + 1;
  const weeksRemainingInPhase = phaseEnd - currentWeek;

  return {
    phase,
    weekInPhase,
    weeksRemainingInPhase,
    characteristics: PHASE_CHARACTERISTICS[phase],
  };
}

/**
 * Advance periodization to next week
 */
export function advancePeriodization(
  periodization: Periodization
): Periodization {
  const nextWeek = periodization.current_week + 1;

  if (nextWeek > periodization.total_weeks) {
    // Program complete - stay on final week
    return periodization;
  }

  const { phase, weekInPhase, weeksRemainingInPhase, characteristics } =
    getPhaseDetails(periodization, nextWeek);

  return {
    ...periodization,
    current_week: nextWeek,
    phase,
    phase_description: characteristics.description,
    weeks_in_phase: weekInPhase + weeksRemainingInPhase,
    phase_end_week: nextWeek + weeksRemainingInPhase,
  };
}

/**
 * Format periodization info for display
 */
export function formatPeriodizationDisplay(periodization: Periodization): string {
  const { phase, current_week, total_weeks } = periodization;
  const { characteristics } = getPhaseDetails(periodization, current_week);

  const phaseLabel = phase.toUpperCase();
  const progressPercent = Math.round((current_week / total_weeks) * 100);

  return `${phaseLabel} PHASE - Week ${current_week}/${total_weeks} (${progressPercent}%)`;
}

/**
 * Get training recommendations for current phase
 */
export function getPhaseRecommendations(phase: PeriodizationPhase): {
  volumeMultiplier: number;
  intensityMultiplier: number;
  restDays: number;
  sessionLength: 'shorter' | 'normal' | 'longer';
} {
  switch (phase) {
    case 'base':
      return {
        volumeMultiplier: 1.0,
        intensityMultiplier: 0.7,
        restDays: 2,
        sessionLength: 'longer',
      };
    case 'build':
      return {
        volumeMultiplier: 1.2,
        intensityMultiplier: 0.85,
        restDays: 2,
        sessionLength: 'normal',
      };
    case 'peak':
      return {
        volumeMultiplier: 0.8,
        intensityMultiplier: 1.0,
        restDays: 2,
        sessionLength: 'normal',
      };
    case 'taper':
      return {
        volumeMultiplier: 0.5,
        intensityMultiplier: 0.7,
        restDays: 3,
        sessionLength: 'shorter',
      };
    case 'recovery':
      return {
        volumeMultiplier: 0.3,
        intensityMultiplier: 0.5,
        restDays: 4,
        sessionLength: 'shorter',
      };
  }
}

/**
 * Calculate weeks until each phase
 */
export function getPhaseTimeline(totalWeeks: number): {
  base: { start: number; end: number };
  build: { start: number; end: number };
  peak: { start: number; end: number };
  taper: { start: number; end: number };
} {
  const baseEnd = Math.floor(totalWeeks * PHASE_DISTRIBUTION.base);
  const buildEnd = baseEnd + Math.floor(totalWeeks * PHASE_DISTRIBUTION.build);
  const peakEnd = buildEnd + Math.floor(totalWeeks * PHASE_DISTRIBUTION.peak);

  return {
    base: { start: 1, end: baseEnd },
    build: { start: baseEnd + 1, end: buildEnd },
    peak: { start: buildEnd + 1, end: peakEnd },
    taper: { start: peakEnd + 1, end: totalWeeks },
  };
}
