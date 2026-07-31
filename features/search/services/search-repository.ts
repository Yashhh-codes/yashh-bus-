import { Schedule, Route, Bus } from '../types';
import { reservationService } from '@/services/reservationService';

export interface SearchProvider {
  searchSchedules(from: string, to: string, date: string): Promise<Schedule[]>;
  getScheduleById(id: string): Promise<Schedule | null>;
}

// Helper: add minutes to time string (e.g., "08:30 AM" + 90 -> "10:00 AM")
function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return timeStr;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  const date = new Date();
  date.setHours(hours, minutes + minutesToAdd, 0);

  let newHours = date.getHours();
  const newMinutes = date.getMinutes();
  const newAmpm = newHours >= 12 ? 'PM' : 'AM';

  if (newHours > 12) newHours -= 12;
  if (newHours === 0) newHours = 12;

  const minStr = String(newMinutes).padStart(2, '0');
  return `${newHours}:${minStr} ${newAmpm}`;
}

const MOCK_ROUTES = [
  { id: 'RT-PM', from: 'Pune', to: 'Mumbai', distanceKm: 150, durationHours: 3.5, basePriceLkr: 450 },
  { id: 'RT-MP', from: 'Mumbai', to: 'Pune', distanceKm: 150, durationHours: 3.5, basePriceLkr: 450 },
  { id: 'RT-PK', from: 'Pune', to: 'Kolhapur', distanceKm: 230, durationHours: 4.5, basePriceLkr: 600 },
  { id: 'RT-PN', from: 'Pune', to: 'Nashik', distanceKm: 210, durationHours: 4.5, basePriceLkr: 550 },
  { id: 'RT-PNG', from: 'Pune', to: 'Nagpur', distanceKm: 710, durationHours: 12.0, basePriceLkr: 1500 },
  { id: 'RT-MG', from: 'Mumbai', to: 'Goa', distanceKm: 600, durationHours: 11.0, basePriceLkr: 1800 },
  { id: 'RT-PG', from: 'Pune', to: 'Goa', distanceKm: 450, durationHours: 9.5, basePriceLkr: 1400 },
  { id: 'RT-BP', from: 'Bengaluru', to: 'Pune', distanceKm: 840, durationHours: 14.0, basePriceLkr: 2000 },
  { id: 'RT-HP', from: 'Hyderabad', to: 'Pune', distanceKm: 560, durationHours: 10.5, basePriceLkr: 1300 },
  { id: 'RT-NM', from: 'Nashik', to: 'Mumbai', distanceKm: 170, durationHours: 3.5, basePriceLkr: 400 },
];

const DEPARTURE_TIMES = [
  '06:00 AM',
  '08:30 AM',
  '10:00 AM',
  '12:15 PM',
  '03:30 PM',
  '06:00 PM',
  '08:30 PM',
  '10:00 PM',
];

const getMockBookedSeats = (scheduleId: string): string[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('mock_schedule_bookings');
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    return parsed[scheduleId] || [];
  } catch {
    return [];
  }
};

export const saveMockBookedSeats = (scheduleId: string, seats: string[]) => {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem('mock_schedule_bookings');
  let parsed: Record<string, string[]> = {};
  if (stored) {
    try {
      parsed = JSON.parse(stored);
    } catch {}
  }
  const current = parsed[scheduleId] || [];
  parsed[scheduleId] = Array.from(new Set([...current, ...seats]));
  localStorage.setItem('mock_schedule_bookings', JSON.stringify(parsed));
};

