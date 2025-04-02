"use client"

import { useState } from "react"
import { Camera, Edit, Save, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export default function CommuterProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "0712 345 678",
    address: "123 Nairobi Way, Nairobi",
    emergencyContact: "Jane Doe - 0723 456 789",
    bio: "Regular commuter in Nairobi, mostly traveling between CBD and Westlands.",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      [name]: value,
    })
  }

  const handleSave = () => {
    // Save logic would go here
    setIsEditing(false)
  }

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
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Profile" />
                <AvatarFallback className="text-4xl">JD</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="secondary" size="icon" className="absolute bottom-0 right-0 rounded-full">
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <h3 className="mt-4 text-xl font-medium">John Doe</h3>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profileData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      value={profileData.emergencyContact}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={4}
                    />
                  </div>
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

