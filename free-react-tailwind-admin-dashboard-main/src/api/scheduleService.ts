import { apiClient } from './client';

// Backend data structures
export interface ScheduleBackendData {
  id: string;
  departure_time: string; // ISO 8601 format
  bus: {
    id: string;
    plate_number: string;
    capacity: number;
    available_seats: number;
  };
  driver: { // Uncommented and added back
    id: string;
    first_name: string;
    last_name: string;
  };
  route: {
    id: string;
    name: string;
    description: string;
  };
}

// Frontend data structures
export interface ScheduleFrontendData {
  id: string;
  departureTime: Date;
  bus: {
    id: string;
    plateNumber: string;
    capacity: number;
    availableSeats: number;
  };
  driver: {
    id: string;
    firstName: string;
    lastName: string;
  };
  route: {
    id: string;
    name: string;
    description: string;
  };
}

// Query parameters for list endpoint
export interface ScheduleParams {
  route_id?: string;
  date?: string; // Format: YYYY-MM-DD
}

// Create schedule request payload
export interface CreateSchedulePayload {
  route_id: string;
  bus_id: string;
  driver_id?: string;
  departure_time: string; // ISO 8601 format
}

// Response types
export interface ScheduleOperationResult {
  success: boolean;
  data?: ScheduleFrontendData;
  error?: string;
}

export interface ListSchedulesResult {
  success: boolean;
  data?: ScheduleFrontendData[];
  error?: string;
}

// Mapping functions
const mapScheduleForFrontend = (data: ScheduleBackendData): ScheduleFrontendData => {
  return {
    id: data.id,
    departureTime: new Date(data.departure_time),
    bus: {
      id: data.bus.id,
      plateNumber: data.bus.plate_number,
      capacity: data.bus.capacity,
      availableSeats: data.bus.available_seats,
    },
    driver: {
      id: data.driver?.id || "unknown", // Use default driver info if not provided
      firstName: data.driver?.first_name || "System",
      lastName: data.driver?.last_name || "Driver",
    },
    route: {
      id: data.route.id,
      name: data.route.name,
      description: data.route.description,
    },
  };
};

const mapScheduleForBackend = (data: Partial<ScheduleFrontendData>): CreateSchedulePayload => {
  return {
    route_id: data.route?.id || '',
    bus_id: data.bus?.id || '',
    driver_id: data.driver?.id || '',
    departure_time: data.departureTime ? data.departureTime.toISOString() : new Date().toISOString(),
  };
};

// Service methods
export const getSchedules = async (params: ScheduleParams = {}): Promise<ListSchedulesResult> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.route_id) queryParams.append('route_id', params.route_id);
    if (params.date) queryParams.append('date', params.date);
    
    const queryString = queryParams.toString();
    const url = `/schedules${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<ScheduleBackendData[]>(url);
    
    return {
      success: true,
      data: response.map(mapScheduleForFrontend)
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch schedules';
    console.error('Error fetching schedules:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

export const createSchedule = async (scheduleData: Partial<ScheduleFrontendData>): Promise<ScheduleOperationResult> => {
  try {
    const payload = mapScheduleForBackend(scheduleData);
    await apiClient.post<{ message: string }>('/op/schedules', payload as unknown as Record<string, unknown>);
    
    return {
      success: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create schedule';
    console.error('Error creating schedule:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Alternative approach using direct payload for creation
export const createScheduleWithPayload = async (payload: CreateSchedulePayload): Promise<ScheduleOperationResult> => {
  try {
    await apiClient.post<{ message: string }>('/op/schedules', payload as unknown as Record<string, unknown>);
    
    return {
      success: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to create schedule';
    console.error('Error creating schedule:', errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Optional: Get a single schedule (if you implement this endpoint later)
export const getScheduleById = async (id: string): Promise<ScheduleOperationResult> => {
  try {
    const response = await apiClient.get<ScheduleBackendData>(`/schedules/${id}`);
    
    return {
      success: true,
      data: mapScheduleForFrontend(response)
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : `Failed to fetch schedule ${id}`;
    console.error(`Error fetching schedule ${id}:`, errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
};

export default {
  getSchedules,
  createSchedule,
  createScheduleWithPayload,
  getScheduleById
};