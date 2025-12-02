import React, { useMemo } from 'react';
import { WorkoutLog, WorkoutPlan } from '../types';
import { DumbbellIcon } from '../components/icons';
import { useUser } from '@clerk/clerk-react';
import PerformanceAnalytics from '../components/PerformanceAnalytics';
import useUserProfile from '../hooks/useUserProfile';
import { cn } from '../lib/utils';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '../components/ui/PullToRefreshIndicator';

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD PAGE - Phase 9.4 Page Redesign

   Analytics and progress dashboard.
   Uses design tokens for consistent styling.
   ═══════════════════════════════════════════════════════════════ */

interface DashboardPageProps {
  logs: WorkoutLog[];
  plan: WorkoutPlan;
}

// Helper functions for date calculations
const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const getDayStart = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/* ───────────────────────────────────────────────────────────────
   Stat Card Component
   ─────────────────────────────────────────────────────────────── */

const StatCard: React.FC<{
  title: string;
  value: string | number;
  description: string;
  accent?: boolean;
}> = ({ title, value, description, accent = false }) => (
  <div
    className={cn(
      'bg-[var(--surface-primary)]',
      'border rounded-[var(--radius-xl)]',
      'p-[var(--space-5)]',
      'shadow-[var(--shadow-sm)]',
      accent
        ? 'border-[var(--brand-primary)] shadow-[var(--shadow-md)]'
        : 'border-[var(--border-default)]'
    )}
  >
    <p
      className={cn(
        'text-[var(--text-2xs)]',
        'uppercase tracking-[var(--tracking-wider)]',
        'font-[var(--weight-bold)]',
        'text-[var(--text-tertiary)]',
        'mb-[var(--space-2)]'
      )}
    >
      {title}
    </p>
    <p
      className={cn(
        'text-[var(--text-3xl)]',
        'font-[var(--weight-bold)]',
        'mt-[var(--space-1)] mb-[var(--space-1)]',
        accent ? 'text-[var(--brand-primary)]' : 'text-[var(--text-primary)]'
      )}
    >
      {value}
    </p>
    <p
      className={cn(
        'text-[var(--text-sm)]',
        'text-[var(--text-secondary)]'
      )}
    >
      {description}
    </p>
  </div>
);

/* ───────────────────────────────────────────────────────────────
   Weekly Volume Chart Component
   ─────────────────────────────────────────────────────────────── */

