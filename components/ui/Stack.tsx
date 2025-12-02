import React from 'react';
import { cn } from '../../lib/utils';

/* ═══════════════════════════════════════════════════════════════
   STACK PRIMITIVE - Phase 9.2 Component Primitives

   Layout component for vertical/horizontal stacking with
   consistent spacing from design tokens.
   ═══════════════════════════════════════════════════════════════ */

export type StackDirection = 'vertical' | 'horizontal' | 'vertical-reverse' | 'horizontal-reverse';
export type StackGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

export interface StackProps {
  /** Stack direction */
  direction?: StackDirection;
  /** Gap between items */
  gap?: StackGap;
  /** Align items (cross axis) */
  align?: StackAlign;
  /** Justify content (main axis) */
  justify?: StackJustify;
  /** Wrap items */
  wrap?: boolean;
  /** Render as different element */
  as?: 'div' | 'section' | 'article' | 'aside' | 'nav' | 'main' | 'header' | 'footer' | 'ul' | 'ol';
  /** Full width */
  fullWidth?: boolean;
  /** Full height */
  fullHeight?: boolean;
  /** Additional class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Children */
  children: React.ReactNode;
}

// Direction to flex-direction mapping
const directionStyles: Record<StackDirection, string> = {
  'vertical': 'flex-col',
  'horizontal': 'flex-row',
  'vertical-reverse': 'flex-col-reverse',
  'horizontal-reverse': 'flex-row-reverse',
};

// Gap sizes using design tokens
const gapStyles: Record<StackGap, string> = {
  'none': 'gap-0',
  'xs': 'gap-[var(--space-1)]',      // 4px
  'sm': 'gap-[var(--space-2)]',      // 8px
  'md': 'gap-[var(--space-4)]',      // 16px
  'lg': 'gap-[var(--space-6)]',      // 24px
  'xl': 'gap-[var(--space-8)]',      // 32px
  '2xl': 'gap-[var(--space-12)]',    // 48px
  '3xl': 'gap-[var(--space-16)]',    // 64px
};

// Align items mapping
const alignStyles: Record<StackAlign, string> = {
  'start': 'items-start',
  'center': 'items-center',
  'end': 'items-end',
  'stretch': 'items-stretch',
  'baseline': 'items-baseline',
};

// Justify content mapping
const justifyStyles: Record<StackJustify, string> = {
  'start': 'justify-start',
  'center': 'justify-center',
  'end': 'justify-end',
  'between': 'justify-between',
  'around': 'justify-around',
  'evenly': 'justify-evenly',
};

export function Stack({
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  as: Component = 'div',
  fullWidth = false,
  fullHeight = false,
  className,
  style,
  children,
}: StackProps) {
  return (
    <Component
      className={cn(
        'flex',
        directionStyles[direction],
        gapStyles[gap],
        alignStyles[align],
        justifyStyles[justify],
        wrap && 'flex-wrap',
        fullWidth && 'w-full',
        fullHeight && 'h-full',
        className
      )}
      style={style}
    >
      {children}
    </Component>
  );
}

// Convenience exports for common patterns

/** Vertical stack with default settings */
export function VStack({
  gap = 'md',
  align = 'stretch',
  ...props
}: Omit<StackProps, 'direction'>) {
  return <Stack direction="vertical" gap={gap} align={align} {...props} />;
}

/** Horizontal stack with default settings */
export function HStack({
  gap = 'md',
  align = 'center',
  ...props
}: Omit<StackProps, 'direction'>) {
  return <Stack direction="horizontal" gap={gap} align={align} {...props} />;
}

/** Centered stack (both axes) */
export function Center({
  children,
  className,
  ...props
}: Omit<StackProps, 'align' | 'justify'>) {
  return (
    <Stack
      align="center"
      justify="center"
      className={className}
      {...props}
    >
      {children}
    </Stack>
  );
}

/** Spacer to push items apart */
export function Spacer({ className }: { className?: string }) {
  return <div className={cn('flex-1', className)} />;
}

/** Divider line within a stack */
export function StackDivider({
  direction = 'horizontal',
  className,
}: {
  direction?: 'horizontal' | 'vertical';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-[var(--border-default)]',
        direction === 'horizontal'
          ? 'h-[1px] w-full'
          : 'w-[1px] h-full self-stretch',
        className
      )}
    />
  );
}

export default Stack;
