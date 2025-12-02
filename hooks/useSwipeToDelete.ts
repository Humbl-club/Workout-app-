/**
 * Swipe-to-Delete Hook
 *
 * Mobile swipe gesture for deleting items from lists
 * Shows delete button on swipe, confirms with second tap
 * Haptic feedback for better UX
 */

import { useRef, useState, useEffect } from 'react';
import { useHaptic } from './useAnimations';

export interface SwipeToDeleteOptions {
  /** Callback when item is deleted */
  onDelete: () => Promise<void> | void;
  /** Threshold distance to trigger delete (default: 80px) */
  threshold?: number;
  /** Enable haptic feedback (default: true) */
  hapticFeedback?: boolean;
  /** Disable the swipe gesture */
  disabled?: boolean;
}

export function useSwipeToDelete({
  onDelete,
  threshold = 80,
  hapticFeedback = true,
  disabled = false,
}: SwipeToDeleteOptions) {
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const elementRef = useRef<HTMLElement>(null);
  const startX = useRef(0);
  const hasTriggeredHaptic = useRef(false);
  const haptic = useHaptic();

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    if (hapticFeedback) {
      haptic.success();
    }

    try {
      await onDelete();
    } catch (error) {
      console.error('Delete failed:', error);
      if (hapticFeedback) {
        haptic.error();
      }
      // Reset on error
      setSwipeDistance(0);
      setShowDeleteButton(false);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    if (disabled || !elementRef.current) return;

    const element = elementRef.current;
    let currentSwipeDistance = 0;
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      startX.current = touchStartX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartX === 0 || isDeleting) return;

      const touchX = e.touches[0].clientX;
      const distance = touchStartX - touchX; // Swipe left = positive

      // Only allow left swipe
      if (distance > 0) {
        currentSwipeDistance = Math.min(distance, threshold * 1.5);
        setSwipeDistance(currentSwipeDistance);

        // Trigger haptic at threshold
        if (
          hapticFeedback &&
          currentSwipeDistance > threshold &&
          !hasTriggeredHaptic.current
        ) {
          haptic.medium();
          hasTriggeredHaptic.current = true;
        }

        // Prevent scrolling while swiping
        if (distance > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = () => {
      if (currentSwipeDistance > threshold) {
        // Show delete button
        setShowDeleteButton(true);
        setSwipeDistance(threshold);
      } else {
        // Reset swipe
        setSwipeDistance(0);
        setShowDeleteButton(false);
      }

      // Reset state
      touchStartX = 0;
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
  }, [threshold, isDeleting, hapticFeedback, disabled, haptic, onDelete]);

  const reset = () => {
    setSwipeDistance(0);
    setShowDeleteButton(false);
  };

  return {
    /** Ref to attach to swipeable element */
    elementRef,
    /** Current swipe distance in pixels */
    swipeDistance,
    /** Whether delete button is visible */
    showDeleteButton,
    /** Whether deletion is in progress */
    isDeleting,
    /** Trigger delete action */
    handleDelete,
    /** Reset swipe state */
    reset,
  };
}
