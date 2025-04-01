import { api, ApiResponse } from '../api';

export interface Schedule {
  id: string;
  departure_time: string;
  bus: {
    id: string;
    plate_number: string;
    capacity: number;
    available_seats: number;
  };
  driver: {
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

export interface ScheduleParams {
  route_id?: string;
  date?: string; // Format: 2025-03-30
}

export const schedulesApi = {
  // Get schedules with optional filtering by route and date
  getSchedules: async (params: ScheduleParams = {}): Promise<ApiResponse<Schedule[]>> => {
    const { route_id, date } = params;
    const queryParams = new URLSearchParams();
    
    if (route_id) queryParams.append('route_id', route_id);
    if (date) queryParams.append('date', date);
    
    const queryString = queryParams.toString();
    const url = `/schedules${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get<Schedule[]>(url);
    return {
      data: response.data,
      status: response.status,
    };
  },
};
