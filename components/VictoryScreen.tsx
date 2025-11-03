import React, { useEffect, useState } from 'react';
import { WorkoutLog } from '../types';
import { TrophyIcon, TimerIcon, DumbbellIcon, RepeatIcon, CheckCircleIcon } from './icons';
import { useCountUp, useSequentialReveal, useHaptic } from '../hooks/useAnimations';
import { notify } from './layout/Toast';

interface VictoryScreenProps {
  sessionLog: WorkoutLog;
  onDone: () => void;
}

export default function VictoryScreen({ sessionLog, onDone }: VictoryScreenProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const haptic = useHaptic();

  // Calculate stats with safety checks
  const exercises = Array.isArray(sessionLog.exercises) ? sessionLog.exercises : [];

  const totalVolume = exercises.reduce((sum, ex) => {
    const sets = Array.isArray(ex.sets) ? ex.sets : [];
    return sum + sets.reduce((setSum, set) => {
      if ('weight' in set && 'reps' in set) {
        return setSum + (Number(set.weight) * Number(set.reps));
      }
      return setSum;
    }, 0);
  }, 0);

  const totalSets = exercises.reduce((sum, ex) => {
    const sets = Array.isArray(ex.sets) ? ex.sets : [];
    return sum + sets.length;
  }, 0);

  // Animated counts
  const durationCount = useCountUp(sessionLog.durationMinutes || 0, 800);
  const volumeCount = useCountUp(Math.round(totalVolume), 1000);
  const exerciseCount = useCountUp(exercises.length, 600);
  const setsCount = useCountUp(totalSets, 700);

  // Sequential reveal
  const revealed = useSequentialReveal(4, 200, 400);

  useEffect(() => {
    haptic.heavy();
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  const handleShare = () => {
    const shareText = `💪 Workout Complete!\n\n${sessionLog.focus}\n⏱️ ${sessionLog.durationMinutes || 0} min\n🏋️ ${Math.round(totalVolume).toLocaleString()} kg total\n✓ ${exercises.length} exercises`;

    if (navigator.share) {
      navigator.share({
        title: 'REBLD Workout',
        text: shareText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      notify({ type: 'success', message: 'Copied to clipboard!' });
    }
  };

  return (
    <div className="min-h-screen w-full max-w-2xl mx-auto px-5 py-8 flex flex-col animate-scale-in relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[var(--accent)] rounded-full animate-fade-in"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animation: `confettiFall ${2 + Math.random()}s linear forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
                opacity: 0.8
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes confettiFall {
          to {
            transform: translateY(120vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-24 h-24 bg-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-subtle" style={{ boxShadow: 'var(--glow-red)' }}>
          <TrophyIcon className="w-14 h-14 text-white" />
        </div>
        <h1 className="font-syne text-4xl font-bold text-[var(--text-primary)] mb-3">
          Workout Complete!
        </h1>
        <p className="text-[16px] text-[var(--text-secondary)]">
          You crushed it! 🔥
        </p>
      </div>

      {/* Session Title */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-2">
          SESSION
        </p>
        <h2 className="font-syne text-2xl font-bold text-[var(--text-primary)]">
          {sessionLog.focus}
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {revealed[0] && (
          <div className="bg-[var(--surface)] border border-[var(--accent)] rounded-xl p-5 animate-fade-in-up" style={{ boxShadow: 'var(--glow-red)' }}>
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-2">TIME</p>
            <p className="font-syne text-3xl font-bold text-[var(--accent)]">{durationCount}</p>
            <p className="text-[12px] text-[var(--text-secondary)]">minutes</p>
          </div>
        )}

        {revealed[1] && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 animate-fade-in-up" style={{ boxShadow: 'var(--shadow-sm)', animationDelay: '100ms' }}>
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-2">VOLUME</p>
            <p className="font-syne text-3xl font-bold text-[var(--text-primary)]">{volumeCount.toLocaleString()}</p>
            <p className="text-[12px] text-[var(--text-secondary)]">lbs lifted</p>
          </div>
        )}

        {revealed[2] && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 animate-fade-in-up" style={{ boxShadow: 'var(--shadow-sm)', animationDelay: '200ms' }}>
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-2">EXERCISES</p>
            <p className="font-syne text-3xl font-bold text-[var(--text-primary)]">{exerciseCount}</p>
            <p className="text-[12px] text-[var(--text-secondary)]">completed</p>
          </div>
        )}

        {revealed[3] && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 animate-fade-in-up" style={{ boxShadow: 'var(--shadow-sm)', animationDelay: '300ms' }}>
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-2">SETS</p>
            <p className="font-syne text-3xl font-bold text-[var(--text-primary)]">{setsCount}</p>
            <p className="text-[12px] text-[var(--text-secondary)]">total</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-auto space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button
          onClick={handleShare}
          className="w-full py-4 rounded-lg font-semibold text-[15px] text-[var(--text-primary)] bg-[var(--surface)] border-2 border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] transition"
        >
          Share Progress
        </button>
        <button
          onClick={onDone}
          className="w-full py-5 rounded-xl font-bold text-[18px] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all"
          style={{ boxShadow: 'var(--glow-red)' }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
