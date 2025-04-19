"use client"

import { useState } from "react"
import { Building, Camera, Edit, Save, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export default function OperatorProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    companyName: "Acme Matatu Services",
    contactPerson: "John Operator",
    email: "info@acmematatu.com",
    phone: "0712 345 678",
    address: "123 Business Plaza, Nairobi",
    businessLicense: "BL-12345-2025",
    taxId: "TAX-67890-2025",
    description:
      "Operating matatu services in Nairobi since 2015, specializing in CBD to Westlands and Eastlands routes.",
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
          <h1 className="text-3xl font-bold">Company Profile</h1>
          <p className="text-muted-foreground">View and manage your company information</p>
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
            <CardTitle>Company Logo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-32 w-32">
                <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Company Logo" />
                <AvatarFallback className="text-4xl">AC</AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="secondary" size="icon" className="absolute bottom-0 right-0 rounded-full">
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <h3 className="mt-4 text-xl font-medium">Acme Matatu Services</h3>
            <p className="text-sm text-muted-foreground">Operator</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Tabs defaultValue="company" className="w-full">
            <TabsList>
              <TabsTrigger value="company">Company Information</TabsTrigger>
              <TabsTrigger value="business">Business Details</TabsTrigger>
              <TabsTrigger value="team">Team Members</TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Update your company details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={profileData.companyName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input
                      id="contactPerson"
                      name="contactPerson"
                      value={profileData.contactPerson}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
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
                    <Label htmlFor="address">Business Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={profileData.description}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="business">
              <Card>
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                  <CardDescription>Your business registration information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessLicense">Business License Number</Label>
                    <Input
                      id="businessLicense"
                      name="businessLicense"
                      value={profileData.businessLicense}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      name="taxId"
                      value={profileData.taxId}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Business Documents</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Business Registration Certificate</p>
                            <p className="text-xs text-muted-foreground">Uploaded on Jan 15, 2025</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>

                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Tax Compliance Certificate</p>
                            <p className="text-xs text-muted-foreground">Uploaded on Jan 15, 2025</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>

                      <div className="flex items-center justify-between rounded-md border p-3">
                        <div className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">NTSA Operating License</p>
                            <p className="text-xs text-muted-foreground">Uploaded on Jan 15, 2025</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>

                    {isEditing && (
                      <Button variant="outline" className="mt-2">
                        <Camera className="mr-2 h-4 w-4" />
                        Upload New Document
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your team members and their roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>JO</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">John Operator</p>
                          <p className="text-sm text-muted-foreground">Administrator</p>
                          <p className="text-xs text-muted-foreground">john@acmematatu.com</p>
                        </div>
                      </div>
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>SM</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Sarah Manager</p>
                          <p className="text-sm text-muted-foreground">Fleet Manager</p>
                          <p className="text-xs text-muted-foreground">sarah@acmematatu.com</p>
                        </div>
                      </div>
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>DA</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">David Accountant</p>
                          <p className="text-sm text-muted-foreground">Finance Manager</p>
                          <p className="text-xs text-muted-foreground">david@acmematatu.com</p>
                        </div>
                      </div>
                      {isEditing && (
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {isEditing && (
                    <Button className="w-full">
                      <User className="mr-2 h-4 w-4" />
                      Add Team Member
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

