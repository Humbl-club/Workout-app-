import * as React from "react"
import { cn } from "../../lib/utils"

/* ═══════════════════════════════════════════════════════════════
   BADGE PRIMITIVE - Phase 9.3 Composite Components

   Status indicators, labels, and counters.
   Multiple variants and sizes for different contexts.
   Uses design tokens for consistent styling.
   ═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type BadgeVariant =
  | 'default'     // Brand color (primary)
  | 'secondary'   // Subtle gray
  | 'outline'     // Border only
  | 'destructive' // Red (legacy alias for error)
  | 'success'     // Green
  | 'warning'     // Amber
  | 'error'       // Red
  | 'info'        // Blue
  | 'premium'     // Gold gradient

export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Visual variant */
  variant?: BadgeVariant
  /** Size */
  size?: BadgeSize
  /** Dot indicator instead of text */
  dot?: boolean
  /** Icon before text */
  icon?: React.ReactNode
  /** Pill shape (full rounded) */
  pill?: boolean
  /** Remove background (text only) */
  subtle?: boolean
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────

const variantStyles: Record<BadgeVariant, string> = {
  default: cn(
    'bg-[var(--brand-primary)]',
    'text-[var(--text-on-brand)]',
    'border-transparent'
  ),
  secondary: cn(
    'bg-[var(--surface-secondary)]',
    'text-[var(--text-secondary)]',
    'border-[var(--border-subtle)]'
  ),
  outline: cn(
    'bg-transparent',
    'text-[var(--text-primary)]',
    'border-[var(--border-default)]'
  ),
  destructive: cn(
    'bg-[var(--status-error-bg)]',
    'text-white',
    'border-transparent'
  ),
  success: cn(
    'bg-[var(--status-success-bg)]/15',
    'text-[var(--status-success-bg)]',
    'border-[var(--status-success-bg)]/30'
  ),
  warning: cn(
    'bg-[var(--status-warning-bg)]/15',
    'text-[var(--status-warning-bg)]',
    'border-[var(--status-warning-bg)]/30'
  ),
  error: cn(
    'bg-[var(--status-error-bg)]/15',
    'text-[var(--status-error-bg)]',
    'border-[var(--status-error-bg)]/30'
  ),
  info: cn(
    'bg-[var(--status-info-bg)]/15',
    'text-[var(--status-info-bg)]',
    'border-[var(--status-info-bg)]/30'
  ),
  premium: cn(
    'bg-gradient-to-r from-amber-500 to-yellow-400',
    'text-black',
    'border-transparent'
  ),
}

const subtleVariantStyles: Record<BadgeVariant, string> = {
  default: 'text-[var(--brand-primary)]',
  secondary: 'text-[var(--text-tertiary)]',
  outline: 'text-[var(--text-primary)]',
  destructive: 'text-[var(--status-error-bg)]',
  success: 'text-[var(--status-success-bg)]',
  warning: 'text-[var(--status-warning-bg)]',
  error: 'text-[var(--status-error-bg)]',
  info: 'text-[var(--status-info-bg)]',
  premium: 'text-amber-500',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: cn(
    'h-5 px-[var(--space-1-5)]',
    'text-[var(--text-2xs)]',
    'gap-[var(--space-1)]'
  ),
  md: cn(
    'h-6 px-[var(--space-2)]',
    'text-[var(--text-xs)]',
    'gap-[var(--space-1-5)]'
  ),
  lg: cn(
    'h-7 px-[var(--space-3)]',
    'text-[var(--text-sm)]',
    'gap-[var(--space-2)]'
  ),
}

const dotSizeStyles: Record<BadgeSize, string> = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
}

