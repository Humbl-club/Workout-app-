import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { DumbbellIcon, RepeatIcon, ClockIcon, CheckCircleIcon } from '../icons';
import { LoggedSetSRW, MetricTemplate } from '../../types';
import { useHaptic } from '../../hooks/useAnimations';

/* ═══════════════════════════════════════════════════════════════
   SET INPUT CONTROLS - Exercise Type Aware

   Intelligently shows different inputs based on exercise type:
   - Strength: Weight + Reps
   - Cardio/Intervals: Duration timer
   - Distance: Distance + Time
   ═══════════════════════════════════════════════════════════════ */

interface SetInputControlsProps {
  exerciseName: string;
  currentInputData: Partial<LoggedSetSRW & { duration?: number; distance?: number }>;
  onInputChange: (field: 'weight' | 'reps' | 'duration' | 'distance', value: string) => void;
  metricsTemplate?: MetricTemplate;
  onComplete?: () => void; // For cardio - auto complete when timer ends
}

// Helper to determine exercise input type
function getExerciseInputType(template?: MetricTemplate, exerciseName?: string): 'strength' | 'duration' | 'distance' {
  if (!template) {
    // Fallback: detect from exercise name
    const lowerName = exerciseName?.toLowerCase() || '';
    if (
      lowerName.includes('interval') ||
      lowerName.includes('cardio') ||
      lowerName.includes('treadmill') ||
      lowerName.includes('bike') ||
      lowerName.includes('row') ||
      lowerName.includes('stair') ||
      lowerName.includes('elliptical') ||
      lowerName.includes('jump rope') ||
      lowerName.includes('plank') ||
      lowerName.includes('hold') ||
      lowerName.includes('stretch')
    ) {
      return 'duration';
    }
    return 'strength';
  }

  switch (template.type) {
    case 'duration_only':
    case 'sets_duration':
      return 'duration';
    case 'distance_time':
    case 'sets_distance_rest':
      return 'distance';
    default:
      return 'strength';
  }
}

