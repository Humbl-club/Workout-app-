import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "accent" | "ghost" | "outline" | "soft" | "secondary";
  size?: "default" | "sm" | "icon";
  loading?: boolean;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading = false, asChild = false, children, ...props }, ref) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center rounded-full font-semibold",
      "transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      "focus-visible:ring-[var(--primary)] focus-visible:ring-offset-[var(--background-primary)]",
      "disabled:pointer-events-none disabled:opacity-50",
      "active:scale-[0.97]",
      "relative overflow-hidden"
    )

    const variants = {
      default: cn(
        "bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)]",
        "text-white font-semibold shadow-md hover:shadow-lg",
        "hover:bg-[var(--primary-hover)]",
        "transition-all duration-300",
        // Subtle ripple effect
        "before:absolute before:inset-0 before:bg-white/20",
        "before:translate-y-full before:transition-transform before:duration-300",
        "hover:before:translate-y-0",
        // Subtle glow
        "hover:drop-shadow-[0_0_15px_rgba(99,102,241,0.4)]"
      ),
      accent: cn(
        "bg-gradient-to-br from-[var(--accent)] via-[var(--accent-hover)] to-[var(--accent-dark)]",
        "text-white font-bold shadow-lg hover:shadow-xl",
        "hover:scale-[1.03]",
        "transition-all duration-300",
        // Animated shimmer effect
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent",
        "before:-translate-x-full before:transition-transform before:duration-700",
        "hover:before:translate-x-full",
        // Glow effect
        "hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]"
      ),
      secondary: cn(
        "bg-[var(--surface-secondary)] text-[var(--text-primary)]",
        "hover:bg-[var(--surface-hover)]",
        "border border-[var(--border)]",
        "hover:border-[var(--border-strong)]"
      ),
      soft: cn(
        "bg-[var(--accent-light)] text-[var(--accent)]",
        "hover:bg-[var(--primary-light)] hover:text-[var(--primary)]",
        "font-semibold border border-transparent",
        "hover:border-[var(--primary)]/20"
      ),
      ghost: cn(
        "text-[var(--text-primary)]",
        "hover:bg-[var(--surface-secondary)]",
        "active:bg-[var(--surface-hover)]",
        "border border-transparent",
        "hover:border-[var(--border)]"
      ),
      outline: cn(
        "border-2 border-[var(--border-strong)]",
        "bg-transparent text-[var(--text-primary)]",
        "hover:border-[var(--primary)] hover:bg-[var(--background-secondary)]"
      )
    }

    const sizes = {
      default: "h-12 px-5 text-[15px] gap-2",
      sm: "h-10 px-4 text-[13px] gap-1.5",
      icon: "h-12 w-12"
    }

    const content = loading ? (
      <span className="flex items-center gap-2">
        <span className="relative w-4 h-4">
          <span className="absolute inset-0 rounded-full border-2 border-current opacity-20" />
          <span className="absolute inset-0 rounded-full border-2 border-current border-t-transparent animate-spin" />
        </span>
        <span className="opacity-80">Loading...</span>
      </span>
    ) : children;

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          loading && "opacity-75 cursor-wait",
          className
        )}
        ref={ref}
        aria-busy={loading}
        disabled={loading || props.disabled}
        {...props}
      >
        {content}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
