import { routeService } from './routes/routeService';
import { busService } from './buses/busService';
import { scheduleService } from './schedules/scheduleService';
import { bookingService } from './bookings/bookingService';
import { seatLockService } from './bookings/seatLockService';
import { Route } from '../types/route';
import { Bus } from '../types/bus';
import { Schedule } from '../types/schedule';
import { Booking } from '../types/booking';

// Helper: map bus attributes to passenger-friendly schema
const mapBus = (adminBus: Bus) => {
  let pType: 'Standard' | 'Luxury' | 'Super Luxury' = 'Standard';
  if (adminBus.type === 'AC Sleeper') pType = 'Super Luxury';
  else if (adminBus.type === 'AC Seater') pType = 'Luxury';
  else if (adminBus.type === 'Semi Sleeper') pType = 'Luxury';

  const rows = Math.ceil(adminBus.capacity / 4);
  const amenities = ['AC', 'USB Charging Ports'];
  
  if (pType === 'Super Luxury') {
    amenities.push('WiFi', 'Reclining Seats', 'Water Bottle');
  } else if (pType === 'Luxury') {
    amenities.push('WiFi');
  }

  return {
    id: adminBus.id,
    busNumber: adminBus.busNumber,
    busType: pType,
    capacity: adminBus.capacity,
    seatingConfig: {
      rows,
      columns: 4,
      layoutPattern: 'SS_SS',
      unavailableSeats: [] as string[],
    },
    amenities,
  };
};

// Helper: map route details
const mapRoute = (adminRoute: Route) => {
  let hours = 1.0;
  if (adminRoute.duration) {
    const hrMatch = adminRoute.duration.match(/(\d+)h/);
    const minMatch = adminRoute.duration.match(/(\d+)m/);
    const hrs = hrMatch ? parseInt(hrMatch[1]) : 0;
    const mins = minMatch ? parseInt(minMatch[1]) : 0;
    hours = hrs + mins / 60;
  }
  return {
    id: adminRoute.id,
    departureLocation: adminRoute.from,
    destinationLocation: adminRoute.to,
    distanceKm: adminRoute.distance,
    durationHours: Math.round(hours * 10) / 10,
    basePriceLkr: adminRoute.fare,
    isActive: adminRoute.status === 'Active',
  };
};

export interface BookingData {
  id: string;
  passengerId: string;
  scheduleId: string;
  routeDetails: {
    departureLocation: string;
    destinationLocation: string;
    departureTime: string;
    departureDate: string;
  };
  busDetails: {
    busNumber: string;
    busType: string;
  };
  selectedSeats: string[];
  totalPriceLkr: number;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  passengerName?: string;
  passengers?: Array<{ name: string; age: string; gender: string; seatNumber: string }>;
}

export interface PassengerSchedule {
  id: string;
  routeId: string;
  busId: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  seatPriceLkr: number;
  bookedSeats: string[];
  route: ReturnType<typeof mapRoute>;
  bus: ReturnType<typeof mapBus>;
}

export interface PassengerSeatLayout {
  seatId: string;
  status: 'Booked' | 'Available';
}

// Helper: map schedule with bookings lookups
const mapSchedule = async (adminSchedule: Schedule, adminRoute: Route, adminBus: Bus): Promise<PassengerSchedule> => {
  const bookingsList = await bookingService.getAll();
  const bookedSeats = bookingsList
    .filter(b => b.scheduleId === adminSchedule.id && b.bookingStatus !== 'Cancelled')
    .flatMap(b => b.selectedSeats || []);

  return {
    id: adminSchedule.id,
    routeId: adminSchedule.routeId,
    busId: adminSchedule.busId,
    departureTime: adminSchedule.departureTime,
    arrivalTime: adminSchedule.arrivalTime,
    departureDate: adminSchedule.travelDate,
    seatPriceLkr: adminRoute.fare,
    bookedSeats,
    route: mapRoute(adminRoute),
    bus: mapBus(adminBus),
  };
};

