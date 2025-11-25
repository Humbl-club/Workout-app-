import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutLog } from '../types';
import { TrophyIcon, TimerIcon, DumbbellIcon, RepeatIcon, CheckCircleIcon, SparklesIcon } from './icons';
import { useCountUp, useSequentialReveal, useHaptic } from '../hooks/useAnimations';
import { notify } from './layout/Toast';
import { Button } from './ui/button';

interface VictoryScreenProps {
  sessionLog: WorkoutLog;
  onDone: () => void;
}

export default function VictoryScreen({ sessionLog, onDone }: VictoryScreenProps) {
  const { t } = useTranslation();
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
      }).catch((error) => {
        // User cancelled share dialog - this is expected, not an error
        console.log('Share cancelled:', error.message);
      });
    } else {
      navigator.clipboard.writeText(shareText);
      notify({ type: 'success', message: t('victory.copiedToClipboard') });
    }
  };

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto px-4 py-6 flex flex-col relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-animated opacity-40"></div>

      {/* Radial burst effect */}
      {showConfetti && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 bg-gradient-to-t from-[var(--accent)] to-transparent h-32 origin-bottom"
              style={{
                transform: `rotate(${i * 30}deg)`,
                animation: 'radial-burst 1s ease-out forwards',
                animationDelay: `${i * 0.05}s`,
                opacity: 0
              }}
            />
          ))}
        </div>
      )}

      {/* Enhanced confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(40)].map((_, i) => {
            const colors = ['var(--accent)', 'var(--primary)', 'var(--success)', 'var(--accent-cardio)'];
            return (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-fade-in"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                  backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                  animation: `confettiFall ${2 + Math.random()}s linear forwards`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  opacity: 0.9
                }}
              />
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes confettiFall {
          to {
            transform: translateY(120vh) rotate(${360 + Math.random() * 360}deg);
            opacity: 0;
          }
        }
      `}</style>

      {/* Trophy with multiple halos */}
      <div className="relative z-10 mb-8 mt-4">
        <div className="relative w-32 h-32 mx-auto">
          {/* Outer halo */}
          <div className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-20 blur-2xl animate-pulse"></div>
          {/* Middle halo */}
          <div className="absolute inset-4 rounded-full bg-[var(--primary)] opacity-30 blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          {/* Trophy container */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] flex items-center justify-center shadow-2xl animate-scale-in">
            <TrophyIcon className="w-20 h-20 text-white animate-bounce-subtle" />
          </div>
        </div>
      </div>

      {/* Animated title */}
      <div className="relative z-10 text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-black text-[var(--text-primary)] mb-2">
          <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            Workout
          </span>
          {' '}
          <span className="inline-block animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Complete!
          </span>
        </h1>
        <p className="text-[15px] text-[var(--text-secondary)] font-medium animate-fade-in" style={{ animationDelay: '200ms' }}>
          {t('victory.congratulations')}
        </p>
      </div>

      {/* Session Title */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 mb-4 shadow-card">
        <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
          {t('victory.session').toUpperCase()}
        </p>
        <h2 className="text-base font-bold text-[var(--text-primary)]">
          {sessionLog.focus}
        </h2>
      </div>

      {/* Stats Grid - Enhanced with icons and gradients */}
      <div className="relative z-10 grid grid-cols-2 gap-4 mb-8">
        {revealed[0] && (
          <div className="group bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent)]/10 border-2 border-[var(--accent)] rounded-2xl p-5 animate-scale-in shadow-lg hover:shadow-xl transition-all">
            <TimerIcon className="w-7 h-7 text-[var(--accent)] mb-3" />
            <p className="text-[10px] uppercase tracking-widest text-[var(--accent)] font-bold mb-1.5">
              {t('victory.time')}
            </p>
            <p className="text-4xl font-black text-[var(--accent)] stat-number mb-1">
              {durationCount}
            </p>
            <p className="text-[12px] text-[var(--text-secondary)] font-semibold">
              {t('victory.minutes')}
            </p>
          </div>
        )}

        {revealed[1] && (
          <div className="bg-[var(--surface)] border border-[var(--border-card)] rounded-2xl p-5 animate-scale-in shadow-float hover:shadow-elevated transition-all" style={{ animationDelay: '100ms' }}>
            <DumbbellIcon className="w-7 h-7 text-[var(--primary)] mb-3" />
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold mb-1.5">
              {t('victory.volume')}
            </p>
            <p className="text-4xl font-black text-[var(--text-primary)] stat-number mb-1">
              {volumeCount.toLocaleString()}
            </p>
            <p className="text-[12px] text-[var(--text-secondary)] font-semibold">
              {t('victory.lbsLifted')}
            </p>
          </div>
        )}

        {revealed[2] && (
          <div className="bg-[var(--surface)] border border-[var(--border-card)] rounded-2xl p-5 animate-scale-in shadow-float hover:shadow-elevated transition-all" style={{ animationDelay: '200ms' }}>
            <CheckCircleIcon className="w-7 h-7 text-[var(--success)] mb-3" />
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold mb-1.5">
              {t('victory.exercises')}
            </p>
            <p className="text-4xl font-black text-[var(--text-primary)] stat-number mb-1">
              {exerciseCount}
            </p>
            <p className="text-[12px] text-[var(--text-secondary)] font-semibold">
              {t('victory.completed')}
            </p>
          </div>
        )}

        {revealed[3] && (
          <div className="bg-[var(--surface)] border border-[var(--border-card)] rounded-2xl p-5 animate-scale-in shadow-float hover:shadow-elevated transition-all" style={{ animationDelay: '300ms' }}>
            <RepeatIcon className="w-7 h-7 text-[var(--primary)] mb-3" />
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold mb-1.5">
              {t('victory.sets')}
            </p>
            <p className="text-4xl font-black text-[var(--text-primary)] stat-number mb-1">
              {setsCount}
            </p>
            <p className="text-[12px] text-[var(--text-secondary)] font-semibold">
              {t('victory.total')}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons - Enhanced */}
      <div className="relative z-10 mt-auto space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <Button
          onClick={handleShare}
          variant="soft"
          className="w-full h-14 text-[15px] shadow-md"
        >
          <SparklesIcon className="w-5 h-5" />
          {t('victory.share')}
        </Button>
        <Button
          onClick={onDone}
          variant="accent"
          className="w-full h-14 text-[16px] font-bold"
        >
          {t('victory.done')}
        </Button>
      </div>
    </div>
  );
}
