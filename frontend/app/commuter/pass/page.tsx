"use client"

import { useState } from "react"
import { Clock, Download, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function QRPass() {
  const [refreshing, setRefreshing] = useState(false)
  const [timeLeft, setTimeLeft] = useState("30 days")

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">QR Pass</h1>
        <p className="text-muted-foreground">View and manage your digital matatu passes</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Passes</TabsTrigger>
          <TabsTrigger value="history">Pass History</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Commuter Pass</CardTitle>
              <CardDescription>Valid for all routes within Nairobi CBD</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative">
                <div className="aspect-square w-64 bg-white p-4 rounded-lg flex items-center justify-center">
                  <div className="bg-black aspect-square w-56 rounded-md flex items-center justify-center text-white">
                    QR Code
                  </div>
                </div>
                {refreshing && (
                  <div className="absolute inset-0 bg-background/80 rounded-lg flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-muted-foreground">Pass ID: ZUR-2025-12345</p>
                <div className="flex items-center justify-center mt-2 text-sm">
                  <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>Expires in: {timeLeft}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center gap-4">
              <Button onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh QR
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Save Pass
              </Button>
            </CardFooter>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pass Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm">Pass Type:</p>
                    <p className="text-sm font-medium">Monthly Unlimited</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm">Valid From:</p>
                    <p className="text-sm font-medium">January 1, 2025</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm">Valid Until:</p>
                    <p className="text-sm font-medium">January 31, 2025</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm">Covered Routes:</p>
                    <p className="text-sm font-medium">All CBD Routes</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm">Purchased On:</p>
                    <p className="text-sm font-medium">December 28, 2024</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm">Price:</p>
                    <p className="text-sm font-medium">KES 2,000</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm">Total Trips:</p>
                    <p className="text-sm font-medium">12</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm">Most Used Route:</p>
                    <p className="text-sm font-medium">CBD to Westlands</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm">Last Used:</p>
                    <p className="text-sm font-medium">Today, 9:30 AM</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm">Value Used:</p>
                    <p className="text-sm font-medium">KES 840</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm">Savings:</p>
                    <p className="text-sm font-medium">KES 360</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button>Purchase New Pass</Button>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Pass History</CardTitle>
              <CardDescription>Your previously used passes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Monthly Commuter Pass</p>
                    <p className="text-sm text-muted-foreground">December 2024</p>
                    <p className="text-xs text-muted-foreground">Pass ID: ZUR-2024-12344</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">KES 2,000</p>
                    <p className="text-xs text-muted-foreground">Expired</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">Weekly Commuter Pass</p>
                    <p className="text-sm text-muted-foreground">November 2024</p>
                    <p className="text-xs text-muted-foreground">Pass ID: ZUR-2024-56789</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">KES 700</p>
                    <p className="text-xs text-muted-foreground">Expired</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Monthly Commuter Pass</p>
                    <p className="text-sm text-muted-foreground">October 2024</p>
                    <p className="text-xs text-muted-foreground">Pass ID: ZUR-2024-12343</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">KES 2,000</p>
                    <p className="text-xs text-muted-foreground">Expired</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

