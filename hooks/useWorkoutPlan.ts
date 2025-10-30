import { useState, useEffect, useCallback } from 'react';
import { WorkoutPlan } from '../types';
import { db } from '../firebase';
import { collection, doc, getDoc, setDoc, deleteDoc, addDoc, onSnapshot, query, orderBy, serverTimestamp, Timestamp, writeBatch } from 'firebase/firestore';

export default function useWorkoutPlan(userId: string | undefined | null) {
    const [allPlans, setAllPlans] = useState<WorkoutPlan[] | null>(null);
    // FIX: Renamed state setter to avoid conflict with the exported `setActivePlan` function.
    const [activePlan, _setActivePlan] = useState<WorkoutPlan | null>(null);
    const [planLoaded, setPlanLoaded] = useState(false);
    
    useEffect(() => {
        if (!userId) {
            setAllPlans(null);
            _setActivePlan(null);
            setPlanLoaded(true);
            return;
        }

        setPlanLoaded(false);
        const plansCollectionRef = collection(db, 'users', userId, 'plans');
        const q = query(plansCollectionRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const fetchedPlans: WorkoutPlan[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const createdAt = data.createdAt;

                let createdAtISO: string;
                if (createdAt && typeof createdAt.toDate === 'function') {
                    createdAtISO = (createdAt as Timestamp).toDate().toISOString();
                } else if (createdAt) {
                    // Handle cases where it might already be an ISO string or a Date object
                    createdAtISO = new Date(createdAt).toISOString();
                } else {
                    // Fallback if createdAt is null/undefined
                    createdAtISO = new Date().toISOString();
                }

                fetchedPlans.push({
                    id: doc.id,
                    ...data,
                    createdAt: createdAtISO,
                } as WorkoutPlan);
            });

            setAllPlans(fetchedPlans);

            const userDocRef = doc(db, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);
            let activePlanId: string | undefined;

            if (userDocSnap.exists()) {
                activePlanId = userDocSnap.data().activePlanId;
            }

            if (fetchedPlans.length > 0) {
                const planToActivate = fetchedPlans.find(p => p.id === activePlanId) || fetchedPlans[0];
                _setActivePlan(planToActivate);
                if (planToActivate.id !== activePlanId) {
                    await setDoc(userDocRef, { activePlanId: planToActivate.id }, { merge: true });
                }
            } else {
                _setActivePlan(null);
                 if (activePlanId) {
                    await setDoc(userDocRef, { activePlanId: null }, { merge: true });
                }
            }

            setPlanLoaded(true);

        }, (error) => {
            console.error("Error fetching workout plans:", error);
            setPlanLoaded(true);
        });

        return () => unsubscribe();
    }, [userId]);
    
    const setActivePlan = useCallback(async (planId: string) => {
        if (!userId) return;
        const userDocRef = doc(db, 'users', userId);
        try {
            await setDoc(userDocRef, { activePlanId: planId }, { merge: true });
            const newActivePlan = allPlans?.find(p => p.id === planId) || null;
            _setActivePlan(newActivePlan);
        } catch (error) {
            console.error("Error setting active plan:", error);
        }
    }, [userId, allPlans]);

    const addPlan = useCallback(async (newPlanData: Omit<WorkoutPlan, 'id'>) => {
        if (!userId) return;
        
        const plansCollectionRef = collection(db, 'users', userId, 'plans');
        try {
            const planWithTimestamp = {
                ...newPlanData,
                createdAt: serverTimestamp()
            };
            const newDocRef = await addDoc(plansCollectionRef, planWithTimestamp);
            await setActivePlan(newDocRef.id);
        } catch (error) {
            console.error("Error adding new plan:", error);
        }
    }, [userId, setActivePlan]);
    
    const updatePlan = useCallback(async (updatedPlan: WorkoutPlan) => {
        if (!userId || !updatedPlan.id) return;
        const planDocRef = doc(db, 'users', userId, 'plans', updatedPlan.id);
        try {
            await setDoc(planDocRef, updatedPlan, { merge: true });
        } catch(error) {
            console.error("Error updating plan:", error);
        }
    }, [userId]);

    const deletePlan = useCallback(async (planId: string) => {
        if (!userId) return;

        const planDocRef = doc(db, 'users', userId, 'plans', planId);
        try {
            await deleteDoc(planDocRef);
            // The onSnapshot listener will handle updating state
        } catch (error) {
            console.error("Error deleting plan:", error);
        }
    }, [userId]);

    return { allPlans, activePlan, addPlan, updatePlan, deletePlan, setActivePlan, planLoaded };
}