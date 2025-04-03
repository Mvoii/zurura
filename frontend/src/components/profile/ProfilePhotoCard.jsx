import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

export default function ProfilePhotoCard({ profile, showNotification, uploadPhoto, isLoading }) {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // File validation
    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      showNotification('error', 'Image size should be less than 5MB');
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
    
    // Upload the file
    try {
      const result = await uploadPhoto(file);
      
      if (result.success) {
        showNotification('success', 'Profile photo updated successfully');
      } else {
        setPreviewUrl(null); // Reset preview on error
        showNotification('error', result.error || 'Failed to upload photo');
      }
    } catch (error) {
      setPreviewUrl(null);
      showNotification('error', error.message || 'An unexpected error occurred');
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Use preview URL if available, otherwise use profile photo or default avatar
  const photoUrl = previewUrl || profile?.profile_photo || '/images/default-avatar.png';
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>
        
        <div className="flex flex-col items-center">
          <div className="relative">
            <img 
              src={photoUrl} 
              alt="Profile" 
              className="h-32 w-32 rounded-full object-cover border-2 border-gray-200"
            />
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <button
            onClick={triggerFileInput}
            disabled={isLoading}
            className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isLoading ? 'Uploading...' : 'Change Photo'}
          </button>
          
          <p className="mt-2 text-xs text-gray-500">
            Recommended: Square image, max 5MB
          </p>
        </div>
      </div>
    </div>
  );
}