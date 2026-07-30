'use client';

import React, { useState } from 'react';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db, IS_MOCK_MODE } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Database, AlertCircle, CheckCircle2, RefreshCw, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// ── Static seed data ────────────────────────────────────────────────────────
const SEED_ROUTES = [
  { id: "RT-01", name: "Express Hinjewadi-VimanNagar",  from: "Hinjewadi Phase 3", to: "Viman Nagar",    distance: 22, duration: "1h 15m", fare: 120, status: "Active"   },
  { id: "RT-02", name: "Kothrud Swargate Connect",       from: "Kothrud Depot",     to: "Swargate",       distance: 8,  duration: "30m",    fare: 40,  status: "Active"   },
  { id: "RT-03", name: "Pune Station Wakad Shuttle",     from: "Pune Station",      to: "Wakad",          distance: 18, duration: "45m",    fare: 90,  status: "Inactive" },
  { id: "RT-04", name: "Hadapsar Baner Line",            from: "Hadapsar",          to: "Baner",          distance: 25, duration: "1h 00m", fare: 130, status: "Active"   },
  { id: "RT-05", name: "Katraj Kothrud Link",            from: "Katraj",            to: "Kothrud",        distance: 12, duration: "40m",    fare: 60,  status: "Active"   },
  { id: "RT-06", name: "Nigdi Swargate Express",         from: "Nigdi Terminal",    to: "Swargate Depot", distance: 28, duration: "1h 30m", fare: 150, status: "Active"   },
  { id: "RT-07", name: "Magarpatta City Link",           from: "Magarpatta",        to: "Swargate",       distance: 10, duration: "35m",    fare: 50,  status: "Active"   },
  { id: "RT-08", name: "Pimpri Chinchwad Express",       from: "Pimpri",            to: "Shivajinagar",   distance: 20, duration: "55m",    fare: 100, status: "Active"   },
  { id: "RT-09", name: "NIBM Road Connector",            from: "NIBM Road",         to: "Camp",           distance: 9,  duration: "28m",    fare: 45,  status: "Active"   },
  { id: "RT-10", name: "Pashan Sus Road Route",          from: "Pashan",            to: "Sus Village",    distance: 7,  duration: "20m",    fare: 35,  status: "Inactive" },
];

const SEED_BUSES = [
  { id: "B-01", busNumber: "MH-12-PQ-9876", name: "SwiftAir Cruiser",     type: "AC Sleeper",   capacity: 36, regNumber: "MH12PQ9876", modelYear: "2024", status: "Active",      assignedRouteId: "RT-01" },
  { id: "B-02", busNumber: "MH-12-AB-1234", name: "StarExpress Seater",   type: "AC Seater",    capacity: 45, regNumber: "MH12AB1234", modelYear: "2023", status: "Active",      assignedRouteId: "RT-02" },
  { id: "B-03", busNumber: "MH-14-XY-7777", name: "EcoVolt Electric",     type: "Semi Sleeper", capacity: 40, regNumber: "MH14XY7777", modelYear: "2025", status: "Active",      assignedRouteId: "RT-04" },
  { id: "B-04", busNumber: "MH-12-CD-5678", name: "CityRider Non-AC",     type: "Non AC",       capacity: 50, regNumber: "MH12CD5678", modelYear: "2021", status: "Maintenance", assignedRouteId: null    },
  { id: "B-05", busNumber: "MH-12-EF-9012", name: "SwiftAir SleepMaster", type: "AC Sleeper",   capacity: 36, regNumber: "MH12EF9012", modelYear: "2024", status: "Active",      assignedRouteId: "RT-01" },
  { id: "B-06", busNumber: "MH-20-GH-3456", name: "Pune Express Cruiser", type: "AC Seater",    capacity: 42, regNumber: "MH20GH3456", modelYear: "2023", status: "Active",      assignedRouteId: "RT-05" },
  { id: "B-07", busNumber: "MH-14-JK-2222", name: "GreenLine Commuter",   type: "Non AC",       capacity: 52, regNumber: "MH14JK2222", modelYear: "2022", status: "Active",      assignedRouteId: "RT-06" },
  { id: "B-08", busNumber: "MH-12-LM-8888", name: "NightStar Sleeper",    type: "AC Sleeper",   capacity: 30, regNumber: "MH12LM8888", modelYear: "2025", status: "Active",      assignedRouteId: "RT-08" },
  { id: "B-09", busNumber: "MH-09-NP-4444", name: "Metro Connect Bus",    type: "Semi Sleeper", capacity: 44, regNumber: "MH09NP4444", modelYear: "2023", status: "Maintenance", assignedRouteId: null    },
  { id: "B-10", busNumber: "MH-12-RS-6600", name: "LinkRider Deluxe",     type: "AC Seater",    capacity: 38, regNumber: "MH12RS6600", modelYear: "2024", status: "Active",      assignedRouteId: "RT-07" },
];

