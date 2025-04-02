import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create the context with a default undefined value
const AuthContext = createContext(undefined);

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (storedToken && userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        // Clear potentially corrupted state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
      const response = await fetch('/a/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store auth data - use localStorage for persistent sessions, sessionStorage otherwise
      const storage = credentials.persistent ? localStorage : sessionStorage;
      
      storage.setItem('token', data.token);
      storage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      setToken(data.token);
      
      // Redirect based on user role
      if (data.user.role === 'operator') {
        navigate('/operator/dashboard');
      } else {
        navigate('/commuter/routes');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      if (token) {
        await fetch('/a/v1/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state regardless of API success
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
      setIsLoading(false);
      setError(null);
      navigate('/auth/login');
    }
  };

  // Register function
  const register = async (data, isOperator = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const endpoint = isOperator ? '/a/v1/auth/register/op' : '/a/v1/auth/register';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      const responseData = await response.json();
      
      // Store auth data
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('user', JSON.stringify(responseData.user));
      
      setUser(responseData.user);
      setToken(responseData.token);
      
      // Redirect based on user role
      if (responseData.user.role === 'operator') {
        navigate('/operator/dashboard');
      } else {
        navigate('/commuter/routes');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
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

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
