import React, { useState, useMemo, useCallback } from 'react';
import { WorkoutPlan, PlanDay, PlanExercise, DailyRoutine, UserProfile, WorkoutLog } from '../types';
import { LogoIcon, CoffeeIcon, TimerIcon, SignOutIcon, ChevronDownIcon, SparklesIcon, XCircleIcon, CheckCircleIcon, RepeatIcon, ClockIcon, ZapIcon, PercentIcon, TrendingUpIcon, SpeedometerIcon, CogIcon } from '../components/icons';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { generateWeeklyProgression } from '../services/geminiService';

type SessionType = PlanDay | DailyRoutine;

interface HomePageProps {
    plan: WorkoutPlan;
    logs: WorkoutLog[];
    userProfile: UserProfile | null;
    onUpdatePlan: (plan: WorkoutPlan) => void;
    onUpdateUserProfile: (data: Partial<UserProfile>) => void;
    onStartSession: (session: SessionType) => void;
    onOpenChat: () => void;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const WeeklyCheckinCard: React.FC<{
    plan: WorkoutPlan;
    logs: WorkoutLog[];
    onUpdatePlan: (plan: WorkoutPlan) => void;
    onComplete: () => void;
}> = ({ plan, logs, onUpdatePlan, onComplete }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleProgression = useCallback(async (feedback: 'too easy' | 'just right' | 'too hard') => {
        setIsLoading(true);
        setError(null);
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const recentLogs = logs.filter(log => new Date(log.date) > oneWeekAgo);

            const updatedPlan = await generateWeeklyProgression(plan, recentLogs, feedback);
            
            onUpdatePlan({ ...plan, ...updatedPlan }); // Make sure to keep the plan ID
            onComplete();
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [plan, logs, onUpdatePlan, onComplete]);

    return (
        <div className="relative bg-stone-800/50 border border-stone-700 rounded-3xl backdrop-blur-xl shadow-2xl p-6 animate-fade-in">
            <h2 className="font-syne text-xl font-bold text-white">Weekly Progression Check-in</h2>
            <p className="text-sm text-stone-300 mt-1">How did last week's training feel? Your feedback will help adapt your plan.</p>
            
            {isLoading ? (
                 <div className="flex flex-col items-center justify-center h-24">
                    <svg className="animate-spin h-8 w-8 text-stone-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-3 text-stone-400 text-sm font-semibold">AI is adapting your plan...</p>
                </div>
            ) : (
                <>
                    {error && (
                        <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg flex items-center" role="alert">
                            <XCircleIcon className="w-5 h-5 mr-2 text-red-400 flex-shrink-0"/>
                            <span className="text-sm">{error}</span>
                        </div>
                    )}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button onClick={() => handleProgression('too easy')} className="px-4 py-2 text-sm font-semibold text-white bg-green-600/20 border border-green-500/40 rounded-lg hover:bg-green-600/40 transition">Too Easy</button>
                        <button onClick={() => handleProgression('just right')} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600/20 border border-blue-500/40 rounded-lg hover:bg-blue-600/40 transition">Just Right</button>
                        <button onClick={() => handleProgression('too hard')} className="px-4 py-2 text-sm font-semibold text-white bg-yellow-600/20 border border-yellow-500/40 rounded-lg hover:bg-yellow-600/40 transition">Too Hard</button>
                    </div>
                </>
            )}
        </div>
    );
};

const MetricTag: React.FC<{ icon: React.ElementType; value: string | number | null | undefined }> = ({ icon: Icon, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-1.5 bg-stone-900/50 px-2.5 py-1 rounded-full border border-stone-700">
            <Icon className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-xs font-semibold text-stone-300">{value}</span>
        </div>
    );
};

const ExerciseRow: React.FC<{ exercise: PlanExercise, style: React.CSSProperties }> = ({ exercise, style }) => {
    const { metrics_template: mt, rpe } = exercise;
    let setsReps = '';
    if (mt?.target_sets && mt.target_reps) {
        setsReps = `${mt.target_sets} × ${mt.target_reps}`;
    } else if (mt?.type === 'sets_duration' && mt.target_duration_s) {
       setsReps = `${mt.target_sets} × ${mt.target_duration_s}s`;
    }

    return (
        <div className="py-3 flex flex-col items-start animate-staggered-fade-in-up" style={style}>
            <p className="font-bold text-stone-200">{exercise.exercise_name}</p>
            {exercise.notes && <p className="text-xs text-stone-400 mt-0.5">{exercise.notes}</p>}
            <div className="flex items-center flex-wrap gap-2 mt-2">
                {setsReps && <MetricTag icon={RepeatIcon} value={setsReps} />}
                {mt?.rest_period_s && <MetricTag icon={ClockIcon} value={`${mt.rest_period_s}s`} />}
                {rpe && <MetricTag icon={ZapIcon} value={`@RPE ${rpe}`} />}
                {mt?.one_rep_max_percentage && <MetricTag icon={PercentIcon} value={mt.one_rep_max_percentage} />}
                {mt?.incline && <MetricTag icon={TrendingUpIcon} value={mt.incline} />}
                {mt?.speed && <MetricTag icon={SpeedometerIcon} value={mt.speed} />}
                {mt?.resistance && <MetricTag icon={CogIcon} value={mt.resistance} />}
            </div>
        </div>
    );
};

const GlassCard: React.FC<{
    session: SessionType;
    title: string;
    onStartSession: (session: SessionType) => void;
    isPrimary?: boolean;
}> = ({ session, title, onStartSession, isPrimary = false }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const exercises = useMemo(() => {
        if ('blocks' in session && session.blocks) {
            return session.blocks.flatMap(b => b.exercises);
        }
        if ('exercises' in session && session.exercises) {
            return session.exercises;
        }
        return [];
    }, [session]);
    
    const hasWorkout = exercises.length > 0;

    return (
         <div className={`relative bg-stone-800/50 border border-stone-700 rounded-3xl backdrop-blur-xl shadow-2xl transition-all duration-500 ease-in-out overflow-hidden ${isPrimary ? 'p-1' : ''}`}>
            {isPrimary && (
                <div 
                    className="absolute inset-0 bg-red-500/80 -z-10 transition-all duration-500" 
                    style={{
                        clipPath: `circle(${isExpanded ? '150%' : '25%'} at 90% 10%)`,
                    }}
                ></div>
            )}
            <div className={`p-6 ${isPrimary ? 'bg-stone-900/60 rounded-3xl' : ''}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-syne text-xl font-bold text-white">{title}</h2>
                        <p className="text-sm text-stone-300 font-medium">{session.focus}</p>
                    </div>
                     {hasWorkout && (
                         <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
                             <ChevronDownIcon className={`w-5 h-5 text-stone-200 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
                 {isExpanded && hasWorkout && (
                    <div className="mt-4 pt-4 border-t border-stone-700">
                        <div className="divide-y divide-stone-800">
                            {exercises.map((ex, index) => <ExerciseRow key={`${ex.exercise_name}-${index}`} exercise={ex} style={{ animationDelay: `${index * 50}ms`}}/>)}
                        </div>
                    </div>
                )}
            </div>
            {hasWorkout && (
                <div className="px-6 pb-6 mt-auto">
                     <button 
                        onClick={() => onStartSession(session)}
                        title={`Begin ${title}`}
                        className="w-full inline-flex items-center justify-center pl-5 pr-6 py-3 border border-transparent text-base font-bold rounded-full shadow-lg text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-950 focus:ring-red-500 transition-transform hover:scale-105"
                    >
                        <TimerIcon className="w-5 h-5 mr-2" />
                        Start Session
                    </button>
                </div>
            )}
        </div>
    )
}

export default function HomePage({ plan, logs, userProfile, onUpdatePlan, onUpdateUserProfile, onStartSession, onOpenChat }: HomePageProps) {
    const todayDayOfWeek = new Date().getDay();
    const zenithFlowDayOfWeek = todayDayOfWeek === 0 ? 7 : todayDayOfWeek;

    const activeDayPlan = plan.weeklyPlan?.find(p => p.day_of_week === zenithFlowDayOfWeek);
    const dailyRoutine = plan.dailyRoutine;
    
    const showProgressionCard = useMemo(() => {
        if (!userProfile) return false;
        const lastApplied = userProfile.lastProgressionApplied;
        if (!lastApplied) return true; // First time user

        const lastDate = new Date(lastApplied);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays > 6;
    }, [userProfile]);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    }

    if (!activeDayPlan) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 flex-1 flex flex-col items-center justify-center text-center">
                <CoffeeIcon className="w-16 h-16 text-stone-600" />
                <h2 className="font-syne mt-4 text-2xl font-bold text-stone-200">Something went wrong</h2>
                <p className="text-stone-400">Could not find a workout plan for today.</p>
            </div>
        )
    }

