'use client';

import React, { useEffect, useState } from 'react';
import {
  Ticket,
  Map,
  Bus,
  DollarSign,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { PageContainer } from '@/components/dashboard/page-container';
import { SectionHeader } from '@/components/dashboard/section-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card } from '@/components/dashboard/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/dashboard/table';
import { toast } from 'sonner';
import { dashboardService, DashboardOverview as OverviewData } from '@/services/dashboard/dashboardService';

export default function DashboardOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch live operational stats on mount
  useEffect(() => {
    let active = true;
    dashboardService.getOverview()
      .then(res => {
        if (active) {
          setData(res);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Failed to load dashboard metrics:', err);
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleQuickAction = (actionName: string) => {
    toast.success(`${actionName} drawer opened (mock interface)`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Confirmed</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Pending</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
            <XCircle className="h-3.5 w-3.5" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  // Build standard statistics cards array mapped from data
  const stats = [
    {
      title: "Today's Bookings",
      value: loading ? null : String(data?.bookingsToday || 0),
      description: loading ? "Loading..." : `${data?.bookingsTodayPending || 0} pending approval`,
      change: { value: "+8.2%", type: "increase" as const },
      icon: <Ticket className="h-5 w-5" />,
    },
    {
      title: "Active Routes",
      value: loading ? null : String(data?.activeRoutes || 0),
      description: loading ? "Loading..." : "Across all operational zones",
      change: { value: "+1", type: "increase" as const },
      icon: <Map className="h-5 w-5" />,
    },
    {
      title: "Available Buses",
      value: loading ? null : String(data?.activeBuses || 0),
      description: loading ? "Loading..." : `${data?.busesInMaintenance || 0} in maintenance`,
      change: { value: "100%", type: "neutral" as const },
      icon: <Bus className="h-5 w-5" />,
    },
    {
      title: "Today's Revenue",
      value: loading ? null : `INR ${data?.revenueToday || 0}`,
      description: loading ? "Loading..." : "from confirmed bookings",
      change: { value: "+14.5%", type: "increase" as const },
      icon: <DollarSign className="h-5 w-5" />,
    },
  ];

  return (
    <PageContainer>
      {/* Page Header */}
      <SectionHeader
        title="Dashboard Overview"
        description="Monitor system reservations, active schedules, and operational health in real-time."
      />

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard
            key={i}
            title={stat.title}
            value={stat.value ?? "..."}
            description={stat.description}
            change={stat.change}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column: Recent Bookings */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                <h4 className="text-base font-bold text-slate-800">Recent Bookings</h4>
                <a
                  href="/dashboard/bookings"
                  className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  View All Bookings <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </a>
              </div>
              
              {loading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ) : !data || data.recentBookings.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400 font-medium">
                  No bookings found for today.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Passenger</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Seats</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.recentBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-semibold text-slate-900">{booking.id}</TableCell>
                        <TableCell>{booking.passenger}</TableCell>
                        <TableCell className="text-slate-500 font-medium">{booking.route}</TableCell>
                        <TableCell>{booking.seats}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Upcoming Trips & Quick Actions */}
        <div className="flex flex-col gap-6">
          {/* Upcoming Trips */}
          <Card>
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
              <h4 className="text-base font-bold text-slate-800">Upcoming Departures</h4>
              <Clock className="h-4.5 w-4.5 text-slate-400" />
            </div>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            ) : !data || data.upcomingTrips.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400 font-medium">
                No departures scheduled.
              </div>
            ) : (
              <div className="space-y-4">
                {data.upcomingTrips.map((trip, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">{trip.route}</span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {trip.time}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{trip.bus}</span>
                      <span>{trip.capacity}</span>
                    </div>
                    {/* Visual occupancy bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${trip.occupancyPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="mb-4 border-b border-slate-100 pb-4">
              <h4 className="text-base font-bold text-slate-800">Quick Operations</h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleQuickAction('Add Route')}
                className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-100 hover:border-indigo-100 rounded-xl transition-all duration-200 text-sm font-semibold text-left cursor-pointer"
              >
                <span>Add Route Shortcut</span>
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleQuickAction('Add Bus')}
                className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-100 hover:border-indigo-100 rounded-xl transition-all duration-200 text-sm font-semibold text-left cursor-pointer"
              >
                <span>Register New Bus</span>
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleQuickAction('Add Schedule')}
                className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-100 hover:border-indigo-100 rounded-xl transition-all duration-200 text-sm font-semibold text-left cursor-pointer"
              >
                <span>Schedule New Trip</span>
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
