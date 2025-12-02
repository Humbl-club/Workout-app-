import React from 'react';
import { WorkoutBlock } from '../types';
import { RepeatIcon, TimerIcon, DumbbellIcon } from './icons';

interface BlockOverviewProps {
  blocks: WorkoutBlock[];
  currentBlockIndex: number;
}

// Get icon for block type
function getBlockIcon(type: string) {
  switch (type) {
    case 'superset':
      return <RepeatIcon className="w-3 h-3" />;
    case 'amrap':
      return <TimerIcon className="w-3 h-3" />;
    default:
      return <DumbbellIcon className="w-3 h-3" />;
  }
}

// Get block type label
function getBlockTypeLabel(block: WorkoutBlock) {
  switch (block.type) {
    case 'superset':
      return `Superset${(block as any).rounds ? ` × ${(block as any).rounds}` : ''}`;
    case 'amrap':
      return `AMRAP${(block as any).duration_minutes ? ` ${(block as any).duration_minutes}min` : ''}`;
    default:
      return 'Straight Sets';
  }
}

export default function BlockOverview({ blocks, currentBlockIndex }: BlockOverviewProps) {
  const currentBlock = blocks[currentBlockIndex];
  const totalBlocks = blocks.length;

  if (totalBlocks <= 1) {
    // Don't show block overview for single-block workouts
    return null;
  }

  return (
    <div className="mb-3">
      {/* Progress indicators */}
      <div className="flex items-center gap-1 mb-2">
        {blocks.map((block, i) => (
          <div
            key={i}
            className={`
              h-1 rounded-full transition-all duration-300 flex-1
              ${i < currentBlockIndex
                ? 'bg-[var(--brand-primary)] opacity-50' // Completed
                : i === currentBlockIndex
                ? 'bg-[var(--brand-primary)]' // Current
                : 'bg-[var(--surface-secondary)]' // Upcoming
              }
            `}
          />
        ))}
      </div>

      {/* Current block info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Block type icon */}
          <div className={`
            w-6 h-6 rounded-md flex items-center justify-center
            ${currentBlock.type === 'superset'
              ? 'bg-[var(--brand-primary-subtle)] text-[var(--brand-primary)]'
              : currentBlock.type === 'amrap'
              ? 'bg-[var(--status-warning-subtle)] text-[var(--status-warning-bg)]'
              : 'bg-[var(--surface-secondary)] text-[var(--text-tertiary)]'
            }
          `}>
            {getBlockIcon(currentBlock.type)}
          </div>

          {/* Block title and type */}
          <div>
            <p className="text-[11px] font-semibold text-[var(--text-primary)] leading-tight">
              {currentBlock.title || `Block ${currentBlockIndex + 1}`}
            </p>
            <p className="text-[9px] text-[var(--text-tertiary)] font-medium">
              {getBlockTypeLabel(currentBlock)}
            </p>
          </div>
        </div>

        {/* Block counter */}
        <div className="text-[10px] text-[var(--text-tertiary)] font-medium tabular-nums">
          {currentBlockIndex + 1} / {totalBlocks}
        </div>
      </div>
    </div>
  );
}
