import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      "py-[var(--space-12)] px-[var(--space-4)]",
      "text-center",
      className
    )}>
      {icon && (
        <div className={cn(
          "w-16 h-16",
          "mb-[var(--space-4)]",
          "rounded-full",
          "bg-[var(--surface-secondary)]",
          "flex items-center justify-center",
          "text-[var(--text-tertiary)]"
        )}>
          {icon}
        </div>
      )}

      <h2 className={cn(
        "text-[var(--text-xl)] font-[var(--weight-bold)]",
        "text-[var(--text-primary)]",
        "mb-[var(--space-2)]"
      )}>
        {title}
      </h2>

      <p className={cn(
        "text-[var(--text-sm)]",
        "text-[var(--text-secondary)]",
        "mb-[var(--space-6)]",
        "max-w-md"
      )}>
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-[var(--space-3)] w-full max-w-xs">
          {actionLabel && onAction && (
            <Button
              onClick={onAction}
              variant="primary"
              size="lg"
              fullWidth
            >
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button
              onClick={onSecondaryAction}
              variant="outline"
              size="lg"
              fullWidth
            >
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