// ─────────────────────────────────────────────────────────────
// BADGE COMPONENT
// ─────────────────────────────────────────────────────────────

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    dot = false,
    icon,
    pill = true,
    subtle = false,
    children,
    ...props
  }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center',
          'font-[var(--weight-semibold)]',
          'whitespace-nowrap',
          'border',
          'transition-colors duration-[var(--duration-fast)]',
          // Focus styles
          'focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 focus:ring-offset-2',
          // Size
          sizeStyles[size],
          // Shape
          pill ? 'rounded-full' : 'rounded-[var(--radius-sm)]',
          // Variant (subtle or filled)
          subtle
            ? cn('bg-transparent border-transparent', subtleVariantStyles[variant])
            : variantStyles[variant],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'rounded-full',
              'bg-current',
              dotSizeStyles[size]
            )}
          />
        )}
        {icon && !dot && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        {children}
      </span>
    )
  }
)
Badge.displayName = "Badge"

// ─────────────────────────────────────────────────────────────
// COUNTER BADGE - For notifications counts
// ─────────────────────────────────────────────────────────────

export interface CounterBadgeProps {
  /** Count to display */
  count: number
  /** Maximum count before showing "99+" */
  max?: number
  /** Show zero count */
  showZero?: boolean
  /** Variant */
  variant?: 'primary' | 'error' | 'default'
  /** Size */
  size?: 'sm' | 'md'
  /** Additional classes */
  className?: string
}

