import { initializeApp, getApps, getApp } from 'firebase/app';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Fallback configuration to prevent build-time crashes (e.g. on Netlify or local testing without env keys)
const isValidConfig = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined' && firebaseConfig.apiKey !== '';

const dummyConfig = {
  apiKey: "mock-api-key-for-build-purposes-only",
  authDomain: "mock-auth-domain.firebaseapp.com",
  projectId: "mock-project-id",
  storageBucket: "mock-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890",
};

// Initialize Firebase App
export const app = getApps().length > 0 
  ? getApp() 
  : initializeApp(isValidConfig ? firebaseConfig : dummyConfig);
