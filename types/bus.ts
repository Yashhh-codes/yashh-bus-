export type BusType = 'AC Sleeper' | 'AC Seater' | 'Semi Sleeper' | 'Non AC';

export interface Bus {
  id: string;
  busNumber: string;
  name: string;
  type: BusType;
  capacity: number;
  regNumber: string;
  modelYear: string;
  status: 'Active' | 'Maintenance' | 'Inactive';
  assignedRouteId: string | null;
}
