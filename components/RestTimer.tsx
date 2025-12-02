import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, ForwardIcon } from './icons';

interface RestTimerProps {
  duration: number; // in seconds
  onComplete?: () => void;
  onFinish?: () => void;
  onSkip?: () => void;
  timerKey?: number;
  mute?: boolean;
  vibrate?: boolean;
}

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const playNotificationSound = () => {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
};

export default function RestTimer({ duration, onComplete, onFinish, onSkip, timerKey, mute = false, vibrate = false }: RestTimerProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset timer when key changes
    setTimeLeft(duration);
  }, [timerKey, duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!mute) playNotificationSound();
      if (vibrate && typeof navigator !== 'undefined' && typeof (navigator as any).vibrate === 'function') {
        try { (navigator as any).vibrate(200); } catch {}
      }
      if (onComplete) onComplete();
      if (onFinish) onFinish();
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeLeft, onComplete, onFinish]);

  const handleAddTime = () => {
      setTimeLeft(prev => prev + 15);
  };

  const handleSkip = () => {
      if (onSkip) onSkip();
      setTimeLeft(0);
  };
  
  const progress = (timeLeft / duration);
  const radius = 36; // 60% smaller (was 60)
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border-card)] rounded-3xl p-6 sm:p-8 animate-scale-in shadow-lg">
      {/* Timer circle */}
      <div className="relative w-full max-w-[240px] aspect-square mx-auto mb-6">
        {/* SVG timer with gradient */}
        <svg className="relative w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-[var(--surface-secondary)]"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
          />
          {/* Progress circle with gradient */}
          <circle
            stroke="url(#timer-gradient)"
            strokeWidth="6"
            fill="transparent"
            r={radius}
            cx="50"
            cy="50"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeDashoffset,
              transition: 'stroke-dashoffset 1s linear'
            }}
          />
          <defs>
            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="50%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--accent-cardio)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
            {t('session.rest')}
          </p>
          <p className="text-6xl sm:text-7xl font-black text-[var(--text-primary)] tabular-nums stat-number">
            {timeLeft}
          </p>
          <p className="text-[13px] text-[var(--text-secondary)] mt-2 font-medium">
            {t('session.getReady')}
          </p>

          {/* Breathing indicator in final 5 seconds */}
          {timeLeft <= 5 && timeLeft > 0 && (
            <div className="mt-4 flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[var(--accent)]"
                  style={{
                    animation: 'breathe 2s ease-in-out infinite',
                    animationDelay: `${i * 0.3}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddTime}
          className="flex-1 flex items-center justify-center gap-2 h-12 px-4 bg-[var(--surface-secondary)] text-[var(--text-primary)] text-[14px] font-semibold rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-all active:scale-95"
        >
          <PlusIcon className="w-4 h-4" />
          {t('workout.add15s')}
        </button>

        <button
          onClick={handleSkip}
          className="flex-[2] flex items-center justify-center gap-2 h-12 px-5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[14px] font-bold rounded-xl transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md"
        >
          {t('session.skip')}
          <ForwardIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