const WeeklyVolumeChart: React.FC<{ data: { day: string; volume: number }[] }> = ({ data }) => {
  const chartData = Array.isArray(data) ? data : [];
  const maxVolume = useMemo(() => {
    if (chartData.length === 0) return 1;
    return Math.max(...chartData.map((d) => d.volume), 1);
  }, [chartData]);

  return (
    <div
      className={cn(
        'bg-[var(--surface-primary)]',
        'border border-[var(--border-default)]',
        'rounded-[var(--radius-xl)]',
        'p-[var(--space-5)]',
        'shadow-[var(--shadow-sm)]'
      )}
    >
      <p
        className={cn(
          'text-[var(--text-2xs)]',
          'uppercase tracking-[var(--tracking-wider)]',
          'font-[var(--weight-bold)]',
          'text-[var(--text-tertiary)]',
          'mb-[var(--space-2)]'
        )}
      >
        WEEKLY VOLUME
      </p>
      <h3
        className={cn(
          'text-[var(--text-xl)]',
          'font-[var(--weight-bold)]',
          'text-[var(--text-primary)]',
          'mb-[var(--space-5)]'
        )}
      >
        Training Load
      </h3>
      <div className="h-48 flex justify-between items-end gap-[var(--space-3)]">
        {chartData.map(({ day, volume }, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center justify-end h-full group"
          >
            <div
              className={cn(
                'w-full',
                'bg-[var(--surface-secondary)]',
                'rounded-t-[var(--radius-lg)]',
                'transition-all duration-[var(--duration-normal)] ease-out',
                'relative overflow-hidden'
              )}
              style={{ height: `${Math.max((volume / maxVolume) * 100, 2)}%` }}
            >
              <div
                className={cn(
                  'w-full h-full',
                  'bg-[var(--brand-primary)]',
                  'rounded-t-[var(--radius-lg)]'
                )}
              />
            </div>
            <p
              className={cn(
                'text-[var(--text-2xs)]',
                'font-[var(--weight-semibold)]',
                'text-[var(--text-tertiary)]',
                'mt-[var(--space-2)]',
                'uppercase'
              )}
            >
              {day}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const KEY_LIFTS = ['squat', 'bench', 'deadlift', 'overhead press', 'ohp'];

/* ═══════════════════════════════════════════════════════════════
   Main Dashboard Component
   ═══════════════════════════════════════════════════════════════ */

export default function DashboardPage({ logs, plan }: DashboardPageProps) {
  const { user } = useUser();
  const { userProfile } = useUserProfile();
  const userId = user?.id || null;
  const [activeTab, setActiveTab] = React.useState<'week' | 'alltime'>('week');

  // Pull-to-refresh
  const { pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      // Data automatically refreshes via Convex real-time subscriptions
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  });

  const analytics = useMemo(() => {
    const safeLogs = Array.isArray(logs) ? logs : [];
    const sortedLogs = safeLogs
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const today = getDayStart(new Date());

    // Calculate Streak
    let currentStreak = 0;
    if (sortedLogs.length > 0) {
      const uniqueLogDays = [
        ...new Set(sortedLogs.map((log) => getDayStart(new Date(log.date)).getTime())),
      ]
        .map((time) => new Date(time))
        .sort((a, b) => b.getTime() - a.getTime());

      if (
        uniqueLogDays.length > 0 &&
        (isSameDay(uniqueLogDays[0], today) ||
          isSameDay(uniqueLogDays[0], new Date(today.getTime() - 86400000)))
      ) {
        currentStreak = 1;
        for (let i = 1; i < uniqueLogDays.length; i++) {
          const diff = uniqueLogDays[i - 1].getTime() - uniqueLogDays[i].getTime();
          if (diff === 86400000) {
            currentStreak++;
          } else {
            break;
          }
        }
      }
    }

    // Calculate Weekly Volume & Chart Data
    const weeklyVolumeData = [...Array(7)].map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return {
        day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
        volume: 0,
        date: getDayStart(date),
      };
    });

    let totalWeeklyVolume = 0;
    const oneWeekAgo = new Date(today.getTime() - 6 * 86400000);

    safeLogs.forEach((log) => {
      const logDate = getDayStart(new Date(log.date));
      if (logDate >= oneWeekAgo) {
        let sessionVolume = 0;
        const exercises = Array.isArray(log.exercises) ? log.exercises : [];
        exercises.forEach((ex) => {
          const sets = Array.isArray(ex.sets) ? ex.sets : [];
          sets.forEach((set) => {
            if ('weight' in set && 'reps' in set) {
              sessionVolume += Number(set.weight) * Number(set.reps);
            }
          });
        });

        totalWeeklyVolume += sessionVolume;
        const dayIndex = weeklyVolumeData.findIndex((d) => isSameDay(d.date, logDate));
        if (dayIndex !== -1) {
          weeklyVolumeData[dayIndex].volume += sessionVolume;
        }
      }
    });

    // Calculate Key Lift Progression
    const keyLiftProgress: { name: string; start: number; current: number }[] = [];
    KEY_LIFTS.forEach((liftName) => {
      const relevantLogs = sortedLogs
        .map((log) => {
          const ex = (log.exercises || []).find((e) =>
            e?.exercise_name?.toLowerCase?.()?.includes(liftName)
          );
          return ex ? { date: log.date, exercise: ex } : null;
        })
        .filter(Boolean);

      if (relevantLogs.length >= 2) {
        const getHeaviestSet = (ex: any) =>
          Math.max(...(ex?.sets || []).map((s: any) => ('weight' in s ? Number(s.weight) : 0)), 0);
        const startWeight = getHeaviestSet(relevantLogs[0]!.exercise);
        const currentWeight = getHeaviestSet(relevantLogs[relevantLogs.length - 1]!.exercise);

        if (currentWeight > startWeight) {
          keyLiftProgress.push({ name: liftName, start: startWeight, current: currentWeight });
        }
      }
    });

    return {
      totalWorkouts: safeLogs.length,
      currentStreak,
      totalWeeklyVolume: Math.round(totalWeeklyVolume),
      weeklyVolumeData,
      keyLiftProgress,
    };
  }, [logs]);

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
      {/* Pull-to-refresh indicator */}
      <PullToRefreshIndicator distance={pullDistance} isRefreshing={isRefreshing} isTriggered={pullDistance >= 80} />

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
          YOUR PROGRESS
        </p>
        <h1
          className={cn(
            'text-[var(--text-2xl)]',
            'font-[var(--weight-bold)]',
            'text-[var(--text-primary)]',
            'leading-tight'
          )}
        >
          Dashboard
        </h1>
      </header>

      <main className="space-y-[var(--space-5)] pb-[var(--space-4)]">
        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-[var(--surface-secondary)] rounded-xl">
          <button
            onClick={() => setActiveTab('week')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all',
              activeTab === 'week'
                ? 'bg-[var(--brand-primary)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            This Week
          </button>
          <button
            onClick={() => setActiveTab('alltime')}
            className={cn(
              'flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all',
              activeTab === 'alltime'
                ? 'bg-[var(--brand-primary)] text-white shadow-md'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            All Time
          </button>
        </div>

        {/* This Week Tab */}
        {activeTab === 'week' && (
          <div className="space-y-[var(--space-5)] animate-fade-in">
            {/* Weekly Volume Chart */}
            <WeeklyVolumeChart data={analytics.weeklyVolumeData} />

            {/* Volume Total */}
            <StatCard
              title="This Week"
              value={`${analytics.totalWeeklyVolume.toLocaleString()}`}
              description="lbs total volume"
              accent={true}
            />
          </div>
        )}

        {/* All Time Tab */}
        {activeTab === 'alltime' && (
          <div className="space-y-[var(--space-5)] animate-fade-in">
            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 gap-[var(--space-4)]">
              <StatCard
                title="Workouts"
                value={analytics.totalWorkouts}
                description="Completed"
                accent={true}
              />
              <StatCard
                title="Streak"
                value={analytics.currentStreak}
                description="Days in a row"
              />
            </div>

            {/* Key Lift Progression */}
            {analytics.keyLiftProgress.length > 0 && (
              <div
                className={cn(
                  'bg-[var(--surface-primary)]',
                  'border border-[var(--border-default)]',
                  'rounded-[var(--radius-xl)]',
                  'p-[var(--space-5)]',
                  'shadow-[var(--shadow-sm)]'
                )}
              >
                <p
                  className={cn(
                    'text-[var(--text-2xs)]',
                    'uppercase tracking-[var(--tracking-wider)]',
                    'font-[var(--weight-bold)]',
                    'text-[var(--text-tertiary)]',
                    'mb-[var(--space-2)]'
                  )}
                >
                  STRENGTH GAINS
                </p>
                <h3
                  className={cn(
                    'text-[var(--text-xl)]',
                    'font-[var(--weight-bold)]',
                    'text-[var(--text-primary)]',
                    'mb-[var(--space-5)]'
                  )}
                >
                  Key Lifts
                </h3>
                <div className="space-y-[var(--space-3)]">
                  {analytics.keyLiftProgress.map((lift) => (
                    <div
                      key={lift.name}
                      className={cn(
                        'flex justify-between items-center',
                        'bg-[var(--surface-secondary)]',
                        'p-[var(--space-4)]',
                        'rounded-[var(--radius-xl)]'
                      )}
                    >
                      <p
                        className={cn(
                          'font-[var(--weight-semibold)]',
                          'capitalize',
                          'text-[var(--text-base)]',
                          'text-[var(--text-primary)]'
                        )}
                      >
                        {lift.name}
                      </p>
                      <p
                        className={cn(
                          'font-mono',
                          'font-[var(--weight-bold)]',
                          'text-[var(--text-base)]',
                          'text-[var(--brand-primary)]'
                        )}
                      >
                        {lift.start} → {lift.current} kg
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Analytics for Sport-Specific Training */}
            {userId && userProfile?.trainingPreferences?.sport_specific && (
              <PerformanceAnalytics
                userId={userId}
                sport={userProfile.trainingPreferences.sport_specific}
              />
            )}
          </div>
        )}

        {/* Empty State */}
        {analytics.totalWorkouts < 2 && (
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
                'bg-[var(--surface-secondary)]',
                'rounded-[var(--radius-xl)]',
                'flex items-center justify-center',
                'mb-[var(--space-4)]'
              )}
            >
              <DumbbellIcon className="h-8 w-8 text-[var(--text-tertiary)]" />
            </div>
            <h3
              className={cn(
                'text-[var(--text-xl)]',
                'font-[var(--weight-bold)]',
                'text-[var(--text-primary)]'
              )}
            >
              Start Training
            </h3>
            <p
              className={cn(
                'mt-[var(--space-2)]',
                'text-[var(--text-sm)]',
                'text-[var(--text-secondary)]',
                'max-w-xs',
                'px-[var(--space-4)]'
              )}
            >
              Log a few workouts to see your progress analytics.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
