import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

/**
 * Analytics Service - Track user events for analytics and insights
 *
 * Usage:
 * ```typescript
 * import { analytics } from './services/analyticsService';
 *
 * // Track plan generation
 * analytics.track('plan_generated', {
 *   goal: 'strength',
 *   experience: 'intermediate',
 *   generation_time_ms: 2500,
 *   model: 'gemini-2.5-flash'
 * });
 *
 * // Track workout started
 * analytics.track('workout_started', {
 *   planId: planId,
 *   dayOfWeek: 1,
 *   focus: 'Upper Body'
 * });
 * ```
 */

// Session ID for grouping related events
let currentSessionId: string | null = null;

// Generate a new session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get or create session ID
function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = generateSessionId();
  }
  return currentSessionId;
}

// Reset session (e.g., on logout)
export function resetSession(): void {
  currentSessionId = null;
}

// Detect platform
function getPlatform(): string {
  if (typeof window === 'undefined') return 'server';

  const userAgent = window.navigator.userAgent.toLowerCase();
  if (/android/.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  return 'web';
}

// Get app version
function getAppVersion(): string {
  // You can set this in your build process or package.json
  return import.meta.env.VITE_APP_VERSION || '1.0.0';
}

// Get locale
function getLocale(): string {
  return navigator.language || 'en-US';
}

// Event tracking queue (for batching)
interface QueuedEvent {
  userId: string;
  eventType: string;
  eventData: any;
  sessionId?: string;
  metadata?: any;
}

const eventQueue: QueuedEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

// Flush interval (send events every 5 seconds)
const FLUSH_INTERVAL = 5000;

// Maximum queue size (flush immediately if reached)
const MAX_QUEUE_SIZE = 10;

/**
 * Analytics Service
 */
export class AnalyticsService {
  private userId: string | null = null;
  private trackEventMutation: any = null;
  private trackEventBatchMutation: any = null;

  /**
   * Initialize analytics with user ID
   */
  init(userId: string) {
    this.userId = userId;
  }

  /**
   * Set mutation functions (from Convex hooks)
   */
  setMutations(trackEvent: any, trackEventBatch: any) {
    this.trackEventMutation = trackEvent;
    this.trackEventBatchMutation = trackEventBatch;
  }

  /**
   * Track an event
   */
  async track(
    eventType: string,
    eventData: Record<string, any> = {},
    options: {
      sessionId?: string;
      immediate?: boolean;
      metadata?: Record<string, any>;
    } = {}
  ) {
    if (!this.userId) {
      console.warn('[Analytics] User ID not set. Call analytics.init(userId) first.');
      return;
    }

    const event: QueuedEvent = {
      userId: this.userId,
      eventType,
      eventData,
      sessionId: options.sessionId || getSessionId(),
      metadata: {
        userAgent: navigator.userAgent,
        platform: getPlatform(),
        appVersion: getAppVersion(),
        locale: getLocale(),
        ...options.metadata,
      },
    };

    if (options.immediate) {
      // Send immediately
      return this.sendEvent(event);
    } else {
      // Queue for batching
      eventQueue.push(event);

      // Flush if queue is full
      if (eventQueue.length >= MAX_QUEUE_SIZE) {
        this.flush();
      } else {
        // Schedule flush
        this.scheduleFlush();
      }
    }
  }

  /**
   * Track a timed event (automatically calculates duration)
   */
  startTimer(eventType: string): (eventData?: Record<string, any>) => void {
    const startTime = Date.now();

    return (eventData: Record<string, any> = {}) => {
      const duration = Date.now() - startTime;
      this.track(eventType, {
        ...eventData,
        duration_ms: duration,
      }, {
        metadata: {
          duration_ms: duration,
          success: true,
        },
      });
    };
  }

  /**
   * Track an error
   */
  trackError(
    eventType: string,
    error: Error | string,
    eventData: Record<string, any> = {}
  ) {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    this.track(eventType, {
      ...eventData,
      error: errorMessage,
      errorStack,
    }, {
      immediate: true,
      metadata: {
        success: false,
        error: errorMessage,
      },
    });
  }

  /**
   * Flush queued events immediately
   */
  async flush() {
    if (eventQueue.length === 0) return;

    const events = [...eventQueue];
    eventQueue.length = 0; // Clear queue

    if (flushTimeout) {
      clearTimeout(flushTimeout);
      flushTimeout = null;
    }

    if (!this.trackEventBatchMutation) {
      console.warn('[Analytics] Batch mutation not set. Events will be lost.');
      return;
    }

    try {
      await this.trackEventBatchMutation({ events });
    } catch (error) {
      console.error('[Analytics] Failed to send events:', error);
    }
  }

  /**
   * Schedule a flush
   */
  private scheduleFlush() {
    if (flushTimeout) return; // Already scheduled

    flushTimeout = setTimeout(() => {
      this.flush();
    }, FLUSH_INTERVAL);
  }

  /**
   * Send a single event immediately
   */
  private async sendEvent(event: QueuedEvent) {
    if (!this.trackEventMutation) {
      console.warn('[Analytics] Track mutation not set. Event will be lost.');
      return;
    }

    try {
      await this.trackEventMutation(event);
    } catch (error) {
      console.error('[Analytics] Failed to send event:', error);
    }
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

/**
 * React hook for analytics
 *
 * Usage:
 * ```typescript
 * function MyComponent() {
 *   useAnalytics(userId); // Call once in App.tsx or top-level component
 *
 *   const handleGeneratePlan = async () => {
 *     const endTimer = analytics.startTimer('plan_generated');
 *
 *     try {
 *       const result = await generatePlan(preferences);
 *       endTimer({
 *         goal: preferences.primary_goal,
 *         experience: preferences.experience_level,
 *         model: 'gemini-2.5-flash'
 *       });
 *     } catch (error) {
 *       analytics.trackError('plan_generation_failed', error);
 *     }
 *   };
 * }
 * ```
 */
export function useAnalytics(userId: string | null) {
  const trackEvent = useMutation(api.eventTracking.trackEvent);
  const trackEventBatch = useMutation(api.eventTracking.trackEventBatch);

  // Initialize analytics
  if (userId) {
    analytics.init(userId);
    analytics.setMutations(trackEvent, trackEventBatch);
  }

  // Flush events on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      analytics.flush();
    });
  }

  return analytics;
}

