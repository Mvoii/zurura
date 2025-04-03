import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  loginUser, 
  registerUser, 
  registerOperator, 
  logoutUser 
} from '../api/authService';
import { getSecureItem } from '../utils/secureStorage';

// Create the context with a default undefined value
export const AuthContext = createContext(undefined);

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state from secure storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = getSecureItem('user');
        const storedToken = getSecureItem('auth-token');
        
        if (storedToken && storedUser) {
          setUser(storedUser);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use authService for login
      const response = await loginUser(credentials);
      
      // Update state
      setUser(response.user);
      setToken(response.token);
      
      // Redirect based on user role
      if (response.user.role === 'operator') {
        navigate('/operator/dashboard');
      } else {
        navigate('/commuter/routes');
      }
      
      return { success: true };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Use authService for logout
      await logoutUser();
      
      // Update state
      setUser(null);
      setToken(null);
      
      navigate('/auth/login');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear state even if API call fails
      setUser(null);
      setToken(null);
      navigate('/auth/login');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
      setError(null);
    }
  };

  // Register function
  const register = async (data, isOperator = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use authService for registration
      const response = isOperator 
        ? await registerOperator(data)
        : await registerUser(data);
      
      // Update state
      setUser(response.user);
      setToken(response.token);
      
      // Redirect based on user role
      if (response.user.role === 'operator') {
        navigate('/operator/dashboard');
      } else {
        navigate('/commuter/routes');
      }
      
      return { success: true };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Clear any authentication errors
  const clearError = () => {
    setError(null);
  };

  // Computed property to check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Context value
  const value = {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    register,
    clearError,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

