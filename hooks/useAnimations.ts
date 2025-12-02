import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Standalone haptic trigger function for use outside React hooks
 * Use this for event handlers, callbacks, and non-hook contexts
 */
export const triggerHaptic = async (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium'
) => {
  const isCapacitor = typeof (window as any).Capacitor !== 'undefined';

  const vibrate = (pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  try {
    if (isCapacitor) {
      switch (type) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
      }
    } else {
      // Web fallback patterns
      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: [10, 50, 10],
        warning: [15, 30, 15],
        error: [20, 100, 20],
      };
      vibrate(patterns[type] || 20);
    }
  } catch (e) {
    // Silent fail - haptics not critical
  }
};

/**
 * useCountUp - Animates a number from start to end value
 * Perfect for stats, metrics, and achievement numbers
 */
export const useCountUp = (
  end: number,
  duration: number = 600,
  start: number = 0,
  enabled: boolean = true
): number => {
  const [count, setCount] = useState(start);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    if (!enabled) {
      setCount(end);
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const progress = timestamp - startTimeRef.current;
      const percentage = Math.min(progress / duration, 1);

      // Easing function: easeOutCubic for smooth deceleration
      const eased = 1 - Math.pow(1 - percentage, 3);
      const current = start + (end - start) * eased;

      setCount(Math.floor(current));

      if (percentage < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration, start, enabled]);

  return count;
};

/**
 * useHaptic - Trigger haptic feedback using Capacitor Haptics
 * Provides light, medium, heavy impact feedback plus notification types
 * Falls back to navigator.vibrate for web/non-Capacitor environments
 */
export const useHaptic = () => {
  const isCapacitor = typeof (window as any).Capacitor !== 'undefined';

  // Fallback vibrate for web
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Impact haptics - physical tap feedback
  const light = useCallback(async () => {
    if (isCapacitor) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch {
        vibrate(10);
      }
    } else {
      vibrate(10);
    }
  }, [isCapacitor, vibrate]);

  const medium = useCallback(async () => {
    if (isCapacitor) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
      } catch {
        vibrate(20);
      }
    } else {
      vibrate(20);
    }
  }, [isCapacitor, vibrate]);

  const heavy = useCallback(async () => {
    if (isCapacitor) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      } catch {
        vibrate(30);
      }
    } else {
      vibrate(30);
    }
  }, [isCapacitor, vibrate]);

  // Notification haptics - semantic feedback
  const success = useCallback(async () => {
    if (isCapacitor) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
      } catch {
        vibrate([10, 50, 10]);
      }
    } else {
      vibrate([10, 50, 10]);
    }
  }, [isCapacitor, vibrate]);

  const warning = useCallback(async () => {
    if (isCapacitor) {
      try {
        await Haptics.notification({ type: NotificationType.Warning });
      } catch {
        vibrate([15, 30, 15]);
      }
    } else {
      vibrate([15, 30, 15]);
    }
  }, [isCapacitor, vibrate]);

  const error = useCallback(async () => {
    if (isCapacitor) {
      try {
        await Haptics.notification({ type: NotificationType.Error });
      } catch {
        vibrate([20, 100, 20]);
      }
    } else {
      vibrate([20, 100, 20]);
    }
  }, [isCapacitor, vibrate]);

  // Selection haptics - for pickers/scrolling
  const selectionStart = useCallback(async () => {
    if (isCapacitor) {
      try {
        await Haptics.selectionStart();
      } catch {
        // No fallback needed
      }
    }
  }, [isCapacitor]);

  const selectionChanged = useCallback(async () => {
    if (isCapacitor) {
      try {
        await Haptics.selectionChanged();
      } catch {
        // No fallback needed
      }
    }
  }, [isCapacitor]);

  const selectionEnd = useCallback(async () => {
    if (isCapacitor) {
      try {
        await Haptics.selectionEnd();
      } catch {
        // No fallback needed
      }
    }
  }, [isCapacitor]);

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selectionStart,
    selectionChanged,
    selectionEnd,
  };
};

/**
 * useSwipeGesture - Handle swipe gestures on touch devices
 * Returns touch handlers and swipe state
 */
interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

interface SwipeState {
  isSwiping: boolean;
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
}

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance for a swipe (default: 50px)
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

