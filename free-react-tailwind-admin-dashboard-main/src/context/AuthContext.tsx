import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  loginUser, 
  registerUser, 
  registerOperator, 
  logoutUser,
  getCurrentUser,
  isAuthenticated as checkIsAuthenticated,
  isOperator as checkIsOperator,
  isDriver as checkIsDriver,
  isCommuter as checkIsCommuter,
  hasRole as checkHasRole,
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  OperatorRegisterRequest 
} from '../api/authService';
import { getValidToken } from '../utils/token';

// Auth result type
interface AuthResult {
  success: boolean;
  error?: string;
}

// Define the context shape
interface AuthContextType {
  user: AuthResponse['user'] | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isOperator: boolean;
  isDriver: boolean;
  isCommuter: boolean;
  hasRole: (role: string) => boolean;
  login: (credentials: LoginRequest) => Promise<AuthResult>;
  register: (data: RegisterRequest) => Promise<AuthResult>;
  registerAsOperator: (data: OperatorRegisterRequest) => Promise<AuthResult>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create the context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the application and makes auth available
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const initializeAuth = (): void => {
      try {
        // Check for existing user in storage
        const currentUser = getCurrentUser();
        const isAuth = checkIsAuthenticated();
        
        if (currentUser && isAuth) {
          setUser(currentUser as AuthResponse['user']);
          setToken(getValidToken()); // Safe to use direct access here
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login a user with email and password
   */
  const login = async (credentials: LoginRequest): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await loginUser(credentials);
      
      setUser(response.user);
      setToken(response.token);
      
      // Redirect based on role
      if (response.user.role === 'operator') {
        navigate('/operator/dashboard');
      } else if (response.user.role === 'driver') {
        navigate('/driver/dashboard');
      } else {
        navigate('/dashboard');
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new commuter user
   */
  const register = async (data: RegisterRequest): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await registerUser(data);
      
      setUser(response.user);
      setToken(response.token);
      
      navigate('/dashboard');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new operator
   */
  const registerAsOperator = async (data: OperatorRegisterRequest): Promise<AuthResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await registerOperator(data);
      
      setUser(response.user);
      setToken(response.token);
      
      navigate('/operator/dashboard');
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operator registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout the current user
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear state regardless of API call result
      setUser(null);
      setToken(null);
      setIsLoading(false);
      navigate('/auth/signin'); // Changed from '/auth/login' to '/auth/signin'
    }
  };

  /**
   * Clear any authentication errors
   */
  const clearError = (): void => {
    setError(null);
  };

  // The value to be provided to consumers
  const contextValue: AuthContextType = {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: checkIsAuthenticated(),
    isOperator: checkIsOperator(),
    isDriver: checkIsDriver(),
    isCommuter: checkIsCommuter(),
    hasRole: checkHasRole,
    login,
    register,
    registerAsOperator,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 */
export default AuthContext;