import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutLog, WorkoutPlan, UserGoal, PersonalRecord } from '../types';
import { TrophyIcon, TargetIcon, TrendingUpIcon } from '../components/icons';
import { getAllPRs } from '../services/prService';
import { useCountUp } from '../hooks/useAnimations';
import { cn } from '../lib/utils';
import LogbookPage from './LogbookPage';

/* ═══════════════════════════════════════════════════════════════
   GOAL TRACKING PAGE - Phase 9.4 Page Redesign

   Goals and personal records tracking.
   Uses design tokens for consistent styling.
   ═══════════════════════════════════════════════════════════════ */

interface GoalTrackingPageProps {
  logs: WorkoutLog[];
  plan: WorkoutPlan;
  userGoals?: UserGoal[];
  onDeleteLog?: (logId: string) => Promise<void>;
}

/* ───────────────────────────────────────────────────────────────
   Progress Bar Component
   ─────────────────────────────────────────────────────────────── */

const ProgressBar: React.FC<{ current: number; target: number; label: string }> = ({
  current,
  target,
  label,
}) => {
  const progress = Math.min((current / target) * 100, 100);
  const animatedCurrent = useCountUp(current, 800);

  return (
    <div className="mb-[var(--space-4)]">
      <div
        className={cn(
          'flex justify-between items-baseline',
          'mb-[var(--space-2)]'
        )}
      >
        <p
          className={cn(
            'text-[var(--text-xs)]',
            'font-[var(--weight-medium)]',
            'text-[var(--text-secondary)]'
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            'text-[var(--text-sm)]',
            'font-[var(--weight-bold)]',
            'text-[var(--text-primary)]'
          )}
        >
          {animatedCurrent} / {target}
        </p>
      </div>
      <div
        className={cn(
          'h-1.5',
          'bg-[var(--surface-secondary)]',
          'rounded-full',
          'overflow-hidden'
        )}
      >
        <div
          className={cn(
            'h-full',
            'bg-[var(--brand-primary)]',
            'rounded-full',
            'transition-all duration-[500ms]',
            'shadow-[var(--shadow-sm)]'
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

/* ───────────────────────────────────────────────────────────────
   PR Card Component
   ─────────────────────────────────────────────────────────────── */

const PRCard: React.FC<{ pr: PersonalRecord }> = ({ pr }) => {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'bg-[var(--surface-primary)]',
        'border border-[var(--border-default)]',
        'rounded-[var(--radius-xl)]',
        'p-[var(--space-3)]',
        'hover:border-[var(--brand-primary)]',
        'transition-all duration-[var(--duration-fast)]'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p
            className={cn(
              'text-[var(--text-sm)]',
              'font-[var(--weight-semibold)]',
              'text-[var(--text-primary)]',
              'mb-[var(--space-0-5)]'
            )}
          >
            {pr.exercise_name}
          </p>
          <p
            className={cn(
              'text-[var(--text-xs)]',
              'font-mono',
              'font-[var(--weight-bold)]',
              'text-[var(--brand-primary)]'
            )}
          >
            {t('goals.prFormat', { weight: pr.weight, reps: pr.reps })}
          </p>
        </div>
        <div
          className={cn(
            'w-7 h-7',
            'bg-[var(--brand-primary-subtle)]',
            'rounded-[var(--radius-lg)]',
            'flex items-center justify-center',
            'shrink-0'
          )}
        >
          <TrophyIcon className="w-4 h-4 text-[var(--brand-primary)]" />
        </div>
      </div>
      {pr.previousBest && (
        <p
          className={cn(
            'text-[var(--text-2xs)]',
            'text-[var(--text-tertiary)]',
            'mt-[var(--space-2)]'
          )}
        >
          {t('goals.previousBestFormat', {
            weight: pr.previousBest.weight,
            reps: pr.previousBest.reps,
          })}
        </p>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Main Goal Tracking Component
   ═══════════════════════════════════════════════════════════════ */

export default function GoalTrackingPage({ logs, plan, userGoals, onDeleteLog }: GoalTrackingPageProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'goals' | 'history'>('goals');

  // Calculate stats
  const analytics = useMemo(() => {
    const totalWorkouts = logs.length;
    const allPRs = getAllPRs(logs);
    const recentPRs = allPRs.slice(0, 6); // Show top 6 PRs

    return {
      totalWorkouts,
      allPRs: recentPRs,
    };
  }, [logs]);

  // Default goal if none set: 30 workouts in 3 months
  const defaultGoal: UserGoal = {
    type: 'workout_count',
    title: t('goals.defaultGoalTitle'),
    target: 30,
    current: analytics.totalWorkouts,
  };

  const activeGoals = userGoals && userGoals.length > 0 ? userGoals : [defaultGoal];

  return (
    <div
      className={cn(
        'w-full max-w-lg mx-auto',
        'px-[var(--space-4)]',
        'pt-[env(safe-area-inset-top)]', // Tight to Dynamic Island
        'pb-[calc(var(--height-tab-bar)+var(--space-6)+env(safe-area-inset-bottom))]',
        'animate-fade-in',
        'flex-1'
      )}
    >
      {/* Header */}
      <header className="mb-[var(--space-6)]">
        <p
          className={cn(
            'text-[var(--text-2xs)]',
            'uppercase tracking-[var(--tracking-wider)]',
            'text-[var(--text-tertiary)]',
            'font-[var(--weight-semibold)]',
            'mb-[var(--space-1)]'
          )}
        >
          {t('goals.yourProgress').toUpperCase()}
        </p>
        <h1
          className={cn(
            'text-[var(--text-xl)]',
            'font-[var(--weight-bold)]',
            'text-[var(--text-primary)]',
            'leading-tight',
            'mb-[var(--space-4)]'
          )}
        >
          {t('goals.title')}
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-[var(--surface-secondary)] rounded-xl">
          <button
            onClick={() => setActiveTab('goals')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all',
              activeTab === 'goals'
                ? 'bg-[var(--brand-primary)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            Goals & PRs
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all',
              activeTab === 'history'
                ? 'bg-[var(--brand-primary)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            History
          </button>
        </div>
      </header>

      {/* Tab Content */}
      {activeTab === 'goals' && (
      <main className="space-y-[var(--space-4)] pb-[var(--space-4)]">
        {/* Active Goals */}
        {activeGoals.map((goal, index) => (
          <div
            key={index}
            className={cn(
              'bg-[var(--surface-primary)]',
              'border border-[var(--border-default)]',
              'rounded-[var(--radius-xl)]',
              'p-[var(--space-4)]',
              'shadow-[var(--shadow-sm)]'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-[var(--space-2)]',
                'mb-[var(--space-3)]'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10',
                  'bg-[var(--brand-primary-subtle)]',
                  'rounded-[var(--radius-xl)]',
                  'flex items-center justify-center'
                )}
              >
                <TargetIcon className="w-5 h-5 text-[var(--brand-primary)]" />
              </div>
              <div>
                <h2
                  className={cn(
                    'text-[var(--text-base)]',
                    'font-[var(--weight-bold)]',
                    'text-[var(--text-primary)]'
                  )}
                >
                  {goal.title}
                </h2>
                <p
                  className={cn(
                    'text-[var(--text-xs)]',
                    'text-[var(--text-secondary)]'
                  )}
                >
                  {t('goals.percentComplete', {
                    percent: Math.round((goal.current / goal.target) * 100),
                  })}
                </p>
              </div>
            </div>

            <ProgressBar
              current={goal.current}
              target={goal.target}
              label={t('goals.workoutsCompleted')}
            />

            {goal.current >= goal.target && (
              <div
                className={cn(
                  'mt-[var(--space-3)]',
                  'bg-[var(--brand-primary-subtle)]',
                  'border border-[var(--brand-primary)]',
                  'rounded-[var(--radius-xl)]',
                  'p-[var(--space-3)]',
                  'text-center'
                )}
              >
                <p
                  className={cn(
                    'text-[var(--text-sm)]',
                    'font-[var(--weight-semibold)]',
                    'text-[var(--brand-primary)]'
                  )}
                >
                  {t('goals.goalAchieved')}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* Personal Records */}
        {analytics.allPRs.length > 0 && (
          <div
            className={cn(
              'bg-[var(--surface-primary)]',
              'border border-[var(--border-default)]',
              'rounded-[var(--radius-xl)]',
              'p-[var(--space-4)]',
              'shadow-[var(--shadow-sm)]'
            )}
          >
            <div
              className={cn(
                'flex items-center gap-[var(--space-2)]',
                'mb-[var(--space-3)]'
              )}
            >
              <TrophyIcon className="w-4 h-4 text-[var(--brand-primary)]" />
              <h3
                className={cn(
                  'text-[var(--text-base)]',
                  'font-[var(--weight-bold)]',
                  'text-[var(--text-primary)]'
                )}
              >
                {t('goals.personalRecords')}
              </h3>
            </div>

            <div className="space-y-[var(--space-2)]">
              {analytics.allPRs.map((pr, index) => (
                <PRCard key={index} pr={pr} />
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Empty State */}
        {analytics.totalWorkouts === 0 && (
          <div
            className={cn(
              'text-center',
              'py-[var(--space-8)]',
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
                'mx-auto',
                'mb-[var(--space-4)]'
              )}
            >
              <TrendingUpIcon className="w-8 h-8 text-[var(--brand-primary)]" />
            </div>
            <h3
              className={cn(
                'text-[var(--text-lg)]',
                'font-[var(--weight-bold)]',
                'text-[var(--text-primary)]',
                'mb-[var(--space-2)]'
              )}
            >
              {t('goals.startTraining')}
            </h3>
            <p
              className={cn(
                'text-[var(--text-sm)]',
                'text-[var(--text-secondary)]',
                'max-w-[280px]',
                'mx-auto',
                'mb-[var(--space-5)]',
                'leading-relaxed'
              )}
            >
              {t('goals.firstWorkoutMessage')}
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
              Complete a workout to track your progress
            </p>
          </div>
        )}
      </main>
      )}

      {/* History Tab - Logbook with Virtual Scrolling */}
      {activeTab === 'history' && (
        <LogbookPage logs={logs} onDeleteLog={onDeleteLog} />
      )}
    </div>
  );
}
