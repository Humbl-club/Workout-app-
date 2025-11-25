import React from 'react';
import { useTranslation } from 'react-i18next';

export default function FullScreenLoader() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-[var(--background-primary)] flex flex-col items-center justify-center z-50 overflow-hidden">
      {/* Subtle gradient orbs - less prominent */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[var(--primary)] rounded-full blur-[140px] animate-pulse-subtle"></div>
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] bg-[var(--accent)] rounded-full blur-[120px] animate-pulse-subtle" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Logo with stagger animation */}
      <div className="relative z-10 mb-10">
        <div className="font-display text-7xl sm:text-8xl font-black logo-spacing">
          <span className="text-[var(--text-primary)] inline-block animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            RE
          </span>
          <span className="bg-gradient-to-br from-[var(--accent)] via-[var(--accent-hover)] to-[var(--accent-dark)] bg-clip-text text-transparent inline-block animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            BLD
          </span>
        </div>
      </div>

      {/* Refined spinner - cleaner design */}
      <div className="relative w-20 h-20 mb-6">
        {/* Outer subtle ring */}
        <div className="absolute inset-0 rounded-full border-[3px] border-[var(--surface-secondary)]"></div>

        {/* Gradient arc spinner */}
        <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '1.2s' }}>
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="url(#spinner-gradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="70 200"
          />
          <defs>
            <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--accent)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] animate-pulse"></div>
        </div>
      </div>

      <p className="text-[15px] text-[var(--text-secondary)] font-semibold animate-fade-in" style={{ animationDelay: '300ms' }}>
        {t('common.loading')}
      </p>

      {/* Progress bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-[var(--surface-secondary)] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[var(--primary)] via-[var(--accent)] to-[var(--primary)] animate-shimmer"
          style={{ width: '40%', animationDuration: '2s' }}
        ></div>
      </div>
    </div>
  );
}