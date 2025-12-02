/**
 * Progress Chart Component
 *
 * Minimal, brutalist chart for visualizing workout progress
 * No external dependencies - pure CSS and SVG
 * Shows weight progression over time for specific exercises
 */

import React, { useMemo } from 'react';
import { cn } from '../../lib/utils';

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ProgressChartProps {
  data: ChartDataPoint[];
  title: string;
  yAxisLabel?: string;
  color?: string;
  height?: number;
  showDots?: boolean;
}

export function ProgressChart({
  data,
  title,
  yAxisLabel = 'Weight (kg)',
  color = 'var(--brand-primary)',
  height = 200,
  showDots = true,
}: ProgressChartProps) {
  const { points, minValue, maxValue, pathD } = useMemo(() => {
    if (data.length === 0) {
      return { points: [], minValue: 0, maxValue: 100, pathD: '' };
    }

    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Add 10% padding to y-axis
    const padding = (max - min) * 0.1;
    const minValue = Math.max(0, min - padding);
    const maxValue = max + padding;

    // Calculate points for line
    const width = 100; // SVG viewBox width
    const chartHeight = 80; // SVG viewBox height
    const xStep = width / (data.length - 1 || 1);

    const points = data.map((d, i) => {
      const x = i * xStep;
      const y = chartHeight - ((d.value - minValue) / (maxValue - minValue)) * chartHeight;
      return { x, y, ...d };
    });

    // Create SVG path
    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    return { points, minValue, maxValue, pathD };
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
          No data available
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
      <div style={{ height: `${height}px` }} className="relative">
        <svg
          viewBox="0 0 100 80"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines (horizontal) */}
          {[0, 25, 50, 75, 100].map(percent => (
            <line
              key={percent}
              x1="0"
              y1={80 - (percent * 0.8)}
              x2="100"
              y2={80 - (percent * 0.8)}
              stroke="var(--border-subtle)"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Area under line */}
          <path
            d={`${pathD} L ${points[points.length - 1].x} 80 L 0 80 Z`}
            fill={color}
            fillOpacity="0.1"
          />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Dots */}
          {showDots && points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill={color}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-[10px] text-[var(--text-tertiary)] font-mono">
          <span>{Math.round(maxValue)}</span>
          <span>{Math.round((maxValue + minValue) / 2)}</span>
          <span>{Math.round(minValue)}</span>
        </div>
      </div>

      {/* X-axis labels (dates) */}
      <div className="flex justify-between mt-[var(--space-2)] text-[9px] text-[var(--text-tertiary)] font-mono">
        <span>{new Date(data[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        {data.length > 1 && (
          <span>{new Date(data[data.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        )}
      </div>

      {/* Stats */}
      <div className="mt-[var(--space-3)] flex justify-between text-[11px]">
        <div>
          <span className="text-[var(--text-tertiary)] uppercase tracking-wider">Latest:</span>
          <span className="ml-1 font-bold text-[var(--text-primary)] tabular-nums">{data[data.length - 1].value}</span>
        </div>
        {data.length > 1 && (
          <div>
            <span className="text-[var(--text-tertiary)] uppercase tracking-wider">Change:</span>
            <span className={cn(
              "ml-1 font-bold tabular-nums",
              data[data.length - 1].value > data[0].value ? "text-[var(--status-success-bg)]" : "text-[var(--status-error-bg)]"
            )}>
              {data[data.length - 1].value > data[0].value ? '+' : ''}
              {(data[data.length - 1].value - data[0].value).toFixed(1)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
