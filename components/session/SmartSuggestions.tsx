import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { SparklesIcon, TrendingUpIcon, RepeatIcon, ZapIcon } from '../icons';

/* ═══════════════════════════════════════════════════════════════
   SMART SUGGESTIONS - Progressive Overload Helper

   Shows quick-action buttons based on last performance:
   - Set 1: "Use Last Week's Weight" + "Progress (+2.5kg)"
   - Set 2+: "Repeat Last Set" + "Progress (+2.5kg)"
   ═══════════════════════════════════════════════════════════════ */

interface SmartSuggestionsProps {
  lastWeight: number;
  lastReps: number;
  currentRound?: number;
  onRepeatLast: () => void;
  onProgressiveOverload: (weight: number, reps: number) => void;
}

export default function SmartSuggestions({
  lastWeight,
  lastReps,
  currentRound = 1,
  onRepeatLast,
  onProgressiveOverload,
}: SmartSuggestionsProps) {
  const { t } = useTranslation();
  const isFirstSet = currentRound === 1;

  // Calculate progressive overload weight
  // Add 2.5kg for weights under 50kg, 5kg for heavier weights
  const progressWeight = lastWeight < 50 ? lastWeight + 2.5 : lastWeight + 5;

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
        {isFirstSet ? t('session.lastWeekPerformance', 'Last Week') : t('session.smartSuggestions', 'Quick Fill')}
      </p>

      <div className="grid grid-cols-2 gap-[var(--space-3)]">
        {/* Repeat/Use last */}
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
          <p className="text-[10px] text-[var(--text-tertiary)] font-[var(--weight-bold)] mb-[var(--space-1)] flex items-center gap-[var(--space-1)]">
            {isFirstSet ? (
              <>
                <ZapIcon className="w-3 h-3" />
                {t('session.matchLast', 'MATCH LAST')}
              </>
            ) : (
              <>
                <RepeatIcon className="w-3 h-3" />
                {t('session.repeatSet', 'REPEAT')}
              </>
            )}
          </p>
          <p className="text-[20px] font-[var(--weight-black)] text-[var(--brand-primary)] tabular-nums">
            {lastWeight}<span className="text-[14px] text-[var(--text-tertiary)]">kg</span> × {lastReps}
          </p>
        </button>

        {/* Progressive overload */}
        <button
          onClick={() => onProgressiveOverload(progressWeight, lastReps)}
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
            {t('session.progress', 'PROGRESS')}
          </p>
          <p className="text-[20px] font-[var(--weight-black)] text-[var(--status-success-bg)] tabular-nums">
            {progressWeight}<span className="text-[14px] opacity-70">kg</span> × {lastReps}
          </p>
        </button>
      </div>

      {/* Hint text */}
      {isFirstSet && (
        <p className="text-[11px] text-[var(--text-tertiary)] mt-[var(--space-3)] text-center">
          {t('session.progressionHint', 'Tap to auto-fill • Add weight for progressive overload')}
        </p>
      )}
    </div>
  );
}
