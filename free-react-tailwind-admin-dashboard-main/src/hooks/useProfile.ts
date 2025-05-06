import { useContext } from 'react';
import ProfileContext from '../context/ProfileContext';
import { UserProfile, UpdateProfilePayload } from '../api/profileService';

// Operation result types (copied from ProfileContext for export)
export interface ProfileOperationResult {
  success: boolean;
  data?: UserProfile;
  error?: string;
}

export interface PhotoUploadOperationResult {
  success: boolean;
  data?: { message: string; url: string };
  error?: string;
}

// Define the hook's return type
export interface UseProfileReturn {
  // State
  profile: UserProfile | null;
  isLoadingProfile: boolean;
  isUpdatingProfile: boolean;
  isUploadingPhoto: boolean;
  error: string | null;
  
  // Methods
  fetchProfile: () => Promise<ProfileOperationResult>;
  updateUserProfile: (data: UpdateProfilePayload) => Promise<ProfileOperationResult>;
  uploadUserPhoto: (file: File) => Promise<PhotoUploadOperationResult>;
  clearProfileError: () => void;
}

/**
 * Custom hook to access profile functionality throughout the app
 * @returns Profile state and methods
 */
const useProfile = (): UseProfileReturn => {
  const context = useContext(ProfileContext);
  
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  
  return context;
};

export default useProfile;
