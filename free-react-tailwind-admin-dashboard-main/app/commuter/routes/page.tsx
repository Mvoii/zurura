"use client"

import { useState } from "react"
import { Bus, Clock, MapPin, Search, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Route {
  id: string
  from: string
  to: string
  distance: string
  duration: string
  fare: number
  frequency: string
  rating: number
  isFavorite: boolean
}

export default function CommuterRoutesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [routes, setRoutes] = useState<Route[]>([
    {
      id: "1",
      from: "CBD",
      to: "Westlands",
      distance: "7 km",
      duration: "25-30 min",
      fare: 70,
      frequency: "Every 10 min",
      rating: 4.5,
      isFavorite: true,
    },
    {
      id: "2",
      from: "CBD",
      to: "Eastlands",
      distance: "8 km",
      duration: "30-35 min",
      fare: 50,
      frequency: "Every 15 min",
      rating: 4.2,
      isFavorite: true,
    },
    {
      id: "3",
      from: "CBD",
      to: "Rongai",
      distance: "25 km",
      duration: "60-75 min",
      fare: 150,
      frequency: "Every 20 min",
      rating: 4.0,
      isFavorite: true,
    },
    {
      id: "4",
      from: "Westlands",
      to: "CBD",
      distance: "7 km",
      duration: "25-30 min",
      fare: 70,
      frequency: "Every 10 min",
      rating: 4.5,
      isFavorite: false,
    },
    {
      id: "5",
      from: "Eastlands",
      to: "CBD",
      distance: "8 km",
      duration: "30-35 min",
      fare: 50,
      frequency: "Every 15 min",
      rating: 4.2,
      isFavorite: false,
    },
    {
      id: "6",
      from: "Rongai",
      to: "CBD",
      distance: "25 km",
      duration: "60-75 min",
      fare: 150,
      frequency: "Every 20 min",
      rating: 4.0,
      isFavorite: false,
    },
  ])

  const toggleFavorite = (id: string) => {
    setRoutes(routes.map((route) => (route.id === id ? { ...route, isFavorite: !route.isFavorite } : route)))
  }

  const filteredRoutes = routes.filter(
    (route) =>
      route.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.to.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const favoriteRoutes = routes.filter((route) => route.isFavorite)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Routes</h1>
        <p className="text-muted-foreground">Explore available matatu routes</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Routes</SelectItem>
              <SelectItem value="cbd-outbound">From CBD</SelectItem>
              <SelectItem value="cbd-inbound">To CBD</SelectItem>
              <SelectItem value="shortest">Shortest Distance</SelectItem>
              <SelectItem value="cheapest">Lowest Fare</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Routes</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recently Used</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRoutes.map((route) => (
              <Card key={route.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {route.from} to {route.to}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(route.id)}
                      className={route.isFavorite ? "text-yellow-500" : "text-muted-foreground"}
                    >
                      <Star className="h-5 w-5" fill={route.isFavorite ? "currentColor" : "none"} />
                    </Button>
                  </div>
                  <CardDescription>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-yellow-500" />
                      <span>{route.rating.toFixed(1)}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>Distance:</span>
                      </div>
                      <span className="font-medium">{route.distance}</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Duration:</span>
                      </div>
                      <span className="font-medium">{route.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-muted-foreground" />
                        <span>Frequency:</span>
                      </div>
                      <span className="font-medium">{route.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fare:</span>
                      <span className="font-medium">KES {route.fare}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button className="flex-1">Book Now</Button>
                  <Button variant="outline" className="flex-1">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites">
          {favoriteRoutes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {favoriteRoutes.map((route) => (
                <Card key={route.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {route.from} to {route.to}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(route.id)}
                        className="text-yellow-500"
                      >
                        <Star className="h-5 w-5" fill="currentColor" />
                      </Button>
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current text-yellow-500" />
                        <span>{route.rating.toFixed(1)}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>Distance:</span>
                        </div>
                        <span className="font-medium">{route.distance}</span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Duration:</span>
                        </div>
                        <span className="font-medium">{route.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-muted-foreground" />
                          <span>Frequency:</span>
                        </div>
                        <span className="font-medium">{route.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fare:</span>
                        <span className="font-medium">KES {route.fare}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button className="flex-1">Book Now</Button>
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No favorite routes</h3>
              <p className="text-muted-foreground">Add routes to your favorites to see them here</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">CBD to Westlands</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite("1")}
                    className={
                      routes.find((r) => r.id === "1")?.isFavorite ? "text-yellow-500" : "text-muted-foreground"
                    }
                  >
                    <Star
                      className="h-5 w-5"
                      fill={routes.find((r) => r.id === "1")?.isFavorite ? "currentColor" : "none"}
                    />
                  </Button>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    <span>4.5</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Distance:</span>
                    </div>
                    <span className="font-medium">7 km</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Duration:</span>
                    </div>
                    <span className="font-medium">25-30 min</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4 text-muted-foreground" />
                      <span>Frequency:</span>
                    </div>
                    <span className="font-medium">Every 10 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fare:</span>
                    <span className="font-medium">KES 70</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Last used:</span>
                    <span>Today, 9:30 AM</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button className="flex-1">Book Now</Button>
                <Button variant="outline" className="flex-1">
                  View Details
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Eastlands to CBD</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavorite("5")}
                    className={
                      routes.find((r) => r.id === "5")?.isFavorite ? "text-yellow-500" : "text-muted-foreground"
                    }
                  >
                    <Star
                      className="h-5 w-5"
                      fill={routes.find((r) => r.id === "5")?.isFavorite ? "currentColor" : "none"}
                    />
                  </Button>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current text-yellow-500" />
                    <span>4.2</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>Distance:</span>
                    </div>
                    <span className="font-medium">8 km</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Duration:</span>
                    </div>
                    <span className="font-medium">30-35 min</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4 text-muted-foreground" />
                      <span>Frequency:</span>
                    </div>
                    <span className="font-medium">Every 15 min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fare:</span>
                    <span className="font-medium">KES 50</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Last used:</span>
                    <span>Yesterday, 8:45 AM</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button className="flex-1">Book Now</Button>
                <Button variant="outline" className="flex-1">
                  View Details
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

