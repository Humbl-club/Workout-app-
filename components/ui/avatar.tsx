import * as React from "react"
import { cn } from "../../lib/utils"

/* ═══════════════════════════════════════════════════════════════
   AVATAR PRIMITIVE - Phase 9.3 Composite Components

   User profile images with fallback initials.
   Multiple sizes for different contexts.
   Supports status indicators and badges.
   Uses design tokens for consistent styling.
   ═══════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source URL */
  src?: string | null
  /** Alt text for image */
  alt?: string
  /** Fallback initials (2 chars max) */
  initials?: string
  /** Size variant */
  size?: AvatarSize
  /** Border radius - 'full' for circle, 'rounded' for rounded square */
  shape?: 'circle' | 'rounded'
  /** Online status indicator */
  status?: AvatarStatus
  /** Show verified badge */
  verified?: boolean
  /** Custom background color for initials */
  bgColor?: string
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────

const sizeStyles: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: {
    container: 'w-6 h-6',
    text: 'text-[10px]',
    status: 'w-2 h-2 border',
  },
  sm: {
    container: 'w-8 h-8',
    text: 'text-[var(--text-xs)]',
    status: 'w-2.5 h-2.5 border',
  },
  md: {
    container: 'w-10 h-10',
    text: 'text-[var(--text-sm)]',
    status: 'w-3 h-3 border-2',
  },
  lg: {
    container: 'w-12 h-12',
    text: 'text-[var(--text-base)]',
    status: 'w-3.5 h-3.5 border-2',
  },
  xl: {
    container: 'w-16 h-16',
    text: 'text-[var(--text-lg)]',
    status: 'w-4 h-4 border-2',
  },
  '2xl': {
    container: 'w-24 h-24',
    text: 'text-[var(--text-2xl)]',
    status: 'w-5 h-5 border-2',
  },
}

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-[var(--status-success-bg)]',
  offline: 'bg-[var(--text-tertiary)]',
  busy: 'bg-[var(--status-error-bg)]',
  away: 'bg-[var(--status-warning-bg)]',
}

// Default gradient colors for initials (based on first letter)
const defaultColors = [
  'from-red-500 to-orange-500',
  'from-orange-500 to-amber-500',
  'from-amber-500 to-yellow-500',
  'from-green-500 to-emerald-500',
  'from-emerald-500 to-teal-500',
  'from-teal-500 to-cyan-500',
  'from-cyan-500 to-blue-500',
  'from-blue-500 to-indigo-500',
  'from-indigo-500 to-purple-500',
  'from-purple-500 to-pink-500',
  'from-pink-500 to-rose-500',
  'from-rose-500 to-red-500',
]

function getColorFromInitial(initial?: string): string {
  if (!initial) return defaultColors[0]
  const index = initial.toUpperCase().charCodeAt(0) % defaultColors.length
  return defaultColors[index]
}

