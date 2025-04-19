import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getSecureItem, removeSecureItem } from '../utils/secureStorage';

// Define specific API response interface
interface ApiResponse<T = unknown> {
  error: boolean;
  status: number;
  message: string;
  data: T | null;
}

// Define JWT payload interface
interface JwtPayload {
  exp: number;
  user_id?: string;
  email?: string;
  role?: string;
  jti?: string;
  [key: string]: unknown;
}

export const apiClient = {
  // Base API URL - In development use proxy, in production use relative path
  baseURL: import.meta.env.DEV ? 'http://localhost:8080/a/v1' : '/a/v1',

  // Default headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  } as const,

  // Get token with JWT decoding to check expiration
  getToken(): string | null {
    try {
      const token = getSecureItem<string>('auth-token');
      if (!token) return null;

      // Check if token is expired
      if (this.isTokenExpired(token)) {
        // If token is expired, remove it
        removeSecureItem('auth-token');
        return null;
      }

      return token;
    } catch (error: unknown) {
      console.error('Error getting token:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  },

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    if (!token) return true;
    
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return true;
      
      const payload = JSON.parse(atob(base64Url)) as JwtPayload;
      
      if (!payload || typeof payload !== 'object' || payload === null) {
        return true;
      }
      
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return typeof expiry === 'number' && !isNaN(expiry) 
        ? Date.now() >= expiry 
        : true;
    } catch (error: unknown) {
      console.error('Error checking token expiration:', 
                   error instanceof Error ? error.message : 'Unknown error');
      return true; // Consider token expired if we can't verify
    }
  },

  // Add auth header to requests
  getHeadersWithToken(): Record<string, string> {
    const token = this.getToken();
    if (token) {
      return {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return { ...this.headers };
  },

  // GET request
  async get<T = unknown>(url: string, params: Record<string, unknown> = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.get(`${this.baseURL}${url}`, {
        params,
        headers: this.getHeadersWithToken(),
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  },

  // POST request
  async post<T = unknown>(url: string, data: Record<string, unknown> = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.post(`${this.baseURL}${url}`, data, {
        headers: this.getHeadersWithToken(),
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  },

  // PUT request
  async put<T = unknown>(url: string, data: Record<string, unknown> = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.put(`${this.baseURL}${url}`, data, {
        headers: this.getHeadersWithToken(),
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  },

  // DELETE request
  async delete<T = unknown>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.delete(`${this.baseURL}${url}`, {
        headers: this.getHeadersWithToken(),
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  },

  // PATCH request
  async patch<T = unknown>(url: string, data: Record<string, unknown> = {}): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.patch(`${this.baseURL}${url}`, data, {
        headers: this.getHeadersWithToken(),
      });
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  },

  // Standard error handling
  handleError(error: unknown): ApiResponse<never> {
    console.error('API Error:', error);

    // Check if it's an Axios error
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Handle 401 unauthorized errors (expired token)
      if (axiosError.response?.status === 401) {
        removeSecureItem('auth-token');
        removeSecureItem('user');

        // If not on login page, redirect
        if (typeof window !== 'undefined' && 
            window.location && 
            !window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }

      if (axiosError.response) {
        const responseData = axiosError.response.data as Record<string, unknown>;
        return {
          error: true,
          status: axiosError.response.status,
          message: typeof responseData?.error === 'string' ? responseData.error : 'Server error',
          data: null,
        };
      } else if (axiosError.request) {
        return {
          error: true,
          status: 0,
          message: 'No response from server. Check your connection.',
          data: null,
        };
      }
    }
    
    // For non-Axios errors or unhandled cases
    return {
      error: true,
      status: 0,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      data: null,
    };
  },
};