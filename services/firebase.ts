import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Firebase Configuration
 * 
 * To enable Cloud persistence, you must provide these environment variables.
 * You can find these in your Firebase Console -> Project Settings.
 */
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.REACT_APP_FIREBASE_APP_ID
};

// Check if config is valid
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

if (!isConfigValid) {
    console.warn("Firebase configuration missing. App will run in local storage mode.");
}

// Initialize Firebase only if config is present
export const app = isConfigValid ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

export const isCloudEnabled = () => !!db;