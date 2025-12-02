import React from 'react';
import { useTranslation } from 'react-i18next';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { clerkAppearance } from '../config/clerkAppearance';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════════════════════════
   AUTH PAGE - Phase 9.4 Page Redesign

   Authentication page with sign in/sign up tabs.
   Uses design tokens for consistent styling.
   ═══════════════════════════════════════════════════════════════ */

export default function AuthPage() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = React.useState(false); // Default to Sign Up for better conversion

  return (
    <div
      className={cn(
        'w-full min-h-screen',
        'flex flex-col items-center justify-center',
        'px-[var(--space-4)]',
        'pt-[max(var(--space-4),env(safe-area-inset-top))]',
        'pb-[max(var(--space-4),env(safe-area-inset-bottom))]',
        'bg-[var(--bg-primary)]'
      )}
    >
      <div className="relative w-full max-w-md space-y-[var(--space-8)]">
        {/* Logo */}
        <div className="text-center animate-fade-in-down">
          <div className="mb-[var(--space-6)]">
            <div className="font-display text-[4rem] font-[var(--weight-black)] logo-spacing">
              <span className="text-[var(--text-primary)]">RE</span>
              <span className="text-[var(--brand-primary)]">BLD</span>
            </div>
          </div>

          <p
            className={cn(
              'text-[var(--text-md)]',
              'text-[var(--text-secondary)]',
              'font-[var(--weight-semibold)]',
              'animate-fade-in',
              'leading-relaxed'
            )}
            style={{ animationDelay: '200ms' }}
          >
            {t('home.tagline')}
          </p>
          <p
            className={cn(
              'text-[var(--text-sm)]',
              'text-[var(--text-tertiary)]',
              'mt-[var(--space-2)]',
              'animate-fade-in'
            )}
            style={{ animationDelay: '300ms' }}
          >
            Your AI-powered training partner
          </p>
        </div>

        {/* Auth container */}
        <div
          className={cn(
            'bg-[var(--surface-primary)]',
            'border border-[var(--border-default)]',
            'rounded-[var(--radius-2xl)]',
            'p-[var(--space-6)]',
            'shadow-[var(--shadow-lg)]',
            'animate-scale-in'
          )}
          style={{ animationDelay: '400ms' }}
        >
          {/* Tab switcher */}
          <div
            className={cn(
              'flex gap-[var(--space-2)]',
              'mb-[var(--space-6)]',
              'p-[var(--space-1-5)]',
              'bg-[var(--surface-secondary)]',
              'rounded-[var(--radius-2xl)]'
            )}
          >
            <button
              onClick={() => setIsLogin(true)}
              className={cn(
                'flex-1',
                'px-[var(--space-6)] py-[var(--space-3)]',
                'rounded-[var(--radius-xl)]',
                'font-[var(--weight-bold)]',
                'text-[var(--text-base)]',
                'transition-all duration-[var(--duration-fast)]',
                isLogin
                  ? 'bg-[var(--brand-primary)] text-[var(--text-on-brand)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {t('auth.signIn')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={cn(
                'flex-1',
                'px-[var(--space-6)] py-[var(--space-3)]',
                'rounded-[var(--radius-xl)]',
                'font-[var(--weight-bold)]',
                'text-[var(--text-base)]',
                'transition-all duration-[var(--duration-fast)]',
                !isLogin
                  ? 'bg-[var(--brand-primary)] text-[var(--text-on-brand)] shadow-[var(--shadow-sm)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {t('auth.signUp')}
            </button>
          </div>

          {/* Clerk component */}
          <div className="flex justify-center">
            {isLogin ? (
              <SignIn appearance={clerkAppearance as any} />
            ) : (
              <SignUp appearance={clerkAppearance as any} />
            )}
          </div>
        </div>

        {/* Minimal footer text */}
        <p
          className={cn(
            'text-center',
            'text-[var(--text-2xs)]',
            'text-[var(--text-tertiary)]',
            'animate-fade-in'
          )}
          style={{ animationDelay: '600ms' }}
        >
          Intelligent training. Real results.
        </p>
      </div>
    </div>
  );
}
