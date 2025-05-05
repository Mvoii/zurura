import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRoute from '../../hooks/useRoute';
import RouteCard from '../../components/Commuter/RouteCard';
import Button from '../../components/ui/button/Button';
import Alert from '../../components/ui/alert/Alert';
import ComponentCard from '../../components/common/ComponentCard';
import { ArrowLeft, Clock } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { RouteFrontendData } from '../../api/routeService';

const RouteDetailsPage: React.FC = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const [localRoute, setLocalRoute] = useState<RouteFrontendData | null>(null);

  const { 
    currentRoute,
    isLoading, 
    error, 
    fetchRoute
  } = useRoute();

  const routeData = currentRoute || localRoute;

  useEffect(() => {
    let isMounted = true;

    if (routeId) {
      console.log(`[RouteDetailsPage] Fetching route with ID: ${routeId}`);

      fetchRoute(routeId)
        .then(routeData => {
          if (isMounted && routeData) {
            console.log('[RouteDetailsPage] Route fetched successfully:', routeData.route_name);
            setLocalRoute(routeData);
          }
        })
        .catch(err => {
          if (isMounted) {
            console.error('[RouteDetailsPage] Error fetching route:', err);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [routeId, fetchRoute]);

  useEffect(() => {
    console.log('[RouteDetailsPage] Route data updated:', {
      contextRoute: currentRoute?.route_name,
      localRoute: localRoute?.route_name,
      isLoading,
      hasError: !!error
    });
  }, [currentRoute, localRoute, isLoading, error]);

  const handleGoBack = () => {
    navigate('/routes');
  };

  if (isLoading && !routeData) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading route details...</span>
      </div>
    );
  }

  if (error) {
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

  if (!routeData) {
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
          message={`The requested route (ID: ${routeId}) could not be found.`} 
        />
      </div>
    );
  }

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
      
      <RouteCard route={routeData} className="mb-6" />
      
      <ComponentCard title="Route Stops" className="mb-6">
        {isLoading && (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading stops...</span>
          </div>
        )}
        
        {!isLoading && (!routeData.stops || routeData.stops.length === 0) && (
          <p className="text-center text-gray-500 py-4">
            No stops available for this route.
          </p>
        )}
        
        {!isLoading && routeData.stops && routeData.stops.length > 0 && (
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
                {routeData.stops.map((stop) => (
                  <TableRow key={stop.id || stop.stop_id || `stop-${stop.stop_order}`}>
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
    </div>
  );
};

export default RouteDetailsPage;