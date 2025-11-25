import React from 'react';
import { cn } from '../lib/utils';

interface Achievement {
  type: string;
  displayName: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockedAt?: string;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function AchievementBadge({ achievement, unlocked = true, size = 'md' }: AchievementBadgeProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze':
        return 'from-[#CD7F32] to-[#A0522D]';
      case 'silver':
        return 'from-[#C0C0C0] to-[#808080]';
      case 'gold':
        return 'from-[#FFD700] to-[#FFA500]';
      case 'platinum':
        return 'from-[#E5E4E2] to-[#B9B9B9]';
      default:
        return 'from-[var(--primary)] to-[var(--accent)]';
    }
  };

  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-24 h-24 text-4xl'
  };

  return (
    <div className={cn(
      "flex flex-col items-center gap-2",
      !unlocked && "opacity-40"
    )}>
      {/* Badge */}
      <div className={cn(
        "rounded-full flex items-center justify-center shadow-lg relative",
        sizeClasses[size],
        unlocked
          ? `bg-gradient-to-br ${getTierColor(achievement.tier)}`
          : "bg-[var(--surface-secondary)] border-2 border-dashed border-[var(--border-strong)]"
      )}>
        <span className={unlocked ? "filter drop-shadow-lg" : "grayscale"}>
          {achievement.icon}
        </span>

        {unlocked && (
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--success)] border-2 border-[var(--background)] flex items-center justify-center">
            <span className="text-white text-[10px]">✓</span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <p className={cn(
          "text-[12px] font-bold",
          unlocked ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
        )}>
          {achievement.displayName}
        </p>
        <p className="text-[10px] text-[var(--text-tertiary)]">
          {achievement.description}
        </p>
      </div>
    </div>
  );
}
