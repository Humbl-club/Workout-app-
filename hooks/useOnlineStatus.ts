/**
 * Online/Offline Status Hook
 *
 * iPhone-First Considerations:
 * - Critical for iPhone users on cellular/WiFi
 * - Convex has built-in reconnection logic
 * - This hook provides UI feedback for connection state
 * - Uses Network Information API when available (iOS Safari doesn't support it)
 */

import { useState, useEffect, useRef } from 'react';

export interface ConnectionStatus {
  isOnline: boolean;
  isConnecting: boolean;
  downlink?: number; // Mbps (when available)
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g'; // When available
  rtt?: number; // Round trip time in ms
}

/**
 * Hook to monitor online/offline status and network quality
 */
export function useOnlineStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isConnecting: false,
  });

  useEffect(() => {
    const updateOnlineStatus = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: navigator.onLine,
        isConnecting: false,
      }));
    };

    const updateOfflineStatus = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        isConnecting: false,
      }));
    };

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOfflineStatus);

    // Network Information API (if available)
    // Note: Not supported in iOS Safari as of 2025
    if ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator) {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

      const updateConnectionInfo = () => {
        setStatus(prev => ({
          ...prev,
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
        }));
      };

      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo(); // Initial values

      return () => {
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOfflineStatus);
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOfflineStatus);
    };
  }, []);

  return status;
}

/**
 * Hook to detect when Convex connection is lost/restored
 * Uses visibility change and focus events to detect when app comes back
 */
export function useConvexConnectionStatus() {
  const [isConvexConnected, setIsConvexConnected] = useState(true);
  const [lastDisconnect, setLastDisconnect] = useState<Date | null>(null);
  // Use ref to avoid dependency loop - lastDisconnect is used inside effect but shouldn't trigger re-runs
  const lastDisconnectRef = useRef<Date | null>(null);

  useEffect(() => {
    // Listen for Convex connection events (if exposed)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // App came back to foreground
        // Check if we were disconnected (use ref to avoid stale closure)
        if (lastDisconnectRef.current) {
          const disconnectedDuration = Date.now() - lastDisconnectRef.current.getTime();
          if (disconnectedDuration > 5000) {
            // Was disconnected for >5s, show reconnecting
            setIsConvexConnected(false);
            setTimeout(() => setIsConvexConnected(true), 2000);
          }
        }
      }
    };

    const handleOnline = () => {
      lastDisconnectRef.current = null;
      setLastDisconnect(null);
      setIsConvexConnected(true);
    };

    const handleOffline = () => {
      const now = new Date();
      lastDisconnectRef.current = now;
      setLastDisconnect(now);
      setIsConvexConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty deps - handlers don't need to be re-attached

  return { isConvexConnected, lastDisconnect };
}

/**
 * Get connection quality description
 */
export function getConnectionQuality(status: ConnectionStatus): 'excellent' | 'good' | 'poor' | 'offline' {
  if (!status.isOnline) return 'offline';

  if (status.effectiveType) {
    switch (status.effectiveType) {
      case '4g':
        return 'excellent';
      case '3g':
        return 'good';
      case '2g':
      case 'slow-2g':
        return 'poor';
    }
  }

  // Fallback to RTT if available
  if (status.rtt !== undefined) {
    if (status.rtt < 100) return 'excellent';
    if (status.rtt < 300) return 'good';
    return 'poor';
  }

  // Default to good if online but no metrics
  return 'good';
}

/**
 * Format connection status for display
 */
export function formatConnectionStatus(status: ConnectionStatus): string {
  if (!status.isOnline) return 'Offline';
  if (status.isConnecting) return 'Connecting...';

  const quality = getConnectionQuality(status);
  switch (quality) {
    case 'excellent':
      return 'Excellent connection';
    case 'good':
      return 'Good connection';
    case 'poor':
      return 'Slow connection';
    default:
      return 'Online';
  }
}
