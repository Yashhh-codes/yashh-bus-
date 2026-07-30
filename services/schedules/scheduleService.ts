import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, IS_MOCK_MODE } from '@/lib/firebase';
import { Schedule } from '../../types/schedule';
import { busService } from '../buses/busService';
import { bookingService } from '../bookings/bookingService';

const _today = new Date().toISOString().split('T')[0];
const _tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })();
const _dayAfter = (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0]; })();

const INITIAL_SCHEDULES: Schedule[] = [
  // Today's schedules
  { id: "SCH-01", routeId: "RT-01", busId: "B-01", departureTime: "06:30 AM", arrivalTime: "07:45 AM", travelDate: _today,    availableSeats: 34, status: "Active" },
  { id: "SCH-02", routeId: "RT-02", busId: "B-02", departureTime: "08:00 AM", arrivalTime: "08:30 AM", travelDate: _today,    availableSeats: 45, status: "Active" },
  { id: "SCH-03", routeId: "RT-03", busId: "B-03", departureTime: "09:15 AM", arrivalTime: "10:00 AM", travelDate: _today,    availableSeats: 37, status: "Active" },
  { id: "SCH-04", routeId: "RT-05", busId: "B-06", departureTime: "10:00 AM", arrivalTime: "10:40 AM", travelDate: _today,    availableSeats: 40, status: "Active" },
  { id: "SCH-05", routeId: "RT-07", busId: "B-10", departureTime: "11:30 AM", arrivalTime: "12:05 PM", travelDate: _today,    availableSeats: 36, status: "Active" },
  { id: "SCH-06", routeId: "RT-08", busId: "B-08", departureTime: "01:00 PM", arrivalTime: "01:55 PM", travelDate: _today,    availableSeats: 28, status: "Active" },
  { id: "SCH-07", routeId: "RT-04", busId: "B-05", departureTime: "03:30 PM", arrivalTime: "04:30 PM", travelDate: _today,    availableSeats: 35, status: "Active" },
  { id: "SCH-08", routeId: "RT-06", busId: "B-07", departureTime: "05:00 PM", arrivalTime: "06:30 PM", travelDate: _today,    availableSeats: 50, status: "Suspended" },
  { id: "SCH-09", routeId: "RT-01", busId: "B-05", departureTime: "07:00 PM", arrivalTime: "08:15 PM", travelDate: _today,    availableSeats: 34, status: "Active" },
  // Tomorrow's schedules
  { id: "SCH-10", routeId: "RT-02", busId: "B-02", departureTime: "07:00 AM", arrivalTime: "07:30 AM", travelDate: _tomorrow, availableSeats: 45, status: "Active" },
  { id: "SCH-11", routeId: "RT-04", busId: "B-03", departureTime: "09:00 AM", arrivalTime: "10:00 AM", travelDate: _tomorrow, availableSeats: 40, status: "Active" },
  { id: "SCH-12", routeId: "RT-08", busId: "B-08", departureTime: "02:00 PM", arrivalTime: "02:55 PM", travelDate: _tomorrow, availableSeats: 30, status: "Active" },
  // Day after tomorrow
  { id: "SCH-13", routeId: "RT-09", busId: "B-10", departureTime: "08:30 AM", arrivalTime: "08:58 AM", travelDate: _dayAfter, availableSeats: 38, status: "Active" },
  { id: "SCH-14", routeId: "RT-06", busId: "B-07", departureTime: "04:00 PM", arrivalTime: "05:30 PM", travelDate: _dayAfter, availableSeats: 52, status: "Active" },
];

const isClient = typeof window !== 'undefined';
const MOCK_DATA_VERSION = 'v3';
let schedules: Schedule[] = [...INITIAL_SCHEDULES];

const loadFromStorage = (): Schedule[] => {
  if (isClient) {
    if (localStorage.getItem('swift_schedules_version') !== MOCK_DATA_VERSION) {
      localStorage.removeItem('swift_schedules');
      localStorage.setItem('swift_schedules_version', MOCK_DATA_VERSION);
    }
    const saved = localStorage.getItem('swift_schedules');
    if (saved) {
      try {
        const stored: Schedule[] = JSON.parse(saved);
        const mergedMap = new Map<string, Schedule>();
        INITIAL_SCHEDULES.forEach(s => mergedMap.set(s.id, s));
        stored.forEach(s => mergedMap.set(s.id, s));
        schedules = Array.from(mergedMap.values());
      } catch {
        schedules = [...INITIAL_SCHEDULES];
      }
    } else {
      schedules = [...INITIAL_SCHEDULES];
    }
  }
  return schedules;
};

