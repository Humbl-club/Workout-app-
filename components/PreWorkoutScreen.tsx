import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PlanDay, DailyRoutine, WorkoutLog } from '../types';
import { CheckCircleIcon, XMarkIcon, CogIcon, ChartBarIcon, TimerIcon } from './icons';
import { usePulse, useHaptic } from '../hooks/useAnimations';

interface PreWorkoutScreenProps {
  session: PlanDay | DailyRoutine;
  recentLogs: WorkoutLog[];
  onStart: () => void;
  onCancel: () => void;
}

interface EquipmentItem {
  name: string;
  checked: boolean;
}

export default function PreWorkoutScreen({ session, recentLogs, onStart, onCancel }: PreWorkoutScreenProps) {
  const { t } = useTranslation();
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [allChecked, setAllChecked] = useState(false);
  const pulse = usePulse(3000); // Breathing circle pulse
  const haptic = useHaptic();

  // Session settings state (load from localStorage if available)
  const [sessionSettings, setSessionSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('rebld_session_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      restTimerAutoStart: true,
      audioCues: true,
      vibrationFeedback: true,
    };
  });

  // Toggle a session setting
  const toggleSetting = (key: keyof typeof sessionSettings) => {
    haptic.light();
    setSessionSettings((prev: typeof sessionSettings) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('rebld_session_settings', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Extract equipment from session
  useEffect(() => {
    const equipmentSet = new Set<string>();

    const exercises = 'blocks' in session && session.blocks
      ? session.blocks.flatMap(b => b.exercises)
      : 'exercises' in session
      ? session.exercises
      : [];

    exercises.forEach((ex) => {
      const name = ex.exercise_name.toLowerCase();

      // Common equipment detection
      if (name.includes('dumbbell') || name.includes('db ')) {
        equipmentSet.add('Dumbbells');
      }
      if (name.includes('barbell')) {
        equipmentSet.add('Barbell');
      }
      if (name.includes('bench') && !name.includes('press')) {
        equipmentSet.add('Bench');
      }
      if (name.includes('sled')) {
        equipmentSet.add('Sled');
      }
      if (name.includes('resistance band') || name.includes('band')) {
        equipmentSet.add('Resistance Band');
      }
      if (name.includes('kettlebell')) {
        equipmentSet.add('Kettlebell');
      }
      if (name.includes('cable')) {
        equipmentSet.add('Cable Machine');
      }
      if (name.includes('pull-up') || name.includes('pullup')) {
        equipmentSet.add('Pull-up Bar');
      }
      if (name.includes('foam roller')) {
        equipmentSet.add('Foam Roller');
      }
    });

    setEquipment(
      Array.from(equipmentSet).map((name) => ({ name, checked: false }))
    );
  }, [session]);

  // Track if all equipment is checked (optional, not required)
  useEffect(() => {
    if (equipment.length > 0) {
      setAllChecked(equipment.every((item) => item.checked));
    } else {
      setAllChecked(true);
    }
  }, [equipment]);

  const toggleEquipment = (index: number) => {
    haptic.light();
    setEquipment((prev) => {
      const next = [...prev];
      next[index].checked = !next[index].checked;
      return next;
    });
  };

  // Calculate stats from recent logs
  const getLastSessionStats = () => {
    if (recentLogs.length === 0) return null;

    const lastLog = recentLogs[0];
    const totalVolume = lastLog.exercises.reduce((sum, ex) => {
      if ('sets' in ex && ex.sets) {
        return sum + ex.sets.reduce((setSum, set) => {
          if ('weight' in set && set.weight && 'reps' in set && set.reps) {
            return setSum + (Number(set.weight) * Number(set.reps));
          }
          return setSum;
        }, 0);
      }
      return sum;
    }, 0);

    return {
      duration: lastLog.durationMinutes || 0,
      volume: totalVolume,
      date: new Date(lastLog.date).toLocaleDateString(),
    };
  };

  const lastStats = getLastSessionStats();

  // Calculate exercise count
  const exerciseCount = 'blocks' in session && session.blocks
    ? session.blocks.reduce((sum, block) => sum + block.exercises.length, 0)
    : 'exercises' in session && session.exercises
    ? session.exercises.length
    : 0;

  // Breathing circle scale based on pulse
  const breathingScale = 0.9 + pulse * 0.2; // Scales from 0.9 to 1.1

  return (
    <div className="min-h-screen w-full max-w-2xl mx-auto px-5 sm:px-6 pt-6 pb-[calc(2rem+env(safe-area-inset-bottom))] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">{t('workout.prepareToStart')}</h1>
        <button
          onClick={onCancel}
          className="p-2.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-all min-h-[44px] min-w-[44px]"
          aria-label={t('common.cancel')}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Breathing Circle */}
      <div className="flex flex-col items-center justify-center mb-10">
        <div
          className="relative w-40 h-40 rounded-full flex items-center justify-center transition-transform duration-1000 ease-in-out"
          style={{
            transform: `scale(${breathingScale})`,
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div className="w-36 h-36 rounded-full bg-[var(--background)]/40 backdrop-blur-sm flex items-center justify-center">
            <TimerIcon className="w-14 h-14 text-white" />
          </div>
        </div>
        <p className="mt-5 text-sm text-[var(--text-secondary)] font-medium">{t('workout.takeMomentToPrepare')}</p>
      </div>

      {/* Workout Overview */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 sm:p-6 mb-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">{session.focus}</h2>
        <div className="flex items-center flex-wrap gap-4 text-[13px] text-[var(--text-secondary)]">
          <span className="font-medium">~45 min</span>
          <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
          <span className="font-medium">{exerciseCount} exercises</span>
          <span className="w-1 h-1 rounded-full bg-[var(--text-tertiary)]" />
          <span className="font-medium">Moderate</span>
        </div>
      </div>

      {/* Equipment Checklist */}
      {equipment.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 sm:p-6 mb-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="font-semibold text-base text-[var(--text-primary)] mb-1">{t('workout.equipmentChecklist')}</h3>
          <p className="text-[12px] text-[var(--text-tertiary)] mb-4">{t('workout.equipmentOptional')}</p>
          <div className="space-y-2">
            {equipment.map((item, index) => (
              <button
                key={item.name}
                onClick={() => toggleEquipment(index)}
                className="w-full flex items-center gap-3 p-4 rounded-lg hover:bg-[var(--surface-secondary)] active:bg-[var(--surface-hover)] transition-all text-left group min-h-[56px]"
              >
                <div
                  className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                    item.checked
                      ? 'bg-[var(--success)] border-[var(--success)]'
                      : 'bg-[var(--surface)] border-[var(--border-strong)] group-hover:border-[var(--accent)]'
                  }`}
                >
                  {item.checked && <CheckCircleIcon className="w-5 h-5 text-[var(--background)]" />}
                </div>
                <span className={`text-[15px] font-medium ${item.checked ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text-primary)]'}`}>
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mb-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-2 mb-4">
          <CogIcon className="w-5 h-5 text-[var(--text-tertiary)]" />
          <h3 className="font-semibold text-base text-[var(--text-primary)]">{t('workout.sessionSettings')}</h3>
        </div>
        <div className="space-y-4 text-sm">
          {/* Rest Timer Auto Start */}
          <button
            onClick={() => toggleSetting('restTimerAutoStart')}
            className="w-full flex items-center justify-between py-2 min-h-[44px] active:opacity-80 transition-opacity"
          >
            <span className="text-[var(--text-secondary)]">{t('workout.restTimerAutoStart')}</span>
            <div
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                sessionSettings.restTimerAutoStart
                  ? 'bg-[var(--success)]'
                  : 'bg-[var(--surface-hover)]'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  sessionSettings.restTimerAutoStart ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </button>

          {/* Audio Cues */}
          <button
            onClick={() => toggleSetting('audioCues')}
            className="w-full flex items-center justify-between py-2 min-h-[44px] active:opacity-80 transition-opacity"
          >
            <span className="text-[var(--text-secondary)]">{t('workout.audioCues')}</span>
            <div
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                sessionSettings.audioCues
                  ? 'bg-[var(--success)]'
                  : 'bg-[var(--surface-hover)]'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  sessionSettings.audioCues ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </button>

          {/* Vibration Feedback */}
          <button
            onClick={() => toggleSetting('vibrationFeedback')}
            className="w-full flex items-center justify-between py-2 min-h-[44px] active:opacity-80 transition-opacity"
          >
            <span className="text-[var(--text-secondary)]">{t('workout.vibrationFeedback')}</span>
            <div
              className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                sessionSettings.vibrationFeedback
                  ? 'bg-[var(--success)]'
                  : 'bg-[var(--surface-hover)]'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  sessionSettings.vibrationFeedback ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Last Session Stats */}
      {lastStats && (
        <div className="bg-[var(--accent-light)] border border-[var(--accent)] rounded-xl p-6 mb-5 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <ChartBarIcon className="w-5 h-5 text-[var(--accent)]" />
            <h3 className="font-semibold text-base text-[var(--text-primary)]">{t('workout.lastSession')}</h3>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            {lastStats.duration} {t('workout.min')} • {Math.round(lastStats.volume).toLocaleString()} {t('workout.kgTotalVolume')}
          </p>
          <p className="text-sm font-semibold text-[var(--accent)]">{t('workout.tryToBeatIt')}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto pt-8 space-y-3">
        <button
          onClick={() => {
            haptic.heavy();
            onStart();
          }}
          className="w-full py-4 rounded-lg font-semibold text-[15px] transition-all min-h-[60px] active:scale-[0.98] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] shadow-card"
        >
          {t('workout.startWorkout')}
        </button>
        <button
          onClick={onCancel}
          className="w-full py-4 rounded-lg font-semibold text-[15px] text-[var(--text-secondary)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-hover)] transition-all min-h-[60px]"
        >
          {t('workout.maybeLater')}
        </button>
      </div>
    </div>
  );
}
