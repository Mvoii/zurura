import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { 
  getRoutes, 
  getRouteById, 
  createRoute, 
  updateRoute, 
  deleteRoute,
  getRouteStops,
  addRouteStop,
  updateRouteStop,
  deleteRouteStop,
  reorderRouteStops,
  RouteFrontendData,
  RouteStop,
  StopOrder
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
  
  fetchRoutes: () => Promise<RouteFrontendData[]>;
  fetchRoute: (id: string) => Promise<RouteFrontendData | null>;
  addRoute: (routeData: RouteFrontendData) => Promise<RouteResult>;
  editRoute: (id: string, routeData: RouteFrontendData) => Promise<RouteResult>;
  removeRoute: (id: string) => Promise<RouteResult>;
  
  fetchRouteStops: (routeId: string) => Promise<RouteStop[]>;
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

  /**
   * Fetch all available routes
   */
  const fetchRoutes = useCallback(async (): Promise<RouteFrontendData[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const routes = await getRoutes();
      setRoutes(routes);
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
      setCurrentRoute(route);
      return route;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch route ${id}`;
      setError(errorMessage);
      return null;
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
      
      // Update in the routes list
      setRoutes(prevRoutes => 
        prevRoutes.map(route => route.id === id ? data : route)
      );
      
      // Update currentRoute if it's the one we're editing
      if (currentRoute?.id === id) {
        setCurrentRoute(data);
      }
      
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
      
      // Remove from routes list
      setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== id));
      
      // Clear currentRoute if it's the one we're deleting
      if (currentRoute?.id === id) {
        setCurrentRoute(null);
      }
      
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
   * Fetch stops for a route
   */
  const fetchRouteStops = useCallback(async (routeId: string): Promise<RouteStop[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const stops = await getRouteStops(routeId);
      setRouteStops(stops);
      return stops;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to fetch stops for route ${routeId}`;
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add a stop to a route
   */
  const addStop = useCallback(async (routeId: string, stopData: RouteStop): Promise<RouteResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await addRouteStop(routeId, stopData);
      setRouteStops(prevStops => [...prevStops, data]);
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to add stop to route ${routeId}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to update stop ${stopId}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to remove stop ${stopId}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Reorder stops on a route
   */
  const reorderStops = useCallback(async (routeId: string, stopsOrder: StopOrder[]): Promise<RouteResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await reorderRouteStops(routeId, stopsOrder);
      // After reordering, fetch the updated stops to reflect the new order
      const stops = await getRouteStops(routeId);
      setRouteStops(stops);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to reorder stops for route ${routeId}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear the currently selected route
   */
  const clearCurrentRoute = useCallback((): void => {
    setCurrentRoute(null);
  }, []);

  /**
   * Clear any errors
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // The value to be provided to consumers
  const contextValue: RouteContextType = {
    routes,
    currentRoute,
    routeStops,
    isLoading,
    error,
    fetchRoutes,
    fetchRoute,
    addRoute,
    editRoute,
    removeRoute,
    fetchRouteStops,
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