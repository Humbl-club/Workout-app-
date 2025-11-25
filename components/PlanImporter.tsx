import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutPlan, TrainingPreferences } from '../types';
import { parseWorkoutPlan, generateNewWorkoutPlan } from '../services/geminiService';
import { LogoIcon, UploadIcon, SparklesIcon, XCircleIcon, DocumentIcon, ArrowLeftIcon, ArrowRightIcon } from './icons';
import { useUser } from '@clerk/clerk-react';
import useUserProfile from '../hooks/useUserProfile';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { hasExceededLimit, getLimitMessage, getRemainingUsage } from '../lib/rateLimiter';

interface OnboardingProps {
  onPlanGenerated: (plan: Omit<WorkoutPlan, 'id'>) => void;
}

type OnboardingStep = 'welcome' | 'goal' | 'experience' | 'frequency' | 'metrics' | 'profile' | 'pain' | 'sport' | 'sport_specific' | 'notes' | 'generate' | 'custom';
type Goal = 'Aesthetic Physique' | 'Strength & Power' | 'Athletic Performance' | 'Health & Longevity';
type Experience = 'Beginner' | 'Intermediate' | 'Advanced';
type Frequency = '2-3' | '3-4' | '4-5' | '5+';
type PainPoint = 'Knees' | 'Lower Back' | 'Shoulders' | 'Wrists';

// Helper function to get pain point options with translations
const getPainPointsOptions = (t: (key: string) => string): { id: PainPoint, label: string, description: string }[] => [
    { id: 'Knees', label: t('onboarding.painPoints.knees.label'), description: t('onboarding.painPoints.knees.description') },
    { id: 'Lower Back', label: t('onboarding.painPoints.lowerBack.label'), description: t('onboarding.painPoints.lowerBack.description') },
    { id: 'Shoulders', label: t('onboarding.painPoints.shoulders.label'), description: t('onboarding.painPoints.shoulders.description') },
    { id: 'Wrists', label: t('onboarding.painPoints.wrists.label'), description: t('onboarding.painPoints.wrists.description') },
];

// Helper function to get sport options with translations
const getSportOptions = (t: (key: string) => string): { id: string, label: string, description: string, physical_focus: string }[] => [
    { id: 'rock_climbing', label: t('onboarding.sports.rockClimbing.label'), description: t('onboarding.sports.rockClimbing.description'), physical_focus: t('onboarding.sports.rockClimbing.physicalFocus') },
    { id: 'hyrox', label: t('onboarding.sports.hyrox.label'), description: t('onboarding.sports.hyrox.description'), physical_focus: t('onboarding.sports.hyrox.physicalFocus') },
    { id: 'boxing_mma', label: t('onboarding.sports.boxingMma.label'), description: t('onboarding.sports.boxingMma.description'), physical_focus: t('onboarding.sports.boxingMma.physicalFocus') },
    { id: 'basketball', label: t('onboarding.sports.basketball.label'), description: t('onboarding.sports.basketball.description'), physical_focus: t('onboarding.sports.basketball.physicalFocus') },
    { id: 'soccer', label: t('onboarding.sports.soccer.label'), description: t('onboarding.sports.soccer.description'), physical_focus: t('onboarding.sports.soccer.physicalFocus') },
    { id: 'tennis', label: t('onboarding.sports.tennis.label'), description: t('onboarding.sports.tennis.description'), physical_focus: t('onboarding.sports.tennis.physicalFocus') },
    { id: 'running_marathon', label: t('onboarding.sports.runningMarathon.label'), description: t('onboarding.sports.runningMarathon.description'), physical_focus: t('onboarding.sports.runningMarathon.physicalFocus') },
    { id: 'swimming', label: t('onboarding.sports.swimming.label'), description: t('onboarding.sports.swimming.description'), physical_focus: t('onboarding.sports.swimming.physicalFocus') },
    { id: 'cycling', label: t('onboarding.sports.cycling.label'), description: t('onboarding.sports.cycling.description'), physical_focus: t('onboarding.sports.cycling.physicalFocus') },
    { id: 'track_field', label: t('onboarding.sports.trackField.label'), description: t('onboarding.sports.trackField.description'), physical_focus: t('onboarding.sports.trackField.physicalFocus') },
];

// Helper function to get goal options with translations
const getGoalOptions = (t: (key: string) => string): { id: Goal, label: string, description: string }[] => [
    { id: 'Aesthetic Physique', label: t('onboarding.goals.aestheticPhysique.label'), description: t('onboarding.goals.aestheticPhysique.description') },
    { id: 'Strength & Power', label: t('onboarding.goals.strengthPower.label'), description: t('onboarding.goals.strengthPower.description') },
    { id: 'Athletic Performance', label: t('onboarding.goals.athleticPerformance.label'), description: t('onboarding.goals.athleticPerformance.description') },
    { id: 'Health & Longevity', label: t('onboarding.goals.healthLongevity.label'), description: t('onboarding.goals.healthLongevity.description') },
];


