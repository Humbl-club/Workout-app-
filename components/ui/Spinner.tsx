import React from 'react';
import { cn } from '../../lib/utils';

/* ═══════════════════════════════════════════════════════════════
   SPINNER PRIMITIVE - Phase 9.2 Component Primitives

   Loading indicator with size and color variants.
   ═══════════════════════════════════════════════════════════════ */

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'brand' | 'primary' | 'secondary' | 'white' | 'inherit';

export interface SpinnerProps {
  /** Size variant */
  size?: SpinnerSize;
  /** Color variant */
  color?: SpinnerColor;
  /** Additional class names */
  className?: string;
  /** Accessible label */
  label?: string;
}

// Size styles using design tokens
const sizeStyles: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-[1.5px]',
  md: 'w-5 h-5 border-2',
  lg: 'w-8 h-8 border-2',
  xl: 'w-12 h-12 border-[3px]',
};

// Color styles
const colorStyles: Record<SpinnerColor, string> = {
  brand: 'border-[var(--brand-primary)] border-t-transparent',
  primary: 'border-[var(--text-primary)] border-t-transparent',
  secondary: 'border-[var(--text-secondary)] border-t-transparent',
  white: 'border-white border-t-transparent',
  inherit: 'border-current border-t-transparent',
};

// Background ring colors (subtle version)
const ringColorStyles: Record<SpinnerColor, string> = {
  brand: 'border-[var(--brand-primary)]/20',
  primary: 'border-[var(--text-primary)]/20',
  secondary: 'border-[var(--text-secondary)]/20',
  white: 'border-white/20',
  inherit: 'border-current/20',
};

export function Spinner({
  size = 'md',
  color = 'brand',
  className,
  label = 'Loading...',
}: SpinnerProps) {
  return (
    <span
      className={cn('relative inline-block', sizeStyles[size], className)}
      role="status"
      aria-label={label}
    >
      {/* Background ring */}
      <span
        className={cn(
          'absolute inset-0 rounded-full',
          sizeStyles[size],
          ringColorStyles[color]
        )}
      />
      {/* Spinning ring */}
      <span
        className={cn(
          'absolute inset-0 rounded-full animate-spin',
          sizeStyles[size],
          colorStyles[color]
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

// Full page loading overlay
export function LoadingOverlay({
  label = 'Loading...',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[var(--z-overlay)]',
        'flex items-center justify-center',
        'bg-[var(--bg-overlay)]',
        'backdrop-blur-sm',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-[var(--space-4)]">
        <Spinner size="xl" color="white" />
        <span className="text-[var(--text-base)] text-white font-[var(--weight-medium)]">
          {label}
        </span>
      </div>
    </div>
  );
}

// Inline loading state
export function LoadingInline({
  label = 'Loading...',
  size = 'sm',
  className,
}: {
  label?: string;
  size?: SpinnerSize;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[var(--space-2)]',
        'text-[var(--text-secondary)]',
        className
      )}
      role="status"
    >
      <Spinner size={size} color="secondary" />
      <span className="text-[var(--text-sm)]">{label}</span>
    </span>
  );
}

export default Spinner;