const saveToStorage = () => {
  if (isClient) {
    localStorage.setItem('swift_schedules', JSON.stringify(schedules));
  }
};

// Initialize fallback mock data
loadFromStorage();

const calculateAvailableSeats = async (schedule: Schedule): Promise<number> => {
  const bus = await busService.getById(schedule.busId);
  const capacity = bus ? bus.capacity : 36;
  
  const allBookings = await bookingService.getAll();
  const scheduleBookings = allBookings.filter(
    (b) => b.scheduleId === schedule.id && b.bookingStatus !== 'Cancelled'
  );
  
  const bookedSeatsCount = scheduleBookings.reduce((sum, b) => sum + (b.selectedSeats?.length || b.seats || 0), 0);
  return Math.max(0, capacity - bookedSeatsCount);
};

export const scheduleService = {
  getAll: async (): Promise<Schedule[]> => {
    if (!IS_MOCK_MODE) {
      const snap = await getDocs(collection(db, 'schedules'));
      const list: Schedule[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() } as Schedule);
      });
      return Promise.all(
        list.map(async (s) => ({
          ...s,
          availableSeats: await calculateAvailableSeats(s),
        }))
      );
    }

    const list = [...schedules];
    return Promise.all(
      list.map(async (s) => ({
        ...s,
        availableSeats: await calculateAvailableSeats(s),
      }))
    );
  },

  getById: async (id: string): Promise<Schedule | null> => {
    if (!IS_MOCK_MODE) {
      const docSnap = await getDoc(doc(db, 'schedules', id));
      if (!docSnap.exists()) return null;
      const s = { id: docSnap.id, ...docSnap.data() } as Schedule;
      return {
        ...s,
        availableSeats: await calculateAvailableSeats(s),
      };
    }

    const s = schedules.find((x) => x.id === id);
    if (!s) return null;
    return {
      ...s,
      availableSeats: await calculateAvailableSeats(s),
    };
  },

  create: async (data: Omit<Schedule, 'id' | 'availableSeats'>): Promise<Schedule> => {
    if (!IS_MOCK_MODE) {
      const snap = await getDocs(collection(db, 'schedules'));
      let maxNum = 0;
      snap.forEach((d) => {
        const num = parseInt(d.id.split('-')[1]) || 0;
        if (num > maxNum) maxNum = num;
      });
      const newId = `SCH-${String(maxNum + 1).padStart(2, '0')}`;
      const newSchedule: Schedule = { 
        id: newId, 
        availableSeats: 36, 
        ...data 
      };
      // Save without derived availableSeats counter field in database
      const docData = { ...newSchedule } as Partial<Schedule>;
      delete docData.availableSeats;
      await setDoc(doc(db, 'schedules', newId), docData);
      
      return {
        ...newSchedule,
        availableSeats: await calculateAvailableSeats(newSchedule),
      };
    }

    const nextNum = schedules.length > 0 ? Math.max(...schedules.map(s => parseInt(s.id.split('-')[1]) || 0)) + 1 : 1;
    const newId = `SCH-${String(nextNum).padStart(2, '0')}`;
    const newSchedule: Schedule = { 
      id: newId, 
      availableSeats: 36, 
      ...data 
    };
    schedules.push(newSchedule);
    saveToStorage();
    
    return {
      ...newSchedule,
      availableSeats: await calculateAvailableSeats(newSchedule),
    };
  },

  update: async (id: string, data: Partial<Schedule>): Promise<Schedule | null> => {
    if (!IS_MOCK_MODE) {
      const docRef = doc(db, 'schedules', id);
      const rest = { ...data };
      delete rest.availableSeats;
      await updateDoc(docRef, rest);
      const updatedSnap = await getDoc(docRef);
      if (!updatedSnap.exists()) return null;
      const s = { id: updatedSnap.id, ...updatedSnap.data() } as Schedule;
      return {
        ...s,
        availableSeats: await calculateAvailableSeats(s),
      };
    }

    const idx = schedules.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    schedules[idx] = { 
      ...schedules[idx], 
      ...data,
    };
    saveToStorage();
    
    return {
      ...schedules[idx],
      availableSeats: await calculateAvailableSeats(schedules[idx]),
    };
  },

  remove: async (id: string): Promise<boolean> => {
    if (!IS_MOCK_MODE) {
      await deleteDoc(doc(db, 'schedules', id));
      return true;
    }

    const idx = schedules.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    schedules.splice(idx, 1);
    saveToStorage();
    return true;
  },
};
export type ScheduleServiceType = typeof scheduleService;
