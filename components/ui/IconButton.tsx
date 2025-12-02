import * as React from "react"
import { cn } from "../../lib/utils"

/* ═══════════════════════════════════════════════════════════════
   ICON BUTTON PRIMITIVE - Phase 9.2 Component Primitives

   Circular button for icon-only actions.
   Automatically sizes icon and maintains touch target.
   ═══════════════════════════════════════════════════════════════ */

export type IconButtonVariant =
  | 'primary'     // Brand coral
  | 'secondary'   // Surface with border
  | 'ghost'       // Transparent
  | 'outline'     // Border only
  | 'destructive' // Error/danger
  | 'soft';       // Subtle brand tint

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: IconButtonVariant;
  /** Size variant */
  size?: IconButtonSize;
  /** Icon element */
  icon: React.ReactNode;
  /** Show loading spinner */
  loading?: boolean;
  /** Accessible label (required for icon-only buttons) */
  'aria-label': string;
}

// Spinner component
function Spinner({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span className="absolute inset-0 rounded-full border-2 border-current opacity-20" />
      <span className="absolute inset-0 rounded-full border-2 border-current border-t-transparent animate-spin" />
    </span>
  );
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    className,
    variant = "ghost",
    size = "md",
    icon,
    loading = false,
    disabled,
    ...props
  }, ref) => {

    // Base styles
    const baseStyles = cn(
      // Layout
      "inline-flex items-center justify-center",
      // Shape - perfect circle
      "rounded-full",
      // Transitions
      "transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]",
      // Focus state
      "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--brand-primary)]/40",
      // Disabled state
      "disabled:pointer-events-none disabled:opacity-50",
      // Press effect
      "active:scale-[0.92]",
      // Touch target
      "touch-action-manipulation"
    );

    // Variant styles
    const variantStyles: Record<IconButtonVariant, string> = {
      primary: cn(
        "bg-[var(--brand-primary)] text-[var(--text-on-brand)]",
        "hover:bg-[var(--brand-primary-hover)]",
        "active:bg-[var(--brand-primary-active)]",
        "shadow-[var(--shadow-sm)]"
      ),
      secondary: cn(
        "bg-[var(--surface-secondary)] text-[var(--text-primary)]",
        "border border-[var(--border-default)]",
        "hover:bg-[var(--surface-hover)]",
        "hover:border-[var(--border-strong)]"
      ),
      ghost: cn(
        "bg-transparent text-[var(--text-secondary)]",
        "hover:bg-[var(--interactive-hover)]",
        "hover:text-[var(--text-primary)]",
        "active:bg-[var(--interactive-active)]"
      ),
      outline: cn(
        "bg-transparent text-[var(--text-primary)]",
        "border-2 border-[var(--border-strong)]",
        "hover:border-[var(--brand-primary)]",
        "hover:text-[var(--brand-primary)]"
      ),
      destructive: cn(
        "bg-transparent text-[var(--status-error-bg)]",
        "hover:bg-[var(--status-error-subtle)]"
      ),
      soft: cn(
        "bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]",
        "hover:bg-[var(--brand-primary)]/20"
      ),
    };

    // Size styles - using design tokens for consistent sizing
    const sizeStyles: Record<IconButtonSize, string> = {
      sm: "h-[var(--height-button-sm)] w-[var(--height-button-sm)]", // 40px
      md: "h-[var(--height-button)] w-[var(--height-button)]",        // 50px
      lg: "h-[var(--height-button-lg)] w-[var(--height-button-lg)]",  // 56px
    };

    // Icon sizes
    const iconSizes: Record<IconButtonSize, string> = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <button
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          loading && "cursor-wait",
          className
        )}
        ref={ref}
        aria-busy={loading}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Spinner className={iconSizes[size]} />
        ) : (
          <span className={cn("flex items-center justify-center", iconSizes[size])}>
            {icon}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton };
export default IconButton;
