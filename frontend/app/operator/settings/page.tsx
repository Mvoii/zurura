"use client"

import { useState } from "react"
import { Bell, Moon, Save, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OperatorSettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [autoAssignDrivers, setAutoAssignDrivers] = useState(false)
  const [dataSharing, setDataSharing] = useState(true)

  const handleSaveSettings = () => {
    // Save settings logic would go here
    alert("Settings saved successfully!")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your operator account settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="billing">Billing & Payments</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your general preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    id="dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                    className="data-[state=checked]:bg-zurura-500"
                  />
                  <Moon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="language">Language</Label>
                  <p className="text-sm text-muted-foreground">Select your preferred language</p>
                </div>
                <select
                  id="language"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="en">English</option>
                  <option value="sw">Swahili</option>
                </select>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="timezone">Timezone</Label>
                  <p className="text-sm text-muted-foreground">Select your timezone</p>
                </div>
                <select
                  id="timezone"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="africa/nairobi">Africa/Nairobi (EAT)</option>
                  <option value="utc">UTC</option>
                </select>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="currency">Currency</Label>
                  <p className="text-sm text-muted-foreground">Select your preferred currency</p>
                </div>
                <select
                  id="currency"
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="kes">KES (Kenyan Shilling)</option>
                  <option value="usd">USD (US Dollar)</option>
                </select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications about your business operations</p>
                </div>
                <Switch
                  id="notifications-enabled"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                  className="data-[state=checked]:bg-zurura-500"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notification Channels</h3>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    disabled={!notificationsEnabled}
                    className="data-[state=checked]:bg-zurura-500"
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                    disabled={!notificationsEnabled}
                    className="data-[state=checked]:bg-zurura-500"
                  />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications on your device</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                    disabled={!notificationsEnabled}
                    className="data-[state=checked]:bg-zurura-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium">Notification Types</h3>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="booking-notifications"
                      className="h-4 w-4 rounded border-gray-300 text-zurura-500 focus:ring-zurura-500"
                      checked
                      disabled={!notificationsEnabled}
                    />
                    <Label htmlFor="booking-notifications">Booking Notifications</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="driver-notifications"
                      className="h-4 w-4 rounded border-gray-300 text-zurura-500 focus:ring-zurura-500"
                      checked
                      disabled={!notificationsEnabled}
                    />
                    <Label htmlFor="driver-notifications">Driver Updates</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="maintenance-notifications"
                      className="h-4 w-4 rounded border-gray-300 text-zurura-500 focus:ring-zurura-500"
                      checked
                      disabled={!notificationsEnabled}
                    />
                    <Label htmlFor="maintenance-notifications">Maintenance Alerts</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="revenue-notifications"
                      className="h-4 w-4 rounded border-gray-300 text-zurura-500 focus:ring-zurura-500"
                      checked
                      disabled={!notificationsEnabled}
                    />
                    <Label htmlFor="revenue-notifications">Revenue Reports</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="system-notifications"
                      className="h-4 w-4 rounded border-gray-300 text-zurura-500 focus:ring-zurura-500"
                      checked
                      disabled={!notificationsEnabled}
                    />
                    <Label htmlFor="system-notifications">System Updates</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Operations Settings</CardTitle>
              <CardDescription>Manage your operational preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-assign">Auto-Assign Drivers</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign drivers to routes based on availability
                  </p>
                </div>
                <Switch
                  id="auto-assign"
                  checked={autoAssignDrivers}
                  onCheckedChange={setAutoAssignDrivers}
                  className="data-[state=checked]:bg-zurura-500"
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Default Booking Settings</h3>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="booking-window">Booking Window (hours)</Label>
                    <input
                      id="booking-window"
                      type="number"
                      defaultValue={24}
                      min={1}
                      max={72}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zurura-500 focus-visible:ring-offset-2"
                    />
                    <p className="text-xs text-muted-foreground">How many hours in advance passengers can book seats</p>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cancellation-window">Cancellation Window (hours)</Label>
                    <input
                      id="cancellation-window"
                      type="number"
                      defaultValue={2}
                      min={0}
                      max={24}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zurura-500 focus-visible:ring-offset-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      How many hours before departure passengers can cancel bookings
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Maintenance Reminders</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="maintenance-reminders"
                      className="h-4 w-4 rounded border-gray-300 text-zurura-500 focus:ring-zurura-500"
                      checked
                    />
                    <Label htmlFor="maintenance-reminders">Enable Maintenance Reminders</Label>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="maintenance-interval">Maintenance Interval (km)</Label>
                    <input
                      id="maintenance-interval"
                      type="number"
                      defaultValue={5000}
                      min={1000}
                      max={20000}
                      step={1000}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zurura-500 focus-visible:ring-offset-2"
                    />
                    <p className="text-xs text-muted-foreground">Kilometers between scheduled maintenance reminders</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Payments</CardTitle>
              <CardDescription>Manage your billing and payment settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Payment Methods</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">M-Pesa Business</p>
                      <p className="text-xs text-muted-foreground">Connected: Business Till Number</p>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">Bank Account</p>
                      <p className="text-xs text-muted-foreground">Connected: KCB Bank ****1234</p>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Bell className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Billing Information</h3>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="company-name">Company Name</Label>
                    <input
                      id="company-name"
                      type="text"
                      defaultValue="Acme Matatu Services"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zurura-500 focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tax-id">Tax ID / PIN</Label>
                    <input
                      id="tax-id"
                      type="text"
                      defaultValue="A123456789B"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zurura-500 focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="billing-address">Billing Address</Label>
                    <textarea
                      id="billing-address"
                      rows={3}
                      defaultValue="123 Business Plaza, Nairobi, Kenya"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zurura-500 focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Subscription Plan</h3>
                <div className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Business Pro Plan</p>
                      <p className="text-sm text-muted-foreground">KES 5,000 / month</p>
                      <p className="text-xs text-muted-foreground">Next billing date: January 15, 2025</p>
                    </div>
                    <Button variant="outline">Change Plan</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Change Password</h3>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="current-password">Current Password</Label>
                    <input
                      id="current-password"
                      type="password"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zurura-500 focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-password">New Password</Label>
                    <input
                      id="new-password"
                      type="password"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zurura-500 focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <input
                      id="confirm-password"
                      type="password"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zurura-500 focus-visible:ring-offset-2"
                    />
                  </div>
                  <Button className="mt-2 bg-zurura-500 hover:bg-zurura-600">Change Password</Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch id="two-factor" className="data-[state=checked]:bg-zurura-500" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Login History</h3>
                <div className="rounded-md border">
                  <div className="border-b p-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Nairobi, Kenya</p>
                        <p className="text-xs text-muted-foreground">Today, 9:30 AM</p>
                      </div>
                      <p className="text-xs text-green-600">Current Session</p>
                    </div>
                  </div>
                  <div className="border-b p-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Nairobi, Kenya</p>
                        <p className="text-xs text-muted-foreground">Yesterday, 2:15 PM</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Chrome on Windows</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Nairobi, Kenya</p>
                        <p className="text-xs text-muted-foreground">January 10, 2025, 10:45 AM</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Safari on iPhone</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Account Access</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">API Access</p>
                      <p className="text-xs text-muted-foreground">Manage API keys for your account</p>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">Team Members</p>
                      <p className="text-xs text-muted-foreground">Manage team access to your account</p>
                    </div>
                    <Button variant="outline">Manage</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

