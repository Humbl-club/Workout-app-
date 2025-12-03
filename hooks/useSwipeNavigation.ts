import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useHaptic } from './useAnimations';

/* ═══════════════════════════════════════════════════════════════
   SWIPE NAVIGATION HOOK - iOS Native Feel with Animation

   Enables horizontal swipe gestures to navigate between pages.
   The page follows your finger with physics-based animation.

   Features:
   - Page follows finger during swipe (translateX)
   - Snap-back animation if swipe not completed
   - Momentum-based page change detection
   - Next/previous page peek during swipe
   - 60fps GPU-accelerated transforms
   - Haptic feedback on page change
   ═══════════════════════════════════════════════════════════════ */

type Page = 'home' | 'goals' | 'buddies' | 'plan' | 'profile';

const PAGE_ORDER: Page[] = ['home', 'goals', 'buddies', 'plan', 'profile'];

interface UseSwipeNavigationOptions {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  enabled?: boolean;
  threshold?: number; // Percentage of screen width to trigger navigation (0-1)
  resistanceFactor?: number; // How much to resist at edges (0-1)
}

interface SwipeState {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  isHorizontalSwipe: boolean | null;
  isDragging: boolean;
}

export function useSwipeNavigation({
  currentPage,
  onNavigate,
  enabled = true,
  threshold = 0.3, // 30% of screen width
  resistanceFactor = 0.4, // 40% resistance at edges
}: UseSwipeNavigationOptions) {
  const haptic = useHaptic();
  const swipeState = useRef<SwipeState | null>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const getCurrentIndex = useCallback(() => {
    return PAGE_ORDER.indexOf(currentPage);
  }, [currentPage]);

  const canSwipeLeft = useCallback(() => {
    const index = getCurrentIndex();
    return index < PAGE_ORDER.length - 1;
  }, [getCurrentIndex]);

  const canSwipeRight = useCallback(() => {
    const index = getCurrentIndex();
    return index > 0;
  }, [getCurrentIndex]);

  // Animate to target position
  const animateTo = useCallback((targetX: number, onComplete?: () => void) => {
    setIsAnimating(true);
    setTranslateX(targetX);

    // Wait for CSS transition to complete
    setTimeout(() => {
      setIsAnimating(false);
      setTranslateX(0);
      setSwipeDirection(null);
      onComplete?.();
    }, 300); // Match CSS transition duration
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || isAnimating) return;

    // Don't interfere with interactive elements or protected zones
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[role="slider"]') ||
      target.closest('[role="tablist"]') ||
      target.closest('.swipe-ignore') ||
      target.closest('nav') || // Navbar
      target.closest('header') // Header
    ) {
      return;
    }

    // Also ignore touches in the bottom 100px (navbar zone) or top 120px (header zone)
    const touch = e.touches[0];
    const screenHeight = window.innerHeight;
    const safeAreaBottom = 100; // Approximate navbar height + safe area
    const safeAreaTop = 120; // Approximate header height + safe area

    if (touch.clientY > screenHeight - safeAreaBottom || touch.clientY < safeAreaTop) {
      return;
    }

    swipeState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
      currentX: touch.clientX,
      isHorizontalSwipe: null,
      isDragging: false,
    };
  }, [enabled, isAnimating]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || !swipeState.current || isAnimating) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeState.current.startX;
    const deltaY = touch.clientY - swipeState.current.startY;

    // Determine swipe direction on first significant movement
    if (swipeState.current.isHorizontalSwipe === null) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Need at least 10px movement to determine direction
      if (absX > 10 || absY > 10) {
        swipeState.current.isHorizontalSwipe = absX > absY * 1.2; // Favor horizontal slightly
      }
    }

    // Only process horizontal swipes
    if (!swipeState.current.isHorizontalSwipe) return;

    swipeState.current.currentX = touch.clientX;
    swipeState.current.isDragging = true;

    // Calculate resistance at edges
    let adjustedDeltaX = deltaX;
    const screenWidth = window.innerWidth;

    // Apply resistance when swiping beyond boundaries
    if (deltaX > 0 && !canSwipeRight()) {
      // Trying to swipe right but at first page
      adjustedDeltaX = deltaX * resistanceFactor;
    } else if (deltaX < 0 && !canSwipeLeft()) {
      // Trying to swipe left but at last page
      adjustedDeltaX = deltaX * resistanceFactor;
    }

    // Cap the maximum swipe distance
    const maxSwipe = screenWidth * 0.8;
    adjustedDeltaX = Math.max(-maxSwipe, Math.min(maxSwipe, adjustedDeltaX));

    // Update direction for peek effect
    if (deltaX > 20) {
      setSwipeDirection('right');
    } else if (deltaX < -20) {
      setSwipeDirection('left');
    }

    setTranslateX(adjustedDeltaX);

    // Prevent vertical scroll during horizontal swipe
    if (Math.abs(deltaX) > 15) {
      e.preventDefault();
    }
  }, [enabled, isAnimating, canSwipeLeft, canSwipeRight, resistanceFactor]);

  const handleTouchEnd = useCallback(() => {
    if (!enabled || !swipeState.current || isAnimating) {
      swipeState.current = null;
      return;
    }

    const { startX, startTime, currentX, isHorizontalSwipe, isDragging } = swipeState.current;

    if (!isHorizontalSwipe || !isDragging) {
      swipeState.current = null;
      setTranslateX(0);
      setSwipeDirection(null);
      return;
    }

    const deltaX = currentX - startX;
    const elapsed = Date.now() - startTime;
    const velocity = Math.abs(deltaX) / elapsed; // px per ms
    const screenWidth = window.innerWidth;
    const swipePercentage = Math.abs(deltaX) / screenWidth;

    const currentIndex = getCurrentIndex();

    // Determine if we should navigate based on distance OR velocity
    const meetsThreshold = swipePercentage >= threshold;
    const meetsVelocity = velocity >= 0.5 && swipePercentage >= 0.1; // Fast swipe with at least 10% distance

    if ((meetsThreshold || meetsVelocity) && deltaX > 0 && canSwipeRight()) {
      // Swipe right → go to previous page
      haptic.light();
      animateTo(screenWidth, () => {
        onNavigate(PAGE_ORDER[currentIndex - 1]);
      });
    } else if ((meetsThreshold || meetsVelocity) && deltaX < 0 && canSwipeLeft()) {
      // Swipe left → go to next page
      haptic.light();
      animateTo(-screenWidth, () => {
        onNavigate(PAGE_ORDER[currentIndex + 1]);
      });
    } else {
      // Snap back to original position
      animateTo(0);
    }

    swipeState.current = null;
  }, [enabled, isAnimating, threshold, getCurrentIndex, canSwipeLeft, canSwipeRight, haptic, onNavigate, animateTo]);

  // Attach listeners
  useEffect(() => {
    if (!enabled) return;

    const options: AddEventListenerOptions = { passive: false };

    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd, options);
    document.addEventListener('touchcancel', handleTouchEnd, options);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Reset on page change
  useEffect(() => {
    setTranslateX(0);
    setSwipeDirection(null);
  }, [currentPage]);

  return {
    translateX,
    isAnimating,
    swipeDirection,
    canSwipeLeft: canSwipeLeft(),
    canSwipeRight: canSwipeRight(),
    currentIndex: getCurrentIndex(),
    pageCount: PAGE_ORDER.length,
    // CSS style to apply to the page container
    swipeStyle: {
      transform: `translateX(${translateX}px)`,
      transition: isAnimating ? 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
      willChange: translateX !== 0 ? 'transform' : 'auto',
    } as React.CSSProperties,
  };
}

export default useSwipeNavigation;
