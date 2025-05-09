import React, { createContext, useCallback, useState, ReactNode } from 'react';
import {
  createBooking,
  cancelBooking,
  getUserBookings,
  Booking,
  CreateBookingRequest,
  PaymentMethod,
  CancelBookingResponse
} from '../api/bookingService';

// Define the shape of the context
interface BookingContextType {
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

// Create the context with a default undefined value
const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Props for the provider component
interface BookingProviderProps {
  children: ReactNode;
}

// Provider component
export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  // State
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new booking
  const createNewBooking = useCallback(async (
    bookingData: CreateBookingRequest
  ): Promise<Booking | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newBooking = await createBooking(bookingData);
      setCurrentBooking(newBooking);
      
      // Update user bookings list if it's already loaded
      if (userBookings.length > 0) {
        setUserBookings(prevBookings => [newBooking, ...prevBookings]);
      }
      
      return newBooking;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [userBookings]);

  // Cancel an existing booking
  const cancelExistingBooking = useCallback(async (
    bookingId: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await cancelBooking(bookingId);
      
      // Update current booking if it's the one being canceled
      if (currentBooking && currentBooking.id === bookingId) {
        setCurrentBooking(prev => prev ? { ...prev, status: 'cancelled' } : null);
      }
      
      // Update user bookings list if it's already loaded
      setUserBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'cancelled' } 
            : booking
        )
      );
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to cancel booking ${bookingId}`;
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentBooking]);

  // Fetch all bookings for the user
  const fetchUserBookings = useCallback(async (): Promise<Booking[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const bookings = await getUserBookings();
      setUserBookings(bookings);
      return bookings;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear the current booking
  const clearCurrentBooking = useCallback(() => {
    setCurrentBooking(null);
  }, []);

  // Clear any error messages
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Create the context value object
  const contextValue: BookingContextType = {
    currentBooking,
    userBookings,
    isLoading,
    error,
    createNewBooking,
    cancelExistingBooking,
    fetchUserBookings,
    clearCurrentBooking,
    clearError
  };

  // Provide the context to children
  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
};

export default BookingContext;