    // FIX: Updated `hasWorkout` to check for exercises within blocks, aligning with the new data structure.
    const hasWorkout = (activeDayPlan.blocks || []).flatMap(b => b.exercises).length > 0;

    return (
        <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 animate-fade-in flex-1 flex flex-col">
            <header className="mb-8 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <LogoIcon className="text-4xl text-white" />
                    <div>
                        <h1 className="font-syne text-xl font-bold text-white">{getGreeting()}</h1>
                        <p className="text-sm text-stone-400 font-medium">{WEEKDAYS[activeDayPlan.day_of_week - 1]}, {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</p>
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

            <main className="flex-1 pb-24 space-y-6">
                {showProgressionCard && (
                    <WeeklyCheckinCard
                        plan={plan}
                        logs={logs}
                        onUpdatePlan={onUpdatePlan}
                        onComplete={() => onUpdateUserProfile({ lastProgressionApplied: new Date().toISOString() })}
                    />
                )}
            
                {hasWorkout ? (
                    <GlassCard
                        session={activeDayPlan}
                        title="Today's Workout"
                        onStartSession={onStartSession}
                        isPrimary={true}
                    />
                ) : (
                    <div className="text-center py-20 flex flex-col items-center justify-center bg-stone-800/50 border border-stone-700 rounded-3xl backdrop-blur-xl shadow-2xl">
                        <div className="w-20 h-20 bg-stone-900/50 rounded-full flex items-center justify-center">
                            <CoffeeIcon className="h-10 w-10 text-stone-300"/>
                        </div>
                        <h3 className="font-syne mt-6 text-2xl font-bold text-white">Rest Day</h3>
                        <p className="mt-2 text-stone-400">Enjoy your recovery. You've earned it!</p>
                    </div>
                )}

                {dailyRoutine && (dailyRoutine.exercises || []).length > 0 && (
                     <GlassCard
                        session={dailyRoutine}
                        title="Daily Routine"
                        onStartSession={onStartSession}
                    />
                )}
            </main>

             <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] sm:bottom-[5.5rem] right-4 max-w-2xl mx-auto z-10">
                <button
                    onClick={onOpenChat}
                    className="relative p-4 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full shadow-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-stone-950 focus:ring-red-500 transition-transform hover:scale-110 active:scale-100 animate-pulse-fab overflow-hidden"
                    aria-label="Open AI Chat"
                >
                    <SparklesIcon className="h-7 w-7" />
                    <span className="absolute top-0 left-0 w-full h-full bg-white/20 animate-gleam"></span>
                </button>
            </div>
        </div>
    );
}