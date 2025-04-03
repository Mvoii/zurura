import { createContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  getUserProfile, 
  updateUserProfile, 
  uploadProfilePhoto 
} from '../api/userService';

export const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  
  // Load user profile when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadUserProfile();
    } else {
      // Clear profile when user logs out
      setProfile(null);
    }
  }, [isAuthenticated]);
  
  const loadUserProfile = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const profileData = await getUserProfile();
      setProfile(profileData);
    } catch (error) {
      setError(error.message || 'Failed to load profile');
      console.error('Profile loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateProfile = async (profileData) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedProfile = await updateUserProfile(profileData);
      setProfile(updatedProfile);
      return { success: true, data: updatedProfile };
    } catch (error) {
      setError(error.message || 'Failed to update profile');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  const uploadPhoto = async (photoFile) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await uploadProfilePhoto(photoFile);
      // API returns { profile_photo: "url_to_photo" }
      setProfile(prev => ({ ...prev, profile_photo: response.profile_photo }));
      return { success: true, photoUrl: response.profile_photo };
    } catch (error) {
      setError(error.message || 'Failed to upload photo');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearError = () => setError(null);
  
  return (
    <UserContext.Provider value={{
      profile,
      isLoading,
      error,
      updateProfile,
      uploadPhoto,
      refreshProfile: loadUserProfile,
      clearError
    }}>
      {children}
    </UserContext.Provider>
  );
}