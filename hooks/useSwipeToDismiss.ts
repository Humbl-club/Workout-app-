/**
 * Swipe-to-Dismiss Hook
 *
 * Vertical swipe gesture for dismissing modals/sheets
 * Swipe down to close, with resistance curve
 * Haptic feedback and smooth animations
 */

import { useRef, useState, useEffect } from 'react';
import { triggerHaptic } from './useAnimations';

export interface SwipeToDismissOptions {
  /** Callback when modal is dismissed */
  onDismiss: () => void;
  /** Threshold distance to trigger dismiss (default: 100px) */
  threshold?: number;
  /** Maximum swipe distance (default: 200px) */
  maxDistance?: number;
  /** Enable haptic feedback (default: true) */
  hapticFeedback?: boolean;
  /** Disable the swipe gesture */
  disabled?: boolean;
}

export function useSwipeToDismiss({
  onDismiss,
  threshold = 100,
  maxDistance = 200,
  hapticFeedback = true,
  disabled = false,
}: SwipeToDismissOptions) {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isDismissing, setIsDismissing] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const startY = useRef(0);
  const hasTriggeredHaptic = useRef(false);

  useEffect(() => {
    if (disabled || !elementRef.current) return;

    const element = elementRef.current;
    let currentSwipeDistance = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      startY.current = touchStartY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY === 0 || isDismissing) return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY; // Swipe down = positive

      // Only allow downward swipe
      if (distance > 0) {
        // Apply resistance curve (gets harder to swipe as you go further)
        const resistance = 0.5;
        currentSwipeDistance = Math.min(distance * resistance, maxDistance);
        setSwipeDistance(currentSwipeDistance);

        // Trigger haptic when threshold is crossed
        if (
          hapticFeedback &&
          currentSwipeDistance > threshold &&
          !hasTriggeredHaptic.current
        ) {
          triggerHaptic('medium');
          hasTriggeredHaptic.current = true;
        }

        // Prevent page scroll while swiping
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (currentSwipeDistance > threshold && !isDismissing) {
        // Dismiss modal
        setIsDismissing(true);
        if (hapticFeedback) {
          triggerHaptic('success');
        }
        onDismiss();
      } else {
        // Reset swipe
        setSwipeDistance(0);
      }

      // Reset state
      touchStartY = 0;
      currentSwipeDistance = 0;
      hasTriggeredHaptic.current = false;
    };

    // Add touch listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [threshold, maxDistance, isDismissing, hapticFeedback, disabled, onDismiss]);

  return {
    /** Ref to attach to dismissible element */
    elementRef,
    /** Current swipe distance in pixels */
    swipeDistance,
    /** Whether dismiss is in progress */
    isDismissing,
    /** Whether threshold has been reached */
    isTriggered: swipeDistance > threshold,
  };
}
