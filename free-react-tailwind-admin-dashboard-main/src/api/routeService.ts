import { apiClient } from './client';

// Define interfaces for the data models
export interface RouteBackendData {
  id?: string;
  route_name: string;
  description: string;
  origin?: string;
  destination?: string;
  created_at?: string;
  updated_at?: string;
  stops?: RouteStop[];
}

export interface RouteFrontendData {
  id?: string;
  route_name: string;
  description: string;
  origin?: string;
  destination?: string;
  created_at?: string;
  updated_at?: string;
  stops?: RouteStop[];
}

export interface RouteStop {
  id: string; // stop_uuid
  name: string;
  latitude: number;
  longitude: number;
  stop_order: number;
  timetable: string[]; // Array of time strings like "08:00"
  travel_time: number | null; // Travel time in minutes from previous stop/origin
  // Add other stop-related fields if necessary based on actual backend implementation
  landmark_description?: string;
  created_at?: string;
  updated_at?: string;
  stop_id?: string; // Alias for id, if used elsewhere
}

export interface StopOrder {
  id: string;
  order: number;
}

export interface ApiResponse<T> {
  data?: T;
  success: boolean;
  message?: string;
}

// Define interface for route search parameters
export interface RouteSearchParams {
  origin?: string;
  destination?: string;
  limit?: number;
  offset?: number;
}

/**
 * Map frontend route object to backend format
 */
const mapRouteForBackend = (routeData: RouteFrontendData | null): RouteBackendData | null => {
  if (!routeData) return null;

  // Only include fields that the backend actually uses
  return {
    id: routeData.id,
    route_name: routeData.route_name || '',
    description: routeData.description || '',
    origin: routeData.origin,
    destination: routeData.destination,
    created_at: routeData.created_at,
    updated_at: routeData.updated_at,
    stops: routeData.stops,
    // Don't send origin/    destination as they aren't handled by the backend
  };
};

/**
 * Map backend route object to frontend format
 */
const mapRouteForFrontend = (routeData: RouteBackendData | null): RouteFrontendData | null => {
  if (!routeData) return null;
  return {
    id: routeData.id,
    route_name: routeData.route_name || '',
    description: routeData.description || '',
    origin: routeData.origin,
    destination: routeData.destination,
    created_at: routeData.created_at,
    updated_at: routeData.updated_at,
    stops: routeData.stops
  };
};

/**
 * Get all routes with optional filtering
 */
export const getRoutes = async (params: RouteSearchParams = {}): Promise<RouteFrontendData[]> => {
  try {
    const { origin, destination, limit, offset } = params;
    const queryParams = new URLSearchParams();
    
    // Add search parameters to query string if they exist
    if (origin) queryParams.append('origin', origin);
    if (destination) queryParams.append('destination', destination);
    if (limit) queryParams.append('limit', limit.toString());
    if (offset) queryParams.append('offset', offset.toString());
    
    // Construct the URL with query parameters
    const queryString = queryParams.toString();
    const url = `/routes${queryString ? `?${queryString}` : ''}`;
    
    // Update the type to match the actual response format
    interface RoutesResponse {
      routes: RouteBackendData[];
    }
    
    const response = await apiClient.get<RoutesResponse>(url);
    
    console.log('Response:', response);

    // Check if response is null or undefined
    if (!response) {
      console.error('Failed to fetch routes: Response is null or undefined');
      return [];
    }
    
    // Check if the response has the routes property and it's an array
    if (!response.routes || !Array.isArray(response.routes)) {
      console.error('Failed to fetch routes: Response does not contain routes array');
      return [];
    }

    // Map the routes array
    return response.routes.map(route => {
      const mappedRoute = mapRouteForFrontend(route);
      if (!mappedRoute) {
        // Return a default route object if mapping fails
        return {
          route_name: '',
          description: '',
          origin: '',
          destination: '',
        };
      }
      return mappedRoute;
    });
  } catch (error) {
    console.error('Failed to fetch routes:', error);
    return [];
  }
};

/**
 * Get route by ID
 */
export const getRouteById = async (id: string): Promise<RouteFrontendData> => {
  try {
    const response = await apiClient.get<RouteBackendData>(`/routes/${id}`);
    
    // if (!response.success || !response.data) {
    //   throw new Error(response.message || 'Route not found');
    // }

    console.log('Response:', response);
    if (!response) {
      throw new Error('Route not found');
    }
    
    const mappedRoute = mapRouteForFrontend(response);
    if (!mappedRoute) {
      throw new Error('Failed to map route data');
    }
    console.log('Mapped route:', mappedRoute, response);
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch route';
    console.error(`Failed to fetch route ${id}:`, errorMessage);
    throw error;
  }
};