export default function Onboarding({ onPlanGenerated }: OnboardingProps) {
  const { t } = useTranslation();
  const { user } = useUser();
  const { userProfile, updateUserProfile } = useUserProfile();
  const incrementPlanUsageMutation = useMutation(api.mutations.incrementPlanUsage);
  const incrementParseUsageMutation = useMutation(api.mutations.incrementParseUsage);
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [goalExplanation, setGoalExplanation] = useState<string>(''); // User's own words about their goal
  const [experience, setExperience] = useState<Experience | null>(null);
  const [frequency, setFrequency] = useState<Frequency | null>(null);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [sport, setSport] = useState('');
  const [sportSpecific, setSportSpecific] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Body metrics for intelligent exercise selection
  const [weight, setWeight] = useState<number | null>(null); // kg
  const [height, setHeight] = useState<number | null>(null); // cm

  // New profile fields
  const [sex, setSex] = useState<'male' | 'female' | 'other' | ''>('');
  const [equipment, setEquipment] = useState<'minimal' | 'home_gym' | 'commercial_gym' | ''>('');
  const [sessionLength, setSessionLength] = useState<'30' | '45' | '60' | '75' | ''>('');
  const [athleticLevel, setAthleticLevel] = useState<'low' | 'moderate' | 'high' | ''>('');
  const [trainingAgeYears, setTrainingAgeYears] = useState<number | ''>('');
  const [bodyType, setBodyType] = useState<'lean' | 'average' | 'muscular' | ''>('');

  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper functions for progress tracking
  const getStepOrder = (): OnboardingStep[] => {
    return ['welcome', 'goal', 'experience', 'frequency', 'metrics', 'profile', 'pain', 'sport', 'sport_specific', 'notes', 'generate'];
  };

  const getCurrentStepNumber = (): number => {
    if (step === 'custom') return 1;
    const steps = getStepOrder();
    const index = steps.indexOf(step);
    return index >= 0 ? index + 1 : 1;
  };

  const getTotalSteps = (): number => {
    return step === 'custom' ? 1 : getStepOrder().length;
  };
  
  const handleGeneratePersonalizedPlan = useCallback(async () => {
    if (!goal || !experience || !frequency) {
        setError(t('onboarding.missingSelections'));
        return;
    }

    // Check rate limits before generating plan
    if (user?.id && userProfile) {
      const tier = userProfile.apiUsage?.tier || 'free';
      const usage = userProfile.apiUsage;

      if (usage && hasExceededLimit(usage, tier, 'plan')) {
        const remaining = getRemainingUsage(usage, tier);
        setError(getLimitMessage('plan', tier, remaining));
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    console.log('Starting plan generation...');
    try {
        console.log('Calling generateNewWorkoutPlan...');
        // Include goal explanation, sport-specific details, and body metrics in notes
        let enhancedNotes = notes;
        if (goalExplanation.trim()) {
          enhancedNotes = `${enhancedNotes ? enhancedNotes + ' ' : ''}Goal details: ${goalExplanation}`.trim();
        }
        if (sportSpecific) {
          const sportDetails = getSportOptions(t).find(s => s.id === sportSpecific);
          if (sportDetails) {
            enhancedNotes = `${enhancedNotes ? enhancedNotes + ' ' : ''}Sport-specific focus: ${sportDetails.physical_focus}`.trim();
          }
        }
        
        // Add weight information for exercise selection
        if (weight) {
            const weightInKg = weight || null;
          enhancedNotes = `${enhancedNotes ? enhancedNotes + ' ' : ''}Body weight: ${weightInKg.toFixed(1)}kg`;
          
          // Add specific guidance for heavier individuals
          if (weightInKg > 120) {
            enhancedNotes += ' (IMPORTANT: Prioritize low-impact exercises, avoid high-impact plyometrics and running, focus on controlled movements)';
          } else if (weightInKg > 100) {
            enhancedNotes += ' (Consider: Modified plyometrics, controlled jumping, gradual impact progression)';
          }
        }
        
        const planData = await generateNewWorkoutPlan(goal, experience, frequency, painPoints, sport, enhancedNotes, true, {
          sex: sex || undefined,
          equipment: equipment || undefined,
          preferred_session_length: sessionLength || undefined,
          athletic_level: athleticLevel || undefined,
          training_age_years: trainingAgeYears === '' ? undefined : Number(trainingAgeYears),
          body_type: bodyType || undefined,
          weight: weight || undefined, // kg
          height: height || undefined, // cm
        }); // Enable optimized knowledge
        console.log('Plan generated successfully:', planData);
        
        if (!planData || !planData.weeklyPlan || planData.weeklyPlan.length === 0) {
            throw new Error(t('onboarding.invalidPlan'));
        }
        
        const plan: Omit<WorkoutPlan, 'id'> = {
            ...planData,
            name: `${goal} Program`
        };

        // Track plan generation for rate limiting
        if (user?.id) {
            await incrementPlanUsageMutation({ userId: user.id });
        }

        // Save user preferences to profile
        if (user?.id) {
                const preferences: TrainingPreferences = {
                primary_goal: goal,
                goal_explanation: goalExplanation.trim() || null,
                experience_level: experience,
                training_frequency: frequency,
                pain_points: painPoints,
                sport: sport.trim() || null,
                sport_specific: sportSpecific || null,
                additional_notes: notes.trim() || null,
                last_updated: new Date().toISOString(),
                sex: sex || undefined,
                equipment: equipment || undefined,
                preferred_session_length: sessionLength || undefined,
                athletic_level: athleticLevel || undefined,
                training_age_years: trainingAgeYears === '' ? undefined : Number(trainingAgeYears),
                body_type: bodyType || undefined,
            };
            
            // Also save body metrics if provided
            const bodyMetrics = (weight || height) ? {
                weight: weight || undefined, // kg
                height: height || undefined, // cm
                heightUnit: 'cm' as const,
                lastUpdated: new Date().toISOString(),
            } : undefined;
            
            try {
                await updateUserProfile({ 
                    trainingPreferences: preferences,
                    ...(bodyMetrics && { bodyMetrics })
                });
                console.log('Saved user training preferences and body metrics');
            } catch (e) {
                console.error('Failed to save preferences:', e);
                // Don't block plan generation if preferences save fails
            }
        }
        
        console.log('Calling onPlanGenerated with plan:', plan);
        await onPlanGenerated(plan);
    } catch (e) {
        console.error('Error generating plan:', e);
        const errorMessage = 'We hit a temporary issue reaching the AI planner. Please try again.';
        setError(errorMessage);
        setIsLoading(false);
        return; // Exit early
    }
    setIsLoading(false);
  }, [goal, goalExplanation, experience, frequency, painPoints, sport, sportSpecific, notes, onPlanGenerated, user, updateUserProfile]);

  const handleCustomPlanSubmit = useCallback(async () => {
    const inputToProcess = selectedFile || rawText;
    if (!inputToProcess || (typeof inputToProcess === 'string' && !inputToProcess.trim())) {
      setError(t('onboarding.noPlanProvided'));
      return;
    }

    // Check rate limits before parsing plan
    if (user?.id && userProfile) {
      const tier = userProfile.apiUsage?.tier || 'free';
      const usage = userProfile.apiUsage;

      if (usage && hasExceededLimit(usage, tier, 'parse')) {
        const remaining = getRemainingUsage(usage, tier);
        setError(getLimitMessage('parse', tier, remaining));
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    try {
      const planData = await parseWorkoutPlan(inputToProcess, true); // Use thinking mode for better parsing
      const planName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, "") : `Imported Plan ${new Date().toLocaleDateString()}`;
      const plan: Omit<WorkoutPlan, 'id'> = {
          ...planData,
          name: planName
      };

      // Track plan parsing for rate limiting
      if (user?.id) {
        await incrementParseUsageMutation({ userId: user.id });
      }

      await onPlanGenerated(plan);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : t('errors.unknownError');
      setError(errorMessage);
      setIsLoading(false);
      // Navigate to home even on error after showing error message
      setTimeout(() => {
        onPlanGenerated({} as any); // This will navigate to home (handlePlanGenerated handles empty plan gracefully)
      }, 2000);
      return; // Exit early
    }
    setIsLoading(false);
  }, [rawText, selectedFile, onPlanGenerated]);
  
  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeStep onNext={() => setStep('goal')} onCustom={() => setStep('custom')} />;
      case 'goal':
        return <GoalStep 
          selected={goal} 
          goalExplanation={goalExplanation}
          onSelect={setGoal} 
          onExplanationChange={setGoalExplanation}
          onNext={() => setStep('experience')} 
          onBack={() => setStep('welcome')} 
        />;
      case 'experience':
        return <ExperienceStep selected={experience} onSelect={setExperience} onNext={() => setStep('frequency')} onBack={() => setStep('goal')} />;
      case 'frequency':
        return <FrequencyStep selected={frequency} onSelect={setFrequency} onNext={() => setStep('metrics')} onBack={() => setStep('experience')} />;
      case 'metrics':
        return <MetricsStep 
          weight={weight} 
          setWeight={setWeight}
          height={height}
          setHeight={setHeight}
          onNext={() => setStep('profile')} 
          onBack={() => setStep('frequency')} 
        />;
      case 'profile':
        return <ProfileStep
          sex={sex}
          setSex={setSex}
          equipment={equipment}
          setEquipment={setEquipment}
          sessionLength={sessionLength}
          setSessionLength={setSessionLength}
          athleticLevel={athleticLevel}
          setAthleticLevel={setAthleticLevel}
          trainingAgeYears={trainingAgeYears}
          setTrainingAgeYears={setTrainingAgeYears}
          bodyType={bodyType}
          setBodyType={setBodyType}
          onNext={() => setStep('pain')}
          onBack={() => setStep('metrics')}
        />;
      case 'pain':
        return <PainStep selected={painPoints} onToggle={setPainPoints} onNext={() => setStep('sport')} onBack={() => setStep('metrics')} />;
       case 'sport':
        return <SportStep sport={sport} setSport={setSport} onNext={() => setStep('sport_specific')} onBack={() => setStep('pain')} />;
      case 'sport_specific':
        return <SportSpecificStep 
          selected={sportSpecific} 
          onSelect={setSportSpecific} 
          onNext={() => setStep('notes')} 
          onBack={() => setStep('sport')} 
          onSkip={() => setStep('notes')}
          notes={notes}
          setNotes={setNotes}
        />;
      case 'notes':
        return <NotesStep notes={notes} setNotes={setNotes} onNext={() => setStep('generate')} onBack={() => setStep('sport')} />;
      case 'generate':
        return <GenerateStep onGenerate={handleGeneratePersonalizedPlan} onBack={() => setStep('notes')} isLoading={isLoading} error={error} />;
      case 'custom':
        return <CustomPlanStep
                    rawText={rawText}
                    setRawText={setRawText}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    isLoading={isLoading}
                    error={error}
                    setError={setError}
                    onSubmit={handleCustomPlanSubmit}
                    onBack={() => setStep('welcome')}
                />
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 -z-10 gradient-mesh opacity-60" />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full blur-[140px] opacity-20 animate-pulse-subtle" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--accent)] rounded-full blur-[120px] opacity-20 animate-pulse-subtle" style={{ animationDelay: '1s' }} />
      </div>

      {/* Sticky progress indicator */}
      {step !== 'welcome' && step !== 'custom' && (
        <div className="sticky top-0 bg-[var(--background)]/95 backdrop-blur-lg border-b border-[var(--border)] px-4 py-3 z-30">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Setup Progress</p>
              <p className="text-[13px] font-bold text-[var(--primary)]">Step {getCurrentStepNumber()} / {getTotalSteps()}</p>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: getTotalSteps() }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i < getCurrentStepNumber() - 1
                      ? "flex-1 bg-[var(--success)]"
                      : i === getCurrentStepNumber() - 1
                      ? "flex-[2] bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
                      : "flex-1 bg-[var(--border-strong)]"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="w-full max-w-2xl mx-auto p-4 animate-fade-in flex flex-col justify-center min-h-screen">
        <div className="text-center mb-8">
          <LogoIcon className="mx-auto text-5xl" />
        </div>
        <div className="card-glass rounded-3xl shadow-elevated p-6 sm:p-8 min-h-[450px] flex flex-col justify-center">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

// Step Components

const WelcomeStep = ({ onNext, onCustom }: { onNext: () => void, onCustom: () => void }) => {
    const { t } = useTranslation();
    return (
        <div className="text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{t('onboarding.welcome')}</h2>
            <p className="mt-2 text-[var(--text-secondary)]">{t('onboarding.welcomeMessage')}</p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={onNext} variant="accent" className="w-full sm:w-auto">
                    {t('onboarding.getStarted')}
                </Button>
                <Button onClick={onCustom} variant="ghost" className="w-full sm:w-auto">
                    {t('onboarding.haveOwnPlan')}
                </Button>
            </div>
        </div>
    );
};

const ProfileStep = ({
    sex,
    setSex,
    equipment,
    setEquipment,
    sessionLength,
    setSessionLength,
    athleticLevel,
    setAthleticLevel,
    trainingAgeYears,
    setTrainingAgeYears,
    bodyType,
    setBodyType,
    onNext,
    onBack,
}: any) => {
    const { t } = useTranslation();
    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Training Profile</h3>
            <p className="text-sm text-[var(--text-tertiary)] mt-2">Dial in equipment, session length, and training background.</p>

            <div className="mt-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Sex</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['male','female','other'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setSex(s)}
                                className={cn(
                                    "px-3 py-2 rounded-lg border text-sm font-semibold transition",
                                    sex === s
                                        ? 'bg-[var(--accent)]/80 border-[var(--accent)] text-white'
                                        : 'bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Equipment</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'minimal', label: 'Minimal' },
                            { id: 'home_gym', label: 'Home gym' },
                            { id: 'commercial_gym', label: 'Commercial gym' },
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setEquipment(opt.id)}
                                className={cn(
                                    "px-3 py-2 rounded-lg border text-sm font-semibold transition",
                                    equipment === opt.id
                                        ? 'bg-[var(--accent)]/80 border-[var(--accent)] text-white'
                                        : 'bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                                )}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Session length</label>
                        <select
                            value={sessionLength}
                            onChange={(e) => setSessionLength(e.target.value as any)}
                            className="w-full px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                        >
                            <option value="">Select</option>
                            <option value="30">30 min</option>
                            <option value="45">45 min</option>
                            <option value="60">60 min</option>
                            <option value="75">75 min</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Athletic level</label>
                        <select
                            value={athleticLevel}
                            onChange={(e) => setAthleticLevel(e.target.value as any)}
                            className="w-full px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                        >
                            <option value="">Select</option>
                            <option value="low">Low</option>
                            <option value="moderate">Moderate</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Training age (years)</label>
                        <input
                            type="number"
                            min={0}
                            value={trainingAgeYears}
                            onChange={(e) => setTrainingAgeYears(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                            placeholder="e.g., 3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Body type</label>
                        <select
                            value={bodyType}
                            onChange={(e) => setBodyType(e.target.value as any)}
                            className="w-full px-3 py-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                        >
                            <option value="">Select</option>
                            <option value="lean">Lean</option>
                            <option value="average">Average</option>
                            <option value="muscular">Muscular</option>
                        </select>
                    </div>
                </div>
            </div>

            <StepNavigation onBack={onBack} onNext={onNext} isNextDisabled={false} />
        </div>
    );
};

const OptionCard: React.FC<{
    label: string;
    description?: string;
    selected: boolean;
    onSelect: () => void;
}> = ({ label, description, selected, onSelect }) => (
    <button
        onClick={onSelect}
        className={cn(
            "w-full text-left p-4 rounded-lg border transition",
            selected
                ? 'bg-[var(--accent)]/80 text-white border-[var(--accent)] shadow-md'
                : 'bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]'
        )}
    >
        <span className="font-semibold">{label}</span>
        {description && <p className={cn("text-xs mt-1", selected ? "text-white/80" : "text-[var(--text-tertiary)]")}>{description}</p>}
    </button>
);

const StepNavigation = ({ onBack, onNext, isNextDisabled }: { onBack: () => void, onNext: () => void, isNextDisabled: boolean }) => {
    const { t } = useTranslation();
    return (
        <div className="mt-8 flex justify-between items-center">
            <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeftIcon className="w-4 h-4" /> {t('common.back')}
            </Button>
            <Button onClick={onNext} disabled={isNextDisabled} variant="accent">
                {t('common.next')} <ArrowRightIcon className="w-4 h-4" />
            </Button>
        </div>
    );
};

const GoalStep = ({ selected, goalExplanation, onSelect, onExplanationChange, onNext, onBack }: {
    selected: Goal | null,
    goalExplanation: string,
    onSelect: (g: Goal) => void,
    onExplanationChange: (text: string) => void,
    onNext: () => void,
    onBack: () => void
}) => {
    const { t } = useTranslation();
    const goalOptions = getGoalOptions(t);
    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{t('onboarding.primaryGoal')}</h3>
            <div className="mt-6 space-y-3">
                {goalOptions.map(g =>
                    <OptionCard key={g.id} label={g.label} description={g.description} selected={selected === g.id} onSelect={() => onSelect(g.id)} />
                )}
            </div>

            {selected && (
                <div className="mt-6">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        {t('onboarding.goalDetails')}
                    </label>
                    <textarea
                        value={goalExplanation}
                        onChange={(e) => onExplanationChange(e.target.value)}
                        placeholder={t('onboarding.goalPlaceholder')}
                        className="w-full p-3 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none"
                        rows={3}
                    />
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">{t('onboarding.goalHelpText')}</p>
                </div>
            )}

            <StepNavigation onBack={onBack} onNext={onNext} isNextDisabled={!selected} />
        </div>
    );
};

const ExperienceStep = ({ selected, onSelect, onNext, onBack }: { selected: Experience | null, onSelect: (e: Experience) => void, onNext: () => void, onBack: () => void }) => {
    const { t } = useTranslation();
    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{t('onboarding.experienceLevel')}</h3>
            <div className="mt-6 space-y-3">
                {(['Beginner', 'Intermediate', 'Advanced'] as Experience[]).map(e =>
                    <OptionCard key={e} label={e} selected={selected === e} onSelect={() => onSelect(e)} />
                )}
            </div>
            <StepNavigation onBack={onBack} onNext={onNext} isNextDisabled={!selected} />
        </div>
    );
};

const FrequencyStep = ({ selected, onSelect, onNext, onBack }: { selected: Frequency | null, onSelect: (f: Frequency) => void, onNext: () => void, onBack: () => void }) => {
    const { t } = useTranslation();
    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{t('onboarding.frequencyQuestion')}</h3>
            <div className="mt-6 space-y-3">
                {(['2-3', '3-4', '4-5', '5+'] as Frequency[]).map(f => {
                    const label = f === '5+' ? `${f} ${t('onboarding.daysPerWeek').replace('{{count}}', '5')}` : `${f} ${t('onboarding.daysPerWeek').replace('{{count}}', f)}`;
                    return <OptionCard key={f} label={label} selected={selected === f} onSelect={() => onSelect(f)} />;
                })}
            </div>
            <StepNavigation onBack={onBack} onNext={onNext} isNextDisabled={!selected} />
        </div>
    );
};

const PainStep = ({ selected, onToggle, onNext, onBack }: { selected: PainPoint[], onToggle: (p: PainPoint[]) => void, onNext: () => void, onBack: () => void }) => {
    const { t } = useTranslation();
    const painPointsOptions = getPainPointsOptions(t);
    const handleToggle = (point: PainPoint) => {
        if (selected.includes(point)) {
            onToggle(selected.filter(p => p !== point));
        } else {
            onToggle([...selected, point]);
        }
    };
    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{t('onboarding.painPointsQuestion')}</h3>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">{t('onboarding.painPointsHelp')}</p>
            <div className="mt-6 space-y-3">
                {painPointsOptions.map(p =>
                    <OptionCard key={p.id} label={p.label} description={p.description} selected={selected.includes(p.id)} onSelect={() => handleToggle(p.id)} />
                )}
            </div>
            <StepNavigation onBack={onBack} onNext={onNext} isNextDisabled={false} />
        </div>
    );
};

const SportStep = ({ sport, setSport, onNext, onBack }: { sport: string, setSport: (s: string) => void, onNext: () => void, onBack: () => void }) => {
    const { t } = useTranslation();
    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{t('onboarding.sportQuestion')}</h3>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">{t('onboarding.sportHelp')}</p>
            <div className="mt-6">
                 <input
                    type="text"
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    placeholder={t('onboarding.sportPlaceholder')}
                    className="w-full mt-1 p-3 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-md focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] outline-none text-[var(--text-primary)] placeholder-[var(--text-tertiary)]"
                />
            </div>
            <StepNavigation onBack={onBack} onNext={onNext} isNextDisabled={false} />
        </div>
    );
};

const NotesStep = ({ notes, setNotes, onNext, onBack }: { notes: string, setNotes: (n: string) => void, onNext: () => void, onBack: () => void }) => {
    const { t } = useTranslation();
    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{t('onboarding.notesQuestion')}</h3>
            <p className="text-sm text-[var(--text-tertiary)] mt-1">{t('onboarding.notesHelp')}</p>
            <div className="mt-6">
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('onboarding.notesPlaceholder')}
                    className="w-full h-24 p-3 text-[var(--text-primary)] bg-[var(--surface-secondary)] rounded-lg border border-[var(--border)] placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition duration-200 ease-in-out resize-none"
                />
            </div>
            <StepNavigation onBack={onBack} onNext={onNext} isNextDisabled={false} />
        </div>
    );
};

