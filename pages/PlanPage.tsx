import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutPlan, PlanDay } from '../types';
import { CalendarIcon, TimerIcon, RepeatIcon, FlameIcon, CoffeeIcon, ZapIcon, XMarkIcon } from '../components/icons';
import { Share2 } from 'lucide-react';
import { notify } from '../components/layout/Toast';
import { MiniCalendar, MiniCalendarNavigation, MiniCalendarDays, MiniCalendarDay } from '../components/ui/mini-calendar';
import { startOfWeek, addDays, format, isSameDay } from 'date-fns';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import SharePlanDialog from '../components/SharePlanDialog';
import { useUser } from '@clerk/clerk-react';
import { Id } from '../convex/_generated/dataModel';

interface PlanPageProps {
  activePlan: WorkoutPlan;
  onStartSession: (session: PlanDay) => void;
}

// Calculate estimated duration for a day
const estimateDuration = (day: PlanDay): number => {
  const exercises = day.blocks?.flatMap(b => Array.isArray(b.exercises) ? b.exercises : []) || [];
  // Rough estimate: 3-4 min per exercise
  return exercises.length * 3.5;
};

const WeeklyOverviewCard: React.FC<{
  day: PlanDay;
  dayIndex: number;
  isToday: boolean;
  onClick: () => void;
  progress?: number;
}> = ({ day, dayIndex, isToday, onClick, progress = 0 }) => {
  const { t } = useTranslation();
  const exercises = day.blocks?.flatMap(b => Array.isArray(b.exercises) ? b.exercises : []) || [];
  const hasWorkout = exercises.length > 0;
  const duration = Math.round(estimateDuration(day));
  const blockTypes = day.blocks?.map(b => b.type) || [];
  const hasSuperset = blockTypes.includes('superset');
  const hasAmrap = blockTypes.includes('amrap');
  const inferredProgress = hasWorkout ? Math.min((exercises.length / 8) * 100, 100) : 0;
  const progressValue = progress || inferredProgress;

  const SHORT_DAYS = [t('plan.mon'), t('plan.tue'), t('plan.wed'), t('plan.thu'), t('plan.fri'), t('plan.sat'), t('plan.sun')];

  return (
    <Card
      asChild
      className={cn(
        "w-full max-w-full text-left p-3 transition-all hover:border-[var(--accent)] cursor-pointer shadow-card overflow-hidden",
        isToday && "border-[var(--accent)] shadow-md"
      )}
    >
      <button onClick={onClick}>
        <div className="flex items-center justify-between mb-1.5">
          <CardDescription className={cn("text-[10px] uppercase tracking-wider font-bold", isToday && "text-[var(--accent)]")}>
            {SHORT_DAYS[dayIndex]}
          </CardDescription>
        {isToday && (
          <span className="text-[9px] px-1.5 py-0.5 bg-[var(--accent-light)] text-[var(--accent)] rounded-full font-bold">
            {t('plan.today')}
          </span>
        )}
      </div>

      {hasWorkout ? (
        <>
          <CardTitle className="text-sm font-bold text-[var(--text-primary)] mb-1.5 leading-tight">
            {day.focus}
          </CardTitle>
          <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] mb-1.5">
            <span className="flex items-center gap-1">
              <TimerIcon className="w-3 h-3" />
              ~{duration} {t('workout.min')}
            </span>
            <span>·</span>
            <span>{exercises.length} {t('session.exercises')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {hasSuperset && (
              <span className="text-[9px] px-1.5 py-0.5 bg-[var(--surface-secondary)] text-[var(--text-secondary)] rounded-md font-semibold">
                {t('plan.superset')}
              </span>
            )}
            {hasAmrap && (
              <span className="text-[9px] px-1.5 py-0.5 bg-[var(--surface-secondary)] text-[var(--text-secondary)] rounded-md font-semibold">
                {t('plan.amrap')}
              </span>
            )}
          </div>
          <div className="mt-2">
            <Progress value={progressValue} />
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <CoffeeIcon className="w-4 h-4 text-[var(--accent-mobility)]" />
          <p className="text-[14px] font-semibold text-[var(--text-secondary)]">{t('plan.restDay')}</p>
        </div>
      )}
      </button>
    </Card>
  );
};

