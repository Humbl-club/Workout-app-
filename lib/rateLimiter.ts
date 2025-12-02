/**
 * Rate limiting system for API usage control
 * Prevents abuse and manages costs
 */

export type UserTier = 'free' | 'premium';

export interface UsageLimits {
  plansPerMonth: number;
  chatMessagesPerMonth: number;
  planParsesPerMonth: number;
}

export interface UsageStats {
  plansGenerated: number;
  chatMessagesSent: number;
  plansParsed: number;
  periodStart: string; // ISO date
  periodEnd: string;
}

/**
 * Usage limits by tier
 * NOTE: Limits set to unlimited for development - restore before production
 */
export const USAGE_LIMITS: Record<UserTier, UsageLimits> = {
  free: {
    plansPerMonth: 99999,        // DEV: unlimited
    chatMessagesPerMonth: 99999, // DEV: unlimited
    planParsesPerMonth: 99999    // DEV: unlimited
  },
  premium: {
    plansPerMonth: 99999,
    chatMessagesPerMonth: 99999,
    planParsesPerMonth: 99999
  }
};

/**
 * Check if user has exceeded their usage limit
 */
export function hasExceededLimit(
  usage: UsageStats,
  tier: UserTier,
  action: 'plan' | 'chat' | 'parse'
): boolean {
  const limits = USAGE_LIMITS[tier];

  switch (action) {
    case 'plan':
      return usage.plansGenerated >= limits.plansPerMonth;
    case 'chat':
      return usage.chatMessagesSent >= limits.chatMessagesPerMonth;
    case 'parse':
      return usage.plansParsed >= limits.planParsesPerMonth;
    default:
      return false;
  }
}

/**
 * Get remaining usage for a user
 */
export function getRemainingUsage(
  usage: UsageStats,
  tier: UserTier
): UsageLimits {
  const limits = USAGE_LIMITS[tier];

  return {
    plansPerMonth: Math.max(0, limits.plansPerMonth - usage.plansGenerated),
    chatMessagesPerMonth: Math.max(0, limits.chatMessagesPerMonth - usage.chatMessagesSent),
    planParsesPerMonth: Math.max(0, limits.planParsesPerMonth - usage.plansParsed)
  };
}

/**
 * Check if usage period has expired (monthly reset)
 */
export function shouldResetUsage(periodStart: string): boolean {
  const start = new Date(periodStart);
  const now = new Date();

  // Check if a month has passed
  const monthDiff = (now.getFullYear() - start.getFullYear()) * 12
    + (now.getMonth() - start.getMonth());

  return monthDiff >= 1;
}

/**
 * Create initial usage stats
 */
export function createInitialUsage(): UsageStats {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return {
    plansGenerated: 0,
    chatMessagesSent: 0,
    plansParsed: 0,
    periodStart: now.toISOString(),
    periodEnd: nextMonth.toISOString()
  };
}

/**
 * Get user-friendly limit exceeded message
 */
export function getLimitMessage(
  action: 'plan' | 'chat' | 'parse',
  tier: UserTier,
  remaining: UsageLimits
): string {
  if (tier === 'free') {
    switch (action) {
      case 'plan':
        return `You've used your free plan generation this month. Upgrade to Premium for unlimited AI-generated plans!`;
      case 'chat':
        return `You've reached your 10 free AI messages this month. Upgrade to Premium for unlimited AI coaching!`;
      case 'parse':
        return `You've used your free plan imports this month. Upgrade to Premium for more imports!`;
    }
  } else {
    return `You've reached your monthly limit. This resets in ${getRemainingDays(remaining.plansPerMonth)} days.`;
  }
}

function getRemainingDays(periodEnd: number): number {
  const now = new Date();
  const end = new Date(periodEnd);
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calculate percentage of limit used
 */
export function getUsagePercentage(
  usage: UsageStats,
  tier: UserTier,
  action: 'plan' | 'chat' | 'parse'
): number {
  const limits = USAGE_LIMITS[tier];

  switch (action) {
    case 'plan':
      return Math.round((usage.plansGenerated / limits.plansPerMonth) * 100);
    case 'chat':
      return Math.round((usage.chatMessagesSent / limits.chatMessagesPerMonth) * 100);
    case 'parse':
      return Math.round((usage.plansParsed / limits.planParsesPerMonth) * 100);
    default:
      return 0;
  }
}
