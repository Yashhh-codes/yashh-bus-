export type PaymentStatus = 'Paid' | 'Pending' | 'Refunded';
export type BookingStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';

export interface BookingPassenger {
  name: string;
  age: string;
  gender: string;
  seatNumber: string;
}

export interface Booking {
  id: string;
  userId?: string;
  passengerName: string;
  phoneNumber: string;
  email?: string;
  whatsAppUpdates?: boolean;
  scheduleId: string;
  seats: number;
  selectedSeats: string[];
  amount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  createdAt: string;
  
  // Optional billing and assistance configurations
  gstEnabled?: boolean;
  gstNumber?: string;
  companyName?: string;
  specialRequests?: string[];
  otherSpecialRequest?: string;
  
  // Passenger details list
  passengers?: BookingPassenger[];
}
