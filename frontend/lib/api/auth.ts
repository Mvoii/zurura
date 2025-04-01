import { api, ApiResponse, ApiError } from '../api';
import { User } from '@/types/user';

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  school_name: string;
}

export interface OperatorRegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Auth API functions
export const authApi = {
  // Login
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return {
      data: response.data,
      status: response.status,
    };
  },

  // Register as regular user
  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return {
      data: response.data,
      status: response.status,
    };
  },

  // Register as operator
  registerOperator: async (data: OperatorRegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<AuthResponse>('/auth/register/op', data);
    return {
      data: response.data,
      status: response.status,
    };
  },

  // Logout
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await api.post('/auth/logout');
    return {
      data: response.data,
      status: response.status,
    };
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<User>('/me/profile');
    return {
      data: response.data,
      status: response.status,
    };
  },
};