function CounterBadge({
  count,
  max = 99,
  showZero = false,
  variant = 'error',
  size = 'sm',
  className,
}: CounterBadgeProps) {
  if (count === 0 && !showZero) return null

  const displayCount = count > max ? `${max}+` : count.toString()

  const variantClasses = {
    primary: 'bg-[var(--brand-primary)] text-[var(--text-on-brand)]',
    error: 'bg-[var(--status-error-bg)] text-white',
    default: 'bg-[var(--surface-secondary)] text-[var(--text-primary)]',
  }

  const sizeClasses = {
    sm: cn(
      'min-w-[18px] h-[18px]',
      'text-[10px]',
      'px-1'
    ),
    md: cn(
      'min-w-[22px] h-[22px]',
      'text-[var(--text-xs)]',
      'px-1.5'
    ),
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'rounded-full',
        'font-[var(--weight-bold)]',
        'tabular-nums',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {displayCount}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// STATUS DOT - Simple status indicator
// ─────────────────────────────────────────────────────────────

export type StatusDotStatus = 'online' | 'offline' | 'busy' | 'away' | 'success' | 'error' | 'warning'

export interface StatusDotProps {
  /** Status type */
  status: StatusDotStatus
  /** Size */
  size?: 'sm' | 'md' | 'lg'
  /** Pulse animation */
  pulse?: boolean
  /** Additional classes */
  className?: string
}

const statusColors: Record<StatusDotStatus, string> = {
  online: 'bg-[var(--status-success-bg)]',
  offline: 'bg-[var(--text-tertiary)]',
  busy: 'bg-[var(--status-error-bg)]',
  away: 'bg-[var(--status-warning-bg)]',
  success: 'bg-[var(--status-success-bg)]',
  error: 'bg-[var(--status-error-bg)]',
  warning: 'bg-[var(--status-warning-bg)]',
}

const statusDotSizes: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
}

function StatusDot({
  status,
  size = 'md',
  pulse = false,
  className,
}: StatusDotProps) {
  return (
    <span className={cn('relative inline-flex', className)}>
      <span
        className={cn(
          'rounded-full',
          statusDotSizes[size],
          statusColors[status]
        )}
      />
      {pulse && (
        <span
          className={cn(
            'absolute inset-0',
            'rounded-full',
            statusColors[status],
            'animate-ping opacity-75'
          )}
        />
      )}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// TAG - Removable badge
// ─────────────────────────────────────────────────────────────

export interface TagProps {
  /** Tag label */
  children: React.ReactNode
  /** Variant */
  variant?: BadgeVariant
  /** Size */
  size?: 'sm' | 'md'
  /** Remove handler */
  onRemove?: () => void
  /** Additional classes */
  className?: string
}

function Tag({
  children,
  variant = 'secondary',
  size = 'md',
  onRemove,
  className,
}: TagProps) {
  const sizeClasses = {
    sm: cn(
      'h-6 px-[var(--space-2)]',
      'text-[var(--text-xs)]',
      'gap-[var(--space-1)]'
    ),
    md: cn(
      'h-7 px-[var(--space-3)]',
      'text-[var(--text-sm)]',
      'gap-[var(--space-1-5)]'
    ),
  }

  return (
    <span
      className={cn(
        'inline-flex items-center',
        'rounded-full',
        'font-[var(--weight-medium)]',
        'border',
        variantStyles[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className={cn(
            'flex-shrink-0',
            'w-4 h-4',
            'flex items-center justify-center',
            'rounded-full',
            'hover:bg-black/10 dark:hover:bg-white/10',
            'transition-colors duration-[var(--duration-fast)]',
            '-mr-1'
          )}
          aria-label="Remove tag"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// ACHIEVEMENT BADGE - For gamification
// ─────────────────────────────────────────────────────────────

export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface AchievementBadgeProps {
  /** Achievement tier */
  tier: AchievementTier
  /** Achievement label */
  label: string
  /** Icon */
  icon?: React.ReactNode
  /** Locked state */
  locked?: boolean
  /** Size */
  size?: 'sm' | 'md' | 'lg'
  /** Additional classes */
  className?: string
}

const tierStyles: Record<AchievementTier, { bg: string; border: string; text: string }> = {
  bronze: {
    bg: 'bg-gradient-to-br from-amber-700 to-amber-900',
    border: 'border-amber-600',
    text: 'text-amber-100',
  },
  silver: {
    bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
    border: 'border-gray-400',
    text: 'text-gray-900',
  },
  gold: {
    bg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    border: 'border-yellow-300',
    text: 'text-yellow-900',
  },
  platinum: {
    bg: 'bg-gradient-to-br from-purple-400 to-indigo-600',
    border: 'border-purple-300',
    text: 'text-white',
  },
}

const achievementSizes: Record<'sm' | 'md' | 'lg', { container: string; icon: string; text: string }> = {
  sm: {
    container: 'w-12 h-12',
    icon: 'w-5 h-5',
    text: 'text-[8px]',
  },
  md: {
    container: 'w-16 h-16',
    icon: 'w-6 h-6',
    text: 'text-[10px]',
  },
  lg: {
    container: 'w-20 h-20',
    icon: 'w-8 h-8',
    text: 'text-[var(--text-xs)]',
  },
}

function AchievementBadge({
  tier,
  label,
  icon,
  locked = false,
  size = 'md',
  className,
}: AchievementBadgeProps) {
  const styles = tierStyles[tier]
  const sizeConfig = achievementSizes[size]

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-[var(--space-1)]',
        className
      )}
    >
      <div
        className={cn(
          'relative rounded-full',
          'border-2',
          'flex items-center justify-center',
          'shadow-[var(--shadow-md)]',
          sizeConfig.container,
          locked
            ? 'bg-[var(--surface-tertiary)] border-[var(--border-default)] text-[var(--text-tertiary)]'
            : cn(styles.bg, styles.border, styles.text)
        )}
      >
        {locked ? (
          <svg className={sizeConfig.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ) : icon ? (
          <span className={sizeConfig.icon}>{icon}</span>
        ) : (
          <svg className={sizeConfig.icon} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
      </div>
      <span
        className={cn(
          'font-[var(--weight-semibold)]',
          'uppercase tracking-wider',
          'text-center',
          sizeConfig.text,
          locked ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'
        )}
      >
        {label}
      </span>
    </div>
  )
}

// Legacy export for backwards compatibility
const badgeVariants = (props: { variant?: BadgeVariant }) => {
  return cn(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
    variantStyles[props.variant || 'default']
  )
}

export {
  Badge,
  badgeVariants,
  CounterBadge,
  StatusDot,
  Tag,
  AchievementBadge,
}
