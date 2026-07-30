import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, IS_MOCK_MODE } from '@/lib/firebase';
import { Route } from '../../types/route';

const INITIAL_ROUTES: Route[] = [
  { id: "RT-01", name: "Express Hinjewadi-VimanNagar",   from: "Hinjewadi Phase 3",  to: "Viman Nagar",     distance: 22, duration: "1h 15m", fare: 120, status: "Active" },
  { id: "RT-02", name: "Kothrud Swargate Connect",        from: "Kothrud Depot",       to: "Swargate",        distance: 8,  duration: "30m",    fare: 40,  status: "Active" },
  { id: "RT-03", name: "Pune Station Wakad Shuttle",      from: "Pune Station",        to: "Wakad",           distance: 18, duration: "45m",    fare: 90,  status: "Inactive" },
  { id: "RT-04", name: "Hadapsar Baner Line",             from: "Hadapsar",            to: "Baner",           distance: 25, duration: "1h 00m", fare: 130, status: "Active" },
  { id: "RT-05", name: "Katraj Kothrud Link",             from: "Katraj",              to: "Kothrud",         distance: 12, duration: "40m",    fare: 60,  status: "Active" },
  { id: "RT-06", name: "Nigdi Swargate Express",          from: "Nigdi Terminal",      to: "Swargate Depot",  distance: 28, duration: "1h 30m", fare: 150, status: "Active" },
  { id: "RT-07", name: "Magarpatta City Link",            from: "Magarpatta",          to: "Swargate",        distance: 10, duration: "35m",    fare: 50,  status: "Active" },
  { id: "RT-08", name: "Pimpri Chinchwad Express",        from: "Pimpri",              to: "Shivajinagar",    distance: 20, duration: "55m",    fare: 100, status: "Active" },
  { id: "RT-09", name: "NIBM Road Connector",             from: "NIBM Road",           to: "Camp",            distance: 9,  duration: "28m",    fare: 45,  status: "Active" },
  { id: "RT-10", name: "Pashan Sus Road Route",           from: "Pashan",              to: "Sus Village",     distance: 7,  duration: "20m",    fare: 35,  status: "Inactive" },
];

// Version key – bump this number to force a localStorage reset
const MOCK_DATA_VERSION = 'v3';
const isClient = typeof window !== 'undefined';
let routes: Route[] = [...INITIAL_ROUTES];

const loadFromStorage = (): Route[] => {
  if (isClient) {
    // Force-reset stale data if version mismatch
    if (localStorage.getItem('swift_routes_version') !== MOCK_DATA_VERSION) {
      localStorage.removeItem('swift_routes');
      localStorage.setItem('swift_routes_version', MOCK_DATA_VERSION);
    }
    const saved = localStorage.getItem('swift_routes');
    if (saved) {
      try {
        const stored: Route[] = JSON.parse(saved);
        const mergedMap = new Map<string, Route>();
        INITIAL_ROUTES.forEach(r => mergedMap.set(r.id, r));
        stored.forEach(r => mergedMap.set(r.id, r));
        routes = Array.from(mergedMap.values());
      } catch {
        routes = [...INITIAL_ROUTES];
      }
    } else {
      routes = [...INITIAL_ROUTES];
    }
  }
  return routes;
};

const saveToStorage = () => {
  if (isClient) {
    localStorage.setItem('swift_routes', JSON.stringify(routes));
  }
};

loadFromStorage();

export const routeService = {
  getAll: async (): Promise<Route[]> => {
    if (!IS_MOCK_MODE) {
      const snap = await getDocs(collection(db, 'routes'));
      const list: Route[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Route));
      return list;
    }
    return [...routes];
  },

  getById: async (id: string): Promise<Route | null> => {
    if (!IS_MOCK_MODE) {
      const docSnap = await getDoc(doc(db, 'routes', id));
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Route) : null;
    }
    return routes.find((r) => r.id === id) || null;
  },

  create: async (data: Omit<Route, 'id'>): Promise<Route> => {
    if (!IS_MOCK_MODE) {
      const snap = await getDocs(collection(db, 'routes'));
      let maxNum = 0;
      snap.forEach((d) => { const num = parseInt(d.id.split('-')[1]) || 0; if (num > maxNum) maxNum = num; });
      const newId = `RT-${String(maxNum + 1).padStart(2, '0')}`;
      await setDoc(doc(db, 'routes', newId), data);
      return { id: newId, ...data };
    }
    const nextNum = routes.length > 0 ? Math.max(...routes.map(r => parseInt(r.id.split('-')[1]) || 0)) + 1 : 1;
    const newId = `RT-${String(nextNum).padStart(2, '0')}`;
    const newRoute: Route = { id: newId, ...data };
    routes.push(newRoute);
    saveToStorage();
    return newRoute;
  },

  update: async (id: string, data: Partial<Route>): Promise<Route | null> => {
    if (!IS_MOCK_MODE) {
      const docRef = doc(db, 'routes', id);
      await updateDoc(docRef, data);
      const updatedSnap = await getDoc(docRef);
      return updatedSnap.exists() ? ({ id: updatedSnap.id, ...updatedSnap.data() } as Route) : null;
    }
    const idx = routes.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    routes[idx] = { ...routes[idx], ...data };
    saveToStorage();
    return routes[idx];
  },

  remove: async (id: string): Promise<boolean> => {
    if (!IS_MOCK_MODE) {
      await deleteDoc(doc(db, 'routes', id));
      return true;
    }
    const idx = routes.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    routes.splice(idx, 1);
    saveToStorage();
    return true;
  },
};
export type RouteServiceType = typeof routeService;
