import React from 'react';
import { cn } from '../../lib/utils';
import { SparklesIcon, TrendingUpIcon, CheckCircleIcon } from '../icons';

interface SmartSuggestionsProps {
  lastWeight: number;
  lastReps: number;
  onRepeatLast: () => void;
  onProgressiveOverload: (weight: number, reps: number) => void;
}

export default function SmartSuggestions({
  lastWeight,
  lastReps,
  onRepeatLast,
  onProgressiveOverload,
}: SmartSuggestionsProps) {
  return (
    <div className={cn(
      "mb-[var(--space-4)]",
      "p-[var(--space-4)]",
      "bg-gradient-to-br from-[var(--brand-primary-subtle)] to-[var(--surface-secondary)]",
      "border-2 border-[var(--brand-primary)]/30",
      "rounded-[var(--radius-2xl)]",
      "shadow-[var(--shadow-sm)]"
    )}>
      <p className="text-[var(--text-xs)] font-[var(--weight-bold)] text-[var(--brand-primary)] mb-[var(--space-3)] flex items-center gap-[var(--space-2)]">
        <SparklesIcon className="w-4 h-4" />
        Smart Suggestions
      </p>

      <div className="grid grid-cols-2 gap-[var(--space-3)]">
        {/* Repeat last */}
        <button
          onClick={onRepeatLast}
          className={cn(
            "p-[var(--space-3)]",
            "bg-[var(--surface-primary)]",
            "border-2 border-[var(--brand-primary)]",
            "rounded-[var(--radius-xl)]",
            "hover:bg-[var(--brand-primary-subtle)]",
            "transition-all duration-[var(--duration-fast)]",
            "active:scale-95",
            "shadow-[var(--shadow-sm)]"
          )}
        >
          <p className="text-[10px] text-[var(--text-tertiary)] font-[var(--weight-bold)] mb-[var(--space-1)]">
            REPEAT LAST
          </p>
          <p className="text-[20px] font-[var(--weight-black)] text-[var(--brand-primary)] tabular-nums">
            {lastWeight} × {lastReps}
          </p>
        </button>

        {/* Progressive overload */}
        <button
          onClick={() => onProgressiveOverload(Number(lastWeight) + 2.5, lastReps)}
          className={cn(
            "p-[var(--space-3)]",
            "bg-gradient-to-br from-[var(--status-success-bg)]/10 to-[var(--status-success-bg)]/5",
            "border-2 border-[var(--status-success-bg)]",
            "rounded-[var(--radius-xl)]",
            "hover:shadow-[var(--shadow-md)]",
            "transition-all duration-[var(--duration-fast)]",
            "active:scale-95"
          )}
        >
          <p className="text-[10px] text-[var(--status-success-bg)] font-[var(--weight-bold)] mb-[var(--space-1)] flex items-center gap-[var(--space-1)]">
            <TrendingUpIcon className="w-3 h-3" />
            PROGRESS
          </p>
          <p className="text-[20px] font-[var(--weight-black)] text-[var(--status-success-bg)] tabular-nums">
            {Number(lastWeight) + 2.5} × {lastReps}
          </p>
        </button>
      </div>
    </div>
  );
}
