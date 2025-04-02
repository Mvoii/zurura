# Zurura API Integration Guide

## Overview

This document outlines the API integration approach for the Zurura frontend application. The backend is built with Go and provides RESTful API endpoints that the frontend will consume.

## Base URL

All API requests will use the following base URL:

```
http://localhost:8080/a/v1
```

For production, this will be replaced with the actual API domain.

## Authentication

### Token Management

The application uses JWT (JSON Web Token) for authentication and session management:

1. **Token Acquisition**: Obtained during login/registration
2. **Storage**: Securely stored in browser storage (localStorage/sessionStorage)
3. **Usage**: Sent with every authenticated request in the Authorization header
4. **Expiration**: Handled with automatic refresh mechanism when possible
5. **Revocation**: Token is invalidated on logout by adding to blacklist

### Authentication Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/auth/login` | User login | `{email, password}` | `{token, user}` |
| POST | `/auth/register` | Commuter registration | `{email, password, first_name, last_name, school_name}` | `{token, user}` |
| POST | `/auth/register/op` | Operator registration | `{email, password, first_name, last_name, company}` | `{token, user}` |
| POST | `/auth/logout` | Logout (requires auth) | None | `{message}` |

### Example Authentication Flow

```typescript
// Login example
const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Store token and user data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  } catch (error) {
    // Handle authentication errors
    throw new Error('Authentication failed');
  }
};
```

## Commuter API Endpoints

### Route Management

| Method | Endpoint | Description | Parameters/Body | Auth Required |
|--------|----------|-------------|----------------|---------------|
| GET | `/routes/:route_id` | Get route details | `route_id` (path) | No |
| GET | `/stops/nearby` | Find nearby stops | `lat, lng, radius` (query) | No |

### Schedule Information

| Method | Endpoint | Description | Parameters/Body | Auth Required |
|--------|----------|-------------|----------------|---------------|
| GET | `/schedules` | List schedules | `route_id, date` (query) | No |

### Tracking

| Method | Endpoint | Description | Parameters/Body | Auth Required |
|--------|----------|-------------|----------------|---------------|
| GET | `/tracking/:bus_id` | Get bus location | `bus_id` (path) | No |
| GET | `/tracking/nearby` | Get nearby buses | `lat, lng, radius` (query) | No |

### Bookings

| Method | Endpoint | Description | Parameters/Body | Auth Required |
|--------|----------|-------------|----------------|---------------|
| POST | `/bookings` | Create booking | `{bus_id, seat_numbers, payment_method}` | Yes |
| GET | `/bookings/:booking_id` | Get booking details | `booking_id` (path) | Yes |
| POST | `/bookings/:booking_id/cancel` | Cancel booking | `booking_id` (path) | Yes |

### Bus Passes

| Method | Endpoint | Description | Parameters/Body | Auth Required |
|--------|----------|-------------|----------------|---------------|
| GET | `/passes` | Get user passes | None | Yes |
| POST | `/passes` | Purchase pass | `{pass_type, amount, payment_method}` | Yes |

## Operator API Endpoints

### Bus Management

| Method | Endpoint | Description | Parameters/Body | Auth Required |
|--------|----------|-------------|----------------|---------------|
| GET | `/op/buses` | List operator buses | None | Yes (Operator) |
| POST | `/op/buses` | Add new bus | `{registration_plate, capacity, bus_photo_url}` | Yes (Operator) |
| PUT | `/op/buses/:id` | Update bus | `{capacity, bus_photo_url}` | Yes (Operator) |

### Route Management

| Method | Endpoint | Description | Parameters/Body | Auth Required |
|--------|----------|-------------|----------------|---------------|
| POST | `/op/routes` | Create route | `{name, description}` | Yes (Operator) |
| POST | `/op/:route_id/stops` | Add stop to route | `{stop_id, timetable, travel_time}` | Yes (Operator) |

### Schedule Management

| Method | Endpoint | Description | Parameters/Body | Auth Required |
|--------|----------|-------------|----------------|---------------|
| POST | `/op/schedules` | Create schedule | `{route_id, bus_id, driver_id, departure_time}` | Yes (Operator) |

## API Client Implementation

Our API client is implemented using Axios with the following features:

- Automatic token inclusion in request headers
- Response data transformation and error normalization
- Request/response logging (development only)
- Retry logic for failed requests
- Request cancellation on component unmount
- Request caching for improved performance

### API Client Setup Code

```typescript
// lib/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/a/v1';
const MAX_RETRIES = 3;

export class ApiClient {
  private client: AxiosInstance;
  private retryCount: Map<string, number> = new Map();

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 seconds
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor: Add auth token and logging
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request ID for tracking
        config.headers['X-Request-ID'] = this.generateRequestId();
        
        // Development logging
        if (process.env.NODE_ENV === 'development') {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
            headers: config.headers,
            data: config.data,
          });
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle errors and logging
    this.client.interceptors.response.use(
      (response) => {
        // Reset retry count for successful requests
        const url = response.config.url || '';
        this.retryCount.delete(url);
        
        // Development logging
        if (process.env.NODE_ENV === 'development') {
          console.log(`API Response: ${response.status}`, {
            data: response.data,
            headers: response.headers,
          });
        }
        
        return response;
      },
      (error: AxiosError) => {
        // Handle specific error cases
        if (error.response) {
          // Server responded with error status
          const status = error.response.status;
          
          // Handle authentication errors
          if (status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
            return Promise.reject(error);
          }
          
          // Handle retry logic for 5xx errors
          if (status >= 500 && error.config) {
            const url = error.config.url || '';
            const currentRetryCount = this.retryCount.get(url) || 0;
            
            if (currentRetryCount < MAX_RETRIES) {
              this.retryCount.set(url, currentRetryCount + 1);
              
              // Exponential backoff
              const delay = Math.pow(2, currentRetryCount) * 1000;
              
              return new Promise(resolve => {
                setTimeout(() => {
                  resolve(this.client(error.config!));
                }, delay);
              });
            }
            
            // Reset retry count if max retries reached
            this.retryCount.delete(url);
          }
        }
        
        // Development error logging
        if (process.env.NODE_ENV === 'development') {
          console.error('API Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generate unique request ID
  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  // Public API methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
```

## Data Fetching Hooks

We'll implement custom hooks using React Query to manage API data fetching, caching, and state:

```typescript
// Example data fetching hook for routes
export function useRoute(routeId: string) {
  return useQuery(
    ['route', routeId],
    () => apiClient.get(`/routes/${routeId}`),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    }
  );
}

// Example mutation hook for bookings
export function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation(
    (bookingData) => apiClient.post('/bookings', bookingData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings');
      },
    }
  );
}
```

## Websocket Integration (Future)

For real-time features, we'll implement WebSocket connections:

1. Bus location tracking
2. Booking updates
3. Notifications

The implementation will use the browser's WebSocket API with a reconnection strategy.
