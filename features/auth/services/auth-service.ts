import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, IS_MOCK_MODE } from '@/lib/firebase';
import { UserProfile } from '@/providers/auth-provider';
import { loginSchema, registerSchema } from '@/schemas/auth-schemas';
import { z } from 'zod';

type LoginInput = z.infer<typeof loginSchema>;
type RegisterInput = z.infer<typeof registerSchema>;

export const authService = {
  async login({ email, password }: LoginInput) {
    if (IS_MOCK_MODE) {
      const mockProfile = {
        uid: 'demo_user_uid_123',
        email: email,
        displayName: email.split('@')[0],
        role: 'passenger',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('mock_user_session', JSON.stringify(mockProfile));
      window.dispatchEvent(new Event('storage'));
      return { uid: mockProfile.uid, email: mockProfile.email, displayName: mockProfile.displayName } as any;
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async register({ email, password, fullName, phoneNumber }: RegisterInput) {
    if (IS_MOCK_MODE) {
      const mockProfile = {
        uid: `demo_user_${Date.now()}`,
        email: email,
        displayName: fullName,
        phoneNumber: phoneNumber || undefined,
        role: 'passenger',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('mock_user_session', JSON.stringify(mockProfile));
      window.dispatchEvent(new Event('storage'));
      return { uid: mockProfile.uid, email: mockProfile.email, displayName: mockProfile.displayName } as any;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fUser = userCredential.user;
    
    await updateProfile(fUser, {
      displayName: fullName
    });

    const userDocRef = doc(db, 'users', fUser.uid);
    const userProfile: UserProfile = {
      uid: fUser.uid,
      email: fUser.email || '',
      displayName: fullName,
      phoneNumber: phoneNumber || undefined,
      role: 'passenger',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(userDocRef, userProfile);
    
    return fUser;
  },

  async googleSignIn() {
    if (IS_MOCK_MODE) {
      const mockProfile = {
        uid: 'google_mock_user_id',
        email: 'google-passenger@demo.com',
        displayName: 'Demo Google Passenger',
        role: 'passenger',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('mock_user_session', JSON.stringify(mockProfile));
      window.dispatchEvent(new Event('storage'));
      return { uid: mockProfile.uid, email: mockProfile.email, displayName: mockProfile.displayName } as any;
    }
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  },

  async forgotPassword(email: string) {
    if (IS_MOCK_MODE) {
      return;
    }
    await sendPasswordResetEmail(auth, email);
  },

  async logout() {
    if (IS_MOCK_MODE) {
      localStorage.removeItem('mock_user_session');
      window.dispatchEvent(new Event('storage'));
      return;
    }
    await signOut(auth);
  }
};
export type { LoginInput, RegisterInput };