const SportSpecificStep = ({ selected, onSelect, onNext, onBack, onSkip, notes, setNotes }: {
    selected: string | null,
    onSelect: (sport: string) => void,
    onNext: () => void,
    onBack: () => void,
    onSkip: () => void,
    notes: string,
    setNotes: (n: string) => void
}) => {
    const { t } = useTranslation();
    const sportOptions = getSportOptions(t);
    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{t('onboarding.sportSpecific')}</h3>
            <p className="text-sm text-[var(--text-tertiary)] mt-2">{t('onboarding.sportSpecificHelp')}</p>

            <div className="mt-6 grid gap-3">
                {sportOptions.map(sport =>
                    <button
                        key={sport.id}
                        onClick={() => onSelect(sport.id)}
                        className={cn(
                            "w-full text-left p-4 rounded-lg border transition",
                            selected === sport.id
                                ? 'bg-[var(--accent)]/80 text-white border-[var(--accent)] shadow-md'
                                : 'bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)]'
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-semibold text-base">{sport.label}</span>
                                <p className={cn("text-xs mt-1", selected === sport.id ? "text-white/80" : "text-[var(--text-tertiary)]")}>{sport.description}</p>
                                <p className={cn("text-xs mt-1 italic", selected === sport.id ? "text-white/70" : "text-[var(--text-tertiary)]")}>{t('onboarding.physicalFocus', { focus: sport.physical_focus })}</p>
                            </div>
                        </div>
                    </button>
                )}
            </div>

            <div className="mt-8 flex justify-between items-center">
                <Button onClick={onBack} variant="ghost" size="sm">
                    <ArrowLeftIcon className="w-4 h-4" /> {t('common.back')}
                </Button>
                <div className="flex gap-3">
                    <Button onClick={onSkip} variant="ghost" size="sm">
                        {t('common.skip')}
                    </Button>
                    <Button onClick={onNext} variant="accent">
                        {t('common.next')} <ArrowRightIcon className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <div className="mt-6">
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('onboarding.notesPlaceholder')}
                    className="w-full h-24 p-3 text-[var(--text-primary)] bg-[var(--surface-secondary)] rounded-lg border border-[var(--border)] placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition duration-200 ease-in-out resize-none"
                />
            </div>
        </div>
    );
};


