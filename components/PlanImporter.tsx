import React, { useState, useCallback } from 'react';
import { WorkoutPlan } from '../types';
import { parseWorkoutPlan, generateNewWorkoutPlan } from '../services/geminiService';
import { LogoIcon, UploadIcon, SparklesIcon, XCircleIcon, DocumentIcon, ArrowLeftIcon, ArrowRightIcon } from './icons';

interface OnboardingProps {
  onPlanGenerated: (plan: Omit<WorkoutPlan, 'id'>) => void;
}

type OnboardingStep = 'welcome' | 'goal' | 'experience' | 'frequency' | 'pain' | 'sport' | 'notes' | 'generate' | 'custom';
type Goal = 'Aesthetic Physique' | 'Strength & Power' | 'Athletic Performance' | 'Health & Longevity';
type Experience = 'Beginner' | 'Intermediate' | 'Advanced';
type Frequency = '2-3' | '3-4' | '4-5' | '5+';
type PainPoint = 'Knees' | 'Lower Back' | 'Shoulders' | 'Wrists';

const PAIN_POINTS_OPTIONS: { id: PainPoint, label: string, description: string }[] = [
    { id: 'Knees', label: 'Knees', description: 'Pain during deep squats or lunges' },
    { id: 'Lower Back', label: 'Lower Back', description: 'Discomfort during deadlifts or heavy carries' },
    { id: 'Shoulders', label: 'Shoulders', description: 'Pain during overhead pressing' },
    { id: 'Wrists', label: 'Wrists', description: 'Discomfort in push-ups or front squats' },
];

const GOAL_OPTIONS: { id: Goal, label: string, description: string }[] = [
    { id: 'Aesthetic Physique', label: 'Aesthetic Physique', description: 'Build muscle & reduce body fat (Hypertrophy)' },
    { id: 'Strength & Power', label: 'Strength & Power', description: 'Lift heavier and be more explosive (Powerlifting/Strength)' },
    { id: 'Athletic Performance', label: 'Athletic Performance', description: 'Improve sport-specific skills and endurance' },
    { id: 'Health & Longevity', label: 'Health & Longevity', description: 'Focus on mobility, stability, and overall wellness' },
];


