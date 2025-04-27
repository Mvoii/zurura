import { api, ApiResponse } from '../api';

export interface Route {
  id: string;
  route_name: string;
  description: string;
  base_fare: number;
  created_at: string;
  updated_at: string;
  origin: string;
  destination: string;
}

export interface FindRoutesParams {
  origin?: string;
  destination?: string;
  limit?: number;
  offset?: number;
}

export interface FindRoutesResponse {
  routes: Route[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

export const routesApi = {
  // Get route details by ID
  getRouteDetails: async (routeId: string): Promise<ApiResponse<{route: any, stops: any[]}>> => {
    const response = await api.get(`/routes/${routeId}`);
    return {
      data: response.data,
      status: response.status,
    };
  },
  
  // Find routes based on search parameters
  findRoutes: async (params: FindRoutesParams = {}): Promise<ApiResponse<FindRoutesResponse>> => {
    const { origin, destination, limit, offset } = params;
    const queryParams = new URLSearchParams();
    
    if (origin) queryParams.append('origin', origin);
    if (destination) queryParams.append('destination', destination);
    if (limit) queryParams.append('limit', limit.toString());
    if (offset) queryParams.append('offset', offset.toString());
    
    const queryString = queryParams.toString();
    const url = `/routes${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<FindRoutesResponse>(url);
    return {
      data: response.data,
      status: response.status,
    };
  },
};
