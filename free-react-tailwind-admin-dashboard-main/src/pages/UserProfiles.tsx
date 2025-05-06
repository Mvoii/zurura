import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import PageMeta from "../components/common/PageMeta";
import useProfile from "../hooks/useProfile";
import useAuth from "../hooks/useAuth";

export default function UserProfiles() {
  const { user } = useAuth();
  const { 
    profile, 
    isLoadingProfile, 
    isUpdatingProfile,
    isUploadingPhoto,
    error,
    updateUserProfile,
    uploadUserPhoto,
    clearProfileError
  } = useProfile();

  return (
    <>
      <PageMeta
        title="Profile | Zurura"
        description="Manage your Zurura profile information"
      />
      <PageBreadcrumb pageTitle="Profile" />

      {/* Loading state */}
      {isLoadingProfile ? (
        <div className="p-8 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          {/* Error state */}
          {error && (
            <div className="p-6 text-center text-red-500 mb-4">
              <p>{error}</p>
              <button 
                className="mt-4 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                onClick={clearProfileError}
              >
                Dismiss
              </button>
            </div>
          )}

          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
            Profile
          </h3>
          <div className="space-y-6">
            <UserMetaCard 
              role={user?.role || 'user'}
              profile={profile}
              isUploading={isUploadingPhoto}
              uploadPhoto={uploadUserPhoto}
              updateProfile={updateUserProfile}
              isUpdating={isUpdatingProfile}
            />
            
            <UserInfoCard 
              profile={profile}
              updateProfile={updateUserProfile}
              isUpdating={isUpdatingProfile}
            />
            
            {/* Address card removed since backend doesn't support address fields */}
          </div>
        </div>
      )}
    </>
  );
}
