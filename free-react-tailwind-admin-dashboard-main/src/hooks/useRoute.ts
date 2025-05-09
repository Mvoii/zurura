import { useContext } from 'react';
import RouteContext from '../context/RouteContext';
import type { 
  RouteFrontendData, 
  RouteStop, 
  StopOrder, 
  RouteSearchParams,
  RouteSearchResponse,
  BusOnRoute,
  NearbyBus // Add this import
} from '../api/routeService';

/**
 * Interface for the result of route operations
 */
export interface RouteResult {
  success: boolean;
  data?: RouteFrontendData | RouteFrontendData[] | RouteStop | RouteStop[] | string;
  error?: string;
}

/**
 * Interface for the useRoute hook return value
 */
export interface UseRouteReturn {
  // State
  routes: RouteFrontendData[];
  currentRoute: RouteFrontendData | null;
  routeStops: RouteStop[];
  isLoading: boolean;
  error: string | null;
  searchedRoute: RouteSearchResponse | null;
  busesOnRoute: BusOnRoute[]; // Add this state
  nearbyBuses: NearbyBus[]; // Add this state
  
  // Route operations
  fetchRoutes: (params?: RouteSearchParams) => Promise<RouteFrontendData[]>;
  fetchRoute: (id: string) => Promise<RouteFrontendData | null>;
  fetchRouteByName: (routeName: string) => Promise<RouteSearchResponse | null>;
  fetchBusesOnRoute: (routeId: string) => Promise<BusOnRoute[]>; // Add this function
  fetchNearbyBuses: (routeId: string, boardingStopName: string) => Promise<NearbyBus[]>; // Add this function
  addRoute: (routeData: RouteFrontendData) => Promise<RouteResult>;
  editRoute: (id: string, routeData: RouteFrontendData) => Promise<RouteResult>;
  removeRoute: (id: string) => Promise<RouteResult>;
  
  // Route stops operations
  addRouteStop: (routeId: string, stopData: RouteStop) => Promise<RouteResult>;
  updateRouteStop: (routeId: string, stopId: string, stopData: RouteStop) => Promise<RouteResult>;
  removeRouteStop: (routeId: string, stopId: string) => Promise<RouteResult>;
  reorderStops: (routeId: string, stopsOrder: StopOrder[]) => Promise<RouteResult>;
  
  // Utility functions
  clearCurrentRoute: () => void;
  clearError: () => void;
}

/**
 * Custom hook to access route functionality throughout the app
 * @returns Route state and methods
 */
const useRoute = (): UseRouteReturn => {
  const context = useContext(RouteContext);
  
  if (context === undefined) {
    throw new Error('useRoute must be used within a RouteProvider');
  }
  
  return context;
};

export default useRoute;