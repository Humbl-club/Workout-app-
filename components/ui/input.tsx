import * as React from "react"
import { cn } from "../../lib/utils"

/* ═══════════════════════════════════════════════════════════════
   INPUT PRIMITIVE - Phase 9.2 Component Primitives

   Text input component with variants, sizes, and states.
   Uses design tokens for consistent styling.
   ═══════════════════════════════════════════════════════════════ */

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'filled' | 'flushed';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Size variant */
  size?: InputSize;
  /** Visual variant */
  variant?: InputVariant;
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Icon on the left */
  leftIcon?: React.ReactNode;
  /** Icon/element on the right */
  rightIcon?: React.ReactNode;
  /** Full width */
  fullWidth?: boolean;
}

// Size styles using design tokens
const sizeStyles: Record<InputSize, { input: string; label: string; icon: string }> = {
  sm: {
    input: cn(
      'h-[var(--height-input-sm)]',  // 40px
      'px-[var(--space-3)]',          // 12px
      'text-[var(--text-sm)]'         // 13px
    ),
    label: 'text-[var(--text-2xs)] mb-[var(--space-1)]',
    icon: 'w-4 h-4',
  },
  md: {
    input: cn(
      'h-[var(--height-input)]',      // 50px
      'px-[var(--space-4)]',          // 16px
      'text-[var(--text-base)]'       // 15px
    ),
    label: 'text-[var(--text-xs)] mb-[var(--space-2)]',
    icon: 'w-5 h-5',
  },
  lg: {
    input: cn(
      'h-[var(--height-button-lg)]',  // 56px
      'px-[var(--space-5)]',          // 20px
      'text-[var(--text-md)]'         // 17px
    ),
    label: 'text-[var(--text-sm)] mb-[var(--space-2)]',
    icon: 'w-5 h-5',
  },
};

