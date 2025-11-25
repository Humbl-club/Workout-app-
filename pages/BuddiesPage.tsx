import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useUser } from '@clerk/clerk-react';
import { api } from '../convex/_generated/api';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import BuddyComparisonCard from '../components/BuddyComparisonCard';
import BuddyWorkoutLog from '../components/BuddyWorkoutLog';
import EnterCodeDialog from '../components/EnterCodeDialog';
import { UsersIcon, PlusIcon, SettingsIcon, TrashIcon } from '../components/icons';
import { notify } from '../components/layout/Toast';
import { cn } from '../lib/utils';

export default function BuddiesPage() {
  const { user } = useUser();
  const userId = user?.id || null;

  const [showEnterCode, setShowEnterCode] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<string | null>(null);

  const buddies = useQuery(
    api.buddyQueries.getWorkoutBuddies,
    userId ? { userId } : "skip"
  );

  const removeBuddyMutation = useMutation(api.buddyMutations.removeBuddy);
  const markNotificationReadMutation = useMutation(api.buddyMutations.markNotificationRead);
  const sendBuddyRequestMutation = useMutation(api.userCodeMutations.sendBuddyRequest);

  const handleRemoveBuddy = async (buddyId: string) => {
    if (!userId) return;

    if (confirm('Remove this workout buddy? You can always reconnect later.')) {
      try {
        await removeBuddyMutation({ userId, buddyId });
        notify({ type: 'success', message: 'Buddy removed' });
      } catch (error) {
        notify({ type: 'error', message: 'Failed to remove buddy' });
      }
    }
  };

  const handleCodeEntered = async (code: string) => {
    if (!userId) return;

    try {
      await sendBuddyRequestMutation({
        fromUserId: userId,
        toUserCode: code
      });

      notify({ type: 'success', message: 'Workout buddy added! 🤝' });
      setShowEnterCode(false);
    } catch (error: any) {
      notify({ type: 'error', message: error.message || 'Failed to add buddy' });
    }
  };


  return (
    <div className="w-full max-w-lg mx-auto px-4 pt-4 pb-[calc(5rem+env(safe-area-inset-bottom))] animate-fade-in flex-1">
      {/* Header */}
      <header className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-1">
              Social
            </p>
            <h1 className="text-[22px] font-bold text-[var(--text-primary)] leading-tight">
              Workout Buddies
            </h1>
          </div>

          <button
            onClick={() => setShowEnterCode(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] text-white rounded-xl font-bold text-[13px] hover:shadow-lg transition-all active:scale-95"
          >
            <PlusIcon className="w-4 h-4" />
            Add Buddy
          </button>
        </div>
      </header>

      <main className="space-y-4">
        {/* Empty State */}
        {(!buddies || buddies.length === 0) && (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary-light)] to-[var(--accent-light)] flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h3 className="text-[18px] font-bold text-[var(--text-primary)] mb-2">
                No Workout Buddies Yet
              </h3>
              <p className="text-[14px] text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
                Add a workout buddy to share plans, compare PRs, and stay accountable together!
              </p>
              <Button
                onClick={() => setShowEnterCode(true)}
                variant="accent"
                className="shadow-md"
              >
                <PlusIcon className="w-4 h-4" />
                Add Your First Buddy
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Buddies List */}
        {buddies && buddies.length > 0 && (
          <>
            <Card>
              <CardHeader className="border-b border-[var(--border)] p-4">
                <h3 className="text-[15px] font-bold text-[var(--text-primary)]">
                  Your Buddies ({buddies.length})
                </h3>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {buddies.map((buddy, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-[var(--surface-secondary)] rounded-xl hover:bg-[var(--surface-hover)] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-bold">
                        {buddy.buddyId.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-[var(--text-primary)]">
                          Workout Buddy
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          Connected {new Date(buddy.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedBuddy(selectedBuddy === buddy.buddyId ? null : buddy.buddyId)}
                        className="p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--primary-light)] transition-all"
                      >
                        <SettingsIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                      </button>
                      <button
                        onClick={() => handleRemoveBuddy(buddy.buddyId)}
                        className="p-2 rounded-lg bg-[var(--error-light)] hover:bg-[var(--error)] hover:text-white transition-all"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tabs for PR Comparison vs Recent Workouts */}
            {buddies.length > 0 && (
              <div>
                {buddies.map((buddy, i) => (
                  <div key={i} className="mb-6">
                    <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-3 px-1">
                      Buddy {i + 1}
                    </h3>

                    {/* PR Comparison */}
                    <div className="mb-4">
                      <p className="text-[12px] text-[var(--text-secondary)] mb-2 px-1 flex items-center gap-1.5">
                        <span>🏆</span> PR Comparison
                      </p>
                      <BuddyComparisonCard
                        userId={userId!}
                        buddyId={buddy.buddyId}
                        buddyName={`Buddy ${i + 1}`}
                      />
                    </div>

                    {/* Recent Workout Logs */}
                    <div>
                      <p className="text-[12px] text-[var(--text-secondary)] mb-2 px-1 flex items-center gap-1.5">
                        <span>📋</span> Recent Workouts
                      </p>
                      <BuddyWorkoutLog
                        userId={userId!}
                        buddyId={buddy.buddyId}
                        buddyName={`Buddy ${i + 1}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Dialogs */}
      <EnterCodeDialog
        isOpen={showEnterCode}
        onClose={() => setShowEnterCode(false)}
        onCodeEntered={handleCodeEntered}
      />
    </div>
  );
}
