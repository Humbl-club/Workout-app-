import * as React from "react"
import { cn } from "../../lib/utils"

/* ═══════════════════════════════════════════════════════════════
   CARD PRIMITIVE - Phase 9.2 Component Primitives

   Container component for grouping related content.
   Multiple variants for different use cases.
   Maintains backwards compatibility with existing components.
   ═══════════════════════════════════════════════════════════════ */

export type CardVariant =
  | 'default'     // Standard bordered card
  | 'solid'       // Legacy solid variant (maps to default)
  | 'soft'        // Legacy soft variant (maps to ghost)
  | 'elevated'    // With shadow
  | 'ghost'       // No border, subtle background
  | 'outline'     // Border only, transparent bg
  | 'filled'      // Solid background
  | 'glass'       // Glassmorphism effect
  | 'interactive' // Hover effects
  | 'premium';    // Special glow effects

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: CardVariant;
  /** Padding size */
  padding?: CardPadding;
  /** Border radius size */
  radius?: CardRadius;
  /** Full width */
  fullWidth?: boolean;
  /** Press effect on click */
  pressable?: boolean;
  /** Active state (for selection) */
  active?: boolean;
  /** Legacy asChild support */
  asChild?: boolean;
}

// Map legacy variants to new variants
const variantMap: Record<string, CardVariant> = {
  solid: 'default',
  soft: 'ghost',
};

// Variant styles
const variantStyles: Record<CardVariant, string> = {
  default: cn(
    'bg-[var(--surface-primary)]',
    'border border-[var(--border-default)]',
    'shadow-[var(--shadow-sm)]'
  ),
  solid: cn(
    'bg-[var(--surface-primary)]',
    'border border-[var(--border-default)]',
    'shadow-[var(--shadow-md)]'
  ),
  soft: cn(
    'bg-[var(--surface-secondary)]',
    'border border-[var(--border-subtle)]',
    'shadow-[var(--shadow-sm)]'
  ),
  elevated: cn(
    'bg-[var(--surface-primary)]',
    'border border-[var(--border-subtle)]',
    'shadow-[var(--shadow-lg)]'
  ),
  ghost: cn(
    'bg-[var(--surface-secondary)]',
    'border border-transparent'
  ),
  outline: cn(
    'bg-transparent',
    'border border-[var(--border-default)]'
  ),
  filled: cn(
    'bg-[var(--surface-secondary)]',
    'border border-transparent'
  ),
  glass: cn(
    'bg-[var(--bg-overlay-light)]',
    'backdrop-blur-[16px]',
    'border border-[var(--border-subtle)]',
    'shadow-[var(--shadow-md)]'
  ),
  interactive: cn(
    'bg-[var(--surface-primary)]',
    'border border-[var(--border-default)]',
    'transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]',
    'hover:border-[var(--border-strong)]',
    'hover:shadow-[var(--shadow-md)]',
    'hover:-translate-y-[2px]',
    'cursor-pointer'
  ),
  premium: cn(
    'bg-[var(--surface-primary)]',
    'border-2 border-[var(--border-strong)]',
    'transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]',
    'hover:border-[var(--brand-primary)]'
  ),
};

// Padding styles
const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-[var(--space-3)]',
  md: 'p-[var(--space-4)]',
  lg: 'p-[var(--space-6)]',
};

