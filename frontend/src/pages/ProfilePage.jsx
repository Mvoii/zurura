import { useState, useEffect } from 'react';
import { useUser } from '../../lib/hooks/useUser';
import { useUserProfile } from '../../lib/hooks/useUserStore';
import { useAuth } from '../../lib/hooks/useAuth';
import ProfileInfoCard from '../components/profile/ProfileInfoCard';
import ProfilePhotoCard from '../components/profile/ProfilePhotoCard';
import ProfileAddressCard from '../components/profile/ProfileAddressCard';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  // Get user data from context
  const userContext = useUser();
  // Get user data from Zustand store
  const userStore = useUserProfile();
  // Get auth data
  const { user } = useAuth();
  
  const [notification, setNotification] = useState(null);
  
  // Determine which profile source to use (can use either or both)
  const profile = userStore.profile || userContext.profile;
  const isLoading = userStore.isLoading || userContext.isLoading;
  const error = userStore.error || userContext.error;
  
  // Load user profile on component mount
  useEffect(() => {
    // Fetch profile data if not already loaded
    if (!profile) {
      if (userStore.refreshProfile) {
        userStore.refreshProfile();
      }
      if (userContext.refreshProfile) {
        userContext.refreshProfile();
      }
    }
  }, [profile, userStore, userContext]);
  
  const showNotification = (type, message) => {
    setNotification({ type, message });
    // Auto-hide notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  };

  if (isLoading && !profile) {
    return (
      <div className="p-6">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      {notification && (
        <div className={`p-4 mb-6 rounded-lg flex items-center ${
          notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          <span>{notification.message}</span>
        </div>
      )}
      
      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 inline mr-2" />
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileInfoCard 
          profile={profile} 
          showNotification={showNotification} 
          updateProfile={userStore.updateProfile}
          isLoading={isLoading}
        />
        
        <ProfilePhotoCard 
          profile={profile} 
          showNotification={showNotification} 
          uploadPhoto={userStore.uploadPhoto}
          isLoading={isLoading}
        />
        
        {user?.role === 'operator' && (
          <ProfileAddressCard 
            profile={profile} 
            showNotification={showNotification} 
            updateProfile={userStore.updateProfile}
            isLoading={isLoading}
            className="col-span-1 md:col-span-2"
          />
        )}
      </div>
    </div>
  );
}