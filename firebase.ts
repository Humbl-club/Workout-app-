// This file configures and initializes Firebase services using the v9 modular SDK.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// =================================================================
//  USER'S FIREBASE CONFIGURATION - APPLIED
// =================================================================
//
// **CRITICAL STEP - UPDATE DATABASE RULES**:
//    This is the most likely cause of the "Missing or insufficient permissions" error.
//    In your Firebase Console, go to "Build" -> "Firestore Database" -> "Rules".
//    Replace the entire content with the following rules and click "Publish":
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        // Match any document in the 'users' collection
//        match /users/{userId} {
//
//          // A user can read and write to their own user document.
//          // This is used for storing settings like activePlanId and lastProgressionApplied.
//          allow read, write: if request.auth.uid == userId;
//
//          // Allow users to read and write to their own 'plans' subcollection
//          match /plans/{planId} {
//            allow read, write: if request.auth.uid == userId;
//          }
//
//          // Allow users to read and write to their own 'logs' subcollection
//          match /logs/{logId} {
//            allow read, write: if request.auth.uid == userId;
//          }
//        }
//      }
//    }
//
const firebaseConfig = {
  apiKey: "AIzaSyAcfbgYNc0DvpIvTfOJZg9X3erOjJpFXi4",
  authDomain: "workout-app-51c48.firebaseapp.com",
  projectId: "workout-app-51c48",
  storageBucket: "workout-app-51c48.firebasestorage.app",
  messagingSenderId: "986750140921",
  appId: "1:986750140921:web:d83625dfddbde20bbbbd28",
  measurementId: "G-FPVHWYE3MR"
};
// =================================================================

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);