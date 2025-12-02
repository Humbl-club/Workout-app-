/**
 * Pull-to-Refresh Indicator
 *
 * Visual feedback for pull-to-refresh gesture
 * Shows spinner that rotates based on pull distance
 */

import React from 'react';
import { cn } from '../../lib/utils';

export interface PullToRefreshIndicatorProps {
  /** Current pull distance in pixels */
  distance: number;
  /** Whether refresh threshold is reached */
  isTriggered: boolean;
  /** Whether refresh is in progress */
  isRefreshing: boolean;
  /** Threshold distance to trigger refresh */
  threshold?: number;
}

export function PullToRefreshIndicator({
  distance,
  isTriggered,
  isRefreshing,
  threshold = 80,
}: PullToRefreshIndicatorProps) {
  // Calculate opacity based on pull distance
  const opacity = Math.min(distance / threshold, 1);

  // Rotation increases as you pull (0-360 degrees)
  const rotation = Math.min((distance / threshold) * 360, 360);

  // Show if pulling or refreshing
  if (distance === 0 && !isRefreshing) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0',
        'flex justify-center items-center',
        'pt-[max(var(--space-4),env(safe-area-inset-top))]',
        'z-50 pointer-events-none'
      )}
      style={{
        opacity: isRefreshing ? 1 : opacity,
        transform: `translateY(${Math.min(distance - 40, 0)}px)`,
        transition: isRefreshing ? 'none' : 'transform 0.1s ease-out',
      }}
    >
      <div className="relative flex flex-col items-center gap-2">
        {/* Spinner */}
        <div
          className={cn(
            'w-8 h-8',
            'border-3 border-[var(--brand-primary)]',
            'border-t-transparent',
            'rounded-full',
            isRefreshing && 'animate-spin'
          )}
          style={{
            transform: isRefreshing ? undefined : `rotate(${rotation}deg)`,
            transition: isRefreshing ? 'none' : 'transform 0.1s ease-out',
            borderWidth: '3px',
          }}
        />

        {/* Status text */}
        <p
          className={cn(
            'text-xs font-bold uppercase tracking-wider',
            isTriggered
              ? 'text-[var(--brand-primary)]'
              : 'text-[var(--text-tertiary)]'
          )}
        >
          {isRefreshing
            ? 'Refreshing...'
            : isTriggered
            ? 'Release to refresh'
            : 'Pull to refresh'}
        </p>
      </div>
    </div>
  );
}
