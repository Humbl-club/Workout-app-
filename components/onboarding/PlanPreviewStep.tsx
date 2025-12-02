import React, { useState, useEffect } from 'react';
import { WorkoutPlan, PlanDay, WorkoutBlock, PlanExercise } from '../../types';
import { CheckIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from '../icons';
import { cn } from '../../lib/utils';

interface PlanPreviewStepProps {
  plan: WorkoutPlan;
  onConfirm: () => void;
  onRegenerate: (feedback: string) => void;
  isRegenerating?: boolean;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function PlanPreviewStep({
  plan,
  onConfirm,
  onRegenerate,
  isRegenerating = false
}: PlanPreviewStepProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [visibleDays, setVisibleDays] = useState<number[]>([]);

  // Animate days appearing one by one
  useEffect(() => {
    if (!plan?.weeklyPlan) return;

    const timer = setInterval(() => {
      setVisibleDays(prev => {
        if (prev.length >= plan.weeklyPlan.length) {
          clearInterval(timer);
          return prev;
        }
        return [...prev, prev.length];
      });
    }, 100);

    return () => clearInterval(timer);
  }, [plan?.weeklyPlan?.length]);

  // Helper to get all blocks from a day (handles both single session and 2x daily)
  const getBlocksFromDay = (day: PlanDay): WorkoutBlock[] => {
    const allBlocks: WorkoutBlock[] = [];
    // Single session day: day.blocks
    if (day.blocks && Array.isArray(day.blocks)) {
      allBlocks.push(...day.blocks);
    }
    // 2x daily training: day.sessions
    if ((day as any).sessions && Array.isArray((day as any).sessions)) {
      (day as any).sessions.forEach((session: any) => {
        if (session.blocks && Array.isArray(session.blocks)) {
          allBlocks.push(...session.blocks);
        }
      });
    }
    return allBlocks;
  };

  // Check if day has 2x daily training (AM/PM sessions)
  const hasTwoADaySessions = (day: PlanDay): boolean => {
    return !!(day as any).sessions && Array.isArray((day as any).sessions) && (day as any).sessions.length > 0;
  };

  // Get session names for 2x daily
  const getSessionNames = (day: PlanDay): string[] => {
    if (!hasTwoADaySessions(day)) return [];
    return ((day as any).sessions as any[]).map(s => s.session_name || (s.time_of_day === 'morning' ? 'AM Session' : 'PM Session'));
  };

  const getDayStats = (day: PlanDay) => {
    const blocks = getBlocksFromDay(day);
    const exercises = blocks.flatMap(b => b.exercises || []);
    const warmupCount = exercises.filter(e => e.category === 'warmup').length;
    const mainCount = exercises.filter(e => e.category === 'main').length;
    const cooldownCount = exercises.filter(e => e.category === 'cooldown').length;

    // Calculate duration - prefer AI-generated values
    let estimatedMinutes = 0;
    const sessions = (day as any).sessions;

    if (sessions && Array.isArray(sessions)) {
      // 2x daily: Sum session durations from AI
      estimatedMinutes = sessions.reduce((total: number, s: any) => {
        if (s.estimated_duration && typeof s.estimated_duration === 'number') {
          return total + s.estimated_duration;
        }
        // Fallback: estimate from exercises in this session
        const sessionExercises = (s.blocks || []).flatMap((b: any) => b.exercises || []);
        return total + estimateExerciseDuration(sessionExercises);
      }, 0);
    } else {
      // Single session: estimate from exercises
      estimatedMinutes = estimateExerciseDuration(exercises);
    }

    return {
      totalExercises: exercises.length,
      warmupCount,
      mainCount,
      cooldownCount,
      estimatedMinutes,
      is2xDaily: hasTwoADaySessions(day),
      sessionNames: getSessionNames(day)
    };
  };

  // Helper to estimate duration from exercises (accounts for cardio being longer)
  const estimateExerciseDuration = (exercises: any[]): number => {
    let total = 0;
    for (const ex of exercises) {
      const name = (ex.exercise_name || '').toLowerCase();
      const isCardio = name.includes('run') || name.includes('bike') || name.includes('row') ||
                       name.includes('cycle') || name.includes('swim') || name.includes('treadmill') ||
                       name.includes('elliptical') || name.includes('cardio') || name.includes('jog');

      if (isCardio) {
        // Check for duration in metrics_template
        const duration = ex.metrics_template?.target_duration_s ||
                        ex.metrics_template?.duration_minutes ||
                        ex.metrics_template?.target_time_s;
        if (duration) {
          total += duration > 300 ? duration / 60 : duration; // Convert seconds to minutes if > 5min
        } else {
          total += 20; // Default cardio duration: 20 min
        }
      } else if (ex.category === 'warmup' || ex.category === 'cooldown') {
        total += 3; // Warmup/cooldown exercises: 3 min each
      } else {
        total += 5; // Strength exercises: 5 min each (including rest)
      }
    }
    return Math.round(total);
  };

  const isRestDay = (day: PlanDay) => {
    const focus = day.focus?.toLowerCase() || '';
    const hasBlocks = day.blocks && day.blocks.length > 0;
    const hasSessions = (day as any).sessions && (day as any).sessions.length > 0;
    return focus.includes('rest') || focus.includes('recovery') || (!hasBlocks && !hasSessions);
  };

  const handleSubmitFeedback = () => {
    if (feedback.trim()) {
      onRegenerate(feedback.trim());
      setFeedback('');
      setShowFeedback(false);
    }
  };

  if (!plan?.weeklyPlan) {
    return (
      <div className="py-8 text-center">
        <p className="text-[var(--text-secondary)]">No plan data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center pb-2">
        <h2 className="text-[22px] font-black text-[var(--text-primary)] uppercase tracking-tight">
          Your Plan is Ready
        </h2>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1">
          Review your personalized 7-day program
        </p>
      </div>

      {/* Week Overview */}
      <div className="space-y-2">
        {plan.weeklyPlan.map((day, index) => {
          const isVisible = visibleDays.includes(index);
          const isExpanded = expandedDay === index;
          const stats = getDayStats(day);
          const isRest = isRestDay(day);

          return (
            <div
              key={index}
              className={cn(
                "transition-all duration-300",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <button
                onClick={() => setExpandedDay(isExpanded ? null : index)}
                className={cn(
                  "w-full rounded-xl text-left transition-all",
                  isRest
                    ? "bg-[var(--surface-secondary)] border-2 border-transparent"
                    : "bg-[var(--surface-primary)] border-2 border-[var(--border-default)]",
                  isExpanded && "border-[var(--brand-primary)]"
                )}
              >
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Day indicator */}
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex flex-col items-center justify-center",
                      isRest
                        ? "bg-[var(--surface-hover)]"
                        : "bg-[var(--brand-primary-subtle)]"
                    )}>
                      <span className={cn(
                        "text-[10px] font-bold uppercase",
                        isRest ? "text-[var(--text-tertiary)]" : "text-[var(--brand-primary)]"
                      )}>
                        {DAYS_OF_WEEK[day.day_of_week - 1]?.slice(0, 3)}
                      </span>
                    </div>

                    <div>
                      <h3 className={cn(
                        "text-[14px] font-bold",
                        isRest ? "text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"
                      )}>
                        {day.focus || 'Training Day'}
                      </h3>
                      {!isRest && (
                        <p className="text-[11px] text-[var(--text-tertiary)]">
                          {stats.is2xDaily && <span className="text-[var(--brand-primary)] font-semibold">2x Daily • </span>}
                          {stats.totalExercises} exercises • ~{stats.estimatedMinutes} min
                        </p>
                      )}
                      {stats.is2xDaily && stats.sessionNames.length > 0 && (
                        <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                          ☀️ {stats.sessionNames[0]} + 🌙 {stats.sessionNames[1] || 'PM Session'}
                        </p>
                      )}
                    </div>
                  </div>

                  {!isRest && (
                    <div className="flex items-center gap-2">
                      {/* Exercise count badges */}
                      <div className="flex gap-1">
                        {stats.warmupCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[var(--status-success-subtle)] text-[var(--status-success-text)]">
                            {stats.warmupCount}W
                          </span>
                        )}
                        {stats.mainCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]">
                            {stats.mainCount}M
                          </span>
                        )}
                        {stats.cooldownCount > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[var(--surface-secondary)] text-[var(--text-tertiary)]">
                            {stats.cooldownCount}C
                          </span>
                        )}
                      </div>
                      {isExpanded ? (
                        <ChevronUpIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
                      )}
                    </div>
                  )}
                </div>

                {/* Expanded exercise list */}
                {isExpanded && !isRest && (
                  <div className="px-4 pb-3">
                    <div className="border-t border-[var(--border-default)] pt-3 space-y-2">
                      {/* 2x Daily: Show sessions separately */}
                      {stats.is2xDaily && (day as any).sessions ? (
                        ((day as any).sessions as any[]).map((session: any, sessionIdx: number) => (
                          <div key={`session-${sessionIdx}`} className="mb-3">
                            <div className="flex items-center gap-2 mb-2 pb-1 border-b border-[var(--border-subtle)]">
                              <span className="text-sm">{session.time_of_day === 'morning' ? '☀️' : '🌙'}</span>
                              <span className="text-[11px] font-bold uppercase text-[var(--brand-primary)]">
                                {session.session_name || (session.time_of_day === 'morning' ? 'Morning Session' : 'Evening Session')}
                              </span>
                              {session.estimated_duration && (
                                <span className="text-[10px] text-[var(--text-tertiary)]">
                                  ~{session.estimated_duration} min
                                </span>
                              )}
                            </div>
                            {(session.blocks || []).map((block: any, blockIdx: number) => (
                              <div key={blockIdx}>
                                {block.title && (
                                  <p className="text-[10px] font-bold uppercase text-[var(--text-tertiary)] mb-1">
                                    {block.title}
                                  </p>
                                )}
                                <div className="space-y-1">
                                  {(block.exercises || []).map((exercise: any, exIdx: number) => (
                                    <div
                                      key={exIdx}
                                      className="flex items-center justify-between py-1"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className={cn(
                                          "w-1.5 h-1.5 rounded-full",
                                          exercise.category === 'warmup' && "bg-[var(--status-success-bg)]",
                                          exercise.category === 'main' && "bg-[var(--brand-primary)]",
                                          exercise.category === 'cooldown' && "bg-[var(--text-tertiary)]"
                                        )} />
                                        <span className="text-[12px] text-[var(--text-primary)]">
                                          {exercise.exercise_name}
                                        </span>
                                      </div>
                                      {exercise.metrics_template && (
                                        <span className="text-[11px] text-[var(--text-tertiary)]">
                                          {exercise.metrics_template.target_sets && `${exercise.metrics_template.target_sets}×`}
                                          {exercise.metrics_template.target_reps || ''}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))
                      ) : (
                        /* Single session: Show blocks directly */
                        (day.blocks || []).map((block, blockIdx) => (
                          <div key={blockIdx}>
                            {block.title && (
                              <p className="text-[10px] font-bold uppercase text-[var(--text-tertiary)] mb-1">
                                {block.title}
                              </p>
                            )}
                            <div className="space-y-1">
                              {(block.exercises || []).map((exercise, exIdx) => (
                                <div
                                  key={exIdx}
                                  className="flex items-center justify-between py-1"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "w-1.5 h-1.5 rounded-full",
                                      exercise.category === 'warmup' && "bg-[var(--status-success-bg)]",
                                      exercise.category === 'main' && "bg-[var(--brand-primary)]",
                                      exercise.category === 'cooldown' && "bg-[var(--text-tertiary)]"
                                    )} />
                                    <span className="text-[12px] text-[var(--text-primary)]">
                                      {exercise.exercise_name}
                                    </span>
                                  </div>
                                  {exercise.metrics_template && (
                                    <span className="text-[11px] text-[var(--text-tertiary)]">
                                      {exercise.metrics_template.target_sets && `${exercise.metrics_template.target_sets}×`}
                                      {exercise.metrics_template.target_reps || ''}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Feedback Section */}
      {showFeedback ? (
        <div className="space-y-3 pt-2">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-2 block">
              What would you like to change?
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="E.g., 'Add more leg exercises', 'Remove overhead pressing', 'Make Monday easier'..."
              className="w-full h-24 p-3 text-[14px] text-[var(--text-primary)] bg-[var(--surface-secondary)] rounded-xl placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--brand-primary)] resize-none outline-none"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFeedback(false)}
              className="h-10 px-4 rounded-lg font-semibold text-[13px] text-[var(--text-secondary)] bg-[var(--surface-secondary)] active:bg-[var(--surface-hover)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitFeedback}
              disabled={!feedback.trim() || isRegenerating}
              className="flex-1 h-10 rounded-lg font-bold text-[13px] text-white bg-[var(--brand-primary)] active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isRegenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Regenerating...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  Regenerate Plan
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          {/* Action Buttons */}
          <button
            onClick={onConfirm}
            className="w-full h-14 rounded-xl font-bold text-[15px] uppercase tracking-wide text-white bg-[var(--brand-primary)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          >
            <CheckIcon className="w-5 h-5" />
            Looks Good, Let's Go!
          </button>

          <button
            onClick={() => setShowFeedback(true)}
            className="w-full h-12 rounded-xl font-semibold text-[14px] text-[var(--text-secondary)] bg-[var(--surface-secondary)] active:bg-[var(--surface-hover)] transition-colors flex items-center justify-center gap-2"
          >
            <SparklesIcon className="w-4 h-4" />
            I'd Like Some Changes
          </button>
        </div>
      )}
    </div>
  );
}
