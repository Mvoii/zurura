import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileApi, UpdateProfileRequest } from '@/lib/api/profile';
import { toast } from 'sonner';
import { ApiError, ApiResponse } from '@/lib/api';
import { User } from '@/types/user';
import { useEffect, useState } from 'react';

// Helper function to safely access localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const useProfile = () => {
  const queryClient = useQueryClient();
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true once the component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Get user profile data
  const { 
    data: profile, 
    isLoading: isLoadingProfile,
    error
  } = useQuery<ApiResponse<User>, ApiError, User>({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
    enabled: isClient && !!getToken(),
    select: (data) => data.data,
    retry: 1,
    gcTime: 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Update profile mutation
  const updateProfileMutation = useMutation<ApiResponse<User>, ApiError, UpdateProfileRequest>({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      // Invalidate profile query to refetch with updated data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to update profile');
    }
  });

  // Upload profile photo mutation
  const uploadPhotoMutation = useMutation<ApiResponse<{ url: string }>, ApiError, File>({
    mutationFn: profileApi.uploadPhoto,
    onSuccess: (data) => {
      // Update the profile with the new photo URL
      if (profile) {
        updateProfileMutation.mutate({ 
          profile_photo_url: data.data.url 
        });
      }
      toast.success('Profile photo uploaded successfully');
    },
    onError: (error: ApiError) => {
      toast.error(error.message || 'Failed to upload photo');
    }
  });

  return {
    profile,
    isLoadingProfile,
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    uploadPhoto: uploadPhotoMutation.mutate,
    isUploadingPhoto: uploadPhotoMutation.isPending,
  };
};
