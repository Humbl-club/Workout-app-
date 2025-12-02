import React from 'react';
import { useTranslation } from 'react-i18next';

export default function FullScreenLoader() {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 bg-[var(--background-primary)] flex flex-col items-center justify-center z-50"
      role="status"
      aria-busy="true"
      aria-label="Loading application"
    >
      {/* Logo - smaller and cleaner */}
      <div className="relative z-10 mb-8">
        <div className="font-display text-5xl sm:text-6xl font-black tracking-tight">
          <span
            className="text-[var(--text-primary)] inline-block animate-fade-in-up"
            style={{ animationDelay: '0ms' }}
          >
            RE
          </span>
          <span
            className="text-[var(--accent)] inline-block animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            BLD
          </span>
        </div>
      </div>

      {/* Simple spinner */}
      <div className="relative w-12 h-12 mb-6">
        {/* Track */}
        <div className="absolute inset-0 rounded-full border-[3px] border-[var(--surface-secondary)]" />

        {/* Spinner arc */}
        <svg
          className="absolute inset-0 w-full h-full animate-spin"
          style={{ animationDuration: '1s' }}
          viewBox="0 0 48 48"
        >
          <circle
            cx="24"
            cy="24"
            r="21"
            stroke="var(--accent)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="66 132"
          />
        </svg>
      </div>

      {/* Loading text */}
      <p
        className="text-[14px] text-[var(--text-secondary)] font-medium animate-fade-in"
        style={{ animationDelay: '200ms' }}
      >
        {t('common.loading')}
      </p>

      {/* Step dots */}
      <div
        className="flex items-center gap-2 mt-4 animate-fade-in"
        style={{ animationDelay: '300ms' }}
      >
        <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-[var(--surface-secondary)]" />
        <div className="w-2 h-2 rounded-full bg-[var(--surface-secondary)]" />
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading your workouts, please wait...</span>
    </div>
  );
}
