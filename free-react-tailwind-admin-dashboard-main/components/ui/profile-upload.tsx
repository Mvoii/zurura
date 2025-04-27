"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/lib/hooks/useProfile';
import { Camera, Upload, Loader2 } from 'lucide-react';

interface ProfilePhotoUploadProps {
  initialPhotoUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  onUploadSuccess?: (url: string) => void;
}

export function ProfilePhotoUpload({ 
  initialPhotoUrl, 
  size = 'md', 
  onUploadSuccess 
}: ProfilePhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, isUploadingPhoto } = useProfile();
  
  // Size mappings
  const sizeMap = {
    sm: { container: 'h-20 w-20', text: 'text-xs' },
    md: { container: 'h-32 w-32', text: 'text-sm' },
    lg: { container: 'h-40 w-40', text: 'text-base' },
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, or GIF)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload the file
    uploadPhoto(file, {
      onSuccess: (response) => {
        if (onUploadSuccess && response.data.url) {
          onUploadSuccess(response.data.url);
        }
      }
    });
  };
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className={`relative ${sizeMap[size].container} rounded-full overflow-hidden bg-gray-100 cursor-pointer group`}
        onClick={handleClick}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Profile photo"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
            <Upload size={24} className="text-gray-400 mb-1" />
            <span className={`text-gray-500 text-center ${sizeMap[size].text}`}>
              Upload Photo
            </span>
          </div>
        )}
        
        {isUploadingPhoto && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <Loader2 className="animate-spin text-white" />
          </div>
        )}
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/gif"
        className="hidden"
      />
      
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={handleClick}
        disabled={isUploadingPhoto}
      >
        {isUploadingPhoto ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : preview ? 'Change Photo' : 'Upload Photo'}
      </Button>
    </div>
  );
} 