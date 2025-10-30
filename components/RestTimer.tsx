import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, ForwardIcon } from './icons';

interface RestTimerProps {
  duration: number; // in seconds
  onFinish: () => void;
  timerKey: number;
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

export default function RestTimer({ duration, onFinish, timerKey }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset timer when key changes
    setTimeLeft(duration);
  }, [timerKey, duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      playNotificationSound();
      onFinish();
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
  }, [timeLeft, onFinish]);
  
  const handleAddTime = () => {
      setTimeLeft(prev => prev + 15);
  };
  
  const handleSkip = () => {
      setTimeLeft(0);
  };
  
  const progress = (timeLeft / duration);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-80 h-80 flex flex-col items-center justify-center text-center">
        <svg className="absolute w-full h-full" viewBox="0 0 140 140">
            <circle
                className="text-stone-800"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                r={radius}
                cx="70"
                cy="70"
            />
            <circle
                className="text-red-500"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                r={radius}
                cx="70"
                cy="70"
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset,
                    transition: 'stroke-dashoffset 1s linear'
                }}
            />
        </svg>
        <div className="z-10">
            <p className="text-sm font-bold text-stone-400 tracking-widest">REST</p>
            <p className="font-syne text-7xl font-extrabold text-white my-2">{timeLeft}</p>
            <div className="flex items-center justify-center gap-4">
                 <button onClick={handleAddTime} className="flex items-center gap-1.5 px-4 py-2 bg-stone-800/50 text-stone-200 text-sm font-semibold rounded-full hover:bg-stone-700/50 transition">
                    <PlusIcon className="w-4 h-4" /> +15s
                </button>
                 <button onClick={handleSkip} className="flex items-center gap-1.5 px-4 py-2 bg-stone-800/50 text-stone-200 text-sm font-semibold rounded-full hover:bg-stone-700/50 transition">
                    Skip <ForwardIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}