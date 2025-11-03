import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { PlanDay, DailyRoutine, PlanExercise, LoggedSetSRW, LoggedSetDuration, WorkoutLog, LoggedExercise, WorkoutBlock, SupersetBlock, AmrapBlock } from '../types';
import { CheckCircleIcon, XMarkIcon, ClockIcon, CogIcon } from './icons';
import RestTimer from './RestTimer';
import ExerciseCard from './ExerciseCard';
import SetsRepsWeightTracker from './trackers/SetsRepsWeightTracker';
import PRNotification from './PRNotification';

interface SessionTrackerProps {
  session: PlanDay; // Now strongly typed to PlanDay
  onFinish: (log: { focus: string, exercises: LoggedExercise[], durationMinutes: number }) => void;
  onCancel: () => void;
  allLogs: WorkoutLog[];
}

// ... (WorkoutTabs remains largely the same, but now takes blocks)
const WorkoutTabs: React.FC<{
    blocks: WorkoutBlock[];
    currentBlockIndex: number;
    isBlockComplete: (block: WorkoutBlock) => boolean;
    getBlockProgress: (block: WorkoutBlock) => number; // 0..1
    onSelectBlock: (index: number) => void;
}> = ({ blocks, currentBlockIndex, isBlockComplete, getBlockProgress, onSelectBlock }) => {
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

    useEffect(() => {
        tabRefs.current[currentBlockIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, [currentBlockIndex]);

    return (
        <div className="flex items-center gap-3 overflow-x-auto p-4 hide-scrollbar">
            {blocks.map((block, index) => {
                const isComplete = isBlockComplete(block);
                const isActive = index === currentBlockIndex;
                const name = block.title || `Block ${index + 1}`;
                const progress = Math.max(0, Math.min(1, getBlockProgress(block)));

                return (
                    <button
                        key={`${index}-${name}`}
                        ref={el => tabRefs.current[index] = el}
                        onClick={() => onSelectBlock(index)}
                        className={`relative shrink-0 w-32 h-16 p-2 flex flex-col justify-center items-center text-center rounded-xl border transition-all duration-300
                            ${isActive ? 'bg-red-500/80 border-red-500 text-white shadow-lg' : 'bg-stone-800/50 border-stone-700 text-stone-300 hover:bg-stone-700/50'}
                            ${isComplete ? 'opacity-60' : ''}
                        `}
                    >
                        <p className="text-xs font-bold truncate w-full">{name}</p>
                        {isComplete && <CheckCircleIcon className="w-5 h-5 text-white/70 absolute top-1 right-1" />}
                        <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full rounded-b-lg overflow-hidden">
                          <div className={`h-full ${isActive ? 'bg-white' : 'bg-red-400/80'}`} style={{ width: `${progress * 100}%` }} />
                        </div>
                    </button>
                )
            })}
        </div>
    );
};


const AmrapProtocolCard: React.FC<{ block: AmrapBlock }> = ({ block }) => {
    const [timeLeft, setTimeLeft] = useState(block.duration_minutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<number>();

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = window.setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft <= 0) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
        }
        return () => clearInterval(intervalRef.current);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="bg-stone-800/50 border border-stone-700 rounded-3xl p-6 text-center flex-1 flex flex-col justify-center items-center">
            <h3 className="font-syne text-lg font-bold text-red-400 uppercase tracking-widest">{block.title || 'AMRAP'}</h3>
            <div className="my-6">
                <p className="font-mono text-7xl font-extrabold text-white">{formatTime(timeLeft)}</p>
                <p className="text-stone-300 font-semibold">As Many Rounds As Possible</p>
            </div>
            <div className="mb-6 w-full max-w-xs">
                <h4 className="font-bold text-white mb-2">Exercises in this block:</h4>
                <ul className="text-stone-300 space-y-1">
                   {block.exercises.map(ex => <li key={ex.exercise_name}>{ex.exercise_name}</li>)}
                </ul>
            </div>
            <button onClick={() => setIsRunning(!isRunning)} className="px-8 py-3 text-lg font-bold text-white bg-red-500 rounded-full shadow-lg">
                {isRunning ? 'Pause' : 'Start'}
            </button>
        </div>
    );
};


