import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, IS_MOCK_MODE } from '@/lib/firebase';
import { Booking } from '../../types/booking';

const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const yest = new Date(today); yest.setDate(yest.getDate() - 1);
const yesterdayStr = yest.toISOString().split('T')[0];
const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

const INITIAL_BOOKINGS: Booking[] = [
  { id: "BK-8295", passengerName: "Amit Sharma",    phoneNumber: "+91 98234 56789", scheduleId: "SCH-01", seats: 2, selectedSeats: ["1A","1B"], amount: 240, paymentStatus: "Paid",     bookingStatus: "Confirmed", createdAt: `${todayStr}T08:00:00.000Z` },
  { id: "BK-8294", passengerName: "Priya Patel",    phoneNumber: "+91 88776 65544", scheduleId: "SCH-02", seats: 1, selectedSeats: ["2A"],       amount: 40,  paymentStatus: "Pending",  bookingStatus: "Pending",   createdAt: `${todayStr}T09:30:00.000Z` },
  { id: "BK-8293", passengerName: "Rohan Das",      phoneNumber: "+91 77665 54433", scheduleId: "SCH-03", seats: 3, selectedSeats: ["3A","3B","3C"], amount: 270, paymentStatus: "Paid", bookingStatus: "Confirmed", createdAt: `${todayStr}T10:15:00.000Z` },
  { id: "BK-8292", passengerName: "Sneha Reddy",    phoneNumber: "+91 99887 76655", scheduleId: "SCH-05", seats: 2, selectedSeats: ["1C","1D"], amount: 260, paymentStatus: "Paid",     bookingStatus: "Confirmed", createdAt: `${todayStr}T11:00:00.000Z` },
  { id: "BK-8291", passengerName: "Vikram Singh",   phoneNumber: "+91 77009 98877", scheduleId: "SCH-06", seats: 1, selectedSeats: ["4B"],       amount: 130, paymentStatus: "Paid",     bookingStatus: "Confirmed", createdAt: `${todayStr}T11:45:00.000Z` },
  { id: "BK-8290", passengerName: "Meera Nair",     phoneNumber: "+91 91234 56780", scheduleId: "SCH-01", seats: 2, selectedSeats: ["2B","2C"], amount: 240, paymentStatus: "Pending",  bookingStatus: "Pending",   createdAt: `${todayStr}T12:30:00.000Z` },
  { id: "BK-8289", passengerName: "Arjun Kulkarni", phoneNumber: "+91 85555 44321", scheduleId: "SCH-02", seats: 1, selectedSeats: ["3D"],       amount: 40,  paymentStatus: "Paid",     bookingStatus: "Confirmed", createdAt: `${todayStr}T13:00:00.000Z` },
  { id: "BK-8288", passengerName: "Divya Menon",    phoneNumber: "+91 93210 98765", scheduleId: "SCH-03", seats: 1, selectedSeats: ["2D"],       amount: 90,  paymentStatus: "Refunded", bookingStatus: "Cancelled", createdAt: `${todayStr}T14:00:00.000Z` },
  { id: "BK-8287", passengerName: "Kiran Joshi",    phoneNumber: "+91 86543 21098", scheduleId: "SCH-05", seats: 3, selectedSeats: ["5A","5B","5C"], amount: 390, paymentStatus: "Paid", bookingStatus: "Confirmed", createdAt: `${yesterdayStr}T09:00:00.000Z` },
  { id: "BK-8286", passengerName: "Rahul Desai",    phoneNumber: "+91 98001 23456", scheduleId: "SCH-06", seats: 2, selectedSeats: ["6A","6B"], amount: 260, paymentStatus: "Paid",     bookingStatus: "Confirmed", createdAt: `${yesterdayStr}T10:30:00.000Z` },
  { id: "BK-8285", passengerName: "Sunita Bhosle",  phoneNumber: "+91 77123 45678", scheduleId: "SCH-01", seats: 1, selectedSeats: ["4C"],       amount: 120, paymentStatus: "Pending",  bookingStatus: "Pending",   createdAt: `${yesterdayStr}T14:00:00.000Z` },
  { id: "BK-8284", passengerName: "Ajay Tiwari",    phoneNumber: "+91 88909 87654", scheduleId: "SCH-02", seats: 2, selectedSeats: ["1A","1B"], amount: 80,  paymentStatus: "Refunded", bookingStatus: "Cancelled", createdAt: `${twoDaysAgoStr}T08:30:00.000Z` },
  { id: "BK-8283", passengerName: "Pooja Iyer",     phoneNumber: "+91 99001 12345", scheduleId: "SCH-03", seats: 1, selectedSeats: ["5D"],       amount: 90,  paymentStatus: "Paid",     bookingStatus: "Confirmed", createdAt: `${twoDaysAgoStr}T11:00:00.000Z` },
];

