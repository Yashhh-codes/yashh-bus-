import { z } from 'zod';

export const busSearchSchema = z.object({
  from: z.string().min(1, 'Departure city is required'),
  to: z.string().min(1, 'Destination city is required'),
  date: z.string().min(1, 'Travel date is required'),
  passengers: z.number().min(1, 'At least 1 passenger is required').max(10, 'Maximum of 10 passengers'),
}).refine((data) => data.from !== data.to, {
  message: "Departure and destination cities cannot be the same",
  path: ["to"],
}).refine((data) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Parse the timezone-neutral date string
  const travelDate = new Date(data.date + 'T00:00:00');
  return travelDate >= today;
}, {
  message: "Travel date cannot be in the past",
  path: ["date"],
});

export type BusSearchInput = z.infer<typeof busSearchSchema>;

export interface Route {
  id: string;
  departureLocation: string;
  destinationLocation: string;
  distanceKm: number;
  durationHours: number;
  basePriceLkr: number;
  isActive: boolean;
}

export interface Bus {
  id: string;
  busNumber: string;
  busType: 'Standard' | 'Luxury' | 'Super Luxury';
  capacity: number;
  seatingConfig: {
    rows: number;
    columns: number;
    layoutPattern: string;
    unavailableSeats: string[];
  };
  amenities: string[];
  operator?: string;
  name?: string;
  rating?: number;
  isAc?: boolean;
  isSleeper?: boolean;
}

export interface Schedule {
  id: string;
  routeId: string;
  busId: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  seatPriceLkr: number;
  bookedSeats: string[];
  route?: Route;
  bus?: Bus;
  availableSeats?: number;
  status?: string;
}
