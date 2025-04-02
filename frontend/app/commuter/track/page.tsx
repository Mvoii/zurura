"use client"

import { useState } from "react"
import { Bus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TrackMatatu() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Track Matatu</h1>
        <p className="text-muted-foreground">Find and track matatus in real-time</p>
      </div>

      <div className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="text"
          placeholder="Search by route or matatu number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button type="submit" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        <TabsContent value="map" className="space-y-4">
          <div className="aspect-video rounded-lg border bg-muted flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Interactive Map</p>
              <p className="text-xs text-muted-foreground">Shows real-time matatu locations</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Nearby Matatus</CardTitle>
                <CardDescription>Within 1km of your location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Bus className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">KBZ 123X</p>
                        <p className="text-xs text-muted-foreground">Route 125 - CBD to Westlands</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Track
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Bus className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">KCY 456Z</p>
                        <p className="text-xs text-muted-foreground">Route 58 - CBD to Eastlands</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Track
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Bus className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">KDG 789A</p>
                        <p className="text-xs text-muted-foreground">Route 33 - CBD to Rongai</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Track
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Selected Matatu</CardTitle>
                <CardDescription>Real-time information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Bus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">KBZ 123X</p>
                      <p className="text-sm text-muted-foreground">Route 125 - CBD to Westlands</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm">Current Location:</p>
                      <p className="text-sm font-medium">Uhuru Highway</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">ETA to CBD:</p>
                      <p className="text-sm font-medium">5 minutes</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Available Seats:</p>
                      <p className="text-sm font-medium">8</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Fare:</p>
                      <p className="text-sm font-medium">KES 70</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="w-full">Book Seat</Button>
                    <Button variant="outline" className="w-full">
                      View Route
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Bus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">KBZ 123X</p>
                      <p className="text-sm text-muted-foreground">Route 125 - CBD to Westlands</p>
                      <p className="text-xs text-muted-foreground">ETA: 5 minutes • 8 seats available</p>
                    </div>
                  </div>
                  <Button>Track</Button>
                </div>
              </div>
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Bus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">KCY 456Z</p>
                      <p className="text-sm text-muted-foreground">Route 58 - CBD to Eastlands</p>
                      <p className="text-xs text-muted-foreground">ETA: 12 minutes • 15 seats available</p>
                    </div>
                  </div>
                  <Button>Track</Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Bus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">KDG 789A</p>
                      <p className="text-sm text-muted-foreground">Route 33 - CBD to Rongai</p>
                      <p className="text-xs text-muted-foreground">ETA: 20 minutes • 22 seats available</p>
                    </div>
                  </div>
                  <Button>Track</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

