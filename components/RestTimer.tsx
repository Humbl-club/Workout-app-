import React, { useState, useEffect, useRef } from 'react';
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
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 animate-scale-in" style={{ boxShadow: 'var(--shadow-lg)' }}>
      <div className="relative w-full aspect-square max-w-xs mx-auto flex flex-col items-center justify-center text-center">
        <svg className="absolute w-full h-full" viewBox="0 0 140 140">
            <circle
                className="text-[var(--surface-secondary)]"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                r={radius}
                cx="70"
                cy="70"
            />
            <circle
                className="text-[var(--accent)]"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                r={radius}
                cx="70"
                cy="70"
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset,
                    transition: 'stroke-dashoffset 1s linear',
                    filter: 'drop-shadow(var(--glow-red))'
                }}
            />
        </svg>
        <div className="z-10">
            <p className="text-[11px] font-bold text-[var(--text-tertiary)] tracking-widest uppercase mb-2">Rest</p>
            <p className="font-syne text-7xl font-bold text-[var(--text-primary)] mb-4">{timeLeft}</p>
            <p className="text-[13px] text-[var(--text-secondary)]">Get ready for next set</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-8">
           <button onClick={handleAddTime} className="flex items-center gap-2 px-5 py-3 bg-[var(--surface-secondary)] text-[var(--text-primary)] text-[14px] font-semibold rounded-lg hover:bg-[var(--surface-hover)] transition">
              <PlusIcon className="w-4 h-4" /> +15s
          </button>
           <button onClick={handleSkip} className="flex items-center gap-2 px-5 py-3 bg-[var(--accent)] text-white text-[14px] font-semibold rounded-lg hover:bg-[var(--accent-hover)] transition" style={{ boxShadow: 'var(--glow-red)' }}>
              Skip <ForwardIcon className="w-4 h-4" />
          </button>
      </div>
    </div>
  );
}
