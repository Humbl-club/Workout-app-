import * as React from "react";
import { FlameIcon } from "../icons";
import { cn } from "../../lib/utils";

interface IntensityBadgeProps {
  level: 'High' | 'Moderate' | 'Light';
  value?: number;
  showValue?: boolean;
  className?: string;
}

export const IntensityBadge = React.forwardRef<HTMLDivElement, IntensityBadgeProps>(
  ({ level, value, showValue = false, className }, ref) => {
    const getStyles = () => {
      switch (level) {
        case 'High':
          return {
            bg: 'bg-gradient-to-br from-[var(--accent-strength)] to-[var(--accent-power)]',
            border: 'border-[var(--accent-strength)]/30',
            text: 'text-white',
            icon: 'text-white'
          };
        case 'Moderate':
          return {
            bg: 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)]',
            border: 'border-[var(--accent)]/30',
            text: 'text-white',
            icon: 'text-white'
          };
        case 'Light':
          return {
            bg: 'bg-gradient-to-br from-[var(--accent-recovery)] to-[var(--success)]',
            border: 'border-[var(--success)]/30',
            text: 'text-white',
            icon: 'text-white'
          };
      }
    };

    const styles = getStyles();

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm",
          styles.bg,
          styles.border,
          styles.text,
          className
        )}
      >
        <FlameIcon className={cn("w-3.5 h-3.5", styles.icon)} />
        <span className="text-[11px] font-bold uppercase tracking-wide">
          {level}
        </span>
        {showValue && value !== undefined && (
          <span className="text-[10px] font-black opacity-80">
            {value}%
          </span>
        )}
      </div>
    );
  }
);

IntensityBadge.displayName = "IntensityBadge";
