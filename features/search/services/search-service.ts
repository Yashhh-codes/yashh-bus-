import { searchRepository } from './search-repository';
import { Schedule } from '../types';

export const searchService = {
  // Queries valid schedules from the search repository (mock or firestore provider)
  async getSchedules(from: string, to: string, date: string): Promise<Schedule[]> {
    try {
      return await searchRepository.searchSchedules(from, to, date);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      return [];
    }
  },

  // Fetch individual trip details from the search repository
  async getScheduleById(id: string): Promise<Schedule | null> {
    try {
      return await searchRepository.getScheduleById(id);
    } catch (error) {
      console.error('Error fetching schedule by ID:', error);
      return null;
    }
  }
};
