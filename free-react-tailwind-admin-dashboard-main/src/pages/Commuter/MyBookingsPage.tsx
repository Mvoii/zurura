import React, { useEffect, useState, useCallback } from 'react';
import useBooking from '../../hooks/useBooking';
import BookingsTable from '../../components/Commuter/BookingsTable';
import Button from '../../components/ui/button/Button';
import Alert from '../../components/ui/alert/Alert';
import ComponentCard from '../../components/common/ComponentCard';
import { RefreshCw } from 'lucide-react';

const MyBookingsPage: React.FC = () => {
  const { 
    userBookings, 
    fetchUserBookings, 
    cancelExistingBooking,
    isLoading, 
    error 
  } = useBooking();
  
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Memoize the loadBookings function with useCallback
  const loadBookings = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchUserBookings();
      setCancelError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchUserBookings, setCancelError]);

  // Now include loadBookings in the dependency array
  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancelError(null);
      const success = await cancelExistingBooking(bookingId);
      
      if (success) {
        // Reload bookings to reflect the cancellation
        loadBookings();
      } else {
        setCancelError('Could not cancel the booking. Please try again.');
      }
    } catch (err) {
      setCancelError('An error occurred while cancelling the booking.');
      console.error('Error cancelling booking:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">My Bookings</h1>
        <Button
          onClick={loadBookings}
          isLoading={refreshing}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert
          variant="error"
          title="Error Loading Bookings"
          message={error}
        />
      )}

      {cancelError && (
        <Alert
          variant="error"
          title="Error Cancelling Booking"
          message={cancelError}
        />
      )}

      <ComponentCard title="Your Bookings">
        <BookingsTable 
          bookings={userBookings}
          onCancelBooking={handleCancelBooking}
          isLoading={isLoading && !refreshing}
        />
      </ComponentCard>
    </div>
  );
};

export default MyBookingsPage;