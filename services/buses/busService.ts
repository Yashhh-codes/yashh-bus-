import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, IS_MOCK_MODE } from '@/lib/firebase';
import { Bus } from '../../types/bus';

const INITIAL_BUSES: Bus[] = [
  { id: "B-01", busNumber: "MH-12-PQ-9876", name: "SwiftAir Cruiser",      type: "AC Sleeper",   capacity: 36, regNumber: "MH12PQ9876", modelYear: "2024", status: "Active",      assignedRouteId: "RT-01" },
  { id: "B-02", busNumber: "MH-12-AB-1234", name: "StarExpress Seater",    type: "AC Seater",    capacity: 45, regNumber: "MH12AB1234", modelYear: "2023", status: "Active",      assignedRouteId: "RT-02" },
  { id: "B-03", busNumber: "MH-14-XY-7777", name: "EcoVolt Electric",      type: "Semi Sleeper", capacity: 40, regNumber: "MH14XY7777", modelYear: "2025", status: "Active",      assignedRouteId: "RT-04" },
  { id: "B-04", busNumber: "MH-12-CD-5678", name: "CityRider Non-AC",      type: "Non AC",       capacity: 50, regNumber: "MH12CD5678", modelYear: "2021", status: "Maintenance", assignedRouteId: null },
  { id: "B-05", busNumber: "MH-12-EF-9012", name: "SwiftAir SleepMaster",  type: "AC Sleeper",   capacity: 36, regNumber: "MH12EF9012", modelYear: "2024", status: "Active",      assignedRouteId: "RT-01" },
  { id: "B-06", busNumber: "MH-20-GH-3456", name: "Pune Express Cruiser",  type: "AC Seater",    capacity: 42, regNumber: "MH20GH3456", modelYear: "2023", status: "Active",      assignedRouteId: "RT-05" },
  { id: "B-07", busNumber: "MH-14-JK-2222", name: "GreenLine Commuter",    type: "Non AC",       capacity: 52, regNumber: "MH14JK2222", modelYear: "2022", status: "Active",      assignedRouteId: "RT-06" },
  { id: "B-08", busNumber: "MH-12-LM-8888", name: "NightStar Sleeper",     type: "AC Sleeper",   capacity: 30, regNumber: "MH12LM8888", modelYear: "2025", status: "Active",      assignedRouteId: "RT-08" },
  { id: "B-09", busNumber: "MH-09-NP-4444", name: "Metro Connect Bus",     type: "Semi Sleeper", capacity: 44, regNumber: "MH09NP4444", modelYear: "2023", status: "Maintenance", assignedRouteId: null },
  { id: "B-10", busNumber: "MH-12-RS-6600", name: "LinkRider Deluxe",      type: "AC Seater",    capacity: 38, regNumber: "MH12RS6600", modelYear: "2024", status: "Active",      assignedRouteId: "RT-07" },
];

const MOCK_DATA_VERSION = 'v3';
const isClient = typeof window !== 'undefined';
let buses: Bus[] = [...INITIAL_BUSES];

const loadFromStorage = (): Bus[] => {
  if (isClient) {
    if (localStorage.getItem('swift_buses_version') !== MOCK_DATA_VERSION) {
      localStorage.removeItem('swift_buses');
      localStorage.setItem('swift_buses_version', MOCK_DATA_VERSION);
    }
    const saved = localStorage.getItem('swift_buses');
    if (saved) {
      try {
        const stored: Bus[] = JSON.parse(saved);
        const mergedMap = new Map<string, Bus>();
        INITIAL_BUSES.forEach(b => mergedMap.set(b.id, b));
        stored.forEach(b => mergedMap.set(b.id, b));
        buses = Array.from(mergedMap.values());
      } catch {
        buses = [...INITIAL_BUSES];
      }
    } else {
      buses = [...INITIAL_BUSES];
    }
  }
  return buses;
};

const saveToStorage = () => {
  if (isClient) localStorage.setItem('swift_buses', JSON.stringify(buses));
};

loadFromStorage();

export const busService = {
  getAll: async (): Promise<Bus[]> => {
    if (!IS_MOCK_MODE) {
      const snap = await getDocs(collection(db, 'buses'));
      const list: Bus[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Bus));
      return list;
    }
    return [...buses];
  },

  getById: async (id: string): Promise<Bus | null> => {
    if (!IS_MOCK_MODE) {
      const docSnap = await getDoc(doc(db, 'buses', id));
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Bus) : null;
    }
    return buses.find((b) => b.id === id) || null;
  },

  create: async (data: Omit<Bus, 'id'>): Promise<Bus> => {
    if (!IS_MOCK_MODE) {
      const snap = await getDocs(collection(db, 'buses'));
      let maxNum = 0;
      snap.forEach((d) => { const num = parseInt(d.id.split('-')[1]) || 0; if (num > maxNum) maxNum = num; });
      const newId = `B-${String(maxNum + 1).padStart(2, '0')}`;
      await setDoc(doc(db, 'buses', newId), data);
      return { id: newId, ...data };
    }
    const nextNum = buses.length > 0 ? Math.max(...buses.map(b => parseInt(b.id.split('-')[1]) || 0)) + 1 : 1;
    const newId = `B-${String(nextNum).padStart(2, '0')}`;
    const newBus: Bus = { id: newId, ...data };
    buses.push(newBus);
    saveToStorage();
    return newBus;
  },

  update: async (id: string, data: Partial<Bus>): Promise<Bus | null> => {
    if (!IS_MOCK_MODE) {
      const docRef = doc(db, 'buses', id);
      await updateDoc(docRef, data);
      const updatedSnap = await getDoc(docRef);
      return updatedSnap.exists() ? ({ id: updatedSnap.id, ...updatedSnap.data() } as Bus) : null;
    }
    const idx = buses.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    buses[idx] = { ...buses[idx], ...data };
    saveToStorage();
    return buses[idx];
  },

  remove: async (id: string): Promise<boolean> => {
    if (!IS_MOCK_MODE) {
      await deleteDoc(doc(db, 'buses', id));
      return true;
    }
    const idx = buses.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    buses.splice(idx, 1);
    saveToStorage();
    return true;
  },
};
export type BusServiceType = typeof busService;
