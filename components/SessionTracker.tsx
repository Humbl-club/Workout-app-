import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PlanDay, LoggedSetSRW, WorkoutLog, LoggedExercise, PlanExercise, WorkoutBlock, SupersetBlock, AmrapBlock } from '../types';
import { XMarkIcon, CheckCircleIcon, TimerIcon, RepeatIcon, ClockIcon, ZapIcon, ArrowRightIcon, TrophyIcon, QuestionMarkCircleIcon, FlameIcon, ArrowRightLeftIcon, DumbbellIcon, SparklesIcon, TrendingUpIcon } from './icons';
import { useHaptic } from '../hooks/useAnimations';
import RestTimer from './RestTimer';
import BlockCompletionScreen from './BlockCompletionScreen';
import BlockOverview from './BlockOverview';
import ExerciseExplanationModal from './ExerciseExplanationModal';
import { notify } from './layout/Toast';
import { detectPR, shouldTrackPR, checkPRProgress } from '../services/prService';
import { useSaveExerciseHistory } from '../services/exerciseHistoryService';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import useUserProfile from '../hooks/useUserProfile';
import { cn } from '../lib/utils';

interface SessionTrackerProps {
  session: PlanDay;
  onFinish: (log: { focus: string, exercises: LoggedExercise[], durationMinutes: number }) => void;
  onCancel: () => void;
  allLogs: WorkoutLog[];
  onOpenChatWithMessage?: (message: string) => void;
}

