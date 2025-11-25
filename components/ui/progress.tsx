import * as React from "react";
import { cn } from "../../lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(({ value, className, ...props }, ref) => {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <div
      ref={ref}
      className={cn("w-full h-2 bg-[var(--surface-secondary)] rounded-full overflow-hidden", className)}
      {...props}
    >
      <div
        className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
});

Progress.displayName = "Progress";
