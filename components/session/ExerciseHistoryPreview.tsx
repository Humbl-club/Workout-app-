import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { ClockIcon } from '../icons';

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

interface HistorySession {
  date: string;
  weight: number;
  reps: number;
  volume: number;
}

interface ExerciseHistoryPreviewProps {
  history: HistorySession[];
}

export default function ExerciseHistoryPreview({ history }: ExerciseHistoryPreviewProps) {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  if (!history || history.length === 0) return null;

  const getTrend = () => {
    if (history.length < 2) return null;
    const latestVolume = history[0].volume;
    const previousVolume = history[1].volume;
    if (latestVolume > previousVolume) return 'up';
    if (latestVolume < previousVolume) return 'down';
    return 'same';
  };

  const trend = getTrend();

  return (
    <div className={cn(
      "mb-[var(--space-4)]",
      "bg-[var(--surface-secondary)]",
      "border border-[var(--border-default)]",
      "rounded-[var(--radius-2xl)]",
      "overflow-hidden",
      "shadow-[var(--shadow-sm)]"
    )}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
        className={cn(
          "w-full p-[var(--space-4)]",
          "flex items-center justify-between",
          "active:bg-[var(--surface-active)]",
          "transition-colors duration-[var(--duration-fast)]"
        )}
      >
        <div className="flex items-center gap-[var(--space-2)]">
          <ClockIcon className="w-4 h-4 text-[var(--text-tertiary)]" />
          <span className="text-[var(--text-xs)] font-[var(--weight-bold)] text-[var(--text-secondary)] uppercase tracking-wider">
            Last Session: {history[0].weight}kg × {history[0].reps}
          </span>
          {trend && (
            <span className={cn(
              "text-[10px] font-[var(--weight-bold)]",
              trend === 'up' && "text-[var(--status-success-bg)]",
              trend === 'down' && "text-[var(--status-error-text)]",
              trend === 'same' && "text-[var(--text-tertiary)]"
            )}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          )}
        </div>
        <ChevronDownIcon className={cn(
          "w-4 h-4 text-[var(--text-tertiary)]",
          "transition-transform duration-[var(--duration-fast)]",
          isHistoryExpanded && "rotate-180"
        )} />
      </button>

      {/* Expandable history */}
      {isHistoryExpanded && (
        <div className="px-[var(--space-4)] pb-[var(--space-4)] border-t border-[var(--border-subtle)]">
          <div className="pt-[var(--space-3)] space-y-[var(--space-2)]">
            {history.map((session, idx) => {
              const sessionDate = new Date(session.date);
              const daysAgo = Math.floor((Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

              return (
                <div
                  key={session.date}
                  className={cn(
                    "flex items-center justify-between",
                    "p-[var(--space-3)]",
                    "bg-[var(--surface-primary)]",
                    "border border-[var(--border-subtle)]",
                    "rounded-[var(--radius-lg)]",
                    idx === 0 && "border-[var(--brand-primary)]/30"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[var(--text-tertiary)] font-[var(--weight-medium)]">
                      {daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`}
                    </span>
                    <span className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--text-primary)] tabular-nums">
                      {session.weight}kg × {session.reps} reps
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--text-tertiary)] block">Volume</span>
                    <span className="text-[var(--text-sm)] font-[var(--weight-bold)] text-[var(--brand-primary)] tabular-nums">
                      {session.volume}kg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
