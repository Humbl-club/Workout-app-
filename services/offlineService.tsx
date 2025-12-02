/**
 * Offline Detection Service
 *
 * Monitors network connectivity and provides offline state
 * Shows toast notifications when connection is lost/restored
 * Queues mutations for retry when back online
 */

import { useEffect, useState } from 'react';

export interface OfflineState {
  /** Whether user is currently offline */
  isOffline: boolean;
  /** Whether connection was just restored */
  wasOffline: boolean;
  /** Last time connection was checked */
  lastChecked: number;
}

/**
 * Hook for detecting offline/online status
 */
export function useOfflineDetection() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setWasOffline(true);

      // Show "Back online" notification
      console.log('🟢 Connection restored');

      // Reset wasOffline flag after 3 seconds
      setTimeout(() => setWasOffline(false), 3000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      console.log('🔴 Connection lost - working offline');
    };

    // Listen to browser events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic connectivity check (every 30 seconds)
    const checkInterval = setInterval(() => {
      const currentStatus = !navigator.onLine;
      if (currentStatus !== isOffline) {
        if (currentStatus) {
          handleOffline();
        } else {
          handleOnline();
        }
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(checkInterval);
    };
  }, [isOffline]);

  return { isOffline, wasOffline };
}

/**
 * Offline Indicator Component
 * Shows banner when offline
 */
export function OfflineIndicator() {
  const { isOffline, wasOffline } = useOfflineDetection();

  if (!isOffline && !wasOffline) return null;

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-[100]
        px-[var(--space-4)] py-[var(--space-3)]
        text-center text-[var(--text-sm)] font-[var(--weight-semibold)]
        transition-all duration-[var(--duration-normal)]
        ${
          isOffline
            ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]'
            : 'bg-[var(--status-success-bg)] text-[var(--status-success-text)]'
        }
      `}
      role="alert"
      aria-live="polite"
    >
      {isOffline ? '⚠️ Working offline - changes will sync when connected' : '✓ Back online'}
    </div>
  );
}

/**
 * Queue for offline mutations
 * Stores mutations to retry when back online
 */
class OfflineQueue {
  private queue: Array<() => Promise<void>> = [];
  private isProcessing = false;

  add(mutation: () => Promise<void>) {
    this.queue.push(mutation);
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    console.log(`Processing ${this.queue.length} queued mutations...`);

    while (this.queue.length > 0) {
      const mutation = this.queue.shift();
      if (mutation) {
        try {
          await mutation();
        } catch (error) {
          console.error('Failed to process queued mutation:', error);
          // Re-queue if failed
          this.queue.unshift(mutation);
          break;
        }
      }
    }

    this.isProcessing = false;
  }

  clear() {
    this.queue = [];
  }

  get size() {
    return this.queue.length;
  }
}

export const offlineQueue = new OfflineQueue();

/**
 * Auto-process queue when connection is restored
 */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlineQueue.processQueue();
  });
}
