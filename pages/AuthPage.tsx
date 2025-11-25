import React from 'react';
import { useTranslation } from 'react-i18next';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { LogoIcon } from '../components/icons';
import { clerkAppearance } from '../config/clerkAppearance';

export default function AuthPage() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = React.useState(true);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 -z-10 gradient-mesh opacity-60" />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full blur-[140px] opacity-20 animate-pulse-subtle" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--accent)] rounded-full blur-[120px] opacity-20 animate-pulse-subtle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[var(--accent-cardio)] rounded-full blur-[100px] opacity-15 animate-pulse-subtle" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative w-full max-w-md space-y-8">
        {/* Premium logo presentation */}
        <div className="text-center animate-fade-in-down">
          {/* Logo with glow */}
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] opacity-20 blur-2xl rounded-full" />
            <div className="relative font-display text-6xl font-black logo-spacing">
              <span className="text-[var(--text-primary)]">RE</span>
              <span className="text-[var(--accent)]">BLD</span>
            </div>
          </div>

          <p className="text-[17px] text-[var(--text-secondary)] font-semibold animate-fade-in leading-relaxed" style={{ animationDelay: '200ms' }}>
            {t('home.tagline')}
          </p>
          <p className="text-[13px] text-[var(--text-tertiary)] mt-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
            Your AI-powered training partner
          </p>
        </div>

        {/* Premium glass container */}
        <div className="card-glass rounded-3xl p-6 shadow-elevated animate-scale-in" style={{ animationDelay: '400ms' }}>
          {/* Enhanced tab switcher */}
          <div className="flex gap-2 mb-6 p-1.5 bg-[var(--surface-secondary)] rounded-2xl">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 px-6 py-3 rounded-xl font-bold text-[15px] transition-all ${
                isLogin
                  ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-md scale-105'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t('auth.signIn')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 px-6 py-3 rounded-xl font-bold text-[15px] transition-all ${
                !isLogin
                  ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-md scale-105'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
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

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-[var(--text-tertiary)] animate-fade-in" style={{ animationDelay: '600ms' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            Secure
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
            AI-Powered
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            Free to Start
          </span>
        </div>
      </div>
    </div>
  );
}
