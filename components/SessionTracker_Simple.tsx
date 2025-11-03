import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { PlanDay, LoggedSetSRW, WorkoutLog, LoggedExercise, PlanExercise, WorkoutBlock } from '../types';
import { XMarkIcon, CheckCircleIcon, TimerIcon, RepeatIcon, ClockIcon, ZapIcon } from './icons';
import { useSwipeGesture, useHaptic } from '../hooks/useAnimations';
import RestTimer from './RestTimer';
import { notify } from './layout/Toast';

interface SessionTrackerProps {
  session: PlanDay;
  onFinish: (log: { focus: string, exercises: LoggedExercise[], durationMinutes: number }) => void;
  onCancel: () => void;
  allLogs: WorkoutLog[];
}

export default function SessionTracker({ session, onFinish, onCancel, allLogs }: SessionTrackerProps) {
  const [loggedData, setLoggedData] = useState<Record<string, LoggedSetSRW[]>>({});
  const [currentInputData, setCurrentInputData] = useState<Record<string, Partial<LoggedSetSRW>>>({});
  const [isResting, setIsResting] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [startTime] = useState(new Date());

  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentExerciseInBlock, setCurrentExerciseInBlock] = useState(0);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);

  const haptic = useHaptic();

  const workoutBlocks = useMemo(() => session.blocks || [], [session]);
  const currentBlock = workoutBlocks[currentBlockIndex];

  // Flatten all exercises for overall progress
  const allExercises = useMemo(() => {
    return workoutBlocks.flatMap(block => block.exercises);
  }, [workoutBlocks]);

  // Calculate overall progress
  const currentExerciseGlobalIndex = useMemo(() => {
    let count = 0;
    for (let i = 0; i < currentBlockIndex; i++) {
      count += workoutBlocks[i].exercises.length;
    }
    count += currentExerciseInBlock;
    return count;
  }, [currentBlockIndex, currentExerciseInBlock, workoutBlocks]);

  const progress = allExercises.length > 0 ? (currentExerciseGlobalIndex + 1) / allExercises.length : 0;

  const currentExercise = currentBlock?.exercises[currentExerciseInBlock];

  // Get exercise history
  const getExerciseHistory = useCallback((exerciseName: string) => {
    const lastLog = allLogs
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .find(log => log.exercises.some(ex => ex.exercise_name === exerciseName));

    if (!lastLog) return null;

    const exercise = lastLog.exercises.find(ex => ex.exercise_name === exerciseName);
    if (!exercise || !exercise.sets.length) return null;

    const lastSet = exercise.sets[exercise.sets.length - 1];
    if ('weight' in lastSet && 'reps' in lastSet) {
      return { weight: lastSet.weight, reps: lastSet.reps };
    }
    return null;
  }, [allLogs]);

  const lastPerformance = currentExercise ? getExerciseHistory(currentExercise.exercise_name) : null;

  // Auto-fill weight/reps from last session
  useEffect(() => {
    if (currentExercise && lastPerformance && !currentInputData[currentExercise.exercise_name]) {
      setCurrentInputData(prev => ({
        ...prev,
        [currentExercise.exercise_name]: {
          weight: lastPerformance.weight,
          reps: lastPerformance.reps,
        }
      }));
    }
  }, [currentExercise, lastPerformance, currentInputData]);

  const handleInputChange = (field: 'weight' | 'reps', value: string) => {
    if (!currentExercise) return;
    setCurrentInputData(prev => ({
      ...prev,
      [currentExercise.exercise_name]: {
        ...prev[currentExercise.exercise_name],
        [field]: value
      }
    }));
  };

  const handleCompleteSet = () => {
    if (!currentExercise) return;

    const input = currentInputData[currentExercise.exercise_name];
    if (!input?.weight || !input?.reps) {
      notify({ type: 'error', message: 'Please enter weight and reps' });
      return;
    }

    haptic.medium();

    const newSet: LoggedSetSRW = {
      set: currentSetNumber,
      weight: Number(input.weight),
      reps: Number(input.reps),
      rpe: input.rpe,
    };

    // Save the set
    setLoggedData(prev => ({
      ...prev,
      [currentExercise.exercise_name]: [...(prev[currentExercise.exercise_name] || []), newSet]
    }));

    const targetSets = currentExercise.metrics_template?.target_sets || 3;

    // Check if this exercise is complete
    if (currentSetNumber >= targetSets) {
      // Move to next exercise or block
      handleMoveToNext();
    } else {
      // Next set
      setCurrentSetNumber(prev => prev + 1);

      // Start rest timer
      const restTime = currentExercise.metrics_template?.rest_period_s || 90;
      if (restTime > 0) {
        setRestDuration(restTime);
        setIsResting(true);
      }
    }
  };

  const handleMoveToNext = () => {
    const nextExerciseIndex = currentExerciseInBlock + 1;

    if (nextExerciseIndex < currentBlock.exercises.length) {
      // Next exercise in current block
      setCurrentExerciseInBlock(nextExerciseIndex);
      setCurrentSetNumber(1);
    } else {
      // Next block
      const nextBlockIndex = currentBlockIndex + 1;
      if (nextBlockIndex < workoutBlocks.length) {
        setCurrentBlockIndex(nextBlockIndex);
        setCurrentExerciseInBlock(0);
        setCurrentSetNumber(1);
      } else {
        // Workout complete!
        handleFinishWorkout();
      }
    }
  };

  const handleFinishWorkout = () => {
    const duration = Math.round((new Date().getTime() - startTime.getTime()) / 60000);

    const exercises: LoggedExercise[] = Object.entries(loggedData).map(([name, sets]) => ({
      exercise_name: name,
      sets
    }));

    onFinish({
      focus: session.focus,
      exercises,
      durationMinutes: duration
    });
  };

  const handleSkipExercise = () => {
    haptic.light();
    handleMoveToNext();
  };

  if (!currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="text-center">
          <h2 className="font-syne text-2xl font-bold text-[var(--text-primary)]">Workout Complete!</h2>
          <button
            onClick={handleFinishWorkout}
            className="mt-6 px-6 py-4 rounded-lg font-bold text-white bg-[var(--accent)] transition"
            style={{ boxShadow: 'var(--glow-red)' }}
          >
            Finish Session
          </button>
        </div>
      </div>
    );
  }

  const mt = currentExercise.metrics_template;
  const targetSets = mt?.target_sets || 3;
  const targetReps = mt?.target_reps || '10';

  return (
    <div className="min-h-screen w-full max-w-2xl mx-auto flex flex-col bg-[var(--background)]">
      {/* Progress Bar */}
      <div className="sticky top-0 z-20 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="px-5 py-4 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-[var(--surface-secondary)] transition"
          >
            <XMarkIcon className="w-6 h-6 text-[var(--text-secondary)]" />
          </button>
          <div className="flex-1 mx-4">
            <div className="h-1.5 bg-[var(--surface)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] transition-all duration-300 rounded-full"
                style={{ width: `${progress * 100}%`, boxShadow: 'var(--glow-red)' }}
              />
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)] text-center mt-2 font-medium">
              {currentExerciseGlobalIndex + 1} / {allExercises.length} exercises
            </p>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Exercise Card */}
      <div className="flex-1 flex flex-col px-5 py-8 animate-fade-in">
        {/* Exercise Info */}
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-2">
            {currentBlock.type === 'superset' ? `SUPERSET · ROUND ${currentSetNumber}/${currentBlock.rounds}` : `SET ${currentSetNumber}/${targetSets}`}
          </p>
          <h1 className="font-syne text-4xl font-bold text-[var(--text-primary)] leading-tight mb-4">
            {currentExercise.exercise_name}
          </h1>

          {/* Metrics */}
          <div className="flex items-center flex-wrap gap-3 text-[14px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1.5">
              <RepeatIcon className="w-4 h-4" />
              {targetSets} × {targetReps}
            </span>
            {mt?.rest_period_s && (
              <span className="flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                {mt.rest_period_s}s rest
              </span>
            )}
            {currentExercise.rpe && (
              <span className="flex items-center gap-1.5">
                <ZapIcon className="w-4 h-4" />
                RPE {currentExercise.rpe}
              </span>
            )}
          </div>

          {currentExercise.notes && (
            <p className="mt-4 text-[14px] text-[var(--text-secondary)] leading-relaxed bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
              {currentExercise.notes}
            </p>
          )}
        </div>

        {/* Last Performance */}
        {lastPerformance && (
          <div className="mb-8 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-2">LAST TIME</p>
            <p className="text-[16px] font-mono font-semibold text-[var(--text-primary)]">
              {lastPerformance.weight} lbs × {lastPerformance.reps} reps
            </p>
          </div>
        )}

        {/* Input Section */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-secondary)] mb-2">Weight (lbs)</label>
            <input
              type="number"
              inputMode="decimal"
              value={currentInputData[currentExercise.exercise_name]?.weight || ''}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              className="w-full px-4 py-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[24px] font-bold text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition"
              placeholder="185"
            />
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-[var(--text-secondary)] mb-2">Reps</label>
            <input
              type="number"
              inputMode="numeric"
              value={currentInputData[currentExercise.exercise_name]?.reps || ''}
              onChange={(e) => handleInputChange('reps', e.target.value)}
              className="w-full px-4 py-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[24px] font-bold text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition"
              placeholder="10"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto space-y-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <button
            onClick={handleCompleteSet}
            className="w-full py-5 rounded-xl font-bold text-[18px] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all"
            style={{ boxShadow: 'var(--glow-red)', letterSpacing: '-0.01em' }}
          >
            <CheckCircleIcon className="w-6 h-6 inline mr-2" />
            Complete Set ({currentSetNumber}/{targetSets})
          </button>

          <button
            onClick={handleSkipExercise}
            className="w-full py-4 rounded-lg font-semibold text-[15px] text-[var(--text-secondary)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] transition"
          >
            Skip Exercise
          </button>
        </div>
      </div>

      {/* Rest Timer Overlay */}
      {isResting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-md mx-auto px-5">
            <RestTimer
              duration={restDuration}
              onComplete={() => setIsResting(false)}
              onSkip={() => setIsResting(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
