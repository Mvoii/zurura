import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRoute from '../../hooks/useRoute';
import RouteCard from '../../components/Commuter/RouteCard';
import Button from '../../components/ui/button/Button';
import Alert from '../../components/ui/alert/Alert';
import ComponentCard from '../../components/common/ComponentCard';
import { ArrowLeft, Map, Clock } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";

const RouteDetailsPage: React.FC = () => {
  const { routeId } = useParams<{ routeId: string }>();
  console.log('Route ID from URL:', routeId);
  const navigate = useNavigate();
  const { 
    currentRoute,
    routeStops,
    isLoading, 
    error, 
    fetchRoute,
    fetchRouteStops
  } = useRoute();

  console.log('Fetched route:', currentRoute);
  
  const [showStops, setShowStops] = useState(false);
  
  useEffect(() => {
    // Reset state when component mounts or routeId changes
    setShowStops(false);
    
    // Fetch route details 
    if (routeId) {
    try {
      fetchRoute(routeId)
        .then(() => {
            console.log('Route details fetched successfully');
        });
    } catch (err) {
      console.error('Error fetching route details:', err);
    }
    }
  }, [routeId, fetchRoute]);

  // Function to load stops when the user wants to see them
  const handleViewStops = async () => {
    if (routeId && !showStops) {
      try {
        await fetchRouteStops(routeId);
        setShowStops(true);
      } catch (err) {
        console.error('Error fetching route stops:', err);
      }
    } else {
      // Toggle off if already showing
      setShowStops(false);
    }
  };

  // Navigate back to search
  const handleGoBack = () => {
    navigate('/routes');
  };

  if (isLoading && !currentRoute) {
    // Show loading indicator only if data isn't already loaded
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading route details...</span>
      </div>
    );
  }

  if (error) {
    // Show error message
    return (
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="outline"
          onClick={handleGoBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
        </Button>
        
        <Alert variant="error" title="Error" message={error} />
      </div>
    );
  }

  // Explicitly check if currentRoute is available AFTER loading and error checks
  if (!currentRoute) {
    // Handle case where loading finished, no error, but no route data (e.g., 404 handled gracefully)
    return (
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="outline"
          onClick={handleGoBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
        </Button>
        
        <Alert 
          variant="info" 
          title="Not Found" 
          message="The requested route could not be found." 
        />
      </div>
    );
  }

  // If we reach here, isLoading is false, error is null, and currentRoute is valid
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={handleGoBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
        </Button>
        
        <h1 className="text-2xl font-bold mb-6">Route Details</h1>
      </div>
      
      {/* Render RouteCard only with valid data */}
      <RouteCard route={currentRoute} className="mb-6" />
      
      {/* Actions */}
      <div className="flex justify-end gap-2 mt-6 mb-6">
        <Button
          onClick={handleViewStops}
          className="flex items-center"
        >
          <Map className="mr-2 h-4 w-4" /> 
          {showStops ? 'Hide Stops' : 'View Stops'}
        </Button>
      </div>
      
      {/* Stops Section - conditionally rendered */}
      {showStops && (
        <ComponentCard title="Route Stops" className="mb-6">
          {isLoading && (
            <div className="flex justify-center items-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading stops...</span>
            </div>
          )}
          
          {!isLoading && routeStops.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No stops available for this route.
            </p>
          )}
          
          {!isLoading && routeStops.length > 0 && (
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Stop</TableCell>
                    <TableCell isHeader>Location</TableCell>
                    <TableCell isHeader>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Travel Time
                      </div>
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routeStops.map((stop) => (
                    <TableRow key={stop.id || stop.stop_id}>
                      <TableCell className="font-medium">
                        {stop.name || 'Unnamed Stop'}
                      </TableCell>
                      <TableCell>
                        {stop.landmark_description || 'No description'}
                      </TableCell>
                      <TableCell>
                        {stop.travel_time !== undefined 
                          ? `${stop.travel_time} min` 
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </ComponentCard>
      )}
    </div>
  );
};

export default RouteDetailsPage;