import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutPlan, PlanDay } from '../types';
import { CalendarIcon, TimerIcon, CoffeeIcon, XMarkIcon } from '../components/icons';
import { Share2 } from 'lucide-react';
import { notify } from '../components/layout/Toast';
import { MiniCalendar, MiniCalendarNavigation, MiniCalendarDays, MiniCalendarDay } from '../components/ui/mini-calendar';
import { startOfWeek, addDays, isSameDay } from 'date-fns';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import SharePlanDialog from '../components/SharePlanDialog';
import { useUser } from '@clerk/clerk-react';
import { Id } from '../convex/_generated/dataModel';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '../components/ui/PullToRefreshIndicator';

/* ═══════════════════════════════════════════════════════════════
   PLAN PAGE - Phase 9.4 Page Redesign

   Weekly workout plan view with calendar navigation.
   Uses design tokens for consistent styling.
   ═══════════════════════════════════════════════════════════════ */

interface PlanPageProps {
  activePlan: WorkoutPlan;
  onStartSession: (session: PlanDay) => void;
}

// Helper to get all exercises from a day (handles both blocks and sessions)
const getExercisesFromDay = (day: PlanDay): any[] => {
  const exercises: any[] = [];
  // Single session day: day.blocks
  if (day.blocks && Array.isArray(day.blocks)) {
    day.blocks.forEach(block => {
      if (block.exercises) exercises.push(...block.exercises);
    });
  }
  // 2x daily training: day.sessions
  if ((day as any).sessions && Array.isArray((day as any).sessions)) {
    (day as any).sessions.forEach((session: any) => {
      if (session.blocks && Array.isArray(session.blocks)) {
        session.blocks.forEach((block: any) => {
          if (block.exercises) exercises.push(...block.exercises);
        });
      }
    });
  }
  return exercises;
};

// Check if day has 2x daily training
const hasTwoADaySessions = (day: PlanDay): boolean => {
  return !!(day as any).sessions && Array.isArray((day as any).sessions) && (day as any).sessions.length > 0;
};

// Get block types from a day (handles both blocks and sessions)
const getBlockTypes = (day: PlanDay): string[] => {
  const types: string[] = [];
  if (day.blocks) {
    types.push(...day.blocks.map(b => b.type));
  }
  if ((day as any).sessions) {
    (day as any).sessions.forEach((session: any) => {
      if (session.blocks) {
        types.push(...session.blocks.map((b: any) => b.type));
      }
    });
  }
  return types;
};

// Calculate estimated duration for a day (handles both blocks and sessions)
const estimateDuration = (day: PlanDay): number => {
  const exercises = getExercisesFromDay(day);
  // Rough estimate: 3-4 min per exercise
  return exercises.length * 3.5;
};

/* ───────────────────────────────────────────────────────────────
   Weekly Overview Card Component
   ─────────────────────────────────────────────────────────────── */

