import React, { useMemo } from 'react';
import { WorkoutLog, WorkoutPlan } from '../types';
import { LogoIcon, SignOutIcon, DumbbellIcon } from '../components/icons';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

interface DashboardPageProps {
    logs: WorkoutLog[];
    plan: WorkoutPlan;
}

// Helper functions for date calculations
const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
const getDayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const StatCard: React.FC<{ title: string; value: string | number; description: string; accent?: boolean }> = ({ title, value, description, accent = false }) => (
    <div className={`bg-[var(--surface)] border rounded-xl p-5 ${accent ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`} style={{ boxShadow: accent ? 'var(--glow-red)' : 'var(--shadow-sm)' }}>
        <p className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-tertiary)] mb-2">{title}</p>
        <p className={`font-syne text-4xl font-bold mt-1 mb-1 ${accent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>{value}</p>
        <p className="text-[13px] text-[var(--text-secondary)]">{description}</p>
    </div>
);

const WeeklyVolumeChart: React.FC<{ data: { day: string; volume: number }[] }> = ({ data }) => {
    const chartData = Array.isArray(data) ? data : [];
    const maxVolume = useMemo(() => {
      if (chartData.length === 0) return 1;
      return Math.max(...chartData.map(d => d.volume), 1);
    }, [chartData]);

    return (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <p className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-tertiary)] mb-2">WEEKLY VOLUME</p>
            <h3 className="font-syne text-xl font-bold text-[var(--text-primary)] mb-5">Training Load</h3>
            <div className="h-48 flex justify-between items-end gap-3">
                {chartData.map(({ day, volume }, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group">
                        <div
                            className="w-full bg-[var(--surface-secondary)] rounded-t-lg transition-all duration-300 ease-out relative overflow-hidden"
                            style={{ height: `${Math.max((volume / maxVolume) * 100, 2)}%` }}
                        >
                            <div className="w-full h-full bg-[var(--accent)] rounded-t-lg" />
                        </div>
                        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] mt-2 uppercase">{day}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const KEY_LIFTS = ['squat', 'bench', 'deadlift', 'overhead press', 'ohp'];

export default function DashboardPage({ logs, plan }: DashboardPageProps) {

    const analytics = useMemo(() => {
        const safeLogs = Array.isArray(logs) ? logs : [];
        const sortedLogs = safeLogs.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const today = getDayStart(new Date());

        // Calculate Streak
        let currentStreak = 0;
        if (sortedLogs.length > 0) {
            const uniqueLogDays = [...new Set(sortedLogs.map(log => getDayStart(new Date(log.date)).getTime()))]
                                .map(time => new Date(time))
                                .sort((a,b) => b.getTime() - a.getTime());

            if (uniqueLogDays.length > 0 && (isSameDay(uniqueLogDays[0], today) || isSameDay(uniqueLogDays[0], new Date(today.getTime() - 86400000)))) {
                currentStreak = 1;
                for (let i = 1; i < uniqueLogDays.length; i++) {
                    const diff = uniqueLogDays[i-1].getTime() - uniqueLogDays[i].getTime();
                    if (diff === 86400000) { // 24 hours in milliseconds
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }
        }
        
        // Calculate Weekly Volume & Chart Data
        const weeklyVolumeData = [...Array(7)].map((_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - i));
            return {
                day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
                volume: 0,
                date: getDayStart(date)
            };
        });

        let totalWeeklyVolume = 0;
        const oneWeekAgo = new Date(today.getTime() - 6 * 86400000);

        safeLogs.forEach(log => {
            const logDate = getDayStart(new Date(log.date));
            if (logDate >= oneWeekAgo) {
                let sessionVolume = 0;
                const exercises = Array.isArray(log.exercises) ? log.exercises : [];
                exercises.forEach(ex => {
                    const sets = Array.isArray(ex.sets) ? ex.sets : [];
                    sets.forEach(set => {
                        if ('weight' in set && 'reps' in set) {
                            sessionVolume += Number(set.weight) * Number(set.reps);
                        }
                    });
                });
                
                totalWeeklyVolume += sessionVolume;
                const dayIndex = weeklyVolumeData.findIndex(d => isSameDay(d.date, logDate));
                if (dayIndex !== -1) {
                    weeklyVolumeData[dayIndex].volume += sessionVolume;
                }
            }
        });
        
        // Calculate Key Lift Progression
        const keyLiftProgress: { name: string, start: number, current: number }[] = [];
        KEY_LIFTS.forEach(liftName => {
            const relevantLogs = sortedLogs.map(log => {
                const ex = log.exercises.find(e => e.exercise_name.toLowerCase().includes(liftName));
                return ex ? { date: log.date, exercise: ex } : null;
            }).filter(Boolean);

            if (relevantLogs.length >= 2) {
                const getHeaviestSet = (ex: any) => Math.max(...ex.sets.map((s: any) => 'weight' in s ? Number(s.weight) : 0), 0);
                const startWeight = getHeaviestSet(relevantLogs[0]!.exercise);
                const currentWeight = getHeaviestSet(relevantLogs[relevantLogs.length-1]!.exercise);
                
                if (currentWeight > startWeight) {
                    keyLiftProgress.push({ name: liftName, start: startWeight, current: currentWeight });
                }
            }
        });

        return {
            totalWorkouts: safeLogs.length,
            currentStreak,
            totalWeeklyVolume: Math.round(totalWeeklyVolume),
            weeklyVolumeData,
            keyLiftProgress
        };
    }, [logs]);

    const handleSignOut = async () => {
        try { await signOut(auth); } catch (error) { console.error("Error signing out: ", error); }
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-5 pt-6 pb-[calc(5rem+env(safe-area-inset-bottom))] animate-fade-in flex-1">
            <header className="mb-8">
                <p className="text-[11px] uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-2">YOUR PROGRESS</p>
                <h1 className="font-syne text-3xl font-bold text-[var(--text-primary)] leading-tight">Dashboard</h1>
            </header>

            <main className="space-y-5 pb-4">
                {/* Key Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <StatCard title="Workouts" value={analytics.totalWorkouts} description="Completed" accent={true} />
                    <StatCard title="Streak" value={analytics.currentStreak} description="Days in a row" />
                </div>

                {/* Weekly Volume */}
                <WeeklyVolumeChart data={analytics.weeklyVolumeData} />

                {/* Volume Total */}
                <StatCard
                    title="This Week"
                    value={`${analytics.totalWeeklyVolume.toLocaleString()}`}
                    description="lbs total volume"
                />

                {/* Key Lift Progression */}
                {analytics.keyLiftProgress.length > 0 && (
                     <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <p className="text-[11px] uppercase tracking-wider font-bold text-[var(--text-tertiary)] mb-2">STRENGTH GAINS</p>
                        <h3 className="font-syne text-xl font-bold text-[var(--text-primary)] mb-5">Key Lifts</h3>
                        <div className="space-y-3">
                            {analytics.keyLiftProgress.map(lift => (
                                <div key={lift.name} className="flex justify-between items-center bg-[var(--surface-secondary)] p-4 rounded-lg">
                                    <p className="font-semibold capitalize text-[15px] text-[var(--text-primary)]">{lift.name}</p>
                                    <p className="font-mono font-bold text-base text-[var(--accent)]">
                                        {lift.start} → {lift.current} kg
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {analytics.totalWorkouts < 2 && (
                    <div className="text-center py-12 flex flex-col items-center justify-center bg-[var(--surface)] border border-[var(--border)] rounded-xl" style={{ boxShadow: 'var(--shadow-sm)' }}>
                        <div className="w-16 h-16 bg-[var(--surface-secondary)] rounded-lg flex items-center justify-center mb-4">
                            <DumbbellIcon className="h-8 w-8 text-[var(--text-tertiary)]"/>
                        </div>
                        <h3 className="font-syne text-xl font-bold text-[var(--text-primary)]">Start Training</h3>
                        <p className="mt-2 text-[14px] text-[var(--text-secondary)] max-w-xs px-4">Log a few workouts to see your progress analytics.</p>
                    </div>
                )}
            </main>
        </div>
    );
}