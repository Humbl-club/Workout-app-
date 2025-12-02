/**
 * Volume Chart Component
 *
 * Bar chart showing total volume (sets × reps × weight) per workout
 * Brutalist design with bold bars and clear labels
 */

import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';

export interface VolumeDataPoint {
  date: string;
  volume: number;
  workoutName?: string;
}

export interface VolumeChartProps {
  data: VolumeDataPoint[];
  title?: string;
  height?: number;
}

export function VolumeChart({
  data,
  title = 'Workout Volume',
  height = 180,
}: VolumeChartProps) {
  const { maxVolume, bars } = useMemo(() => {
    if (data.length === 0) {
      return { maxVolume: 0, bars: [] };
    }

    const maxVolume = Math.max(...data.map(d => d.volume));

    const bars = data.map((d, i) => ({
      ...d,
      heightPercent: (d.volume / maxVolume) * 100,
      index: i,
    }));

    return { maxVolume, bars };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className={cn(
        'border-2 border-[var(--border-default)]',
        'rounded-[var(--radius-lg)]',
        'p-[var(--space-6)]',
        'text-center'
      )}
      style={{ height: `${height}px` }}>
        <p className="text-[var(--text-sm)] text-[var(--text-tertiary)]">
          No volume data available
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
      <div className="mb-[var(--space-3)]">
        <h3 className="text-[var(--text-sm)] font-[var(--weight-bold)] text-[var(--text-primary)] uppercase tracking-[var(--tracking-wider)]">
          {title}
        </h3>
      </div>

      {/* Chart */}
      <div
        style={{ height: `${height}px` }}
        className="relative flex items-end justify-between gap-[var(--space-1)]"
      >
        {bars.map((bar) => (
          <div
            key={bar.index}
            className="flex-1 flex flex-col items-center group"
          >
            {/* Bar */}
            <div
              className={cn(
                'w-full',
                'bg-[var(--brand-primary)]',
                'transition-all duration-300',
                'hover:bg-[var(--brand-primary-hover)]',
                'relative'
              )}
              style={{ height: `${bar.heightPercent}%` }}
            >
              {/* Tooltip on hover */}
              <div className={cn(
                'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
                'opacity-0 group-hover:opacity-100',
                'transition-opacity duration-200',
                'bg-[var(--surface-primary)]',
                'border-2 border-[var(--border-strong)]',
                'rounded-[var(--radius-md)]',
                'px-2 py-1',
                'whitespace-nowrap',
                'text-[10px] font-bold',
                'pointer-events-none'
              )}>
                {bar.volume.toLocaleString()} kg
              </div>
            </div>

            {/* Date label */}
            <p className="text-[8px] text-[var(--text-tertiary)] mt-1 font-mono rotate-0">
              {new Date(bar.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
            </p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-[var(--space-4)] grid grid-cols-3 gap-[var(--space-3)] text-[11px]">
        <div>
          <p className="text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Total</p>
          <p className="font-bold text-[var(--text-primary)] tabular-nums">
            {data.reduce((sum, d) => sum + d.volume, 0).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Average</p>
          <p className="font-bold text-[var(--text-primary)] tabular-nums">
            {Math.round(data.reduce((sum, d) => sum + d.volume, 0) / data.length).toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Peak</p>
          <p className="font-bold text-[var(--brand-primary)] tabular-nums">
            {maxVolume.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
