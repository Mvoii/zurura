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
import { RouteFrontendData, RouteStop } from '../../api/routeService';
import StopSearchForm from '../../components/Commuter/StopSearchForm';

const RouteDetailsPage: React.FC = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const [localRoute, setLocalRoute] = useState<RouteFrontendData | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { 
    currentRoute,
    isLoading: isRouteContextLoading,
    error: routeContextError,
    fetchRoute,
    fetchNearbyBuses,
    nearbyBuses
  } = useRoute();

  const routeData = localRoute || currentRoute;

  useEffect(() => {
    let isMounted = true;
    if (routeId) {
      fetchRoute(routeId)
        .then(fetchedData => {
          if (isMounted && fetchedData) {
            setLocalRoute(fetchedData);
          }
        })
        .catch(err => {
          if (isMounted) {
            console.error("Error fetching route details in page:", err);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [routeId, fetchRoute]);

  const handleGoBack = () => {
    navigate('/routes');
  };

  const handleStopSearch = async (boardingStopName: string, alightingStopName: string) => {
    setSearchError(null);
    if (routeData && routeId && fetchNearbyBuses) {
      try {
        const buses = await fetchNearbyBuses(routeId, boardingStopName);

        if (buses.length > 0) {
          navigate(`/buses/nearby`, {
            state: {
              routeId: routeData.id,
              routeName: routeData.route_name,
              boardingStopName: boardingStopName,
              alightingStopName: alightingStopName,
            }
          });
        } else {
          setSearchError("No nearby buses found for your selection. Please try different stops or check back later.");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch nearby buses.";
        setSearchError(`Search Error: ${message}`);
        console.error("Error during handleStopSearch:", err);
      }
    } else {
      const missingDataError = "Cannot perform search: Route data, route ID, or search function is unavailable.";
      setSearchError(missingDataError);
      console.error(missingDataError);
    }
  };

  if (isRouteContextLoading && !routeData && !localRoute) {
    return (
      <div className="flex justify-center items-center p-10 min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
        <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">Loading route details...</span>
      </div>
    );
  }

  if (routeContextError) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="outline"
          onClick={handleGoBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Routes
        </Button>
        <Alert variant="error" title="Error Loading Route" message={routeContextError} />
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
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Routes
        </Button>
        <Alert 
          variant="info" 
          title="Route Not Found" 
          message={`The requested route (ID: ${routeId}) could not be found or is no longer available.`} 
        />
      </div>
    );
  }

  const stopsArray: RouteStop[] = routeData.stops || [];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Route Details</h1>
        <Button
          variant="outline"
          onClick={handleGoBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Routes
        </Button>
      </div>
      
      <RouteCard 
        route={{
          id: routeData.id || '',
          route_name: routeData.route_name,
          description: routeData.description,
          origin: routeData.origin || '',
          destination: routeData.destination || '',
          created_at: routeData.created_at || '',
          updated_at: routeData.updated_at || '',
          base_fare: 0,
        }}
        onBookNow={() => {}} 
        className="mb-8" 
      />

      {stopsArray.length >= 2 && (
        <div className="my-8">
          <StopSearchForm 
            stops={stopsArray} 
            routeId={routeId || ''} 
            onSearch={handleStopSearch} 
            isLoading={isRouteContextLoading} 
          />
          {searchError && (
            <Alert 
              variant="error" 
              title="Search Error" 
              message={searchError} 
              // className="mt-4"
            />
          )}
        </div>
      )}
      {stopsArray.length < 2 && !isRouteContextLoading && (
        <Alert 
          variant="info" 
          title="Not Enough Stops" 
          message="This route does not have enough stops defined to select a boarding and alighting point for booking." 
        />
      )}
      
      <ComponentCard title="All Route Stops" className="mb-6">
        {isRouteContextLoading && stopsArray.length === 0 && (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
            <span className="ml-2 text-gray-500 dark:text-gray-400">Loading stops...</span>
          </div>
        )}
        
        {!isRouteContextLoading && stopsArray.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No stops are currently defined for this route.
          </p>
        )}
        
        {stopsArray.length > 0 && (
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="w-16 text-center">Order</TableCell>
                  <TableCell isHeader>Stop Name</TableCell>
                  <TableCell isHeader>Landmark/Description</TableCell>
                  <TableCell isHeader className="w-32">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Travel Time
                    </div>
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stopsArray
                  .sort((a, b) => a.stop_order - b.stop_order)
                  .map((stop) => (
                  <TableRow key={stop.id || stop.stop_id || `stop-${stop.stop_order}`}>
                    <TableCell className="font-bold text-center">
                      {stop.stop_order}
                    </TableCell>
                    <TableCell className="font-medium text-gray-800 dark:text-gray-100">
                      {stop.name || 'Unnamed Stop'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                      {stop.landmark_description || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                      {stop.travel_time !== undefined && stop.travel_time !== null
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