function getBusForSlot(routeId: string, index: number): Bus {
  const operators = ['VRL Travels', 'Neeta Travels', 'MSRTC Shivneri', 'Purple Travels', 'Khurana Travels', 'National Travels'];
  const names = ['Volvo B11R Multi-Axle', 'Scania Touring HD', 'Mercedes-Benz Glider', 'Eicher AC Sleeper', 'Ashok Leyland Cruiser'];
  const types: ('Standard' | 'Luxury' | 'Super Luxury')[] = ['Standard', 'Luxury', 'Super Luxury'];

  // Determinstic properties based on slot index and route ID hash
  const hash = (routeId.charCodeAt(routeId.length - 1) + index) % 30;
  const operator = operators[hash % operators.length];
  const name = names[(hash + 1) % names.length];
  const busType = types[(hash + 2) % types.length];

  const isAc = hash % 4 !== 0; // 75% AC buses
  const isSleeper = hash % 2 === 0; // 50% Sleeper buses
  const capacity = isSleeper ? 30 : 40;
  const rating = Number((3.8 + (hash % 12) * 0.1).toFixed(1)); // Rating from 3.8 to 4.9

  const amenities = ['USB Charging Ports'];
  if (isAc) amenities.push('AC');
  if (isSleeper) amenities.push('Blanket');
  if (busType === 'Super Luxury') {
    amenities.push('WiFi', 'Reclining Seats', 'Water Bottle');
  } else if (busType === 'Luxury') {
    amenities.push('WiFi');
  }

  const rows = Math.ceil(capacity / 4);

  return {
    id: `MOCK-BUS-${routeId}-${index}`,
    busNumber: `MH-12-MK-${1000 + hash}`,
    busType,
    capacity,
    seatingConfig: {
      rows,
      columns: 4,
      layoutPattern: 'SS_SS',
      unavailableSeats: [],
    },
    amenities,
    operator,
    name,
    rating,
    isAc,
    isSleeper,
  };
}

class MockSearchProvider implements SearchProvider {
  async searchSchedules(from: string, to: string, date: string): Promise<Schedule[]> {
    const matchingRoute = MOCK_ROUTES.find(
      r => r.from.toLowerCase() === from.toLowerCase() && r.to.toLowerCase() === to.toLowerCase()
    );

    if (!matchingRoute) return [];

    const routeObj: Route = {
      id: matchingRoute.id,
      departureLocation: matchingRoute.from,
      destinationLocation: matchingRoute.to,
      distanceKm: matchingRoute.distanceKm,
      durationHours: matchingRoute.durationHours,
      basePriceLkr: matchingRoute.basePriceLkr,
      isActive: true,
    };

    return DEPARTURE_TIMES.map((depTime, index) => {
      const scheduleId = `MOCK-SCH-${matchingRoute.id}-${index}_${date}`;
      const bus = getBusForSlot(matchingRoute.id, index);
      const bookedSeats = getMockBookedSeats(scheduleId);
      const availableSeats = Math.max(0, bus.capacity - bookedSeats.length);

      // Vary price slightly based on comfort class
      let fare = matchingRoute.basePriceLkr;
      if (bus.busType === 'Super Luxury') fare = Math.round(fare * 1.35);
      else if (bus.busType === 'Luxury') fare = Math.round(fare * 1.15);

      return {
        id: scheduleId,
        routeId: matchingRoute.id,
        busId: bus.id,
        departureTime: depTime,
        arrivalTime: addMinutesToTime(depTime, matchingRoute.durationHours * 60),
        departureDate: date,
        seatPriceLkr: fare,
        bookedSeats,
        route: routeObj,
        bus,
        availableSeats,
        status: 'Active',
      };
    });
  }

  async getScheduleById(id: string): Promise<Schedule | null> {
    // Expected format: MOCK-SCH-{routeId}-{timeIndex}_{date}
    if (!id.startsWith('MOCK-SCH-')) return null;

    const parts = id.replace('MOCK-SCH-', '').split('_');
    if (parts.length < 2) return null;

    const routeTime = parts[0]; // e.g., RT-PM-0
    const date = parts[1]; // e.g., 2026-08-01

    const routeTimeParts = routeTime.split('-');
    if (routeTimeParts.length < 3) return null;

    const routeId = `${routeTimeParts[0]}-${routeTimeParts[1]}`; // Reconstruct e.g. RT-PM
    const timeIndex = parseInt(routeTimeParts[2]);

    const matchingRoute = MOCK_ROUTES.find(r => r.id === routeId);
    if (!matchingRoute) return null;

    const depTime = DEPARTURE_TIMES[timeIndex];
    if (!depTime) return null;

    const routeObj: Route = {
      id: matchingRoute.id,
      departureLocation: matchingRoute.from,
      destinationLocation: matchingRoute.to,
      distanceKm: matchingRoute.distanceKm,
      durationHours: matchingRoute.durationHours,
      basePriceLkr: matchingRoute.basePriceLkr,
      isActive: true,
    };

    const bus = getBusForSlot(matchingRoute.id, timeIndex);
    const bookedSeats = getMockBookedSeats(id);
    const availableSeats = Math.max(0, bus.capacity - bookedSeats.length);

    let fare = matchingRoute.basePriceLkr;
    if (bus.busType === 'Super Luxury') fare = Math.round(fare * 1.35);
    else if (bus.busType === 'Luxury') fare = Math.round(fare * 1.15);

    return {
      id,
      routeId: matchingRoute.id,
      busId: bus.id,
      departureTime: depTime,
      arrivalTime: addMinutesToTime(depTime, matchingRoute.durationHours * 60),
      departureDate: date,
      seatPriceLkr: fare,
      bookedSeats,
      route: routeObj,
      bus,
      availableSeats,
      status: 'Active',
    };
  }
}

