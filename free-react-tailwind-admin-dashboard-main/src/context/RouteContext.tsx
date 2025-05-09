import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { 
  getRoutes, 
  getRouteById, 
  createRoute, 
  updateRoute, 
  deleteRoute,
  addRouteStop,
  updateRouteStop,
  deleteRouteStop,
  reorderRouteStops,
  getRouteByName,
  getBusesOnRoute,
  getNearbyBusesByBoardingStop, // Import the new function
  RouteFrontendData,
  RouteStop,
  StopOrder,
  RouteSearchParams,
  RouteSearchResponse,
  BusOnRoute,
  NearbyBus // Import the new type
} from '../api/routeService';

// Operation result type
interface RouteResult {
  success: boolean;
  data?: RouteFrontendData | RouteFrontendData[] | RouteStop | RouteStop[] | string;
  error?: string;
}

// Define the context shape
interface RouteContextType {
  routes: RouteFrontendData[];
  currentRoute: RouteFrontendData | null;
  routeStops: RouteStop[];
  isLoading: boolean;
  error: string | null;
  searchedRoute: RouteSearchResponse | null;
  busesOnRoute: BusOnRoute[];
  nearbyBuses: NearbyBus[]; // New state for nearby buses
  
  fetchRoutes: (params?: RouteSearchParams) => Promise<RouteFrontendData[]>;
  fetchRoute: (id: string) => Promise<RouteFrontendData | null>;
  fetchRouteByName: (routeName: string) => Promise<RouteSearchResponse | null>;
  fetchBusesOnRoute: (routeId: string) => Promise<BusOnRoute[]>;
  fetchNearbyBuses: (routeId: string, boardingStopName: string) => Promise<NearbyBus[]>; // New function
  addRoute: (routeData: RouteFrontendData) => Promise<RouteResult>;
  editRoute: (id: string, routeData: RouteFrontendData) => Promise<RouteResult>;
  removeRoute: (id: string) => Promise<RouteResult>;
  
  addRouteStop: (routeId: string, stopData: RouteStop) => Promise<RouteResult>;
  updateRouteStop: (routeId: string, stopId: string, stopData: RouteStop) => Promise<RouteResult>;
  removeRouteStop: (routeId: string, stopId: string) => Promise<RouteResult>;
  reorderStops: (routeId: string, stopsOrder: StopOrder[]) => Promise<RouteResult>;
  
  clearCurrentRoute: () => void;
  clearError: () => void;
}

// Create the context with undefined default
const RouteContext = createContext<RouteContextType | undefined>(undefined);

// Props for the provider
interface RouteProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the application and makes route management available
 */
