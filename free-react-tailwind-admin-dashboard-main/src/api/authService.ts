import { apiClient } from './client';
import { 
  storeAuthData, 
  clearAuthData, 
  getCurrentUser,
  isAuthenticated,
  hasRole,
  isOperator,
  isDriver,
  isCommuter,
  getValidToken
} from '../utils/token';

// Type definitions matching the backend exactly
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

// Define valid user roles
export type UserRole = 'commuter' | 'operator' | 'driver' | 'admin' | 'user';

// Match the response structure from the backend
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role?: UserRole;
    school_name?: string;
  };
}

/**
 * Validates auth response from the server
 * @param response - The response to validate
 * @throws Error if response is invalid
 */
function validateAuthResponse(response: unknown): asserts response is AuthResponse {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response format');
  }
  
  const obj = response as Record<string, unknown>;
  
  if (typeof obj.token !== 'string' || obj.token.length < 10) {
    throw new Error('Invalid token in response');
  }
  
  if (!obj.user || typeof obj.user !== 'object') {
    throw new Error('Invalid user data in response');
  }
  
  const user = obj.user as Record<string, unknown>;
  
  if (!user.id || !user.email) {
    throw new Error('Missing required user fields');
  }
}

/**
 * Login user with email and password
 * @param credentials - User login credentials
 * @returns Response with token and user data
 */
export const loginUser = async (credentials: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', { ...credentials });
    
    // Validate the response
    validateAuthResponse(response);
    
    // Store token and user data using the centralized utility
    storeAuthData(response.token, response.user);
    
    return response;
  } catch (error: unknown) {
    console.error('Login error:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred during login');
  }
};

/**
 * Register a new commuter
 * @param userData - User registration data
 * @returns Response with token and user data
 */
export const registerUser = async (userData: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', { ...userData });
    
    // Validate the response
    validateAuthResponse(response);
    
    // Store token and user data using the centralized utility
    storeAuthData(response.token, response.user);
    
    return response;
  } catch (error: unknown) {
    console.error('Registration error:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred during registration');
  }
};

/**
 * Register a new operator
 * @param operatorData - Operator registration data
 * @returns Response with token and user data
 */
export const registerOperator = async (operatorData: OperatorRegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register/op', { ...operatorData });
    
    // Validate the response
    validateAuthResponse(response);
    
    // Store token and user data using the centralized utility
    storeAuthData(response.token, response.user);
    
    return response;
  } catch (error: unknown) {
    console.error('Operator registration error:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred during operator registration');
  }
};

/**
 * Logout user - blacklists the current token
 * @returns Promise that resolves when logout is complete
 */
export const logoutUser = async (): Promise<void> => {
  try {
    // The backend requires the token to blacklist it
    if (isAuthenticated()) {
      // The token is automatically included in the Authorization header
      await apiClient.post('/auth/logout', {});
    }
  } catch (error: unknown) {
    console.error('Logout error:', error instanceof Error ? error.message : 'Unknown error');
  } finally {
    // Clear all auth data using the centralized utility
    clearAuthData();
  }
};

// Export the imported auth utilities to maintain API compatibility
export {
  isAuthenticated,
  getCurrentUser,
  hasRole,
  isOperator,
  isDriver,
  isCommuter
};

/**
 * Update user profile
 * @param userData - User profile data to update
 * @returns Updated user data
 */
export const updateProfile = async (userData: Partial<AuthResponse['user']>): Promise<AuthResponse['user']> => {
  try {
    const response = await apiClient.put<{user: AuthResponse['user']}>('/auth/profile', userData);
    
    if (!response || !response.user) {
      throw new Error('Invalid response from server');
    }
    
    // Update stored user data
    const currentUser = getCurrentUser();
    if (currentUser) {
      const updatedUser = {...currentUser, ...response.user};
      
      // Get the current token (if authenticated) and use it with the updated user
      const currentToken = getValidToken();
      if (currentToken) {
        storeAuthData(currentToken, updatedUser);
      }
    }
    
    return response.user;
  } catch (error: unknown) {
    console.error('Profile update error:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred during profile update');
  }
};

/**
 * Change password (when user is logged in)
 * @param currentPassword - Current password
 * @param newPassword - New password
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  try {
    if (!currentPassword || !newPassword) {
      throw new Error('Current and new passwords are required');
    }
    
    await apiClient.post('/auth/password/change', { 
      current_password: currentPassword,
      new_password: newPassword
    });
  } catch (error: unknown) {
    console.error('Password change error:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred during password change');
  }
};