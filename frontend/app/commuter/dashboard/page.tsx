"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function CommuterDashboard() {
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

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Welcome, {profile?.first_name || 'Commuter'}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View and update your profile information.</p>
            <Link href="/profile">
              <Button>View Profile</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Find Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Search for available bus routes.</p>
            <Button variant="outline">Search Routes</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>My Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View your active and past bookings.</p>
            <Button variant="outline">View Bookings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 