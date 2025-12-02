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
import { analytics, EventTypes } from '../services/analyticsService';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '../components/ui/PullToRefreshIndicator';

/* ═══════════════════════════════════════════════════════════════
   BUDDIES PAGE - Phase 9.4 Page Redesign

   Social features and workout buddy management.
   Uses design tokens for consistent styling.
   ═══════════════════════════════════════════════════════════════ */

export default function BuddiesPage() {
  const { user } = useUser();
  const userId = user?.id || null;

  const [showEnterCode, setShowEnterCode] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<string | null>(null);

  // Pull-to-refresh
  const handleRefresh = async () => {
    // Convex queries auto-refresh, just add delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));
  };

  const { pullDistance, isRefreshing, isTriggered } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  const buddies = useQuery(
    api.buddyQueries.getWorkoutBuddies,
    userId ? { userId } : 'skip'
  );

  const removeBuddyMutation = useMutation(api.buddyMutations.removeBuddy);
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
        toUserCode: code,
      });

      // Track buddy request sent
      analytics.track(EventTypes.BUDDY_REQUEST_SENT, {
        buddyUserCode: code,
      });

      notify({ type: 'success', message: 'Workout buddy added' });
      setShowEnterCode(false);
    } catch (error: any) {
      notify({ type: 'error', message: error.message || 'Failed to add buddy' });
    }
  };

  return (
    <>
      {/* Pull-to-refresh indicator */}
      <PullToRefreshIndicator
        distance={pullDistance}
        isTriggered={isTriggered}
        isRefreshing={isRefreshing}
      />

      <div
        className={cn(
          'w-full max-w-lg mx-auto',
          'px-[var(--space-4)]',
          'pt-[max(var(--space-4),env(safe-area-inset-top))]',
          'pb-[calc(var(--height-tab-bar)+var(--space-6)+env(safe-area-inset-bottom))]',
          'animate-fade-in',
          'flex-1'
        )}
      >
      {/* Header */}
      <header className="mb-[var(--space-5)]">
        <div
          className={cn(
            'flex items-center justify-between',
            'mb-[var(--space-3)]'
          )}
        >
          <div>
            <p
              className={cn(
                'text-[var(--text-2xs)]',
                'uppercase tracking-[var(--tracking-wider)]',
                'text-[var(--text-tertiary)]',
                'font-[var(--weight-semibold)]',
                'mb-[var(--space-1)]'
              )}
            >
              Social
            </p>
            <h1
              className={cn(
                'text-[var(--text-xl)]',
                'font-[var(--weight-bold)]',
                'text-[var(--text-primary)]',
                'leading-tight'
              )}
            >
              Workout Buddies
            </h1>
          </div>

          <button
            onClick={() => setShowEnterCode(true)}
            className={cn(
              'flex items-center gap-[var(--space-2)]',
              'px-[var(--space-4)] py-[var(--space-2-5)]',
              'bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary-hover)]',
              'text-[var(--text-on-brand)]',
              'rounded-[var(--radius-xl)]',
              'font-[var(--weight-bold)]',
              'text-[var(--text-sm)]',
              'hover:shadow-[var(--shadow-md)]',
              'transition-all duration-[var(--duration-fast)]',
              'active:scale-95'
            )}
          >
            <PlusIcon className="w-4 h-4" />
            Add Buddy
          </button>
        </div>
      </header>

      <main className="space-y-[var(--space-4)]">
        {/* Empty State */}
        {(!buddies || buddies.length === 0) && (
          <Card className="text-center py-[var(--space-8)]">
            <CardContent className="pt-[var(--space-6)]">
              <div
                className={cn(
                  'w-16 h-16',
                  'rounded-full',
                  'bg-gradient-to-br from-[var(--brand-primary-subtle)] to-[var(--surface-secondary)]',
                  'flex items-center justify-center',
                  'mx-auto',
                  'mb-[var(--space-4)]'
                )}
              >
                <UsersIcon className="w-8 h-8 text-[var(--brand-primary)]" />
              </div>
              <h3
                className={cn(
                  'text-[var(--text-lg)]',
                  'font-[var(--weight-bold)]',
                  'text-[var(--text-primary)]',
                  'mb-[var(--space-2)]'
                )}
              >
                No Workout Buddies Yet
              </h3>
              <p
                className={cn(
                  'text-[var(--text-sm)]',
                  'text-[var(--text-secondary)]',
                  'mb-[var(--space-6)]',
                  'max-w-sm mx-auto'
                )}
              >
                Add a workout buddy to share plans, compare PRs, and stay accountable together!
              </p>
              <Button
                onClick={() => setShowEnterCode(true)}
                variant="accent"
                className="shadow-[var(--shadow-md)]"
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
              <CardHeader
                className={cn(
                  'border-b border-[var(--border-default)]',
                  'p-[var(--space-4)]'
                )}
              >
                <h3
                  className={cn(
                    'text-[var(--text-base)]',
                    'font-[var(--weight-bold)]',
                    'text-[var(--text-primary)]'
                  )}
                >
                  Your Buddies ({buddies.length})
                </h3>
              </CardHeader>
              <CardContent className="p-[var(--space-4)] space-y-[var(--space-3)]">
                {buddies.map((buddy, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-between',
                      'p-[var(--space-3)]',
                      'bg-[var(--surface-secondary)]',
                      'rounded-[var(--radius-xl)]',
                      'hover:bg-[var(--surface-hover)]',
                      'transition-all duration-[var(--duration-fast)]'
                    )}
                  >
                    <div className="flex items-center gap-[var(--space-3)]">
                      <div
                        className={cn(
                          'w-10 h-10',
                          'rounded-full',
                          'bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary-hover)]',
                          'flex items-center justify-center',
                          'text-[var(--text-on-brand)]',
                          'font-[var(--weight-bold)]'
                        )}
                      >
                        {buddy.buddyId.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p
                          className={cn(
                            'text-[var(--text-sm)]',
                            'font-[var(--weight-bold)]',
                            'text-[var(--text-primary)]'
                          )}
                        >
                          Workout Buddy
                        </p>
                        <p
                          className={cn(
                            'text-[var(--text-2xs)]',
                            'text-[var(--text-secondary)]'
                          )}
                        >
                          Connected {new Date(buddy.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-[var(--space-2)]">
                      <button
                        onClick={() =>
                          setSelectedBuddy(selectedBuddy === buddy.buddyId ? null : buddy.buddyId)
                        }
                        className={cn(
                          'p-[var(--space-2)]',
                          'rounded-[var(--radius-lg)]',
                          'bg-[var(--surface-primary)]',
                          'hover:bg-[var(--brand-primary-subtle)]',
                          'transition-all duration-[var(--duration-fast)]'
                        )}
                      >
                        <SettingsIcon className="w-4 h-4 text-[var(--text-secondary)]" />
                      </button>
                      <button
                        onClick={() => handleRemoveBuddy(buddy.buddyId)}
                        className={cn(
                          'p-[var(--space-2)]',
                          'rounded-[var(--radius-lg)]',
                          'bg-[var(--status-error-bg)]/10',
                          'hover:bg-[var(--status-error-bg)]',
                          'hover:text-[var(--text-on-brand)]',
                          'transition-all duration-[var(--duration-fast)]'
                        )}
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
                  <div key={i} className="mb-[var(--space-6)]">
                    <h3
                      className={cn(
                        'text-[var(--text-base)]',
                        'font-[var(--weight-bold)]',
                        'text-[var(--text-primary)]',
                        'mb-[var(--space-3)]',
                        'px-[var(--space-1)]'
                      )}
                    >
                      Buddy {i + 1}
                    </h3>

                    {/* PR Comparison */}
                    <div className="mb-[var(--space-4)]">
                      <p
                        className={cn(
                          'text-[var(--text-2xs)]',
                          'text-[var(--text-tertiary)]',
                          'mb-[var(--space-2)]',
                          'px-[var(--space-1)]',
                          'font-[var(--weight-bold)]',
                          'uppercase tracking-[var(--tracking-wider)]'
                        )}
                      >
                        PR Comparison
                      </p>
                      <BuddyComparisonCard
                        userId={userId!}
                        buddyId={buddy.buddyId}
                        buddyName={`Buddy ${i + 1}`}
                      />
                    </div>

                    {/* Recent Workout Logs */}
                    <div>
                      <p
                        className={cn(
                          'text-[var(--text-2xs)]',
                          'text-[var(--text-tertiary)]',
                          'mb-[var(--space-2)]',
                          'px-[var(--space-1)]',
                          'font-[var(--weight-bold)]',
                          'uppercase tracking-[var(--tracking-wider)]'
                        )}
                      >
                        Recent Workouts
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
    </>
  );
}
