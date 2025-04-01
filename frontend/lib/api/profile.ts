import { api, ApiResponse } from '../api';
import { User } from '@/types/user';

// Types
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_photo_url?: string;
  school_name?: string;
}

// Profile API functions
export const profileApi = {
  // Get user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<User>('/me/profile');
    return {
      data: response.data,
      status: response.status,
    };
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<User>> => {
    const response = await api.put<User>('/me/profile', data);
    return {
      data: response.data,
      status: response.status,
    };
  },

  // Upload profile photo
  uploadPhoto: async (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post<{ url: string }>('/me/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      data: response.data,
      status: response.status,
    };
  },
};
