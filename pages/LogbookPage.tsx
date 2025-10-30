import React from 'react';
import { WorkoutLog, LoggedExercise, LoggedSetSRW } from '../types';
import { BookCheckIcon, DumbbellIcon, SignOutIcon, LogoIcon } from '../components/icons';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const LoggedExerciseCard: React.FC<{ exercise: LoggedExercise }> = ({ exercise }) => (
  <div className="bg-stone-900/50 p-3 rounded-lg">
    <h4 className="font-semibold text-stone-200">{exercise.exercise_name}</h4>
    <ul className="mt-2 space-y-1 text-sm text-stone-400 font-mono">
      {exercise.sets.map((set, index) => (
        <li key={index} className="flex justify-between">
          <span>Set {set.set}</span>
          {'weight' in set ? (
            <span>{set.weight}kg x {set.reps} reps {(set as LoggedSetSRW).rpe ? `@${(set as LoggedSetSRW).rpe}` : ''}</span>
          ) : (
            <span>{set.duration_s}s</span>
          )}
        </li>
      ))}
    </ul>
  </div>
);


const LogCard: React.FC<{ log: WorkoutLog }> = ({ log }) => {
    const logDate = new Date(log.date);
    return (
        <div className="bg-stone-800/50 border border-stone-700 p-4 sm:p-6 rounded-2xl w-full shadow-2xl backdrop-blur-lg">
            <div className="border-b border-stone-700 pb-3 mb-3">
                <p className="font-syne font-semibold text-white text-lg">{log.focus}</p>
                <p className="text-sm text-stone-400">
                    {logDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
            <div className="space-y-2">
                {log.exercises.map(ex => <LoggedExerciseCard key={ex.exercise_name} exercise={ex} />)}
            </div>
        </div>
    );
};


export default function LogbookPage({ logs }: { logs: WorkoutLog[] }) {
  const handleSignOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 animate-fade-in flex-1">
      <header className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
            <LogoIcon className="h-10 w-auto text-4xl text-white" />
            <div>
                <h1 className="font-syne text-xl sm:text-2xl font-bold text-white">Logbook</h1>
                <p className="text-sm text-stone-400">Your complete training history.</p>
            </div>
        </div>
         <button
            onClick={handleSignOut}
            title="Sign Out"
            className="p-2 border border-stone-700 rounded-lg text-stone-300 bg-stone-800/50 hover:bg-stone-700/70 hover:text-white transition"
        >
            <SignOutIcon className="w-5 h-5"/>
        </button>
      </header>
      
      <main className="space-y-6 pb-24">
        {logs.length > 0 ? (
          logs.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => <LogCard key={log.id} log={log} />)
        ) : (
            <div className="text-center py-20 flex flex-col items-center justify-center bg-stone-800/50 border border-stone-700 rounded-2xl shadow-lg backdrop-blur-lg">
              <div className="w-20 h-20 bg-stone-900/50 rounded-full flex items-center justify-center">
                  <DumbbellIcon className="h-10 w-10 text-stone-400"/>
              </div>
              <h3 className="font-syne mt-6 text-2xl font-bold text-white">No Logs Yet</h3>
              <p className="mt-2 text-stone-400 max-w-sm">Complete your first workout session, and your history will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
}