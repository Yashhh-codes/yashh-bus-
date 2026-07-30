import { reservationService } from '@/services/reservationService';
import { Schedule } from '../types';

export const searchService = {
  // Queries valid schedules from the reservation engine
  async getSchedules(from: string, to: string, date: string): Promise<Schedule[]> {
    try {
      return await reservationService.searchTrips(from, to, date, 1);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return [];
    }
  },

  // Fetch individual trip details from the reservation engine
  async getScheduleById(id: string): Promise<Schedule | null> {
    try {
      return await reservationService.getTripDetails(id);
    } catch (error) {
      console.error('Error fetching schedule by ID:', error);
      return null;
    }
  }
};
