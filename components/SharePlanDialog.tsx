import React, { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';
import { XMarkIcon, CheckCircleIcon } from './icons';
import { Share2 as ShareIcon } from 'lucide-react';
import { notify } from './layout/Toast';
import { cn } from '../lib/utils';
import { analytics, EventTypes } from '../services/analyticsService';

interface SharePlanDialogProps {
  planId: Id<"workoutPlans">;
  planName: string;
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SharePlanDialog({ planId, planName, userId, isOpen, onClose }: SharePlanDialogProps) {
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const createShareCodeMutation = useMutation(api.buddyMutations.createShareCode);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const result = await createShareCodeMutation({
        planId,
        userId
      });
      setShareCode(result.shareCode);

      // Track plan shared
      analytics.track(EventTypes.PLAN_SHARED, {
        planName,
        shareCode: result.shareCode,
        expiresIn_days: 7,
      });

      notify({ type: 'success', message: 'Share code generated!' });
    } catch (error) {
      notify({ type: 'error', message: 'Failed to generate share code' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (shareCode) {
      navigator.clipboard.writeText(shareCode);
      setCopied(true);
      notify({ type: 'success', message: 'Code copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (shareCode && navigator.share) {
      try {
        await navigator.share({
          title: 'Join my workout plan on REBLD!',
          text: `I'm following "${planName}" on REBLD. Join me!\n\nShare Code: ${shareCode}\n\nDownload REBLD and enter this code to follow the same plan!`,
          url: window.location.origin
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      handleCopyCode();
    }
  };

  if (!isOpen) return null;

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
            <div className="flex items-center gap-[var(--space-3)]">
              <div className={cn(
                'w-10 h-10',
                'rounded-full',
                'bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-primary-hover)]',
                'flex items-center justify-center'
              )}>
                <ShareIcon className="w-5 h-5 text-[var(--text-on-brand)]" />
              </div>
              <div>
                <h3 className={cn(
                  'text-[var(--text-lg)]',
                  'font-[var(--weight-bold)]',
                  'text-[var(--text-primary)]'
                )}>
                  Share Your Plan
                </h3>
                <p className={cn(
                  'text-[var(--text-xs)]',
                  'text-[var(--text-secondary)]'
                )}>
                  Train together with a buddy
                </p>
              </div>
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
          {/* Plan Info */}
          <div className={cn(
            'mb-[var(--space-6)]',
            'p-[var(--space-4)]',
            'bg-[var(--surface-secondary)]',
            'rounded-[var(--radius-xl)]'
          )}>
            <p className={cn(
              'text-[var(--text-2xs)]',
              'uppercase tracking-[var(--tracking-wider)]',
              'text-[var(--text-tertiary)]',
              'font-[var(--weight-bold)]',
              'mb-[var(--space-1)]'
            )}>
              Plan to Share
            </p>
            <p className={cn(
              'text-[var(--text-md)]',
              'font-[var(--weight-bold)]',
              'text-[var(--text-primary)]'
            )}>
              {planName}
            </p>
          </div>

          {!shareCode ? (
            <>
              <p className={cn(
                'text-[var(--text-sm)]',
                'text-[var(--text-secondary)]',
                'mb-[var(--space-6)]',
                'leading-relaxed'
              )}>
                Generate a share code to let your workout buddy follow the same plan.
                They'll get an exact copy and you can compare progress!
              </p>

              <Button
                onClick={handleGenerateCode}
                loading={isGenerating}
                variant="accent"
                className="w-full h-14"
              >
                <ShareIcon className="w-5 h-5" />
                Generate Share Code
              </Button>
            </>
          ) : (
            <>
              <div className="mb-[var(--space-6)]">
                <p className={cn(
                  'text-[var(--text-xs)]',
                  'text-[var(--text-secondary)]',
                  'mb-[var(--space-3)]'
                )}>
                  Share this code with your workout buddy:
                </p>

                {/* Share Code Display */}
                <div className="relative">
                  <div className={cn(
                    'p-[var(--space-6)]',
                    'bg-gradient-to-br from-[var(--brand-primary-subtle)] to-[var(--surface-secondary)]',
                    'border-2 border-[var(--brand-primary)]/30',
                    'rounded-[var(--radius-2xl)]',
                    'text-center'
                  )}>
                    <p className={cn(
                      'text-[var(--text-2xs)]',
                      'uppercase tracking-[var(--tracking-widest)]',
                      'text-[var(--text-tertiary)]',
                      'font-[var(--weight-bold)]',
                      'mb-[var(--space-2)]'
                    )}>
                      Share Code
                    </p>
                    <p className={cn(
                      'text-3xl',
                      'font-[var(--weight-black)]',
                      'text-[var(--brand-primary)]',
                      'font-mono tracking-wider'
                    )}>
                      {shareCode}
                    </p>
                    <p className={cn(
                      'text-[var(--text-2xs)]',
                      'text-[var(--text-secondary)]',
                      'mt-[var(--space-2)]'
                    )}>
                      Expires in 7 days
                    </p>
                  </div>

                  {copied && (
                    <div className={cn(
                      'absolute -top-2 -right-2',
                      'px-[var(--space-3)] py-[var(--space-1)]',
                      'bg-[var(--status-success-bg)]',
                      'text-[var(--text-on-brand)]',
                      'text-[var(--text-2xs)]',
                      'font-[var(--weight-bold)]',
                      'rounded-full',
                      'shadow-[var(--shadow-lg)]',
                      'animate-scale-in'
                    )}>
                      ✓ Copied!
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-[var(--space-2)]">
                <Button
                  onClick={handleShare}
                  variant="accent"
                  className="w-full h-12"
                >
                  <ShareIcon className="w-4 h-4" />
                  {navigator.share ? 'Share Code' : 'Copy Code'}
                </Button>

                <Button
                  onClick={handleCopyCode}
                  variant="ghost"
                  className="w-full h-10"
                >
                  Copy to Clipboard
                </Button>
              </div>

              {/* Info */}
              <div className={cn(
                'mt-[var(--space-4)]',
                'p-[var(--space-3)]',
                'bg-[var(--surface-secondary)]',
                'rounded-[var(--radius-xl)]'
              )}>
                <p className={cn(
                  'text-[var(--text-xs)]',
                  'text-[var(--text-secondary)]',
                  'leading-relaxed'
                )}>
                  Your buddy will get an exact copy of this plan.
                  You'll both be able to compare PRs and see each other's progress.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