const SEED_ANNOUNCEMENTS = [
  {
    id: 'a1',
    title: 'Swargate Highway Repairs in Progress',
    category: 'warning',
    content: 'Minor highway repair work is starting near Swargate. Please expect possible delays of 10–15 minutes on Mumbai-Pune Expressway routes (Hinjewadi/Viman Nagar lines).',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isActive: true
  },
  {
    id: 'a2',
    title: 'New Luxury Coach Added to Fleet',
    category: 'info',
    content: 'We have registered NightStar Sleeper (MH-12-LM-8888), a state-of-the-art Super Luxury coach, on the Pimpri–Shivajinagar route. Book seats today.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isActive: true
  },
  {
    id: 'a3',
    title: 'System Maintenance Scheduled',
    category: 'maintenance',
    content: 'Payment checkout integrations will undergo quick security maintenance on Sunday between 02:00 AM – 04:00 AM. Seat selections and cancellations will be briefly offline.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    isActive: true
  }
];

export default function AdminSeedPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [success, setSuccess] = useState<boolean | null>(null);

  const addLog = (msg: string) =>
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleSeed = async () => {
    if (IS_MOCK_MODE) {
      alert('Cannot seed database in MOCK Mode. Please provide real Firebase credentials in your .env.local file.');
      return;
    }

    setLoading(true);
    setSuccess(null);
    setLogs([]);
    addLog('Starting Firestore seeding process...');

    const todayStr   = new Date().toISOString().split('T')[0];
    const tomorrowStr = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })();
    const dayAfterStr = (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toISOString().split('T')[0]; })();
    const yestStr    = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; })();
    const twoDaysAgoStr = (() => { const d = new Date(); d.setDate(d.getDate() - 2); return d.toISOString().split('T')[0]; })();

    const SEED_SCHEDULES = [
      { id: "SCH-01", routeId: "RT-01", busId: "B-01", departureTime: "06:30 AM", arrivalTime: "07:45 AM", travelDate: todayStr,    status: "Active"    },
      { id: "SCH-02", routeId: "RT-02", busId: "B-02", departureTime: "08:00 AM", arrivalTime: "08:30 AM", travelDate: todayStr,    status: "Active"    },
      { id: "SCH-03", routeId: "RT-03", busId: "B-03", departureTime: "09:15 AM", arrivalTime: "10:00 AM", travelDate: todayStr,    status: "Active"    },
      { id: "SCH-04", routeId: "RT-05", busId: "B-06", departureTime: "10:00 AM", arrivalTime: "10:40 AM", travelDate: todayStr,    status: "Active"    },
      { id: "SCH-05", routeId: "RT-07", busId: "B-10", departureTime: "11:30 AM", arrivalTime: "12:05 PM", travelDate: todayStr,    status: "Active"    },
      { id: "SCH-06", routeId: "RT-08", busId: "B-08", departureTime: "01:00 PM", arrivalTime: "01:55 PM", travelDate: todayStr,    status: "Active"    },
      { id: "SCH-07", routeId: "RT-04", busId: "B-05", departureTime: "03:30 PM", arrivalTime: "04:30 PM", travelDate: todayStr,    status: "Active"    },
      { id: "SCH-08", routeId: "RT-06", busId: "B-07", departureTime: "05:00 PM", arrivalTime: "06:30 PM", travelDate: todayStr,    status: "Suspended" },
      { id: "SCH-09", routeId: "RT-01", busId: "B-05", departureTime: "07:00 PM", arrivalTime: "08:15 PM", travelDate: todayStr,    status: "Active"    },
      { id: "SCH-10", routeId: "RT-02", busId: "B-02", departureTime: "07:00 AM", arrivalTime: "07:30 AM", travelDate: tomorrowStr, status: "Active"    },
      { id: "SCH-11", routeId: "RT-04", busId: "B-03", departureTime: "09:00 AM", arrivalTime: "10:00 AM", travelDate: tomorrowStr, status: "Active"    },
      { id: "SCH-12", routeId: "RT-08", busId: "B-08", departureTime: "02:00 PM", arrivalTime: "02:55 PM", travelDate: tomorrowStr, status: "Active"    },
      { id: "SCH-13", routeId: "RT-09", busId: "B-10", departureTime: "08:30 AM", arrivalTime: "08:58 AM", travelDate: dayAfterStr, status: "Active"    },
      { id: "SCH-14", routeId: "RT-06", busId: "B-07", departureTime: "04:00 PM", arrivalTime: "05:30 PM", travelDate: dayAfterStr, status: "Active"    },
    ];

    const SEED_BOOKINGS = [
      { id: "BK-8295", passengerName: "Amit Sharma",    phoneNumber: "+91 98234 56789", scheduleId: "SCH-01", seats: 2, selectedSeats: ["1A","1B"], amount: 240, paymentStatus: "Paid",     bookingStatus: "Confirmed", createdAt: `${todayStr}T08:00:00.000Z`     },
      { id: "BK-8294", passengerName: "Priya Patel",    phoneNumber: "+91 88776 65544", scheduleId: "SCH-02", seats: 1, selectedSeats: ["2A"],       amount: 40,  paymentStatus: "Pending",  bookingStatus: "Pending",   createdAt: `${todayStr}T09:30:00.000Z`     },
      { id: "BK-8293", passengerName: "Rohan Das",      phoneNumber: "+91 77665 54433", scheduleId: "SCH-03", seats: 3, selectedSeats: ["3A","3B","3C"], amount: 270, paymentStatus: "Paid", bookingStatus: "Confirmed", createdAt: `${todayStr}T10:15:00.000Z`     },
      { id: "BK-8292", passengerName: "Sneha Reddy",    phoneNumber: "+91 99887 76655", scheduleId: "SCH-05", seats: 2, selectedSeats: ["1C","1D"], amount: 260, paymentStatus: "Paid",     bookingStatus: "Confirmed", createdAt: `${todayStr}T11:00:00.000Z`     },
      { id: "BK-8291", passengerName: "Vikram Singh",   phoneNumber: "+91 77009 98877", scheduleId: "SCH-06", seats: 1, selectedSeats: ["4B"],       amount: 130, paymentStatus: "Paid",     bookingStatus: "Confirmed", createdAt: `${todayStr}T11:45:00.000Z`     },
      { id: "BK-8290", passengerName: "Meera Nair",     phoneNumber: "+91 91234 56780", scheduleId: "SCH-01", seats: 2, selectedSeats: ["2B","2C"], amount: 240, paymentStatus: "Pending",  bookingStatus: "Pending",   createdAt: `${todayStr}T12:30:00.000Z`     },
      { id: "BK-8289", passengerName: "Arjun Kulkarni", phoneNumber: "+91 85555 44321", scheduleId: "SCH-02", seats: 1, selectedSeats: ["3D"],       amount: 40,  paymentStatus: "Paid",     bookingStatus: "Confirmed", createdAt: `${todayStr}T13:00:00.000Z`     },
      { id: "BK-8288", passengerName: "Divya Menon",    phoneNumber: "+91 93210 98765", scheduleId: "SCH-03", seats: 1, selectedSeats: ["2D"],       amount: 90,  paymentStatus: "Refunded", bookingStatus: "Cancelled", createdAt: `${todayStr}T14:00:00.000Z`     },
      { id: "BK-8287", passengerName: "Kiran Joshi",    phoneNumber: "+91 86543 21098", scheduleId: "SCH-05", seats: 3, selectedSeats: ["5A","5B","5C"], amount: 390, paymentStatus: "Paid", bookingStatus: "Confirmed", createdAt: `${yestStr}T09:00:00.000Z`      },
      { id: "BK-8286", passengerName: "Rahul Desai",    phoneNumber: "+91 98001 23456", scheduleId: "SCH-06", seats: 2, selectedSeats: ["6A","6B"], amount: 260, paymentStatus: "Paid",     bookingStatus: "Confirmed", createdAt: `${yestStr}T10:30:00.000Z`      },
      { id: "BK-8285", passengerName: "Sunita Bhosle",  phoneNumber: "+91 77123 45678", scheduleId: "SCH-01", seats: 1, selectedSeats: ["4C"],       amount: 120, paymentStatus: "Pending",  bookingStatus: "Pending",   createdAt: `${yestStr}T14:00:00.000Z`      },
      { id: "BK-8284", passengerName: "Ajay Tiwari",    phoneNumber: "+91 88909 87654", scheduleId: "SCH-02", seats: 2, selectedSeats: ["1A","1B"], amount: 80,  paymentStatus: "Refunded", bookingStatus: "Cancelled", createdAt: `${twoDaysAgoStr}T08:30:00.000Z` },
      { id: "BK-8283", passengerName: "Pooja Iyer",     phoneNumber: "+91 99001 12345", scheduleId: "SCH-03", seats: 1, selectedSeats: ["5D"],       amount: 90,  paymentStatus: "Paid",     bookingStatus: "Confirmed", createdAt: `${twoDaysAgoStr}T11:00:00.000Z` },
    ];

    try {
      // 1. Routes
      addLog('Seeding "routes" collection...');
      for (const route of SEED_ROUTES) {
        const { id, ...data } = route;
        await setDoc(doc(db, 'routes', id), data);
        addLog(`  ✓ ${route.name} (${id})`);
      }

      // 2. Buses
      addLog('Seeding "buses" collection...');
      for (const bus of SEED_BUSES) {
        const { id, ...data } = bus;
        await setDoc(doc(db, 'buses', id), data);
        addLog(`  ✓ ${bus.busNumber} — ${bus.name} (${id})`);
      }

      // 3. Schedules
      addLog('Seeding "schedules" collection...');
      for (const sch of SEED_SCHEDULES) {
        const { id, ...data } = sch;
        await setDoc(doc(db, 'schedules', id), data);
        addLog(`  ✓ ${sch.departureTime} on ${sch.travelDate} (${id})`);
      }

      // 4. Bookings
      addLog('Seeding "bookings" collection...');
      for (const bk of SEED_BOOKINGS) {
        const { id, ...data } = bk;
        await setDoc(doc(db, 'bookings', id), data);
        addLog(`  ✓ ${bk.passengerName} — ${bk.bookingStatus} (${id})`);
      }

      // 5. Announcements
      addLog('Seeding "announcements" collection...');
      for (const announce of SEED_ANNOUNCEMENTS) {
        const { id, ...data } = announce;
        await setDoc(doc(db, 'announcements', id), data);
        addLog(`  ✓ ${announce.title} (${id})`);
      }

      addLog('✅ All collections seeded successfully!');
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      addLog(`❌ Error: ${error.message}`);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (IS_MOCK_MODE) {
      alert('Cannot clear database in MOCK Mode.');
      return;
    }
    if (!confirm('Delete all documents in buses, routes, schedules, bookings, announcements, and lost_found?')) return;

    setLoading(true);
    setSuccess(null);
    setLogs([]);
    addLog('Starting database cleanup...');

    const colNames = ['buses', 'routes', 'schedules', 'bookings', 'announcements', 'lost_found'];

    try {
      for (const colName of colNames) {
        const snapshot = await getDocs(collection(db, colName));
        addLog(`Deleting ${snapshot.size} docs from "${colName}"...`);
        for (const document of snapshot.docs) {
          await deleteDoc(doc(db, colName, document.id));
        }
        addLog(`  ✓ "${colName}" cleared`);
      }
      addLog('✅ Database cleanup complete!');
      setSuccess(true);
    } catch (err: unknown) {
      const error = err as Error;
      addLog(`❌ Error: ${error.message}`);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl border-slate-200 shadow-xl rounded-3xl bg-white overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-8 relative">
          <Link href="/dashboard" className="absolute top-8 left-6 text-slate-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mt-4">
            <div className="p-2.5 bg-indigo-600 rounded-2xl text-white">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black">Database Seeder</CardTitle>
              <CardDescription className="text-slate-400 mt-1">
                Seed Firestore with realistic demo data across all collections.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Connection status */}
          {IS_MOCK_MODE ? (
            <div className="flex items-start gap-3.5 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-extrabold text-amber-900 text-sm">Application in Mock Mode</h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  No Firebase credentials detected. Add real credentials in <code>.env.local</code> to use the seeder.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3.5 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-extrabold text-emerald-900 text-sm">Connected to Firebase</h4>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                  Live Firebase project detected. Click <strong>Seed Database</strong> to populate all collections with demo data.
                </p>
              </div>
            </div>
          )}

          {/* Dataset counts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Records to Seed</h3>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'Routes',    count: SEED_ROUTES.length },
                { label: 'Buses',     count: SEED_BUSES.length },
                { label: 'Schedules', count: 14 },
                { label: 'Bookings',  count: 13 },
                { label: 'Notices',   count: SEED_ANNOUNCEMENTS.length },
              ].map(({ label, count }) => (
                <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                  <span className="block text-2xl font-black text-slate-900">{count}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleSeed}
              disabled={loading || IS_MOCK_MODE}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Seed Database
            </Button>
            <Button
              onClick={handleClear}
              disabled={loading || IS_MOCK_MODE}
              variant="outline"
              className="flex-1 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 font-bold h-12 rounded-2xl flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-4 w-4" />
              Clear Database
            </Button>
          </div>

          {/* Log console */}
          {logs.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Execution Log</h3>
              <div className="w-full bg-slate-900 border border-slate-950 text-slate-300 font-mono text-[11px] p-4 rounded-2xl h-52 overflow-y-auto space-y-1.5 shadow-inner">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={
                      log.includes('❌') ? 'text-red-400' :
                      log.includes('✅') || log.includes('✓') ? 'text-emerald-400' : ''
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result alert */}
          {success !== null && (
            <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-bold ${success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
              {success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>All collections seeded successfully! Refresh the dashboard to see the data.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span>Seeding failed. Check the log above or verify Firestore security rules.</span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
