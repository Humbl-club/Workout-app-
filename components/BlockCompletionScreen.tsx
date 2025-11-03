import React from 'react';
import { CheckCircleIcon, TimerIcon } from './icons';
import { WorkoutBlock } from '../types';

interface BlockCompletionScreenProps {
  completedBlock: WorkoutBlock;
  blockNumber: number;
  totalBlocks: number;
  nextBlock?: WorkoutBlock;
  onContinue: () => void;
}

export default function BlockCompletionScreen({
  completedBlock,
  blockNumber,
  totalBlocks,
  nextBlock,
  onContinue
}: BlockCompletionScreenProps) {
  return (
    <div className="min-h-screen w-full max-w-2xl mx-auto flex flex-col items-center justify-center px-5 py-8 animate-scale-in">
      {/* Completion Icon */}
      <div className="w-24 h-24 bg-[var(--accent)] rounded-full flex items-center justify-center mb-6 animate-pulse-subtle" style={{ boxShadow: 'var(--glow-red)' }}>
        <CheckCircleIcon className="w-14 h-14 text-white" />
      </div>

      {/* Title */}
      <h2 className="font-syne text-3xl font-bold text-[var(--text-primary)] mb-2 text-center">
        Block Complete!
      </h2>
      <p className="text-[14px] text-[var(--text-secondary)] mb-8 text-center">
        {completedBlock.title || `Block ${blockNumber}`}
      </p>

      {/* Progress Dots */}
      <div className="flex items-center gap-2 mb-8">
        {[...Array(totalBlocks)].map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i < blockNumber
                ? 'w-8 bg-[var(--accent)]'
                : i === blockNumber
                ? 'w-2 bg-[var(--accent)]'
                : 'w-2 bg-[var(--surface-secondary)]'
            }`}
          />
        ))}
      </div>

      {/* Next Block Preview */}
      {nextBlock ? (
        <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-8" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-2">
            UP NEXT
          </p>
          <h3 className="font-syne text-xl font-bold text-[var(--text-primary)] mb-2">
            {nextBlock.title || 'Next Block'}
          </h3>
          <p className="text-[13px] text-[var(--text-secondary)]">
            {Array.isArray(nextBlock.exercises) ? nextBlock.exercises.length : 0} exercises
            {nextBlock.type === 'superset' && ` · ${(nextBlock as any).rounds} rounds`}
            {nextBlock.type === 'amrap' && ` · ${(nextBlock as any).duration_minutes} min AMRAP`}
          </p>
        </div>
      ) : (
        <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-8" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <p className="text-[14px] text-[var(--text-secondary)] text-center">
            You're on the final block! 🎯
          </p>
        </div>
      )}

      {/* Continue Button */}
      <button
        onClick={onContinue}
        className="w-full py-5 rounded-xl font-bold text-[18px] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all"
        style={{ boxShadow: 'var(--glow-red)', letterSpacing: '-0.01em' }}
      >
        <TimerIcon className="w-6 h-6 inline mr-2" />
        {nextBlock ? 'Continue Workout' : 'Final Block - Let\'s Go!'}
      </button>
    </div>
  );
}