export default function SessionTracker({ session, onFinish, onCancel, allLogs, onOpenChatWithMessage }: SessionTrackerProps) {
  const { t } = useTranslation();
  const saveExerciseHistory = useSaveExerciseHistory();
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
  const [completedWarmupExercises, setCompletedWarmupExercises] = useState<Set<string>>(new Set());
  const [celebratedMilestones, setCelebratedMilestones] = useState<Set<number>>(new Set());
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState<{ progress: number; message: string } | null>(null);
  const [showWarmupDetails, setShowWarmupDetails] = useState(true);

  const haptic = useHaptic();
  
  // User and performance tracking
  const { user } = useUser();
  const { userProfile } = useUserProfile();
  const userId = user?.id || null;

  // Performance tracking mutations
  const savePerformanceMutation = useMutation(api.sportBucketMutations.saveExercisePerformance);
  const updateSportBucketMutation = useMutation(api.sportBucketMutations.updateSportBucket);
  const updateSportPerformanceMutation = useMutation(api.sportBucketMutations.updateSportBucketPerformance);

  // Buddy notification mutation
  const notifyBuddyMutation = useMutation(api.buddyMutations.notifyBuddyWorkoutStart);

  // Notify buddies when workout starts
  useEffect(() => {
    if (userId) {
      notifyBuddyMutation({
        userId,
        workoutName: session.focus
      }).catch((error) => {
        // Log error but don't disrupt workout - buddy notifications are non-critical
        console.error('Failed to notify workout buddies:', error);
      });
    }
  }, []); // Only on mount
  const workoutBlocks = useMemo(() => {
    const blocks = session.blocks || [];
    // Filter out any invalid blocks (must have exercises array)
    return blocks.filter(block => 
      block && 
      Array.isArray(block.exercises) && 
      block.exercises.length > 0
    );
  }, [session]);
  const currentBlock = workoutBlocks[currentBlockIndex];
  
  // Safety check: if no valid blocks, show error
  if (workoutBlocks.length === 0) {
    return (
      <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col items-center justify-center p-4 bg-[var(--background)]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t('session.noWorkoutFound')}</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mb-4">
            {t('session.noExercisesMessage')}
          </p>
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-xl font-bold text-[13px] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition shadow-card"
          >
            {t('session.goBack')}
          </button>
        </div>
      </div>
    );
  }

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

  // Milestone celebrations
  useEffect(() => {
    const milestones = [
      { threshold: 0.25, message: '25% Complete! 💪', emoji: '🔥' },
      { threshold: 0.5, message: 'Halfway There!', emoji: '⚡' },
      { threshold: 0.75, message: 'Almost Done!', emoji: '🚀' }
    ];

    milestones.forEach(milestone => {
      if (progress >= milestone.threshold && !celebratedMilestones.has(milestone.threshold)) {
        setCelebratedMilestones(prev => new Set(prev).add(milestone.threshold));
        setShowMilestoneCelebration({ progress: milestone.threshold * 100, message: milestone.message });
        haptic.medium();

        setTimeout(() => {
          setShowMilestoneCelebration(null);
        }, 2500);
      }
    });
  }, [progress, celebratedMilestones, haptic]);

  // Get upcoming steps (for preview)
  const upcomingSteps = useMemo(() => {
    const steps: string[] = [];
    const isSuperset = currentBlock?.type === 'superset';

      if (isSuperset) {
      // Show next exercise in superset
      if (currentExerciseInBlock < currentBlock.exercises.length - 1) {
        steps.push(currentBlock.exercises[currentExerciseInBlock + 1].exercise_name);
      } else if (currentRound < (currentBlock as SupersetBlock).rounds) {
        steps.push(t('session.restWithTime', { seconds: currentExercise?.metrics_template?.rest_period_s || 90 }));
        steps.push(t('session.roundOf', { current: currentRound + 1, total: (currentBlock as SupersetBlock).rounds }));
      }
    } else {
      // Single exercise - show rest and next exercise
      if (currentRound < (currentExercise?.metrics_template?.target_sets || 3)) {
        steps.push(t('session.restWithTime', { seconds: currentExercise?.metrics_template?.rest_period_s || 90 }));
        steps.push(t('session.setNumber', { number: currentRound + 1 }));
      } else if (currentBlockIndex < workoutBlocks.length - 1) {
        const nextBlock = workoutBlocks[currentBlockIndex + 1];
        steps.push(`${t('session.next')}: ${nextBlock.title || t('session.nextBlock')}`);
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
      notify({ type: 'error', message: t('session.enterWeightAndReps') });
      return;
    }

    haptic.medium();

    const newSet: LoggedSetSRW = {
      set: currentRound, // For supersets, set number = round number
      weight: Number(input.weight),
      reps: Number(input.reps),
      rpe: input.rpe ?? null, // Ensure null instead of undefined
    };

    // Save the set
    setLoggedData(prev => ({
      ...prev,
      [currentExercise.exercise_name]: [...(prev[currentExercise.exercise_name] || []), newSet]
    }));

    // Save to exercise history for auto-fill next time
    saveExerciseHistory(
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
              message: t('session.newPR', { exercise: currentExercise.exercise_name, weight: input.weight, reps: input.reps })
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
    notify({ type: 'success', message: t('session.roundLogged') });
  };

  // Track performance data for intelligent exercise selection
  const trackExercisePerformance = async (exercise: PlanExercise, completed: boolean = true, skipped: boolean = false) => {
    if (!userId || !exercise) return;
    
    try {
      const loggedSets = loggedData[exercise.exercise_name] || [];
      const totalSets = loggedSets.length;
      const totalReps = loggedSets.reduce((sum, set) => sum + set.reps, 0);
      const avgWeight = totalSets > 0 ? loggedSets.reduce((sum, set) => sum + set.weight, 0) / totalSets : 0;
      const lastSet = loggedSets[loggedSets.length - 1];
      
      // Save performance data
      await savePerformanceMutation({
        user_id: userId,
        exercise_name: exercise.exercise_name,
        sport_context: userProfile?.trainingPreferences?.sport_specific || null,
        session_id: null, // We don't have session ID yet
        completed,
        skipped,
        substituted: false,
        substitute_reason: null,
        actual_sets: totalSets,
        actual_reps: totalReps,
        actual_weight: avgWeight,
        actual_duration_s: null,
        rpe: lastSet?.rpe ? parseInt(lastSet.rpe) : null,
        form_quality: null,
        pain_experienced: null,
        pain_location: null,
        was_pr: celebratedPRs.has(`${exercise.exercise_name}_${lastSet?.weight}_${lastSet?.reps}`),
        notes: null,
      });
      
      // Update sport bucket if user has sport-specific training
      if (userProfile?.trainingPreferences?.sport_specific) {
        await updateSportBucketMutation({
          sport: userProfile.trainingPreferences.sport_specific,
          exercise_name: exercise.exercise_name,
          category: exercise.category || 'main',
          placement: exercise.category || 'main',
          userId,
        });
        
        // Calculate performance score (0-100)
        const performanceScore = calculatePerformanceScore(completed, skipped, totalSets, exercise);
        
        await updateSportPerformanceMutation({
          sport: userProfile.trainingPreferences.sport_specific,
          exercise_name: exercise.exercise_name,
          success: completed && !skipped,
          performance_score: performanceScore,
        });
      }
    } catch (error) {
      console.error('Failed to track exercise performance:', error);
      // Don't show error to user - this is background tracking
    }
  };
  
  // Calculate performance score based on completion and targets
  const calculatePerformanceScore = (completed: boolean, skipped: boolean, actualSets: number, exercise: PlanExercise): number => {
    if (skipped) return 0;
    if (!completed) return 30;
    
    const targetSets = exercise.metrics_template?.target_sets || 3;
    const setCompletion = Math.min(actualSets / targetSets, 1) * 100;
    
    // Base score of 70 for completion, plus up to 30 for meeting targets
    return 70 + (setCompletion * 0.3);
  };

  const handleBlockComplete = async () => {
    // Track performance for the completed exercise
    if (currentExercise) {
      await trackExercisePerformance(currentExercise, true, false);
    }
    
    const nextBlockIndex = currentBlockIndex + 1;

    if (nextBlockIndex < workoutBlocks.length) {
      // Simple notification, auto-advance
      notify({
        type: 'success',
        message: `${currentBlock.title || t('session.blockCompleteTitle')} ${t('session.blockComplete').replace('!', '')}`
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

  const handleSkipExercise = async () => {
    haptic.light();
    
    // Track that this exercise was skipped
    if (currentExercise) {
      await trackExercisePerformance(currentExercise, false, true);
    }
    
    if (currentBlock.type === 'superset') {
      // Skip entire superset block
      handleBlockComplete();
    } else {
      handleBlockComplete();
    }
  };

  // Check if this is a warmup block (all exercises are warmup category OR block title suggests warmup)
  const isWarmupBlock = currentBlock && 
    Array.isArray(currentBlock.exercises) && 
    currentBlock.exercises.length > 0 && (
      currentBlock.exercises.every(ex => ex && ex.category === 'warmup') ||
      (currentBlock.title && /warmup|warm-up|warm up/i.test(currentBlock.title))
    );
  
  // Warmup block screen - show all exercises as checklist
  if (isWarmupBlock && currentBlock) {
    // Show ALL exercises in the warmup block - don't filter by category
    // If block is detected as warmup, show all exercises regardless of category
    const warmupExercises = Array.isArray(currentBlock.exercises) 
      ? currentBlock.exercises.filter(ex => ex && ex.exercise_name) 
      : [];
    const allWarmupsComplete = warmupExercises.length > 0 && warmupExercises.every(ex => completedWarmupExercises.has(ex.exercise_name));
    
    // Debug: Log warmup exercises
    console.log('Warmup block detected:', {
      blockTitle: currentBlock.title,
      totalExercises: currentBlock.exercises.length,
      warmupExerciseCount: warmupExercises.length,
      allExercises: currentBlock.exercises.map(ex => ({
        name: ex.exercise_name,
        category: ex.category,
        notes: ex.notes
      })),
      filteredWarmupExercises: warmupExercises.map(ex => ({
        name: ex.exercise_name,
        category: ex.category,
        notes: ex.notes
      }))
    });
    
    return (
      <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-[var(--background)]">
        {/* Progress Bar */}
        <div className="sticky top-0 z-20 bg-[var(--background)] border-b border-[var(--border)]">
          <div className="px-3 py-2 flex items-center justify-between">
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
            </div>
            <div className="w-8"></div>
          </div>
        </div>

        {/* Warmup Content */}
        <div className="flex-1 flex flex-col px-3 py-3 animate-fade-in">
          <div className="mb-4 text-center">
            <div className="inline-flex items-center gap-2 mb-2">
              <FlameIcon className="w-6 h-6 text-[var(--accent-mobility)]" />
              <h1 className="text-xl font-bold text-[var(--text-primary)]">{t('session.warmup')}</h1>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)]">
              {t('session.warmupInstructions')}
            </p>
          </div>

          {/* Bulk Actions */}
          {warmupExercises.length > 0 && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  warmupExercises.forEach(ex => {
                    setCompletedWarmupExercises(prev => new Set(prev).add(ex.exercise_name));
                  });
                  haptic.medium();
                }}
                className="flex-1 h-12 bg-gradient-to-r from-[var(--success)] to-[var(--accent-recovery)] text-white rounded-xl font-bold text-[14px] hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <CheckCircleIcon className="w-5 h-5" />
                Mark All Done
              </button>

              <button
                onClick={() => setShowWarmupDetails(!showWarmupDetails)}
                className="px-4 h-12 bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl font-semibold text-[14px] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all"
              >
                {showWarmupDetails ? 'Grid' : 'Details'}
              </button>
            </div>
          )}

          {warmupExercises.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-[var(--text-secondary)] mb-2">
                {t('session.noWarmupFound')}
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                {t('plan.block', { number: currentBlockIndex + 1 })}: {currentBlock.title || t('session.untitled')} | {t('session.exercises')}: {currentBlock.exercises.length}
              </p>
              {currentBlock.exercises.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="text-[11px] text-[var(--text-tertiary)] mb-2">{t('session.exercisesInBlock')}</p>
                  {currentBlock.exercises.map((ex, idx) => (
                    <p key={idx} className="text-[12px] text-[var(--text-secondary)]">
                      • {ex.exercise_name} ({t('session.category')}: {ex.category || 'undefined'})
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {warmupExercises.map((exercise, index) => {
                const isCompleted = completedWarmupExercises.has(exercise.exercise_name);
                const mt = exercise.metrics_template;
                const duration = mt?.type === 'sets_duration' ? mt.target_duration_s : null;
                const reps = mt?.target_reps || null;
                const sets = mt?.target_sets || null;
                
                return (
                  <div
                    key={`${exercise.exercise_name}-${index}`}
                    className={`bg-[var(--surface)] border-2 rounded-lg p-3 transition-all ${
                      isCompleted 
                        ? 'border-[var(--accent-mobility)] bg-[var(--accent-light)]' 
                        : 'border-[var(--border)] hover:border-[var(--accent-mobility)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => {
                          const newCompleted = new Set(completedWarmupExercises);
                          if (isCompleted) {
                            newCompleted.delete(exercise.exercise_name);
                          } else {
                            newCompleted.add(exercise.exercise_name);
                          }
                          setCompletedWarmupExercises(newCompleted);
                          haptic.light();
                        }}
                        className={`mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
                          isCompleted
                            ? 'bg-[var(--accent-mobility)] border-[var(--accent-mobility)]'
                            : 'border-[var(--border-strong)] hover:border-[var(--accent-mobility)] bg-[var(--surface-secondary)]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                        ) : (
                          <span className="text-[12px] font-bold text-[var(--text-tertiary)]">{index + 1}</span>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-semibold text-[15px] leading-tight flex-1 ${isCompleted ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`}>
                            {exercise.exercise_name}
                          </h3>
                          <div className="flex items-center gap-1">
                            {onOpenChatWithMessage && (
                              <button
                                onClick={() => {
                                  const swapMessage = t('session.swapExerciseMessage', { exercise: exercise.exercise_name });
                                  onOpenChatWithMessage(swapMessage);
                                }}
                                className="p-1.5 rounded-md hover:bg-[var(--surface-secondary)] transition shrink-0"
                                aria-label={`Swap ${exercise.exercise_name}`}
                                title={t('session.swapExercise')}
                              >
                                <ArrowRightLeftIcon className="w-5 h-5 text-[var(--text-tertiary)] hover:text-[var(--accent)]" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedExercise(exercise)}
                              className="p-1.5 rounded-md hover:bg-[var(--surface-secondary)] transition shrink-0"
                              aria-label={`Learn about ${exercise.exercise_name}`}
                              title={t('session.getExplanation')}
                            >
                              <QuestionMarkCircleIcon className="w-5 h-5 text-[var(--text-tertiary)] hover:text-[var(--accent)]" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Metrics */}
                        {(duration || reps || sets) && (
                          <div className="flex items-center gap-2 mb-2">
                            {sets && reps && (
                              <span className="text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded">
                                {sets}×{reps}
                              </span>
                            )}
                            {duration && (
                              <span className="text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded">
                                {duration}s
                              </span>
                            )}
                            {reps && !sets && (
                              <span className="text-[11px] font-medium text-[var(--text-secondary)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded">
                                {t('session.repsCount', { count: reps })}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Notes */}
                        {exercise.notes && (
                          <p className="text-[12px] text-[var(--text-secondary)] mt-1 leading-relaxed">
                            💡 {exercise.notes}
                          </p>
                        )}
                        
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Complete Button */}
          <div className="mt-auto pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
            <button
              onClick={() => {
                // Mark all warmup exercises as logged (empty sets for warmups)
                const warmupLoggedData: Record<string, LoggedSetSRW[]> = {};
                warmupExercises.forEach(ex => {
                  warmupLoggedData[ex.exercise_name] = [{
                    set: 1,
                    weight: 0,
                    reps: 1
                  }];
                });
                setLoggedData(prev => ({ ...prev, ...warmupLoggedData }));
                
                // Move to next block
                handleBlockComplete();
              }}
              disabled={!allWarmupsComplete}
              className={`w-full py-3 rounded-lg font-semibold text-[13px] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:bg-[var(--surface-secondary)] disabled:text-[var(--text-tertiary)] disabled:cursor-not-allowed ${allWarmupsComplete ? 'shadow-card' : ''}`}
            >
              <CheckCircleIcon className="w-4 h-4" />
              {allWarmupsComplete ? t('session.completeWarmup') : t('session.completeExercises', { completed: completedWarmupExercises.size, total: warmupExercises.length })}
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
      </div>
    );
  }

  // AMRAP mode screen
  if (currentBlock?.type === 'amrap') {
    const amrapBlock = currentBlock as AmrapBlock;
    return (
      <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col bg-[var(--background)] px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-[var(--surface-secondary)] transition">
            <XMarkIcon className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>
          <p className="text-[9px] uppercase tracking-wider text-[var(--accent)] font-bold">{t('session.amrapMode')}</p>
          <div className="w-8"></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
            {amrapBlock.title || t('session.amrap')}
          </h1>
          <p className="text-[12px] text-[var(--text-secondary)] text-center mb-4">
            {t('session.amrap')} - {amrapBlock.duration_minutes} {t('workout.min')}
          </p>

          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 mb-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-2">
              {t('session.exercisesRounds')}
            </p>
            <div className="space-y-1.5">
              {(Array.isArray(amrapBlock.exercises) ? amrapBlock.exercises : []).map((ex, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-[var(--surface-secondary)] rounded-full flex items-center justify-center text-[9px] font-bold text-[var(--text-tertiary)]">
                    {i + 1}
                  </span>
                  <span className="text-[13px] font-medium text-[var(--text-primary)]">{ex.exercise_name}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleBlockComplete}
            className="w-full max-w-md py-3 rounded-xl font-bold text-[13px] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all shadow-card"
          >
            {t('session.completeAmrapBlock', { number: currentBlockIndex + 1 })}
          </button>
        </div>
      </div>
    );
  }

  // Safety check: if no current block, something went wrong
  if (!currentBlock) {
    return (
      <div className="min-h-screen w-full max-w-lg mx-auto flex flex-col items-center justify-center p-4 bg-[var(--background)]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t('errors.somethingWentWrong')}</h2>
          <p className="text-[13px] text-[var(--text-secondary)] mb-4">
            {t('session.noExercisesMessage')}
          </p>
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-xl font-bold text-[13px] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] transition shadow-card"
          >
            {t('session.goBack')}
          </button>
        </div>
      </div>
    );
  }

  // No current exercise = workout complete
  if (!currentExercise) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('session.workoutComplete')}</h2>
          <button
            onClick={handleFinishWorkout}
            className="mt-4 px-6 py-3 rounded-xl font-bold text-[13px] text-white bg-[var(--accent)] transition shadow-card"
          >
            {t('session.finishSession')}
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
      {/* Enhanced Progress Bar with Milestones */}
      <div className="sticky top-0 z-20 bg-[var(--background)]/95 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={onCancel}
              className="p-2 rounded-full hover:bg-[var(--surface-secondary)] transition-all active:scale-95"
            >
              <XMarkIcon className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>

            <div className="flex-1">
              {/* Multi-layer progress bar */}
              <div className="relative h-3 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
                {/* Segment markers (one per exercise) */}
                <div className="absolute inset-0 flex">
                  {allExercises.map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 border-r border-[var(--background)]"
                      style={{ opacity: i < currentExerciseGlobalIndex ? 0 : 0.3 }}
                    />
                  ))}
                </div>

                {/* Gradient progress with shimmer */}
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700 ease-out relative"
                  style={{
                    width: `${progress * 100}%`,
                    background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 50%, var(--primary) 100%)',
                    backgroundSize: '200% 100%'
                  }}
                >
                  {/* Shimmer effect */}
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    style={{ animation: 'shimmer 3s ease infinite' }}
                  />
                  {/* Pulsing leading edge */}
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-sm"></div>
                </div>

                {/* Milestone markers (25%, 50%, 75%) */}
                {[0.25, 0.5, 0.75].map((milestone, i) => (
                  <div
                    key={i}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 transition-all duration-500 rounded-full",
                      progress >= milestone
                        ? "w-1.5 h-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                        : "w-1 h-4 bg-[var(--border-strong)]"
                    )}
                    style={{
                      left: `${milestone * 100}%`,
                      transform: `translateX(-50%) translateY(-50%)`
                    }}
                  />
                ))}
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between mt-2 px-1">
                <div className="flex items-center gap-1.5">
                  <DumbbellIcon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <span className="text-[12px] font-bold text-[var(--text-secondary)]">
                    {currentExerciseGlobalIndex + 1} / {allExercises.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent)]/20">
                  <span className="text-[12px] font-black text-[var(--accent)] tabular-nums">
                    {Math.round(progress * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                  <span className="text-[12px] font-mono font-bold text-[var(--primary)] tabular-nums">
                    {Math.floor((Date.now() - startTime.getTime()) / 60000)}:{String(Math.floor(((Date.now() - startTime.getTime()) / 1000) % 60)).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {isSuperset && (
                <p className="text-center mt-1">
                  <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wide">
                    {t('session.superset')}
                  </span>
                </p>
              )}
            </div>

            <button
              onClick={() => setShowExerciseList(!showExerciseList)}
              className="flex items-center gap-1 px-3 py-2 bg-[var(--surface)] rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all active:scale-95"
            >
              <span className="text-[11px] font-bold text-[var(--primary)]">
                {showExerciseList ? '▼' : 'List'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Exercise List Overlay */}
      {showExerciseList && (
        <div className="bg-[var(--surface)] border-b border-[var(--border)] px-3 py-2 max-h-48 overflow-y-auto">
          <p className="text-[9px] uppercase text-[var(--text-tertiary)] font-bold mb-2">{t('session.todaysWorkout')}</p>
          {workoutBlocks.map((block, i) => (
            <div key={i} className="mb-2">
              <p className="text-[10px] font-bold text-[var(--text-secondary)] mb-1">{block.title || t('plan.block', { number: i+1 })}</p>
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
        <div className="mb-3">
          <BlockOverview totalBlocks={workoutBlocks.length} currentBlockIndex={currentBlockIndex} />
          <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-medium mb-1">
            {isSuperset ? t('session.roundOf', { current: currentRound, total: totalRounds }) : t('session.setOf', { current: currentRound, total: totalRounds })}
          </p>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-xl font-bold text-[var(--text-primary)] leading-tight flex-1">
              {currentExercise.exercise_name}
            </h1>
            <div className="flex items-center gap-1">
              {onOpenChatWithMessage && (
                <button
                  onClick={() => {
                    const swapMessage = t('session.swapExerciseMessage', { exercise: currentExercise.exercise_name });
                    onOpenChatWithMessage(swapMessage);
                  }}
                  className="p-1.5 rounded-md hover:bg-[var(--surface-secondary)] transition shrink-0"
                  aria-label={`Swap ${currentExercise.exercise_name}`}
                  title={t('session.swapExercise')}
                >
                  <ArrowRightLeftIcon className="w-5 h-5 text-[var(--text-tertiary)] hover:text-[var(--accent)]" />
                </button>
              )}
              <button
                onClick={() => setSelectedExercise(currentExercise)}
                className="p-1.5 rounded-md hover:bg-[var(--surface-secondary)] transition shrink-0"
                aria-label="Exercise info"
              >
                <QuestionMarkCircleIcon className="w-5 h-5 text-[var(--text-tertiary)] hover:text-[var(--accent)]" />
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center flex-wrap gap-2 text-[12px] text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <RepeatIcon className="w-3.5 h-3.5" />
              {isSuperset ? t('session.roundsShort', { count: totalRounds }) : `${targetSets}×${targetReps}`}
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
                {t('session.rpeValue', { value: currentExercise.rpe })}
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
              <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">{t('session.comingUp')}</p>
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

        {/* Smart Weight Suggestions - 1-Tap Logging */}
        {lastPerformance && currentRound > 1 && (
          <div className="mb-4 p-4 bg-gradient-to-br from-[var(--primary-light)] to-[var(--accent-light)] border-2 border-[var(--primary)]/30 rounded-2xl shadow-sm">
            <p className="text-[12px] font-bold text-[var(--primary)] mb-3 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              Smart Suggestions
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Last set */}
              <button
                onClick={() => {
                  const input = currentInputData[currentExercise.exercise_name];
                  if (input?.weight && input?.reps) {
                    handleCompleteSet();
                  }
                }}
                className="p-3 bg-white border-2 border-[var(--primary)] rounded-xl hover:bg-[var(--primary-light)] transition-all active:scale-95 shadow-sm"
              >
                <p className="text-[10px] text-[var(--text-tertiary)] font-bold mb-1">
                  REPEAT LAST
                </p>
                <p className="text-[20px] font-black text-[var(--primary)] performance-data">
                  {lastPerformance.weight} × {lastPerformance.reps}
                </p>
              </button>

              {/* Progressive overload */}
              <button
                onClick={() => {
                  setCurrentInputData(prev => ({
                    ...prev,
                    [currentExercise.exercise_name]: {
                      weight: Number(lastPerformance.weight) + 2.5,
                      reps: lastPerformance.reps
                    }
                  }));
                }}
                className="p-3 bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent)]/10 border-2 border-[var(--accent)] rounded-xl hover:shadow-md transition-all active:scale-95"
              >
                <p className="text-[10px] text-[var(--accent)] font-bold mb-1 flex items-center gap-1">
                  <TrendingUpIcon className="w-3 h-3" />
                  PROGRESS
                </p>
                <p className="text-[20px] font-black text-[var(--accent)] performance-data">
                  {Number(lastPerformance.weight) + 2.5} × {lastPerformance.reps}
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Input Section - Premium */}
        <div className="space-y-3 mb-3">
          <div>
            <label className="text-label mb-2 block flex items-center gap-2">
              <DumbbellIcon className="w-3.5 h-3.5" />
              {t('session.weightLabel')}
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                value={currentInputData[currentExercise.exercise_name]?.weight || ''}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="w-full h-16 px-4 pr-16 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl text-[24px] font-black text-[var(--text-primary)] tabular-nums performance-data focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:bg-gradient-to-br focus:from-[var(--primary-light)] focus:to-transparent focus:outline-none transition-all placeholder:text-[var(--text-tertiary)]"
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[18px] font-bold text-[var(--text-primary)]">
                kg
              </span>
            </div>

            {/* Quick adjust buttons */}
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[-5, -2.5, +2.5, +5].map((delta) => (
                <button
                  key={delta}
                  onClick={() => {
                    const current = Number(currentInputData[currentExercise.exercise_name]?.weight || 0);
                    const newWeight = Math.max(0, current + delta);
                    handleInputChange('weight', newWeight.toString());
                  }}
                  className={cn(
                    "h-10 rounded-xl font-bold text-[14px] transition-all active:scale-90 border-2",
                    delta < 0
                      ? "bg-[var(--error-light)] border-[var(--error)]/20 text-[var(--error)] hover:bg-[var(--error)]/10 hover:border-[var(--error)]/40"
                      : "bg-[var(--success-light)] border-[var(--success)]/20 text-[var(--success)] hover:bg-[var(--success)]/10 hover:border-[var(--success)]/40"
                  )}
                >
                  {delta > 0 ? '+' : ''}{delta}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-label mb-2 block flex items-center gap-2">
              <RepeatIcon className="w-3.5 h-3.5" />
              {t('session.repsLabel')}
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={currentInputData[currentExercise.exercise_name]?.reps || ''}
              onChange={(e) => handleInputChange('reps', e.target.value)}
              className="w-full h-16 px-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl text-[24px] font-black text-[var(--text-primary)] tabular-nums performance-data focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 focus:bg-gradient-to-br focus:from-[var(--primary-light)] focus:to-transparent focus:outline-none transition-all placeholder:text-[var(--text-tertiary)]"
              placeholder="0"
            />
          </div>
        </div>

        {/* Next Exercise Preview (for supersets) */}
        {isSuperset && currentExerciseInBlock < currentBlock.exercises.length - 1 && (
          <div className="mb-3 bg-[var(--accent-light)] border border-[var(--accent)] rounded-md p-3">
            <p className="text-[9px] uppercase tracking-wider text-[var(--accent)] font-bold mb-0.5">{t('session.nextExercise')}</p>
            <p className="text-[13px] font-semibold text-[var(--text-primary)]">
              {currentBlock.exercises[currentExerciseInBlock + 1].exercise_name}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto space-y-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          <button
            onClick={handleCompleteSet}
            className="w-full py-3 rounded-lg font-semibold text-[13px] text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-card"
          >
            <CheckCircleIcon className="w-4 h-4" />
            {isSuperset
              ? (currentExerciseInBlock === currentBlock.exercises.length - 1
                  ? t('session.roundOf', { current: currentRound, total: totalRounds })
                  : t('common.next'))
              : t('session.setOf', { current: currentRound, total: totalRounds })
            }
          </button>

          <button
            onClick={handleSkipExercise}
            className="w-full py-2 rounded-lg font-medium text-[12px] text-[var(--text-secondary)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] transition"
          >
            {t('common.skip')}
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

      {/* Milestone Celebration Popup */}
      {showMilestoneCelebration && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 animate-fade-in-down px-4">
          <div className={cn(
            "px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3",
            "backdrop-blur-xl border-2",
            showMilestoneCelebration.progress === 25
              ? "bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] border-[var(--primary)]/40"
              : showMilestoneCelebration.progress === 50
              ? "bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] border-[var(--accent)]/40"
              : "bg-gradient-to-r from-[var(--success)] to-[var(--accent-recovery)] border-[var(--success)]/40",
            "text-white font-bold text-[16px]"
          )}>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {showMilestoneCelebration.progress === 25 ? (
                <FlameIcon className="w-6 h-6" />
              ) : showMilestoneCelebration.progress === 50 ? (
                <ZapIcon className="w-6 h-6" />
              ) : (
                <TrophyIcon className="w-6 h-6" />
              )}
            </div>
            <span>{showMilestoneCelebration.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
