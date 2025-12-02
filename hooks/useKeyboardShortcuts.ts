/**
 * Keyboard Shortcuts Hook
 *
 * iPhone-First Considerations:
 * - Most shortcuts won't be used on iPhone (no physical keyboard)
 * - BUT when using iPad with keyboard or when testing on desktop
 * - Provides accessibility shortcuts for power users
 * - Also handles iOS VoiceOver navigation hints
 */

import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Command key on Mac
  action: () => void;
  description: string;
  category: 'navigation' | 'workout' | 'social' | 'general';
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts?: KeyboardShortcut[];
  onNavigate?: (page: string) => void;
}

/**
 * Hook to enable keyboard shortcuts throughout the app
 *
 * Default Shortcuts:
 * - Cmd/Ctrl + K: Open chatbot
 * - Cmd/Ctrl + N: New workout
 * - Esc: Close modals
 * - Space: Start/pause workout timer
 *
 * Note: Navigation shortcuts (H, P, L, B) only work when onNavigate callback is provided
 */
export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { enabled = true, shortcuts = [], onNavigate } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow ESC to blur input
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      // Check custom shortcuts first
      for (const shortcut of shortcuts) {
        const modifierMatch =
          (shortcut.ctrl === undefined || shortcut.ctrl === e.ctrlKey) &&
          (shortcut.shift === undefined || shortcut.shift === e.shiftKey) &&
          (shortcut.alt === undefined || shortcut.alt === e.altKey) &&
          (shortcut.meta === undefined || shortcut.meta === e.metaKey);

        if (e.key === shortcut.key && modifierMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }

      // Default shortcuts (cross-platform: Cmd on Mac, Ctrl on Windows)
      const modKey = e.metaKey || e.ctrlKey;

      if (modKey) {
        switch (e.key.toLowerCase()) {
          case 'h':
            if (onNavigate) {
              e.preventDefault();
              onNavigate('home');
            }
            break;
          case 'p':
            if (onNavigate) {
              e.preventDefault();
              onNavigate('plan');
            }
            break;
          case 'l':
            if (onNavigate) {
              e.preventDefault();
              onNavigate('logbook');
            }
            break;
          case 'b':
            if (onNavigate) {
              e.preventDefault();
              onNavigate('buddies');
            }
            break;
          case 'k':
            e.preventDefault();
            // Trigger chatbot open event
            window.dispatchEvent(new CustomEvent('open-chatbot'));
            break;
          case 'n':
            e.preventDefault();
            // Trigger new workout event
            window.dispatchEvent(new CustomEvent('start-workout'));
            break;
          case '/':
            e.preventDefault();
            // Trigger search
            window.dispatchEvent(new CustomEvent('open-search'));
            break;
        }
      } else {
        // No modifier shortcuts
        switch (e.key) {
          case 'Escape':
            // Close any open modals
            window.dispatchEvent(new CustomEvent('close-modal'));
            break;
          case ' ':
            // Start/pause timer (only if in workout session)
            if (window.location.pathname.includes('/session')) {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('toggle-workout-timer'));
            }
            break;
          case '?':
            // Show keyboard shortcuts help
            e.preventDefault();
            window.dispatchEvent(new CustomEvent('show-shortcuts-help'));
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, shortcuts, onNavigate]);
}

/**
 * Get all available keyboard shortcuts
 */
export function getDefaultShortcuts(): KeyboardShortcut[] {
  return [
    // Navigation
    {
      key: 'h',
      meta: true,
      ctrl: true,
      action: () => {},
      description: 'Go to Home',
      category: 'navigation',
    },
    {
      key: 'p',
      meta: true,
      ctrl: true,
      action: () => {},
      description: 'Go to Plans',
      category: 'navigation',
    },
    {
      key: 'l',
      meta: true,
      ctrl: true,
      action: () => {},
      description: 'Go to Logbook',
      category: 'navigation',
    },
    {
      key: 'b',
      meta: true,
      ctrl: true,
      action: () => {},
      description: 'Go to Buddies',
      category: 'navigation',
    },

    // Actions
    {
      key: 'k',
      meta: true,
      ctrl: true,
      action: () => {},
      description: 'Open AI Chatbot',
      category: 'general',
    },
    {
      key: 'n',
      meta: true,
      ctrl: true,
      action: () => {},
      description: 'Start New Workout',
      category: 'workout',
    },
    {
      key: '/',
      meta: true,
      ctrl: true,
      action: () => {},
      description: 'Search Exercises',
      category: 'general',
    },

    // Utility
    {
      key: 'Escape',
      action: () => {},
      description: 'Close Modal',
      category: 'general',
    },
    {
      key: ' ',
      action: () => {},
      description: 'Start/Pause Timer',
      category: 'workout',
    },
    {
      key: '?',
      action: () => {},
      description: 'Show Shortcuts Help',
      category: 'general',
    },
  ];
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  // Detect Mac vs Windows
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

  if (shortcut.meta || shortcut.ctrl) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  // Format key
  const keyDisplay = shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase();
  parts.push(keyDisplay);

  return parts.join(isMac ? '' : '+');
}

/**
 * iOS VoiceOver accessibility hints
 */
export function getVoiceOverHint(action: string): string {
  const hints: Record<string, string> = {
    'start-workout': 'Double-tap to start workout',
    'finish-workout': 'Double-tap to complete workout',
    'log-set': 'Double-tap to log set',
    'skip-exercise': 'Double-tap to skip exercise',
    'open-chat': 'Double-tap to open AI coach',
    'view-history': 'Double-tap to view exercise history',
    'share-plan': 'Double-tap to share plan with buddy',
  };

  return hints[action] || 'Double-tap to activate';
}