const GenerateStep = ({ onGenerate, onBack, isLoading, error }: { onGenerate: () => void, onBack: () => void, isLoading: boolean, error: string | null }) => {
    const { t } = useTranslation();
    const hasAutoTriggered = useRef(false);

    useEffect(() => {
        if (!hasAutoTriggered.current && !isLoading) {
            hasAutoTriggered.current = true;
            onGenerate();
        }
    }, [isLoading, onGenerate]);

    return (
        <div className="text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{t('onboarding.readyToBuild')}</h2>
            <p className="mt-2 text-[var(--text-secondary)]">{t('onboarding.generateMessage')}</p>

            {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg flex items-center" role="alert">
                    <XCircleIcon className="w-6 h-6 mr-3 text-red-400"/>
                    <span className="text-sm text-left">{error}</span>
                </div>
            )}

            {isLoading && (
                <div className="mt-8 flex flex-col items-center justify-center">
                    <div className="relative w-20 h-20 mb-6">
                        {/* Pulsing background circle */}
                        <div className="absolute inset-0 rounded-full bg-[var(--accent)]/20 animate-ping"></div>
                        {/* Rotating ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--accent)] border-r-[var(--accent)] animate-spin"></div>
                        {/* Center sparkle */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <SparklesIcon className="w-8 h-8 text-[var(--accent)] animate-pulse" />
                        </div>
                    </div>
                    <p className="text-base font-semibold text-[var(--text-primary)] mb-1">{t('onboarding.generating')}</p>
                    <p className="text-sm text-[var(--text-tertiary)]">{t('onboarding.generatingTime')}</p>
                    <div className="mt-4 w-full max-w-xs h-1.5 bg-[var(--surface-secondary)] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent-hover)] to-[var(--accent)] rounded-full animate-[shimmer_2s_ease-in-out_infinite]"
                             style={{ width: '60%' }}></div>
                    </div>
                </div>
            )}

            <div className={cn("mt-8 flex flex-col sm:flex-row justify-center items-center gap-4", isLoading && 'opacity-50 pointer-events-none')}>
                 <Button onClick={onBack} disabled={isLoading} variant="ghost" size="sm">
                    {t('common.back')}
                </Button>
                <Button onClick={onGenerate} disabled={isLoading} variant="accent" loading={isLoading}>
                    <SparklesIcon className="w-5 h-5" />
                    {isLoading ? t('onboarding.generating') : t('onboarding.generatePlan')}
                </Button>
            </div>
        </div>
    );
};