const DayDetailView: React.FC<{ day: PlanDay; onStartWorkout: () => void; onClose: () => void }> = ({
  day,
  onStartWorkout,
  onClose
}) => {
  const { t } = useTranslation();
  const exercises = day.blocks?.flatMap(b => Array.isArray(b.exercises) ? b.exercises : []) || [];
  const hasWorkout = exercises.length > 0;

  const WEEKDAYS = [t('plan.monday'), t('plan.tuesday'), t('plan.wednesday'), t('plan.thursday'), t('plan.friday'), t('plan.saturday'), t('plan.sunday')];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center animate-fade-in overflow-hidden" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-[var(--surface)] rounded-t-2xl max-h-[92vh] overflow-y-auto animate-slide-in"
        style={{ boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-[var(--surface)] z-10 border-b border-[var(--border)]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="w-10 h-1 bg-[var(--border-strong)] rounded-full"></div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--surface-secondary)] transition"
              aria-label={t('common.close')}
            >
              <XMarkIcon className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3">
          <div className="mb-4">
            <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
              {WEEKDAYS[day.day_of_week - 1]}
            </p>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1.5">
              {day.focus}
            </h2>
            {hasWorkout && (
              <p className="text-[12px] text-[var(--text-secondary)]">
                ~{Math.round(estimateDuration(day))} {t('workout.min')} · {exercises.length} {t('session.exercises')}
              </p>
            )}
          </div>

          {hasWorkout ? (
            <>
              {/* Blocks */}
              <div className="space-y-3 mb-4">
                {(day.blocks || []).map((block, blockIndex) => {
                  const blockExercises = Array.isArray(block.exercises) ? block.exercises : [];
                  return (
                    <div
                      key={blockIndex}
                      className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[9px] uppercase tracking-wider text-[var(--accent)] font-bold">
                          {block.title || t('plan.block', { number: blockIndex + 1 })}
                        </p>
                        {block.type === 'superset' && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-[var(--accent-light)] text-[var(--accent)] rounded-md font-bold">
                            {(block as any).rounds} {t('plan.rounds')}
                          </span>
                        )}
                        {block.type === 'amrap' && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-[var(--accent-light)] text-[var(--accent)] rounded-md font-bold">
                            {(block as any).duration_minutes} {t('plan.minAmrap')}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        {blockExercises.map((ex, exIndex) => (
                          <div key={exIndex} className="flex items-start justify-between gap-2">
                            <p className="text-[13px] font-medium text-[var(--text-primary)] flex-1">
                              {block.type === 'superset' && `${String.fromCharCode(65 + exIndex)}${exIndex + 1}. `}
                              {ex.exercise_name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
                              {ex.metrics_template?.target_sets && ex.metrics_template?.target_reps && (
                                <span>{ex.metrics_template.target_sets} × {ex.metrics_template.target_reps}</span>
                              )}
                              {ex.rpe && (
                                <span className="text-[var(--accent)]">@{ex.rpe}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Start Button */}
              <Button
                onClick={onStartWorkout}
                variant="accent"
                className="w-full py-3 rounded-xl font-bold text-[14px]"
              >
                <TimerIcon className="w-4 h-4 inline mr-2" />
                {t('plan.startWorkout')}
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-[var(--surface-secondary)] rounded-lg flex items-center justify-center mx-auto mb-3">
                <CoffeeIcon className="w-6 h-6 text-[var(--accent-mobility)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1.5">
                {t('plan.restDay')}
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)]">
                {t('plan.recoveryPartOfPlan')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function PlanPage({ activePlan, onStartSession }: PlanPageProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDay, setSelectedDay] = useState<PlanDay | null>(null);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [showShareDialog, setShowShareDialog] = useState(false);

  const weeklyPlan = Array.isArray(activePlan?.weeklyPlan) ? activePlan.weeklyPlan : [];
  
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
    const dateKey = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()).getTime();
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
    const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
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
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] animate-fade-in flex-1 overflow-y-auto">
      <header className="mb-4">
        <p className="text-[9px] uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-1">
          {t('plan.trainingSchedule')}
        </p>
        <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight mb-1.5">
          {activePlan.name}
        </h1>
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => notify({ type: 'info', message: t('plan.calendarExportComingSoon') })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] transition text-[12px] font-medium text-[var(--text-secondary)]"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            {t('plan.export')}
          </button>
          {user && activePlan._id && (
            <button
              onClick={() => setShowShareDialog(true)}
              className="p-2 rounded-lg bg-[var(--accent-light)] border border-[var(--accent)]/20 hover:bg-[var(--accent)] hover:text-white transition-all"
              title="Share plan with a workout buddy"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Mini Calendar Navigation */}
      <div className="mb-4">
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
                    selectedDate && isSameDay(date, selectedDate) && hasWorkout && 'ring-2 ring-[var(--accent)]'
                  )}
                >
                  {hasWorkout && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)]" />
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
        <div className="mb-4">
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
