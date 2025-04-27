import axios from 'axios';

// API base URL from environment variable or default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/a/v1';

// Helper function to safely access localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage safely
    const token = getToken();
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
      }
    }

    // Handle other errors
    if (error.response) {
      // Server responded with error
      return Promise.reject({
        status: error.response.status,
        message: error.response.data?.message || 'An error occurred',
        details: error.response.data?.details,
      });
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        status: 0,
        message: 'No response from server',
        details: 'Network error or server is down',
      });
    } else {
      // Something else went wrong
      return Promise.reject({
        status: 0,
        message: 'Request failed',
        details: error.message,
      });
    }
  }
);

// API response type
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// API error type
export interface ApiError {
  status: number;
  message: string;
  details?: string;
}
