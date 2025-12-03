import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Card, CardHeader, CardContent } from './ui/card';
import { TrophyIcon, TrendingUpIcon } from './icons';
import { cn } from '../lib/utils';

interface BuddyComparisonCardProps {
  userId: string;
  buddyId: string;
  buddyName?: string;
  /** Optional: Filter to only these exercises (e.g., today's workout exercises) */
  exerciseFilter?: string[];
}

export default function BuddyComparisonCard({
  userId,
  buddyId,
  buddyName = "Buddy",
  exerciseFilter
}: BuddyComparisonCardProps) {
  const comparison = useQuery(api.buddyQueries.getBuddyPRComparison, {
    userId,
    buddyId,
    exerciseFilter: exerciseFilter && exerciseFilter.length > 0 ? exerciseFilter : undefined,
  });

  if (!comparison?.allowed) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-[14px] text-[var(--text-secondary)]">
            PR comparison not available
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!comparison.comparisons || comparison.comparisons.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-[14px] text-[var(--text-secondary)]">
            {comparison.filteredByDay
              ? "No matching PRs for today's exercises yet"
              : "No common exercises yet. Start working out together!"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {comparison.comparisons.slice(0, 10).map((comp, i) => {
        const userPR = comp.userPR!;
        const buddyPR = comp.buddyPR!;
        const userTotal = userPR.weight * userPR.reps;
        const buddyTotal = buddyPR.weight * buddyPR.reps;
        const userAhead = userTotal > buddyTotal;
        const tied = userTotal === buddyTotal;

        return (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4">
              {/* Exercise Name */}
              <div className="flex items-center gap-2 mb-3">
                <TrophyIcon className="w-4 h-4 text-[var(--accent)]" />
                <h4 className="text-[14px] font-bold text-[var(--text-primary)]">
                  {comp.exercise}
                </h4>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-2 gap-3">
                {/* User */}
                <div className={cn(
                  "p-3 rounded-xl border-2 transition-all",
                  userAhead
                    ? "bg-gradient-to-br from-[var(--success-light)] to-transparent border-[var(--success)]"
                    : tied
                    ? "bg-[var(--surface-secondary)] border-[var(--border)]"
                    : "bg-[var(--surface-secondary)] border-[var(--border)]"
                )}>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
                    You
                  </p>
                  <p className="text-2xl font-black text-[var(--text-primary)] performance-data">
                    {userPR.weight}kg
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    × {userPR.reps} reps
                  </p>
                  {userAhead && (
                    <div className="mt-2 flex items-center gap-1 text-[var(--success)]">
                      <TrendingUpIcon className="w-3 h-3" />
                      <span className="text-[10px] font-bold">Leading!</span>
                    </div>
                  )}
                </div>

                {/* Buddy */}
                <div className={cn(
                  "p-3 rounded-xl border-2 transition-all",
                  !userAhead && !tied
                    ? "bg-gradient-to-br from-[var(--accent-light)] to-transparent border-[var(--accent)]"
                    : tied
                    ? "bg-[var(--surface-secondary)] border-[var(--border)]"
                    : "bg-[var(--surface-secondary)] border-[var(--border)]"
                )}>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
                    {buddyName}
                  </p>
                  <p className="text-2xl font-black text-[var(--text-primary)] performance-data">
                    {buddyPR.weight}kg
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    × {buddyPR.reps} reps
                  </p>
                  {!userAhead && !tied && (
                    <div className="mt-2 flex items-center gap-1 text-[var(--accent)]">
                      <TrendingUpIcon className="w-3 h-3" />
                      <span className="text-[10px] font-bold">Leading!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Gap Info */}
              {!tied && (
                <div className="mt-3 text-center">
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    {userAhead
                      ? `You're ahead by ${Math.abs(userTotal - buddyTotal).toFixed(1)}kg total volume`
                      : `You're behind by ${Math.abs(userTotal - buddyTotal).toFixed(1)}kg`
                    }
                  </p>
                </div>
              )}

              {tied && (
                <div className="mt-3 text-center">
                  <p className="text-[11px] font-bold text-[var(--primary)]">
                    Perfectly tied
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