// Variant styles
const variantStyles: Record<InputVariant, string> = {
  default: cn(
    'bg-[var(--surface-primary)]',
    'border border-[var(--border-default)]',
    'rounded-[var(--radius-lg)]',
    'focus:border-[var(--brand-primary)]',
    'focus:ring-[3px] focus:ring-[var(--brand-primary)]/20'
  ),
  filled: cn(
    'bg-[var(--surface-secondary)]',
    'border border-transparent',
    'rounded-[var(--radius-lg)]',
    'focus:border-[var(--brand-primary)]',
    'focus:bg-[var(--surface-primary)]'
  ),
  flushed: cn(
    'bg-transparent',
    'border-b-2 border-[var(--border-default)]',
    'rounded-none px-0',
    'focus:border-[var(--brand-primary)]'
  ),
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type = 'text',
    size = 'md',
    variant = 'default',
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = true,
    disabled,
    ...props
  }, ref) => {
    const id = React.useId();
    const sizeConfig = sizeStyles[size];

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block font-[var(--weight-semibold)]',
              'uppercase tracking-[var(--tracking-wider)]',
              'text-[var(--text-tertiary)]',
              sizeConfig.label
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div
              className={cn(
                'absolute left-[var(--space-3)] top-1/2 -translate-y-1/2',
                'text-[var(--text-tertiary)]',
                'pointer-events-none',
                sizeConfig.icon
              )}
            >
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            type={type}
            disabled={disabled}
            className={cn(
              // Base styles
              'w-full',
              'font-[var(--weight-medium)]',
              'text-[var(--text-primary)]',
              'placeholder:text-[var(--text-tertiary)]',
              'outline-none',
              // Transitions
              'transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]',
              // Disabled state
              'disabled:opacity-50 disabled:cursor-not-allowed',
              // Size styles
              sizeConfig.input,
              // Variant styles
              variantStyles[variant],
              // Icon padding
              leftIcon && 'pl-[var(--space-10)]',
              rightIcon && 'pr-[var(--space-10)]',
              // Error state
              error && cn(
                'border-[var(--border-error)]',
                'focus:border-[var(--border-error)]',
                'focus:ring-[var(--status-error-bg)]/20'
              ),
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
            {...props}
          />
          {rightIcon && (
            <div
              className={cn(
                'absolute right-[var(--space-3)] top-1/2 -translate-y-1/2',
                'text-[var(--text-tertiary)]',
                sizeConfig.icon
              )}
            >
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${id}-error`}
            className={cn(
              'mt-[var(--space-1-5)]',
              'text-[var(--text-xs)]',
              'text-[var(--status-error-bg)]',
              'font-[var(--weight-medium)]'
            )}
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${id}-helper`}
            className={cn(
              'mt-[var(--space-1-5)]',
              'text-[var(--text-xs)]',
              'text-[var(--text-tertiary)]'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

/* ═══════════════════════════════════════════════════════════════
   NUMERIC INPUT - Specialized input for numbers with +/- buttons
   ═══════════════════════════════════════════════════════════════ */

export interface NumericInputProps extends Omit<InputProps, 'type' | 'value' | 'onChange'> {
  /** Current value */
  value: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Unit label */
  unit?: string;
}

const NumericInput = React.forwardRef<HTMLInputElement, NumericInputProps>(
  ({
    className,
    size = 'md',
    value,
    onChange,
    min = 0,
    max = 999,
    step = 1,
    unit,
    label,
    disabled,
    ...props
  }, ref) => {
    const sizeConfig = sizeStyles[size];

    const handleIncrement = () => {
      const newValue = Math.min(value + step, max);
      onChange(newValue);
    };

    const handleDecrement = () => {
      const newValue = Math.max(value - step, min);
      onChange(newValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      if (!isNaN(newValue)) {
        onChange(Math.min(Math.max(newValue, min), max));
      }
    };

    // Button sizes based on input size
    const buttonSize = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-14 h-14' : 'w-12 h-12';

    return (
      <div className="w-full">
        {label && (
          <label
            className={cn(
              'block font-[var(--weight-semibold)]',
              'uppercase tracking-[var(--tracking-wider)]',
              'text-[var(--text-tertiary)]',
              sizeConfig.label
            )}
          >
            {label}
          </label>
        )}
        <div className="flex items-center gap-[var(--space-2)]">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || value <= min}
            className={cn(
              buttonSize,
              'rounded-[var(--radius-lg)]',
              'bg-[var(--surface-secondary)]',
              'border border-[var(--border-default)]',
              'text-[var(--text-primary)]',
              'font-[var(--weight-bold)]',
              'text-[var(--text-xl)]',
              'hover:bg-[var(--surface-hover)]',
              'active:scale-95',
              'transition-all duration-[var(--duration-fast)]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="Decrease value"
          >
            −
          </button>
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="numeric"
              value={value}
              onChange={handleInputChange}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className={cn(
                'w-full',
                sizeConfig.input,
                'bg-[var(--surface-primary)]',
                'border border-[var(--border-default)]',
                'rounded-[var(--radius-lg)]',
                'text-center',
                'font-[var(--weight-bold)]',
                'text-[var(--text-primary)]',
                'tabular-nums',
                'focus:border-[var(--brand-primary)]',
                'focus:ring-[3px] focus:ring-[var(--brand-primary)]/20',
                'outline-none',
                'transition-all duration-[var(--duration-fast)]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                // Hide number spinners
                '[appearance:textfield]',
                '[&::-webkit-outer-spin-button]:appearance-none',
                '[&::-webkit-inner-spin-button]:appearance-none',
                unit && 'pr-[var(--space-10)]',
                className
              )}
              ref={ref}
              {...props}
            />
            {unit && (
              <span
                className={cn(
                  'absolute right-[var(--space-4)] top-1/2 -translate-y-1/2',
                  'text-[var(--text-sm)]',
                  'font-[var(--weight-semibold)]',
                  'text-[var(--text-secondary)]',
                  'pointer-events-none'
                )}
              >
                {unit}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || value >= max}
            className={cn(
              buttonSize,
              'rounded-[var(--radius-lg)]',
              'bg-[var(--surface-secondary)]',
              'border border-[var(--border-default)]',
              'text-[var(--text-primary)]',
              'font-[var(--weight-bold)]',
              'text-[var(--text-xl)]',
              'hover:bg-[var(--surface-hover)]',
              'active:scale-95',
              'transition-all duration-[var(--duration-fast)]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label="Increase value"
          >
            +
          </button>
        </div>
      </div>
    );
  }
);
NumericInput.displayName = "NumericInput";

/* ═══════════════════════════════════════════════════════════════
   TEXTAREA - Multi-line text input
   ═══════════════════════════════════════════════════════════════ */

export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Size variant */
  size?: InputSize;
  /** Visual variant */
  variant?: InputVariant;
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Full width */
  fullWidth?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    className,
    size = 'md',
    variant = 'default',
    label,
    error,
    helperText,
    fullWidth = true,
    disabled,
    rows = 4,
    ...props
  }, ref) => {
    const id = React.useId();
    const sizeConfig = sizeStyles[size];

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'block font-[var(--weight-semibold)]',
              'uppercase tracking-[var(--tracking-wider)]',
              'text-[var(--text-tertiary)]',
              sizeConfig.label
            )}
          >
            {label}
          </label>
        )}
        <textarea
          id={id}
          rows={rows}
          disabled={disabled}
          className={cn(
            'w-full',
            'px-[var(--space-4)] py-[var(--space-3)]',
            'font-[var(--weight-medium)]',
            'text-[var(--text-primary)]',
            'placeholder:text-[var(--text-tertiary)]',
            'outline-none resize-none',
            'transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // Size-based text
            size === 'sm' ? 'text-[var(--text-sm)]' : size === 'lg' ? 'text-[var(--text-md)]' : 'text-[var(--text-base)]',
            // Variant styles
            variantStyles[variant],
            // Error state
            error && cn(
              'border-[var(--border-error)]',
              'focus:border-[var(--border-error)]',
              'focus:ring-[var(--status-error-bg)]/20'
            ),
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${id}-error`}
            className={cn(
              'mt-[var(--space-1-5)]',
              'text-[var(--text-xs)]',
              'text-[var(--status-error-bg)]',
              'font-[var(--weight-medium)]'
            )}
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${id}-helper`}
            className={cn(
              'mt-[var(--space-1-5)]',
              'text-[var(--text-xs)]',
              'text-[var(--text-tertiary)]'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Input, NumericInput, Textarea };