// Timer component for duration-based exercises
function DurationTimer({
  targetDuration,
  onComplete,
}: {
  targetDuration: number;
  onComplete: () => void;
}) {
  const { t } = useTranslation();
  const haptic = useHaptic();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

  // Smooth animation loop using RAF
  useEffect(() => {
    if (!isRunning) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsedMs = timestamp - startTimeRef.current;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      setElapsed(elapsedSec);

      // Check if complete
      if (elapsedSec >= targetDuration) {
        setIsRunning(false);
        setIsComplete(true);
        haptic.success();
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, targetDuration, haptic]);

  const handleStart = () => {
    haptic.medium();
    setIsRunning(true);
    startTimeRef.current = null;
  };

  const handleStop = () => {
    haptic.light();
    setIsRunning(false);
  };

  const handleReset = () => {
    haptic.light();
    setIsRunning(false);
    setElapsed(0);
    setIsComplete(false);
    startTimeRef.current = null;
  };

  const handleComplete = () => {
    haptic.success();
    onComplete();
  };

  const progress = Math.min(elapsed / targetDuration, 1);
  const remaining = Math.max(0, targetDuration - elapsed);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - progress);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <div className="flex flex-col items-center py-[var(--space-4)]">
      {/* Circular timer */}
      <div className="relative w-48 h-48 mb-[var(--space-4)]">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--surface-secondary)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={isComplete ? 'var(--status-success-bg)' : 'var(--brand-primary)'}
            strokeWidth="8"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: isRunning ? 'none' : 'stroke-dashoffset 0.3s ease-out',
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isComplete ? (
            <>
              <CheckCircleIcon className="w-10 h-10 text-[var(--status-success-bg)] mb-1" />
              <span className="text-[var(--text-lg)] font-bold text-[var(--status-success-bg)]">
                {t('common.done')}
              </span>
            </>
          ) : (
            <>
              <span className="text-[44px] font-black text-[var(--text-primary)] tabular-nums">
                {formatTime(isRunning ? remaining : targetDuration)}
              </span>
              <span className="text-[var(--text-sm)] text-[var(--text-tertiary)]">
                {isRunning ? t('session.remaining') : t('session.target')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      {isComplete ? (
        <div className="flex gap-3 w-full">
          <button
            onClick={handleReset}
            className={cn(
              'flex-1 h-14 rounded-2xl',
              'bg-[var(--surface-secondary)] text-[var(--text-primary)]',
              'font-semibold text-base',
              'active:scale-[0.98] transition-transform'
            )}
          >
            {t('common.reset')}
          </button>
          <button
            onClick={handleComplete}
            className={cn(
              'flex-[2] h-14 rounded-2xl',
              'bg-[var(--status-success-bg)] text-white',
              'font-bold text-base',
              'active:scale-[0.98] transition-transform'
            )}
          >
            {t('session.logComplete')}
          </button>
        </div>
      ) : (
        <div className="flex gap-3 w-full">
          {isRunning ? (
            <button
              onClick={handleStop}
              className={cn(
                'flex-1 h-14 rounded-2xl',
                'bg-[var(--status-error-bg)] text-white',
                'font-bold text-base',
                'active:scale-[0.98] transition-transform'
              )}
            >
              {t('common.stop')}
            </button>
          ) : (
            <>
              {elapsed > 0 && (
                <button
                  onClick={handleReset}
                  className={cn(
                    'w-14 h-14 rounded-2xl',
                    'bg-[var(--surface-secondary)] text-[var(--text-primary)]',
                    'font-semibold',
                    'active:scale-[0.98] transition-transform'
                  )}
                >
                  ↺
                </button>
              )}
              <button
                onClick={handleStart}
                className={cn(
                  'flex-1 h-14 rounded-2xl',
                  'bg-[var(--brand-primary)] text-white',
                  'font-bold text-base',
                  'active:scale-[0.98] transition-transform'
                )}
              >
                {elapsed > 0 ? t('common.resume') : t('common.start')}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function SetInputControls({
  exerciseName,
  currentInputData,
  onInputChange,
  metricsTemplate,
  onComplete,
}: SetInputControlsProps) {
  const { t } = useTranslation();
  const inputType = getExerciseInputType(metricsTemplate, exerciseName);

  // Get target duration from template
  const getTargetDuration = (): number => {
    if (!metricsTemplate) return 30; // default 30 seconds

    if (metricsTemplate.type === 'duration_only') {
      return (metricsTemplate as any).target_duration_minutes
        ? (metricsTemplate as any).target_duration_minutes * 60
        : (metricsTemplate as any).target_duration_s || (metricsTemplate as any).duration_minutes * 60 || 30;
    }

    if (metricsTemplate.type === 'sets_duration') {
      return (metricsTemplate as any).target_duration_s || (metricsTemplate as any).duration_seconds || 30;
    }

    return 30;
  };

  // DURATION-BASED INPUT (Cardio, Intervals, Holds)
  if (inputType === 'duration') {
    return (
      <div className="mb-[var(--space-3)]">
        <label className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wider)] text-[var(--text-tertiary)] mb-[var(--space-2)] flex items-center gap-[var(--space-2)]">
          <ClockIcon className="w-3.5 h-3.5" />
          {t('session.duration')}
        </label>
        <DurationTimer
          targetDuration={getTargetDuration()}
          onComplete={onComplete || (() => {})}
        />
      </div>
    );
  }

  // DISTANCE-BASED INPUT
  if (inputType === 'distance') {
    return (
      <div className="space-y-[var(--space-3)] mb-[var(--space-3)]">
        <div>
          <label className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wider)] text-[var(--text-tertiary)] mb-[var(--space-2)] flex items-center gap-[var(--space-2)]">
            {t('session.distance')}
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={currentInputData.distance || ''}
              onChange={(e) => onInputChange('distance', e.target.value)}
              className={cn(
                "w-full h-16",
                "px-[var(--space-4)] pr-16",
                "bg-[var(--surface-primary)]",
                "border-2 border-[var(--border-default)]",
                "rounded-[var(--radius-2xl)]",
                "text-[24px] font-[var(--weight-black)] text-[var(--text-primary)]",
                "tabular-nums",
                "focus:border-[var(--brand-primary)]",
                "focus:ring-4 focus:ring-[var(--brand-primary)]/10",
                "focus:outline-none",
                "transition-all duration-[var(--duration-fast)]",
                "placeholder:text-[var(--text-tertiary)]"
              )}
              placeholder="0"
            />
            <span className="absolute right-[var(--space-4)] top-1/2 -translate-y-1/2 text-[18px] font-[var(--weight-bold)] text-[var(--text-primary)]">
              km
            </span>
          </div>
        </div>

        <div>
          <label className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wider)] text-[var(--text-tertiary)] mb-[var(--space-2)] flex items-center gap-[var(--space-2)]">
            <ClockIcon className="w-3.5 h-3.5" />
            {t('session.time')}
          </label>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={currentInputData.duration || ''}
              onChange={(e) => onInputChange('duration', e.target.value)}
              className={cn(
                "w-full h-16",
                "px-[var(--space-4)] pr-16",
                "bg-[var(--surface-primary)]",
                "border-2 border-[var(--border-default)]",
                "rounded-[var(--radius-2xl)]",
                "text-[24px] font-[var(--weight-black)] text-[var(--text-primary)]",
                "tabular-nums",
                "focus:border-[var(--brand-primary)]",
                "focus:ring-4 focus:ring-[var(--brand-primary)]/10",
                "focus:outline-none",
                "transition-all duration-[var(--duration-fast)]",
                "placeholder:text-[var(--text-tertiary)]"
              )}
              placeholder="0"
            />
            <span className="absolute right-[var(--space-4)] top-1/2 -translate-y-1/2 text-[18px] font-[var(--weight-bold)] text-[var(--text-primary)]">
              min
            </span>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT: STRENGTH INPUT (Weight + Reps)
  return (
    <div className="space-y-[var(--space-3)] mb-[var(--space-3)]">
      <div>
        <label className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wider)] text-[var(--text-tertiary)] mb-[var(--space-2)] flex items-center gap-[var(--space-2)]">
          <DumbbellIcon className="w-3.5 h-3.5" />
          {t('session.weightLabel')}
        </label>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={currentInputData.weight || ''}
            onChange={(e) => onInputChange('weight', e.target.value)}
            className={cn(
              "w-full h-16",
              "px-[var(--space-4)] pr-16",
              "bg-[var(--surface-primary)]",
              "border-2 border-[var(--border-default)]",
              "rounded-[var(--radius-2xl)]",
              "text-[24px] font-[var(--weight-black)] text-[var(--text-primary)]",
              "tabular-nums",
              "focus:border-[var(--brand-primary)]",
              "focus:ring-4 focus:ring-[var(--brand-primary)]/10",
              "focus:bg-gradient-to-br focus:from-[var(--brand-primary-subtle)] focus:to-transparent",
              "focus:outline-none",
              "transition-all duration-[var(--duration-fast)]",
              "placeholder:text-[var(--text-tertiary)]"
            )}
            placeholder="0"
          />
          <span className="absolute right-[var(--space-4)] top-1/2 -translate-y-1/2 text-[18px] font-[var(--weight-bold)] text-[var(--text-primary)]">
            kg
          </span>
        </div>

        {/* Quick adjust buttons */}
        <div className="grid grid-cols-4 gap-[var(--space-2)] mt-[var(--space-2)]">
          {[-5, -2.5, +2.5, +5].map((delta) => (
            <button
              key={delta}
              onClick={() => {
                const current = Number(currentInputData.weight || 0);
                const newWeight = Math.max(0, current + delta);
                onInputChange('weight', newWeight.toString());
              }}
              className={cn(
                "h-10 rounded-[var(--radius-xl)]",
                "font-[var(--weight-bold)] text-[var(--text-sm)]",
                "transition-all duration-[var(--duration-fast)]",
                "active:scale-90",
                "border-2",
                delta < 0
                  ? "bg-[var(--status-error-bg)]/10 border-[var(--status-error-bg)]/20 text-[var(--status-error-bg)] hover:bg-[var(--status-error-bg)]/20"
                  : "bg-[var(--status-success-bg)]/10 border-[var(--status-success-bg)]/20 text-[var(--status-success-bg)] hover:bg-[var(--status-success-bg)]/20"
              )}
            >
              {delta > 0 ? '+' : ''}{delta}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wider)] text-[var(--text-tertiary)] mb-[var(--space-2)] flex items-center gap-[var(--space-2)]">
          <RepeatIcon className="w-3.5 h-3.5" />
          {t('session.repsLabel')}
        </label>
        <input
          type="number"
          inputMode="numeric"
          value={currentInputData.reps || ''}
          onChange={(e) => onInputChange('reps', e.target.value)}
          className={cn(
            "w-full h-16",
            "px-[var(--space-4)]",
            "bg-[var(--surface-primary)]",
            "border-2 border-[var(--border-default)]",
            "rounded-[var(--radius-2xl)]",
            "text-[24px] font-[var(--weight-black)] text-[var(--text-primary)]",
            "tabular-nums",
            "focus:border-[var(--brand-primary)]",
            "focus:ring-4 focus:ring-[var(--brand-primary)]/10",
            "focus:bg-gradient-to-br focus:from-[var(--brand-primary-subtle)] focus:to-transparent",
            "focus:outline-none",
            "transition-all duration-[var(--duration-fast)]",
            "placeholder:text-[var(--text-tertiary)]"
          )}
          placeholder="0"
        />
      </div>
    </div>
  );
}