const CustomPlanStep = ({ rawText, setRawText, selectedFile, setSelectedFile, isLoading, error, setError, onSubmit, onBack }: any) => {
    const { t } = useTranslation();
    const MAX_FILE_SIZE_MB = 5;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          if (file.size > MAX_FILE_SIZE_BYTES) {
            setError(t('onboarding.fileTooLarge', { maxSize: MAX_FILE_SIZE_MB }));
            setSelectedFile(null);
          } else if (file.type === 'text/plain' || file.type === 'text/markdown' || file.type === 'application/pdf') {
            setSelectedFile(file);
            setRawText(''); // Clear text when file is selected
            setError(null);
          } else {
            setError(t('onboarding.invalidFileType'));
            setSelectedFile(null);
          }
        }
        event.target.value = ''; // Reset file input
      };

    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Import Your Plan</h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Paste your plan as text, or upload a PDF, TXT, or MD file. The AI will use its advanced model to parse and optimize it.</p>

            <div className="mt-4 space-y-4">
                 <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={selectedFile ? "File selected. Ready to generate." : "Paste your workout plan here..."}
                    className="w-full h-40 p-4 text-[var(--text-primary)] bg-[var(--surface-secondary)] rounded-lg border border-[var(--border)] placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition duration-200 ease-in-out resize-none disabled:bg-[var(--surface-secondary)]/50 disabled:cursor-not-allowed"
                    aria-label="Workout plan input"
                    disabled={!!selectedFile}
                 />

                 {selectedFile && (
                    <div className="bg-[var(--surface-secondary)] p-3 rounded-lg flex items-center justify-between animate-fade-in border border-[var(--border)]">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <DocumentIcon className="w-6 h-6 text-[var(--text-tertiary)] shrink-0" />
                            <div className="overflow-hidden">
                                <p className="font-semibold text-[var(--text-primary)] truncate">{selectedFile.name}</p>
                                <p className="text-xs text-[var(--text-tertiary)]">({(selectedFile.size / 1024).toFixed(2)} KB)</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedFile(null)} title="Clear selection" className="p-1 rounded-full hover:bg-[var(--surface-hover)] shrink-0">
                            <XCircleIcon className="w-6 h-6 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" />
                        </button>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg flex items-center" role="alert">
                        <XCircleIcon className="w-6 h-6 mr-3 text-red-400"/>
                        <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4">
                     <label title="Upload a PDF, TXT, or MD file" className="relative cursor-pointer inline-flex items-center justify-center px-5 py-2.5 border border-[var(--border)] text-sm font-semibold rounded-lg text-[var(--text-secondary)] bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition">
                        <UploadIcon className="w-5 h-5 mr-2" />
                        <span>Upload File</span>
                        <input type="file" className="sr-only" accept=".txt,.md,.pdf" onChange={handleFileChange} />
                      </label>
                      <Button onClick={onBack} variant="ghost" size="sm">
                        Back
                      </Button>
                  </div>

                  <Button
                      onClick={onSubmit}
                      disabled={isLoading}
                      variant="accent"
                      loading={isLoading}
                      className="w-full"
                    >
                      <SparklesIcon className="w-5 h-5" />
                      <span>{isLoading ? t('chat.analyzing') : 'Parse & Optimize'}</span>
                    </Button>
            </div>
        </div>
    )
}

