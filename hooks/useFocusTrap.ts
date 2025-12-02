/**
 * Focus Trap Hook
 *
 * Accessibility hook for trapping focus within modals/dialogs
 * Prevents keyboard navigation from leaving the modal
 * Auto-focuses first focusable element on mount
 */

import { useEffect, useRef } from 'react';

export interface FocusTrapOptions {
  /** Whether focus trap is active */
  enabled?: boolean;
  /** Element to focus on mount (default: first focusable element) */
  initialFocus?: HTMLElement | null;
  /** Callback when user tries to escape trap */
  onEscape?: () => void;
}

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
];

export function useFocusTrap(options: FocusTrapOptions = {}) {
  const { enabled = true, initialFocus, onEscape } = options;
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement;

    // Get all focusable elements
    const getFocusableElements = (): HTMLElement[] => {
      const elements = container.querySelectorAll(
        FOCUSABLE_ELEMENTS.join(',')
      );
      return Array.from(elements) as HTMLElement[];
    };

    // Focus first element on mount
    const focusableElements = getFocusableElements();
    const firstElement = initialFocus || focusableElements[0];
    if (firstElement) {
      firstElement.focus();
    }

    // Handle tab navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      // Only handle Tab key
      if (e.key !== 'Tab') return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      // Shift + Tab (backwards)
      if (e.shiftKey) {
        if (activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab (forwards)
      else {
        if (activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Attach listener
    container.addEventListener('keydown', handleKeyDown);

    // Cleanup: restore previous focus
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && document.body.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, [enabled, initialFocus, onEscape]);

  return containerRef;
}
