"use client";

import { useState, useEffect } from 'react';
import { useProfile } from '@/lib/hooks/useProfile';
import { UpdateProfileRequest } from '@/lib/api/profile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ProfileForm() {
  const { profile, isLoadingProfile, updateProfile, isUpdatingProfile, uploadPhoto, isUploadingPhoto } = useProfile();
  
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    first_name: '',
    last_name: '',
    phone_number: '',
    school_name: ''
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone_number: profile.phone_number || '',
        school_name: profile.school_name || ''
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only include fields that have changed
    const changedFields: UpdateProfileRequest = {};
    
    if (profile?.first_name !== formData.first_name && formData.first_name !== '') {
      changedFields.first_name = formData.first_name;
    }
    
    if (profile?.last_name !== formData.last_name && formData.last_name !== '') {
      changedFields.last_name = formData.last_name;
    }
    
    if (profile?.phone_number !== formData.phone_number && formData.phone_number !== '') {
      changedFields.phone_number = formData.phone_number;
    }
    
    if (profile?.school_name !== formData.school_name && formData.school_name !== '') {
      changedFields.school_name = formData.school_name;
    }
    
    // Only update if there are changes
    if (Object.keys(changedFields).length > 0) {
      updateProfile(changedFields);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPhoto(file);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="First Name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Last Name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              value={formData.phone_number || ''}
              onChange={handleChange}
              placeholder="Phone Number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="school_name">School Name</Label>
            <Input
              id="school_name"
              name="school_name"
              value={formData.school_name || ''}
              onChange={handleChange}
              placeholder="School Name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="profile_photo">Profile Photo</Label>
            <Input
              id="profile_photo"
              name="profile_photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={isUploadingPhoto}
            />
            {isUploadingPhoto && <Spinner size="sm" className="ml-2" />}
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isUpdatingProfile || isUploadingPhoto}
          >
            {isUpdatingProfile ? <Spinner size="sm" className="mr-2" /> : null}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