// ─────────────────────────────────────────────────────────────
// AVATAR COMPONENT
// ─────────────────────────────────────────────────────────────

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({
    className,
    src,
    alt = 'Avatar',
    initials,
    size = 'md',
    shape = 'circle',
    status,
    verified = false,
    bgColor,
    ...props
  }, ref) => {
    const [imageError, setImageError] = React.useState(false)
    const sizeConfig = sizeStyles[size]
    const showFallback = !src || imageError

    // Reset error state when src changes
    React.useEffect(() => {
      setImageError(false)
    }, [src])

    const displayInitials = initials?.slice(0, 2).toUpperCase() || '?'
    const gradientColor = bgColor || getColorFromInitial(displayInitials[0])

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center',
          'flex-shrink-0',
          sizeConfig.container,
          shape === 'circle' ? 'rounded-full' : 'rounded-[var(--radius-lg)]',
          'overflow-hidden',
          'bg-[var(--surface-secondary)]',
          className
        )}
        {...props}
      >
        {/* Image */}
        {!showFallback && (
          <img
            src={src!}
            alt={alt}
            onError={() => setImageError(true)}
            className={cn(
              'w-full h-full',
              'object-cover'
            )}
          />
        )}

        {/* Fallback initials */}
        {showFallback && (
          <div
            className={cn(
              'w-full h-full',
              'flex items-center justify-center',
              'bg-gradient-to-br',
              gradientColor,
              'text-white',
              'font-[var(--weight-semibold)]',
              sizeConfig.text
            )}
          >
            {displayInitials}
          </div>
        )}

        {/* Status indicator */}
        {status && (
          <span
            className={cn(
              'absolute bottom-0 right-0',
              'rounded-full',
              'border-[var(--surface-primary)]',
              statusColors[status],
              sizeConfig.status
            )}
          />
        )}

        {/* Verified badge */}
        {verified && (
          <span
            className={cn(
              'absolute bottom-0 right-0',
              'flex items-center justify-center',
              'rounded-full',
              'bg-[var(--status-info-bg)]',
              'text-white',
              size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
            )}
          >
            <svg
              className={size === 'xs' ? 'w-2 h-2' : 'w-2.5 h-2.5'}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

// ─────────────────────────────────────────────────────────────
// AVATAR GROUP - Stacked avatars
// ─────────────────────────────────────────────────────────────

export interface AvatarGroupProps {
  /** Avatar data array */
  avatars: Array<{
    src?: string | null
    initials?: string
    alt?: string
  }>
  /** Maximum visible avatars */
  max?: number
  /** Size variant */
  size?: AvatarSize
  /** Overlap amount */
  spacing?: 'tight' | 'normal' | 'loose'
  /** Additional classes */
  className?: string
}

const spacingStyles: Record<'tight' | 'normal' | 'loose', string> = {
  tight: '-space-x-3',
  normal: '-space-x-2',
  loose: '-space-x-1',
}

function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
  spacing = 'normal',
  className,
}: AvatarGroupProps) {
  const visible = avatars.slice(0, max)
  const remaining = avatars.length - max

  return (
    <div className={cn('flex items-center', spacingStyles[spacing], className)}>
      {visible.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          initials={avatar.initials}
          alt={avatar.alt}
          size={size}
          className={cn(
            'ring-2 ring-[var(--surface-primary)]',
            'hover:z-10 hover:scale-105',
            'transition-transform duration-[var(--duration-fast)]'
          )}
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'flex items-center justify-center',
            'ring-2 ring-[var(--surface-primary)]',
            'rounded-full',
            'bg-[var(--surface-tertiary)]',
            'text-[var(--text-secondary)]',
            'font-[var(--weight-semibold)]',
            sizeStyles[size].container,
            sizeStyles[size].text
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// AVATAR WITH NAME - Common pattern
// ─────────────────────────────────────────────────────────────

export interface AvatarWithNameProps {
  /** Image source URL */
  src?: string | null
  /** Fallback initials */
  initials?: string
  /** Primary name */
  name: string
  /** Secondary text (subtitle, email, etc.) */
  subtitle?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Status indicator */
  status?: AvatarStatus
  /** Verified badge */
  verified?: boolean
  /** Additional classes */
  className?: string
  /** Click handler */
  onClick?: () => void
}

function AvatarWithName({
  src,
  initials,
  name,
  subtitle,
  size = 'md',
  status,
  verified,
  className,
  onClick,
}: AvatarWithNameProps) {
  const avatarSize: AvatarSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'

  const textSizes = {
    sm: {
      name: 'text-[var(--text-sm)]',
      subtitle: 'text-[var(--text-xs)]',
    },
    md: {
      name: 'text-[var(--text-base)]',
      subtitle: 'text-[var(--text-sm)]',
    },
    lg: {
      name: 'text-[var(--text-lg)]',
      subtitle: 'text-[var(--text-base)]',
    },
  }

  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={cn(
        'flex items-center gap-[var(--space-3)]',
        onClick && cn(
          'rounded-[var(--radius-lg)]',
          'p-[var(--space-2)]',
          '-m-[var(--space-2)]',
          'hover:bg-[var(--surface-hover)]',
          'transition-colors duration-[var(--duration-fast)]'
        ),
        className
      )}
    >
      <Avatar
        src={src}
        initials={initials || name.split(' ').map(n => n[0]).join('')}
        alt={name}
        size={avatarSize}
        status={status}
        verified={verified}
      />
      <div className="flex-1 min-w-0 text-left">
        <p
          className={cn(
            'font-[var(--weight-semibold)]',
            'text-[var(--text-primary)]',
            'truncate',
            textSizes[size].name
          )}
        >
          {name}
        </p>
        {subtitle && (
          <p
            className={cn(
              'text-[var(--text-secondary)]',
              'truncate',
              textSizes[size].subtitle
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </Component>
  )
}

// ─────────────────────────────────────────────────────────────
// AVATAR BUTTON - Clickable avatar with dropdown support
// ─────────────────────────────────────────────────────────────

export interface AvatarButtonProps extends Omit<AvatarProps, 'onClick'> {
  /** Click handler */
  onClick?: () => void
  /** Accessible label */
  'aria-label'?: string
  /** Dropdown expanded state */
  'aria-expanded'?: boolean
}

const AvatarButton = React.forwardRef<HTMLButtonElement, AvatarButtonProps>(
  ({
    onClick,
    'aria-label': ariaLabel = 'Open menu',
    'aria-expanded': ariaExpanded,
    className,
    ...avatarProps
  }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-expanded={ariaExpanded}
        className={cn(
          'rounded-full',
          'focus:outline-none',
          'focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2',
          'hover:opacity-80',
          'transition-opacity duration-[var(--duration-fast)]',
          className
        )}
      >
        <Avatar {...avatarProps} />
      </button>
    )
  }
)
AvatarButton.displayName = "AvatarButton"

export {
  Avatar,
  AvatarGroup,
  AvatarWithName,
  AvatarButton,
}
