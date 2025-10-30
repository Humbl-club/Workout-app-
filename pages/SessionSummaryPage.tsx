import React, { useMemo } from 'react';
import { WorkoutLog, LoggedSetSRW } from '../types';
import { LogoIcon, CheckCircleIcon, DumbbellIcon, TimerIcon, BookOpenIcon, SparklesIcon } from '../components/icons';

interface SessionSummaryPageProps {
  sessionLog: WorkoutLog;
  onDone: () => void;
}

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string | number; }> = ({ icon: Icon, title, value }) => (
    <div className="bg-stone-800/50 border border-stone-700 p-4 rounded-xl backdrop-blur-xl shadow-lg flex items-center gap-4">
        <div className="w-12 h-12 bg-stone-900/50 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-red-400" />
        </div>
        <div>
            <p className="text-sm font-semibold text-stone-400">{title}</p>
            <p className="font-syne text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

export default function SessionSummaryPage({ sessionLog, onDone }: SessionSummaryPageProps) {

  const analytics = useMemo(() => {
    let totalVolume = 0;
    let totalSets = 0;
    const totalExercises = sessionLog.exercises.length;

    sessionLog.exercises.forEach(exercise => {
      totalSets += exercise.sets.length;
      exercise.sets.forEach(set => {
        if ('weight' in set && 'reps' in set) {
          totalVolume += Number(set.weight) * Number(set.reps);
        }
      });
    });

    return {
      totalVolume: Math.round(totalVolume),
      totalSets,
      totalExercises,
      duration: sessionLog.durationMinutes || 0,
    };
  }, [sessionLog]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 animate-fade-in flex flex-col min-h-screen justify-center">
        <div className="text-center mb-8">
            <CheckCircleIcon className="w-16 h-16 text-white mx-auto animate-scale-in-center"/>
            <h1 className="font-syne text-3xl font-extrabold tracking-tighter text-white mt-4">Workout Complete!</h1>
            <p className="mt-1 text-lg text-stone-300">{sessionLog.focus}</p>
        </div>

        <div className="bg-stone-800/50 border border-stone-700 rounded-3xl backdrop-blur-xl shadow-2xl p-6 space-y-4">
            <h2 className="font-syne text-xl font-bold text-white text-center">Session Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard icon={TimerIcon} title="Duration" value={`${analytics.duration} min`} />
                <StatCard icon={DumbbellIcon} title="Total Volume" value={`${analytics.totalVolume} kg`} />
                <StatCard icon={SparklesIcon} title="Exercises" value={analytics.totalExercises} />
                <StatCard icon={BookOpenIcon} title="Sets Completed" value={analytics.totalSets} />
            </div>
        </div>
        
        <div className="mt-8 text-center">
            <button 
                onClick={onDone}
                className="w-full max-w-xs inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-full shadow-lg text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-950 focus:ring-red-500 transition-transform hover:scale-105"
            >
                Done
            </button>
        </div>
    </div>
  );
}