class FirestoreSearchProvider implements SearchProvider {
  async searchSchedules(from: string, to: string, date: string): Promise<Schedule[]> {
    try {
      const results = await reservationService.searchTrips(from, to, date, 1);
      // Map properties to match search page types
      return results.map(r => ({
        id: r.id,
        routeId: r.routeId,
        busId: r.busId,
        departureTime: r.departureTime,
        arrivalTime: r.arrivalTime,
        departureDate: r.departureDate,
        seatPriceLkr: r.seatPriceLkr,
        bookedSeats: r.bookedSeats,
        route: r.route ? {
          id: r.route.id,
          departureLocation: r.route.departureLocation,
          destinationLocation: r.route.destinationLocation,
          distanceKm: r.route.distanceKm,
          durationHours: r.route.durationHours,
          basePriceLkr: r.route.basePriceLkr,
          isActive: r.route.isActive,
        } : undefined,
        bus: r.bus ? {
          id: r.bus.id,
          busNumber: r.bus.busNumber,
          busType: r.bus.busType,
          capacity: r.bus.capacity,
          seatingConfig: r.bus.seatingConfig,
          amenities: r.bus.amenities,
        } : undefined,
        availableSeats: r.bus ? r.bus.capacity - r.bookedSeats.length : 0,
        status: 'Active',
      }));
    } catch (error) {
      console.error('Firestore search provider error:', error);
      return [];
    }
  }

  async getScheduleById(id: string): Promise<Schedule | null> {
    try {
      const r = await reservationService.getTripDetails(id);
      if (!r) return null;
      return {
        id: r.id,
        routeId: r.routeId,
        busId: r.busId,
        departureTime: r.departureTime,
        arrivalTime: r.arrivalTime,
        departureDate: r.departureDate,
        seatPriceLkr: r.seatPriceLkr,
        bookedSeats: r.bookedSeats,
        route: r.route ? {
          id: r.route.id,
          departureLocation: r.route.departureLocation,
          destinationLocation: r.route.destinationLocation,
          distanceKm: r.route.distanceKm,
          durationHours: r.route.durationHours,
          basePriceLkr: r.route.basePriceLkr,
          isActive: r.route.isActive,
        } : undefined,
        bus: r.bus ? {
          id: r.bus.id,
          busNumber: r.bus.busNumber,
          busType: r.bus.busType,
          capacity: r.bus.capacity,
          seatingConfig: r.bus.seatingConfig,
          amenities: r.bus.amenities,
        } : undefined,
        availableSeats: r.bus ? r.bus.capacity - r.bookedSeats.length : 0,
        status: 'Active',
      };
    } catch (error) {
      console.error('Firestore getScheduleById error:', error);
      return null;
    }
  }
}

class SearchRepository implements SearchProvider {
  private provider: SearchProvider;

  constructor() {
    const providerType = process.env.NEXT_PUBLIC_SEARCH_PROVIDER || 'mock';
    if (providerType === 'firestore') {
      this.provider = new FirestoreSearchProvider();
    } else {
      this.provider = new MockSearchProvider();
    }
  }

  async searchSchedules(from: string, to: string, date: string): Promise<Schedule[]> {
    return this.provider.searchSchedules(from, to, date);
  }

  async getScheduleById(id: string): Promise<Schedule | null> {
    return this.provider.getScheduleById(id);
  }
}

export const searchRepository = new SearchRepository();