export default function SessionTracker({ session, onFinish, onCancel, allLogs }: SessionTrackerProps) {
  const [loggedData, setLoggedData] = useState<Record<string, LoggedSetSRW[]>>({});
  const [currentInputData, setCurrentInputData] = useState<Record<string, Partial<LoggedSetSRW>>>({});
  
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [timerKey, setTimerKey] = useState(0);
  const [startTime] = useState(new Date());
  
  const [prMessage, setPrMessage] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const workoutBlocks = useMemo(() => session.blocks || [], [session]);

  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const [animationClass, setAnimationClass] = useState('animate-fade-in');
  
  const currentBlock = workoutBlocks[currentBlockIndex];

  // Settings
  const { default: useSettings } = require('../hooks/useSettings');
  const { settings, update } = useSettings();

  // ... (getExerciseHistory and exerciseHistory memo remain the same)
    const getExerciseHistory = (exerciseName: string) => {
      const history = { allTimeBestWeight: 0, allTimeBestRepsAtBestWeight: 0, heaviestWeightLastSession: 0 };
      allLogs.forEach(log => {
          const exerciseLog = log.exercises.find(ex => ex.exercise_name === exerciseName);
          if (exerciseLog) {
              exerciseLog.sets.forEach(set => {
                  if ('weight' in set && 'reps' in set) {
                      const weight = Number(set.weight);
                      const reps = Number(set.reps);
                      if (weight > history.allTimeBestWeight) {
                          history.allTimeBestWeight = weight;
                          history.allTimeBestRepsAtBestWeight = reps;
                      } else if (weight === history.allTimeBestWeight && reps > history.allTimeBestRepsAtBestWeight) {
                           history.allTimeBestRepsAtBestWeight = reps;
                      }
                  }
              });
          }
      });
      
      const lastSessionLog = allLogs.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                               .find(log => log.exercises.some(ex => ex.exercise_name === exerciseName));

      if (lastSessionLog) {
          const lastExLog = lastSessionLog.exercises.find(ex => ex.exercise_name === exerciseName);
          if (lastExLog) {
              history.heaviestWeightLastSession = Math.max(...lastExLog.sets.map(s => 'weight' in s ? Number(s.weight) : 0), 0);
          }
      }
      return history;
  };
  
  const exerciseHistory = useMemo(() => {
      const historyMap: Record<string, ReturnType<typeof getExerciseHistory>> = {};
      workoutBlocks.forEach(block => block.exercises.forEach(ex => {
          historyMap[ex.exercise_name] = getExerciseHistory(ex.exercise_name);
      }));
      return historyMap;
  }, [allLogs, workoutBlocks]);


  const isBlockComplete = useCallback((block: WorkoutBlock): boolean => {
    if (block.type === 'amrap') return false; // Needs a different completion logic
    
    const rounds = block.type === 'superset' ? block.rounds : block.exercises[0].metrics_template.target_sets || 1;
    const firstExName = block.exercises[0].exercise_name;
    
    return (loggedData[firstExName]?.length || 0) >= rounds;

  }, [loggedData]);

  const getBlockProgress = useCallback((block: WorkoutBlock): number => {
    if (!block || block.exercises.length === 0) return 0;
    if (block.type === 'amrap') return 0; // Timer based; omit progress
    const total = block.type === 'superset' ? block.rounds : (block.exercises[0].metrics_template.target_sets || 1);
    const firstExName = block.exercises[0].exercise_name;
    const done = (loggedData[firstExName]?.length || 0);
    return Math.max(0, Math.min(1, total ? done / total : 0));
  }, [loggedData]);
  
  const handleFinish = () => {
    const exercises: LoggedExercise[] = Object.keys(loggedData).map((name) => ({
      exercise_name: name,
      sets: loggedData[name],
    }));
    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    onFinish({ focus: session.focus, exercises, durationMinutes });
  };
  
  const handleSelectBlock = (index: number) => {
      if (index !== currentBlockIndex) {
        setAnimationClass('animate-fade-in');
        setCurrentBlockIndex(index);
      }
  }

  const advanceToNext = useCallback(() => {
    if (currentBlockIndex < workoutBlocks.length - 1) {
       handleSelectBlock(currentBlockIndex + 1);
    } else {
       setCurrentBlockIndex(workoutBlocks.length);
    }
  }, [currentBlockIndex, workoutBlocks]);
  
  // ... (checkForPR remains the same)
  const checkForPR = (exerciseName: string, weight: number, reps: number) => {
      const history = exerciseHistory[exerciseName];
      if (!history) return;

      if (weight > history.allTimeBestWeight) {
          setPrMessage(`New PR! ${weight}kg is your heaviest lift for ${exerciseName}!`);
      } else if (weight === history.allTimeBestWeight && reps > history.allTimeBestRepsAtBestWeight) {
          setPrMessage(`New PR! ${reps} reps at ${weight}kg is a new record for ${exerciseName}!`);
      }
  };
  
  const handleLogSet = () => {
      let shouldRest = false;
      let newLoggedData = {...loggedData};
      
      const totalSetsInBlock = currentBlock.type === 'superset' ? currentBlock.rounds : currentBlock.exercises[0].metrics_template.target_sets || 1;
      
      currentBlock.exercises.forEach(ex => {
          const data = currentInputData[ex.exercise_name];
          const weight = Number(data?.weight || 0);
          const reps = Number(data?.reps || 0);
          
          const setData: LoggedSetSRW = {
              set: currentSetNumber,
              weight,
              reps,
              rpe: data?.rpe ? Number(data.rpe) : undefined
          };
          newLoggedData[ex.exercise_name] = [...(newLoggedData[ex.exercise_name] || []), setData];
          if(weight > 0 && reps > 0) checkForPR(ex.exercise_name, weight, reps);
      });
      
      const lastExerciseInBlock = currentBlock.exercises[currentBlock.exercises.length - 1];
      shouldRest = (lastExerciseInBlock.metrics_template.rest_period_s || 0) > 0 && currentSetNumber < totalSetsInBlock;
      if(shouldRest) setRestDuration(lastExerciseInBlock.metrics_template.rest_period_s!);
      
      setLoggedData(newLoggedData);

      const isLastSetOfBlock = currentSetNumber >= totalSetsInBlock;

      if (shouldRest && settings.autoStartRest) {
          setIsResting(true);
          setTimerKey(prev => prev + 1);
          setCurrentSetNumber(prev => prev + 1);
      } else if (isLastSetOfBlock) {
          advanceToNext();
      } else {
          setCurrentSetNumber(prev => prev + 1);
      }
  };

  const handleRestFinished = () => setIsResting(false);
  
  useEffect(() => {
      setCurrentSetNumber(1);
      setCurrentInputData({});
  }, [currentBlockIndex]);

  const handleInputChange = (exerciseName: string, field: keyof LoggedSetSRW, value: string | number) => {
    // FIX: Corrected typo 'exerci' to 'prev[exerciseName]' and completed the function body.
    setCurrentInputData(prev => ({ ...prev, [exerciseName]: { ...prev[exerciseName], [field]: value } }));
  };

  const isCurrentInputComplete = useMemo(() => {
    if (!currentBlock || currentBlock.type !== 'single' && currentBlock.type !== 'superset') return false;
    
    return currentBlock.exercises.every(ex => {
        const input = currentInputData[ex.exercise_name];
        return input && (input.weight || input.weight === 0) && (input.reps || input.reps === 0);
    });
  }, [currentInputData, currentBlock]);

  if (isResting) {
    return <RestTimer duration={restDuration} onFinish={handleRestFinished} timerKey={timerKey} mute={!settings.restSound} vibrate={settings.restVibration} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 animate-fade-in flex flex-col min-h-screen">
       <header className="flex justify-between items-center mb-4 relative">
            <div>
                <h1 className="font-syne text-2xl font-bold text-white tracking-tight">{session.focus}</h1>
                <p className="text-stone-400 font-semibold">{`Block ${currentBlockIndex + 1} / ${workoutBlocks.length}`}</p>
            </div>
            <button onClick={onCancel} className="p-2 rounded-full text-stone-300 hover:bg-stone-700/50 hover:text-white transition">
                <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="absolute right-12 top-0">
              <button onClick={() => setShowSettings(s => !s)} className="p-2 rounded-full text-stone-300 hover:bg-stone-700/50 hover:text-white transition" aria-haspopup="true" aria-expanded={showSettings}>
                <CogIcon className="w-6 h-6" />
              </button>
              {showSettings && (
                <div className="mt-2 w-64 bg-stone-900/90 border border-stone-700 rounded-xl shadow-xl p-3 text-sm text-stone-200">
                  <p className="text-xs font-bold text-stone-400 mb-2">Session Settings</p>
                  <label className="flex items-center justify-between py-1">
                    <span>Auto-start rest</span>
                    <input type="checkbox" checked={settings.autoStartRest} onChange={e => update({ autoStartRest: e.target.checked })} />
                  </label>
                  <label className="flex items-center justify-between py-1">
                    <span>Rest sound</span>
                    <input type="checkbox" checked={settings.restSound} onChange={e => update({ restSound: e.target.checked })} />
                  </label>
                  <label className="flex items-center justify-between py-1">
                    <span>Vibrate on finish</span>
                    <input type="checkbox" checked={settings.restVibration} onChange={e => update({ restVibration: e.target.checked })} />
                  </label>
                </div>
              )}
            </div>
        </header>
        
        <WorkoutTabs 
            blocks={workoutBlocks}
            currentBlockIndex={currentBlockIndex}
            isBlockComplete={isBlockComplete}
            getBlockProgress={getBlockProgress}
            onSelectBlock={handleSelectBlock}
        />
        
        <PRNotification message={prMessage} onDismiss={() => setPrMessage(null)} />

        <main className={`flex-1 flex flex-col gap-6 mt-4 ${animationClass}`}>
            {currentBlockIndex >= workoutBlocks.length ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-stone-800/50 border border-stone-700 rounded-3xl">
                    <CheckCircleIcon className="w-16 h-16 text-green-500" />
                    <h2 className="font-syne text-2xl font-bold text-white mt-4">Workout Complete!</h2>
                    <p className="text-stone-300">Great work. Ready to log this session?</p>
                    <button
                        onClick={handleFinish}
                        className="mt-6 w-full max-w-xs inline-flex items-center justify-center px-8 py-3 text-base font-bold rounded-full shadow-lg text-white bg-red-500 hover:bg-red-600"
                    >
                        Finish & Save
                    </button>
                </div>
            ) : currentBlock.type === 'amrap' ? (
                 <AmrapProtocolCard block={currentBlock as AmrapBlock} />
            ) : (
                <>
                    {currentBlock.exercises.map((exercise) => (
                        <ExerciseCard
                            key={exercise.exercise_name}
                            exercise={exercise}
                            mode={currentBlock.type === 'superset' ? 'superset-member' : 'single'}
                            completedSets={loggedData[exercise.exercise_name]}
                            isInputsComplete={!!(currentInputData[exercise.exercise_name]?.weight && currentInputData[exercise.exercise_name]?.reps)}
                            tracker={
                                <div>
                                  <SetsRepsWeightTracker
                                    controlled={true}
                                    setNumber={currentSetNumber}
                                    weight={currentInputData[exercise.exercise_name]?.weight ?? ''}
                                    reps={currentInputData[exercise.exercise_name]?.reps ?? ''}
                                    rpe={currentInputData[exercise.exercise_name]?.rpe ?? ''}
                                    onWeightChange={(val) => handleInputChange(exercise.exercise_name, 'weight', val)}
                                    onRepsChange={(val) => handleInputChange(exercise.exercise_name, 'reps', val)}
                                    onRpeChange={(val) => handleInputChange(exercise.exercise_name, 'rpe', val)}
                                    targetReps={exercise.metrics_template.target_reps || '0'}
                                    targetRPE={exercise.rpe}
                                    showLogButton={false}
                                  />
                                  <div className="mt-2 text-xs text-stone-400">
                                    {(() => {
                                      const h = exerciseHistory[exercise.exercise_name];
                                      const tips: string[] = [];
                                      if (h?.heaviestWeightLastSession) tips.push(`Last session max: ${h.heaviestWeightLastSession}kg`);
                                      if (exercise.metrics_template.target_reps) tips.push(`Target reps: ${exercise.metrics_template.target_reps}`);
                                      if (exercise.rpe) tips.push(`Target RPE: ${exercise.rpe}`);
                                      return tips.join(' • ');
                                    })()}
                                  </div>
                                </div>
                            }
                        />
                    ))}
                </>
            )}
        </main>
        
         {currentBlockIndex < workoutBlocks.length && currentBlock.type !== 'amrap' && (
             <footer className="fixed bottom-0 left-0 right-0 p-4 bg-stone-950/80 backdrop-blur-md border-t border-stone-800 z-10">
                <button
                    onClick={handleLogSet}
                    disabled={!isCurrentInputComplete}
                    className="w-full inline-flex items-center justify-center px-8 py-3 text-lg font-bold rounded-full shadow-lg text-white bg-red-500 hover:bg-red-600 disabled:bg-stone-700 disabled:text-stone-400 disabled:cursor-not-allowed transition"
                >
                   Log Set {currentSetNumber}
                </button>
             </footer>
         )}

    </div>
  );
}
