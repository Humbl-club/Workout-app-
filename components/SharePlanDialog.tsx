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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <Card className="w-full max-w-md shadow-elevated animate-scale-in">
        <CardHeader className="border-b border-[var(--border)] p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center">
                <ShareIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-[var(--text-primary)]">
                  Share Your Plan
                </h3>
                <p className="text-[12px] text-[var(--text-secondary)]">
                  Train together with a buddy
                </p>
              </div>
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
          {/* Plan Info */}
          <div className="mb-6 p-4 bg-[var(--surface-secondary)] rounded-xl">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
              Plan to Share
            </p>
            <p className="text-[16px] font-bold text-[var(--text-primary)]">
              {planName}
            </p>
          </div>

          {!shareCode ? (
            <>
              <p className="text-[14px] text-[var(--text-secondary)] mb-6 leading-relaxed">
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
              <div className="mb-6">
                <p className="text-[12px] text-[var(--text-secondary)] mb-3">
                  Share this code with your workout buddy:
                </p>

                {/* Share Code Display */}
                <div className="relative">
                  <div className="p-6 bg-gradient-to-br from-[var(--primary-light)] to-[var(--accent-light)] border-2 border-[var(--primary)]/30 rounded-2xl text-center">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold mb-2">
                      Share Code
                    </p>
                    <p className="text-3xl font-black text-[var(--primary)] font-mono tracking-wider">
                      {shareCode}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-2">
                      Expires in 7 days
                    </p>
                  </div>

                  {copied && (
                    <div className="absolute -top-2 -right-2 px-3 py-1 bg-[var(--success)] text-white text-[11px] font-bold rounded-full shadow-lg animate-scale-in">
                      ✓ Copied!
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
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
              <div className="mt-4 p-3 bg-[var(--accent-light)] border border-[var(--accent)]/20 rounded-xl">
                <p className="text-[12px] text-[var(--text-primary)] leading-relaxed">
                  💡 Your buddy will get an exact copy of this plan.
                  You'll both be able to compare PRs and see each other's progress!
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
