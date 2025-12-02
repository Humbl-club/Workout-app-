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

/**
 * HomePage skeleton - matches the actual HomePage layout
 */
const HomePageSkeleton: React.FC = () => (
  <div className="w-full max-w-lg mx-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[calc(6rem+env(safe-area-inset-bottom))] animate-fade-in flex-1 flex flex-col">
    {/* Header skeleton */}
    <header className="mb-5 sm:mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton variant="text" className="h-3 w-32" />
        </div>
        <Skeleton variant="text" className="h-4 w-28" />
      </div>

      {/* Day selector skeleton */}
      <div className="py-3 -mx-3 px-3">
        <div className="flex gap-2 overflow-hidden">
          {[...Array(7)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-[58px] min-w-[68px] rounded-xl flex-shrink-0"
            />
          ))}
        </div>
      </div>
    </header>

    {/* Main workout card skeleton */}
    <main className="flex-1 space-y-2.5 sm:space-y-3">
      <div className="bg-[var(--surface)] border border-[var(--border-card)] rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0 space-y-3">
              {/* Labels */}
              <div className="flex items-center gap-2">
                <Skeleton variant="text" className="h-3 w-20" />
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              {/* Title */}
              <Skeleton className="h-6 w-44" />
              {/* Metrics row */}
              <div className="flex items-center gap-3">
                <Skeleton variant="text" className="h-3 w-16" />
                <Skeleton variant="text" className="h-3 w-20" />
                <Skeleton variant="text" className="h-3 w-14" />
              </div>
            </div>
            <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
          </div>
        </div>
        {/* Button skeleton */}
        <div className="p-4 sm:p-5 pt-3">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>

      {/* Daily routine card skeleton */}
      <div className="bg-[var(--surface)] border border-[var(--border-card)] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-3 w-20" />
            <Skeleton className="h-5 w-36" />
          </div>
          <Skeleton className="h-5 w-5 rounded flex-shrink-0" />
        </div>
      </div>
    </main>
  </div>
)
HomePageSkeleton.displayName = "HomePageSkeleton"

/**
 * Day selector skeleton - individual day buttons
 */
const DaySelectorSkeleton: React.FC = () => (
  <div className="flex gap-2 overflow-hidden py-3">
    {[...Array(7)].map((_, i) => (
      <Skeleton
        key={i}
        className="h-[58px] min-w-[68px] rounded-xl flex-shrink-0"
      />
    ))}
  </div>
)
DaySelectorSkeleton.displayName = "DaySelectorSkeleton"

/**
 * Notification banner skeleton
 */
const NotificationSkeleton: React.FC = () => (
  <div className="mb-4 p-4 bg-[var(--surface-secondary)] rounded-2xl animate-pulse">
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton variant="text" className="h-3 w-20" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  </div>
)
NotificationSkeleton.displayName = "NotificationSkeleton"

export {
  Skeleton,
  CardSkeleton,
  ListItemSkeleton,
  ExerciseRowSkeleton,
  SessionTrackerSkeleton,
  HomePageSkeleton,
  DaySelectorSkeleton,
  NotificationSkeleton
}
