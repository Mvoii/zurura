"use client";

import { ProfileForm } from "@/components/ProfileForm";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { profile, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (isClient && !localStorage.getItem('token') && !isLoadingProfile) {
      router.push('/auth/login');
    }
  }, [isClient, isLoadingProfile, router]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">My Profile</h1>
      <ProfileForm />
    </div>
  );
}
