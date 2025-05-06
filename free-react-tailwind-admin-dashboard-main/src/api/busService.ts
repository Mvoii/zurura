import { apiClient } from './client';

// Import the ApiResponse type from routeService
import { ApiResponse } from './routeService';

// Bus data types that match the backend models
export interface BusBackendData {
  id?: string;
  operator_id?: string;
  registration_plate: string;
  capacity: number;
  bus_photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Frontend representation of bus data with camelCase naming
export interface BusFrontendData {
  id?: string;
  operatorId?: string;
  registrationPlate: string;
  capacity: number;
  busPhotoUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Add these interfaces after the existing interfaces
export interface BusAssignmentBackendData {
  id?: string;
  bus_id: string;
  route_id: string;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface BusAssignmentFrontendData {
  id?: string;
  busId: string;
  routeId: string;
  startDate: Date;
  endDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AssignBusToRouteRequest {
  bus_id: string;
  route_id: string;
  start_date: string; // ISO format date string
  end_date: string;   // ISO format date string
}

/**
 * Map frontend bus object to backend format
 */
const mapBusForBackend = (busData: BusFrontendData): Record<string, unknown> => {
  return {
    id: busData.id,
    operator_id: busData.operatorId,
    registration_plate: busData.registrationPlate,
    capacity: busData.capacity,
    bus_photo_url: busData.busPhotoUrl,
  };
};

/**
 * Map backend bus object to frontend format
 */
const mapBusForFrontend = (busData: BusBackendData): BusFrontendData => {
  return {
    id: busData.id,
    operatorId: busData.operator_id,
    registrationPlate: busData.registration_plate,
    capacity: busData.capacity,
    busPhotoUrl: busData.bus_photo_url,
    createdAt: busData.created_at ? new Date(busData.created_at) : undefined,
    updatedAt: busData.updated_at ? new Date(busData.updated_at) : undefined,
  };
};

/**
 * Map frontend bus assignment to backend format
 */
const mapAssignmentForBackend = (assignment: BusAssignmentFrontendData): Record<string, unknown> => {
  return {
    bus_id: assignment.busId,
    route_id: assignment.routeId,
    start_date: assignment.startDate.toISOString(),
    end_date: assignment.endDate.toISOString(),
  };
};

/**
 * Map backend bus assignment to frontend format
 */
const mapAssignmentForFrontend = (assignment: BusAssignmentBackendData): BusAssignmentFrontendData => {
  return {
    id: assignment.id,
    busId: assignment.bus_id,
    routeId: assignment.route_id,
    startDate: new Date(assignment.start_date),
    endDate: new Date(assignment.end_date),
    createdAt: assignment.created_at ? new Date(assignment.created_at) : undefined,
    updatedAt: assignment.updated_at ? new Date(assignment.updated_at) : undefined,
  };
};

/**
 * Get all buses for the operator
 */
export const getBuses = async (): Promise<BusFrontendData[]> => {
  try {
    const response = await apiClient.get<BusBackendData[]>('/op/buses');

    console.log('Response:', response);
    
    // Handle case where there's no data or the API returns an error
    // if (!response.success || !Array.isArray(response.data)) {
    //   console.error('Failed to fetch buses:', response.message || 'Unknown error');
    //   return []; // Return empty array instead of throwing
    // }
    
    if (!Array.isArray(response)) {
      console.error('Failed to fetch buses:', 'Response is not an array');
      return []; // Return empty array instead of throwing
    }

    return response.map(mapBusForFrontend);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch buses';
    console.error('Failed to fetch buses:', errorMessage);
    return []; // Return empty array on any error
  }
};

/**
 * Get a single bus by ID
 */
export const getBusById = async (id: string): Promise<BusFrontendData | null> => {
  try {
    const response = await apiClient.get<BusBackendData>(`/op/buses/${id}`);
    
    if (!response) {
      throw new Error('Bus not found');
    }
    
    return mapBusForFrontend(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bus';
    console.error(`Failed to fetch bus ${id}:`, errorMessage);
    throw error;
  }
};

/**
 * Create a new bus
 */
export const createBus = async (busData: BusFrontendData): Promise<BusFrontendData> => {
  try {
    const backendData = mapBusForBackend(busData);
    const response = await apiClient.post<BusBackendData>(
      '/op/buses',
      backendData
    );
    
    // if (!response.success || !response.data) {
    //   throw new Error(response.message || 'Failed to create bus');
    // }
    console.log('response:', response);
    if (!response) {
      throw new Error('Failed to create bus');
    }

    return mapBusForFrontend(response);
  } catch (error) {
    // Check for specific error types the backend might return
    if (error instanceof Error && error.message.includes('reg plate already exists')) {
      throw new Error(`A bus with registration plate ${busData.registrationPlate} already exists`);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to create bus';
    console.error('Failed to create bus:', errorMessage);
    throw error;
  }
};

/**
 * Update an existing bus
 */
export const updateBus = async (id: string, busData: Partial<BusFrontendData>): Promise<BusFrontendData> => {
  try {
    // Only send the fields that are allowed to be updated
    const updateData = {
      capacity: busData.capacity,
      bus_photo_url: busData.busPhotoUrl
    };
    
    const response = await apiClient.put<BusBackendData>(
      `/op/buses/${id}`,
      updateData as Record<string, unknown>
    );
    
    // if (!response) {
    //   throw new Error(response.message || 'Failed to update bus');
    // }
    
    return mapBusForFrontend(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update bus';
    console.error(`Failed to update bus ${id}:`, errorMessage);
    throw error;
  }
};

/**
 * Delete a bus
 */
export const deleteBus = async (id: string): Promise<void> => {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(`/op/buses/${id}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete bus');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete bus';
    console.error(`Failed to delete bus ${id}:`, errorMessage);
    throw error;
  }
};

/**
 * Assign a bus to a route for a specific time period
 */
export const assignBusToRoute = async (assignment: BusAssignmentFrontendData): Promise<BusAssignmentFrontendData> => {
  try {
    const backendData = mapAssignmentForBackend(assignment);
    const response = await apiClient.post<BusAssignmentBackendData>(
      `/op/buses/${assignment.busId}/assign`,
      backendData
    );
    
    if (!response) {
      throw new Error('Failed to assign bus to route');
    }

    return mapAssignmentForFrontend(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to assign bus to route';
    console.error('Failed to assign bus to route:', errorMessage);
    throw error;
  }
};

/**
 * Get all assignments for a specific bus
 */
export const getBusAssignments = async (busId: string): Promise<BusAssignmentFrontendData[]> => {
  try {
    const response = await apiClient.get<BusAssignmentBackendData[]>(`/op/buses/${busId}/assignments`);
    
    if (!Array.isArray(response)) {
      console.error('Failed to fetch bus assignments:', 'Response is not an array');
      return []; // Return empty array instead of throwing
    }

    return response.map(mapAssignmentForFrontend);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch bus assignments';
    console.error(`Failed to fetch assignments for bus ${busId}:`, errorMessage);
    return []; // Return empty array on any error
  }
};

/**
 * Update an existing bus assignment
 */
export const updateBusAssignment = async (
  assignmentId: string, 
  assignment: Partial<BusAssignmentFrontendData>
): Promise<BusAssignmentFrontendData> => {
  try {
    // Only include fields that should be updatable
    const updateData: Record<string, unknown> = {};
    
    if (assignment.startDate) {
      updateData.start_date = assignment.startDate.toISOString();
    }
    
    if (assignment.endDate) {
      updateData.end_date = assignment.endDate.toISOString();
    }
    
    // You might also want to allow changing the route
    if (assignment.routeId) {
      updateData.route_id = assignment.routeId;
    }
    
    const response = await apiClient.put<BusAssignmentBackendData>(
      `/op/buses/assignments/${assignmentId}`,
      updateData
    );
    
    if (!response) {
      throw new Error('Failed to update bus assignment');
    }
    
    return mapAssignmentForFrontend(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to update bus assignment';
    console.error(`Failed to update bus assignment ${assignmentId}:`, errorMessage);
    throw error;
  }
};

/**
 * Delete a bus assignment
 */
export const deleteBusAssignment = async (assignmentId: string): Promise<void> => {
  try {
    const response = await apiClient.delete<ApiResponse<void>>(`/op/buses/assignments/${assignmentId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete bus assignment');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete bus assignment';
    console.error(`Failed to delete bus assignment ${assignmentId}:`, errorMessage);
    throw error;
  }
};