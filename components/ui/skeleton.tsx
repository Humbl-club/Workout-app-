import * as React from "react"
import { cn } from "../../lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'text' | 'circle' | 'card';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: "h-4 w-full",
      text: "h-4 w-3/4",
      circle: "h-12 w-12 rounded-full",
      card: "h-32 w-full"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "skeleton",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

/**
 * Card skeleton for workout cards - Enhanced
 */
const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn(
    "bg-[var(--surface)] border border-[var(--border-card)] rounded-2xl p-6",
    "shadow-sm animate-page-enter",
    className
  )}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" className="h-3 w-24" />
        <Skeleton className="h-6 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton variant="text" className="h-3 w-16" />
          <Skeleton variant="text" className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>
    <Skeleton className="h-12 w-full rounded-full" />
  </div>
)
CardSkeleton.displayName = "CardSkeleton"

/**
 * List item skeleton
 */
const ListItemSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("flex items-center gap-3 py-3", className)}>
    <Skeleton variant="circle" className="h-10 w-10" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton variant="text" className="h-3 w-1/2" />
    </div>
  </div>
)
ListItemSkeleton.displayName = "ListItemSkeleton"

/**
 * Exercise row skeleton
 */
const ExerciseRowSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("py-4 space-y-3", className)}>
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-48" />
      <Skeleton variant="circle" className="h-8 w-8" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-6 w-16 rounded-md" />
      <Skeleton className="h-6 w-16 rounded-md" />
      <Skeleton className="h-6 w-20 rounded-md" />
    </div>
  </div>
)
ExerciseRowSkeleton.displayName = "ExerciseRowSkeleton"

/**
 * Session tracker skeleton
 */
const SessionTrackerSkeleton: React.FC = () => (
  <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-[var(--background)]">
    <div className="sticky top-0 z-20 bg-[var(--background)] border-b border-[var(--border)] p-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" className="h-6 w-6" />
        <Skeleton className="flex-1 h-2 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>

    <div className="flex-1 p-4 space-y-4">
      <div className="space-y-2">
        <Skeleton variant="text" className="h-3 w-24" />
        <Skeleton className="h-8 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>

      <Skeleton className="h-12 rounded-lg" />
    </div>
  </div>
)
SessionTrackerSkeleton.displayName = "SessionTrackerSkeleton"

export {
  Skeleton,
  CardSkeleton,
  ListItemSkeleton,
  ExerciseRowSkeleton,
  SessionTrackerSkeleton
}
