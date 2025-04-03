import { create } from 'zustand';
import { getUserProfile, updateUserProfile, uploadProfilePhoto } from '../api/userService';

const useUserStore = create((set, get) => ({
  // State
  profile: null,
  isLoading: false,
  error: null,
  
  // Actions
  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getUserProfile();
      set({ profile: data, isLoading: false });
      return { success: true, data };
    } catch (error) {
      set({ 
        error: error.message || 'Failed to load profile',
        isLoading: false 
      });
      return { success: false, error: error.message };
    }
  },
  
  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProfile = await updateUserProfile(profileData);
      set({ profile: updatedProfile, isLoading: false });
      return { success: true, data: updatedProfile };
    } catch (error) {
      set({ 
        error: error.message || 'Failed to update profile',
        isLoading: false 
      });
      return { success: false, error: error.message };
    }
  },
  
  uploadPhoto: async (photoFile) => {
    set({ isLoading: true, error: null });
    try {
      const response = await uploadProfilePhoto(photoFile);
      // Update just the photo URL in the existing profile
      set(state => ({ 
        profile: { ...state.profile, profile_photo: response.profile_photo },
        isLoading: false 
      }));
      return { success: true, photoUrl: response.profile_photo };
    } catch (error) {
      set({ 
        error: error.message || 'Failed to upload photo',
        isLoading: false 
      });
      return { success: false, error: error.message };
    }
  },
  
  clearProfile: () => set({ profile: null, error: null }),
  clearError: () => set({ error: null })
}));

export default useUserStore;