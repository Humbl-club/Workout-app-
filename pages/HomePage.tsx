import React, { useState, useMemo } from 'react';
import { WorkoutPlan, PlanDay, PlanExercise, DailyRoutine } from '../types';
import { CoffeeIcon, TimerIcon, SignOutIcon, ChevronDownIcon, SparklesIcon, RepeatIcon, ClockIcon, ZapIcon, PercentIcon, TrendingUpIcon, SpeedometerIcon, CogIcon, QuestionMarkCircleIcon } from '../components/icons';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { notify } from '../components/layout/Toast';

type SessionType = PlanDay | DailyRoutine;

interface HomePageProps {
    plan: WorkoutPlan;
    onStartSession: (session: SessionType) => void;
    onOpenChat: () => void;
}

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MetricTag: React.FC<{ icon: React.ElementType; value: string | number | null | undefined }> = ({ icon: Icon, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-1.5 bg-[var(--surface-secondary)] px-2.5 py-1.5 rounded-md border border-[var(--border)]">
            <Icon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <span className="text-[12px] font-medium text-[var(--text-secondary)]">{value}</span>
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

    const handleExerciseInfo = () => {
        notify({ type: 'info', message: 'Exercise explanations coming soon!' });
    };

    return (
        <div className="py-4 flex flex-col items-start animate-fade-in-up" style={style}>
            <div className="flex items-center gap-2.5 w-full">
                <p className="font-semibold text-[16px] text-[var(--text-primary)] flex-1">{exercise.exercise_name}</p>
                <button
                    onClick={handleExerciseInfo}
                    className="p-2 rounded-lg hover:bg-[var(--surface-secondary)] active:bg-[var(--surface-hover)] transition-all"
                    aria-label={`Info about ${exercise.exercise_name}`}
                >
                    <QuestionMarkCircleIcon className="w-5 h-5 text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors" />
                </button>
            </div>
            {exercise.notes && <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">{exercise.notes}</p>}
            <div className="flex items-center flex-wrap gap-2 mt-3">
                {setsReps && <MetricTag icon={RepeatIcon} value={setsReps} />}
                {mt?.rest_period_s && <MetricTag icon={ClockIcon} value={`${mt.rest_period_s}s`} />}
                {rpe && <MetricTag icon={ZapIcon} value={`RPE ${rpe}`} />}
                {mt?.one_rep_max_percentage && <MetricTag icon={PercentIcon} value={`${mt.one_rep_max_percentage}%`} />}
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
        if ('blocks' in session && Array.isArray(session.blocks)) {
            return session.blocks.flatMap(b => Array.isArray(b.exercises) ? b.exercises : []);
        }
        if ('exercises' in session && Array.isArray(session.exercises)) {
            return session.exercises;
        }
        return [];
    }, [session]);

    const hasWorkout = exercises.length > 0;

    return (
         <div
            className={`bg-[var(--surface)] rounded-lg transition-all duration-300 ease-in-out overflow-hidden ${
                isPrimary ? 'border-2 border-[var(--accent)]' : 'border border-[var(--border)]'
            }`}
            style={{ boxShadow: isPrimary ? 'var(--glow-red)' : 'var(--shadow-sm)' }}
        >
            <div className={`p-3 ${isPrimary ? 'bg-[var(--accent-light)]' : ''}`}>
                <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">{title}</p>
                        <h2 className="font-syne text-base font-bold text-[var(--text-primary)] leading-tight mb-1">{session.focus}</h2>
                        <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] font-medium">
                            <span>~45 min</span>
                            <span>·</span>
                            <span>{exercises.length} ex</span>
                        </div>
                    </div>
                     {hasWorkout && (
                         <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="p-1.5 rounded-md bg-[var(--surface-secondary)] hover:bg-[var(--surface-hover)] transition-all shrink-0"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                             <ChevronDownIcon className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                </div>
                 {isExpanded && hasWorkout && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)]">
                        <div className="divide-y divide-[var(--border)]">
                            {exercises.map((ex, index) => (
                                <ExerciseRow
                                    key={`${ex.exercise_name}-${index}`}
                                    exercise={ex}
                                    style={{ animationDelay: `${index * 30}ms` }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {hasWorkout && (
                <div className="p-3 pt-2">
                     <button
                        onClick={() => onStartSession(session)}
                        title="Start workout"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border-none text-[13px] font-semibold rounded-md text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] focus:outline-none transition-all active:scale-[0.97]"
                        style={{ boxShadow: 'var(--glow-red)' }}
                    >
                        <TimerIcon className="w-3.5 h-3.5" />
                        <span>START</span>
                    </button>
                </div>
            )}
        </div>
    )
}

export default function HomePage({ plan, onStartSession, onOpenChat }: HomePageProps) {
    const todayDayOfWeek = new Date().getDay();
    const todayIndex = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
    const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex);

    const weeklyPlan = Array.isArray(plan?.weeklyPlan) ? plan.weeklyPlan : [];
    const activeDayPlan = weeklyPlan[selectedDayIndex];
    const dailyRoutine = plan?.dailyRoutine;

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
            <div className="w-full max-w-2xl mx-auto px-5 py-8 flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-[var(--surface)] rounded-full flex items-center justify-center mb-4">
                    <CoffeeIcon className="w-12 h-12 text-[var(--error)]" />
                </div>
                <h2 className="font-syne text-2xl font-bold text-[var(--text-primary)]">Something went wrong</h2>
                <p className="text-[var(--text-secondary)] mt-2 max-w-xs">Could not find a workout plan for today.</p>
            </div>
        )
    }

    // FIX: Updated `hasWorkout` to check for exercises within blocks, aligning with the new data structure.
    const hasWorkout = (Array.isArray(activeDayPlan.blocks) ? activeDayPlan.blocks : [])
        .flatMap(b => Array.isArray(b.exercises) ? b.exercises : [])
        .length > 0;

    return (
        <div className="w-full max-w-lg mx-auto px-3 pt-4 pb-[calc(4rem+env(safe-area-inset-bottom))] animate-fade-in flex-1 flex flex-col">
            <header className="mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="font-grotesk font-bold text-xl tracking-tight logo-spacing mb-1">
                            <span className="text-[var(--text-primary)]">RE</span>
                            <span className="text-[var(--accent)]">BLD</span>
                        </div>
                        <p className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] font-medium">
                            {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] text-[var(--text-secondary)] font-medium">{getGreeting()}</p>
                        <div className="flex items-center gap-2 text-[11px] font-medium mt-0.5">
                            <span className="flex items-center gap-1 text-[var(--accent)]">
                                <span className="w-1 h-1 rounded-full bg-[var(--accent)]"></span>
                                <span>7 day</span>
                            </span>
                            <span className="text-[var(--text-tertiary)]">18 total</span>
                        </div>
                    </div>
                </div>

                {/* Day Selector */}
                <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
                    {weeklyPlan.map((day, index) => {
                        const isToday = index === todayIndex;
                        const isSelected = index === selectedDayIndex;

                        return (
                            <button
                                key={index}
                                onClick={() => setSelectedDayIndex(index)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-md border transition text-center min-w-[52px] ${
                                    isSelected
                                        ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]'
                                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                                }`}
                            >
                                <p className="text-[11px] font-semibold">{SHORT_DAYS[index]}</p>
                                {isToday && <p className="text-[8px] opacity-70">TODAY</p>}
                            </button>
                        );
                    })}
                </div>
            </header>

            <main className="flex-1 space-y-3">
                {hasWorkout ? (
                    <GlassCard
                        session={activeDayPlan}
                        title="Today's Workout"
                        onStartSession={onStartSession}
                        isPrimary={true}
                    />
                ) : (
                    <div className="text-center py-12 bg-[var(--surface)] border border-[var(--border)] rounded-xl" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className="w-16 h-16 bg-[var(--surface-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
                            <CoffeeIcon className="h-8 w-8 text-[var(--accent-mobility)]"/>
                        </div>
                        <h3 className="font-syne text-2xl font-bold text-[var(--text-primary)] mb-2">Rest Day</h3>
                        <p className="text-[14px] text-[var(--text-secondary)] mb-6 px-6">Enjoy your recovery. You've earned it!</p>
                        <button
                            onClick={() => onOpenChat()}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[14px] font-semibold text-[var(--text-secondary)] border border-[var(--border-strong)] hover:bg-[var(--surface-secondary)] transition"
                        >
                            Generate Light Workout →
                        </button>
                    </div>
                )}

                {dailyRoutine && (dailyRoutine.exercises || []).length > 0 && (
                    <button
                        onClick={() => onStartSession(dailyRoutine)}
                        className="w-full text-left px-5 py-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition flex items-center justify-between group"
                    >
                        <div>
                            <p className="text-[11px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">DAILY ROUTINE</p>
                            <p className="text-[15px] font-semibold text-[var(--text-primary)]">{dailyRoutine.focus}</p>
                        </div>
                        <TimerIcon className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition" />
                    </button>
                )}
            </main>

             <button
                onClick={onOpenChat}
                className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-5 p-3.5 bg-[var(--accent)] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background)] focus:ring-[var(--accent)] transition-all hover:opacity-90 active:scale-95 z-10 w-14 h-14"
                aria-label="Open AI Chat"
                style={{ boxShadow: 'var(--glow-red)' }}
            >
                <SparklesIcon className="h-7 w-7" />
            </button>
        </div>
    );
}
