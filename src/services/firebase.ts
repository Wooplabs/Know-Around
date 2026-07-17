import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

// Polyfill for crypto.getRandomValues on React Native / Expo Go JS engines
if (typeof global.crypto !== 'object') {
  global.crypto = {} as any;
}
if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = ((array: any) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }) as any;
}

// Helper to sanitize environment variables from Windows CRLF carriage returns (\r)
const sanitizeEnv = (val?: string): string => {
  return val ? val.trim().replace(/[\r\n]/g, '') : '';
};

const firebaseConfig = {
  apiKey: sanitizeEnv(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
  authDomain: sanitizeEnv(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: sanitizeEnv(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: sanitizeEnv(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitizeEnv(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: sanitizeEnv(process.env.EXPO_PUBLIC_FIREBASE_APP_ID)
};

// Masked debug logs to verify key loading
console.log("=========================================");
console.log("FIREBASE INTEGRATION RUNTIME VERIFICATION:");
console.log("API KEY LOADED:", firebaseConfig.apiKey ? `${firebaseConfig.apiKey.slice(0, 7)}...${firebaseConfig.apiKey.slice(-5)} (Len: ${firebaseConfig.apiKey.length})` : "NOT FOUND");
console.log("PROJECT ID LOADED:", firebaseConfig.projectId || "NOT FOUND");
console.log("APP ID LOADED:", firebaseConfig.appId || "NOT FOUND");
console.log("=========================================");

// Check if critical configuration parameters are available
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app;
let auth;
let db;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    // Use long-polling transport to prevent streaming connection errors on React Native
    db = initializeFirestore(app, {
      experimentalForceLongPolling: true
    });
  } catch (error) {
    console.warn("Failed to initialize Firebase SDK:", error);
  }
}

export { auth, db };