// Radius styles
const radiusStyles: Record<CardRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-[var(--radius-sm)]',
  md: 'rounded-[var(--radius-md)]',
  lg: 'rounded-[var(--radius-lg)]',
  xl: 'rounded-[var(--radius-xl)]',
  '2xl': 'rounded-[var(--radius-2xl)]',
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    padding,
    radius = 'xl',
    fullWidth = false,
    pressable = false,
    active = false,
    asChild = false,
    children,
    ...props
  }, ref) => {
    // Map legacy variants
    const resolvedVariant = variantMap[variant] || variant;
    const isInteractive = !!props.onClick || pressable;

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'relative',
          'overflow-hidden',
          'text-[var(--text-primary)]',
          // Variant
          variantStyles[resolvedVariant],
          // Padding (only if specified, preserves legacy behavior)
          padding && paddingStyles[padding],
          // Radius
          radiusStyles[radius],
          // Width
          fullWidth && 'w-full',
          // Active state
          active && cn(
            'border-[var(--brand-primary)]',
            'bg-[var(--brand-primary-subtle)]'
          ),
          // Press effect
          (pressable || isInteractive) && cn(
            'active:scale-[0.98]',
            'transition-transform duration-[var(--duration-instant)]',
            'cursor-pointer'
          ),
          // Focus for interactive
          isInteractive && 'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--brand-primary)]/40',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

/* ═══════════════════════════════════════════════════════════════
   CARD HEADER - Maintains shadcn/ui API compatibility
   ═══════════════════════════════════════════════════════════════ */

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex flex-col gap-[var(--space-1-5)]',
      'p-[var(--space-6)]',
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/* ═══════════════════════════════════════════════════════════════
   CARD TITLE
   ═══════════════════════════════════════════════════════════════ */

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-[var(--text-xl)]',
      'font-[var(--weight-semibold)]',
      'leading-[var(--leading-tight)]',
      'tracking-[var(--tracking-tight)]',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/* ═══════════════════════════════════════════════════════════════
   CARD DESCRIPTION
   ═══════════════════════════════════════════════════════════════ */

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-[var(--text-sm)]',
      'text-[var(--text-secondary)]',
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/* ═══════════════════════════════════════════════════════════════
   CARD CONTENT
   ═══════════════════════════════════════════════════════════════ */

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'p-[var(--space-6)]',
      'pt-0',
      className
    )}
    {...props}
  />
));
CardContent.displayName = "CardContent";

/* ═══════════════════════════════════════════════════════════════
   CARD FOOTER
   ═══════════════════════════════════════════════════════════════ */

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center',
      'p-[var(--space-6)]',
      'pt-0',
      className
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/* ═══════════════════════════════════════════════════════════════
   STAT CARD - For displaying metrics
   ═══════════════════════════════════════════════════════════════ */

export interface StatCardProps extends Omit<CardProps, 'children'> {
  /** Main value */
  value: string | number;
  /** Label text */
  label: string;
  /** Icon element */
  icon?: React.ReactNode;
  /** Change indicator (positive/negative) */
  change?: {
    value: string | number;
    positive?: boolean;
  };
  /** Accent color */
  accentColor?: string;
}

function StatCard({
  value,
  label,
  icon,
  change,
  accentColor,
  variant = 'default',
  padding = 'md',
  ...cardProps
}: StatCardProps) {
  return (
    <Card variant={variant} padding={padding} {...cardProps}>
      <div className="flex items-start justify-between">
        <div>
          <p
            className={cn(
              'text-[var(--text-xs)]',
              'font-[var(--weight-semibold)]',
              'text-[var(--text-tertiary)]',
              'uppercase tracking-[var(--tracking-wider)]',
              'mb-[var(--space-2)]'
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              'text-[var(--text-2xl)]',
              'font-[var(--weight-bold)]',
              'text-[var(--text-primary)]',
              'tabular-nums'
            )}
            style={accentColor ? { color: accentColor } : undefined}
          >
            {value}
          </p>
          {change && (
            <p
              className={cn(
                'mt-[var(--space-1)]',
                'text-[var(--text-sm)]',
                'font-[var(--weight-medium)]',
                change.positive ? 'text-[var(--status-success-bg)]' : 'text-[var(--status-error-bg)]'
              )}
            >
              {change.positive ? '↑' : '↓'} {change.value}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'w-10 h-10',
              'rounded-[var(--radius-lg)]',
              'bg-[var(--surface-secondary)]',
              'flex items-center justify-center',
              'text-[var(--text-secondary)]'
            )}
            style={accentColor ? { backgroundColor: `${accentColor}20`, color: accentColor } : undefined}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
};
