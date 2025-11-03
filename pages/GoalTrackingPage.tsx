import React, { useMemo } from 'react';
import { WorkoutLog, WorkoutPlan, UserGoal, PersonalRecord } from '../types';
import { TrophyIcon, TargetIcon, TrendingUpIcon } from '../components/icons';
import { getAllPRs } from '../services/prService';
import { useCountUp } from '../hooks/useAnimations';

interface GoalTrackingPageProps {
  logs: WorkoutLog[];
  plan: WorkoutPlan;
  userGoals?: UserGoal[];
}

const ProgressBar: React.FC<{ current: number; target: number; label: string }> = ({ current, target, label }) => {
  const progress = Math.min((current / target) * 100, 100);
  const animatedCurrent = useCountUp(current, 800);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-2">
        <p className="text-[13px] font-medium text-[var(--text-secondary)]">{label}</p>
        <p className="text-[15px] font-bold text-[var(--text-primary)]">
          {animatedCurrent} / {target}
        </p>
      </div>
      <div className="h-2 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, boxShadow: 'var(--glow-red)' }}
        />
      </div>
    </div>
  );
};

const PRCard: React.FC<{ pr: PersonalRecord }> = ({ pr }) => {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)] transition-all">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">
            {pr.exercise_name}
          </p>
          <p className="text-[13px] font-mono font-bold text-[var(--accent)]">
            {pr.weight} kg × {pr.reps} reps
          </p>
        </div>
        <div className="w-8 h-8 bg-[var(--accent-light)] rounded-lg flex items-center justify-center shrink-0">
          <TrophyIcon className="w-5 h-5 text-[var(--accent)]" />
        </div>
      </div>
      {pr.previousBest && (
        <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
          Previous: {pr.previousBest.weight} kg × {pr.previousBest.reps}
        </p>
      )}
    </div>
  );
};

export default function GoalTrackingPage({ logs, plan, userGoals }: GoalTrackingPageProps) {
  // Calculate stats
  const analytics = useMemo(() => {
    const totalWorkouts = logs.length;
    const allPRs = getAllPRs(logs);
    const recentPRs = allPRs.slice(0, 6); // Show top 6 PRs

    return {
      totalWorkouts,
      allPRs: recentPRs
    };
  }, [logs]);

  // Default goal if none set: 30 workouts in 3 months
  const defaultGoal: UserGoal = {
    type: 'workout_count',
    title: '3-Month Training Goal',
    target: 30,
    current: analytics.totalWorkouts
  };

  const activeGoals = userGoals && userGoals.length > 0 ? userGoals : [defaultGoal];

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] animate-fade-in flex-1">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-2">
          YOUR PROGRESS
        </p>
        <h1 className="font-syne text-3xl font-bold text-[var(--text-primary)] leading-tight">
          Goals
        </h1>
      </header>

      <main className="space-y-6 pb-4">
        {/* Active Goals */}
        {activeGoals.map((goal, index) => (
          <div
            key={index}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 bg-[var(--accent-light)] rounded-lg flex items-center justify-center">
                <TargetIcon className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div>
                <h2 className="font-syne text-xl font-bold text-[var(--text-primary)]">
                  {goal.title}
                </h2>
                <p className="text-[13px] text-[var(--text-secondary)]">
                  {Math.round((goal.current / goal.target) * 100)}% complete
                </p>
              </div>
            </div>

            <ProgressBar
              current={goal.current}
              target={goal.target}
              label="Workouts completed"
            />

            {goal.current >= goal.target && (
              <div className="mt-4 bg-[var(--accent-light)] border border-[var(--accent)] rounded-lg p-4 text-center">
                <p className="text-[14px] font-semibold text-[var(--accent)]">
                  🎉 Goal achieved! Set a new challenge
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Personal Records */}
        {analytics.allPRs.length > 0 && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-5">
              <TrophyIcon className="w-5 h-5 text-[var(--accent)]" />
              <h3 className="font-syne text-xl font-bold text-[var(--text-primary)]">
                Personal Records
              </h3>
            </div>

            <div className="space-y-3">
              {analytics.allPRs.map((pr, index) => (
                <PRCard key={index} pr={pr} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {analytics.totalWorkouts === 0 && (
          <div className="text-center py-16 bg-[var(--surface)] border border-[var(--border)] rounded-xl" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="w-16 h-16 bg-[var(--surface-secondary)] rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUpIcon className="w-8 h-8 text-[var(--text-tertiary)]" />
            </div>
            <h3 className="font-syne text-xl font-bold text-[var(--text-primary)] mb-2">
              Start Training
            </h3>
            <p className="text-[14px] text-[var(--text-secondary)] max-w-xs mx-auto">
              Complete your first workout to track goals and PRs
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
