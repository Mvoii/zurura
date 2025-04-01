"use client"

import { useState } from 'react'
import { useRoutes } from '@/lib/hooks/useRoutes'
import { useSchedules } from '@/lib/hooks/useSchedules'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, MapPin, Navigation, Calendar, Clock, Bus, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'

interface RouteDetailsClientProps {
  id: string
}

export default function RouteDetailsClient({ id }: RouteDetailsClientProps) {
  const { data, isLoading, error } = useRoutes().getRouteDetails(id)
  const [activeTab, setActiveTab] = useState('stops')
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  )
  
  // Fetch schedules for this route
  const { 
    schedules, 
    isLoading: isSchedulesLoading, 
    error: schedulesError 
  } = useSchedules({ 
    route_id: id,
    date: selectedDate
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }
  
  if (error || !data) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-lg font-medium mb-2">Route not found</p>
            <p className="text-muted-foreground text-center mb-6">
              The route you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/commuter/find-routes" passHref>
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Routes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const { route, stops } = data
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/commuter/find-routes" passHref>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Route Details</h1>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{route.route_name}</CardTitle>
              <CardDescription className="mt-1">{route.description}</CardDescription>
            </div>
            <div className="bg-primary/10 px-3 py-1 rounded-full text-primary font-medium">
              Base Fare: KES {parseFloat(route.base_fare).toFixed(2)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Origin</p>
                <p className="font-medium">{route.origin || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Navigation className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium">{route.destination || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Stops</p>
                <p className="font-medium">{stops ? `${stops.length} stops` : 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button>Book This Route</Button>
        </CardFooter>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="stops">Route Stops</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stops" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Stops</CardTitle>
              <CardDescription>All stops on this route in order</CardDescription>
            </CardHeader>
            <CardContent>
              {stops ? (
                <div className="space-y-6">
                  {stops.length > 0 ? (
                    stops.map((stop, index) => (
                      <div key={stop.id || index} className="flex">
                        <div className="flex flex-col items-center mr-4">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium text-sm">
                            {index + 1}
                          </div>
                          {index < stops.length - 1 && (
                            <div className="h-16 w-px bg-primary/30 my-1"></div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="bg-muted rounded-lg p-4">
                            <h3 className="font-medium">{stop.stop_details?.name || 'Unnamed Stop'}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>Travel time: {stop.travel_time} min</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  Timetable: {stop.timetable?.length > 0 
                                    ? stop.timetable.join(', ') 
                                    : 'No times available'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No stops information available for this route.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Stop information is loading or unavailable.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedules" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Route Schedules</CardTitle>
              <CardDescription className="flex justify-between items-center">
                <span>Available departure times for this route</span>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border rounded p-1 text-sm"
                  />
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSchedulesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : schedules && schedules.length > 0 ? (
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="border rounded-lg p-4 hover:bg-muted transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-medium text-lg">
                            {format(parseISO(schedule.departure_time), 'h:mm a')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(schedule.departure_time), 'EEEE, MMMM d, yyyy')}
                          </p>
                        </div>
                        <Button size="sm">Book Now</Button>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Bus</p>
                          <p>{schedule.bus.plate_number}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Capacity</p>
                          <p>{schedule.bus.capacity} seats</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Available</p>
                          <p>{schedule.bus.available_seats} seats</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="mb-2">No schedules available for this date.</p>
                  <p>Try selecting a different date or check back later.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 