import * as React from 'react';
import { cn } from '../../lib/utils';
import { useHaptic } from '../../hooks/useAnimations';

/* ═══════════════════════════════════════════════════════════════
   NUMBER PAD - Custom numeric input for workout tracking

   Optimized for weight/reps entry during active workouts.
   Large touch targets, haptic feedback, quick increment buttons.
   ═══════════════════════════════════════════════════════════════ */

export interface NumberPadProps {
  /** Current value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Callback when user confirms (taps "Done") */
  onConfirm?: () => void;
  /** Label for the input */
  label?: string;
  /** Unit displayed next to value (kg, reps, etc.) */
  unit?: string;
  /** Allow decimal input */
  allowDecimal?: boolean;
  /** Quick increment values (default: [2.5, 5] for weight) */
  quickIncrements?: number[];
  /** Maximum value allowed */
  max?: number;
  /** Minimum value allowed */
  min?: number;
}

export function NumberPad({
  value,
  onChange,
  onConfirm,
  label,
  unit = '',
  allowDecimal = true,
  quickIncrements = [2.5, 5],
  max,
  min = 0,
}: NumberPadProps) {
  const haptic = useHaptic();

  const handleNumberPress = (num: string) => {
    haptic.light();

    // Prevent multiple decimals
    if (num === '.' && value.includes('.')) return;

    // Prevent leading zeros (except for "0.")
    if (value === '0' && num !== '.') {
      onChange(num);
      return;
    }

    const newValue = value + num;
    const numValue = parseFloat(newValue);

    // Check max constraint
    if (max !== undefined && numValue > max) return;

    onChange(newValue);
  };

  const handleBackspace = () => {
    haptic.light();
    if (value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    haptic.light();
    onChange('0');
  };

  const handleQuickIncrement = (amount: number) => {
    haptic.medium();
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.max(min, currentValue + amount);

    // Check max constraint
    if (max !== undefined && newValue > max) return;

    onChange(newValue.toString());
  };

  const handleConfirm = () => {
    haptic.success();
    onConfirm?.();
  };

  // Number button component
  const NumberButton = ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-14 flex items-center justify-center',
        'bg-[var(--surface-secondary)]',
        'border border-[var(--border-default)]',
        'rounded-[var(--radius-lg)]',
        'text-[var(--text-xl)]',
        'font-[var(--weight-semibold)]',
        'text-[var(--text-primary)]',
        'active:scale-95 active:bg-[var(--surface-active)]',
        'transition-all duration-[var(--duration-fast)]',
        'touch-none select-none'
      )}
    >
      {children}
    </button>
  );

  // Action button component (clear, backspace, done)
  const ActionButton = ({
    children,
    onClick,
    variant = 'secondary'
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: 'secondary' | 'primary'
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-14 flex items-center justify-center',
        'rounded-[var(--radius-lg)]',
        'text-[var(--text-sm)]',
        'font-[var(--weight-bold)]',
        'uppercase tracking-wider',
        'active:scale-95',
        'transition-all duration-[var(--duration-fast)]',
        'touch-none select-none',
        variant === 'primary' && [
          'bg-[var(--brand-primary)]',
          'text-[var(--text-on-brand)]',
          'shadow-[var(--shadow-md)]',
        ],
        variant === 'secondary' && [
          'bg-[var(--surface-secondary)]',
          'border border-[var(--border-default)]',
          'text-[var(--text-secondary)]',
        ]
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col gap-[var(--space-4)] p-[var(--space-4)] bg-[var(--surface-primary)] rounded-t-[var(--radius-2xl)] shadow-[var(--shadow-xl)]">
      {/* Display */}
      <div className="text-center pb-[var(--space-2)]">
        {label && (
          <p className="text-[var(--text-xs)] text-[var(--text-tertiary)] uppercase tracking-wider mb-[var(--space-2)]">
            {label}
          </p>
        )}
        <div className="flex items-baseline justify-center gap-[var(--space-2)]">
          <span className="text-4xl font-[var(--weight-bold)] text-[var(--text-primary)] tabular-nums">
            {value || '0'}
          </span>
          {unit && (
            <span className="text-[var(--text-md)] text-[var(--text-secondary)]">
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Quick Increments */}
      {quickIncrements.length > 0 && (
        <div className="grid grid-cols-4 gap-[var(--space-2)]">
          {quickIncrements.map((inc) => (
            <button
              key={inc}
              type="button"
              onClick={() => handleQuickIncrement(inc)}
              className={cn(
                'h-10 flex items-center justify-center gap-1',
                'bg-[var(--brand-primary-subtle)]',
                'text-[var(--brand-primary)]',
                'rounded-[var(--radius-lg)]',
                'text-[var(--text-sm)]',
                'font-[var(--weight-semibold)]',
                'active:scale-95',
                'transition-all duration-[var(--duration-fast)]',
                'touch-none select-none'
              )}
            >
              <span>+{inc}</span>
            </button>
          ))}
          {quickIncrements.map((inc) => (
            <button
              key={-inc}
              type="button"
              onClick={() => handleQuickIncrement(-inc)}
              className={cn(
                'h-10 flex items-center justify-center gap-1',
                'bg-[var(--surface-secondary)]',
                'border border-[var(--border-default)]',
                'text-[var(--text-secondary)]',
                'rounded-[var(--radius-lg)]',
                'text-[var(--text-sm)]',
                'font-[var(--weight-semibold)]',
                'active:scale-95',
                'transition-all duration-[var(--duration-fast)]',
                'touch-none select-none'
              )}
            >
              <span>−{inc}</span>
            </button>
          ))}
        </div>
      )}

      {/* Number Pad Grid */}
      <div className="grid grid-cols-3 gap-[var(--space-2)]">
        <NumberButton onClick={() => handleNumberPress('1')}>1</NumberButton>
        <NumberButton onClick={() => handleNumberPress('2')}>2</NumberButton>
        <NumberButton onClick={() => handleNumberPress('3')}>3</NumberButton>

        <NumberButton onClick={() => handleNumberPress('4')}>4</NumberButton>
        <NumberButton onClick={() => handleNumberPress('5')}>5</NumberButton>
        <NumberButton onClick={() => handleNumberPress('6')}>6</NumberButton>

        <NumberButton onClick={() => handleNumberPress('7')}>7</NumberButton>
        <NumberButton onClick={() => handleNumberPress('8')}>8</NumberButton>
        <NumberButton onClick={() => handleNumberPress('9')}>9</NumberButton>

        {allowDecimal ? (
          <NumberButton onClick={() => handleNumberPress('.')}>.</NumberButton>
        ) : (
          <div /> // Empty cell
        )}
        <NumberButton onClick={() => handleNumberPress('0')}>0</NumberButton>
        <ActionButton onClick={handleBackspace}>⌫</ActionButton>
      </div>

      {/* Bottom Actions */}
      <div className="grid grid-cols-2 gap-[var(--space-2)] pt-[var(--space-2)]">
        <ActionButton onClick={handleClear} variant="secondary">
          Clear
        </ActionButton>
        <ActionButton onClick={handleConfirm} variant="primary">
          Done
        </ActionButton>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BOTTOM SHEET NUMBER PAD - Modal wrapper for number pad
   ═══════════════════════════════════════════════════════════════ */

export interface BottomSheetNumberPadProps extends NumberPadProps {
  /** Whether the number pad is visible */
  isOpen: boolean;
  /** Callback when user closes the pad */
  onClose: () => void;
}

export function BottomSheetNumberPad({
  isOpen,
  onClose,
  ...numberPadProps
}: BottomSheetNumberPadProps) {
  const handleConfirm = () => {
    numberPadProps.onConfirm?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40',
          'animate-fade-in'
        )}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'animate-slide-in-up',
          'pb-[env(safe-area-inset-bottom)]'
        )}
      >
        <NumberPad
          {...numberPadProps}
          onConfirm={handleConfirm}
        />
      </div>
    </>
  );
}
