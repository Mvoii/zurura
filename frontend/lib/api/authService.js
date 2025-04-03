import { apiClient } from './client';
import { setSecureItem, removeSecureItem, clearSecureStorage } from '../utils/secureStorage';

/**
 * Login user with email and password
 * @param {Object} credentials - User login credentials
 * @returns {Promise} Response with token and user data
 */
export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    
    if (response.error) {
      throw new Error(response.message || 'Login failed');
    }
    
    // Store token securely
    setSecureItem('auth-token', response.token);
    
    // Store user data
    setSecureItem('user', response.user);
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Register a new commuter
 * @param {Object} userData - User registration data
 * @returns {Promise} Response with token and user data
 */
export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    
    if (response.error) {
      throw new Error(response.message || 'Registration failed');
    }
    
    // Store token securely
    setSecureItem('auth-token', response.token);
    
    // Store user data
    setSecureItem('user', response.user);
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Register a new operator
 * @param {Object} operatorData - Operator registration data
 * @returns {Promise} Response with token and user data
 */
export const registerOperator = async (operatorData) => {
  try {
    const response = await apiClient.post('/auth/register/op', operatorData);
    
    if (response.error) {
      throw new Error(response.message || 'Operator registration failed');
    }
    
    // Store token securely
    setSecureItem('auth-token', response.token);
    
    // Store user data
    setSecureItem('user', response.user);
    
    return response;
  } catch (error) {
    console.error('Operator registration error:', error);
    throw error;
  }
};

/**
 * Logout user
 * @returns {Promise} Response indicating logout success
 */
export const logoutUser = async () => {
  try {
    // Call the API endpoint to invalidate token server-side
    const response = await apiClient.post('/auth/logout');
    
    // Clear secure storage regardless of response
    removeSecureItem('auth-token');
    removeSecureItem('user');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still clear secure storage even if API call fails
    removeSecureItem('auth-token');
    removeSecureItem('user');
    
    throw error;
  }
};

/**
 * Verify if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  const token = apiClient.getToken();
  return !!token;
};