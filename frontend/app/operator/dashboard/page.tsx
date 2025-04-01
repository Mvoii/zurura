"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function OperatorDashboard() {
  const { profile, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Redirect to login if not authenticated or not an operator
  useEffect(() => {
    if (!isLoadingProfile && isClient) {
      if (!localStorage.getItem('token')) {
        router.push('/auth/login');
      } else if (profile && profile.role !== 'operator') {
        router.push('/commuter/dashboard');
      }
    }
  }, [isLoadingProfile, profile, router, isClient]);

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Welcome, Operator {profile?.first_name || ''}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Operator Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View and update your operator information.</p>
            <Link href="/profile">
              <Button>View Profile</Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Manage Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create and manage your bus routes.</p>
            <Button variant="outline">Manage Routes</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Manage Buses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Add and manage your bus fleet.</p>
            <Button variant="outline">Manage Buses</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View and manage all bookings for your buses.</p>
            <Button variant="outline">View Bookings</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create and manage bus schedules.</p>
            <Button variant="outline">Manage Schedules</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">View performance analytics and reports.</p>
            <Button variant="outline">View Analytics</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 