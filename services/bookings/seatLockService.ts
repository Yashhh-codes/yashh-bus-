import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, writeBatch } from 'firebase/firestore';
import { db, IS_MOCK_MODE } from '@/lib/firebase';

export interface SeatLock {
  id: string; // `${scheduleId}_${seatId}`
  scheduleId: string;
  seatId: string;
  userId: string;
  expiresAt: number; // timestamp
}

// In-memory/localStorage fallback for mock mode
const MOCK_LOCKS_KEY = 'swift_seat_locks';

const getMockLocks = (): SeatLock[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(MOCK_LOCKS_KEY);
  if (!data) return [];
  try {
    const list: SeatLock[] = JSON.parse(data);
    // filter expired locks
    return list.filter(l => l.expiresAt > Date.now());
  } catch {
    return [];
  }
};

const saveMockLocks = (locks: SeatLock[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(MOCK_LOCKS_KEY, JSON.stringify(locks.filter(l => l.expiresAt > Date.now())));
  }
};

export const seatLockService = {
  // Acquire a backend lock for a specific seat
  acquireLock: async (scheduleId: string, seatId: string, userId: string): Promise<boolean> => {
    const lockId = `${scheduleId}_${seatId}`;
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes lock

    if (!IS_MOCK_MODE) {
      try {
        const docRef = doc(db, 'seat_locks', lockId);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          const currentLock = snap.data() as Omit<SeatLock, 'id'>;
          // If the lock is active and belongs to someone else, reject
          if (currentLock.expiresAt > Date.now() && currentLock.userId !== userId) {
            return false;
          }
        }
        
        // Write the lock to Firestore
        await setDoc(docRef, {
          scheduleId,
          seatId,
          userId,
          expiresAt,
        });
        return true;
      } catch (error) {
        console.error('Failed to acquire Firestore seat lock:', error);
        return false;
      }
    }

    // Mock Mode fallback
    const locks = getMockLocks();
    const existing = locks.find(l => l.id === lockId);
    if (existing && existing.expiresAt > Date.now() && existing.userId !== userId) {
      return false;
    }

    const filtered = locks.filter(l => l.id !== lockId);
    filtered.push({
      id: lockId,
      scheduleId,
      seatId,
      userId,
      expiresAt,
    });
    saveMockLocks(filtered);
    return true;
  },

  // Release lock for a specific seat
  releaseLock: async (scheduleId: string, seatId: string, userId: string): Promise<void> => {
    const lockId = `${scheduleId}_${seatId}`;

    if (!IS_MOCK_MODE) {
      try {
        const docRef = doc(db, 'seat_locks', lockId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const currentLock = snap.data() as Omit<SeatLock, 'id'>;
          if (currentLock.userId === userId) {
            await deleteDoc(docRef);
          }
        }
      } catch (error) {
        console.error('Failed to release Firestore seat lock:', error);
      }
      return;
    }

    // Mock Mode fallback
    const locks = getMockLocks();
    const filtered = locks.filter(l => !(l.id === lockId && l.userId === userId));
    saveMockLocks(filtered);
  },

  // Release all locks held by a specific user (e.g. on completion or expire)
  releaseAllUserLocks: async (scheduleId: string, userId: string): Promise<void> => {
    if (!IS_MOCK_MODE) {
      try {
        const q = query(
          collection(db, 'seat_locks'),
          where('scheduleId', '==', scheduleId),
          where('userId', '==', userId)
        );
        const snap = await getDocs(q);
        const batch = writeBatch(db);
        snap.forEach((d) => {
          batch.delete(d.ref);
        });
        await batch.commit();
      } catch (error) {
        console.error('Failed to clear user seat locks in Firestore:', error);
      }
      return;
    }

    // Mock Mode fallback
    const locks = getMockLocks();
    const filtered = locks.filter(l => !(l.scheduleId === scheduleId && l.userId === userId));
    saveMockLocks(filtered);
  },

  // Retrieve currently locked seats (excluding expired ones) for a schedule
  getLockedSeats: async (scheduleId: string): Promise<string[]> => {
    if (!IS_MOCK_MODE) {
      try {
        const q = query(
          collection(db, 'seat_locks'),
          where('scheduleId', '==', scheduleId)
        );
        const snap = await getDocs(q);
        const list: string[] = [];
        snap.forEach((d) => {
          const data = d.data() as Omit<SeatLock, 'id'>;
          if (data.expiresAt > Date.now()) {
            list.push(data.seatId);
          }
        });
        return list;
      } catch (error) {
        console.error('Failed to fetch locked seats from Firestore:', error);
        return [];
      }
    }

    // Mock Mode fallback
    const locks = getMockLocks();
    return locks.filter(l => l.scheduleId === scheduleId).map(l => l.seatId);
  },
};
export type SeatLockServiceType = typeof seatLockService;
