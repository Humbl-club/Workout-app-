/**
 * Offline Indicator Component
 *
 * iPhone-First Design:
 * - Minimal, non-intrusive banner
 * - Appears at top when connection lost
 * - Auto-dismisses when back online
 * - Respects safe area insets
 */

import React, { useEffect, useState } from 'react';
import { useOnlineStatus, formatConnectionStatus } from '@/hooks/useOnlineStatus';
import { WifiOffIcon, WifiIcon, AlertTriangleIcon } from 'lucide-react';

export default function OfflineIndicator() {
  const status = useOnlineStatus();
  const [show, setShow] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (!status.isOnline) {
      setShow(true);
      setJustReconnected(false);
    } else {
      // When coming back online, show "back online" message briefly
      if (show) {
        setJustReconnected(true);
        setTimeout(() => {
          setShow(false);
          setJustReconnected(false);
        }, 3000);
      }
    }
  }, [status.isOnline, show]);

  if (!show) return null;

  const bgColor = justReconnected ? 'bg-green-500 text-white' : 'bg-orange-500 text-white';

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 px-4 pt-safe-top"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`mx-auto max-w-md rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 ${bgColor} animate-slide-down`}
      >
        {/* Icon */}
        {justReconnected ? (
          <WifiIcon className="h-5 w-5 flex-shrink-0" />
        ) : (
          <WifiOffIcon className="h-5 w-5 flex-shrink-0" />
        )}

        {/* Message */}
        <div className="flex-1">
          <p className="text-sm font-medium">
            {justReconnected ? 'Back online' : 'No internet connection'}
          </p>
          {!justReconnected && (
            <p className="text-xs opacity-90 mt-0.5">
              Changes will sync when reconnected
            </p>
          )}
        </div>

        {/* Dismiss button (for offline state only) */}
        {!justReconnected && (
          <button
            onClick={() => setShow(false)}
            className="p-1 hover:bg-white/10 rounded transition-colors active:scale-95"
            aria-label="Dismiss"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Connection Quality Indicator (for Settings/Debug)
 */
export function ConnectionQualityIndicator() {
  const status = useOnlineStatus();

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {status.isOnline ? (
        <WifiIcon className="h-4 w-4 text-green-600" />
      ) : (
        <WifiOffIcon className="h-4 w-4 text-red-600" />
      )}
      <span>{formatConnectionStatus(status)}</span>
      {status.effectiveType && (
        <span className="text-xs px-2 py-0.5 bg-muted rounded">
          {status.effectiveType.toUpperCase()}
        </span>
      )}
    </div>
  );
}

/**
 * Slow Connection Warning (for data-heavy operations)
 */
export function SlowConnectionWarning() {
  const status = useOnlineStatus();

  // Only show if connection is poor
  const shouldShow = status.isOnline && (
    status.effectiveType === '2g' ||
    status.effectiveType === 'slow-2g' ||
    (status.rtt !== undefined && status.rtt > 500)
  );

  if (!shouldShow) return null;

  return (
    <div
      className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3"
      role="alert"
    >
      <AlertTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-yellow-900">
          Slow connection detected
        </p>
        <p className="text-xs text-yellow-700 mt-1">
          Some features may load slowly. Consider connecting to WiFi.
        </p>
      </div>
    </div>
  );
}
