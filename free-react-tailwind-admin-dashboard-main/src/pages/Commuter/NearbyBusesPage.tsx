import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NearbyBusesTable from '../../components/Commuter/NearbyBusesTable';
import Button from '../../components/ui/button/Button';
import { ArrowLeft } from 'lucide-react';
import Alert from '../../components/ui/alert/Alert';

const NearbyBusesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data passed via navigation state
  const { 
    routeId, 
    routeName, 
    boardingStopName, 
    alightingStopName 
  } = (location.state as { 
    routeId: string; 
    routeName: string; 
    boardingStopName: string; 
    alightingStopName: string; 
  }) || {};

  if (!routeId || !boardingStopName) {
    // This case should ideally not happen if navigation is always correct
    return (
      <div className="container mx-auto px-4 py-6">
        <Alert 
          variant="error" 
          title="Missing Information" 
          message="Required route or stop information is missing. Please go back and try your search again." 
        />
        <Button onClick={() => navigate(-1)} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const handleBusSelect = (busId: string) => {
    // Navigate to a booking page or seat selection, passing all necessary info
    console.log(`Bus selected: ${busId} for route ${routeName} from ${boardingStopName} to ${alightingStopName}`);
    // Example navigation (replace with your actual booking page route)
    navigate(`/booking/confirm`, { 
      state: { 
        routeId, 
        routeName, 
        busId, 
        boardingStopName, 
        alightingStopName 
      } 
    });
  };

  const handleBack = () => {
    // Navigate back to the route details page
    navigate(`/routes/${routeId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              Available Buses
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Route: {routeName || 'N/A'} <br/>
              From: {boardingStopName} to {alightingStopName || 'End of route'}
            </p>
        </div>
        <Button
          variant="outline"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Route Details
        </Button>
      </div>

      <NearbyBusesTable
        routeId={routeId}
        boardingStopName={boardingStopName}
        onBusSelect={handleBusSelect}
        onBack={handleBack} // Or you might want a different back behavior for the table itself
      />
    </div>
  );
};

export default NearbyBusesPage;