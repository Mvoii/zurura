import React, { useState } from 'react';
import useRoute from '../../hooks/useRoute';
import useBooking from '../../hooks/useBooking';
import SearchRouteByNameForm from '../../components/Commuter/SearchRouteByNameForm';
import StopSelectionForm from '../../components/Commuter/StopSelectionForm';
import NearbyBusesTable from '../../components/Commuter/NearbyBusesTable';
// import SeatSelectionForm from '../../components/Commuter/SeatSelectionForm';
// import PaymentForm from '../../components/Commuter/PaymentForm';
import Alert from '../../components/ui/alert/Alert';
import { Loader2 } from 'lucide-react';

const FindRouteByNamePage: React.FC = () => {
  const { fetchRouteByName, searchedRoute, fetchNearbyBuses, nearbyBuses } = useRoute();
  const { createNewBooking, isLoading: isBookingLoading, error: bookingError } = useBooking();

  const [currentStep, setCurrentStep] = useState(1);
  const [boardingStop, setBoardingStop] = useState<string | null>(null);
  const [alightingStop, setAlightingStop] = useState<string | null>(null);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  const handleNextStep = () => setCurrentStep((prev) => prev + 1);
  const handlePreviousStep = () => setCurrentStep((prev) => prev - 1);

  const handleBooking = async () => {
    if (!selectedBus || !boardingStop || !alightingStop || !selectedSeats.length || !paymentMethod) return;

    try {
      await createNewBooking({
        bus_id: selectedBus,
        boarding_stop_name: boardingStop,
        alighting_stop_name: alightingStop,
        seats: {
          seat_numbers: selectedSeats,
          count: selectedSeats.length,
        },
        payment_method: paymentMethod,
      });
      alert('Booking successful!');
    } catch (err) {
      console.error('Error creating booking:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Book a Bus</h1>

      {currentStep === 1 && (
        <SearchRouteByNameForm
          routes={searchedRoute ? [searchedRoute.route] : []}
          onSearch={fetchRouteByName}
          isLoading={isBookingLoading}
        />
      )}

      {currentStep === 2 && searchedRoute && (
        <StopSelectionForm
          stops={searchedRoute.stops}
          onSelect={(from, to) => {
            setBoardingStop(from);
            setAlightingStop(to);
            handleNextStep();
          }}
          onBack={handlePreviousStep}
        />
      )}

      {currentStep === 3 && boardingStop && (
        <NearbyBusesTable
          routeId={searchedRoute?.route.id || ''}
          boardingStopName={boardingStop}
          onBusSelect={(busId) => {
            setSelectedBus(busId);
            handleNextStep();
          }}
          onBack={handlePreviousStep}
        />
      )}

      {currentStep === 4 && selectedBus && (
        <SeatSelectionForm
          busId={selectedBus}
          onSelectSeats={(seats) => {
            setSelectedSeats(seats);
            handleNextStep();
          }}
          onBack={handlePreviousStep}
        />
      )}

      {currentStep === 5 && selectedSeats.length > 0 && (
        <PaymentForm
          onSelectPayment={(method) => {
            setPaymentMethod(method);
            handleBooking();
          }}
          onBack={handlePreviousStep}
        />
      )}

      {isBookingLoading && (
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Processing...</span>
        </div>
      )}

      {bookingError && <Alert variant="error" title="Error" message={bookingError} />}
    </div>
  );
};

export default FindRouteByNamePage;