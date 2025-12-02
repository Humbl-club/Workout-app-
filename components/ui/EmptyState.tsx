import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';

/**
 * EmptyState Component - Consistent empty states across the app
 *
 * Design: Clean, motivational, actionable
 * Used when: No data to display (workouts, buddies, achievements, etc.)
 */

export interface EmptyStateProps {
  /** Icon or illustration */
  icon?: React.ReactNode;
  /** Main heading */
  heading: string;
  /** Description text */
  description?: string;
  /** Primary call-to-action */
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'premium';
  };
  /** Secondary action (optional) */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Visual variant */
  variant?: 'default' | 'minimal' | 'motivational';
  /** Custom className */
  className?: string;
}

export function EmptyState({
  icon,
  heading,
  description,
  primaryAction,
  secondaryAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-[var(--space-12)] px-[var(--space-6)]',
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div
          className={cn(
            'mb-[var(--space-6)]',
            variant === 'motivational' && 'animate-bounce-subtle'
          )}
        >
          {typeof icon === 'string' ? (
            <div className="text-6xl">{icon}</div>
          ) : (
            <div
              className={cn(
                'w-20 h-20 rounded-full',
                'bg-[var(--surface-secondary)]',
                'flex items-center justify-center',
                'text-[var(--text-tertiary)]',
                variant === 'motivational' &&
                  'bg-gradient-to-br from-[var(--brand-primary-subtle)] to-[var(--surface-secondary)]'
              )}
            >
              {icon}
            </div>
          )}
        </div>
      )}

      {/* Heading */}
      <h3
        className={cn(
          'text-[var(--text-xl)] md:text-[var(--text-2xl)]',
          'font-[var(--weight-bold)]',
          'text-[var(--text-primary)]',
          'mb-[var(--space-2)]',
          'max-w-md'
        )}
      >
        {heading}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            'text-[var(--text-base)]',
            'text-[var(--text-secondary)]',
            'mb-[var(--space-6)]',
            'max-w-sm'
          )}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-[var(--space-3)] items-center">
          {primaryAction && (
            <Button
              variant={primaryAction.variant || 'primary'}
              onClick={primaryAction.onClick}
              size="lg"
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick} size="lg">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Pre-configured empty states for common scenarios
 */

export function NoWorkoutsEmptyState({ onStartWorkout }: { onStartWorkout: () => void }) {
  return (
    <EmptyState
      icon="💪"
      heading="No workouts yet"
      description="Start your first workout to track your progress and build your fitness journey."
      primaryAction={{
        label: 'Start Your First Workout',
        onClick: onStartWorkout,
        variant: 'primary',
      }}
      variant="motivational"
    />
  );
}

export function NoBuddiesEmptyState({
  onAddBuddy,
  onShareCode,
}: {
  onAddBuddy: () => void;
  onShareCode?: () => void;
}) {
  return (
    <EmptyState
      icon="👥"
      heading="No workout buddies yet"
      description="Connect with friends to share plans, compare PRs, and stay accountable together."
      primaryAction={{
        label: 'Add a Buddy',
        onClick: onAddBuddy,
        variant: 'primary',
      }}
      secondaryAction={
        onShareCode
          ? {
              label: 'Share My Code',
              onClick: onShareCode,
            }
          : undefined
      }
      variant="motivational"
    />
  );
}

export function NoAchievementsEmptyState() {
  return (
    <EmptyState
      icon="🏆"
      heading="No achievements unlocked"
      description="Complete workouts and hit milestones to unlock badges and celebrate your progress."
      variant="motivational"
    />
  );
}

export function NoHistoryEmptyState() {
  return (
    <EmptyState
      icon="📊"
      heading="No workout history"
      description="Your completed workouts will appear here. Start tracking your progress today!"
      variant="minimal"
    />
  );
}

export function ErrorEmptyState({ onRetry, error }: { onRetry: () => void; error?: string }) {
  return (
    <EmptyState
      icon="⚠️"
      heading="Something went wrong"
      description={error || 'We couldn\'t load this data. Please try again.'}
      primaryAction={{
        label: 'Try Again',
        onClick: onRetry,
        variant: 'outline',
      }}
    />
  );
}

export function NoResultsEmptyState({ searchQuery }: { searchQuery?: string }) {
  return (
    <EmptyState
      icon="🔍"
      heading="No results found"
      description={
        searchQuery
          ? `We couldn't find anything matching "${searchQuery}". Try a different search.`
          : 'No results match your filters. Try adjusting your criteria.'
      }
      variant="minimal"
    />
  );
}

export function ComingSoonEmptyState({ feature }: { feature: string }) {
  return (
    <EmptyState
      icon="🚀"
      heading="Coming Soon"
      description={`${feature} is currently in development. Stay tuned for updates!`}
      variant="minimal"
    />
  );
}