export const useSwipeGesture = (options: SwipeOptions): [SwipeHandlers, SwipeState] => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    onSwipeStart,
    onSwipeEnd,
  } = options;

  const [state, setState] = useState<SwipeState>({
    isSwiping: false,
    direction: null,
    distance: 0,
  });

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchCurrent = useRef<{ x: number; y: number } | null>(null);

  const handlers: SwipeHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
      touchCurrent.current = { x: touch.clientX, y: touch.clientY };
      setState({ isSwiping: true, direction: null, distance: 0 });
      onSwipeStart?.();
    },

    onTouchMove: (e: React.TouchEvent) => {
      if (!touchStart.current) return;

      const touch = e.touches[0];
      touchCurrent.current = { x: touch.clientX, y: touch.clientY };

      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;

      // Determine primary direction
      let direction: 'left' | 'right' | 'up' | 'down' | null = null;
      let distance = 0;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        direction = deltaX > 0 ? 'right' : 'left';
        distance = Math.abs(deltaX);
      } else {
        // Vertical swipe
        direction = deltaY > 0 ? 'down' : 'up';
        distance = Math.abs(deltaY);
      }

      setState({ isSwiping: true, direction, distance });
    },

    onTouchEnd: () => {
      if (!touchStart.current || !touchCurrent.current) return;

      const deltaX = touchCurrent.current.x - touchStart.current.x;
      const deltaY = touchCurrent.current.y - touchStart.current.y;

      // Determine if swipe threshold was met
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) {
            onSwipeDown?.();
          } else {
            onSwipeUp?.();
          }
        }
      }

      // Reset
      touchStart.current = null;
      touchCurrent.current = null;
      setState({ isSwiping: false, direction: null, distance: 0 });
      onSwipeEnd?.();
    },
  };

  return [handlers, state];
};

/**
 * useStaggerAnimation - Stagger animations for list items
 * Returns delay values for each item
 */
export const useStaggerAnimation = (
  itemCount: number,
  delayIncrement: number = 50
): number[] => {
  return [...Array(itemCount)].map((_, i) => i * delayIncrement);
};

/**
 * useParallax - Simple device motion parallax effect
 * Returns x/y offset values based on device tilt
 */
export const useParallax = (intensity: number = 10): { x: number; y: number } => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMotion = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) return;

      // beta: front-to-back tilt (-180 to 180)
      // gamma: left-to-right tilt (-90 to 90)
      const x = (event.gamma / 90) * intensity;
      const y = (event.beta / 180) * intensity;

      setOffset({ x: -x, y: -y });
    };

    if ('DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleMotion);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleMotion);
    };
  }, [intensity]);

  return offset;
};

/**
 * useIntersectionObserver - Trigger animations when element enters viewport
 * Perfect for scroll-triggered animations
 */
export const useIntersectionObserver = (
  threshold: number = 0.1
): [React.RefObject<HTMLDivElement>, boolean] => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Once visible, stop observing (for one-time animations)
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      observer.disconnect(); // Clean up observer to prevent memory leak
    };
  }, [threshold]);

  return [ref, isVisible];
};

/**
 * useProgressSpring - Spring physics for progress bars
 * Returns animated progress value (0-1) with overshoot and settle
 */
export const useProgressSpring = (
  targetProgress: number,
  stiffness: number = 100,
  damping: number = 10
): number => {
  const [progress, setProgress] = useState(0);
  const velocityRef = useRef(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      setProgress((current) => {
        const displacement = targetProgress - current;
        const springForce = displacement * stiffness;
        const dampingForce = velocityRef.current * damping;
        const acceleration = (springForce - dampingForce) / 100;

        velocityRef.current += acceleration;
        const newProgress = current + velocityRef.current * 0.016; // Assuming 60fps

        // Stop if close enough and velocity is low
        if (Math.abs(displacement) < 0.001 && Math.abs(velocityRef.current) < 0.001) {
          velocityRef.current = 0;
          return targetProgress;
        }

        return newProgress;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetProgress, stiffness, damping]);

  return progress;
};

/**
 * useSequentialReveal - Reveal items one by one in sequence
 * Returns array of revealed indices
 */
export const useSequentialReveal = (
  itemCount: number,
  delayBetween: number = 100,
  startDelay: number = 0
): boolean[] => {
  const [revealed, setRevealed] = useState<boolean[]>(() =>
    Array.from({ length: itemCount }, () => false)
  );

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    for (let i = 0; i < itemCount; i++) {
      const timeout = setTimeout(
        () => {
          setRevealed((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        },
        startDelay + i * delayBetween
      );
      timeouts.push(timeout);
    }

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [itemCount, delayBetween, startDelay]);

  return revealed;
};

/**
 * usePulse - Create a pulsing animation value (0-1)
 * Perfect for breathing animations, attention grabbers
 */
export const usePulse = (duration: number = 2000): number => {
  const [pulseValue, setPulseValue] = useState(0);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = (elapsed % duration) / duration;

      // Sin wave for smooth pulse (0 -> 1 -> 0)
      const value = (Math.sin(progress * Math.PI * 2 - Math.PI / 2) + 1) / 2;
      setPulseValue(value);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [duration]);

  return pulseValue;
};
