/**
 * Pull-to-Refresh Hook
 *
 * Mobile-optimized pull-to-refresh with haptic feedback
 * Works on touch devices, gracefully degrades on desktop
 */

import { useEffect, useRef, useState } from 'react';
import { useHaptic } from './useAnimations';

export interface PullToRefreshOptions {
  /** Callback to execute when refresh is triggered */
  onRefresh: () => Promise<void>;
  /** Distance in pixels to trigger refresh (default: 80) */
  threshold?: number;
  /** Maximum pull distance (default: 120) */
  maxDistance?: number;
  /** Enable haptic feedback (default: true) */
  hapticFeedback?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxDistance = 120,
  hapticFeedback = true,
}: PullToRefreshOptions) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const hasTriggeredHaptic = useRef(false);
  const haptic = useHaptic();

  useEffect(() => {
    let touchStartY = 0;
    let currentPullDistance = 0;

    const handleTouchStart = (e: TouchEvent) => {
      // Only activate if scrolled to top
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY === 0 || isRefreshing) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY;

      // Only pull down when at top of page
      if (distance > 0 && window.scrollY === 0) {
        // Apply resistance curve (gets harder to pull as you go further)
        const resistance = 0.5;
        currentPullDistance = Math.min(distance * resistance, maxDistance);
        setPullDistance(currentPullDistance);

        // Trigger haptic when threshold is crossed
        if (
          hapticFeedback &&
          currentPullDistance > threshold &&
          !hasTriggeredHaptic.current
        ) {
          haptic.medium();
          hasTriggeredHaptic.current = true;
        }

        // Set pulling state
        if (currentPullDistance > threshold) {
          setIsPulling(true);
        } else {
          setIsPulling(false);
        }

        // Prevent page scroll while pulling
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (currentPullDistance > threshold && !isRefreshing) {
        setIsRefreshing(true);

        // Success haptic
        if (hapticFeedback) {
          haptic.success();
        }

        try {
          await onRefresh();
        } catch (error) {
          console.error('Refresh failed:', error);
          if (hapticFeedback) {
            haptic.error();
          }
        } finally {
          setIsRefreshing(false);
        }
      }

      // Reset state
      setPullDistance(0);
      setIsPulling(false);
      touchStartY = 0;
      currentPullDistance = 0;
      hasTriggeredHaptic.current = false;
    };

    // Add touch listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, threshold, maxDistance, isRefreshing, hapticFeedback, haptic]);

  return {
    /** Whether user is currently pulling */
    isPulling,
    /** Current pull distance in pixels */
    pullDistance,
    /** Whether refresh is in progress */
    isRefreshing,
    /** Whether threshold has been reached */
    isTriggered: pullDistance > threshold,
  };
}
