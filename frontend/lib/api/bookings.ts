import { api, ApiResponse } from '../api';

export interface CreateBookingRequest {
  bus_id: string;
  seats: {
    seat_numbers: string[];
    count: number;
  };
  payment_method: 'mpesa' | 'airtel_money' | 'cash' | 'bus_pass';
}

export interface Booking {
  id: string;
  user_id: string;
  bus_id: string;
  route_id: string;
  seats: {
    seat_numbers: string[];
    count: number;
  };
  fare: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  expires_at: string;
  boarded_at?: string;
}

export const bookingsApi = {
  // Create a new booking
  createBooking: async (data: CreateBookingRequest): Promise<ApiResponse<Booking>> => {
    const response = await api.post<Booking>('/bookings', data);
    return {
      data: response.data,
      status: response.status,
    };
  },
  
  // Get a booking by ID
  getBooking: async (bookingId: string): Promise<ApiResponse<Booking>> => {
    const response = await api.get<Booking>(`/bookings/${bookingId}`);
    return {
      data: response.data,
      status: response.status,
    };
  },
  
  // Cancel a booking
  cancelBooking: async (bookingId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.post<{ message: string }>(`/bookings/${bookingId}/cancel`);
    return {
      data: response.data,
      status: response.status,
    };
  },
  
  // Get user's bookings
  getUserBookings: async (): Promise<ApiResponse<Booking[]>> => {
    const response = await api.get<Booking[]>('/me/bookings');
    return {
      data: response.data,
      status: response.status,
    };
  },
}; 