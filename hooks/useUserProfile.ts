import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { db } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

export default function useUserProfile(userId: string | null) {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [profileLoaded, setProfileLoaded] = useState(false);

    useEffect(() => {
        if (!userId) {
            setUserProfile(null);
            setProfileLoaded(true);
            return;
        }

        setProfileLoaded(false);
        const userDocRef = doc(db, 'users', userId);

        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const lastProgression = data.lastProgressionApplied;

                let lastProgressionISO: string | null = null;
                if (lastProgression && typeof lastProgression.toDate === 'function') {
                    lastProgressionISO = (lastProgression as Timestamp).toDate().toISOString();
                } else if (lastProgression) {
                    lastProgressionISO = new Date(lastProgression).toISOString();
                }
                
                setUserProfile({
                    ...data,
                    lastProgressionApplied: lastProgressionISO,
                } as UserProfile);
            } else {
                setUserProfile({}); // User profile doesn't exist yet, but it's not an error
            }
            setProfileLoaded(true);
        }, (error) => {
            console.error("Failed to load user profile from Firestore", error);
            setProfileLoaded(true);
        });

        return () => unsubscribe();
    }, [userId]);

    const updateUserProfile = useCallback(async (profileData: Partial<UserProfile>) => {
        if (!userId) {
            console.error("Cannot update profile. User not logged in.");
            return;
        }
        
        try {
            const userDocRef = doc(db, 'users', userId);
            // If we're updating the progression date, use the server's timestamp
            const dataToSet = { ...profileData };
            if ('lastProgressionApplied' in dataToSet) {
                dataToSet.lastProgressionApplied = serverTimestamp();
            }
            await setDoc(userDocRef, dataToSet, { merge: true });
        } catch (e) {
            console.error("Failed to update user profile in Firestore", e);
        }
    }, [userId]);

    return { userProfile, updateUserProfile, profileLoaded };
}