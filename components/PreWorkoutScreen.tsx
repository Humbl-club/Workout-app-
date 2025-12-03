import React from 'react';
import { useTranslation } from 'react-i18next';
import { PlanDay, DailyRoutine, WorkoutLog } from '../types';
import { ChartBarIcon, FlameIcon, TrophyIcon, ZapIcon } from './icons';
import { useHaptic } from '../hooks/useAnimations';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════════════════════════
   PRE-WORKOUT SCREEN - Minimal Version (Option B)

   Only shows when user has previous workout history.
   Displays "Beat Your Last Session" motivation card.
   ═══════════════════════════════════════════════════════════════ */

interface PreWorkoutScreenProps {
  session: PlanDay | DailyRoutine;
  recentLogs: WorkoutLog[];
  onStart: () => void;
  onCancel: () => void;
}

export default function PreWorkoutScreen({
  session,
  recentLogs,
  onStart,
  onCancel
}: PreWorkoutScreenProps) {
  const { t } = useTranslation();
  const haptic = useHaptic();

  // Get stats from last session with same focus (if any)
  const getLastSessionStats = () => {
    // Defensive: ensure recentLogs is a valid array
    if (!recentLogs || !Array.isArray(recentLogs) || recentLogs.length === 0) return null;

    try {
      // Try to find a session with the same focus first
      const sameFocusLog = recentLogs.find(log =>
        log?.focus?.toLowerCase() === session?.focus?.toLowerCase()
      );

      // Fall back to most recent session
      const lastLog = sameFocusLog || recentLogs[0];
      if (!lastLog || !lastLog.exercises) return null;

      // Ensure exercises is an array
      const exercises = Array.isArray(lastLog.exercises) ? lastLog.exercises : [];

      const totalVolume = exercises.reduce((sum, ex) => {
        if (!ex) return sum;
        const sets = Array.isArray(ex.sets) ? ex.sets : [];
        return sum + sets.reduce((setSum, set) => {
          if (!set) return setSum;
          if ('weight' in set && 'reps' in set) {
            const weight = typeof set.weight === 'string' ? parseFloat(set.weight) || 0 : (set.weight || 0);
            const reps = typeof set.reps === 'string' ? parseFloat(set.reps) || 0 : (set.reps || 0);
            return setSum + (weight * reps);
          }
          return setSum;
        }, 0);
      }, 0);

      const totalSets = exercises.reduce((sum, ex) => {
        if (!ex) return sum;
        return sum + (Array.isArray(ex.sets) ? ex.sets.length : 0);
      }, 0);

      // Safely parse date with fallback
      let dateStr = 'Recent';
      try {
        if (lastLog.date) {
          const date = new Date(lastLog.date);
          if (!isNaN(date.getTime())) {
            dateStr = date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            });
          }
        }
      } catch {
        dateStr = 'Recent';
      }

      return {
        focus: lastLog.focus || 'Workout',
        duration: lastLog.durationMinutes || 0,
        volume: totalVolume,
        exercises: exercises.length,
        sets: totalSets,
        date: dateStr,
        isSameFocus: !!sameFocusLog,
      };
    } catch (error) {
      // If anything fails, return null gracefully
      console.error('Error calculating last session stats:', error);
      return null;
    }
  };

  const lastStats = getLastSessionStats();

  // Calculate exercise count for current session
  const exerciseCount = 'blocks' in session && session.blocks
    ? session.blocks.reduce((sum, block) => sum + (block.exercises?.length || 0), 0)
    : 'exercises' in session && session.exercises
    ? session.exercises.length
    : 0;

  const handleStart = () => {
    haptic.heavy();
    onStart();
  };

  return (
    <div
      className={cn(
        "h-screen w-full max-w-lg mx-auto",
        "flex flex-col",
        "bg-[var(--bg-primary)]",
        "px-[var(--space-4)]",
        "pt-[calc(env(safe-area-inset-top)+var(--space-6))]",
        "pb-[calc(env(safe-area-inset-bottom)+var(--space-4))]",
        "animate-fade-in"
      )}
    >
      {/* Header */}
      <div className="mb-[var(--space-6)]">
        <h1 className={cn(
          "text-[var(--text-2xl)]",
          "font-[var(--weight-bold)]",
          "text-[var(--text-primary)]",
          "mb-[var(--space-2)]"
        )}>
          {session.focus}
        </h1>
        <div className="flex items-center gap-[var(--space-3)] text-[var(--text-sm)] text-[var(--text-secondary)]">
          <span>{exerciseCount} {t('workout.exercises', { defaultValue: 'exercises' })}</span>
          <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
          <span>~45 {t('workout.min', { defaultValue: 'min' })}</span>
        </div>
      </div>

      {/* Last Session Stats Card - Only shown if there's history */}
      {lastStats && (
        <div
          className={cn(
            "mb-[var(--space-6)]",
            "p-[var(--space-4)]",
            "rounded-[var(--radius-xl)]",
            "border-2",
            lastStats.isSameFocus
              ? "bg-gradient-to-br from-[var(--brand-primary-subtle)] to-[var(--brand-primary)]/10 border-[var(--brand-primary)]/30"
              : "bg-[var(--surface-secondary)] border-[var(--border-default)]"
          )}
        >
          <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-3)]">
            {lastStats.isSameFocus ? (
              <TrophyIcon className="w-5 h-5 text-[var(--brand-primary)]" />
            ) : (
              <ChartBarIcon className="w-5 h-5 text-[var(--text-secondary)]" />
            )}
            <h3 className={cn(
              "text-[var(--text-sm)]",
              "font-[var(--weight-bold)]",
              lastStats.isSameFocus ? "text-[var(--brand-primary)]" : "text-[var(--text-primary)]"
            )}>
              {lastStats.isSameFocus
                ? t('workout.beatLastSession', { defaultValue: 'Beat Your Last Session' })
                : t('workout.lastWorkout', { defaultValue: 'Last Workout' })
              }
            </h3>
            <span className="ml-auto text-[var(--text-2xs)] text-[var(--text-tertiary)]">
              {lastStats.date}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-[var(--space-3)]">
            {/* Duration */}
            <div className="text-center">
              <p className={cn(
                "text-[var(--text-xl)]",
                "font-[var(--weight-black)]",
                "tabular-nums",
                lastStats.isSameFocus ? "text-[var(--brand-primary)]" : "text-[var(--text-primary)]"
              )}>
                {lastStats.duration}
              </p>
              <p className="text-[var(--text-2xs)] text-[var(--text-tertiary)] uppercase tracking-wider">
                {t('workout.min', { defaultValue: 'min' })}
              </p>
            </div>

            {/* Volume */}
            <div className="text-center">
              <p className={cn(
                "text-[var(--text-xl)]",
                "font-[var(--weight-black)]",
                "tabular-nums",
                lastStats.isSameFocus ? "text-[var(--brand-primary)]" : "text-[var(--text-primary)]"
              )}>
                {lastStats.volume >= 1000
                  ? `${(lastStats.volume / 1000).toFixed(1)}k`
                  : Math.round(lastStats.volume)
                }
              </p>
              <p className="text-[var(--text-2xs)] text-[var(--text-tertiary)] uppercase tracking-wider">
                {t('workout.volume', { defaultValue: 'kg' })}
              </p>
            </div>

            {/* Sets */}
            <div className="text-center">
              <p className={cn(
                "text-[var(--text-xl)]",
                "font-[var(--weight-black)]",
                "tabular-nums",
                lastStats.isSameFocus ? "text-[var(--brand-primary)]" : "text-[var(--text-primary)]"
              )}>
                {lastStats.sets}
              </p>
              <p className="text-[var(--text-2xs)] text-[var(--text-tertiary)] uppercase tracking-wider">
                {t('workout.sets', { defaultValue: 'sets' })}
              </p>
            </div>
          </div>

          {lastStats.isSameFocus && (
            <div className={cn(
              "mt-[var(--space-3)]",
              "pt-[var(--space-3)]",
              "border-t border-[var(--brand-primary)]/20",
              "flex items-center justify-center gap-[var(--space-2)]"
            )}>
              <FlameIcon className="w-4 h-4 text-[var(--status-warning-bg)]" />
              <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--brand-primary)]">
                {t('workout.tryToBeatIt', { defaultValue: 'Try to beat it!' })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Motivational message when no history */}
      {!lastStats && (
        <div
          className={cn(
            "mb-[var(--space-6)]",
            "p-[var(--space-4)]",
            "rounded-[var(--radius-xl)]",
            "bg-gradient-to-br from-[var(--brand-primary-subtle)] to-[var(--brand-primary)]/10",
            "border border-[var(--brand-primary)]/20",
            "text-center"
          )}
        >
          <ZapIcon className="w-8 h-8 text-[var(--brand-primary)] mx-auto mb-[var(--space-2)]" />
          <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--text-primary)]">
            {t('workout.firstSession', { defaultValue: 'Your first session!' })}
          </p>
          <p className="text-[var(--text-xs)] text-[var(--text-secondary)] mt-[var(--space-1)]">
            {t('workout.letsGetStarted', { defaultValue: "Let's set some benchmarks" })}
          </p>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action Buttons */}
      <div className="space-y-[var(--space-3)]">
        <button
          onClick={handleStart}
          className={cn(
            "w-full",
            "py-[var(--space-4)]",
            "rounded-[var(--radius-xl)]",
            "font-[var(--weight-bold)]",
            "text-[var(--text-base)]",
            "text-white",
            "bg-[var(--brand-primary)]",
            "hover:bg-[var(--brand-primary-hover)]",
            "active:scale-[0.98]",
            "transition-all duration-[var(--duration-fast)]",
            "shadow-[var(--shadow-lg)]",
            "min-h-[60px]"
          )}
        >
          {t('workout.startWorkout', { defaultValue: 'Start Workout' })}
        </button>

        <button
          onClick={onCancel}
          className={cn(
            "w-full",
            "py-[var(--space-3)]",
            "rounded-[var(--radius-lg)]",
            "font-[var(--weight-medium)]",
            "text-[var(--text-sm)]",
            "text-[var(--text-secondary)]",
            "bg-[var(--surface-secondary)]",
            "hover:bg-[var(--surface-hover)]",
            "active:opacity-80",
            "transition-all duration-[var(--duration-fast)]",
            "min-h-[48px]"
          )}
        >
          {t('workout.maybeLater', { defaultValue: 'Maybe Later' })}
        </button>
      </div>
    </div>
  );
}
