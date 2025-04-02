/**
 * Authentication API service
 */
import { clearAuthData, storeAuthData } from '../utils/token';

const API_BASE_URL = '/a/v1';

/**
 * Login a user
 * @param {Object} credentials - Email and password
 * @returns {Promise<Object>} User data and token
 */
export async function loginUser(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store the auth data
    storeAuthData(data.token, data.user);
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {boolean} isOperator - Whether this is an operator registration
 * @returns {Promise<Object>} User data and token
 */
export async function registerUser(userData, isOperator = false) {
  try {
    const endpoint = isOperator ? '/auth/register/op' : '/auth/register';
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const data = await response.json();
    
    // Store the auth data
    storeAuthData(data.token, data.user);
    
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Logout a user
 * @param {string} token - The JWT token
 * @returns {Promise<void>}
 */
export async function logoutUser(token) {
  try {
    if (!token) {
      // Just clear local auth data if no token
      clearAuthData();
      return;
    }
    
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    // Clear auth data regardless of server response
    clearAuthData();
  } catch (error) {
    console.error('Logout error:', error);
    // Clear auth data even if server request fails
    clearAuthData();
    throw error;
  }
}

/**
 * Check if a token is valid with the server
 * @param {string} token - The JWT token to validate
 * @returns {Promise<boolean>}
 */
export async function validateToken(token) {
  try {
    if (!token) return false;
    
    // We'll use the profile endpoint to check token validity
    const response = await fetch(`${API_BASE_URL}/me/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
}
