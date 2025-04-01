import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginRequest, RegisterRequest, OperatorRegisterRequest, AuthResponse } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { User } from '@/types/user';
import { ApiResponse, ApiError } from '@/lib/api';
import { useEffect, useState } from 'react';

// Helper function to safely access localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true once the component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get current user profile
  const { data: profile, isLoading: isLoadingProfile, error } = useQuery<ApiResponse<User>, ApiError, User>({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: isClient && !!getToken(),
    retry: false,
    select: (data) => data.data,
    gcTime: 0,
    staleTime: 0
  });

  // Handle 401 errors
  useEffect(() => {
    if (error?.status === 401 && isClient) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
  }, [error, isClient]);

  // Login mutation
  const loginMutation = useMutation<ApiResponse<AuthResponse>, ApiError, LoginRequest>({
    mutationFn: async (loginData) => {
      console.log('Login request data:', loginData);
      try {
        const response = await authApi.login(loginData);
        console.log('Login response:', response);
        return response;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Login success, setting token:', data.data.token);
      if (isClient) {
        localStorage.setItem('token', data.data.token);
        queryClient.setQueryData(['profile'], data.data.user);
        
        // Use setTimeout to defer navigation until after React's commit phase
        setTimeout(() => {
          if (data.data.user.role === 'operator') {
            window.location.href = '/operator/dashboard';
          } else {
            window.location.href = '/commuter/dashboard';
          }
        }, 0);
        
        toast.success('Login successful!');
      }
    },
    onError: (error: ApiError) => {
      console.error('Login mutation error:', error);
      toast.error(error.message || 'Login failed');
    }
  });

  // Register mutation
  const registerMutation = useMutation<ApiResponse<AuthResponse>, ApiError, RegisterRequest>({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      if (isClient) {
        localStorage.setItem('token', data.data.token);
        queryClient.setQueryData(['profile'], data.data.user);
        
        // Use setTimeout to defer navigation until after React's commit phase
        setTimeout(() => {
          window.location.href = '/commuter/dashboard';
        }, 0);
        
        toast.success('Registration successful!');
      }
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Registration failed');
    }
  });

  // Register operator mutation
  const registerOperatorMutation = useMutation<ApiResponse<AuthResponse>, ApiError, OperatorRegisterRequest>({
    mutationFn: authApi.registerOperator,
    onSuccess: (data) => {
      if (isClient) {
        localStorage.setItem('token', data.data.token);
        queryClient.setQueryData(['profile'], data.data.user);
        
        // Use setTimeout to defer navigation until after React's commit phase
        setTimeout(() => {
          window.location.href = '/operator/dashboard';
        }, 0);
        
        toast.success('Operator registration successful!');
      }
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Operator registration failed');
    }
  });

  // Logout mutation
  const logoutMutation = useMutation<ApiResponse<void>, ApiError, void>({
    mutationFn: authApi.logout,
    onSuccess: () => {
      if (isClient) {
        localStorage.removeItem('token');
        queryClient.clear();
        
        // Use setTimeout to defer navigation until after React's commit phase
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 0);
        
        toast.success('Logged out successfully');
      }
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Logout failed');
    }
  });

  return {
    profile,
    isLoadingProfile,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerOperator: registerOperatorMutation.mutate,
    isRegisteringOperator: registerOperatorMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending
  };
};
