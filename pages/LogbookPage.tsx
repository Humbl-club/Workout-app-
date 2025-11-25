import React from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutLog, LoggedExercise, LoggedSetSRW } from '../types';
import { BookCheckIcon, DumbbellIcon, SignOutIcon, LogoIcon } from '../components/icons';
import { useClerk } from '@clerk/clerk-react';

const LoggedExerciseCard: React.FC<{ exercise: LoggedExercise }> = ({ exercise }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-[var(--surface-secondary)] p-4 rounded-lg">
      <h4 className="font-semibold text-[15px] text-[var(--text-primary)] mb-3">{exercise.exercise_name}</h4>
      <ul className="space-y-2 text-[13px] text-[var(--text-secondary)] font-mono">
        {exercise.sets.map((set, index) => (
          <li key={index} className="flex justify-between items-center">
            <span className="text-[var(--text-tertiary)]">{t('logbook.set')} {set.set}</span>
            {'weight' in set ? (
              <span className="font-semibold">
                {set.weight} {t('logbook.kg')} × {set.reps} {t('logbook.reps')}
                {(set as LoggedSetSRW).rpe ? <span className="text-[var(--accent)] ml-1.5">@{(set as LoggedSetSRW).rpe}</span> : ''}
              </span>
            ) : (
              <span className="font-semibold">{set.duration_s}{t('logbook.seconds')}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};


const LogCard: React.FC<{ log: WorkoutLog }> = ({ log }) => {
    const { t } = useTranslation();
    const logDate = new Date(log.date);
    return (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="border-b border-[var(--border)] pb-4 mb-4">
                <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-2">
                    {logDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{log.focus}</h3>
                <p className="text-[13px] text-[var(--text-secondary)] mt-1">
                    {log.durationMinutes} {t('logbook.minSession')}
                </p>
            </div>
            <div className="space-y-3">
                {log.exercises.map(ex => <LoggedExerciseCard key={ex.exercise_name} exercise={ex} />)}
            </div>
        </div>
    );
};


export default function LogbookPage({ logs }: { logs: WorkoutLog[] }) {
  const { t } = useTranslation();
  const { signOut } = useClerk();
  
  const handleSignOut = async () => {
    try {
        await signOut();
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] animate-fade-in flex-1">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-2">{t('logbook.trainingHistory')}</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] leading-tight">{t('logbook.logbook')}</h1>
      </header>

      <main className="space-y-4 pb-4">
        {Array.isArray(logs) && logs.length > 0 ? (
          logs.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => <LogCard key={log.id} log={log} />)
        ) : (
            <div className="text-center py-16 flex flex-col items-center justify-center bg-[var(--surface)] border border-[var(--border)] rounded-xl" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="w-16 h-16 bg-[var(--surface-secondary)] rounded-lg flex items-center justify-center mb-4">
                  <DumbbellIcon className="h-8 w-8 text-[var(--text-tertiary)]"/>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">{t('logbook.noLogsYet')}</h3>
              <p className="mt-2 text-[14px] text-[var(--text-secondary)] max-w-xs px-4">{t('logbook.completeFirstWorkout')}</p>
          </div>
        )}
      </main>
    </div>
  );
}