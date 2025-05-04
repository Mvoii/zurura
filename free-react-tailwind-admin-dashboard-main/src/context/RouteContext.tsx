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
  RouteFrontendData,
  RouteStop,
  StopOrder,
  RouteSearchParams
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
  
  fetchRoutes: (params?: RouteSearchParams) => Promise<RouteFrontendData[]>;
  fetchRoute: (id: string) => Promise<RouteFrontendData | null>;
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
      
      setRoutes(prevRoutes => 
        prevRoutes.map(route => route.id === id ? data : route)
      );
      
      if (currentRoute?.id === id) {
        setCurrentRoute(data);
        
        if (data.stops) {
          setRouteStops(data.stops);
        }
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
      
      setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== id));
      
      if (currentRoute?.id === id) {
        setCurrentRoute(null);
        setRouteStops([]);
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
   * Add a stop to a route
   */
  const addStop = useCallback(async (routeId: string, stopData: RouteStop): Promise<RouteResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await addRouteStop(routeId, stopData);
      setRouteStops(prevStops => [...prevStops, data]);
      
      if (currentRoute?.id === routeId) {
        setCurrentRoute(prev => prev ? {
          ...prev,
          stops: [...(prev.stops || []), data]
        } : null);
      }
      
      return { success: true, data };
    } catch (error) {
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
    fetchRoutes,
    fetchRoute,
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