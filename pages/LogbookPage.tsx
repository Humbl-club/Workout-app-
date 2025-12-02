import React from 'react';
import { useTranslation } from 'react-i18next';
import { useVirtualizer } from '@tanstack/react-virtual';
import { WorkoutLog, LoggedExercise, LoggedSetSRW } from '../types';
import { DumbbellIcon, TrashIcon } from '../components/icons';
import { cn } from '../lib/utils';
import { useSwipeToDelete } from '../hooks/useSwipeToDelete';

/* ═══════════════════════════════════════════════════════════════
   LOGBOOK PAGE - Phase 9.4 Page Redesign

   Workout history and session logs.
   Uses design tokens for consistent styling.
   ═══════════════════════════════════════════════════════════════ */

/* ───────────────────────────────────────────────────────────────
   Logged Exercise Card Component
   ─────────────────────────────────────────────────────────────── */

const LoggedExerciseCard: React.FC<{ exercise: LoggedExercise }> = ({ exercise }) => {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'bg-[var(--surface-secondary)]',
        'p-[var(--space-4)]',
        'rounded-[var(--radius-xl)]'
      )}
    >
      <h4
        className={cn(
          'font-[var(--weight-semibold)]',
          'text-[var(--text-base)]',
          'text-[var(--text-primary)]',
          'mb-[var(--space-3)]'
        )}
      >
        {exercise.exercise_name}
      </h4>
      <ul className="space-y-[var(--space-2)] text-[var(--text-sm)] text-[var(--text-secondary)] font-mono">
        {exercise.sets.map((set, index) => (
          <li
            key={index}
            className="flex justify-between items-center"
          >
            <span className="text-[var(--text-tertiary)]">
              {t('logbook.set')} {set.set}
            </span>
            {'weight' in set ? (
              <span className="font-[var(--weight-semibold)]">
                {set.weight} {t('logbook.kg')} × {set.reps} {t('logbook.reps')}
                {(set as LoggedSetSRW).rpe ? (
                  <span className="text-[var(--brand-primary)] ml-[var(--space-2)]">
                    @{(set as LoggedSetSRW).rpe}
                  </span>
                ) : (
                  ''
                )}
              </span>
            ) : (
              <span className="font-[var(--weight-semibold)]">
                {set.duration_s}
                {t('logbook.seconds')}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ───────────────────────────────────────────────────────────────
   Log Card Component
   ─────────────────────────────────────────────────────────────── */

const LogCard: React.FC<{ log: WorkoutLog; onDelete?: (logId: string) => Promise<void> }> = ({ log, onDelete }) => {
  const { t } = useTranslation();
  const logDate = new Date(log.date);

  const {
    elementRef,
    swipeDistance,
    showDeleteButton,
    isDeleting,
    handleDelete,
  } = useSwipeToDelete({
    onDelete: async () => {
      if (onDelete && log.id) {
        await onDelete(log.id);
      }
    },
    disabled: !onDelete,
  });

  return (
    <div className="relative overflow-hidden rounded-[var(--radius-xl)]">
      {/* Delete button (revealed on swipe) */}
      {showDeleteButton && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-[var(--space-4)] bg-[var(--status-error-bg)] rounded-r-[var(--radius-xl)]">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={cn(
              'p-[var(--space-3)]',
              'rounded-[var(--radius-lg)]',
              'bg-white/20',
              'hover:bg-white/30',
              'transition-all duration-[var(--duration-fast)]',
              'active:scale-95',
              isDeleting && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Delete workout log"
          >
            <TrashIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {/* Swipeable card content */}
      <div
        ref={elementRef as React.RefObject<HTMLDivElement>}
        className={cn(
          'bg-[var(--surface-primary)]',
          'border border-[var(--border-default)]',
          'rounded-[var(--radius-xl)]',
          'p-[var(--space-5)]',
          'shadow-[var(--shadow-sm)]',
          'transition-transform duration-[var(--duration-fast)]',
          isDeleting && 'opacity-50'
        )}
        style={{
          transform: `translateX(-${swipeDistance}px)`,
        }}
      >
      <div
        className={cn(
          'border-b border-[var(--border-default)]',
          'pb-[var(--space-4)]',
          'mb-[var(--space-4)]'
        )}
      >
        <p
          className={cn(
            'text-[var(--text-2xs)]',
            'uppercase tracking-[var(--tracking-wider)]',
            'text-[var(--text-tertiary)]',
            'font-[var(--weight-bold)]',
            'mb-[var(--space-2)]'
          )}
        >
          {logDate.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <h3
          className={cn(
            'text-[var(--text-xl)]',
            'font-[var(--weight-bold)]',
            'text-[var(--text-primary)]'
          )}
        >
          {log.focus}
        </h3>
        <p
          className={cn(
            'text-[var(--text-sm)]',
            'text-[var(--text-secondary)]',
            'mt-[var(--space-1)]'
          )}
        >
          {log.durationMinutes} {t('logbook.minSession')}
        </p>
      </div>
      <div className="space-y-[var(--space-3)]">
        {log.exercises.map((ex) => (
          <LoggedExerciseCard key={ex.exercise_name} exercise={ex} />
        ))}
      </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Main Logbook Component
   ═══════════════════════════════════════════════════════════════ */

export default function LogbookPage({ logs, onDeleteLog }: { logs: WorkoutLog[]; onDeleteLog?: (logId: string) => Promise<void> }) {
  const { t } = useTranslation();
  const parentRef = React.useRef<HTMLDivElement>(null);

  // Sort logs by date (newest first)
  const sortedLogs = React.useMemo(() => {
    if (!Array.isArray(logs) || logs.length === 0) return [];
    return logs.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs]);

  // Virtual scrolling for performance with large lists
  const virtualizer = useVirtualizer({
    count: sortedLogs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated height of LogCard (~180px + spacing)
    overscan: 3, // Render 3 extra items above/below viewport
  });

  const hasLogs = Array.isArray(logs) && logs.length > 0;

  return (
    <div
      className={cn(
        'w-full max-w-2xl mx-auto',
        'px-[var(--space-5)]',
        'pt-[max(var(--space-6),env(safe-area-inset-top))]',
        'pb-[calc(var(--height-tab-bar)+var(--space-6)+env(safe-area-inset-bottom))]',
        'animate-fade-in',
        'flex-1'
      )}
    >
      {/* Header */}
      <header className="mb-[var(--space-8)]">
        <p
          className={cn(
            'text-[var(--text-2xs)]',
            'uppercase tracking-[var(--tracking-wider)]',
            'text-[var(--text-tertiary)]',
            'font-[var(--weight-semibold)]',
            'mb-[var(--space-2)]'
          )}
        >
          {t('logbook.trainingHistory')}
        </p>
        <h1
          className={cn(
            'text-[var(--text-2xl)]',
            'font-[var(--weight-bold)]',
            'text-[var(--text-primary)]',
            'leading-tight'
          )}
        >
          {t('logbook.logbook')}
        </h1>
      </header>

      <main
        ref={parentRef}
        className={cn(
          'pb-[var(--space-4)]',
          hasLogs && 'overflow-auto' // Enable scroll only when there are logs
        )}
        style={{
          height: hasLogs ? 'calc(100vh - 280px)' : 'auto', // Fixed height for virtual scrolling
        }}
      >
        {hasLogs ? (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const log = sortedLogs[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div className="pb-[var(--space-4)]">
                    <LogCard log={log} onDelete={onDeleteLog} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={cn(
              'text-center',
              'py-[var(--space-8)]',
              'flex flex-col items-center justify-center',
              'bg-[var(--surface-primary)]',
              'border border-[var(--border-default)]',
              'rounded-[var(--radius-xl)]',
              'shadow-[var(--shadow-sm)]'
            )}
          >
            <div
              className={cn(
                'w-16 h-16',
                'bg-gradient-to-br from-[var(--brand-primary-subtle)] to-[var(--surface-secondary)]',
                'rounded-[var(--radius-2xl)]',
                'flex items-center justify-center',
                'mb-[var(--space-4)]'
              )}
            >
              <DumbbellIcon className="h-8 w-8 text-[var(--brand-primary)]" />
            </div>
            <h3
              className={cn(
                'text-[var(--text-xl)]',
                'font-[var(--weight-bold)]',
                'text-[var(--text-primary)]',
                'mb-[var(--space-2)]'
              )}
            >
              {t('logbook.noLogsYet')}
            </h3>
            <p
              className={cn(
                'text-[var(--text-sm)]',
                'text-[var(--text-secondary)]',
                'max-w-[280px]',
                'px-[var(--space-4)]',
                'mb-[var(--space-5)]',
                'leading-relaxed'
              )}
            >
              {t('logbook.completeFirstWorkout')}
            </p>
            <p
              className={cn(
                'text-[var(--text-xs)]',
                'text-[var(--text-tertiary)]',
                'flex items-center justify-center gap-[var(--space-2)]'
              )}
            >
              <span
                className={cn(
                  'inline-block w-2 h-2',
                  'rounded-full',
                  'bg-[var(--brand-primary)]',
                  'animate-pulse'
                )}
              />
              Your workout history will appear here
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
