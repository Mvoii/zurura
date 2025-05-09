import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useBooking from '../../hooks/useBooking';
import { CreateBookingRequest, PaymentMethod } from '../../api/bookingService'; // Import PaymentMethod enum
import Button from '../../components/ui/button/Button';
import Alert from '../../components/ui/alert/Alert';
import { ArrowLeft, CreditCard, Smartphone, Users, CheckCircle } from 'lucide-react';
import ComponentCard from '../../components/common/ComponentCard';
import Input from '../../components/form/input/InputField';
import Select from '../../components/form/Select';

// Define available payment methods using the PaymentMethod enum
const AVAILABLE_PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: PaymentMethod.MPesa, label: 'M-Pesa', icon: Smartphone },
  { value: PaymentMethod.Card, label: 'Credit/Debit Card', icon: CreditCard },
  { value: PaymentMethod.Cash, label: 'Cash (Pay on Board)', icon: Users }, // Example
  { value: PaymentMethod.BusPass, label: 'Bus Pass', icon: CreditCard }, // Example
  // Add other payment methods as needed, using the enum
];

interface BookingLocationState {
  routeId: string;
  routeName: string;
  busId: string;
  boardingStopName: string;
  alightingStopName: string;
}

const BookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { createNewBooking, isLoading: isBookingLoading, error: bookingError, clearError } = useBooking();

  const [pageError, setPageError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  const {
    routeId,
    routeName,
    busId,
    boardingStopName,
    alightingStopName
  } = (location.state as BookingLocationState) || {};

  const [seatsCount, setSeatsCount] = useState<number>(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | ''>(''); // Use PaymentMethod enum type

  useEffect(() => {
    clearError();
    setPageError(null);
    setBookingSuccess(false);
  }, [clearError, location.state]);

  if (!routeId || !busId || !boardingStopName) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert
          variant="error"
          title="Missing Booking Information"
          message="Essential details for booking are missing. Please go back and select a bus again."
        />
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const handleSeatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = parseInt(e.target.value, 10);
    setSeatsCount(count >= 1 ? count : 1);
  };

  const handlePaymentMethodChange = (value: string) => {
    // Ensure the value is a valid PaymentMethod enum member
    if (Object.values(PaymentMethod).includes(value as PaymentMethod)) {
      setSelectedPaymentMethod(value as PaymentMethod);
    } else {
      setSelectedPaymentMethod(''); // Or handle as an error
    }
  };

  const handleConfirmBooking = async () => {
    setPageError(null);
    clearError();
    setBookingSuccess(false);

    if (seatsCount < 1) {
      setPageError("Please enter a valid number of seats (at least 1).");
      return;
    }
    if (!selectedPaymentMethod) {
      setPageError("Please select a payment method.");
      return;
    }

    const bookingData: CreateBookingRequest = {
      bus_id: busId,
      boarding_stop_name: boardingStopName,
      alighting_stop_name: alightingStopName,
      seats: {
        count: seatsCount,
        // seat_numbers: [], // Kept for future, not used now as per instruction
      },
      payment_method: selectedPaymentMethod, // This is now of type PaymentMethod
    };

    const result = await createNewBooking(bookingData);

    if (result) {
      setBookingSuccess(true);
      // Consider navigating to a success page:
      // navigate(`/booking/success/${result.id}`, { state: { bookingDetails: result } });
    }
  };

  const paymentOptions = AVAILABLE_PAYMENT_METHODS.map(pm => ({ value: pm.value, label: pm.label }));

  // Disable interactive elements during loading or after success
  const isFormInteractionDisabled = isBookingLoading || bookingSuccess;

  // Apply disabled styling classes conditionally
  const disabledClassName = isFormInteractionDisabled ? "opacity-60 cursor-not-allowed" : "";

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Confirm Your Booking</h1>
        <Button variant="outline" onClick={() => navigate(-1)} disabled={isBookingLoading || bookingSuccess}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      {bookingSuccess ? (
        <ComponentCard title="Booking Successful!">
          <div className="p-6 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
              Your booking has been confirmed successfully!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Details have been sent to your account. You can view your bookings in your profile.
            </p>
            <Button onClick={() => navigate('/routes')} className="mt-6">
              Book Another Trip
            </Button>
          </div>
        </ComponentCard>
      ) : (
        <ComponentCard title="Booking Details">
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Route Information</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Route: {routeName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">From: {boardingStopName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">To: {alightingStopName || 'End of route'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bus ID: {busId}</p>
            </div>

            <hr className="dark:border-gray-700"/>

            <div>
              <label htmlFor="seatsCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Seats
              </label>
              <Input
                type="number"
                id="seatsCount"
                name="seatsCount"
                value={seatsCount.toString()}
                onChange={handleSeatsChange}
                min="1"
                className={`w-full md:w-1/3 ${disabledClassName}`}
                disabled={isBookingLoading}
              />
            </div>

            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <Select
                options={paymentOptions}
                defaultValue={selectedPaymentMethod}
                onChange={handlePaymentMethodChange}
                placeholder="Select payment method"
                className={`w-full md:w-1/2 ${disabledClassName}`}
              />
            </div>
            
            {(pageError || bookingError) && (
              <Alert variant="error" title="Booking Error" message={pageError || bookingError || "An unknown error occurred."} />
            )}

            <Button
              onClick={handleConfirmBooking}
              type="submit"
              isLoading={isBookingLoading}
              disabled={isBookingLoading || !selectedPaymentMethod || seatsCount < 1}
              className="w-full flex items-center justify-center gap-2"
            >
              {isBookingLoading ? 'Processing...' : 'Confirm & Proceed'}
            </Button>
          </div>
        </ComponentCard>
      )}
    </div>
  );
};

export default BookingConfirmationPage;