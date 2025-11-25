import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WorkoutPlan, PlanDay, PlanExercise, DailyRoutine, UserProfile } from '../types';
import { CoffeeIcon, TimerIcon, SignOutIcon, ChevronDownIcon, SparklesIcon, RepeatIcon, ClockIcon, ZapIcon, PercentIcon, TrendingUpIcon, SpeedometerIcon, CogIcon, QuestionMarkCircleIcon, FlameIcon, DumbbellIcon } from '../components/icons';
import { MessageCircle, Bot } from 'lucide-react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { notify } from '../components/layout/Toast';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { IntensityBadge } from '../components/ui/intensity-badge';
import { cn } from '../lib/utils';
import { calculateWorkoutIntensity, estimateCalories, getWorkoutType } from '../lib/workoutUtils';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { XMarkIcon } from '../components/icons';
import StreakCounter from '../components/StreakCounter';

type SessionType = PlanDay | DailyRoutine;

interface HomePageProps {
    plan: WorkoutPlan;
    onStartSession: (session: SessionType) => void;
    onOpenChat: () => void;
    userProfile?: UserProfile | null;
}

// Helper function to get weekday names with translations
const getWeekdays = (t: (key: string) => string): string[] => [
    t('plan.monday'),
    t('plan.tuesday'),
    t('plan.wednesday'),
    t('plan.thursday'),
    t('plan.friday'),
    t('plan.saturday'),
    t('plan.sunday')
];

// Helper function to get short day names with translations
const getShortDays = (t: (key: string) => string): string[] => [
    t('plan.mon'),
    t('plan.tue'),
    t('plan.wed'),
    t('plan.thu'),
    t('plan.fri'),
    t('plan.sat'),
    t('plan.sun')
];

const MetricTag: React.FC<{ icon: React.ElementType; value: string | number | null | undefined }> = ({ icon: Icon, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-1.5 bg-[var(--surface-secondary)] px-3 py-1.5 rounded-md border border-[var(--border)]">
            <Icon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <span className="text-[13px] font-medium text-[var(--text-secondary)]">{value}</span>
        </div>
    );
};