export const RouteProvider: React.FC<RouteProviderProps> = ({ children }) => {
  const [routes, setRoutes] = useState<RouteFrontendData[]>([]);
  const [currentRoute, setCurrentRoute] = useState<RouteFrontendData | null>(null);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedRoute, setSearchedRoute] = useState<RouteSearchResponse | null>(null);
  const [busesOnRoute, setBusesOnRoute] = useState<BusOnRoute[]>([]);
  const [nearbyBuses, setNearbyBuses] = useState<NearbyBus[]>([]); // New state

  /**
   * Fetch all available routes with optional filtering
   */
  const fetchRoutes = useCallback(async (params: RouteSearchParams = {}): Promise<RouteFrontendData[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const routes = await getRoutes(params);
      console.log('Fetched routes:', routes);
      setRoutes(routes);
      setError(null);
      return routes;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch routes';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch a single route by ID
   */
  const fetchRoute = useCallback(async (id: string): Promise<RouteFrontendData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const route = await getRouteById(id);
      console.log('Fetched route:', route);
      
      setCurrentRoute(route);
      
      if (route?.stops && Array.isArray(route.stops)) {
        setRouteStops(route.stops);
        console.log('Updated routeStops from fetchRoute:', route.stops);
      } else {
        setRouteStops([]);
      }
      
      setError(null);
      return route;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch route ${id}`;
      console.error(`Error fetching route ${id}:`, errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch a route by name
   */
  const fetchRouteByName = useCallback(async (routeName: string): Promise<RouteSearchResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const routeData = await getRouteByName(routeName);
      console.log('Fetched route by name:', routeData);
      setSearchedRoute(routeData);
      setError(null);
      return routeData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch route by name: ${routeName}`;
      console.error(`Error fetching route by name ${routeName}:`, errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch all buses assigned to a specific route
   */
  const fetchBusesOnRoute = useCallback(async (routeId: string): Promise<BusOnRoute[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const buses = await getBusesOnRoute(routeId);
      console.log('Fetched buses for route:', buses);
      setBusesOnRoute(buses);
      setError(null);
      return buses;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to fetch buses for route ${routeId}`;
      console.error(`Error fetching buses for route ${routeId}:`, errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch nearby buses for a specific boarding stop on a route
   */
  const fetchNearbyBuses = useCallback(async (
    routeId: string,
    boardingStopName: string
  ): Promise<NearbyBus[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const buses = await getNearbyBusesByBoardingStop(routeId, boardingStopName);
      setNearbyBuses(buses);
      return buses;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : `Failed to fetch nearby buses for stop ${boardingStopName}`;
      console.error(errorMessage);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add a new route
   */
  const addRoute = useCallback(async (routeData: RouteFrontendData): Promise<RouteResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await createRoute(routeData);
      setRoutes(prevRoutes => [...prevRoutes, data]);
      setError(null);
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add route';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update an existing route
   */
  const editRoute = useCallback(async (id: string, routeData: RouteFrontendData): Promise<RouteResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await updateRoute(id, routeData);
      
      setRoutes(prevRoutes => 
        prevRoutes.map(route => route.id === id ? data : route)
      );
      
      if (currentRoute?.id === id) {
        setCurrentRoute(data);
        
        if (data.stops) {
          setRouteStops(data.stops);
        }
      }
      
      setError(null);
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to update route ${id}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentRoute]);

  /**
   * Delete a route
   */
  const removeRoute = useCallback(async (id: string): Promise<RouteResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteRoute(id);
      
      setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== id));
      
      if (currentRoute?.id === id) {
        setCurrentRoute(null);
        setRouteStops([]);
      }
      
      setError(null);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to remove route ${id}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentRoute]);

  /**
   * Add a stop to a route
   */
  const addStop = useCallback(async (routeId: string, stopData: RouteStop): Promise<RouteResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await addRouteStop(routeId, stopData);
      console.log(data)
      setRouteStops(prevStops => [...prevStops, data]);
      
      if (currentRoute?.id === routeId) {
        setCurrentRoute(prev => prev ? {
          ...prev,
          stops: [...(prev.stops || []), data]
        } : null);
      }
      
      setError(null);
      return { success: true, data };
    } catch (error) {
      console.error('Error adding stop:', error);
      const errorMessage = error instanceof Error ? error.message : `Failed to add stop to route ${routeId}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentRoute]);

  /**
   * Update a route stop
   */
  const updateStop = useCallback(async (routeId: string, stopId: string, stopData: RouteStop): Promise<RouteResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await updateRouteStop(routeId, stopId, stopData);
      setRouteStops(prevStops => 
        prevStops.map(stop => stop.id === stopId ? data : stop)
      );
      
      if (currentRoute?.id === routeId && currentRoute.stops) {
        setCurrentRoute(prev => prev ? {
          ...prev,
          stops: prev.stops?.map(stop => stop.id === stopId ? data : stop)
        } : null);
      }
      
      setError(null);
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to update stop ${stopId}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentRoute]);

  /**
   * Delete a route stop
   */
  const removeStop = useCallback(async (routeId: string, stopId: string): Promise<RouteResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await deleteRouteStop(routeId, stopId);
      setRouteStops(prevStops => 
        prevStops.filter(stop => stop.id !== stopId)
      );
      
      if (currentRoute?.id === routeId && currentRoute.stops) {
        setCurrentRoute(prev => prev ? {
          ...prev,
          stops: prev.stops?.filter(stop => stop.id !== stopId)
        } : null);
      }
      
      setError(null);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to remove stop ${stopId}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentRoute]);

  /**
   * Reorder stops on a route
   */
  const reorderStops = useCallback(async (routeId: string, stopsOrder: StopOrder[]): Promise<RouteResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await reorderRouteStops(routeId, stopsOrder);
      
      const updatedRoute = await getRouteById(routeId);
      
      if (updatedRoute?.stops) {
        setRouteStops(updatedRoute.stops);
        
        if (currentRoute?.id === routeId) {
          setCurrentRoute(updatedRoute);
        }
      }
      
      setError(null);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to reorder stops for route ${routeId}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [currentRoute]);

  /**
   * Clear the currently selected route
   */
  const clearCurrentRoute = useCallback((): void => {
    setCurrentRoute(null);
    setRouteStops([]);
  }, []);

  /**
   * Clear any errors
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const contextValue: RouteContextType = {
    routes,
    currentRoute,
    routeStops,
    isLoading,
    error,
    searchedRoute,
    busesOnRoute,
    nearbyBuses, // Expose the new state
    fetchRoutes,
    fetchRoute,
    fetchRouteByName,
    fetchBusesOnRoute,
    fetchNearbyBuses, // Expose the new function
    addRoute,
    editRoute,
    removeRoute,
    addRouteStop: addStop,
    updateRouteStop: updateStop,
    removeRouteStop: removeStop,
    reorderStops,
    clearCurrentRoute,
    clearError
  };

  return (
    <RouteContext.Provider value={contextValue}>
      {children}
    </RouteContext.Provider>
  );
};

export default RouteContext;