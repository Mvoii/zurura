import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  getProfile, 
  updateProfile, 
  uploadProfilePhoto,
  UserProfile,
  UpdateProfilePayload,
  ProfilePhotoUploadResponse
} from '../api/profileService';
// import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Operation result types
interface ProfileOperationResult {
  success: boolean;
  data?: UserProfile;
  error?: string;
}

interface PhotoUploadOperationResult {
  success: boolean;
  data?: ProfilePhotoUploadResponse;
  error?: string;
}

// Define the context shape
interface ProfileContextType {
  profile: UserProfile | null;
  isLoadingProfile: boolean;
  isUpdatingProfile: boolean;
  isUploadingPhoto: boolean;
  error: string | null;
  
  fetchProfile: () => Promise<ProfileOperationResult>;
  updateUserProfile: (data: UpdateProfilePayload) => Promise<ProfileOperationResult>;
  uploadUserPhoto: (file: File) => Promise<PhotoUploadOperationResult>;
  clearProfileError: () => void;
}

// Create the context with undefined default
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Props for the provider
interface ProfileProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps the application and makes profile management available
 */
export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated } = useAuth();
//   const navigate = useNavigate();

  /**
   * Fetch user profile data
   */
  const fetchProfile = useCallback(async (): Promise<ProfileOperationResult> => {
    // Don't attempt to fetch if not authenticated
    if (!isAuthenticated) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoadingProfile(true);
    setError(null);
    
    try {
      const profileData = await getProfile();
      setProfile(profileData);
      setError(null); // Clear error on successful fetch
      return { success: true, data: profileData };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
      console.error('Profile fetch error:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoadingProfile(false);
    }
  }, [isAuthenticated]);

  /**
   * Update user profile data
   */
  const updateUserProfile = useCallback(async (profileData: UpdateProfilePayload): Promise<ProfileOperationResult> => {
    // Don't attempt to update if not authenticated
    if (!isAuthenticated) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsUpdatingProfile(true);
    setError(null);
    
    try {
      const updatedProfile = await updateProfile(profileData);
      setProfile(updatedProfile);
      setError(null); // Clear error on successful update
      return { success: true, data: updatedProfile };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      console.error('Profile update error:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdatingProfile(false);
    }
  }, [isAuthenticated]);

  /**
   * Upload a new profile photo
   */
  const uploadUserPhoto = useCallback(async (file: File): Promise<PhotoUploadOperationResult> => {
    // Don't attempt to upload if not authenticated
    if (!isAuthenticated) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsUploadingPhoto(true);
    setError(null);
    
    try {
      // First upload the photo to get the URL
      const uploadResponse = await uploadProfilePhoto(file);
      
      // Then update the profile to ensure we have the latest data
      // This ensures all components using profile data will have the updated photo URL
      await fetchProfile(); // This will set the profile and also clear error on its own success
      
      return { success: true, data: uploadResponse };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload profile photo';
      console.error('Photo upload error:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploadingPhoto(false);
    }
  }, [isAuthenticated, fetchProfile]);

  /**
   * Clear any profile errors
   */
  const clearProfileError = useCallback((): void => {
    setError(null);
  }, []);

  // Load profile on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      // Clear profile if not authenticated
      setProfile(null);
    }
  }, [isAuthenticated, fetchProfile]);

  // The value to be provided to consumers
  const contextValue: ProfileContextType = {
    profile,
    isLoadingProfile,
    isUpdatingProfile,
    isUploadingPhoto,
    error,
    fetchProfile,
    updateUserProfile,
    uploadUserPhoto,
    clearProfileError
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;