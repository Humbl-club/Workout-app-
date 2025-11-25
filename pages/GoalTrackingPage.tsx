import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1.5">
        <p className="text-[12px] font-medium text-[var(--text-secondary)]">{label}</p>
        <p className="text-[14px] font-bold text-[var(--text-primary)]">
          {animatedCurrent} / {target}
        </p>
      </div>
      <div className="h-1.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--accent)] rounded-full transition-all duration-500 shadow-card"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const PRCard: React.FC<{ pr: PersonalRecord }> = ({ pr }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 hover:border-[var(--accent)] transition-all">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-[var(--text-primary)] mb-0.5">
            {pr.exercise_name}
          </p>
          <p className="text-[12px] font-mono font-bold text-[var(--accent)]">
            {t('goals.prFormat', { weight: pr.weight, reps: pr.reps })}
          </p>
        </div>
        <div className="w-7 h-7 bg-[var(--accent-light)] rounded-lg flex items-center justify-center shrink-0">
          <TrophyIcon className="w-4 h-4 text-[var(--accent)]" />
        </div>
      </div>
      {pr.previousBest && (
        <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5">
          {t('goals.previousBestFormat', { weight: pr.previousBest.weight, reps: pr.previousBest.reps })}
        </p>
      )}
    </div>
  );
};

export default function GoalTrackingPage({ logs, plan, userGoals }: GoalTrackingPageProps) {
  const { t } = useTranslation();
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
    title: t('goals.defaultGoalTitle'),
    target: 30,
    current: analytics.totalWorkouts
  };

  const activeGoals = userGoals && userGoals.length > 0 ? userGoals : [defaultGoal];

  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] animate-fade-in flex-1">
      <header className="mb-4">
        <p className="text-[9px] uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-1">
          {t('goals.yourProgress').toUpperCase()}
        </p>
        <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight">
          {t('goals.title')}
        </h1>
      </header>

      <main className="space-y-4 pb-4">
        {/* Active Goals */}
        {activeGoals.map((goal, index) => (
          <div
            key={index}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-[var(--accent-light)] rounded-lg flex items-center justify-center">
                <TargetIcon className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  {goal.title}
                </h2>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  {t('goals.percentComplete', { percent: Math.round((goal.current / goal.target) * 100) })}
                </p>
              </div>
            </div>

            <ProgressBar
              current={goal.current}
              target={goal.target}
              label={t('goals.workoutsCompleted')}
            />

            {goal.current >= goal.target && (
              <div className="mt-3 bg-[var(--accent-light)] border border-[var(--accent)] rounded-lg p-3 text-center">
                <p className="text-[13px] font-semibold text-[var(--accent)]">
                  🎉 {t('goals.goalAchieved')}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Personal Records */}
        {analytics.allPRs.length > 0 && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="flex items-center gap-2 mb-3">
              <TrophyIcon className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {t('goals.personalRecords')}
              </h3>
            </div>

            <div className="space-y-2">
              {analytics.allPRs.map((pr, index) => (
                <PRCard key={index} pr={pr} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {analytics.totalWorkouts === 0 && (
          <div className="text-center py-12 bg-[var(--surface)] border border-[var(--border)] rounded-xl" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="w-12 h-12 bg-[var(--surface-secondary)] rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUpIcon className="w-6 h-6 text-[var(--text-tertiary)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1.5">
              {t('goals.startTraining')}
            </h3>
            <p className="text-[13px] text-[var(--text-secondary)] max-w-xs mx-auto">
              {t('goals.firstWorkoutMessage')}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
