/**
 * PR History Chart Component
 *
 * Timeline showing personal records with milestone markers
 * Brutalist design with bold markers and clear progression
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { TrophyIcon } from '../icons';

export interface PRRecord {
  date: string;
  exerciseName: string;
  weight: number;
  reps: number;
}

export interface PRHistoryChartProps {
  records: PRRecord[];
  title?: string;
  maxRecords?: number;
}

export function PRHistoryChart({
  records,
  title = 'Personal Records',
  maxRecords = 10,
}: PRHistoryChartProps) {
  // Sort by date (most recent first) and limit
  const sortedRecords = [...records]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxRecords);

  if (records.length === 0) {
    return (
      <div className={cn(
        'border-2 border-[var(--border-default)]',
        'rounded-[var(--radius-lg)]',
        'p-[var(--space-6)]',
        'text-center'
      )}>
        <TrophyIcon className="w-12 h-12 mx-auto mb-3 text-[var(--text-tertiary)]" />
        <p className="text-[var(--text-sm)] text-[var(--text-tertiary)]">
          No personal records yet
        </p>
        <p className="text-[var(--text-xs)] text-[var(--text-tertiary)] mt-1">
          Push your limits to unlock achievements!
        </p>
      </div>
    );
  }

  return (
    <div className={cn(
      'border-2 border-[var(--border-default)]',
      'rounded-[var(--radius-lg)]',
      'p-[var(--space-4)]',
      'bg-[var(--surface-primary)]'
    )}>
      {/* Title */}
      <div className="mb-[var(--space-4)] flex items-center justify-between">
        <h3 className="text-[var(--text-sm)] font-[var(--weight-bold)] text-[var(--text-primary)] uppercase tracking-[var(--tracking-wider)]">
          {title}
        </h3>
        <span className="text-[var(--text-2xs)] text-[var(--text-tertiary)] uppercase tracking-wider">
          {records.length} Total
        </span>
      </div>

      {/* Timeline */}
      <div className="space-y-[var(--space-3)]">
        {sortedRecords.map((record, index) => (
          <div
            key={`${record.date}-${record.exerciseName}`}
            className={cn(
              'flex items-start gap-[var(--space-3)]',
              'relative',
              'pb-[var(--space-3)]',
              index !== sortedRecords.length - 1 && 'border-b border-[var(--border-subtle)]'
            )}
          >
            {/* Trophy icon */}
            <div className={cn(
              'flex-shrink-0',
              'w-8 h-8',
              'rounded-full',
              'bg-[var(--brand-primary-subtle)]',
              'flex items-center justify-center'
            )}>
              <TrophyIcon className="w-4 h-4 text-[var(--brand-primary)]" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-[var(--text-sm)] font-[var(--weight-bold)] text-[var(--text-primary)] truncate">
                {record.exerciseName}
              </p>
              <div className="flex items-center gap-[var(--space-2)] mt-1">
                <span className="text-[var(--text-xs)] font-bold text-[var(--brand-primary)] tabular-nums">
                  {record.weight} kg × {record.reps}
                </span>
                <span className="text-[var(--text-2xs)] text-[var(--text-tertiary)]">
                  {new Date(record.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* New badge for recent PRs (within 7 days) */}
            {new Date().getTime() - new Date(record.date).getTime() < 7 * 24 * 60 * 60 * 1000 && (
              <div className={cn(
                'flex-shrink-0',
                'px-2 py-1',
                'bg-[var(--brand-primary)]',
                'text-[var(--text-on-brand)]',
                'text-[8px] font-bold uppercase tracking-wider',
                'rounded-[var(--radius-sm)]'
              )}>
                New
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show more indicator if there are more records */}
      {records.length > maxRecords && (
        <div className="mt-[var(--space-3)] pt-[var(--space-3)] border-t border-[var(--border-subtle)] text-center">
          <p className="text-[var(--text-xs)] text-[var(--text-tertiary)]">
            +{records.length - maxRecords} more records
          </p>
        </div>
      )}
    </div>
  );
}
