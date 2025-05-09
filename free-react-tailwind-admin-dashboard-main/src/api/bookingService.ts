import { apiClient } from './client';

// Define the PaymentMethod enum
export enum PaymentMethod {
  MPesa = "mpesa",
  Cash = "cash",
  BusPass = "bus_pass",
  Card = "card",
}

// Interfaces for request and response formats
export interface CreateBookingRequest {
  bus_id: string;
  boarding_stop_name: string;
  alighting_stop_name: string;
  seats: {
    seat_numbers?: string[];
    count: number;
  };
  payment_method: PaymentMethod; // Use the enum here
}

export interface Booking {
  id: string;
  user_id: string;
  bus_id: string;
  route_id: string;
  fare: number;
  seats: { // This structure is fine, but we'll ensure it's parsed from string if needed
    seat_numbers?: string[];
    count: number;
  };
  status: string; // e.g., "confirmed", "pending", "cancelled", "completed"
  created_at: string;
  expires_at: string;
  boarded_at?: string | null; // Can be null or undefined
  route_name?: string;
  origin?: string;
  destination?: string;
  boarding_stop: {
    id?: string | null;
    name: string;
    location?: {
      latitude: number;
      longitude: number;
    } | null;
  };
  alighting_stop: {
    id?: string | null;
    name: string;
    location?: {
      latitude: number;
      longitude: number;
    } | null;
  };
}

// Define an interface for the raw booking data from the API
interface RawBookingData extends Omit<Booking, 'seats'> {
  seats: string | { seat_numbers?: string[]; count: number; };
}

export interface CancelBookingResponse {
  message: string;
}

/**
 * Create a new booking
 * @param bookingData The booking request data
 * @returns The created booking
 */
export const createBooking = async (
  bookingData: CreateBookingRequest
): Promise<Booking> => {
  try {
    const response = await apiClient.post<Booking>('/bookings', bookingData as unknown as Record<string, unknown>);
    return response;
  } catch (error) {
    console.error('Failed to create booking:', error);
    throw error;
  }
};

/**
 * Cancel an existing booking
 * @param bookingId The ID of the booking to cancel
 * @returns A success message
 */
export const cancelBooking = async (
  bookingId: string
): Promise<CancelBookingResponse> => {
  try {
    const response = await apiClient.post<CancelBookingResponse>(
      `/bookings/${bookingId}/cancel`
    );
    return response;
  } catch (error) {
    console.error('Failed to cancel booking:', error);
    throw error;
  }
};

/**
 * Get all bookings for the authenticated user
 * @returns An array of bookings
 */
export const getUserBookings = async (): Promise<Booking[]> => {
  try {
    // Use RawBookingData for the expected API response structure
    const response = await apiClient.get<RawBookingData[]>('/me/bookings'); 
    
    return response.map((booking: RawBookingData) => {
      let parsedSeats: { count: number; seat_numbers?: string[] } = { count: 0, seat_numbers: [] };
      if (typeof booking.seats === 'string') {
        try {
          parsedSeats = JSON.parse(booking.seats);
          // Ensure parsedSeats has the correct structure, especially if JSON is just a number for count
          if (typeof parsedSeats === 'number') { // Example: if seats was just "5"
            parsedSeats = { count: parsedSeats, seat_numbers: [] };
          } else if (typeof parsedSeats.count !== 'number') {
            parsedSeats.count = 0; // Default count if not present or invalid
          }
        } catch (e) {
          console.error(`Failed to parse seats JSON for booking ${booking.id}:`, booking.seats, e);
          // Fallback to a default if parsing fails
          parsedSeats = { count: 0, seat_numbers: [] };
        }
      } else if (typeof booking.seats === 'object' && booking.seats !== null) {
        // Ensure the object has the 'count' property
        parsedSeats = {
          count: typeof booking.seats.count === 'number' ? booking.seats.count : 0,
          seat_numbers: Array.isArray(booking.seats.seat_numbers) ? booking.seats.seat_numbers : []
        };
      }

      return {
        ...booking,
        seats: parsedSeats,
        boarded_at: booking.boarded_at || null, // Ensure null if backend sends empty string or undefined
        boarding_stop: booking.boarding_stop || { name: 'Unknown' }, // Provide fallback
        alighting_stop: booking.alighting_stop || { name: 'Unknown' }, // Provide fallback
      } as Booking; // Assert to the Booking type after transformation
    });
  } catch (error) {
    console.error('Failed to fetch user bookings:', error);
    throw error;
  }
};