const MetricsStep = ({ weight, setWeight, height, setHeight, onNext, onBack }: {
    weight: number | null,
    setWeight: (weight: number | null) => void,
    height: number | null,
    setHeight: (height: number | null) => void,
    onNext: () => void,
    onBack: () => void
}) => {
    const { t } = useTranslation();
    const canContinue = weight !== null && weight > 0;

    return (
        <div className="animate-fade-in">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">{t('profile.bodyMetrics')}</h3>
            <p className="text-sm text-[var(--text-tertiary)] mt-2">{t('onboarding.metricsHelp')}</p>

            <div className="mt-6 space-y-4">
                {/* Weight Input */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        {t('profile.weight')}
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={weight || ''}
                            onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : null)}
                            placeholder="Enter weight (kg)"
                            className="flex-1 px-4 py-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                        />
                    </div>
                    {weight && weight > 0 && (
                        <p className="text-xs text-[var(--text-tertiary)] mt-1">
                            {`Using ${weight} kg`}
                        </p>
                    )}
                </div>

                {/* Height Input (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        {t('profile.height')} <span className="text-[var(--text-tertiary)]">({t('common.optional')})</span>
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={height || ''}
                            onChange={(e) => setHeight(e.target.value ? Number(e.target.value) : null)}
                            placeholder="Enter height (cm)"
                            className="flex-1 px-4 py-2 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)]"
                        />
                    </div>
                </div>

                {/* Weight-based guidance */}
                {weight && weight > 0 && (
                    <div className="mt-4 p-4 bg-[var(--surface-secondary)] rounded-lg border border-[var(--border)]">
                        <p className="text-sm text-[var(--text-secondary)]">
                            {(() => {
                                const weightInKg = weight;
                                if ((weightInKg || 0) > 120) {
                                    return (
                                        <>
                                            <strong className="text-yellow-400">⚠️ Exercise Modifications:</strong>
                                            <br />
                                            • Low-impact cardio (swimming, cycling, elliptical)
                                            <br />
                                            • Avoid high-impact jumping and running initially
                                            <br />
                                            • Focus on controlled, stable movements
                                            <br />
                                            • Prioritize joint-friendly exercises
                                        </>
                                    );
                                } else if ((weightInKg || 0) > 100) {
                                    return (
                                        <>
                                            <strong className="text-blue-400">💡 Exercise Considerations:</strong>
                                            <br />
                                            • Moderate impact activities are okay
                                            <br />
                                            • Progress gradually with plyometrics
                                            <br />
                                            • Monitor joint comfort during exercises
                                        </>
                                    );
                                } else {
                                    return (
                                        <>
                                            <strong className="text-green-400">✅ Full Exercise Range:</strong>
                                            <br />
                                            • All exercise types are appropriate
                                            <br />
                                            • Can include plyometrics and high-impact work
                                            <br />
                                            • Focus on progressive overload
                                        </>
                                    );
                                }
                            })()}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-between items-center">
                <Button onClick={onBack} variant="ghost" size="sm">
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back
                </Button>
                <Button
                    onClick={onNext}
                    disabled={!canContinue}
                    variant="accent"
                >
                    Next
                    <ArrowRightIcon className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
