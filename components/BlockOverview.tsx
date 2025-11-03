import React from 'react';

interface BlockOverviewProps {
  totalBlocks: number;
  currentBlockIndex: number;
}

export default function BlockOverview({ totalBlocks, currentBlockIndex }: BlockOverviewProps) {
  return (
    <div className="flex items-center gap-1.5 justify-center mb-2">
      {[...Array(totalBlocks)].map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < currentBlockIndex
              ? 'w-6 bg-[var(--accent)] opacity-50' // Completed
              : i === currentBlockIndex
              ? 'w-6 bg-[var(--accent)]' // Current
              : 'w-6 bg-[var(--surface-secondary)]' // Upcoming
          }`}
        />
      ))}
      <span className="text-[9px] text-[var(--text-tertiary)] font-medium ml-1">
        Block {currentBlockIndex + 1}/{totalBlocks}
      </span>
    </div>
  );
}
