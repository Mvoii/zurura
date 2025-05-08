import React, { useEffect, useState } from 'react';
import useRoute from '../../hooks/useRoute';
import SearchRouteByNameForm from '../../components/Commuter/SearchRouteByNameForm';
import RouteCard from '../../components/Commuter/RouteCard';
import Alert from '../../components/ui/alert/Alert';
import { Loader2 } from 'lucide-react';

const FindRouteByNamePage: React.FC = () => {
  const { 
    routes, 
    fetchRoutes, 
    searchedRoute, 
    fetchRouteByName, 
    isLoading, 
    error 
  } = useRoute();
  
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Fetch all routes for the dropdown when the page loads
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        await fetchRoutes({ limit: 100 }); // Fetch up to 100 routes to ensure we have a good selection
      } catch (err) {
        console.error('Error loading routes:', err);
      }
    };
    
    loadRoutes();
  }, [fetchRoutes]);
  
  // Handle search submission
  const handleSearch = async (routeName: string) => {
    try {
      await fetchRouteByName(routeName);
      setSearchPerformed(true);
    } catch (err) {
      console.error('Error searching for route:', err);
    }
  };

  // Show loading state while fetching routes for the dropdown
  if (isLoading && !searchPerformed) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading routes...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Find Route by Name</h1>
      
      {/* Search Form */}
      <div className="mb-6">
        <SearchRouteByNameForm
          routes={routes}
          onSearch={handleSearch}
          isLoading={isLoading && searchPerformed}
        />
      </div>
      
      {/* Search Results */}
      {searchPerformed && (
        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center items-center p-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading route details...</span>
            </div>
          ) : error ? (
            <Alert 
              variant="error" 
              title="Error" 
              message={error || "Failed to find route. Please try again."} 
            />
          ) : searchedRoute ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Route Details</h2>
              {/* Pass the route object from searchedRoute to RouteCard */}
              <RouteCard route={searchedRoute.route} />
              
              {/* Display stops information */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Route Stops ({searchedRoute.stops.length})</h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {searchedRoute.stops.map((stop) => (
                      <li key={stop.stop_details.id} className="p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                              {stop.stop_order}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {stop.stop_details.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Schedule: {stop.timetable.join(', ')}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <Alert 
              variant="info" 
              title="No Results" 
              message="No route found with that name. Try selecting a different route." 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FindRouteByNamePage;