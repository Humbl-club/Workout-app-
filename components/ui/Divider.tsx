import React from 'react';
import { cn } from '../../lib/utils';

/* ═══════════════════════════════════════════════════════════════
   DIVIDER PRIMITIVE - Phase 9.2 Component Primitives

   Visual separator for content sections.
   ═══════════════════════════════════════════════════════════════ */

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'default' | 'subtle' | 'strong' | 'brand';
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg';

export interface DividerProps {
  /** Orientation */
  orientation?: DividerOrientation;
  /** Visual variant */
  variant?: DividerVariant;
  /** Spacing around divider */
  spacing?: DividerSpacing;
  /** Optional label in center */
  label?: string;
  /** Additional class names */
  className?: string;
}

// Variant styles
const variantStyles: Record<DividerVariant, string> = {
  default: 'bg-[var(--border-default)]',
  subtle: 'bg-[var(--border-subtle)]',
  strong: 'bg-[var(--border-strong)]',
  brand: 'bg-[var(--brand-primary)]',
};

// Spacing styles for horizontal
const horizontalSpacing: Record<DividerSpacing, string> = {
  none: '',
  sm: 'my-[var(--space-2)]',
  md: 'my-[var(--space-4)]',
  lg: 'my-[var(--space-6)]',
};

// Spacing styles for vertical
const verticalSpacing: Record<DividerSpacing, string> = {
  none: '',
  sm: 'mx-[var(--space-2)]',
  md: 'mx-[var(--space-4)]',
  lg: 'mx-[var(--space-6)]',
};

export function Divider({
  orientation = 'horizontal',
  variant = 'default',
  spacing = 'none',
  label,
  className,
}: DividerProps) {
  // Simple divider without label
  if (!label) {
    return (
      <div
        role="separator"
        aria-orientation={orientation}
        className={cn(
          variantStyles[variant],
          orientation === 'horizontal'
            ? cn('h-[1px] w-full', horizontalSpacing[spacing])
            : cn('w-[1px] h-full self-stretch', verticalSpacing[spacing]),
          className
        )}
      />
    );
  }

  // Divider with label (horizontal only)
  return (
    <div
      role="separator"
      className={cn(
        'flex items-center gap-[var(--space-4)]',
        'w-full',
        horizontalSpacing[spacing],
        className
      )}
    >
      <div className={cn('flex-1 h-[1px]', variantStyles[variant])} />
      <span
        className={cn(
          'text-[var(--text-xs)]',
          'font-[var(--weight-medium)]',
          'text-[var(--text-tertiary)]',
          'uppercase tracking-[var(--tracking-wider)]',
          'px-[var(--space-2)]'
        )}
      >
        {label}
      </span>
      <div className={cn('flex-1 h-[1px]', variantStyles[variant])} />
    </div>
  );
}

// Gradient divider for decorative use
export function GradientDivider({
  className,
  spacing = 'md',
}: {
  className?: string;
  spacing?: DividerSpacing;
}) {
  return (
    <div
      role="separator"
      className={cn(
        'h-[2px] w-full',
        horizontalSpacing[spacing],
        'bg-gradient-to-r',
        'from-transparent via-[var(--brand-primary)] to-transparent',
        'opacity-50',
        className
      )}
    />
  );
}

// Section divider with more visual weight
export function SectionDivider({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'relative py-[var(--space-8)]',
        className
      )}
    >
      <div
        className={cn(
          'absolute left-0 right-0 top-1/2 -translate-y-1/2',
          'h-[1px] bg-[var(--border-default)]'
        )}
      />
      {label && (
        <div className="relative flex justify-center">
          <span
            className={cn(
              'px-[var(--space-4)]',
              'bg-[var(--bg-primary)]',
              'text-[var(--text-xs)]',
              'font-[var(--weight-semibold)]',
              'text-[var(--text-tertiary)]',
              'uppercase tracking-[var(--tracking-wider)]'
            )}
          >
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

export default Divider;