/**
 * Common event types (for type safety)
 */
export const EventTypes = {
  // Onboarding
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_ABANDONED: 'onboarding_abandoned',

  // Plan Generation
  PLAN_GENERATED: 'plan_generated',
  PLAN_GENERATION_FAILED: 'plan_generation_failed',
  PLAN_ACCEPTED: 'plan_accepted',
  PLAN_REJECTED: 'plan_rejected',

  // Plan Parsing
  PLAN_PARSED: 'plan_parsed',
  PLAN_PARSING_FAILED: 'plan_parsing_failed',

  // Workout Session
  WORKOUT_STARTED: 'workout_started',
  WORKOUT_COMPLETED: 'workout_completed',
  WORKOUT_ABANDONED: 'workout_abandoned',
  EXERCISE_COMPLETED: 'exercise_completed',
  EXERCISE_SKIPPED: 'exercise_skipped',
  EXERCISE_SUBSTITUTED: 'exercise_substituted',

  // Social
  PLAN_SHARED: 'plan_shared',
  PLAN_ACCEPTED_FROM_BUDDY: 'plan_accepted_from_buddy',
  BUDDY_REQUEST_SENT: 'buddy_request_sent',
  BUDDY_REQUEST_ACCEPTED: 'buddy_request_accepted',

  // Chatbot
  CHATBOT_MESSAGE_SENT: 'chatbot_message_sent',
  CHATBOT_MESSAGE_RECEIVED: 'chatbot_message_received',
  CHATBOT_FUNCTION_CALLED: 'chatbot_function_called',

  // Exercise
  EXERCISE_EXPLANATION_VIEWED: 'exercise_explanation_viewed',
  EXERCISE_VIDEO_WATCHED: 'exercise_video_watched',

  // Progress
  PROGRESS_PHOTO_UPLOADED: 'progress_photo_uploaded',
  BODY_METRICS_UPDATED: 'body_metrics_updated',
  GOAL_CREATED: 'goal_created',
  GOAL_ACHIEVED: 'goal_achieved',

  // Achievements
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  STREAK_ACHIEVED: 'streak_achieved',
  PR_ACHIEVED: 'pr_achieved',

  // Errors
  ERROR_OCCURRED: 'error_occurred',
  API_ERROR: 'api_error',
} as const;

/**
 * Example Usage:
 *
 * ```typescript
 * // In App.tsx
 * import { useAnalytics } from './services/analyticsService';
 *
 * function App() {
 *   const user = useUser();
 *   useAnalytics(user?.id || null);
 *
 *   return <div>...</div>;
 * }
 *
 * // In any component
 * import { analytics, EventTypes } from './services/analyticsService';
 *
 * function PlanGenerator() {
 *   const handleGenerate = async () => {
 *     const endTimer = analytics.startTimer(EventTypes.PLAN_GENERATED);
 *
 *     try {
 *       const plan = await generatePlan(preferences);
 *       endTimer({
 *         goal: preferences.primary_goal,
 *         experience: preferences.experience_level,
 *         generation_time_ms: 2500,
 *         model: 'gemini-2.5-flash',
 *         token_count: 1200,
 *         strategy: 'progressive'
 *       });
 *     } catch (error) {
 *       analytics.trackError(EventTypes.PLAN_GENERATION_FAILED, error, {
 *         goal: preferences.primary_goal
 *       });
 *     }
 *   };
 * }
 * ```
 */