const MOCK_DATA_VERSION = 'v3';
const isClient = typeof window !== 'undefined';
let bookings: Booking[] = [...INITIAL_BOOKINGS];

const loadFromStorage = (): Booking[] => {
  if (isClient) {
    if (localStorage.getItem('swift_bookings_version') !== MOCK_DATA_VERSION) {
      localStorage.removeItem('swift_bookings');
      localStorage.setItem('swift_bookings_version', MOCK_DATA_VERSION);
    }
    const saved = localStorage.getItem('swift_bookings');
    if (saved) {
      try {
        const stored: Booking[] = JSON.parse(saved);
        // Merge: initial mock data as base, user-created entries on top
        const mergedMap = new Map<string, Booking>();
        INITIAL_BOOKINGS.forEach(b => mergedMap.set(b.id, b));
        stored.forEach(b => mergedMap.set(b.id, b));
        bookings = Array.from(mergedMap.values());
      } catch {
        bookings = [...INITIAL_BOOKINGS];
      }
    } else {
      bookings = [...INITIAL_BOOKINGS];
    }
  }
  return bookings;
};

const saveToStorage = () => {
  if (isClient) {
    localStorage.setItem('swift_bookings', JSON.stringify(bookings));
  }
};

// Initialize fallback mock data
loadFromStorage();

export const bookingService = {
  getAll: async (): Promise<Booking[]> => {
    if (!IS_MOCK_MODE) {
      const snap = await getDocs(collection(db, 'bookings'));
      const list: Booking[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Booking);
      });
      return list;
    }
    return [...bookings];
  },

  getById: async (id: string): Promise<Booking | null> => {
    if (!IS_MOCK_MODE) {
      const docSnap = await getDoc(doc(db, 'bookings', id));
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Booking) : null;
    }
    return bookings.find((b) => b.id === id) || null;
  },

  create: async (data: Omit<Booking, 'id' | 'createdAt'> & { createdAt?: string }): Promise<Booking> => {
    if (!IS_MOCK_MODE) {
      const snap = await getDocs(collection(db, 'bookings'));
      let maxNum = 0;
      snap.forEach((d) => {
        const num = parseInt(d.id.split('-')[1]) || 0;
        if (num > maxNum) maxNum = num;
      });
      const nextNum = maxNum > 0 ? maxNum + 1 : 8292;
      const newId = `BK-${String(nextNum)}`;
      const newBooking: Booking = {
        id: newId,
        createdAt: data.createdAt || new Date().toISOString(),
        ...data,
      };
      await setDoc(doc(db, 'bookings', newId), newBooking);
      return newBooking;
    }

    const nextNum = bookings.length > 0 ? Math.max(...bookings.map(b => parseInt(b.id.split('-')[1]) || 0)) + 1 : 8292;
    const newId = `BK-${String(nextNum)}`;
    const newBooking: Booking = {
      id: newId,
      createdAt: data.createdAt || new Date().toISOString(),
      ...data,
    };
    bookings.push(newBooking);
    saveToStorage();
    return newBooking;
  },

  update: async (id: string, data: Partial<Booking>): Promise<Booking | null> => {
    if (!IS_MOCK_MODE) {
      const docRef = doc(db, 'bookings', id);
      await updateDoc(docRef, data);
      const updatedSnap = await getDoc(docRef);
      return updatedSnap.exists() ? ({ id: updatedSnap.id, ...updatedSnap.data() } as Booking) : null;
    }

    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    bookings[idx] = { ...bookings[idx], ...data };
    saveToStorage();
    return bookings[idx];
  },

  remove: async (id: string): Promise<boolean> => {
    if (!IS_MOCK_MODE) {
      await deleteDoc(doc(db, 'bookings', id));
      return true;
    }

    const idx = bookings.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    bookings.splice(idx, 1);
    saveToStorage();
    return true;
  },
};
export type BookingServiceType = typeof bookingService;
