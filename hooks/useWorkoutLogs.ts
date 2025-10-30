import { useState, useEffect, useCallback } from 'react';
import { WorkoutLog } from '../types';
import { db } from '../firebase';
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';

// Omit 'id' and 'date' because Firestore will generate them
type NewLog = Omit<WorkoutLog, 'id' | 'date'>;

export default function useWorkoutLogs(userId: string | null) {
    const [logs, setLogs] = useState<WorkoutLog[]>([]);
    const [logsLoaded, setLogsLoaded] = useState(false);

    useEffect(() => {
        if (!userId) {
            setLogs([]);
            setLogsLoaded(true);
            return;
        }

        setLogsLoaded(false);
        const logsCollectionRef = collection(db, 'users', userId, 'logs');
        const q = query(logsCollectionRef, orderBy('date', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedLogs: WorkoutLog[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const date = data.date;

                let dateISO: string;
                if (date && typeof date.toDate === 'function') {
                    dateISO = (date as Timestamp).toDate().toISOString();
                } else if (date) {
                    // Handle cases where it might already be an ISO string or a Date object
                    dateISO = new Date(date).toISOString();
                } else {
                    // Fallback if date is null/undefined
                    dateISO = new Date().toISOString();
                }
                
                fetchedLogs.push({
                    id: doc.id,
                    ...data,
                    date: dateISO,
                } as WorkoutLog);
            });
            setLogs(fetchedLogs);
            setLogsLoaded(true);
        }, (error) => {
            console.error("Failed to load logs from Firestore", error);
            setLogsLoaded(true);
        });

        return () => unsubscribe(); // Cleanup listener on component unmount
    }, [userId]);

    const addLog = useCallback(async (newLog: NewLog) => {
        if (!userId) {
            console.error("Cannot add log. User not logged in.");
            return;
        }
        
        try {
            const logsCollectionRef = collection(db, 'users', userId, 'logs');
            await addDoc(logsCollectionRef, {
                ...newLog,
                date: serverTimestamp(),
            });
        } catch (e) {
            console.error("Failed to save log to Firestore", e);
        }
    }, [userId]);

    return { logs, addLog, logsLoaded };
}