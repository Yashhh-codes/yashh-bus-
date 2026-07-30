import { reservationService, BookingData } from '@/services/reservationService';
export type { BookingData };

export const bookingService = {
  // Fetch bookings matching passenger identification (UID, phone, or local stored IDs)
  async getBookingsByUser(userId: string): Promise<BookingData[]> {
    try {
      // 1. Get central bookings matching the passenger's ID/phone
      const centralList = await reservationService.getPassengerBookings(userId);

      // 2. Fetch locally stored booking IDs placed on this device (for non-logged-in checkout)
      const storedIdsStr = typeof window !== 'undefined' ? localStorage.getItem('passenger_booked_ids') : null;
      const storedIds: string[] = storedIdsStr ? JSON.parse(storedIdsStr) : [];

      if (storedIds.length === 0) {
        return centralList;
      }

      // Fetch all bookings to filter by local device history
      const allBookings = await reservationService.getPassengerBookings("");
      const localMatches = allBookings.filter(b => storedIds.includes(b.id));

      // Combine and deduplicate
      const combined = [...centralList];
      for (const b of localMatches) {
        if (!combined.some(c => c.id === b.id)) {
          combined.push(b);
        }
      }

      return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching passenger bookings:', error);
      return [];
    }
  },

  // Confirm and register a passenger booking
  async createBooking(data: {
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
    passengers?: Array<{ name: string; age: string; gender: string }>;
  }): Promise<BookingData> {
    const newBooking = await reservationService.createBooking({
      ...data,
      passengersList: data.passengers
    });

    // Save ID locally to persist device booking history without login
    if (typeof window !== 'undefined') {
      const storedIdsStr = localStorage.getItem('passenger_booked_ids');
      const storedIds: string[] = storedIdsStr ? JSON.parse(storedIdsStr) : [];
      storedIds.unshift(newBooking.id);
      localStorage.setItem('passenger_booked_ids', JSON.stringify(storedIds));
    }

    // Map core booking back to passenger UI BookingData contract
    const sch = await reservationService.getTripDetails(newBooking.scheduleId);
    return {
      id: newBooking.id,
      passengerId: newBooking.userId || newBooking.phoneNumber,
      scheduleId: newBooking.scheduleId,
      routeDetails: {
        departureLocation: sch?.route?.departureLocation || 'Unknown',
        destinationLocation: sch?.route?.destinationLocation || 'Unknown',
        departureTime: sch?.departureTime || '',
        departureDate: sch?.departureDate || '',
      },
      busDetails: {
        busNumber: sch?.bus?.busNumber || '',
        busType: sch?.bus?.busType || 'Standard',
      },
      selectedSeats: newBooking.selectedSeats,
      totalPriceLkr: newBooking.amount,
      status: 'active',
      createdAt: newBooking.createdAt,
      passengerName: newBooking.passengerName,
      passengers: newBooking.passengers,
    };
  },

  // Cancel booking
  async cancelBooking(bookingId: string): Promise<void> {
    try {
      await reservationService.cancelBooking(bookingId);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }
};
