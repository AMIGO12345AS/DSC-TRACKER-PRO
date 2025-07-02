import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that all required Firebase config values are present.
// This prevents the app from hanging indefinitely if the .env file is missing or incomplete.
const requiredConfigKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
];

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  // In a browser environment, process.env is handled by Next.js.
  // If keys are missing, it means the .env file is not set up.
  // We throw a clear error to the developer.
  throw new Error(`Firebase configuration is missing the following required keys: ${missingKeys.join(', ')}. Please make sure your .env.local file is set up correctly with your Firebase project credentials.`);
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
