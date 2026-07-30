export interface Schedule {
  id: string;
  routeId: string;
  busId: string;
  departureTime: string;
  arrivalTime: string;
  travelDate: string; // YYYY-MM-DD
  availableSeats: number;
  status: 'Active' | 'Suspended' | 'Completed';
}
