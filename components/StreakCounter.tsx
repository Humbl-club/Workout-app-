import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Card, CardContent } from './ui/card';
import { FlameIcon } from './icons';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface StreakCounterProps {
  userId: string;
}

export default function StreakCounter({ userId }: StreakCounterProps) {
  const { t } = useTranslation();
  const streakData = useQuery(
    api.achievementQueries.getStreakData,
    { userId }
  );

  if (!streakData || streakData.currentStreak === 0) {
    return null; // Don't show if no streak
  }

  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-strength)] flex items-center justify-center shadow-lg">
              <FlameIcon className="w-8 h-8 text-white animate-pulse-subtle" />
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                {t('streak.current')}
              </p>
              <p className="text-3xl font-black text-[var(--text-primary)] stat-number">
                {streakData.currentStreak}
                <span className="text-[18px] text-[var(--text-secondary)] ml-1">
                  {streakData.currentStreak === 1 ? t('streak.day') : t('streak.days')}
                </span>
              </p>
            </div>
          </div>

          {/* Weekly dots */}
          <div className="flex gap-1">
            {[...Array(7)].map((_, i) => {
              const dayCompleted = i < Math.min(streakData.currentStreak, 7);
              return (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-10 rounded-full transition-all",
                    dayCompleted
                      ? "bg-gradient-to-t from-[var(--accent)] to-[var(--accent-strength)] shadow-sm"
                      : "bg-[var(--border)]"
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Longest streak */}
        {streakData.longestStreak > streakData.currentStreak && (
          <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
            <p className="text-[12px] text-[var(--text-secondary)]">
              {t('streak.personalBest')}
            </p>
            <p className="text-[14px] font-bold text-[var(--accent)]">
              {streakData.longestStreak} {t('streak.days')} 🏆
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
