import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { XMarkIcon, CheckCircleIcon, PlusIcon, RefreshIcon } from './icons';
import { notify } from './layout/Toast';
import { cn } from '../lib/utils';

interface AcceptPlanDialogProps {
  shareCode: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onAccepted: () => void;
}

export default function AcceptPlanDialog({ shareCode, userId, isOpen, onClose, onAccepted }: AcceptPlanDialogProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  const sharedPlanData = useQuery(
    api.buddyQueries.getSharedPlan,
    shareCode ? { shareCode } : "skip"
  );

  const acceptSharedPlanMutation = useMutation(api.buddyMutations.acceptSharedPlan);

  const handleAccept = async (action: "replace" | "add") => {
    setIsAccepting(true);
    try {
      const result = await acceptSharedPlanMutation({
        shareCode,
        userId,
        action
      });

      if (result.success) {
        notify({
          type: 'success',
          message: action === 'replace'
            ? 'Plan replaced. You and your buddy are now on the same program.'
            : 'Plan added. Check your plan list to activate it.'
        });
        onAccepted();
        onClose();
      }
    } catch (error) {
      notify({ type: 'error', message: 'Failed to accept plan' });
    } finally {
      setIsAccepting(false);
    }
  };

  if (!isOpen) return null;

  if (!sharedPlanData) {
    return (
      <div className={cn(
        'fixed inset-0',
        'z-[var(--z-modal)]',
        'flex items-center justify-center',
        'p-[var(--space-4)]',
        'bg-black/60 backdrop-blur-md'
      )}>
        <Card className="w-full max-w-md">
          <CardContent className="p-[var(--space-8)] text-center">
            <div className={cn(
              'w-16 h-16',
              'mx-auto mb-[var(--space-4)]',
              'rounded-full',
              'bg-[var(--surface-secondary)]',
              'flex items-center justify-center'
            )}>
              <div className="w-8 h-8 rounded-full border-4 border-[var(--brand-primary)] border-t-transparent animate-spin" />
            </div>
            <p className={cn(
              'text-[var(--text-sm)]',
              'text-[var(--text-secondary)]'
            )}>
              Loading shared plan...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sharedPlanData.plan) {
    return (
      <div className={cn(
        'fixed inset-0',
        'z-[var(--z-modal)]',
        'flex items-center justify-center',
        'p-[var(--space-4)]',
        'bg-black/60 backdrop-blur-md',
        'animate-fade-in'
      )}>
        <Card className="w-full max-w-md">
          <CardContent className="p-[var(--space-8)] text-center">
            <p className={cn(
              'text-[var(--text-md)]',
              'font-[var(--weight-bold)]',
              'text-[var(--text-primary)]',
              'mb-[var(--space-2)]'
            )}>
              Share Code Not Found
            </p>
            <p className={cn(
              'text-[var(--text-sm)]',
              'text-[var(--text-secondary)]',
              'mb-[var(--space-6)]'
            )}>
              This code is invalid or has expired.
            </p>
            <Button onClick={onClose} variant="ghost">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const plan = sharedPlanData.plan;

  // Helper to get all exercises from a day (handles both blocks and sessions)
  const getExercisesFromDay = (day: any) => {
    const exercises: any[] = [];
    // Single session day: day.blocks
    if (day.blocks && Array.isArray(day.blocks)) {
      day.blocks.forEach((block: any) => {
        if (block.exercises) exercises.push(...block.exercises);
      });
    }
    // 2x daily training: day.sessions
    if (day.sessions && Array.isArray(day.sessions)) {
      day.sessions.forEach((session: any) => {
        if (session.blocks && Array.isArray(session.blocks)) {
          session.blocks.forEach((block: any) => {
            if (block.exercises) exercises.push(...block.exercises);
          });
        }
      });
    }
    return exercises;
  };

  const totalExercises = plan.weeklyPlan.reduce((sum: number, day: any) =>
    sum + getExercisesFromDay(day).length, 0
  );

  // Check if day has workout (handles both blocks and sessions)
  const dayHasWorkout = (day: any) => {
    if (day.sessions && Array.isArray(day.sessions) && day.sessions.length > 0) {
      return day.sessions.some((s: any) => s.blocks?.length > 0);
    }
    return day.blocks && day.blocks.length > 0;
  };

  return (
    <div className={cn(
      'fixed inset-0',
      'z-[var(--z-modal)]',
      'flex items-center justify-center',
      'p-[var(--space-4)]',
      'bg-black/60 backdrop-blur-md',
      'animate-fade-in'
    )}>
      <Card className="w-full max-w-md shadow-[var(--shadow-lg)] animate-scale-in">
        <CardHeader className={cn(
          'border-b border-[var(--border-default)]',
          'p-[var(--space-5)]'
        )}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={cn(
                'text-[var(--text-lg)]',
                'font-[var(--weight-bold)]',
                'text-[var(--text-primary)]',
                'mb-[var(--space-1)]'
              )}>
                Accept Shared Plan
              </h3>
              <p className={cn(
                'text-[var(--text-xs)]',
                'text-[var(--text-secondary)]'
              )}>
                From: Workout Buddy
              </p>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'p-[var(--space-2)]',
                'rounded-full',
                'hover:bg-[var(--surface-secondary)]',
                'transition-all duration-[var(--duration-fast)]'
              )}
            >
              <XMarkIcon className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-[var(--space-5)]">
          {/* Plan Preview */}
          <div className={cn(
            'mb-[var(--space-6)]',
            'p-[var(--space-5)]',
            'bg-gradient-to-br from-[var(--brand-primary-subtle)] to-[var(--surface-secondary)]',
            'border border-[var(--brand-primary)]/20',
            'rounded-[var(--radius-2xl)]'
          )}>
            <h4 className={cn(
              'text-[var(--text-xl)]',
              'font-[var(--weight-black)]',
              'text-[var(--brand-primary)]',
              'mb-[var(--space-3)]'
            )}>
              {plan.name}
            </h4>

            <div className="grid grid-cols-2 gap-[var(--space-3)]">
              <div className={cn(
                'p-[var(--space-3)]',
                'bg-[var(--surface-primary)]/80',
                'rounded-[var(--radius-xl)]'
              )}>
                <p className={cn(
                  'text-[var(--text-2xs)]',
                  'uppercase tracking-[var(--tracking-wider)]',
                  'text-[var(--text-tertiary)]',
                  'font-[var(--weight-bold)]',
                  'mb-[var(--space-1)]'
                )}>
                  Days/Week
                </p>
                <p className={cn(
                  'text-2xl',
                  'font-[var(--weight-black)]',
                  'text-[var(--text-primary)]'
                )}>
                  {plan.weeklyPlan.filter(dayHasWorkout).length}
                </p>
              </div>

              <div className={cn(
                'p-[var(--space-3)]',
                'bg-[var(--surface-primary)]/80',
                'rounded-[var(--radius-xl)]'
              )}>
                <p className={cn(
                  'text-[var(--text-2xs)]',
                  'uppercase tracking-[var(--tracking-wider)]',
                  'text-[var(--text-tertiary)]',
                  'font-[var(--weight-bold)]',
                  'mb-[var(--space-1)]'
                )}>
                  Exercises
                </p>
                <p className={cn(
                  'text-2xl',
                  'font-[var(--weight-black)]',
                  'text-[var(--text-primary)]'
                )}>
                  {totalExercises}
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className={cn(
            'mb-[var(--space-6)]',
            'p-[var(--space-3)]',
            'bg-[var(--surface-secondary)]',
            'rounded-[var(--radius-xl)]'
          )}>
            <p className={cn(
              'text-[var(--text-xs)]',
              'text-[var(--text-secondary)]',
              'leading-relaxed'
            )}>
              <strong>What happens:</strong> You'll get an exact copy of this plan.
              You and your buddy can then compare PRs and progress!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-[var(--space-2)]">
            <Button
              onClick={() => handleAccept("replace")}
              loading={isAccepting}
              variant="accent"
              className="w-full h-14"
            >
              <RefreshIcon className="w-5 h-5" />
              Replace My Current Plan
            </Button>

            <Button
              onClick={() => handleAccept("add")}
              loading={isAccepting}
              variant="default"
              className="w-full h-12"
            >
              <PlusIcon className="w-4 h-4" />
              Add as New Plan
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full h-10"
            >
              Decline
            </Button>
          </div>

          {/* Share Code Reference */}
          <div className="mt-[var(--space-4)] text-center">
            <p className={cn(
              'text-[var(--text-2xs)]',
              'text-[var(--text-tertiary)]'
            )}>
              Code: <span className="font-mono font-[var(--weight-bold)]">{shareCode}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