/**
 * Create a new route
 */
export const createRoute = async (routeData: RouteFrontendData): Promise<RouteFrontendData> => {
  try {
    const backendData = mapRouteForBackend(routeData);
    if (!backendData) {
      throw new Error('Invalid route data');
    }
    
    const response = await apiClient.post<RouteBackendData>(
      '/op/routes',
      backendData as unknown as Record<string, unknown>
    );
    console.log('Response:', response);
    // if (!response.success || !response.data) {
    //   throw new Error(response.message || 'Failed to create route');
    // }
    
    if (!response) {
      throw new Error('Failed to create route');
    }

    const mappedResponse = mapRouteForFrontend(response);
    if (!mappedResponse) {
      throw new Error('Failed to map route response data');
    }
    
    return mappedResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create route';
    console.error('Failed to create route:', errorMessage);
    throw error;
  }
};

/**
 * Update an existing route
 */
export const updateRoute = async (id: string, routeData: RouteFrontendData): Promise<RouteFrontendData> => {
  try {
    const backendData = mapRouteForBackend(routeData);
    if (!backendData) {
      throw new Error('Invalid route data');
    }
    
    const response = await apiClient.put<ApiResponse<RouteBackendData>>(
      `/op/routes/${id}`,
      backendData as unknown as Record<string, unknown>
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update route');
    }
    
    const mappedResponse = mapRouteForFrontend(response.data);
    if (!mappedResponse) {
      throw new Error('Failed to map route response data');
    }
    
    return mappedResponse;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update route';
    console.error(`Failed to update route ${id}:`, errorMessage);
    throw error;
  }
};

/**
 * Delete a route
 */
export const deleteRoute = async (id: string): Promise<void> => {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(`/op/routes/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete route');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete route';
    console.error(`Failed to delete route ${id}:`, errorMessage);
    throw error;
  }
};

/**
 * Get stops for a route
 */
export const getRouteStops = async (routeId: string): Promise<RouteStop[]> => {
  try {
    const response = await apiClient.get<ApiResponse<RouteStop[]>>(`/routes/${routeId}/stops`);
    
    if (!response.success || !Array.isArray(response.data)) {
      console.error(`Failed to fetch stops for route ${routeId}:`, response.message);
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch stops for route ${routeId}:`, error);
    return [];
  }
};

/**
 * Add a stop to a route
 */
export const addRouteStop = async (routeId: string, stopData: RouteStop): Promise<RouteStop> => {
  try {
    const response = await apiClient.post<ApiResponse<RouteStop>>(
      `/op/routes/${routeId}/stops`, 
      stopData as unknown as Record<string, unknown>
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to add stop to route');
    }
    
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to add stop to route';
    console.error(`Failed to add stop to route ${routeId}:`, errorMessage);
    throw error;
  }
};

/**
 * Update a stop
 */
export const updateRouteStop = async (routeId: string, stopId: string, stopData: RouteStop): Promise<RouteStop> => {
  try {
    const response = await apiClient.put<ApiResponse<RouteStop>>(
      `/op/routes/${routeId}/stops/${stopId}`, 
      stopData as unknown as Record<string, unknown>
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to update stop');
    }
    
    return response.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update stop';
    console.error(`Failed to update stop ${stopId}:`, errorMessage);
    throw error;
  }
};

/**
 * Delete a stop
 */
export const deleteRouteStop = async (routeId: string, stopId: string): Promise<void> => {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(`/op/routes/${routeId}/stops/${stopId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete stop');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete stop';
    console.error(`Failed to delete stop ${stopId}:`, errorMessage);
    throw error;
  }
};

/**
 * Reorder stops on a route
 */
export const reorderRouteStops = async (routeId: string, stopsOrder: StopOrder[]): Promise<void> => {
  try {
    const response = await apiClient.put<ApiResponse<void>>(
      `/op/routes/${routeId}/stops/reorder`, 
      { stops: stopsOrder } as unknown as Record<string, unknown>
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to reorder stops');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to reorder stops';
    console.error(`Failed to reorder stops for route ${routeId}:`, errorMessage);
    throw error;
  }
};