export default function Onboarding({ onPlanGenerated }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [goal, setGoal] = useState<Goal | null>(null);
  const [experience, setExperience] = useState<Experience | null>(null);
  const [frequency, setFrequency] = useState<Frequency | null>(null);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [sport, setSport] = useState('');
  const [notes, setNotes] = useState('');

  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleGeneratePersonalizedPlan = useCallback(async () => {
    if (!goal || !experience || !frequency) {
        setError("Please make selections for all options.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
        const planData = await generateNewWorkoutPlan(goal, experience, frequency, painPoints, sport, notes);
        const plan: Omit<WorkoutPlan, 'id'> = {
            ...planData,
            name: `${goal} Program`
        };
        onPlanGenerated(plan);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred while generating your plan.');
    } finally {
        setIsLoading(false);
    }
  }, [goal, experience, frequency, painPoints, sport, notes, onPlanGenerated]);

  const handleCustomPlanSubmit = useCallback(async () => {
    const inputToProcess = selectedFile || rawText;
    if (!inputToProcess || (typeof inputToProcess === 'string' && !inputToProcess.trim())) {
      setError('Please provide your workout plan first.');
      return;
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
      onPlanGenerated(plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [rawText, selectedFile, onPlanGenerated]);
  
  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeStep onNext={() => setStep('goal')} onCustom={() => setStep('custom')} />;
      case 'goal':
        return <GoalStep selected={goal} onSelect={setGoal} onNext={() => setStep('experience')} onBack={() => setStep('welcome')} />;
      case 'experience':
        return <ExperienceStep selected={experience} onSelect={setExperience} onNext={() => setStep('frequency')} onBack={() => setStep('goal')} />;
      case 'frequency':
        return <FrequencyStep selected={frequency} onSelect={setFrequency} onNext={() => setStep('pain')} onBack={() => setStep('experience')} />;
      case 'pain':
        return <PainStep selected={painPoints} onToggle={setPainPoints} onNext={() => setStep('sport')} onBack={() => setStep('frequency')} />;
       case 'sport':
        return <SportStep sport={sport} setSport={setSport} onNext={() => setStep('notes')} onBack={() => setStep('pain')} />;
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
    <div className="w-full max-w-2xl mx-auto p-4 animate-fade-in flex flex-col justify-center min-h-screen">
      <div className="text-center mb-8">
        <LogoIcon className="mx-auto text-5xl" />
      </div>
      <div className="bg-stone-800/50 border border-stone-700 rounded-3xl backdrop-blur-xl shadow-2xl p-6 sm:p-8 min-h-[450px] flex flex-col justify-center">
        {renderStep()}
      </div>
    </div>
  );
}

// Step Components

const WelcomeStep = ({ onNext, onCustom }: { onNext: () => void, onCustom: () => void }) => (
    <div className="text-center animate-fade-in">
        <h2 className="font-syne text-2xl font-bold text-white tracking-tight">Welcome to REBLD</h2>
        <p className="mt-2 text-stone-300">Let's create a workout plan tailored to you.</p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={onNext} className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-base font-bold rounded-lg shadow-sm text-white bg-red-500 hover:bg-red-600 transition">
                Get Started
            </button>
            <button onClick={onCustom} className="w-full sm:w-auto text-sm font-semibold text-stone-400 hover:text-white transition">
                I have my own plan
            </button>
        </div>
    </div>
);

const OptionCard: React.FC<{
    label: string;
    description?: string;
    selected: boolean;
    onSelect: () => void;
}> = ({ label, description, selected, onSelect }) => (
    <button onClick={onSelect} className={`w-full text-left p-4 rounded-lg border transition ${selected ? 'bg-red-500/80 text-white border-red-500' : 'bg-stone-800/50 border-stone-700 text-stone-200 hover:bg-stone-700/50 hover:border-stone-600'}`}>
        <span className="font-semibold">{label}</span>
        {description && <p className="text-xs mt-1 text-stone-300/80">{description}</p>}
    </button>
);

const StepNavigation = ({ onBack, onNext, isNextDisabled }: { onBack: () => void, onNext: () => void, isNextDisabled: boolean }) => (
    <div className="mt-8 flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-stone-400 hover:text-white transition">
            <ArrowLeftIcon className="w-4 h-4" /> Back
        </button>
        <button onClick={onNext} disabled={isNextDisabled} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-base font-bold rounded-lg shadow-sm text-white bg-red-500 hover:bg-red-600 transition disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed">
            Next <ArrowRightIcon className="w-4 h-4" />
        </button>
    </div>
);

const GoalStep = ({ selected, onSelect, onNext, onBack }: { selected: Goal | null, onSelect: (g: Goal) => void, onNext: () => void, onBack: () => void }) => (
    <div className="animate-fade-in">
        <h3 className="font-syne text-xl font-bold text-white">What's your primary goal?</h3>
        <div className="mt-6 space-y-3">
            {GOAL_OPTIONS.map(g => 
                <OptionCard key={g.id} label={g.label} description={g.description} selected={selected === g.id} onSelect={() => onSelect(g.id)} />
            )}
        </div>
        <StepNavigation onBack={onBack} onNext={onNext} isNextDisabled={!selected} />
    </div>
);

const ExperienceStep = ({ selected, onSelect, onNext, onBack }: { selected: Experience | null, onSelect: (e: Experience) => void, onNext: () => void, onBack: () => void }) => (
     <div className="animate-fade-in">
        <h3 className="font-syne text-xl font-bold text-white">What's your experience level?</h3>
        <div className="mt-6 space-y-3">
            {(['Beginner', 'Intermediate', 'Advanced'] as Experience[]).map(e => 
                <OptionCard key={e} label={e} selected={selected === e} onSelect={() => onSelect(e)} />
            )}
        </div>
        <StepNavigation onBack={onBack} onNext={onNext} isNextDisabled={!selected} />
    </div>
);

const FrequencyStep = ({ selected, onSelect, onNext, onBack }: { selected: Frequency | null, onSelect: (f: Frequency) => void, onNext: () => void, onBack: () => void }) => (
     <div className="animate-fade-in">
        <h3 className="font-syne text-xl font-bold text-white">How many days a week?</h3>
        <div className="mt-6 space-y-3">
            {(['2-3', '3-4', '4-5', '5+'] as Frequency[]).map(f => 
                <OptionCard key={f} label={`${f} days`} selected={selected === f} onSelect={() => onSelect(f)} />
            )}
        </div>
        <StepNavigation onBack={onBack} onNext={onNext} isNextDisabled={!selected} />
    </div>
);

const PainStep = ({ selected, onToggle, onNext, onBack }: { selected: PainPoint[], onToggle: (p: PainPoint[]) => void, onNext: () => void, onBack: () => void }) => {
    const handleToggle = (point: PainPoint) => {
        if (selected.includes(point)) {
            onToggle(selected.filter(p => p !== point));
        } else {
            onToggle([...selected, point]);
        }
    };
    return (
        <div className="animate-fade-in">
            <h3 className="font-syne text-xl font-bold text-white">Any pain or limitations?</h3>
            <p className="text-sm text-stone-400 mt-1">Select any areas where you feel discomfort during exercise. This helps the AI create a safer plan for you.</p>
            <div className="mt-6 space-y-3">
                {PAIN_POINTS_OPTIONS.map(p => 
                    <OptionCard key={p.id} label={p.label} description={p.description} selected={selected.includes(p.id)} onSelect={() => handleToggle(p.id)} />
                )}
            </div>
            <StepNavigation onBack={onBack} onNext={onNext} isNextDisabled={false} />
        </div>
    );
};

const SportStep = ({ sport, setSport, onNext, onBack }: { sport: string, setSport: (s: string) => void, onNext: () => void, onBack: () => void }) => (
    <div className="animate-fade-in">
        <h3 className="font-syne text-xl font-bold text-white">What's your sport? (Optional)</h3>
        <p className="text-sm text-stone-400 mt-1">Specifying your sport (e.g., Boxing, Powerlifting, Soccer) helps the AI tailor your training for better performance.</p>
        <div className="mt-6">
             <input
                type="text"
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                placeholder="e.g., Boxing"
                className="w-full mt-1 p-3 bg-stone-900/70 border border-stone-700 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
        </div>
        <StepNavigation onBack={onBack} onNext={onNext} isNextDisabled={false} />
    </div>
);

const NotesStep = ({ notes, setNotes, onNext, onBack }: { notes: string, setNotes: (n: string) => void, onNext: () => void, onBack: () => void }) => (
    <div className="animate-fade-in">
        <h3 className="font-syne text-xl font-bold text-white">Any other notes for your AI coach?</h3>
        <p className="text-sm text-stone-400 mt-1">Mention anything else! Equipment access, specific goals in your own words (e.g., "I want a bigger butt"), etc.</p>
        <div className="mt-6">
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="The AI will read this..."
                className="w-full h-24 p-3 text-stone-200 bg-stone-900/50 rounded-lg border border-stone-700 placeholder-stone-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 ease-in-out resize-none"
            />
        </div>
        <StepNavigation onBack={onBack} onNext={onNext} isNextDisabled={false} />
    </div>
);


const GenerateStep = ({ onGenerate, onBack, isLoading, error }: { onGenerate: () => void, onBack: () => void, isLoading: boolean, error: string | null }) => (
    <div className="text-center animate-fade-in">
        <h2 className="font-syne text-2xl font-bold text-white tracking-tight">Ready to Build Your Plan?</h2>
        <p className="mt-2 text-stone-300">Our AI will craft a personalized program based on your selections.</p>
        
        {error && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg flex items-center" role="alert">
                <XCircleIcon className="w-6 h-6 mr-3 text-red-400"/>
                <span className="text-sm text-left">{error}</span>
            </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
             <button onClick={onBack} className="text-sm font-semibold text-stone-400 hover:text-white transition">
                Back
            </button>
            <button onClick={onGenerate} disabled={isLoading} className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-base font-bold rounded-lg shadow-sm text-white bg-red-500 hover:bg-red-600 transition disabled:bg-stone-700 disabled:text-stone-500">
                {isLoading ? (
                    <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                    </>
                ) : (
                    <>
                    <SparklesIcon className="w-5 h-5 mr-2" />
                    Generate My Plan
                    </>
                )}
            </button>
        </div>
    </div>
);

const CustomPlanStep = ({ rawText, setRawText, selectedFile, setSelectedFile, isLoading, error, setError, onSubmit, onBack }: any) => {
    const MAX_FILE_SIZE_MB = 5;
    const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
    
     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
          if (file.size > MAX_FILE_SIZE_BYTES) {
            setError(`File is too large. Please upload a file smaller than ${MAX_FILE_SIZE_MB}MB.`);
            setSelectedFile(null);
          } else if (file.type === 'text/plain' || file.type === 'text/markdown' || file.type === 'application/pdf') {
            setSelectedFile(file);
            setRawText(''); // Clear text when file is selected
            setError(null);
          } else {
            setError('Invalid file type. Please upload a .pdf, .txt, or .md file.');
            setSelectedFile(null);
          }
        }
        event.target.value = ''; // Reset file input
      };

    return (
        <div className="animate-fade-in">
            <h3 className="font-syne text-xl font-bold text-white">Import Your Plan</h3>
            <p className="mt-1 text-sm text-stone-300">Paste your plan as text, or upload a PDF, TXT, or MD file. The AI will use its advanced model to parse and optimize it.</p>
            
            <div className="mt-4 space-y-4">
                 <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder={selectedFile ? "File selected. Ready to generate." : "Paste your workout plan here..."}
                    className="w-full h-40 p-4 text-stone-200 bg-stone-900/50 rounded-lg border border-stone-700 placeholder-stone-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition duration-200 ease-in-out resize-none disabled:bg-stone-800/50 disabled:cursor-not-allowed"
                    aria-label="Workout plan input"
                    disabled={!!selectedFile}
                 />

                 {selectedFile && (
                    <div className="bg-stone-900/50 p-3 rounded-lg flex items-center justify-between animate-fade-in border border-stone-700">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <DocumentIcon className="w-6 h-6 text-stone-400 shrink-0" />
                            <div className="overflow-hidden">
                                <p className="font-semibold text-stone-200 truncate">{selectedFile.name}</p>
                                <p className="text-xs text-stone-400">({(selectedFile.size / 1024).toFixed(2)} KB)</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedFile(null)} title="Clear selection" className="p-1 rounded-full hover:bg-stone-700 shrink-0">
                            <XCircleIcon className="w-6 h-6 text-stone-400 hover:text-white" />
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
                     <label title="Upload a PDF, TXT, or MD file" className="relative cursor-pointer inline-flex items-center justify-center px-5 py-2.5 border border-stone-700 text-sm font-semibold rounded-lg text-stone-300 bg-stone-800/50 hover:bg-stone-700/70 transition">
                        <UploadIcon className="w-5 h-5 mr-2" />
                        <span>Upload File</span>
                        <input type="file" className="sr-only" accept=".txt,.md,.pdf" onChange={handleFileChange} />
                      </label>
                      <button onClick={onBack} className="text-sm font-semibold text-stone-400 hover:text-white transition">
                        Back
                      </button>
                  </div>

                  <button
                      onClick={onSubmit}
                      disabled={isLoading}
                      className="w-full inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-lg shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-red-500 disabled:bg-stone-700 disabled:text-stone-500 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing with Gemini Pro...
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-5 h-5 mr-2" />
                          <span>Parse & Optimize</span>
                        </>
                      )}
                    </button>
            </div>
        </div>
    )
}