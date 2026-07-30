import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple env file parser
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../.env')
  ];

  let loaded = false;
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          }
          if (value.startsWith("'") && value.endsWith("'")) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value.trim();
        }
      });
      loaded = true;
      console.log(`Loaded environment from: ${path.basename(envPath)}`);
    }
  }
  return loaded;
}

loadEnv();

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'your_api_key' || firebaseConfig.apiKey === 'mock-api-key') {
  console.error('\x1b[31mError: No valid NEXT_PUBLIC_FIREBASE_API_KEY found in environment variables.\x1b[0m');
  console.log('Please populate `.env.local` or `.env` with your real Firebase config details.');
  process.exit(1);
}

console.log('Connecting to Firebase project:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SEED_BUSES = [
  {
    id: 'b1',
    busNumber: 'ND-3972',
    busType: 'Luxury',
    capacity: 24,
    seatingConfig: { rows: 6, columns: 4, layoutPattern: 'SS_SS', unavailableSeats: [] },
    amenities: ['AC', 'WiFi', 'Charging Ports', 'Water Bottle']
  },
  {
    id: 'b2',
    busNumber: 'NP-5541',
    busType: 'Standard',
    capacity: 24,
    seatingConfig: { rows: 6, columns: 4, layoutPattern: 'SS_SS', unavailableSeats: [] },
    amenities: ['USB Ports']
  },
  {
    id: 'b3',
    busNumber: 'EX-9988',
    busType: 'Super Luxury',
    capacity: 20,
    seatingConfig: { rows: 5, columns: 4, layoutPattern: 'SS_SS', unavailableSeats: [] },
    amenities: ['AC', 'WiFi', 'Charging Ports', 'Reclining Seats', 'Entertainment Screen']
  }
];

const SEED_ROUTES = [
  { id: 'r1', departureLocation: 'Hinjewadi', destinationLocation: 'Kothrud', distanceKm: 24, durationHours: 1, basePriceLkr: 150, isActive: true },
  { id: 'r2', departureLocation: 'Swargate', destinationLocation: 'Kothrud', distanceKm: 12, durationHours: 0.5, basePriceLkr: 90, isActive: true },
  { id: 'r3', departureLocation: 'Hinjewadi', destinationLocation: 'Swargate', distanceKm: 20, durationHours: 0.8, basePriceLkr: 120, isActive: true },
  { id: 'r4', departureLocation: 'Kothrud', destinationLocation: 'Hadapsar', distanceKm: 18, durationHours: 0.7, basePriceLkr: 110, isActive: true },
  { id: 'r5', departureLocation: 'Viman Nagar', destinationLocation: 'Swargate', distanceKm: 14, durationHours: 0.6, basePriceLkr: 100, isActive: true },
  { id: 'r6', departureLocation: 'Swargate', destinationLocation: 'Hinjewadi', distanceKm: 20, durationHours: 0.8, basePriceLkr: 120, isActive: true }
];

const SEED_ANNOUNCEMENTS = [
  {
    id: 'a1',
    title: 'Swargate Highway Repairs in Progress',
    category: 'warning',
    content: 'Minor highway repair work is starting near Swargate. Please expect possible delays of 10-15 minutes on Mumbai-Pune Expressway routes (Hinjewadi/Viman Nagar lines).',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isActive: true
  },
  {
    id: 'a2',
    title: 'New Luxury Coach Added to Fleet',
    category: 'info',
    content: 'We have registered ND-3972, a state-of-the-art Super Luxury coach, on the Swargate-Kothrud route. Book seats today to enjoy onboard entertainment screens and complimentary refreshments.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isActive: true
  },
  {
    id: 'a3',
    title: 'System Server Maintenance Update',
    category: 'maintenance',
    content: 'Our payment checkout integrations will undergo quick security maintenance on Sunday, August 2nd between 02:00 AM and 04:00 AM LKR time. Seat selections and cancellations will be briefly offline.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    isActive: true
  }
];

async function seed() {
  try {
    console.log('Seeding buses...');
    for (const bus of SEED_BUSES) {
      const { id, ...data } = bus;
      await setDoc(doc(db, 'buses', id), data);
      console.log(`- Wrote bus: ${bus.busNumber}`);
    }

    console.log('Seeding routes...');
    for (const route of SEED_ROUTES) {
      const { id, ...data } = route;
      await setDoc(doc(db, 'routes', id), data);
      console.log(`- Wrote route: ${route.departureLocation} -> ${route.destinationLocation}`);
    }

    console.log('Seeding announcements...');
    for (const announce of SEED_ANNOUNCEMENTS) {
      const { id, ...data } = announce;
      await setDoc(doc(db, 'announcements', id), data);
      console.log(`- Wrote notice: ${announce.title}`);
    }

    console.log('\x1b[32mFirestore database seeded successfully!\x1b[0m');
    process.exit(0);
  } catch (err) {
    console.error('\x1b[31mSeeding failed with error:\x1b[0m', err);
    process.exit(1);
  }
}

seed();
