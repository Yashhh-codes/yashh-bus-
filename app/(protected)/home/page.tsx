'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SearchWidget } from '@/features/search/components/search-widget';
import { Megaphone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { scheduleService } from '@/services/schedules/scheduleService';
import { routeService } from '@/services/routes/routeService';
import { busService } from '@/services/buses/busService';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { user } = useAuth();
  const [routesList, setRoutesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackRoutes = [
    { from: 'Hinjewadi Phase 3', to: 'Viman Nagar', duration: '1.2 hrs', price: 'INR 120', type: 'Super Luxury', scheduleId: 'SCH-01' },
    { from: 'Kothrud Depot', to: 'Swargate', duration: '0.5 hrs', price: 'INR 40', type: 'Luxury', scheduleId: 'SCH-02' },
    { from: 'Hadapsar', to: 'Baner', duration: '1.0 hrs', price: 'INR 130', type: 'Standard', scheduleId: 'SCH-07' },
    { from: 'Pimpri', to: 'Shivajinagar', duration: '0.9 hrs', price: 'INR 100', type: 'Luxury', scheduleId: 'SCH-06' },
  ];

  useEffect(() => {
    const loadDynamicRoutes = async () => {
      try {
        const [schedulesData, routesData, busesData] = await Promise.all([
          scheduleService.getAll(),
          routeService.getAll(),
          busService.getAll(),
        ]);

        const activeSchedules = schedulesData.filter(s => s.status === 'Active' || s.status === undefined);

        const mapped = activeSchedules.map(sch => {
          const route = routesData.find(r => r.id === sch.routeId);
          const bus = busesData.find(b => b.id === sch.busId);
          if (!route) return null;

          let busTypeStr = 'Standard';
          if (bus) {
            if (bus.type === 'AC Sleeper') busTypeStr = 'Super Luxury';
            else if (bus.type === 'AC Seater' || bus.type === 'Semi Sleeper') busTypeStr = 'Luxury';
            else busTypeStr = bus.type;
          }

          return {
            from: route.from,
            to: route.to,
            duration: route.duration || '1.0 hrs',
            price: `INR ${route.fare}`,
            type: busTypeStr,
            scheduleId: sch.id
          };
        }).filter(Boolean);

        if (mapped.length > 0) {
          setRoutesList(mapped);
        } else {
          // If no active schedules are configured, list all routes as default options
          const defaultList = routesData.slice(0, 8).map(route => ({
            from: route.from,
            to: route.to,
            duration: route.duration || '1.0 hrs',
            price: `INR ${route.fare}`,
            type: 'Luxury',
            scheduleId: 'SCH-01'
          }));
          setRoutesList(defaultList.length > 0 ? defaultList : fallbackRoutes);
        }
      } catch (error) {
        console.error("Failed to load routes from dashboard:", error);
        setRoutesList(fallbackRoutes);
      } finally {
        setLoading(false);
      }
    };

    loadDynamicRoutes();
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Welcome Hero header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Welcome back, <span className="text-[#1A365D]">{user?.displayName || 'Traveler'}</span>
          </h1>
          <p className="text-slate-500">Search schedules and book premium transit seats instantly.</p>
        </div>
      </div>

      {/* Main Bus Search Widget Section */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Find Schedules</h2>
        <Suspense fallback={<div className="h-20 w-full bg-slate-100/50 rounded-2xl animate-pulse" />}>
          <SearchWidget />
        </Suspense>
      </div>

      {/* Grid of secondary info: Popular Routes & Notice Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Popular Routes */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Featured Routes</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm h-44 space-y-3">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-20 rounded animate-pulse" />
                    <Skeleton className="h-5 w-16 rounded animate-pulse" />
                  </div>
                  <Skeleton className="h-6 w-48 rounded animate-pulse" />
                  <Skeleton className="h-4 w-32 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routesList.map((route, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -3 }}
                  className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-all"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md text-[10px] font-bold text-[#1A365D] uppercase">
                        {route.type}
                      </span>
                      <span className="text-sm font-bold text-slate-800">{route.price}</span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg flex items-center">
                      {route.from}
                      <ArrowRight className="h-4 w-4 mx-2 text-slate-400" />
                      {route.to}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">Est. Duration: {route.duration}</p>
                  </div>
                  <Link href={`/booking/${route.scheduleId}/seats?passengers=1`}>
                    <Button variant="outline" className="w-full text-xs font-semibold border-slate-200 hover:bg-slate-50 mt-4 cursor-pointer">
                      Book Now
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Notice Board Side Widget */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Notice Board</h2>
          <Card className="border-slate-200/80 bg-white shadow-sm flex flex-col justify-between h-[368px]">
            <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2 text-indigo-650 font-bold text-sm">
                <Megaphone className="h-4 w-4" />
                <span>Notice Highlights</span>
              </div>
              <Link href="/announcements" className="text-xs text-indigo-600 font-bold hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent className="pt-4 flex-1 overflow-y-auto space-y-4">
              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-semibold">
                  <span className="text-amber-600 uppercase tracking-wider">Warning</span>
                  <span>Active</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">Swargate Highway Repairs</h4>
                <p className="text-[11px] text-slate-600 mt-1">Minor speed reductions may affect Hinjewadi - Swargate route durations.</p>
              </div>
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-semibold">
                  <span className="text-indigo-600 uppercase tracking-wider">Announcement</span>
                  <span>New Bus</span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs">New Luxury Coach Added</h4>
                <p className="text-[11px] text-slate-600 mt-1">ND-3972 is now running on the Swargate-Kothrud expressway line.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
