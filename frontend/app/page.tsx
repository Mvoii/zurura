"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Bus, Clock, CreditCard, MapPin, Shield, Star, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  const { profile, isLoadingProfile } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isLoadingProfile) return;

    // If user is logged in, redirect to the appropriate dashboard
    if (profile) {
      if (profile.role === 'operator') {
        router.push('/operator/dashboard');
      } else {
        router.push('/commuter/dashboard');
      }
    } else if (isClient && !localStorage.getItem('token')) {
      // If not logged in, redirect to login
      router.push('/auth/login');
    }
  }, [profile, isLoadingProfile, router, isClient]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

