import React, { useState } from 'react';
import { WorkoutPlan, PlanDay } from '../types';
import { CalendarIcon, TimerIcon, RepeatIcon, FlameIcon, CoffeeIcon, ZapIcon, XMarkIcon } from '../components/icons';
import { notify } from '../components/layout/Toast';

interface PlanPageProps {
  activePlan: WorkoutPlan;
  onStartSession: (session: PlanDay) => void;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
}> = ({ day, dayIndex, isToday, onClick }) => {
  const exercises = day.blocks?.flatMap(b => Array.isArray(b.exercises) ? b.exercises : []) || [];
  const hasWorkout = exercises.length > 0;
  const duration = Math.round(estimateDuration(day));
  const blockTypes = day.blocks?.map(b => b.type) || [];
  const hasSuperset = blockTypes.includes('superset');
  const hasAmrap = blockTypes.includes('amrap');

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-[var(--surface)] border rounded-lg p-4 transition-all hover:border-[var(--accent)] ${
        isToday ? 'border-[var(--accent)]' : 'border-[var(--border)]'
      }`}
      style={{ boxShadow: isToday ? 'var(--glow-red)' : 'var(--shadow-sm)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className={`text-[11px] uppercase tracking-wider font-bold ${isToday ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`}>
          {SHORT_DAYS[dayIndex]}
        </p>
        {isToday && (
          <span className="text-[10px] px-2 py-0.5 bg-[var(--accent-light)] text-[var(--accent)] rounded-full font-bold">
            TODAY
          </span>
        )}
      </div>

      {hasWorkout ? (
        <>
          <h3 className="font-syne text-base font-bold text-[var(--text-primary)] mb-2 leading-tight">
            {day.focus}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] mb-2">
            <span className="flex items-center gap-1">
              <TimerIcon className="w-3 h-3" />
              ~{duration} min
            </span>
            <span>·</span>
            <span>{exercises.length} exercises</span>
          </div>
          <div className="flex items-center gap-1.5">
            {hasSuperset && (
              <span className="text-[10px] px-2 py-0.5 bg-[var(--surface-secondary)] text-[var(--text-secondary)] rounded-md font-semibold">
                SUPERSET
              </span>
            )}
            {hasAmrap && (
              <span className="text-[10px] px-2 py-0.5 bg-[var(--surface-secondary)] text-[var(--text-secondary)] rounded-md font-semibold">
                AMRAP
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <CoffeeIcon className="w-5 h-5 text-[var(--accent-mobility)]" />
          <p className="text-[15px] font-semibold text-[var(--text-secondary)]">Rest Day</p>
        </div>
      )}
    </button>
  );
};

const DayDetailView: React.FC<{ day: PlanDay; onStartWorkout: () => void; onClose: () => void }> = ({
  day,
  onStartWorkout,
  onClose
}) => {
  const exercises = day.blocks?.flatMap(b => Array.isArray(b.exercises) ? b.exercises : []) || [];
  const hasWorkout = exercises.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-2xl bg-[var(--surface)] rounded-t-2xl max-h-[92vh] overflow-y-auto animate-slide-in"
        style={{ boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-[var(--surface)] z-10 border-b border-[var(--border)]">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="w-12 h-1 bg-[var(--border-strong)] rounded-full"></div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--surface-secondary)] transition"
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4">
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-2">
              {WEEKDAYS[day.day_of_week - 1]}
            </p>
            <h2 className="font-syne text-2xl font-bold text-[var(--text-primary)] mb-2">
              {day.focus}
            </h2>
            {hasWorkout && (
              <p className="text-[13px] text-[var(--text-secondary)]">
                ~{Math.round(estimateDuration(day))} min · {exercises.length} exercises
              </p>
            )}
          </div>

          {hasWorkout ? (
            <>
              {/* Blocks */}
              <div className="space-y-4 mb-6">
                {(day.blocks || []).map((block, blockIndex) => {
                  const blockExercises = Array.isArray(block.exercises) ? block.exercises : [];
                  return (
                    <div
                      key={blockIndex}
                      className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] uppercase tracking-wider text-[var(--accent)] font-bold">
                          {block.title || `Block ${blockIndex + 1}`}
                        </p>
                        {block.type === 'superset' && (
                          <span className="text-[10px] px-2 py-0.5 bg-[var(--accent-light)] text-[var(--accent)] rounded-md font-bold">
                            {(block as any).rounds} ROUNDS
                          </span>
                        )}
                        {block.type === 'amrap' && (
                          <span className="text-[10px] px-2 py-0.5 bg-[var(--accent-light)] text-[var(--accent)] rounded-md font-bold">
                            {(block as any).duration_minutes} MIN AMRAP
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {blockExercises.map((ex, exIndex) => (
                          <div key={exIndex} className="flex items-start justify-between gap-2">
                            <p className="text-[14px] font-medium text-[var(--text-primary)] flex-1">
                              {block.type === 'superset' && `${String.fromCharCode(65 + exIndex)}${exIndex + 1}. `}
                              {ex.exercise_name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
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
              <button
                onClick={onStartWorkout}
                className="w-full py-5 rounded-xl font-bold text-[18px] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all"
                style={{ boxShadow: 'var(--glow-red)' }}
              >
                <TimerIcon className="w-5 h-5 inline mr-2" />
                Start Workout
              </button>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[var(--surface-secondary)] rounded-lg flex items-center justify-center mx-auto mb-4">
                <CoffeeIcon className="w-8 h-8 text-[var(--accent-mobility)]" />
              </div>
              <h3 className="font-syne text-xl font-bold text-[var(--text-primary)] mb-2">
                Rest Day
              </h3>
              <p className="text-[14px] text-[var(--text-secondary)]">
                Recovery is part of the plan
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function PlanPage({ activePlan, onStartSession }: PlanPageProps) {
  const [selectedDay, setSelectedDay] = useState<PlanDay | null>(null);

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const weeklyPlan = Array.isArray(activePlan?.weeklyPlan) ? activePlan.weeklyPlan : [];

  const handleDayClick = (day: PlanDay) => {
    setSelectedDay(day);
  };

  const handleStartWorkout = () => {
    if (selectedDay) {
      setSelectedDay(null);
      onStartSession(selectedDay);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] animate-fade-in flex-1">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-2">
          TRAINING SCHEDULE
        </p>
        <h1 className="font-syne text-3xl font-bold text-[var(--text-primary)] leading-tight mb-2">
          {activePlan.name}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => notify({ type: 'info', message: 'Calendar export coming soon!' })}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] transition text-[13px] font-medium text-[var(--text-secondary)]"
          >
            <CalendarIcon className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      <main className="space-y-3 pb-4">
        {weeklyPlan.map((day, index) => {
          const isToday = index === todayIndex;
          return (
            <WeeklyOverviewCard
              key={day.day_of_week}
              day={day}
              dayIndex={index}
              isToday={isToday}
              onClick={() => handleDayClick(day)}
            />
          );
        })}
      </main>

      {/* Day Detail Modal */}
      {selectedDay && (
        <DayDetailView
          day={selectedDay}
          onStartWorkout={handleStartWorkout}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
