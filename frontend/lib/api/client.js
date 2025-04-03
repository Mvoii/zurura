import axios from 'axios';
import { getSecureItem, removeSecureItem } from '../utils/secureStorage';

export const apiClient = {
  // Base API URL
  baseURL: 'http://localhost:8080/a/v1',

  // Default headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  // Get token with JWT decoding to check expiration
  getToken() {
    try {
      const token = getSecureItem('auth-token');
      if (!token) return null;
      
      // Check if token is expired
      if (this.isTokenExpired(token)) {
        // If token is expired, remove it
        removeSecureItem('auth-token');
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },
  
  // Check if token is expired
  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() >= expiry;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Consider token expired if we can't verify
    }
  },

  // Add auth header to requests
  getHeadersWithToken() {
    const token = this.getToken();
    if (token) {
      return {
        ...this.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return this.headers;
  },

  // GET request
  async get(url, params = {}) {
    try {
      const response = await axios.get(`${this.baseURL}${url}`, {
        params,
        headers: this.getHeadersWithToken(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  },

  // POST request
  async post(url, data = {}) {
    try {
      const response = await axios.post(`${this.baseURL}${url}`, data, {
        headers: this.getHeadersWithToken(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  },

  // PUT request
  async put(url, data = {}) {
    try {
      const response = await axios.put(`${this.baseURL}${url}`, data, {
        headers: this.getHeadersWithToken(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  },

  // DELETE request
  async delete(url) {
    try {
      const response = await axios.delete(`${this.baseURL}${url}`, {
        headers: this.getHeadersWithToken(),
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  },

  // Standard error handling
  handleError(error) {
    console.error('API Error:', error);
    
    if (error.response) {
      // Handle 401 unauthorized errors (expired token)
      if (error.response.status === 401) {
        removeSecureItem('auth-token');
        removeSecureItem('user');
        
        // If not on login page, redirect
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
      }
      
      return {
        error: true,
        status: error.response.status,
        message: error.response.data?.error || 'Server error',
        data: null
      };
    } else if (error.request) {
      return {
        error: true, 
        status: 0,
        message: 'No response from server. Check your connection.',
        data: null
      };
    } else {
      return {
        error: true,
        status: 0,
        message: error.message || 'Error setting up request',
        data: null
      };
    }
  }
};