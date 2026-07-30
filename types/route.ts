export interface Route {
  id: string;
  name: string;
  from: string;
  to: string;
  distance: number; // in km
  duration: string; // e.g. "1h 30m"
  fare: number; // base fare in currency
  status: 'Active' | 'Inactive';
}
