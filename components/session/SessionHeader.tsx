import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { XMarkIcon, ClockIcon, DumbbellIcon } from '../icons';
import { PlanExercise, WorkoutBlock, SupersetBlock } from '../../types';

const PauseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
  </svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

interface SessionHeaderProps {
  progress: number;
  currentExerciseGlobalIndex: number;
  totalExercises: number;
  isPaused: boolean;
  startTime: Date;
  isSuperset: boolean;
  showExerciseList: boolean;
  workoutBlocks: WorkoutBlock[];
  currentExercise: PlanExercise;
  currentBlockIndex: number;
  onCancel: () => void;
  onPause: () => void;
  onResume: () => void;
  onToggleExerciseList: () => void;
}

export default function SessionHeader({
  progress,
  currentExerciseGlobalIndex,
  totalExercises,
  isPaused,
  startTime,
  isSuperset,
  showExerciseList,
  workoutBlocks,
  currentExercise,
  currentBlockIndex,
  onCancel,
  onPause,
  onResume,
  onToggleExerciseList,
}: SessionHeaderProps) {
  const { t } = useTranslation();

  const elapsedMinutes = Math.floor((Date.now() - startTime.getTime()) / 60000);
  const elapsedSeconds = Math.floor(((Date.now() - startTime.getTime()) / 1000) % 60);

  return (
    <>
      <div className="sticky top-0 z-[var(--z-sticky)] bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]">
        <div className="px-[var(--space-4)] py-[var(--space-3)]">
          <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-2)]">
            <button
              onClick={onCancel}
              className={cn(
                "p-[var(--space-2)]",
                "min-w-[var(--height-touch-min)] min-h-[var(--height-touch-min)]",
                "flex items-center justify-center",
                "rounded-full",
                "hover:bg-[var(--surface-secondary)]",
                "transition-all duration-[var(--duration-fast)]",
                "active:scale-95"
              )}
              aria-label="Cancel workout"
            >
              <XMarkIcon className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>

            <div className="flex-1">
              {/* Multi-layer progress bar */}
              <div className="relative h-3 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
                {/* Segment markers */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: totalExercises }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 border-r border-[var(--bg-primary)]"
                      style={{ opacity: i < currentExerciseGlobalIndex ? 0 : 0.3 }}
                    />
                  ))}
                </div>

                {/* Progress bar */}
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-[var(--duration-slow)] ease-out relative"
                  style={{
                    width: `${progress * 100}%`,
                    background: 'linear-gradient(90deg, var(--brand-primary) 0%, var(--brand-primary-hover) 100%)'
                  }}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{ animation: 'shimmer 3s ease infinite' }}
                  />
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-sm" />
                </div>

                {/* Milestone markers */}
                {[0.25, 0.5, 0.75].map((milestone, i) => (
                  <div
                    key={i}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 transition-all duration-[var(--duration-normal)] rounded-full",
                      progress >= milestone
                        ? "w-1.5 h-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                        : "w-1 h-4 bg-[var(--border-strong)]"
                    )}
                    style={{
                      left: `${milestone * 100}%`,
                      transform: 'translateX(-50%) translateY(-50%)'
                    }}
                  />
                ))}
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between mt-[var(--space-2)] px-[var(--space-1)]">
                <div className="flex items-center gap-[var(--space-1-5)]">
                  <DumbbellIcon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-xs)] font-[var(--weight-bold)] text-[var(--text-secondary)]">
                    {currentExerciseGlobalIndex + 1} / {totalExercises}
                  </span>
                </div>

                <div className={cn(
                  "flex items-center gap-[var(--space-1-5)]",
                  "px-[var(--space-2-5)] py-[var(--space-1)]",
                  "rounded-full",
                  "bg-[var(--brand-primary-subtle)]",
                  "border border-[var(--brand-primary)]/20"
                )}>
                  <span className="text-[var(--text-xs)] font-[var(--weight-black)] text-[var(--brand-primary)] tabular-nums">
                    {Math.round(progress * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-[var(--space-1-5)]">
                  <ClockIcon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <span className="text-[var(--text-xs)] font-mono font-[var(--weight-bold)] text-[var(--brand-primary)] tabular-nums">
                    {elapsedMinutes}:{String(elapsedSeconds).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {isSuperset && (
                <p className="text-center mt-[var(--space-1)]">
                  <span className="text-[10px] font-[var(--weight-bold)] text-[var(--brand-primary)] uppercase tracking-[var(--tracking-wide)]">
                    {t('session.superset')}
                  </span>
                </p>
              )}
            </div>

            <button
              onClick={onToggleExerciseList}
              className={cn(
                "flex items-center gap-[var(--space-1)]",
                "px-[var(--space-3)] py-[var(--space-2)]",
                "bg-[var(--surface-primary)]",
                "rounded-[var(--radius-xl)]",
                "border border-[var(--border-default)]",
                "hover:border-[var(--brand-primary)]",
                "hover:bg-[var(--brand-primary-subtle)]",
                "transition-all duration-[var(--duration-fast)]",
                "active:scale-95"
              )}
            >
              <span className="text-[var(--text-2xs)] font-[var(--weight-bold)] text-[var(--brand-primary)]">
                {showExerciseList ? '▼' : 'List'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Exercise List Overlay */}
      {showExerciseList && (
        <div className={cn(
          "bg-[var(--surface-primary)]",
          "border-b border-[var(--border-default)]",
          "px-[var(--space-3)] py-[var(--space-2)]",
          "max-h-48 overflow-y-auto"
        )}>
          <p className="text-[9px] uppercase text-[var(--text-tertiary)] font-[var(--weight-bold)] mb-[var(--space-2)]">
            {t('session.todaysWorkout')}
          </p>
          {workoutBlocks.map((block, i) => (
            <div key={i} className="mb-[var(--space-2)]">
              <p className="text-[10px] font-[var(--weight-bold)] text-[var(--text-secondary)] mb-[var(--space-1)]">
                {block.title || t('plan.block', { number: i+1 })}
              </p>
              {(Array.isArray(block.exercises) ? block.exercises : []).map((ex, j) => (
                <p key={j} className={cn(
                  "text-[var(--text-2xs)]",
                  ex?.exercise_name === currentExercise?.exercise_name
                    ? "text-[var(--brand-primary)] font-[var(--weight-semibold)]"
                    : "text-[var(--text-tertiary)]"
                )}>
                  • {ex?.exercise_name || '?'}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
