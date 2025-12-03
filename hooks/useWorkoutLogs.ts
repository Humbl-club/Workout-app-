import { useQuery, useMutation } from "convex/react";
import { useUser } from '@clerk/clerk-react';
import { api } from "../convex/_generated/api";
import { WorkoutLog } from '../types';

// Omit 'id' and 'date' because Convex will generate them
type NewLog = Omit<WorkoutLog, 'id' | 'date'>;

export default function useWorkoutLogs() {
    const { user } = useUser();
    const userId = user?.id || null;

    const logsResult = useQuery(
        api.queries.getWorkoutLogs,
        userId ? { userId, limit: 100 } : "skip" // Fetch up to 100 logs
    );
    const addLogMutation = useMutation(api.mutations.addWorkoutLog);

    const addLog = async (newLog: NewLog) => {
        if (!userId) return;

        try {
            await addLogMutation({
                userId,
                focus: newLog.focus,
                exercises: newLog.exercises,
                durationMinutes: newLog.durationMinutes || undefined,
            });
        } catch (e) {
            console.error("Failed to save log to Convex", e);
        }
    };

    // Handle paginated result from Convex
    // The query returns { page: [...], isDone: boolean, continueCursor: string }
    const rawLogs = logsResult?.page || logsResult || [];

    // Convert Convex logs to WorkoutLog format
    const formattedLogs: WorkoutLog[] = Array.isArray(rawLogs) ? rawLogs.map((log: any) => ({
        id: log._id,
        date: log.date,
        focus: log.focus,
        exercises: log.exercises,
        durationMinutes: log.durationMinutes || undefined,
    })) : [];

    const logsLoaded = logsResult !== undefined || !userId;

    return {
        logs: formattedLogs,
        addLog,
        logsLoaded
    };
}
