import { routeService } from '../routes/routeService';
import { busService } from '../buses/busService';
import { scheduleService } from '../schedules/scheduleService';
import { bookingService } from '../bookings/bookingService';

export interface DashboardOverview {
  bookingsToday: number;
  bookingsTodayPending: number;
  revenueToday: number;
  activeRoutes: number;
  activeBuses: number;
  busesInMaintenance: number;
  recentBookings: Array<{
    id: string;
    passenger: string;
    route: string;
    seats: string;
    status: 'Confirmed' | 'Pending' | 'Cancelled';
  }>;
  upcomingTrips: Array<{
    route: string;
    time: string;
    bus: string;
    capacity: string;
    occupancyPercent: number;
  }>;
}

export const dashboardService = {
  // Aggregate real-time statistics across active database models
  getOverview: async (): Promise<DashboardOverview> => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Fetch all datasets concurrently
    const [allRoutes, allBuses, allSchedules, allBookings] = await Promise.all([
      routeService.getAll(),
      busService.getAll(),
      scheduleService.getAll(),
      bookingService.getAll(),
    ]);

    // 1. Calculate today's bookings stats
    const todayBookings = allBookings.filter(b => {
      if (!b.createdAt) return false;
      const bDate = b.createdAt.split('T')[0];
      return bDate === todayStr;
    });

    const bookingsToday = todayBookings.length;
    const bookingsTodayPending = todayBookings.filter(b => b.bookingStatus === 'Pending').length;

    // 2. Calculate today's revenue (Confirmed bookings)
    const revenueToday = todayBookings
      .filter(b => b.bookingStatus === 'Confirmed')
      .reduce((sum, b) => sum + b.amount, 0);

    // 3. Count active routes and operational buses
    const activeRoutes = allRoutes.filter(r => r.status === 'Active').length;
    const activeBuses = allBuses.filter(b => b.status === 'Active').length;
    const busesInMaintenance = allBuses.filter(b => b.status === 'Maintenance').length;

    // 4. Resolve the 5 most recent bookings
    const sortedBookings = [...allBookings]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);

    const recentBookings = [];
    for (const b of sortedBookings) {
      const sch = allSchedules.find(s => s.id === b.scheduleId);
      const route = sch ? allRoutes.find(r => r.id === sch.routeId) : null;
      const routeDisplay = route ? `${route.from} ➔ ${route.to}` : 'Unknown Route';
      
      let mappedStatus: 'Confirmed' | 'Pending' | 'Cancelled' = 'Pending';
      if (b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Completed') {
        mappedStatus = 'Confirmed';
      } else if (b.bookingStatus === 'Cancelled') {
        mappedStatus = 'Cancelled';
      }

      recentBookings.push({
        id: b.id,
        passenger: b.passengerName,
        route: routeDisplay,
        seats: `${b.seats} Seat${b.seats > 1 ? 's' : ''}`,
        status: mappedStatus,
      });
    }

    // 5. Calculate upcoming departures (Active schedules today/future)
    const activeUpcomingSchedules = allSchedules
      .filter(s => s.status === 'Active' && s.travelDate >= todayStr)
      .sort((a, b) => a.departureTime.localeCompare(b.departureTime))
      .slice(0, 3);

    const upcomingTrips = [];
    for (const s of activeUpcomingSchedules) {
      const route = allRoutes.find(r => r.id === s.routeId);
      const bus = allBuses.find(b => b.id === s.busId);
      
      const routeDisplay = route ? `${route.from} to ${route.to}` : 'Unknown Route';
      const busNumber = bus ? bus.busNumber : 'N/A';
      const busCapacity = bus ? bus.capacity : 36;
      
      // Calculate seats booked
      const scheduleBookings = allBookings.filter(b => b.scheduleId === s.id && b.bookingStatus !== 'Cancelled');
      const bookedCount = scheduleBookings.reduce((sum, b) => sum + (b.selectedSeats?.length || b.seats || 0), 0);
      
      const occupancyPercent = busCapacity > 0 ? Math.min(100, Math.round((bookedCount / busCapacity) * 100)) : 0;

      upcomingTrips.push({
        route: routeDisplay,
        time: s.departureTime,
        bus: busNumber,
        capacity: `${bookedCount}/${busCapacity} Seats booked`,
        occupancyPercent,
      });
    }

    return {
      bookingsToday,
      bookingsTodayPending,
      revenueToday,
      activeRoutes,
      activeBuses,
      busesInMaintenance,
      recentBookings,
      upcomingTrips,
    };
  },
};
export type DashboardServiceType = typeof dashboardService;
