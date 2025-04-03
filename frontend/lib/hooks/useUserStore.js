import useUserStore from '../store/userStore';

export function useUserProfile() {
  const { 
    profile, 
    isLoading, 
    error, 
    fetchProfile, 
    updateProfile, 
    uploadPhoto,
    clearError 
  } = useUserStore();

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    uploadPhoto,
    refreshProfile: fetchProfile,
    clearError
  };
}