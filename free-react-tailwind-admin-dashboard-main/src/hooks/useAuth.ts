import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import type { AuthResponse, LoginRequest, RegisterRequest, OperatorRegisterRequest } from '../api/authService';

/**
 * Type definitions for the hook return value
 */
export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface UseAuthReturn {
  // Current state
  user: AuthResponse['user'] | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Role checking
  isOperator: boolean;
  isDriver: boolean;
  isCommuter: boolean;
  hasRole: (role: string) => boolean;
  
  // Authentication methods
  login: (credentials: LoginRequest) => Promise<AuthResult>;
  register: (data: RegisterRequest) => Promise<AuthResult>;
  registerAsOperator: (data: OperatorRegisterRequest) => Promise<AuthResult>;
  logout: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook to access authentication functionality throughout the app
 * @returns Authentication state and methods
 */
const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;