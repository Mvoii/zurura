import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import ComponentCard from '../../components/common/ComponentCard';
import Button from '../../components/ui/button/Button';
import { ArrowLeft, Calendar, Clock, MapPin, Bus, Ticket, User, Home } from 'lucide-react';
// import useBooking from '../../hooks/useBooking';
import { Booking } from '../../api/bookingService';
import Alert from '../../components/ui/alert/Alert';

const BookingSuccessPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState<Booking | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Try to get booking details from location state first
  useEffect(() => {
    const state = location.state as { bookingDetails?: Booking };
    if (state?.bookingDetails) {
      setBookingData(state.bookingDetails);
    } else if (bookingId) {
      // If not available in state, could fetch from API using bookingId
      // Assuming useBooking has a method to fetch a single booking by ID
      // This would need to be implemented in your BookingContext and API
      setError("Booking details not found. Please check your bookings in your profile.");
    } else {
      setError("No booking information available.");
    }
  }, [location.state, bookingId]);

  // QR code data - create a string with essential booking info
  const qrCodeData = bookingData ? 
    JSON.stringify({
      booking_id: bookingData.id,
      user_id: bookingData.user_id,
      route_id: bookingData.route_id,
      bus_id: bookingData.bus_id,
      boarding: bookingData.boarding_stop.name,
      seats: bookingData.seats.count,
      status: bookingData.status
    }) : '';

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert 
          variant="error" 
          title="Booking Information Unavailable" 
          message={error} 
        />
        <div className="mt-6 flex justify-center">
          <Button onClick={() => navigate('/routes')}>
            <Home className="mr-2 h-4 w-4" /> Return to Routes
          </Button>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Booking Confirmed!</h1>
        <Button variant="outline" onClick={() => navigate('/routes')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Routes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Booking details card */}
        <ComponentCard title="Booking Details" className="h-full">
          <div className="space-y-4 p-4">
            <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Booking ID</p>
                <p className="font-medium">{bookingData.id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
                <p className="font-medium">{bookingData.user_id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Booking Created</p>
                <p className="font-medium">{formatDate(bookingData.created_at)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Expires At</p>
                <p className="font-medium">{formatDate(bookingData.expires_at)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Bus className="h-5 w-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bus ID</p>
                <p className="font-medium">{bookingData.bus_id}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">From</p>
                <p className="font-medium">{bookingData.boarding_stop.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">To</p>
                <p className="font-medium">{bookingData.alighting_stop.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Ticket className="h-5 w-5 text-primary-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Seats</p>
                <p className="font-medium">{bookingData.seats.count}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 flex items-center justify-center text-primary-500">
                $
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fare</p>
                <p className="font-medium">{bookingData.fare.toFixed(2)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 flex items-center justify-center text-primary-500">
                ⚪
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className="font-medium capitalize">{bookingData.status}</p>
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* QR Code card */}
        <ComponentCard title="Boarding Pass" className="h-full">
          <div className="p-4 flex flex-col items-center justify-center space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-inner">
              <QRCode
                value={qrCodeData}
                size={200}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Show this QR code to the bus attendant when boarding.
            </p>
            <p className="text-center font-semibold">
              {bookingData.boarding_stop.name} → {bookingData.alighting_stop.name}
            </p>
            <p className="text-center text-sm">
              {bookingData.seats.count} {bookingData.seats.count > 1 ? 'Seats' : 'Seat'}
            </p>
          </div>
        </ComponentCard>
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
        {/* Actions buttons */}
        <Button onClick={() => navigate('/routes')}>
          Book Another Trip
        </Button>
        <Button variant="outline" onClick={() => navigate('/bookings')}>
          View All Bookings
        </Button>
      </div>
    </div>
  );
};

export default BookingSuccessPage;