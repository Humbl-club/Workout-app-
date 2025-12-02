import React, { useEffect, useState } from 'react';
import { XMarkIcon } from './icons';
import { useAction } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import { cn } from '../lib/utils';

interface ExerciseExplanationModalProps {
  exerciseName: string;
  exerciseNotes?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExerciseExplanationModal({
  exerciseName,
  exerciseNotes,
  isOpen,
  onClose,
}: ExerciseExplanationModalProps) {
  const { user } = useUser();
  const explainExerciseAction = useAction(api.ai.explainExercise);
  const [explanation, setExplanation] = useState<string>('');
  const [musclesWorked, setMusclesWorked] = useState<string[]>([]);
  const [formCue, setFormCue] = useState<string>('');
  const [commonMistake, setCommonMistake] = useState<string>('');
  const [stepByStep, setStepByStep] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && exerciseName) {
      setIsLoading(true);
      setError(null);
      setExplanation('');

      explainExerciseAction({
        exerciseName,
        userId: user?.id || 'anonymous'
      })
        .then((result) => {
          setExplanation(result.explanation);
          setMusclesWorked(result.muscles_worked || []);
          setFormCue(result.form_cue || '');
          setCommonMistake(result.common_mistake || '');
          setStepByStep(result.step_by_step || []);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load');
          setIsLoading(false);
        });
    }
  }, [isOpen, exerciseName, explainExerciseAction, user?.id]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Bottom Sheet */}
      <div
        className={cn(
          "relative w-full max-w-lg",
          "bg-[var(--bg-primary)]",
          "rounded-t-[28px]",
          "animate-slide-in"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[var(--text-tertiary)]/30 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] max-h-[70vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-5">
            <div className="flex-1 pr-3">
              <h3 className="text-[22px] font-[var(--weight-black)] text-[var(--text-primary)] leading-tight">
                {exerciseName}
              </h3>
            </div>
            <button
              onClick={onClose}
              className={cn(
                "p-2 -mr-2 -mt-1",
                "rounded-full",
                "text-[var(--text-tertiary)]",
                "active:bg-[var(--surface-secondary)]",
                "transition-colors"
              )}
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-3 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)] rounded-full animate-spin" />
              <p className="mt-4 text-[var(--text-sm)] text-[var(--text-tertiary)] font-[var(--weight-medium)]">
                Loading...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={cn(
              "bg-[var(--status-error-bg)]/10",
              "border border-[var(--status-error-bg)]/30",
              "rounded-[var(--radius-xl)]",
              "px-4 py-3"
            )}>
              <p className="text-[var(--text-sm)] text-[var(--status-error-text)] font-[var(--weight-medium)]">
                {error}
              </p>
            </div>
          )}

          {/* Content */}
          {explanation && !isLoading && (
            <div className="space-y-4">
              {/* Main Explanation */}
              <p className="text-[var(--text-base)] text-[var(--text-primary)] font-[var(--weight-medium)] leading-relaxed">
                {explanation}
              </p>

              {/* Muscles - Horizontal Pills */}
              {musclesWorked.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {musclesWorked.map((muscle, idx) => (
                    <span
                      key={idx}
                      className={cn(
                        "px-3 py-1.5",
                        "text-[var(--text-xs)] font-[var(--weight-bold)]",
                        "bg-[var(--brand-primary)]",
                        "text-white",
                        "rounded-full"
                      )}
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              )}

              {/* How To - Numbered Steps */}
              {stepByStep.length > 0 && (
                <div className={cn(
                  "bg-[var(--surface-secondary)]",
                  "rounded-[var(--radius-2xl)]",
                  "p-4"
                )}>
                  <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-[var(--weight-black)] mb-3">
                    How To
                  </p>
                  <div className="space-y-2.5">
                    {stepByStep.map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <span className={cn(
                          "flex-shrink-0",
                          "w-6 h-6 rounded-full",
                          "bg-[var(--brand-primary)]",
                          "text-white text-[11px] font-[var(--weight-black)]",
                          "flex items-center justify-center"
                        )}>
                          {idx + 1}
                        </span>
                        <span className="text-[var(--text-sm)] text-[var(--text-primary)] font-[var(--weight-medium)] pt-0.5">
                          {step.replace(/^Step \d+:\s*/i, '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips Row - Form Cue & Mistake Side by Side */}
              {(formCue || commonMistake) && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Form Cue */}
                  {formCue && (
                    <div className={cn(
                      "bg-[var(--status-success-bg)]/15",
                      "border border-[var(--status-success-bg)]/30",
                      "rounded-[var(--radius-xl)]",
                      "p-3"
                    )}>
                      <p className="text-[9px] uppercase tracking-widest text-[var(--status-success-text)] font-[var(--weight-black)] mb-1.5">
                        Do This
                      </p>
                      <p className="text-[var(--text-xs)] text-[var(--text-primary)] font-[var(--weight-semibold)] leading-snug">
                        {formCue}
                      </p>
                    </div>
                  )}

                  {/* Common Mistake */}
                  {commonMistake && (
                    <div className={cn(
                      "bg-[var(--status-error-bg)]/15",
                      "border border-[var(--status-error-bg)]/30",
                      "rounded-[var(--radius-xl)]",
                      "p-3"
                    )}>
                      <p className="text-[9px] uppercase tracking-widest text-[var(--status-error-text)] font-[var(--weight-black)] mb-1.5">
                        Avoid
                      </p>
                      <p className="text-[var(--text-xs)] text-[var(--text-primary)] font-[var(--weight-semibold)] leading-snug">
                        {commonMistake}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Plan Notes (if any) */}
              {exerciseNotes && (
                <div className={cn(
                  "bg-[var(--surface-tertiary)]",
                  "rounded-[var(--radius-xl)]",
                  "p-3"
                )}>
                  <p className="text-[9px] uppercase tracking-widest text-[var(--text-tertiary)] font-[var(--weight-black)] mb-1.5">
                    Your Notes
                  </p>
                  <p className="text-[var(--text-xs)] text-[var(--text-secondary)] font-[var(--weight-medium)]">
                    {exerciseNotes}
                  </p>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className={cn(
                  "w-full py-4 mt-2",
                  "bg-[var(--brand-primary)]",
                  "text-white text-[var(--text-base)] font-[var(--weight-bold)]",
                  "rounded-[var(--radius-2xl)]",
                  "active:scale-[0.98]",
                  "transition-transform duration-100"
                )}
              >
                Got it
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