const WeeklyOverviewCard: React.FC<{
  day: PlanDay;
  dayIndex: number;
  isToday: boolean;
  onClick: () => void;
  progress?: number;
}> = ({ day, dayIndex, isToday, onClick, progress = 0 }) => {
  const { t } = useTranslation();
  const exercises = getExercisesFromDay(day);
  const hasWorkout = exercises.length > 0;
  const duration = Math.round(estimateDuration(day));
  const blockTypes = getBlockTypes(day);
  const hasSuperset = blockTypes.includes('superset');
  const hasAmrap = blockTypes.includes('amrap');
  const is2xDaily = hasTwoADaySessions(day);
  const inferredProgress = hasWorkout ? Math.min((exercises.length / 8) * 100, 100) : 0;
  const progressValue = progress || inferredProgress;

  const SHORT_DAYS = [t('plan.mon'), t('plan.tue'), t('plan.wed'), t('plan.thu'), t('plan.fri'), t('plan.sat'), t('plan.sun')];

  return (
    <Card
      asChild
      className={cn(
        'w-full max-w-full text-left',
        'p-[var(--space-4)]',
        'transition-all duration-[var(--duration-fast)]',
        'hover:border-[var(--brand-primary)]',
        'cursor-pointer',
        'shadow-[var(--shadow-sm)]',
        'overflow-hidden',
        isToday && 'border-[var(--brand-primary)] border-2 shadow-[var(--shadow-glow-brand)] scale-[1.02]'
      )}
    >
      <button onClick={onClick}>
        <div className="flex items-center justify-between mb-[var(--space-2)]">
          <CardDescription
            className={cn(
              'text-[var(--text-2xs)]',
              'uppercase tracking-[var(--tracking-wider)]',
              'font-[var(--weight-bold)]',
              isToday && 'text-[var(--brand-primary)]'
            )}
          >
            {SHORT_DAYS[dayIndex]}
          </CardDescription>
          {isToday && (
            <span
              className={cn(
                'text-[var(--text-2xs)]',
                'px-[var(--space-2)] py-[var(--space-0-5)]',
                'bg-[var(--brand-primary-subtle)]',
                'text-[var(--brand-primary)]',
                'rounded-full',
                'font-[var(--weight-bold)]'
              )}
            >
              {t('plan.today')}
            </span>
          )}
        </div>

        {hasWorkout ? (
          <>
            <CardTitle
              className={cn(
                'text-[var(--text-sm)]',
                'font-[var(--weight-bold)]',
                'text-[var(--text-primary)]',
                'mb-[var(--space-2)]',
                'leading-tight'
              )}
            >
              {day.focus}
            </CardTitle>
            <div
              className={cn(
                'flex items-center gap-[var(--space-2)]',
                'text-[var(--text-2xs)]',
                'text-[var(--text-secondary)]',
                'mb-[var(--space-2)]'
              )}
            >
              <span className="flex items-center gap-[var(--space-1)]">
                <TimerIcon className="w-3 h-3" />
                ~{duration} {t('workout.min')}
              </span>
              <span>·</span>
              <span>{exercises.length} {t('session.exercises')}</span>
            </div>
            <div className="flex items-center gap-[var(--space-2)] flex-wrap">
              {is2xDaily && (
                <span
                  className={cn(
                    'text-[var(--text-2xs)]',
                    'px-[var(--space-2)] py-[var(--space-0-5)]',
                    'bg-[var(--brand-primary-subtle)]',
                    'text-[var(--brand-primary)]',
                    'rounded-[var(--radius-lg)]',
                    'font-[var(--weight-bold)]'
                  )}
                >
                  ☀️🌙 2x Daily
                </span>
              )}
              {hasSuperset && (
                <span
                  className={cn(
                    'text-[var(--text-2xs)]',
                    'px-[var(--space-2)] py-[var(--space-0-5)]',
                    'bg-[var(--surface-secondary)]',
                    'text-[var(--text-secondary)]',
                    'rounded-[var(--radius-lg)]',
                    'font-[var(--weight-semibold)]'
                  )}
                >
                  {t('plan.superset')}
                </span>
              )}
              {hasAmrap && (
                <span
                  className={cn(
                    'text-[var(--text-2xs)]',
                    'px-[var(--space-2)] py-[var(--space-0-5)]',
                    'bg-[var(--surface-secondary)]',
                    'text-[var(--text-secondary)]',
                    'rounded-[var(--radius-lg)]',
                    'font-[var(--weight-semibold)]'
                  )}
                >
                  {t('plan.amrap')}
                </span>
              )}
            </div>
            <div className="mt-[var(--space-3)]">
              <Progress value={progressValue} />
            </div>
          </>
        ) : (
          <div className="flex items-center gap-[var(--space-2)]">
            <CoffeeIcon className="w-4 h-4 text-[var(--accent-mobility)]" />
            <p
              className={cn(
                'text-[var(--text-sm)]',
                'font-[var(--weight-semibold)]',
                'text-[var(--text-secondary)]'
              )}
            >
              {t('plan.restDay')}
            </p>
          </div>
        )}
      </button>
    </Card>
  );
};

/* ───────────────────────────────────────────────────────────────
   Day Detail View Modal
   ─────────────────────────────────────────────────────────────── */

