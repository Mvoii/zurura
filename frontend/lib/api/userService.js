import { apiClient } from './client';

/**
 * Get current user profile
 * @returns {Promise} User profile data
 */
export const getUserProfile = async () => {
  try {
    // Update to match API endpoint exactly: /me/profile
    return await apiClient.get('/me/profile');
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise} Updated profile data
 */
export const updateUserProfile = async (profileData) => {
  try {
    // Update to match API endpoint exactly: /me/profile
    return await apiClient.put('/me/profile', profileData);
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
};

/**
 * Upload profile photo
 * @param {File} photoFile - The photo file to upload
 * @returns {Promise} Response with URL to uploaded photo
 */
export const uploadProfilePhoto = async (photoFile) => {
  try {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    // Update to match API endpoint exactly: /me/profile/photo
    return await apiClient.post('/me/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  } catch (error) {
    console.error('Failed to upload profile photo:', error);
    throw error;
  }
};