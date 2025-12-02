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
    <Card className="mb-[var(--space-4)] overflow-hidden">
      <CardContent className="p-[var(--space-4)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[var(--space-3)]">
            <div className={cn(
              'w-14 h-14',
              'rounded-full',
              'bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary-hover)]',
              'flex items-center justify-center',
              'shadow-[var(--shadow-lg)]'
            )}>
              <FlameIcon className="w-8 h-8 text-[var(--text-on-brand)] animate-pulse-subtle" />
            </div>

            <div>
              <p className={cn(
                'text-[var(--text-2xs)]',
                'font-[var(--weight-bold)]',
                'uppercase tracking-[var(--tracking-wider)]',
                'text-[var(--text-tertiary)]'
              )}>
                {t('streak.current')}
              </p>
              <p className={cn(
                'text-3xl',
                'font-[var(--weight-black)]',
                'text-[var(--text-primary)]',
                'stat-number'
              )}>
                {streakData.currentStreak}
                <span className={cn(
                  'text-[var(--text-lg)]',
                  'text-[var(--text-secondary)]',
                  'ml-[var(--space-1)]'
                )}>
                  {streakData.currentStreak === 1 ? t('streak.day') : t('streak.days')}
                </span>
              </p>
            </div>
          </div>

          {/* Weekly dots */}
          <div className="flex gap-[var(--space-1)]">
            {[...Array(7)].map((_, i) => {
              const dayCompleted = i < Math.min(streakData.currentStreak, 7);
              return (
                <div
                  key={i}
                  className={cn(
                    'w-1.5 h-10',
                    'rounded-full',
                    'transition-all duration-[var(--duration-fast)]',
                    dayCompleted
                      ? 'bg-gradient-to-t from-[var(--brand-primary)] to-[var(--brand-primary-hover)] shadow-[var(--shadow-sm)]'
                      : 'bg-[var(--border-default)]'
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Longest streak */}
        {streakData.longestStreak > streakData.currentStreak && (
          <div className={cn(
            'mt-[var(--space-3)] pt-[var(--space-3)]',
            'border-t border-[var(--border-default)]',
            'flex items-center justify-between'
          )}>
            <p className={cn(
              'text-[var(--text-xs)]',
              'text-[var(--text-secondary)]'
            )}>
              {t('streak.personalBest')}
            </p>
            <p className={cn(
              'text-[var(--text-sm)]',
              'font-[var(--weight-bold)]',
              'text-[var(--brand-primary)]'
            )}>
              {streakData.longestStreak} {t('streak.days')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
