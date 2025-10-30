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

const StatCard: React.FC<{ title: string; value: string | number; description: string }> = ({ title, value, description }) => (
    <div className="bg-stone-800/50 border border-stone-700 p-6 rounded-2xl backdrop-blur-xl shadow-lg">
        <p className="text-sm font-semibold text-stone-400">{title}</p>
        <p className="font-syne text-4xl font-extrabold text-white mt-2">{value}</p>
        <p className="text-xs text-stone-300 mt-1">{description}</p>
    </div>
);

const WeeklyVolumeChart: React.FC<{ data: { day: string; volume: number }[] }> = ({ data }) => {
    const maxVolume = useMemo(() => Math.max(...data.map(d => d.volume), 1), [data]);
    
    return (
        <div className="bg-stone-800/50 border border-stone-700 p-6 rounded-2xl backdrop-blur-xl shadow-lg">
            <h3 className="font-syne text-lg font-bold text-white">Weekly Volume</h3>
            <div className="mt-4 h-48 flex justify-between items-end gap-2">
                {data.map(({ day, volume }, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group">
                        <div 
                            className="w-full bg-red-500/10 rounded-t-lg group-hover:bg-red-500 transition-all duration-300 ease-out"
                            style={{ height: `${(volume / maxVolume) * 100}%` }}
                        >
                            <div className="w-full h-full bg-red-500 rounded-t-lg transition-all duration-300 ease-out transform scale-y-0 origin-bottom group-hover:scale-y-100" />
                        </div>
                        <p className="text-xs font-semibold text-stone-400 mt-2">{day}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const KEY_LIFTS = ['squat', 'bench', 'deadlift', 'overhead press', 'ohp'];

export default function DashboardPage({ logs, plan }: DashboardPageProps) {

    const analytics = useMemo(() => {
        const sortedLogs = logs.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
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
        const weeklyVolumeData = Array.from({ length: 7 }).map((_, i) => {
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

        logs.forEach(log => {
            const logDate = getDayStart(new Date(log.date));
            if (logDate >= oneWeekAgo) {
                let sessionVolume = 0;
                log.exercises.forEach(ex => {
                    ex.sets.forEach(set => {
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
            totalWorkouts: logs.length,
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
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 animate-fade-in flex-1">
            <header className="mb-8 flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <LogoIcon className="h-10 w-auto text-4xl text-white" />
                    <div>
                        <h1 className="font-syne text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
                        <p className="text-sm text-stone-400">Your performance at a glance.</p>
                    </div>
                </div>
                <button onClick={handleSignOut} title="Sign Out" className="p-2 border border-stone-700 rounded-lg text-stone-300 bg-stone-800/50 hover:bg-stone-700/70 hover:text-white transition">
                    <SignOutIcon className="w-5 h-5"/>
                </button>
            </header>

            <main className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-24">
                <StatCard title="Total Workouts" value={analytics.totalWorkouts} description="Completed sessions" />
                <StatCard title="Current Streak" value={analytics.currentStreak} description="Consecutive training days" />
                <StatCard title="This Week's Volume" value={`${analytics.totalWeeklyVolume} kg`} description="Total weight lifted" />
                
                <div className="md:col-span-3">
                     <WeeklyVolumeChart data={analytics.weeklyVolumeData} />
                </div>

                {analytics.keyLiftProgress.length > 0 && (
                     <div className="md:col-span-3 bg-stone-800/50 border border-stone-700 p-6 rounded-2xl backdrop-blur-xl shadow-lg">
                        <h3 className="font-syne text-lg font-bold text-white">Key Lift Progression</h3>
                        <div className="mt-4 space-y-3">
                            {analytics.keyLiftProgress.map(lift => (
                                <div key={lift.name} className="flex justify-between items-center bg-stone-900/50 p-3 rounded-md">
                                    <p className="font-semibold capitalize text-stone-200">{lift.name}</p>
                                    <p className="font-mono font-bold text-lg text-white">{lift.start}kg &rarr; {lift.current}kg</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                 {logs.length < 2 && (
                    <div className="md:col-span-3 text-center py-10 flex flex-col items-center justify-center bg-stone-800/50 border border-stone-700 rounded-2xl shadow-lg backdrop-blur-lg">
                        <DumbbellIcon className="h-10 w-10 text-stone-400"/>
                        <h3 className="font-syne mt-6 text-xl font-bold text-white">More Data Needed</h3>
                        <p className="mt-2 text-stone-400 max-w-sm">Log a few more workouts to start seeing your progress analytics here.</p>
                    </div>
                )}
            </main>
        </div>
    );
}