import { app } from '@/firebase/config';
import { auth, googleProvider } from '@/firebase/auth';
import { db } from '@/firebase/firestore';
import { storage } from '@/firebase/storage';

// Compute mock fallback mode flag
export const IS_MOCK_MODE = 
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "mock-api-key" || 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "";

export { app, auth, db, storage, googleProvider };
