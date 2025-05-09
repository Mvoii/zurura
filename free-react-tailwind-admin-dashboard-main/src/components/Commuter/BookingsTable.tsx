import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Booking } from '../../api/bookingService';
import Button from '../ui/button/Button';
import { Eye, XCircle } from 'lucide-react';

interface BookingsTableProps {
  bookings: Booking[];
  onCancelBooking?: (bookingId: string) => void;
  isLoading?: boolean;
}

const BookingsTable: React.FC<BookingsTableProps> = ({ 
  bookings, 
  onCancelBooking,
  isLoading = false 
}) => {
  const navigate = useNavigate();

  const handleViewBooking = (booking: Booking) => {
    navigate(`/booking/success/${booking.id}`, { 
      state: { bookingDetails: booking } 
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>You don't have any bookings yet.</p>
        <Button 
          onClick={() => navigate('/routes')}
          variant="primary"
          className="mt-4"
        >
          Browse Routes
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Booking ID</th>
            <th scope="col" className="px-6 py-3">Route</th>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3">Seats</th>
            <th scope="col" className="px-6 py-3">Fare</th>
            <th scope="col" className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr 
              key={booking.id} 
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {booking.id.substring(0, 8)}...
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="font-medium">{booking.boarding_stop.name}</span>
                  <span className="text-xs text-gray-500">to {booking.alighting_stop.name}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {new Date(booking.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${booking.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                    booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
                    booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {booking.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {booking.seats.count}
              </td>
              <td className="px-6 py-4">
                {booking.fare.toFixed(2)}
              </td>
              <td className="px-6 py-4 flex gap-2">
                <Button 
                  size="sm"
                //   variant="light"
                  onClick={() => handleViewBooking(booking)}
                >
                  <Eye size={16} className="mr-1" /> 
                  View
                </Button>
                
                {booking.status === 'ACTIVE' && onCancelBooking && (
                  <Button 
                    size="sm"
                    // variant="danger"
                    onClick={() => onCancelBooking(booking.id)}
                  >
                    <XCircle size={16} className="mr-1" /> 
                    Cancel
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingsTable;