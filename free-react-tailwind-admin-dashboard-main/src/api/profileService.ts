import { apiClient } from './client';
import { 
  getCurrentUser, 
  storeAuthData, 
  getValidToken 
} from '../utils/token';
import axios from 'axios';

// Interface for the user profile data returned by the backend
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  profile_photo_url: string;
  school_name: string;
  ride_count: number;
  created_at: string;
  updated_at: string;
}

// Interface for updating user profile data
export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  school_name?: string;
}

// Interface for the response when uploading a profile photo
export interface ProfilePhotoUploadResponse {
  message: string;
  url: string;
}

/**
 * Fetches the current user's profile.
 * @returns {Promise<UserProfile>} The user profile data.
 */
export const getProfile = async (): Promise<UserProfile> => {
  try {
    // apiClient.get already returns the parsed data directly
    return await apiClient.get<UserProfile>('/me/profile');
  } catch (error: unknown) {
    console.error('Get profile error:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred while fetching the profile.');
  }
};

/**
 * Updates the current user's profile.
 * @param {UpdateProfilePayload} profileData - The data to update.
 * @returns {Promise<UserProfile>} The updated user profile data.
 */
export const updateProfile = async (profileData: UpdateProfilePayload): Promise<UserProfile> => {
  try {
    // apiClient.put already returns the parsed data directly
    const updatedUserProfile = await apiClient.put<UserProfile>('/me/profile', profileData as Record<string, unknown>);

    // Update the stored user data locally if the update was successful
    const currentUser = getCurrentUser();
    const currentToken = getValidToken();

    if (currentUser && currentToken) {
      const newStoredUser = {
        ...currentUser,
        first_name: updatedUserProfile.first_name,
        last_name: updatedUserProfile.last_name,
        school_name: updatedUserProfile.school_name,
      };
      storeAuthData(currentToken, newStoredUser);
    }
    
    return updatedUserProfile;
  } catch (error: unknown) {
    console.error('Update profile error:', error instanceof Error ? error.message : 'Unknown error');
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred while updating the profile.');
  }
};

/**
 * Uploads a new profile photo for the current user.
 * @param {File} photoFile - The image file to upload.
 * @returns {Promise<ProfilePhotoUploadResponse>} The response containing the new photo URL.
 */
export const uploadProfilePhoto = async (photoFile: File): Promise<ProfilePhotoUploadResponse> => {
  try {
    const formData = new FormData();
    formData.append('photo', photoFile);

    // Using axios directly for FormData, to avoid type constraints in apiClient.post
    const response = await axios.post(
      `${apiClient.baseURL}/me/profile/photo`, 
      formData,
      {
        headers: {
          ...apiClient.getHeadersWithToken(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error: unknown) {
    console.error('Upload profile photo error:', error instanceof Error ? error.message : 'Unknown error');
    
    // Re-use apiClient's error handling if possible
    if (apiClient.handleError) {
      throw apiClient.handleError(error);
    }
    
    throw error instanceof Error 
      ? error 
      : new Error('An unexpected error occurred while uploading the profile photo.');
  }
};