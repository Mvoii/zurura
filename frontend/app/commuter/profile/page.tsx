"use client"

import { useState, useEffect, ChangeEvent, FormEvent } from 'react'
import { Camera, Edit, Save, User } from "lucide-react"
import { useForm, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useProfile } from '@/lib/hooks/useProfile'
import { ProfilePhotoUpload } from '@/components/ui/profile-upload'
import { Loader2 } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// Schema for form validation
const profileFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().optional(),
  school_name: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function CommuterProfilePage() {
  const { profile, isLoadingProfile, updateProfile, isUpdatingProfile } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined)
  
  // Create form with React Hook Form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      school_name: '',
    }
  })
  
  // Update form with profile data when it loads
  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number || '',
        school_name: profile.school_name || '',
      })
      setPhotoUrl(profile.profile_photo_url)
    }
  }, [profile, form])
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    updateProfile({
      [name]: value,
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    updateProfile({
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      phone_number: formData.get('phone') as string,
    })
  }

  // Handle form submission
  const onSubmit = (data: ProfileFormValues) => {
    updateProfile(data, {
      onSuccess: () => {
        toast.success('Profile updated successfully')
      }
    })
  }

  // Handle photo upload success
  const handlePhotoUploadSuccess = (url: string) => {
    setPhotoUrl(url)
  }

  if (isLoadingProfile) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">View and manage your personal information</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <Button type="submit" form="profile-form" disabled={isUpdatingProfile}>
            {isUpdatingProfile ? 'Updating...' : 'Save Changes'}
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {isEditing ? (
              <ProfilePhotoUpload 
                initialPhotoUrl={photoUrl}
                size="lg"
                onUploadSuccess={handlePhotoUploadSuccess}
              />
            ) : (
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={photoUrl || "/placeholder.svg?height=128&width=128"} alt="Profile" />
                  <AvatarFallback className="text-4xl">JD</AvatarFallback>
                </Avatar>
              </div>
            )}
            <h3 className="mt-4 text-xl font-medium">{profile?.first_name} {profile?.last_name}</h3>
            <p className="text-sm text-muted-foreground">Commuter</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList>
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }: { field: FieldValues }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }: { field: FieldValues }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }: { field: FieldValues }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Your phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="school_name"
                        render={({ field }: { field: FieldValues }) => (
                          <FormItem>
                            <FormLabel>School Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your school name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : 'Save Changes'}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent trips and bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">CBD to Westlands</p>
                          <p className="text-sm text-muted-foreground">Today, 9:30 AM</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">KES 70</p>
                        <p className="text-xs text-muted-foreground">M-Pesa</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Monthly Pass Purchase</p>
                          <p className="text-sm text-muted-foreground">Yesterday, 2:15 PM</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">KES 2,000</p>
                        <p className="text-xs text-muted-foreground">M-Pesa</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Eastlands to CBD</p>
                          <p className="text-sm text-muted-foreground">Yesterday, 8:45 AM</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">KES 50</p>
                        <p className="text-xs text-muted-foreground">QR Pass</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your app experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Favorite Routes</Label>
                    <div className="rounded-md border p-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <p className="font-medium">CBD to Westlands</p>
                        <Button variant="ghost" size="sm" disabled={!isEditing}>
                          Remove
                        </Button>
                      </div>
                      <div className="flex items-center justify-between border-b py-2">
                        <p className="font-medium">Westlands to CBD</p>
                        <Button variant="ghost" size="sm" disabled={!isEditing}>
                          Remove
                        </Button>
                      </div>
                      <div className="flex items-center justify-between border-b py-2">
                        <p className="font-medium">CBD to Rongai</p>
                        <Button variant="ghost" size="sm" disabled={!isEditing}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notification Preferences</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="font-medium">Booking Confirmations</p>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications for booking confirmations
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="booking-notifications"
                            className="h-4 w-4 rounded border-gray-300"
                            checked
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="font-medium">Payment Confirmations</p>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications for payment confirmations
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="payment-notifications"
                            className="h-4 w-4 rounded border-gray-300"
                            checked
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="font-medium">Matatu Arrival Alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when your matatu is arriving
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="arrival-notifications"
                            className="h-4 w-4 rounded border-gray-300"
                            checked
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="font-medium">Promotional Offers</p>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications about promotions and offers
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="promo-notifications"
                            className="h-4 w-4 rounded border-gray-300"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