const DayDetailView: React.FC<{
  day: PlanDay;
  onStartWorkout: () => void;
  onClose: () => void;
}> = ({ day, onStartWorkout, onClose }) => {
  const { t } = useTranslation();
  const exercises = getExercisesFromDay(day);
  const hasWorkout = exercises.length > 0;
  const is2xDaily = hasTwoADaySessions(day);

  const WEEKDAYS = [
    t('plan.monday'),
    t('plan.tuesday'),
    t('plan.wednesday'),
    t('plan.thursday'),
    t('plan.friday'),
    t('plan.saturday'),
    t('plan.sunday'),
  ];

  return (
    <div
      className={cn(
        'fixed inset-0',
        'z-[var(--z-modal)]',
        'bg-black/80 backdrop-blur-sm',
        'flex items-end justify-center',
        'animate-fade-in',
        'overflow-hidden'
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full max-w-2xl',
          'bg-[var(--surface-primary)]',
          'rounded-t-[var(--radius-2xl)]',
          'max-h-[92vh]',
          'overflow-y-auto',
          'animate-slide-in',
          'shadow-[var(--shadow-lg)]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div
          className={cn(
            'sticky top-0',
            'bg-[var(--surface-primary)]',
            'z-[var(--z-sticky)]',
            'border-b border-[var(--border-default)]'
          )}
        >
          <div
            className={cn(
              'flex items-center justify-between',
              'px-[var(--space-4)] py-[var(--space-3)]'
            )}
          >
            <div
              className={cn(
                'w-10 h-1',
                'bg-[var(--border-strong)]',
                'rounded-full'
              )}
            />
            <button
              onClick={onClose}
              className={cn(
                'p-[var(--space-2)]',
                'rounded-[var(--radius-lg)]',
                'hover:bg-[var(--surface-secondary)]',
                'transition-colors duration-[var(--duration-fast)]'
              )}
              aria-label={t('common.close')}
            >
              <XMarkIcon className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className={cn(
            'px-[var(--space-4)]',
            'pb-[calc(var(--space-6)+env(safe-area-inset-bottom))]',
            'pt-[var(--space-3)]'
          )}
        >
          <div className="mb-[var(--space-4)]">
            <p
              className={cn(
                'text-[var(--text-2xs)]',
                'uppercase tracking-[var(--tracking-wider)]',
                'text-[var(--text-tertiary)]',
                'font-[var(--weight-bold)]',
                'mb-[var(--space-1)]'
              )}
            >
              {WEEKDAYS[day.day_of_week - 1]}
            </p>
            <h2
              className={cn(
                'text-[var(--text-xl)]',
                'font-[var(--weight-bold)]',
                'text-[var(--text-primary)]',
                'mb-[var(--space-2)]'
              )}
            >
              {day.focus}
            </h2>
            {hasWorkout && (
              <p
                className={cn(
                  'text-[var(--text-xs)]',
                  'text-[var(--text-secondary)]'
                )}
              >
                ~{Math.round(estimateDuration(day))} {t('workout.min')} · {exercises.length} {t('session.exercises')}
              </p>
            )}
          </div>

          {hasWorkout ? (
            <>
              {/* 2x Daily Sessions or Regular Blocks */}
              <div className="space-y-[var(--space-3)] mb-[var(--space-4)]">
                {is2xDaily && (day as any).sessions ? (
                  /* 2x Daily Training - Show AM/PM Sessions */
                  ((day as any).sessions as any[]).map((session: any, sessionIdx: number) => (
                    <div key={`session-${sessionIdx}`}>
                      {/* Session Header */}
                      <div className={cn(
                        'flex items-center gap-[var(--space-2)]',
                        'mb-[var(--space-2)]',
                        'pb-[var(--space-2)]',
                        'border-b border-[var(--border-default)]'
                      )}>
                        <span className="text-lg">{session.time_of_day === 'morning' ? '☀️' : '🌙'}</span>
                        <span className={cn(
                          'text-[var(--text-sm)]',
                          'font-[var(--weight-bold)]',
                          'text-[var(--brand-primary)]'
                        )}>
                          {session.session_name || (session.time_of_day === 'morning' ? 'Morning Session' : 'Evening Session')}
                        </span>
                        {session.estimated_duration && (
                          <span className="text-[var(--text-2xs)] text-[var(--text-tertiary)]">
                            ~{session.estimated_duration} min
                          </span>
                        )}
                      </div>
                      {/* Session Blocks */}
                      {(session.blocks || []).map((block: any, blockIndex: number) => {
                        const blockExercises = Array.isArray(block.exercises) ? block.exercises : [];
                        return (
                          <div
                            key={blockIndex}
                            className={cn(
                              'bg-[var(--surface-secondary)]',
                              'border border-[var(--border-default)]',
                              'rounded-[var(--radius-xl)]',
                              'p-[var(--space-4)]',
                              'mb-[var(--space-2)]'
                            )}
                          >
                            <div className={cn('flex items-center justify-between', 'mb-[var(--space-3)]')}>
                              <p className={cn('text-[var(--text-2xs)]', 'uppercase tracking-[var(--tracking-wider)]', 'text-[var(--brand-primary)]', 'font-[var(--weight-bold)]')}>
                                {block.title || t('plan.block', { number: blockIndex + 1 })}
                              </p>
                            </div>
                            <div className="space-y-[var(--space-2)]">
                              {blockExercises.map((ex: any, exIndex: number) => (
                                <div key={exIndex} className={cn('flex items-start justify-between', 'gap-[var(--space-2)]')}>
                                  <p className={cn('text-[var(--text-sm)]', 'font-[var(--weight-medium)]', 'text-[var(--text-primary)]', 'flex-1')}>
                                    {ex.exercise_name}
                                  </p>
                                  <div className={cn('flex items-center gap-[var(--space-2)]', 'text-[var(--text-2xs)]', 'text-[var(--text-tertiary)]')}>
                                    {ex.metrics_template?.target_sets && ex.metrics_template?.target_reps && (
                                      <span>{ex.metrics_template.target_sets} × {ex.metrics_template.target_reps}</span>
                                    )}
                                    {ex.rpe && <span className="text-[var(--brand-primary)]">@{ex.rpe}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  /* Single Session - Regular Blocks */
                  (day.blocks || []).map((block, blockIndex) => {
                    const blockExercises = Array.isArray(block.exercises) ? block.exercises : [];
                    return (
                      <div
                        key={blockIndex}
                        className={cn(
                          'bg-[var(--surface-secondary)]',
                          'border border-[var(--border-default)]',
                          'rounded-[var(--radius-xl)]',
                          'p-[var(--space-4)]'
                        )}
                      >
                        <div
                          className={cn(
                            'flex items-center justify-between',
                            'mb-[var(--space-3)]'
                          )}
                        >
                          <p
                            className={cn(
                              'text-[var(--text-2xs)]',
                              'uppercase tracking-[var(--tracking-wider)]',
                              'text-[var(--brand-primary)]',
                              'font-[var(--weight-bold)]'
                            )}
                          >
                            {block.title || t('plan.block', { number: blockIndex + 1 })}
                          </p>
                          {block.type === 'superset' && (
                            <span
                              className={cn(
                                'text-[var(--text-2xs)]',
                                'px-[var(--space-2)] py-[var(--space-0-5)]',
                                'bg-[var(--brand-primary-subtle)]',
                                'text-[var(--brand-primary)]',
                                'rounded-[var(--radius-lg)]',
                                'font-[var(--weight-bold)]'
                              )}
                            >
                              {(block as any).rounds} {t('plan.rounds')}
                            </span>
                          )}
                          {block.type === 'amrap' && (
                            <span
                              className={cn(
                                'text-[var(--text-2xs)]',
                                'px-[var(--space-2)] py-[var(--space-0-5)]',
                                'bg-[var(--brand-primary-subtle)]',
                                'text-[var(--brand-primary)]',
                                'rounded-[var(--radius-lg)]',
                                'font-[var(--weight-bold)]'
                              )}
                            >
                              {(block as any).duration_minutes} {t('plan.minAmrap')}
                            </span>
                          )}
                        </div>

                        <div className="space-y-[var(--space-2)]">
                          {blockExercises.map((ex, exIndex) => (
                            <div
                              key={exIndex}
                              className={cn(
                                'flex items-start justify-between',
                                'gap-[var(--space-2)]'
                              )}
                            >
                              <p
                                className={cn(
                                  'text-[var(--text-sm)]',
                                  'font-[var(--weight-medium)]',
                                  'text-[var(--text-primary)]',
                                  'flex-1'
                                )}
                              >
                                {block.type === 'superset' && `${String.fromCharCode(65 + exIndex)}${exIndex + 1}. `}
                                {ex.exercise_name}
                              </p>
                              <div
                                className={cn(
                                  'flex items-center gap-[var(--space-2)]',
                                  'text-[var(--text-2xs)]',
                                  'text-[var(--text-tertiary)]'
                                )}
                              >
                                {ex.metrics_template?.target_sets && ex.metrics_template?.target_reps && (
                                  <span>{ex.metrics_template.target_sets} × {ex.metrics_template.target_reps}</span>
                                )}
                                {ex.rpe && (
                                  <span className="text-[var(--brand-primary)]">@{ex.rpe}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Start Button */}
              <Button
                onClick={onStartWorkout}
                variant="accent"
                className={cn(
                  'w-full',
                  'py-[var(--space-4)]',
                  'rounded-[var(--radius-xl)]',
                  'font-[var(--weight-bold)]',
                  'text-[var(--text-sm)]'
                )}
              >
                <TimerIcon className="w-4 h-4 inline mr-[var(--space-2)]" />
                {t('plan.startWorkout')}
              </Button>
            </>
          ) : (
            <div className="text-center py-[var(--space-8)]">
              <div
                className={cn(
                  'w-12 h-12',
                  'bg-[var(--surface-secondary)]',
                  'rounded-[var(--radius-xl)]',
                  'flex items-center justify-center',
                  'mx-auto',
                  'mb-[var(--space-3)]'
                )}
              >
                <CoffeeIcon className="w-6 h-6 text-[var(--accent-mobility)]" />
              </div>
              <h3
                className={cn(
                  'text-[var(--text-lg)]',
                  'font-[var(--weight-bold)]',
                  'text-[var(--text-primary)]',
                  'mb-[var(--space-2)]'
                )}
              >
                {t('plan.restDay')}
              </h3>
              <p
                className={cn(
                  'text-[var(--text-sm)]',
                  'text-[var(--text-secondary)]'
                )}
              >
                {t('plan.recoveryPartOfPlan')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Main PlanPage Component
   ═══════════════════════════════════════════════════════════════ */

export default function PlanPage({ activePlan, onStartSession }: PlanPageProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDay, setSelectedDay] = useState<PlanDay | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showShareDialog, setShowShareDialog] = useState(false);

  const weeklyPlan = Array.isArray(activePlan?.weeklyPlan) ? activePlan.weeklyPlan : [];

  // Pull-to-refresh
  const { pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      // Data automatically refreshes via Convex real-time subscriptions
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  });

  // Update weekStart when selectedDate changes to a different week
  useEffect(() => {
    if (selectedDate) {
      const newWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      setWeekStart((currentWeekStart) => {
        // Only update if it's a different week
        if (newWeekStart.getTime() !== currentWeekStart.getTime()) {
          return newWeekStart;
        }
        return currentWeekStart;
      });
    }
  }, [selectedDate]);

  // Map dates to plan days
  const dateToPlanDay = useMemo(() => {
    const map = new Map<number, PlanDay>();
    weeklyPlan.forEach((day) => {
      // day.day_of_week is 1 (Monday) to 7 (Sunday)
      const date = addDays(weekStart, day.day_of_week - 1);
      map.set(date.getTime(), day);
    });
    return map;
  }, [weeklyPlan, weekStart]);

  // Get the plan day for the selected date
  const selectedPlanDay = useMemo(() => {
    if (!selectedDate) return null;
    // Find matching day within the week
    for (const [timestamp, day] of dateToPlanDay.entries()) {
      const planDate = new Date(timestamp);
      if (
        planDate.getFullYear() === selectedDate.getFullYear() &&
        planDate.getMonth() === selectedDate.getMonth() &&
        planDate.getDate() === selectedDate.getDate()
      ) {
        return day;
      }
    }
    return null;
  }, [selectedDate, dateToPlanDay]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    for (const [timestamp, day] of dateToPlanDay.entries()) {
      const planDate = new Date(timestamp);
      if (
        planDate.getFullYear() === date.getFullYear() &&
        planDate.getMonth() === date.getMonth() &&
        planDate.getDate() === date.getDate()
      ) {
        setSelectedDay(day);
        return;
      }
    }
    setSelectedDay(null);
  };

  const handleStartWorkout = () => {
    if (selectedPlanDay) {
      setSelectedDay(null);
      onStartSession(selectedPlanDay);
    }
  };

  return (
    <div
      className={cn(
        'w-full max-w-lg mx-auto',
        'px-[var(--space-4)]',
        'pt-[env(safe-area-inset-top)]', // Tight to Dynamic Island
        'pb-[calc(var(--height-tab-bar)+var(--space-6)+env(safe-area-inset-bottom))]',
        'animate-fade-in',
        'flex-1',
        'overflow-y-auto'
      )}
    >
      {/* Pull-to-refresh indicator */}
      <PullToRefreshIndicator distance={pullDistance} isRefreshing={isRefreshing} isTriggered={pullDistance >= 80} />

      {/* Header */}
      <header className="mb-[var(--space-4)]">
        <p
          className={cn(
            'text-[var(--text-2xs)]',
            'uppercase tracking-[var(--tracking-wider)]',
            'text-[var(--text-tertiary)]',
            'font-[var(--weight-semibold)]',
            'mb-[var(--space-1)]'
          )}
        >
          {t('plan.trainingSchedule')}
        </p>
        <h1
          className={cn(
            'text-[var(--text-xl)]',
            'font-[var(--weight-bold)]',
            'text-[var(--text-primary)]',
            'leading-tight',
            'mb-[var(--space-2)]'
          )}
        >
          {activePlan.name}
        </h1>
        <div className="flex items-center gap-[var(--space-2)] mb-[var(--space-4)]">
          <button
            onClick={() => notify({ type: 'info', message: t('plan.calendarExportComingSoon') })}
            className={cn(
              'flex items-center gap-[var(--space-2)]',
              'px-[var(--space-3)] py-[var(--space-2)]',
              'rounded-[var(--radius-lg)]',
              'bg-[var(--surface-primary)]',
              'border border-[var(--border-strong)]',
              'hover:bg-[var(--surface-secondary)]',
              'transition-colors duration-[var(--duration-fast)]',
              'text-[var(--text-xs)]',
              'font-[var(--weight-medium)]',
              'text-[var(--text-secondary)]'
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            {t('plan.export')}
          </button>
          {user && activePlan._id && (
            <button
              onClick={() => setShowShareDialog(true)}
              className={cn(
                'p-[var(--space-2)]',
                'rounded-[var(--radius-lg)]',
                'bg-[var(--brand-primary-subtle)]',
                'border border-[var(--brand-primary)]/20',
                'hover:bg-[var(--brand-primary)]',
                'hover:text-[var(--text-on-brand)]',
                'transition-all duration-[var(--duration-fast)]'
              )}
              title="Share plan with a workout buddy"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Mini Calendar Navigation */}
      <div className="mb-[var(--space-4)]">
        <MiniCalendar
          value={selectedDate}
          onValueChange={handleDateSelect}
          startDate={weekStart}
          onStartDateChange={(date) => date && setWeekStart(date)}
          days={7}
          className="w-full"
        >
          <MiniCalendarNavigation direction="prev" />
          <MiniCalendarDays>
            {(date) => {
              const planDay = dateToPlanDay.get(date.getTime());
              const hasWorkout = planDay && (planDay.blocks || []).flatMap(b => Array.isArray(b.exercises) ? b.exercises : []).length > 0;

              return (
                <MiniCalendarDay
                  date={date}
                  className={cn(
                    hasWorkout && 'relative',
                    selectedDate && isSameDay(date, selectedDate) && hasWorkout && 'ring-2 ring-[var(--brand-primary)]'
                  )}
                >
                  {hasWorkout && (
                    <div
                      className={cn(
                        'absolute bottom-1 left-1/2 -translate-x-1/2',
                        'w-1 h-1',
                        'rounded-full',
                        'bg-[var(--brand-primary)]'
                      )}
                    />
                  )}
                </MiniCalendarDay>
              );
            }}
          </MiniCalendarDays>
          <MiniCalendarNavigation direction="next" />
        </MiniCalendar>
      </div>

      {/* Selected Day Details */}
      {selectedPlanDay && (
        <div className="mb-[var(--space-4)]">
          <WeeklyOverviewCard
            day={selectedPlanDay}
            dayIndex={selectedDate ? (selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1) : 0}
            isToday={selectedDate ? isSameDay(selectedDate, new Date()) : false}
            onClick={() => setSelectedDay(selectedPlanDay)}
          />
        </div>
      )}

      {/* Day Detail Modal */}
      {selectedDay && (
        <DayDetailView
          day={selectedDay}
          onStartWorkout={handleStartWorkout}
          onClose={() => setSelectedDay(null)}
        />
      )}

      {/* Share Plan Dialog */}
      {user && activePlan._id && (
        <SharePlanDialog
          planId={activePlan._id as Id<"workoutPlans">}
          planName={activePlan.name}
          userId={user.id}
          isOpen={showShareDialog}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
}