const ExerciseRow: React.FC<{ exercise: PlanExercise, style: React.CSSProperties; index: number }> = ({ exercise, style, index }) => {
    const { t } = useTranslation();
    const { metrics_template: mt, rpe } = exercise;
    let setsReps = '';
    if (mt?.target_sets && mt.target_reps) {
        setsReps = `${mt.target_sets} × ${mt.target_reps}`;
    } else if (mt?.type === 'sets_duration' && mt.target_duration_s) {
       setsReps = `${mt.target_sets} × ${mt.target_duration_s}s`;
    }

    const handleExerciseInfo = () => {
        notify({ type: 'info', message: t('home.exerciseExplanationsComingSoon') });
    };

    return (
        <div className="py-4 flex flex-col items-start animate-fade-in-up" style={{ ...style, animationDelay: `${index * 40}ms` }}>
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
    userWeightKg?: number;
}> = ({ session, title, onStartSession, isPrimary = false, userWeightKg }) => {
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

    // Calculate intensity for workout preview
    const intensity = useMemo(() => {
        if ('blocks' in session && session.blocks) {
            return calculateWorkoutIntensity(session as PlanDay);
        }
        return { level: 'Moderate' as const, value: 50, color: 'accent', gradient: 'gradient-accent' };
    }, [session]);

    const estimatedDuration = useMemo(() => {
        return Math.round(exercises.length * 3.5); // ~3.5 min per exercise
    }, [exercises]);

    const estimatedCals = useMemo(() => {
        const type = 'blocks' in session ? getWorkoutType(session as PlanDay) : 'mixed';
        return estimateCalories(estimatedDuration, intensity.value, userWeightKg || 70, type);
    }, [estimatedDuration, intensity, userWeightKg, session]);

    return (
        <Card
            className={cn(
                "group relative overflow-hidden transition-all duration-500",
                isPrimary && "card-active card-glow"
            )}
        >
            {/* Enhanced gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/8 via-[var(--accent)]/5 to-[var(--accent-cardio)]/6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <CardHeader className={cn("p-4 sm:p-5 relative z-10", isPrimary && "relative")}>
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                        {/* Animated label with intensity */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold">
                                {title}
                            </span>
                            {isPrimary && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent)] text-white text-[9px] font-bold uppercase tracking-wide animate-fade-in">
                                    <SparklesIcon className="w-3 h-3" />
                                    Today
                                </span>
                            )}
                            {hasWorkout && (
                                <IntensityBadge level={intensity.level} />
                            )}
                        </div>

                        {/* Enhanced title */}
                        <h3 className="text-[17px] sm:text-[18px] font-bold text-[var(--text-primary)] leading-tight">
                            {session.focus}
                        </h3>

                        {/* Enhanced metrics with calories */}
                        <div className="flex items-center gap-2 flex-wrap text-[12px] text-[var(--text-secondary)]">
                            <span className="flex items-center gap-1">
                                <ClockIcon className="w-3.5 h-3.5" />
                                ~{estimatedDuration} min
                            </span>
                            <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]"></span>
                            <span className="flex items-center gap-1">
                                <DumbbellIcon className="w-3.5 h-3.5" />
                                {exercises.length} exercises
                            </span>
                            <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]"></span>
                            <span className="flex items-center gap-1">
                                <FlameIcon className="w-3.5 h-3.5" />
                                ~{estimatedCals} cal
                            </span>
                        </div>
                    </div>

                    {/* Improved expand/collapse button */}
                    {hasWorkout && (
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className={cn(
                                "p-2 rounded-lg transition-all duration-300",
                                "bg-[var(--surface-secondary)] hover:bg-[var(--accent-light)]",
                                "hover:text-[var(--accent)]"
                            )}
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            <ChevronDownIcon className={cn(
                                "w-4 h-4 transition-transform duration-300",
                                isExpanded && "rotate-180"
                            )} />
                        </button>
                    )}
                </div>
            </CardHeader>

            {/* Smooth expansion with stagger animation */}
            <div className={cn(
                "overflow-hidden transition-all duration-500",
                isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            )}>
                <CardContent className="px-4 sm:px-5 pt-0">
                    <div className="pt-4 border-t border-[var(--border)]">
                        <div className="divide-y divide-[var(--border)]">
                            {exercises.map((ex, index) => (
                                <ExerciseRow
                                    key={`${ex.exercise_name}-${index}`}
                                    exercise={ex}
                                    index={index}
                                    style={{ animationDelay: `${index * 40}ms` }}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </div>

            {hasWorkout && (
                <CardFooter className="p-4 sm:p-5 pt-3">
                    <Button
                        onClick={() => onStartSession(session)}
                        title="Start workout"
                        className="w-full"
                        variant={isPrimary ? "accent" : "default"}
                    >
                        <TimerIcon className="w-4 h-4" />
                        <span>Start Workout</span>
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}

export default function HomePage({ plan, onStartSession, onOpenChat, userProfile }: HomePageProps) {
    const { t } = useTranslation();
    const { user } = useUser();
    const userId = user?.id || null;
    const shortDays = getShortDays(t);
    const todayDayOfWeek = new Date().getDay();
    const todayIndex = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
    const [selectedDayIndex, setSelectedDayIndex] = useState(todayIndex);
    const daySelectorRef = useRef<HTMLDivElement>(null);
    const dayButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const weightKg = useMemo(() => {
        const w = userProfile?.bodyMetrics?.weight;
        if (!w || Number.isNaN(w)) return 70;
        // Weight is stored in kg (metric-only inputs)
        return w;
    }, [userProfile]);

    // Get buddy notifications
    const notifications = useQuery(
        api.buddyQueries.getBuddyNotifications,
        userId ? { userId } : "skip"
    );

    const markNotificationReadMutation = useMutation(api.buddyMutations.markNotificationRead);

    const weeklyPlan = Array.isArray(plan?.weeklyPlan) ? plan.weeklyPlan : [];
    const activeDayPlan = weeklyPlan[selectedDayIndex];
    const dailyRoutine = plan?.dailyRoutine;

    // Auto-scroll to selected day
    useEffect(() => {
        const selectedButton = dayButtonRefs.current[selectedDayIndex];
        const container = daySelectorRef.current;
        
        if (selectedButton && container) {
            const buttonLeft = selectedButton.offsetLeft;
            const buttonWidth = selectedButton.offsetWidth;
            const containerWidth = container.offsetWidth;
            const scrollLeft = container.scrollLeft;
            const buttonRight = buttonLeft + buttonWidth;
            const containerRight = scrollLeft + containerWidth;

            // Scroll if button is outside visible area
            if (buttonLeft < scrollLeft) {
                container.scrollTo({ left: buttonLeft - 8, behavior: 'smooth' });
            } else if (buttonRight > containerRight) {
                container.scrollTo({ left: buttonRight - containerWidth + 8, behavior: 'smooth' });
            }
        }
    }, [selectedDayIndex]);

    const { signOut } = useClerk();
    
    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };
    
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return t('home.greeting.morning');
        if (hour < 18) return t('home.greeting.afternoon');
        return t('home.greeting.evening');
    }

    if (!activeDayPlan) {
        return (
            <div className="w-full max-w-2xl mx-auto px-5 py-8 flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-[var(--surface)] rounded-full flex items-center justify-center mb-4">
                    <CoffeeIcon className="w-12 h-12 text-[var(--error)]" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Something went wrong</h2>
                <p className="text-[var(--text-secondary)] mt-2 max-w-xs">Could not find a workout plan for today.</p>
            </div>
        )
    }

    // FIX: Updated `hasWorkout` to check for exercises within blocks, aligning with the new data structure.
    const hasWorkout = (Array.isArray(activeDayPlan.blocks) ? activeDayPlan.blocks : [])
        .flatMap(b => Array.isArray(b.exercises) ? b.exercises : [])
        .length > 0;

    return (
        <div className="w-full max-w-lg mx-auto px-3 sm:px-4 pt-4 sm:pt-6 pb-[calc(4rem+env(safe-area-inset-bottom))] animate-fade-in flex-1 flex flex-col">
            <header className="mb-5 sm:mb-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className="space-y-1">
                        <div className="text-[26px] sm:text-[28px] font-black tracking-normal leading-tight" style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif" }}>
                            <span className="text-[var(--text-primary)]">RE</span>
                            <span className="text-[var(--accent)]">BLD</span>
                        </div>
                        <p className="text-[12px] font-medium text-[var(--text-tertiary)] flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></span>
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[13px] font-semibold text-[var(--text-primary)]">
                            {getGreeting()}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent)] text-[11px] font-bold">
                                <span className="w-1 h-1 rounded-full bg-[var(--accent)]"></span>
                                7 day
                            </span>
                        </div>
                    </div>
                </div>

                {/* Day Selector with gradient fades */}
                <div className="relative py-3 -mx-3 px-3">
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--background-primary)] to-transparent pointer-events-none z-10"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--background-primary)] to-transparent pointer-events-none z-10"></div>

                    <div
                        ref={daySelectorRef}
                        className="day-selector-scroll flex gap-2 overflow-x-auto scroll-smooth hide-scrollbar py-3 overflow-visible"
                        style={{
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {weeklyPlan.map((day, index) => {
                            const isToday = index === todayIndex;
                            const isSelected = index === selectedDayIndex;

                            return (
                                <button
                                    key={index}
                                    ref={(el) => { dayButtonRefs.current[index] = el; }}
                                    onClick={() => setSelectedDayIndex(index)}
                                    className={cn(
                                        "relative flex-shrink-0 px-4 py-3 rounded-xl font-bold text-[13px]",
                                        "transition-all duration-300 min-w-[68px]",
                                        "border-2",
                                        isSelected
                                            ? "border-[var(--primary)] bg-gradient-to-br from-[var(--primary-light)] to-[var(--accent-light)] text-[var(--primary)] shadow-lg ring-2 ring-[var(--primary)]/30 ring-offset-2 ring-offset-[var(--background-primary)]"
                                            : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--primary-light)] hover:shadow-sm active:scale-95"
                                    )}
                                >
                                    <div className="text-center">
                                        <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-70">
                                            {shortDays[index]}
                                        </div>
                                        {/* Visual indicator for workout/rest day */}
                                        <div className={cn(
                                            "w-1.5 h-1.5 rounded-full mx-auto mt-1 transition-all",
                                            (day.blocks || []).flatMap(b => b.exercises || []).length > 0
                                                ? isSelected
                                                    ? "bg-[var(--primary)] shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                                                    : "bg-[var(--accent)]"
                                                : "bg-[var(--text-tertiary)]"
                                        )}></div>
                                    </div>

                                    {/* Today indicator with glow */}
                                    {isToday && !isSelected && (
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--accent)] border-2 border-[var(--background-primary)] animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.6)]"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* Streak Counter */}
            {userId && <StreakCounter userId={userId} />}

            <main className="flex-1 space-y-2.5 sm:space-y-3">
                {/* Buddy Notifications Banner */}
                {notifications && notifications.length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-dark)] text-white rounded-2xl shadow-lg animate-slide-in-right">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                                <p className="text-[13px] font-bold">
                                    {notifications[0].buddyName} {notifications[0].message}
                                </p>
                                <p className="text-[11px] opacity-80 mt-1">
                                    {new Date(notifications[0].createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {hasWorkout && (
                                    <button
                                        onClick={() => onStartSession(activeDayPlan)}
                                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold text-[13px] transition-all active:scale-95"
                                    >
                                        Start Now!
                                    </button>
                                )}
                                <button
                                    onClick={async () => {
                                        await markNotificationReadMutation({
                                            notificationId: notifications[0]._id
                                        });
                                    }}
                                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {hasWorkout ? (
                    <GlassCard
                        session={activeDayPlan}
                        title={t('home.todaysWorkout')}
                        onStartSession={onStartSession}
                        isPrimary={true}
                        userWeightKg={weightKg}
                    />
                ) : (
                <Card className="text-center py-10 sm:py-12 card-glass relative overflow-hidden">
                    {/* Gradient mesh background */}
                    <div className="absolute inset-0 opacity-30">
                        <div className="absolute top-0 left-1/4 w-48 h-48 bg-[var(--accent-recovery)] rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-[var(--accent-mobility)] rounded-full blur-3xl"></div>
                    </div>

                    <CardContent className="pt-6 relative z-10">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[var(--accent-recovery)] to-[var(--success)] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg animate-bounce-subtle">
                            <CoffeeIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white"/>
                        </div>
                        <CardTitle className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] mb-2">{t('home.restDay')}</CardTitle>
                        <CardDescription className="text-[14px] sm:text-[15px] mb-6 px-4 max-w-sm mx-auto leading-relaxed">{t('home.restDayMessage')}</CardDescription>
                        <Button
                            onClick={() => onOpenChat()}
                            variant="soft"
                            className="inline-flex items-center gap-2 shadow-md"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            {t('home.restDayOptions.generate')}
                        </Button>
                    </CardContent>
                </Card>
            )}

                {dailyRoutine && (dailyRoutine.exercises || []).length > 0 && (
                    <Card className="group hover:border-[var(--primary)] transition-all duration-300 cursor-pointer overflow-hidden relative">
                        {/* Gradient background on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent-mobility)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                        <button
                            onClick={() => onStartSession(dailyRoutine)}
                            className="w-full text-left relative z-10"
                        >
                            <CardContent className="px-4 sm:px-5 py-4 sm:py-5 flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {/* Icon */}
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary-light)] to-[var(--accent-light)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <RepeatIcon className="w-6 h-6 text-[var(--primary)]" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase tracking-wider text-[var(--text-tertiary)] font-bold mb-1">
                                            {t('home.dailyRoutine')}
                                        </p>
                                        <h4 className="text-[16px] sm:text-[17px] font-bold text-[var(--text-primary)] truncate">
                                            {dailyRoutine.focus}
                                        </h4>
                                    </div>
                                </div>

                                <ChevronDownIcon className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--primary)] group-hover:translate-x-1 transition-all duration-300 -rotate-90 shrink-0" />
                            </CardContent>
                        </button>
                    </Card>
                )}
            </main>
        </div>
    );
}
