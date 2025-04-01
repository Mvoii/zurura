import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi, CreateBookingRequest, Booking } from '@/lib/api/bookings';
import { ApiError } from '@/lib/api';
import { toast } from 'sonner';

export const useBookings = () => {
  const queryClient = useQueryClient();

  // Get user's bookings
  const {
    data: bookings,
    isLoading: isLoadingBookings,
    error: bookingsError,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.getUserBookings(),
    select: (response) => response.data,
    enabled: !!localStorage.getItem('token'), // Only run if user is logged in
  });

  // Get a specific booking
  const getBooking = (bookingId: string) => {
    return useQuery({
      queryKey: ['booking', bookingId],
      queryFn: () => bookingsApi.getBooking(bookingId),
      select: (response) => response.data,
      enabled: !!bookingId,
    });
  };

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingsApi.createBooking(data),
    onSuccess: (response) => {
      toast.success('Booking created successfully!');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      return response.data;
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to create booking');
      throw error;
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: string) => bookingsApi.cancelBooking(bookingId),
    onSuccess: (response) => {
      toast.success('Booking cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      return response.data;
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to cancel booking');
      throw error;
    },
  });

  return {
    // Queries
    bookings: bookings || [],
    isLoadingBookings,
    bookingsError: bookingsError as ApiError | null,
    refetchBookings,
    getBooking,
    
    // Mutations
    createBooking: createBookingMutation.mutate,
    isCreatingBooking: createBookingMutation.isPending,
    cancelBooking: cancelBookingMutation.mutate,
    isCancellingBooking: cancelBookingMutation.isPending,
  };
}; 