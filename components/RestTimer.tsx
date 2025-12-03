import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PlusIcon, ForwardIcon } from './icons';
import { useHaptic } from '../hooks/useAnimations';
import { cn } from '../lib/utils';

/* ═══════════════════════════════════════════════════════════════
   REST TIMER - 60fps Smooth Animation

   Uses requestAnimationFrame for buttery smooth countdown.
   Animated circular progress with gradient stroke.
   Haptic feedback at key moments.
   ═══════════════════════════════════════════════════════════════ */

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
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

export default function RestTimer({
  duration,
  onComplete,
  onFinish,
  onSkip,
  timerKey,
  mute = false,
  vibrate = true,
}: RestTimerProps) {
  const { t } = useTranslation();
  const haptic = useHaptic();

  // Use milliseconds for smooth animation
  const [timeLeftMs, setTimeLeftMs] = useState(duration * 1000);
  const [isComplete, setIsComplete] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastSecondRef = useRef(duration);
  const hasPlayedWarningRef = useRef(false);

  // Reset timer when key or duration changes
  useEffect(() => {
    setTimeLeftMs(duration * 1000);
    setIsComplete(false);
    startTimeRef.current = null;
    lastSecondRef.current = duration;
    hasPlayedWarningRef.current = false;
  }, [timerKey, duration]);

  // Smooth animation loop
  useEffect(() => {
    if (isComplete) return;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsedMs = timestamp - startTimeRef.current;
      const remainingMs = Math.max(0, duration * 1000 - elapsedMs);
      const remainingSeconds = Math.ceil(remainingMs / 1000);

      setTimeLeftMs(remainingMs);

      // Haptic feedback for countdown
      if (remainingSeconds !== lastSecondRef.current && remainingSeconds <= 3 && remainingSeconds > 0) {
        haptic.light();
        lastSecondRef.current = remainingSeconds;
      }

      // Warning vibration at 5 seconds
      if (remainingSeconds === 5 && !hasPlayedWarningRef.current) {
        haptic.medium();
        hasPlayedWarningRef.current = true;
      }

      // Timer complete
      if (remainingMs <= 0) {
        setIsComplete(true);
        if (!mute) playNotificationSound();
        if (vibrate) haptic.success();
        onComplete?.();
        onFinish?.();
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [duration, isComplete, mute, vibrate, onComplete, onFinish, haptic]);

  const handleAddTime = useCallback(() => {
    haptic.light();
    // Add 15 seconds
    const additionalMs = 15000;
    setTimeLeftMs(prev => prev + additionalMs);
    // Adjust the start time to account for added time
    if (startTimeRef.current) {
      startTimeRef.current -= additionalMs;
    }
  }, [haptic]);

  const handleSkip = useCallback(() => {
    haptic.medium();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    onSkip?.();
  }, [haptic, onSkip]);

  // Convert ms to display seconds
  const timeLeftSeconds = Math.ceil(timeLeftMs / 1000);

  // Progress for animation (0-1, where 1 is full)
  const progress = timeLeftMs / (duration * 1000);

  // Circle measurements
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  // Format time display
  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return seconds.toString();
  };

  return (
    <div className={cn(
      "bg-[var(--surface-primary)]",
      "border border-[var(--border-default)]",
      "rounded-[var(--radius-3xl)]",
      "p-[var(--space-6)]",
      "shadow-[var(--shadow-lg)]",
      "animate-scale-in"
    )}>
      {/* Timer circle */}
      <div className="relative w-48 h-48 mx-auto mb-[var(--space-6)]">
        {/* SVG timer with smooth animation */}
        <svg
          className="w-full h-full transform -rotate-90"
          viewBox="0 0 100 100"
          style={{ willChange: 'transform' }}
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--surface-secondary)"
            strokeWidth="6"
          />
          {/* Progress circle with gradient */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="url(#timer-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              // No transition - RAF handles smooth updates
            }}
          />
          <defs>
            <linearGradient id="timer-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--brand-primary)" />
              <stop offset="50%" stopColor="var(--brand-secondary)" />
              <stop offset="100%" stopColor="var(--workout-cardio)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[var(--text-xs)] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-[var(--space-2)]">
            {t('session.rest')}
          </p>
          <p className={cn(
            "font-black text-[var(--text-primary)] tabular-nums",
            timeLeftSeconds >= 60 ? "text-5xl" : "text-6xl"
          )}>
            {formatTime(timeLeftSeconds)}
          </p>
          <p className="text-[var(--text-sm)] text-[var(--text-secondary)] mt-[var(--space-2)] font-medium">
            {timeLeftSeconds <= 3 ? t('session.almostThere') : t('session.getReady')}
          </p>

          {/* Breathing indicator in final 5 seconds */}
          {timeLeftSeconds <= 5 && timeLeftSeconds > 0 && (
            <div className="mt-[var(--space-3)] flex gap-[var(--space-1-5)]">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[var(--brand-primary)] animate-breathe"
                  style={{ animationDelay: `${i * 300}ms` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-[var(--space-3)]">
        <button
          onClick={handleAddTime}
          className={cn(
            "flex-1 flex items-center justify-center gap-[var(--space-2)]",
            "h-14 px-[var(--space-4)]",
            "bg-[var(--surface-secondary)]",
            "text-[var(--text-primary)]",
            "text-[var(--text-sm)] font-semibold",
            "rounded-[var(--radius-xl)]",
            "border border-[var(--border-default)]",
            "active:scale-95",
            "transition-transform duration-[var(--duration-fast)]"
          )}
        >
          <PlusIcon className="w-4 h-4" />
          {t('workout.add15s')}
        </button>

        <button
          onClick={handleSkip}
          className={cn(
            "flex-[2] flex items-center justify-center gap-[var(--space-2)]",
            "h-14 px-[var(--space-5)]",
            "bg-[var(--brand-primary)]",
            "text-white",
            "text-[var(--text-sm)] font-bold",
            "rounded-[var(--radius-xl)]",
            "shadow-[var(--shadow-sm)]",
            "active:scale-[0.98]",
            "transition-transform duration-[var(--duration-fast)]"
          )}
        >
          {t('session.skip')}
          <ForwardIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