export const reservationService = {
  // Search schedules matching parameters
  searchTrips: async (from: string, to: string, date: string, passengers: number): Promise<PassengerSchedule[]> => {
    const allRoutes = await routeService.getAll();
    const matchingRoute = allRoutes.find(
      (r) => r.from.toLowerCase() === from.toLowerCase() && 
             r.to.toLowerCase() === to.toLowerCase() &&
             r.status === 'Active'
    );
    if (!matchingRoute) return [];

    const allSchedules = await scheduleService.getAll();
    const todayStr = new Date().toISOString().split('T')[0];

    const matchingSchedules = allSchedules.filter(
      (s) => s.routeId === matchingRoute.id &&
             s.travelDate === date &&
             s.status === 'Active' &&
             s.travelDate >= todayStr
    );

    const result: PassengerSchedule[] = [];
    for (const sch of matchingSchedules) {
      const bus = await busService.getById(sch.busId);
      if (bus && bus.status === 'Active') {
        const mapped = await mapSchedule(sch, matchingRoute, bus);
        // Ensure remaining seats are sufficient for query limit
        if (mapped.bus.capacity - mapped.bookedSeats.length >= passengers) {
          result.push(mapped);
        }
      }
    }
    return result;
  },

  // Fetch individual trip properties
  getTripDetails: async (scheduleId: string): Promise<PassengerSchedule | null> => {
    const sch = await scheduleService.getById(scheduleId);
    if (!sch) return null;
    const route = await routeService.getById(sch.routeId);
    const bus = await busService.getById(sch.busId);
    if (!route || !bus) return null;
    return mapSchedule(sch, route, bus);
  },

  // Fetch seats mapping including persistent locks
  getSeatAvailability: async (scheduleId: string): Promise<PassengerSeatLayout[]> => {
    const details = await reservationService.getTripDetails(scheduleId);
    if (!details) return [];
    
    const capacity = details.bus.capacity;
    const booked = details.bookedSeats;
    const locked = await seatLockService.getLockedSeats(scheduleId);
    const unavailable = [...booked, ...locked];
    
    const seatLayout: PassengerSeatLayout[] = [];
    const cols = 4;
    const rows = Math.ceil(capacity / cols);
    
    for (let r = 1; r <= rows; r++) {
      for (let c = 0; c < cols; c++) {
        const letter = String.fromCharCode(65 + c);
        const seatId = `${r}${letter}`;
        const isBooked = unavailable.includes(seatId);
        seatLayout.push({
          seatId,
          status: isBooked ? 'Booked' : 'Available',
        });
      }
    }
    return seatLayout;
  },

  // Create booking
  createBooking: async (data: {
    userId?: string;
    passengerName: string;
    phoneNumber: string;
    email?: string;
    whatsAppUpdates?: boolean;
    scheduleId: string;
    selectedSeats: string[];
    amount: number;
    gstEnabled?: boolean;
    gstNumber?: string;
    companyName?: string;
    specialRequests?: string[];
    otherSpecialRequest?: string;
    passengersList?: Array<{ name: string; age: string; gender: string }>;
  }): Promise<Booking> => {
    const sch = await scheduleService.getById(data.scheduleId);
    if (!sch || sch.status !== 'Active') {
      throw new Error("This schedule is inactive and cannot be booked.");
    }
    
    const tripDetails = await reservationService.getTripDetails(data.scheduleId);
    if (!tripDetails) {
      throw new Error("Invalid schedule trip.");
    }
    
    // Check conflicts against confirmed bookings
    const conflicts = data.selectedSeats.some(s => tripDetails.bookedSeats.includes(s));
    if (conflicts) {
      throw new Error("One or more selected seats have already been booked.");
    }

    // Verify hold locks held by other users
    const lockedSeats = await seatLockService.getLockedSeats(data.scheduleId);
    const hasExternalLock = data.selectedSeats.some(seatId => {
      return lockedSeats.includes(seatId) && !data.selectedSeats.includes(seatId); // simple fallback check
    });
    
    // Map list of passenger documents containing seat assignments
    const passengersMapped = (data.passengersList || []).map((p, idx) => ({
      name: p.name.trim(),
      age: p.age.trim(),
      gender: p.gender,
      seatNumber: data.selectedSeats[idx] || '',
    }));

    const newBooking = await bookingService.create({
      userId: data.userId,
      passengerName: data.passengerName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      whatsAppUpdates: data.whatsAppUpdates,
      scheduleId: data.scheduleId,
      seats: data.selectedSeats.length,
      selectedSeats: data.selectedSeats,
      amount: data.amount,
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed',
      gstEnabled: data.gstEnabled,
      gstNumber: data.gstNumber,
      companyName: data.companyName,
      specialRequests: data.specialRequests,
      otherSpecialRequest: data.otherSpecialRequest,
      passengers: passengersMapped,
    });

    // Clean up seat hold locks since booking is now secured
    await seatLockService.releaseAllUserLocks(data.scheduleId, data.userId || data.phoneNumber);
    
    return newBooking;
  },

  // Cancel booking
  cancelBooking: async (bookingId: string): Promise<void> => {
    await bookingService.update(bookingId, {
      bookingStatus: 'Cancelled',
      paymentStatus: 'Refunded',
    });
  },

  // Retrieve user bookings history by phone, email, or user UID
  getPassengerBookings: async (passengerPhone: string): Promise<BookingData[]> => {
    const list = await bookingService.getAll();
    const userBookings = passengerPhone 
      ? list.filter((b) => b.phoneNumber === passengerPhone || b.id === passengerPhone || b.userId === passengerPhone || b.email === passengerPhone)
      : list;
    
    const mapped: BookingData[] = [];
    for (const b of userBookings) {
      const sch = await scheduleService.getById(b.scheduleId);
      const route = sch ? await routeService.getById(sch.routeId) : null;
      const bus = sch ? await busService.getById(sch.busId) : null;
      
      mapped.push({
        id: b.id,
        passengerId: passengerPhone,
        scheduleId: b.scheduleId,
        routeDetails: {
          departureLocation: route ? route.from : 'Unknown',
          destinationLocation: route ? route.to : 'Unknown',
          departureTime: sch ? sch.departureTime : '00:00 AM',
          departureDate: sch ? sch.travelDate : '',
        },
        busDetails: {
          busNumber: bus ? bus.busNumber : 'N/A',
          busType: bus ? bus.type : 'Standard',
        },
        selectedSeats: b.selectedSeats || [],
        totalPriceLkr: b.amount,
        status: (b.bookingStatus === 'Cancelled' ? 'cancelled' : b.bookingStatus === 'Completed' ? 'completed' : 'active') as 'cancelled' | 'completed' | 'active',
        createdAt: b.createdAt,
        passengerName: b.passengerName,
        passengers: b.passengers || [],
      });
    }
    return mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};
export type ReservationServiceType = typeof reservationService;
