import React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';
import { XMarkIcon } from '../icons';
import { AmrapBlock } from '../../types';
import { Button } from '../ui/button';

interface AmrapScreenProps {
  amrapBlock: AmrapBlock;
  currentBlockIndex: number;
  onCancel: () => void;
  onComplete: () => void;
}

export default function AmrapScreen({
  amrapBlock,
  currentBlockIndex,
  onCancel,
  onComplete,
}: AmrapScreenProps) {
  const { t } = useTranslation();

  return (
    <div className={cn(
      "min-h-screen w-full max-w-lg mx-auto flex flex-col",
      "bg-[var(--bg-primary)]",
      "px-[var(--space-4)] pt-[var(--space-4)]",
      "pb-[calc(var(--space-4)+env(safe-area-inset-bottom))]"
    )}>
      <div className="flex items-center justify-between mb-[var(--space-4)]">
        <button
          onClick={onCancel}
          className={cn(
            "p-[var(--space-1)]",
            "min-w-[var(--height-touch-min)] min-h-[var(--height-touch-min)]",
            "flex items-center justify-center",
            "rounded-[var(--radius-lg)]",
            "hover:bg-[var(--surface-secondary)]",
            "transition-colors duration-[var(--duration-fast)]"
          )}
        >
          <XMarkIcon className="w-4 h-4 text-[var(--text-secondary)]" />
        </button>
        <p className="text-[9px] uppercase tracking-[var(--tracking-widest)] text-[var(--brand-primary)] font-[var(--weight-bold)]">
          {t('session.amrapMode')}
        </p>
        <div className="w-8" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-[var(--text-xl)] font-[var(--weight-bold)] text-[var(--text-primary)] text-center mb-[var(--space-2)]">
          {amrapBlock.title || t('session.amrap')}
        </h1>
        <p className="text-[var(--text-xs)] text-[var(--text-secondary)] text-center mb-[var(--space-4)]">
          {t('session.amrap')} - {amrapBlock.duration_minutes} {t('workout.min')}
        </p>

        <div className={cn(
          "w-full max-w-md",
          "bg-[var(--surface-primary)]",
          "border border-[var(--border-default)]",
          "rounded-[var(--radius-lg)]",
          "p-[var(--space-3)] mb-[var(--space-4)]",
          "shadow-[var(--shadow-sm)]"
        )}>
          <p className="text-[9px] uppercase tracking-[var(--tracking-widest)] text-[var(--text-tertiary)] font-[var(--weight-bold)] mb-[var(--space-2)]">
            {t('session.exercisesRounds')}
          </p>
          <div className="space-y-[var(--space-1-5)]">
            {(Array.isArray(amrapBlock.exercises) ? amrapBlock.exercises : []).map((ex, i) => (
              <div key={i} className="flex items-center gap-[var(--space-2)]">
                <span className={cn(
                  "w-4 h-4",
                  "bg-[var(--surface-secondary)]",
                  "rounded-full",
                  "flex items-center justify-center",
                  "text-[9px] font-[var(--weight-bold)] text-[var(--text-tertiary)]"
                )}>
                  {i + 1}
                </span>
                <span className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--text-primary)]">
                  {ex?.exercise_name || 'Unknown Exercise'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={onComplete}
          variant="primary"
          size="lg"
          className="w-full max-w-md"
        >
          {t('session.completeAmrapBlock', { number: currentBlockIndex + 1 })}
        </Button>
      </div>
    </div>
  );
}
