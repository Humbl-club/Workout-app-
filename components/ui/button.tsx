import * as React from "react"
import { cn } from "../../lib/utils"
import { useHaptic } from "../../hooks/useAnimations"

/* ═══════════════════════════════════════════════════════════════
   BUTTON PRIMITIVE - Phase 9.2 Component Primitives

   Primary interactive element using design tokens.
   Supports variants, sizes, loading state, and icons.
   ═══════════════════════════════════════════════════════════════ */

export type ButtonVariant =
  | 'primary'     // Brand coral, main CTA
  | 'secondary'   // Surface color, bordered
  | 'ghost'       // Transparent, text only
  | 'outline'     // Border only
  | 'destructive' // Error/danger actions
  | 'soft'        // Subtle brand tint
  | 'link'        // Inline link style
  | 'premium';    // High-contrast brutalist style

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size variant */
  size?: ButtonSize;
  /** Show loading spinner */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon on the left */
  leftIcon?: React.ReactNode;
  /** Icon on the right */
  rightIcon?: React.ReactNode;
  /** Render as child component (for link wrapping) */
  asChild?: boolean;
}

// Spinner component for loading state
function Spinner({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="absolute inset-0 rounded-full border-2 border-current opacity-20" />
      <span className="absolute inset-0 rounded-full border-2 border-current border-t-transparent animate-spin" />
    </span>
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    asChild = false,
    children,
    disabled,
    onClick,
    ...props
  }, ref) => {
    const haptic = useHaptic();

    // Handle click with haptic feedback
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading) {
        // Different haptic intensity based on variant
        if (variant === 'destructive') {
          haptic.error();
        } else if (variant === 'primary' || variant === 'premium') {
          haptic.medium();
        } else {
          haptic.light();
        }

        onClick?.(e);
      }
    };

    // Base styles using design tokens
    const baseStyles = cn(
      // Layout
      "inline-flex items-center justify-center",
      // Typography
      "font-[var(--weight-semibold)]",
      // Border radius - rounded for default, full for pills
      "rounded-[var(--radius-xl)]",
      // Transitions
      "transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]",
      // Focus state
      "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--brand-primary)]/40",
      // Disabled state
      "disabled:pointer-events-none disabled:opacity-50",
      // Press effect
      "active:scale-[0.97]",
      // Touch target
      "min-h-[var(--height-touch-min)]"
    );

    // Variant styles
    const variantStyles: Record<ButtonVariant, string> = {
      primary: cn(
        "bg-[var(--brand-primary)] text-[var(--text-on-brand)]",
        "hover:bg-[var(--brand-primary-hover)]",
        "active:bg-[var(--brand-primary-active)]",
        "shadow-[var(--shadow-sm)]",
        "hover:shadow-[var(--shadow-md)]"
      ),
      secondary: cn(
        "bg-[var(--surface-secondary)] text-[var(--text-primary)]",
        "border border-[var(--border-default)]",
        "hover:bg-[var(--surface-hover)]",
        "hover:border-[var(--border-strong)]",
        "active:bg-[var(--surface-active)]"
      ),
      ghost: cn(
        "bg-transparent text-[var(--text-primary)]",
        "hover:bg-[var(--interactive-hover)]",
        "active:bg-[var(--interactive-active)]"
      ),
      outline: cn(
        "bg-transparent text-[var(--text-primary)]",
        "border-2 border-[var(--border-strong)]",
        "hover:border-[var(--brand-primary)]",
        "hover:text-[var(--brand-primary)]",
        "active:bg-[var(--brand-primary-subtle)]"
      ),
      destructive: cn(
        "bg-[var(--status-error-bg)] text-[var(--status-error-text)]",
        "hover:brightness-110",
        "active:brightness-95",
        "shadow-[var(--shadow-sm)]"
      ),
      soft: cn(
        "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]",
        "hover:bg-[var(--brand-primary)]/20",
        "active:bg-[var(--brand-primary)]/25"
      ),
      link: cn(
        "bg-transparent text-[var(--brand-primary)]",
        "hover:underline",
        "p-0 h-auto min-h-0",
        "active:opacity-80"
      ),
      premium: cn(
        "bg-[var(--surface-primary)] text-[var(--text-primary)]",
        "border-2 border-[var(--border-strong)]",
        "hover:border-[var(--brand-primary)]",
        "hover:bg-[var(--surface-hover)]",
        "active:bg-[var(--brand-primary)]",
        "active:text-[var(--text-on-brand)]",
        "font-[var(--weight-bold)]",
        "uppercase tracking-[0.05em] text-[13px]",
        "rounded-[4px]"
      ),
    };

    // Size styles using design tokens
    const sizeStyles: Record<ButtonSize, string> = {
      sm: cn(
        "h-[var(--height-button-sm)]",     // 40px
        "px-[var(--space-4)]",              // 16px
        "text-[var(--text-sm)]",            // 13px
        "gap-[var(--space-1-5)]"            // 6px
      ),
      md: cn(
        "h-[var(--height-button)]",         // 50px
        "px-[var(--space-5)]",              // 20px
        "text-[var(--text-base)]",          // 15px
        "gap-[var(--space-2)]"              // 8px
      ),
      lg: cn(
        "h-[var(--height-button-lg)]",      // 56px
        "px-[var(--space-6)]",              // 24px
        "text-[var(--text-md)]",            // 17px
        "gap-[var(--space-2-5)]"            // 10px
      ),
      icon: cn(
        "h-[var(--height-button)]",         // 50px
        "w-[var(--height-button)]",         // 50px
        "p-0"
      ),
      'icon-sm': cn(
        "h-[var(--height-button-sm)]",      // 40px
        "w-[var(--height-button-sm)]",      // 40px
        "p-0"
      ),
      'icon-lg': cn(
        "h-[var(--height-button-lg)]",      // 56px
        "w-[var(--height-button-lg)]",      // 56px
        "p-0"
      ),
    };

    // Determine if this is an icon-only button
    const isIconOnly = size === 'icon' || size === 'icon-sm' || size === 'icon-lg';

    // Icon sizes based on button size
    const iconSizeClass = size === 'sm' || size === 'icon-sm'
      ? 'w-4 h-4'
      : size === 'lg' || size === 'icon-lg'
        ? 'w-6 h-6'
        : 'w-5 h-5';

    // Spinner sizes
    const spinnerSize = size === 'sm' || size === 'icon-sm'
      ? 'w-4 h-4'
      : 'w-5 h-5';

    // Build content
    const content = loading ? (
      <>
        <Spinner className={spinnerSize} />
        {!isIconOnly && <span className="opacity-80">Loading...</span>}
      </>
    ) : (
      <>
        {leftIcon && <span className={iconSizeClass}>{leftIcon}</span>}
        {children}
        {rightIcon && <span className={iconSizeClass}>{rightIcon}</span>}
      </>
    );

    return (
      <button
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          loading && "cursor-wait",
          className
        )}
        ref={ref}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };

// Legacy variant mapping for backwards compatibility
export const buttonVariants = {
  default: 'primary',
  accent: 'primary',
  ghost: 'ghost',
  outline: 'outline',
  soft: 'soft',
  secondary: 'secondary',
} as const;
