import { useContext } from 'react';
import BookingContext from '../context/BookingContext';
import type {
  Booking,
  CreateBookingRequest,
  PaymentMethod
} from '../api/bookingService';

/**
 * Interface for the result of booking operations
 */
export interface BookingResult {
  success: boolean;
  data?: Booking | Booking[] | string;
  error?: string;
}

/**
 * Interface for the useBooking hook return value
 */
export interface UseBookingReturn {
  // State
  currentBooking: Booking | null;
  userBookings: Booking[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createNewBooking: (bookingData: CreateBookingRequest) => Promise<Booking | null>;
  cancelExistingBooking: (bookingId: string) => Promise<boolean>;
  fetchUserBookings: () => Promise<Booking[]>;
  
  // Utility
  clearCurrentBooking: () => void;
  clearError: () => void;
}

/**
 * Custom hook to access booking functionality throughout the app
 * @returns Booking state and methods
 */
const useBooking = (): UseBookingReturn => {
  const context = useContext(BookingContext);
  
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  
  return context;
};

export default useBooking;