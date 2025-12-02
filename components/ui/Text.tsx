import React from 'react';
import { cn } from '../../lib/utils';

/* ═══════════════════════════════════════════════════════════════
   TEXT PRIMITIVE - Phase 9.2 Component Primitives

   Typography component that enforces design tokens.
   Use this instead of raw <p>, <span>, <h1> etc. in new code.
   ═══════════════════════════════════════════════════════════════ */

export type TextVariant =
  | 'hero'      // 48px - App name, major headlines
  | 'title-lg'  // 34px - Page titles
  | 'title'     // 28px - Section titles
  | 'title-sm'  // 24px - Card titles
  | 'subtitle'  // 20px - Subtitles
  | 'body-lg'   // 17px - Emphasized body
  | 'body'      // 15px - Default body text
  | 'body-sm'   // 13px - Secondary body
  | 'caption'   // 11px - Captions, timestamps
  | 'label'     // 11px - Form labels, uppercase
  | 'overline'; // 10px - Overline text

export type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy';
export type TextColor = 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse' | 'brand' | 'error' | 'success' | 'warning' | 'on-brand';
export type TextAlign = 'left' | 'center' | 'right';

export interface TextProps {
  /** Typography variant */
  variant?: TextVariant;
  /** Font weight override */
  weight?: TextWeight;
  /** Text color */
  color?: TextColor;
  /** Text alignment */
  align?: TextAlign;
  /** Render as different HTML element */
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'div';
  /** Truncate with ellipsis */
  truncate?: boolean;
  /** Max lines before truncating (requires truncate) */
  maxLines?: number;
  /** Additional class names */
  className?: string;
  /** HTML id */
  id?: string;
  /** For label elements */
  htmlFor?: string;
  /** Children */
  children: React.ReactNode;
}

// Variant to style mapping
const variantStyles: Record<TextVariant, string> = {
  'hero': 'text-[var(--text-hero)] font-[var(--weight-heavy)] leading-[var(--leading-none)] tracking-[var(--tracking-tighter)]',
  'title-lg': 'text-[var(--text-3xl)] font-[var(--weight-bold)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)]',
  'title': 'text-[var(--text-2xl)] font-[var(--weight-bold)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)]',
  'title-sm': 'text-[var(--text-xl)] font-[var(--weight-bold)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)]',
  'subtitle': 'text-[var(--text-lg)] font-[var(--weight-semibold)] leading-[var(--leading-snug)]',
  'body-lg': 'text-[var(--text-md)] font-[var(--weight-regular)] leading-[var(--leading-normal)]',
  'body': 'text-[var(--text-base)] font-[var(--weight-regular)] leading-[var(--leading-normal)]',
  'body-sm': 'text-[var(--text-sm)] font-[var(--weight-regular)] leading-[var(--leading-snug)]',
  'caption': 'text-[var(--text-xs)] font-[var(--weight-regular)] leading-[var(--leading-snug)]',
  'label': 'text-[var(--text-xs)] font-[var(--weight-semibold)] leading-[var(--leading-tight)] uppercase tracking-[var(--tracking-wider)]',
  'overline': 'text-[var(--text-2xs)] font-[var(--weight-semibold)] leading-[var(--leading-tight)] uppercase tracking-[var(--tracking-widest)]',
};

// Weight override styles
const weightStyles: Record<TextWeight, string> = {
  'regular': 'font-[var(--weight-regular)]',
  'medium': 'font-[var(--weight-medium)]',
  'semibold': 'font-[var(--weight-semibold)]',
  'bold': 'font-[var(--weight-bold)]',
  'heavy': 'font-[var(--weight-heavy)]',
};

// Color styles
const colorStyles: Record<TextColor, string> = {
  'primary': 'text-[var(--text-primary)]',
  'secondary': 'text-[var(--text-secondary)]',
  'tertiary': 'text-[var(--text-tertiary)]',
  'disabled': 'text-[var(--text-disabled)]',
  'inverse': 'text-[var(--text-inverse)]',
  'brand': 'text-[var(--brand-primary)]',
  'error': 'text-[var(--status-error-bg)]',
  'success': 'text-[var(--status-success-bg)]',
  'warning': 'text-[var(--status-warning-bg)]',
  'on-brand': 'text-[var(--text-on-brand)]',
};

// Alignment styles
const alignStyles: Record<TextAlign, string> = {
  'left': 'text-left',
  'center': 'text-center',
  'right': 'text-right',
};

// Default HTML element for each variant
const variantElements: Record<TextVariant, TextProps['as']> = {
  'hero': 'h1',
  'title-lg': 'h1',
  'title': 'h2',
  'title-sm': 'h3',
  'subtitle': 'h4',
  'body-lg': 'p',
  'body': 'p',
  'body-sm': 'p',
  'caption': 'span',
  'label': 'label',
  'overline': 'span',
};

export function Text({
  variant = 'body',
  weight,
  color = 'primary',
  align,
  as,
  truncate = false,
  maxLines,
  className,
  id,
  htmlFor,
  children,
}: TextProps) {
  const Component = as || variantElements[variant] || 'span';

  const truncateStyles = truncate
    ? maxLines && maxLines > 1
      ? `overflow-hidden [display:-webkit-box] [-webkit-line-clamp:${maxLines}] [-webkit-box-orient:vertical]`
      : 'truncate'
    : '';

  const combinedClassName = cn(
    variantStyles[variant],
    weight && weightStyles[weight],
    colorStyles[color],
    align && alignStyles[align],
    truncateStyles,
    className
  );

  const props: React.HTMLAttributes<HTMLElement> & { htmlFor?: string } = {
    id,
    className: combinedClassName,
  };

  if (Component === 'label' && htmlFor) {
    props.htmlFor = htmlFor;
  }

  return React.createElement(Component, props, children);
}

// Convenience exports for common use cases
export function Heading({
  level = 1,
  children,
  ...props
}: Omit<TextProps, 'variant'> & { level?: 1 | 2 | 3 | 4 }) {
  const variants: Record<number, TextVariant> = {
    1: 'title-lg',
    2: 'title',
    3: 'title-sm',
    4: 'subtitle',
  };
  const elements: Record<number, TextProps['as']> = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
  };
  return (
    <Text variant={variants[level]} as={elements[level]} {...props}>
      {children}
    </Text>
  );
}

export function Label({ children, ...props }: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="label" color="tertiary" {...props}>
      {children}
    </Text>
  );
}

export function Caption({ children, ...props }: Omit<TextProps, 'variant'>) {
  return (
    <Text variant="caption" color="secondary" {...props}>
      {children}
    </Text>
  );
}

export default Text;
