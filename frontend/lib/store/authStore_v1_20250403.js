import { create } from 'zustand';
import { loginUser, registerUser, registerOperator, logoutUser } from '../lib/api/authService';
import { getSecureItem } from '../lib/utils/secureStorage';

const useAuthStore = create((set) => ({
  user: getSecureItem('user'),
  token: getSecureItem('auth-token'),
  isAuthenticated: !!getSecureItem('auth-token'),
  isLoading: false,
  error: null,
  
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await loginUser(credentials);
      set({ 
        user: response.user, 
        token: response.token, 
        isAuthenticated: true,
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      set({ 
        error: error.message || 'Login failed', 
        isLoading: false 
      });
      return { success: false, error: error.message };
    }
  },
  
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await registerUser(userData);
      set({ 
        user: response.user, 
        token: response.token, 
        isAuthenticated: true,
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      set({ 
        error: error.message || 'Registration failed', 
        isLoading: false 
      });
      return { success: false, error: error.message };
    }
  },
  
  registerOperator: async (operatorData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await registerOperator(operatorData);
      set({ 
        user: response.user, 
        token: response.token, 
        isAuthenticated: true,
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      set({ 
        error: error.message || 'Operator registration failed', 
        isLoading: false 
      });
      return { success: false, error: error.message };
    }
  },
  
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await logoutUser();
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false,
        isLoading: false 
      });
      return { success: true };
    } catch (error) {
      set({ 
        error: error.message || 'Logout failed', 
        isLoading: false
      });
      // Even if there's an error, we should reset auth state
      set({ 
        user: null, 
        token: null, 
        isAuthenticated: false
      });
      return { success: false, error: error.message };
    }
  },
  
  clearError: () => set({ error: null })
}));

export default useAuthStore;