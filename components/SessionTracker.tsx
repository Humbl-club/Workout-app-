import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { PlanDay, LoggedSetSRW, WorkoutLog, LoggedExercise, PlanExercise, WorkoutBlock, SupersetBlock, AmrapBlock } from '../types';
import { XMarkIcon, CheckCircleIcon, TimerIcon, RepeatIcon, ClockIcon, ZapIcon, ArrowRightIcon, TrophyIcon, QuestionMarkCircleIcon } from './icons';
import { useHaptic } from '../hooks/useAnimations';
import RestTimer from './RestTimer';
import BlockCompletionScreen from './BlockCompletionScreen';
import BlockOverview from './BlockOverview';
import ExerciseExplanationModal from './ExerciseExplanationModal';
import { notify } from './layout/Toast';
import { detectPR, shouldTrackPR } from '../services/prService';
import { saveExerciseHistory } from '../services/exerciseHistoryService';
import { auth } from '../firebase';

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
  const [currentRound, setCurrentRound] = useState(1); // For supersets/AMRAP
  const [selectedExercise, setSelectedExercise] = useState<PlanExercise | null>(null);
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [celebratedPRs, setCelebratedPRs] = useState<Set<string>>(new Set());

  const haptic = useHaptic();
  const workoutBlocks = useMemo(() => session.blocks || [], [session]);
  const currentBlock = workoutBlocks[currentBlockIndex];

  // Flatten all exercises for overall progress
  const allExercises = useMemo(() => {
    return workoutBlocks.flatMap(block => Array.isArray(block.exercises) ? block.exercises : []);
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

  // Get upcoming steps (for preview)
  const upcomingSteps = useMemo(() => {
    const steps: string[] = [];
    const isSuperset = currentBlock?.type === 'superset';

    if (isSuperset) {
      // Show next exercise in superset
      if (currentExerciseInBlock < currentBlock.exercises.length - 1) {
        steps.push(currentBlock.exercises[currentExerciseInBlock + 1].exercise_name);
      } else if (currentRound < (currentBlock as SupersetBlock).rounds) {
        steps.push(`Rest ${currentExercise?.metrics_template?.rest_period_s || 90}s`);
        steps.push(`Round ${currentRound + 1} of ${(currentBlock as SupersetBlock).rounds}`);
      }
    } else {
      // Single exercise - show rest and next exercise
      if (currentRound < (currentExercise?.metrics_template?.target_sets || 3)) {
        steps.push(`Rest ${currentExercise?.metrics_template?.rest_period_s || 90}s`);
        steps.push(`Set ${currentRound + 1}`);
      } else if (currentBlockIndex < workoutBlocks.length - 1) {
        const nextBlock = workoutBlocks[currentBlockIndex + 1];
        steps.push(`Next: ${nextBlock.title || 'Next block'}`);
      }
    }

    return steps.slice(0, 3);
  }, [currentBlock, currentExerciseInBlock, currentRound, currentExercise, workoutBlocks, currentBlockIndex]);

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
      set: currentRound, // For supersets, set number = round number
      weight: Number(input.weight),
      reps: Number(input.reps),
      rpe: input.rpe,
    };

    // Save the set
    setLoggedData(prev => ({
      ...prev,
      [currentExercise.exercise_name]: [...(prev[currentExercise.exercise_name] || []), newSet]
    }));

    // Save to exercise history for auto-fill next time
    saveExerciseHistory(
      auth.currentUser?.uid,
      currentExercise.exercise_name,
      Number(input.weight),
      Number(input.reps)
    ).catch(console.error);

    // Check for PR (Personal Record) - only celebrate once per weight×reps combo
    if (shouldTrackPR(currentExercise.exercise_name)) {
      const prKey = `${currentExercise.exercise_name}_${input.weight}_${input.reps}`;

      if (!celebratedPRs.has(prKey)) {
        const prCheck = detectPR(
          currentExercise.exercise_name,
          Number(input.weight),
          Number(input.reps),
          allLogs
        );

        if (prCheck.isPR) {
          setCelebratedPRs(prev => new Set(prev).add(prKey));
          haptic.heavy();
          setTimeout(() => {
            notify({
              type: 'success',
              message: `🏆 NEW PR! ${currentExercise.exercise_name} - ${input.weight} kg × ${input.reps}`
            });
          }, 300);
        }
      }
    }

    // Determine next action based on block type
    if (currentBlock.type === 'superset') {
      handleSupersetLogic();
    } else if (currentBlock.type === 'amrap') {
      handleAmrapLogic();
    } else {
      // Single exercise logic
      handleSingleExerciseLogic();
    }
  };

  const handleSupersetLogic = () => {
    const block = currentBlock as SupersetBlock;
    const isLastExerciseInRound = currentExerciseInBlock === block.exercises.length - 1;

    if (isLastExerciseInRound) {
      // Completed a full round of the superset
      const isLastRound = currentRound >= block.rounds;

      if (isLastRound) {
        // Superset block complete - move to next block
        handleBlockComplete();
      } else {
        // More rounds to go - rest then start next round
        const lastExercise = block.exercises[currentExerciseInBlock];
        const restTime = lastExercise.metrics_template?.rest_period_s || 90;

        if (restTime > 0) {
          setRestDuration(restTime);
          setIsResting(true);
        }

        // After rest, go back to first exercise, increment round
        setCurrentExerciseInBlock(0);
        setCurrentRound(prev => prev + 1);
      }
    } else {
      // More exercises in this round - move to next exercise immediately
      setCurrentExerciseInBlock(prev => prev + 1);
      // No rest between superset exercises (they have rest_period_s: 0)
    }
  };

  const handleSingleExerciseLogic = () => {
    const targetSets = currentExercise?.metrics_template?.target_sets || 3;
    const isLastSet = currentRound >= targetSets;

    if (isLastSet) {
      // Exercise complete - move to next
      handleBlockComplete();
    } else {
      // More sets - rest then continue
      const restTime = currentExercise?.metrics_template?.rest_period_s || 90;

      if (restTime > 0) {
        setRestDuration(restTime);
        setIsResting(true);
      }

      setCurrentRound(prev => prev + 1);
    }
  };

  const handleAmrapLogic = () => {
    // For AMRAP, just log the set
    // User will complete when timer runs out
    notify({ type: 'success', message: 'Round logged!' });
  };

  const handleBlockComplete = () => {
    const nextBlockIndex = currentBlockIndex + 1;

    if (nextBlockIndex < workoutBlocks.length) {
      // Simple notification, auto-advance
      notify({
        type: 'success',
        message: `${currentBlock.title || 'Block'} complete!`
      });
      haptic.medium();

      // Auto-advance to next block
      setCurrentBlockIndex(nextBlockIndex);
      setCurrentExerciseInBlock(0);
      setCurrentRound(1);
    } else {
      // Workout complete!
      handleFinishWorkout();
    }
  };

  const handleFinishWorkout = () => {
    const duration = Math.round((new Date().getTime() - startTime.getTime()) / 60000);

    const exercises: LoggedExercise[] = Object.entries(loggedData).map(([name, sets]) => ({
      exercise_name: name,
      sets: sets as LoggedSetSRW[]
    }));

    onFinish({
      focus: session.focus,
      exercises,
      durationMinutes: duration
    });
  };

  const handleSkipExercise = () => {
    haptic.light();
    if (currentBlock.type === 'superset') {
      // Skip entire superset block
      handleBlockComplete();
    } else {
      handleBlockComplete();
    }
  };

  // Block completion screen
  if (showBlockCompletion && completedBlock) {
    return (
      <BlockCompletionScreen
        completedBlock={completedBlock}
        blockNumber={currentBlockIndex + 1}
        totalBlocks={workoutBlocks.length}
        nextBlock={workoutBlocks[currentBlockIndex + 1]}
        onContinue={handleContinueAfterBlock}
      />
    );
  }

  // AMRAP mode screen
  if (currentBlock?.type === 'amrap') {
    const amrapBlock = currentBlock as AmrapBlock;
    return (
      <div className="min-h-screen w-full max-w-2xl mx-auto flex flex-col bg-[var(--background)] px-5 py-6">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-[var(--surface-secondary)] transition">
            <XMarkIcon className="w-6 h-6 text-[var(--text-secondary)]" />
          </button>
          <p className="text-[11px] uppercase tracking-wider text-[var(--accent)] font-bold">AMRAP MODE</p>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="font-syne text-2xl font-bold text-[var(--text-primary)] text-center mb-3">
            {amrapBlock.title || 'AMRAP'}
          </h1>
          <p className="text-[13px] text-[var(--text-secondary)] text-center mb-6">
            As Many Rounds As Possible in {amrapBlock.duration_minutes} minutes
          </p>

          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 mb-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-3">
              EXERCISES IN THIS ROUND
            </p>
            <div className="space-y-2">
              {(Array.isArray(amrapBlock.exercises) ? amrapBlock.exercises : []).map((ex, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-[var(--surface-secondary)] rounded-full flex items-center justify-center text-[10px] font-bold text-[var(--text-tertiary)]">
                    {i + 1}
                  </span>
                  <span className="text-[14px] font-medium text-[var(--text-primary)]">{ex.exercise_name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleBlockComplete}
            className="w-full max-w-md py-5 rounded-xl font-bold text-[18px] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all"
            style={{ boxShadow: 'var(--glow-red)' }}
          >
            Complete AMRAP Block
          </button>
        </div>
      </div>
    );
  }

  // No current exercise = workout complete
  if (!currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="text-center">
          <h2 className="font-syne text-3xl font-bold text-[var(--text-primary)]">Workout Complete!</h2>
          <button
            onClick={handleFinishWorkout}
            className="mt-6 px-8 py-4 rounded-xl font-bold text-[18px] text-white bg-[var(--accent)] transition"
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

  // Determine what to show for set/round counter
  const isSuperset = currentBlock.type === 'superset';
  const totalRounds = isSuperset ? (currentBlock as SupersetBlock).rounds : targetSets;
  const exerciseNumberInSuperset = currentExerciseInBlock + 1;
  const totalExercisesInSuperset = currentBlock.exercises.length;

  return (
    <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-[var(--background)]">
      {/* Progress Bar */}
      <div className="sticky top-0 z-20 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="px-3 py-4 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="p-1 rounded-md hover:bg-[var(--surface-secondary)] transition"
          >
            <XMarkIcon className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
          <div className="flex-1 mx-2">
            <div className="h-1 bg-[var(--surface)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--accent)] transition-all duration-300 rounded-full"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-[9px] text-[var(--text-tertiary)] text-center mt-1 font-medium">
              {currentExerciseGlobalIndex + 1} / {allExercises.length}
            </p>
            {isSuperset && (
              <p className="text-center mt-1">
                <span className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-wide">
                  🔗 SUPERSET
                </span>
              </p>
            )}
          </div>
          <button
            onClick={() => setShowExerciseList(!showExerciseList)}
            className="flex items-center gap-1 px-2 py-1 bg-[var(--surface)] rounded-md border border-[var(--border)] hover:border-[var(--accent)] transition"
          >
            <span className="text-[10px] font-semibold text-[var(--accent)]">
              {showExerciseList ? '▼' : '▶ All'}
            </span>
          </button>
        </div>
      </div>

      {/* Exercise List Overlay */}
      {showExerciseList && (
        <div className="bg-[var(--surface)] border-b border-[var(--border)] px-3 py-2 max-h-48 overflow-y-auto">
          <p className="text-[9px] uppercase text-[var(--text-tertiary)] font-bold mb-2">TODAY'S WORKOUT</p>
          {workoutBlocks.map((block, i) => (
            <div key={i} className="mb-2">
              <p className="text-[10px] font-bold text-[var(--text-secondary)] mb-1">{block.title || `Block ${i+1}`}</p>
              {(Array.isArray(block.exercises) ? block.exercises : []).map((ex, j) => (
                <p key={j} className={`text-[11px] ${ex.exercise_name === currentExercise.exercise_name ? 'text-[var(--accent)] font-semibold' : 'text-[var(--text-tertiary)]'}`}>
                  • {ex.exercise_name}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Exercise Card */}
      <div className="flex-1 flex flex-col px-3 py-3 animate-fade-in">
        {/* Exercise Info */}
        <div className="mb-4">
          <BlockOverview totalBlocks={workoutBlocks.length} currentBlockIndex={currentBlockIndex} />
          <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium mb-2">
            {isSuperset ? `ROUND ${currentRound}/${totalRounds}` : `SET ${currentRound}/${totalRounds}`}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="font-syne text-xl font-bold text-[var(--text-primary)] leading-tight flex-1">
              {currentExercise.exercise_name}
            </h1>
            <button
              onClick={() => setSelectedExercise(currentExercise)}
              className="p-1.5 rounded-md hover:bg-[var(--surface-secondary)] transition"
              aria-label="Exercise info"
            >
              <QuestionMarkCircleIcon className="w-5 h-5 text-[var(--text-tertiary)] hover:text-[var(--accent)]" />
            </button>
          </div>

          {/* Metrics */}
          <div className="flex items-center flex-wrap gap-2 text-[12px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <RepeatIcon className="w-3.5 h-3.5" />
              {isSuperset ? `${totalRounds} rnds` : `${targetSets}×${targetReps}`}
            </span>
            {mt?.rest_period_s !== undefined && mt.rest_period_s > 0 && (
              <span className="flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5" />
                {mt.rest_period_s}s
              </span>
            )}
            {currentExercise.rpe && (
              <span className="flex items-center gap-1">
                <ZapIcon className="w-3.5 h-3.5" />
                RPE {currentExercise.rpe}
              </span>
            )}
          </div>

          {currentExercise.notes && (
            <p className="mt-3 text-[12px] text-[var(--text-secondary)] leading-relaxed bg-[var(--surface)] border border-[var(--border)] rounded-md p-3">
              💡 {currentExercise.notes}
            </p>
          )}

          {/* Coming Up */}
          {upcomingSteps.length > 0 && (
            <div className="mt-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-md p-2">
              <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">COMING UP</p>
              <div className="space-y-0.5">
                {upcomingSteps.map((step, i) => (
                  <p key={i} className="text-[12px] text-[var(--text-secondary)] flex items-center gap-1">
                    <span className="text-[var(--accent)]">→</span>
                    {step}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Last Performance */}
        {lastPerformance && (
          <div className="mb-3 bg-[var(--surface)] border border-[var(--border)] rounded-md p-2">
            <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-0.5">LAST</p>
            <p className="text-[13px] font-mono font-semibold text-[var(--text-primary)]">
              {lastPerformance.weight} × {lastPerformance.reps}
            </p>
          </div>
        )}

        {/* Input Section */}
        <div className="space-y-2 mb-4">
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Weight (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={currentInputData[currentExercise.exercise_name]?.weight || ''}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[16px] font-bold text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition"
              placeholder="185"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">Reps</label>
            <input
              type="number"
              inputMode="numeric"
              value={currentInputData[currentExercise.exercise_name]?.reps || ''}
              onChange={(e) => handleInputChange('reps', e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--surface)] border-2 border-[var(--border)] rounded-lg text-[16px] font-bold text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none transition"
              placeholder="10"
            />
          </div>
        </div>

        {/* Next Exercise Preview (for supersets) */}
        {isSuperset && currentExerciseInBlock < currentBlock.exercises.length - 1 && (
          <div className="mb-3 bg-[var(--accent-light)] border border-[var(--accent)] rounded-md p-3">
            <p className="text-[9px] uppercase tracking-wider text-[var(--accent)] font-bold mb-0.5">NEXT</p>
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">
              {currentBlock.exercises[currentExerciseInBlock + 1].exercise_name}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto space-y-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          <button
            onClick={handleCompleteSet}
            className="w-full py-3 rounded-lg font-semibold text-[13px] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            style={{ boxShadow: 'var(--glow-red)' }}
          >
            <CheckCircleIcon className="w-4 h-4" />
            {isSuperset
              ? (currentExerciseInBlock === currentBlock.exercises.length - 1
                  ? `Round ${currentRound}/${totalRounds}`
                  : 'Next')
              : `Set ${currentRound}/${totalRounds}`
            }
          </button>

          <button
            onClick={handleSkipExercise}
            className="w-full py-2 rounded-lg font-medium text-[12px] text-[var(--text-secondary)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] transition"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Exercise Explanation Modal */}
      {selectedExercise && (
        <ExerciseExplanationModal
          exerciseName={selectedExercise.exercise_name}
          exerciseNotes={selectedExercise.notes || undefined}
          isOpen={!!selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}

      {/* Rest Timer Overlay */}
      {isResting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
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
