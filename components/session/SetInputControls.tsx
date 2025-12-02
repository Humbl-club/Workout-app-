import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { DumbbellIcon, RepeatIcon } from '../icons';
import { LoggedSetSRW } from '../../types';

interface SetInputControlsProps {
  exerciseName: string;
  currentInputData: Partial<LoggedSetSRW>;
  onInputChange: (field: 'weight' | 'reps', value: string) => void;
}

export default function SetInputControls({
  exerciseName,
  currentInputData,
  onInputChange,
}: SetInputControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-[var(--space-3)] mb-[var(--space-3)]">
      <div>
        <label className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wider)] text-[var(--text-tertiary)] mb-[var(--space-2)] flex items-center gap-[var(--space-2)]">
          <DumbbellIcon className="w-3.5 h-3.5" />
          {t('session.weightLabel')}
        </label>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={currentInputData.weight || ''}
            onChange={(e) => onInputChange('weight', e.target.value)}
            className={cn(
              "w-full h-16",
              "px-[var(--space-4)] pr-16",
              "bg-[var(--surface-primary)]",
              "border-2 border-[var(--border-default)]",
              "rounded-[var(--radius-2xl)]",
              "text-[24px] font-[var(--weight-black)] text-[var(--text-primary)]",
              "tabular-nums",
              "focus:border-[var(--brand-primary)]",
              "focus:ring-4 focus:ring-[var(--brand-primary)]/10",
              "focus:bg-gradient-to-br focus:from-[var(--brand-primary-subtle)] focus:to-transparent",
              "focus:outline-none",
              "transition-all duration-[var(--duration-fast)]",
              "placeholder:text-[var(--text-tertiary)]"
            )}
            placeholder="0"
          />
          <span className="absolute right-[var(--space-4)] top-1/2 -translate-y-1/2 text-[18px] font-[var(--weight-bold)] text-[var(--text-primary)]">
            kg
          </span>
        </div>

        {/* Quick adjust buttons */}
        <div className="grid grid-cols-4 gap-[var(--space-2)] mt-[var(--space-2)]">
          {[-5, -2.5, +2.5, +5].map((delta) => (
            <button
              key={delta}
              onClick={() => {
                const current = Number(currentInputData.weight || 0);
                const newWeight = Math.max(0, current + delta);
                onInputChange('weight', newWeight.toString());
              }}
              className={cn(
                "h-10 rounded-[var(--radius-xl)]",
                "font-[var(--weight-bold)] text-[var(--text-sm)]",
                "transition-all duration-[var(--duration-fast)]",
                "active:scale-90",
                "border-2",
                delta < 0
                  ? "bg-[var(--status-error-bg)]/10 border-[var(--status-error-bg)]/20 text-[var(--status-error-bg)] hover:bg-[var(--status-error-bg)]/20"
                  : "bg-[var(--status-success-bg)]/10 border-[var(--status-success-bg)]/20 text-[var(--status-success-bg)] hover:bg-[var(--status-success-bg)]/20"
              )}
            >
              {delta > 0 ? '+' : ''}{delta}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wider)] text-[var(--text-tertiary)] mb-[var(--space-2)] flex items-center gap-[var(--space-2)]">
          <RepeatIcon className="w-3.5 h-3.5" />
          {t('session.repsLabel')}
        </label>
        <input
          type="number"
          inputMode="numeric"
          value={currentInputData.reps || ''}
          onChange={(e) => onInputChange('reps', e.target.value)}
          className={cn(
            "w-full h-16",
            "px-[var(--space-4)]",
            "bg-[var(--surface-primary)]",
            "border-2 border-[var(--border-default)]",
            "rounded-[var(--radius-2xl)]",
            "text-[24px] font-[var(--weight-black)] text-[var(--text-primary)]",
            "tabular-nums",
            "focus:border-[var(--brand-primary)]",
            "focus:ring-4 focus:ring-[var(--brand-primary)]/10",
            "focus:bg-gradient-to-br focus:from-[var(--brand-primary-subtle)] focus:to-transparent",
            "focus:outline-none",
            "transition-all duration-[var(--duration-fast)]",
            "placeholder:text-[var(--text-tertiary)]"
          )}
          placeholder="0"
        />
      </div>
    </div>
  );
}
