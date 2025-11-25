import { useQuery, useMutation } from "convex/react";
import { useUser } from '@clerk/clerk-react';
import { api } from "../convex/_generated/api";
import { WorkoutLog } from '../types';

// Omit 'id' and 'date' because Convex will generate them
type NewLog = Omit<WorkoutLog, 'id' | 'date'>;

export default function useWorkoutLogs() {
    const { user } = useUser();
    const userId = user?.id || null;
    
    const logs = useQuery(
        api.queries.getWorkoutLogs,
        userId ? { userId } : "skip"
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

    // Convert Convex logs to WorkoutLog format
    const formattedLogs: WorkoutLog[] = logs ? logs.map(log => ({
        id: log._id,
        date: log.date,
        focus: log.focus,
        exercises: log.exercises,
        durationMinutes: log.durationMinutes || undefined,
    })) : [];

    const logsLoaded = logs !== undefined || !userId;

    return { 
        logs: formattedLogs, 
        addLog, 
        logsLoaded 
    };
}
