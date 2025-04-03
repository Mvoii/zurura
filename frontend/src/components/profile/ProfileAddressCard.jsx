import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit2 } from 'lucide-react';

// Form validation schema for company details
const addressSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  phone_number: z.string().optional(),
});

export default function ProfileAddressCard({ profile, showNotification, updateProfile, isLoading, className = '' }) {
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      company: profile?.company || '',
      address: profile?.address || '',
      city: profile?.city || '',
      phone_number: profile?.phone_number || '',
    }
  });
  
  // Update form values when profile changes
  useEffect(() => {
    if (profile) {
      reset({
        company: profile.company || '',
        address: profile.address || '',
        city: profile.city || '',
        phone_number: profile.phone_number || '',
      });
    }
  }, [profile, reset]);
  
  const onSubmit = async (data) => {
    try {
      const result = await updateProfile(data);
      
      if (result.success) {
        showNotification('success', 'Company information updated successfully');
        setIsEditing(false);
      } else {
        showNotification('error', result.error || 'Failed to update company information');
      }
    } catch (error) {
      showNotification('error', error.message || 'An unexpected error occurred');
    }
  };
  
  const handleCancel = () => {
    reset({
      company: profile?.company || '',
      address: profile?.address || '',
      city: profile?.city || '',
      phone_number: profile?.phone_number || '',
    });
    setIsEditing(false);
  };
  
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Company Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </button>
          )}
        </div>
        
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  id="company"
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none
                    ${errors.company ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
                  {...register('company')}
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone_number"
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  {...register('phone_number')}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                id="address"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                {...register('address')}
              />
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                id="city"
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                {...register('city')}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500">Company</p>
              <p className="mt-1">{profile?.company || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone Number</p>
              <p className="mt-1">{profile?.phone_number || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="mt-1">{profile?.address || '-'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">City</p>
              <p className="mt-1">{profile?.city || '-'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}