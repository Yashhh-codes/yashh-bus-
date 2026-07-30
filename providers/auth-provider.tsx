'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut, 
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, IS_MOCK_MODE } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'passenger';
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  signOutUser: async () => {},
  signInWithGoogle: async () => {},
});

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (IS_MOCK_MODE) {
      const savedUserStr = localStorage.getItem('mock_user_session');
      if (savedUserStr) {
        const mockUser = JSON.parse(savedUserStr);
        setFirebaseUser({ uid: mockUser.uid, email: mockUser.email, displayName: mockUser.displayName } as any);
        setUser(mockUser);
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);

      const handleStorageChange = () => {
        const updated = localStorage.getItem('mock_user_session');
        if (updated) {
          const u = JSON.parse(updated);
          setFirebaseUser({ uid: u.uid, email: u.email, displayName: u.displayName } as any);
          setUser(u);
        } else {
          setFirebaseUser(null);
          setUser(null);
        }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }

    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        const userDocRef = doc(db, 'users', fUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUser(docSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: fUser.uid,
              email: fUser.email || '',
              displayName: fUser.displayName || 'Passenger',
              photoURL: fUser.photoURL || undefined,
              role: 'passenger',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUser(newProfile);
          }
        } catch (error) {
          console.error('Error fetching/setting user profile:', error);
          setUser({
            uid: fUser.uid,
            email: fUser.email || '',
            displayName: fUser.displayName || 'Passenger',
            role: 'passenger',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      const isPublicPath = PUBLIC_PATHS.includes(pathname) || pathname.startsWith('/dashboard');
      if (!firebaseUser && !isPublicPath) {
        router.push('/login');
      } else if (firebaseUser && isPublicPath && pathname !== '/' && !pathname.startsWith('/dashboard')) {
        router.push('/home');
      }
    }
  }, [firebaseUser, loading, pathname, router]);

  const signOutUser = async () => {
    if (IS_MOCK_MODE) {
      localStorage.removeItem('mock_user_session');
      setFirebaseUser(null);
      setUser(null);
      router.push('/login');
      return;
    }
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error('Error during sign out:', err);
    }
  };

  const signInWithGoogle = async () => {
    if (IS_MOCK_MODE) {
      const mockProfile: UserProfile = {
        uid: 'google_mock_user_id',
        email: 'google-passenger@demo.com',
        displayName: 'Demo Google Passenger',
        role: 'passenger',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('mock_user_session', JSON.stringify(mockProfile));
      setFirebaseUser({ uid: mockProfile.uid, email: mockProfile.email, displayName: mockProfile.displayName } as any);
      setUser(mockProfile);
      router.push('/home');
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        console.warn('Google sign in popup was closed by the user.');
      } else {
        console.error('Google sign in error:', error);
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signOutUser, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
