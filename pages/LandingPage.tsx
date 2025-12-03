import React from 'react';
import { Button } from '../components/ui/button';
import { SparklesIcon } from '../components/icons';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════════════════════════
   LANDING PAGE - iPhone-First Design

   Simple, single-screen landing for mobile app.
   No scrolling required - everything fits in viewport.
   ═══════════════════════════════════════════════════════════════ */

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onPrivacy?: () => void;
  onTerms?: () => void;
}

export default function LandingPage({ onGetStarted, onSignIn, onPrivacy, onTerms }: LandingPageProps) {
  return (
    <div
      className={cn(
        'h-[100dvh]', // Dynamic viewport height - handles iOS safe areas
        'bg-[var(--bg-primary)]',
        'flex flex-col',
        'px-6',
        'pt-[env(safe-area-inset-top)]',
        'pb-[env(safe-area-inset-bottom)]'
      )}
    >
      {/* Header - minimal */}
      <header className="flex items-center justify-between py-4">
        <div className="font-display text-xl font-black tracking-tight">
          <span className="text-[var(--text-primary)]">RE</span>
          <span className="text-[var(--brand-primary)]">BLD</span>
        </div>
        <button
          onClick={onSignIn}
          className={cn(
            'text-sm font-semibold',
            'text-[var(--text-secondary)]',
            'active:text-[var(--text-primary)]',
            'min-h-[44px] min-w-[44px]', // iOS touch target
            'flex items-center justify-center'
          )}
        >
          Sign In
        </button>
      </header>

      {/* Main content - centered */}
      <main className="flex-1 flex flex-col justify-center items-center text-center -mt-8">
        {/* Icon */}
        <div
          className={cn(
            'w-16 h-16',
            'rounded-2xl',
            'bg-[var(--brand-primary-subtle)]',
            'flex items-center justify-center',
            'mb-6'
          )}
        >
          <SparklesIcon className="w-8 h-8 text-[var(--brand-primary)]" />
        </div>

        {/* Title */}
        <h1
          className={cn(
            'font-display',
            'text-3xl font-black',
            'text-[var(--text-primary)]',
            'tracking-tight',
            'mb-3'
          )}
        >
          Your AI Training Partner
        </h1>

        {/* Subtitle */}
        <p
          className={cn(
            'text-base',
            'text-[var(--text-secondary)]',
            'max-w-[280px]',
            'leading-relaxed'
          )}
        >
          Personalized workout plans, intelligent coaching, and progress tracking.
        </p>
      </main>

      {/* Bottom CTA - fixed to bottom */}
      <footer className="pb-4 space-y-4">
        <Button
          onClick={onGetStarted}
          variant="accent"
          className={cn(
            'w-full',
            'h-14', // Larger touch target
            'text-base font-semibold',
            'rounded-2xl'
          )}
        >
          Get Started Free
        </Button>

        <p className="text-center text-sm text-[var(--text-tertiary)]">
          No credit card required
        </p>

        {/* Legal links */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {onPrivacy && (
            <button
              onClick={onPrivacy}
              className="text-xs text-[var(--text-tertiary)] active:text-[var(--text-secondary)]"
            >
              Privacy Policy
            </button>
          )}
          <span className="text-[var(--text-tertiary)]">·</span>
          {onTerms && (
            <button
              onClick={onTerms}
              className="text-xs text-[var(--text-tertiary)] active:text-[var(--text-secondary)]"
            >
              Terms of Service
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
