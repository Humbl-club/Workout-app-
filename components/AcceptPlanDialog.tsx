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
            ? 'Plan replaced! You and your buddy are now on the same program 🤝'
            : 'Plan added! Check your plan list to activate it'
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--surface-secondary)] flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-4 border-[var(--primary)] border-t-transparent animate-spin" />
            </div>
            <p className="text-[14px] text-[var(--text-secondary)]">
              Loading shared plan...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sharedPlanData.plan) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-[16px] font-bold text-[var(--text-primary)] mb-2">
              Share Code Not Found
            </p>
            <p className="text-[14px] text-[var(--text-secondary)] mb-6">
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
  const totalExercises = plan.weeklyPlan.reduce((sum, day) =>
    sum + day.blocks.reduce((blockSum, block) => blockSum + block.exercises.length, 0), 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-md shadow-elevated animate-scale-in">
        <CardHeader className="border-b border-[var(--border)] p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[18px] font-bold text-[var(--text-primary)] mb-1">
                Accept Shared Plan
              </h3>
              <p className="text-[12px] text-[var(--text-secondary)]">
                From: Workout Buddy
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[var(--surface-secondary)] transition-all"
            >
              <XMarkIcon className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {/* Plan Preview */}
          <div className="mb-6 p-5 bg-gradient-to-br from-[var(--primary-light)] to-[var(--accent-light)] border border-[var(--primary)]/20 rounded-2xl">
            <h4 className="text-[20px] font-black text-[var(--primary)] mb-3">
              {plan.name}
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/80 rounded-xl">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
                  Days/Week
                </p>
                <p className="text-2xl font-black text-[var(--text-primary)]">
                  {plan.weeklyPlan.filter(d => d.blocks.length > 0).length}
                </p>
              </div>

              <div className="p-3 bg-white/80 rounded-xl">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
                  Exercises
                </p>
                <p className="text-2xl font-black text-[var(--text-primary)]">
                  {totalExercises}
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mb-6 p-3 bg-[var(--surface-secondary)] rounded-xl">
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
              <strong>What happens:</strong> You'll get an exact copy of this plan.
              You and your buddy can then compare PRs and progress!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
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
          <div className="mt-4 text-center">
            <p className="text-[11px] text-[var(--text-tertiary)]">
              Code: <span className="font-mono font-bold">{shareCode}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
