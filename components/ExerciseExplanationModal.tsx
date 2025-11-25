import React, { useEffect, useState } from 'react';
import { XMarkIcon } from './icons';
import { explainExercise } from '../services/geminiService';

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
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && exerciseName) {
      setIsLoading(true);
      setError(null);
      setExplanation('');

      explainExercise(exerciseName, exerciseNotes)
        .then((result) => {
          setExplanation(result);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load explanation');
          setIsLoading(false);
        });
    }
  }, [isOpen, exerciseName, exerciseNotes]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Bottom Sheet */}
      <div
        className="relative w-full max-w-2xl bg-[var(--surface)] rounded-t-2xl animate-slide-in"
        style={{ boxShadow: 'var(--shadow-lg)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-[var(--border-strong)] rounded-full"></div>
        </div>

        {/* Content */}
        <div className="px-5 pb-[calc(2rem+env(safe-area-inset-bottom))]">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1 pr-4">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold mb-1">
                EXERCISE INFO
              </p>
              <h3 className="text-xl font-bold text-[var(--text-primary)] leading-tight">
                {exerciseName}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-all"
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Explanation */}
          <div className="min-h-[120px]">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8">
                <svg
                  className="animate-spin h-8 w-8 text-[var(--accent)]"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="mt-3 text-[13px] text-[var(--text-secondary)] font-medium">
                  Loading explanation...
                </p>
              </div>
            )}

            {error && (
              <div className="bg-[var(--surface-secondary)] border border-[var(--error)] text-[var(--error)] px-4 py-3 rounded-lg">
                <p className="text-[13px]">{error}</p>
              </div>
            )}

            {explanation && !isLoading && (
              <div className="space-y-4">
                <p className="text-[15px] text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                  {explanation}
                </p>

                {exerciseNotes && (
                  <div className="bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg p-4 mt-4">
                    <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold mb-2">
                      YOUR PLAN NOTES
                    </p>
                    <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                      {exerciseNotes}
                    </p>
                  </div>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-lg font-semibold text-[14px] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition-all active:scale-95 shadow-card"
                >
                  Got it
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
