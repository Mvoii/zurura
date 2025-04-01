"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useRoutes } from '@/lib/hooks/useRoutes'
import { useSchedules } from '@/lib/hooks/useSchedules'
import { useBookings } from '@/lib/hooks/useBookings'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Loader2, Calendar, Clock, Bus, ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { RouteCard } from '@/components/route-card'

export default function BookingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const routeId = searchParams.get('route_id')
  const scheduleId = searchParams.get('schedule_id')
  const busId = searchParams.get('bus_id')
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'airtel_money' | 'cash' | 'bus_pass'>('mpesa')
  
  // Get route details if routeId is provided
  const { data: routeData, isLoading: isRouteLoading } = useRoutes().getRouteDetails(routeId || '')
  
  // Get schedule details if scheduleId is provided
  const { schedules, isLoading: isSchedulesLoading } = useSchedules({ 
    route_id: routeId || undefined,
  })
  
  const { createBooking, isCreatingBooking } = useBookings()
  
  // Find the selected schedule from the list
  const selectedSchedule = schedules.find(s => s.id === scheduleId)
  
  // Find the selected bus if busId is provided
  const selectedBus = selectedSchedule?.bus.id === busId ? selectedSchedule.bus : undefined
  
  // Update URL if needed
  useEffect(() => {
    if (routeId && scheduleId && !busId && selectedSchedule) {
      // Add bus_id to the URL
      router.replace(`/commuter/booking?route_id=${routeId}&schedule_id=${scheduleId}&bus_id=${selectedSchedule.bus.id}`)
    }
  }, [routeId, scheduleId, busId, selectedSchedule, router])
  
  // Calculate total fare
  const calculateFare = () => {
    if (!routeData?.route.base_fare || selectedSeats.length === 0) return 0
    
    // Parse base fare - might be string or number depending on API response
    const baseFare = typeof routeData.route.base_fare === 'number' 
      ? routeData.route.base_fare 
      : parseFloat(routeData.route.base_fare)
      
    return baseFare * selectedSeats.length
  }
  
  const handleSeatToggle = (seatNumber: string) => {
    setSelectedSeats(prev => 
      prev.includes(seatNumber)
        ? prev.filter(s => s !== seatNumber)
        : [...prev, seatNumber]
    )
  }
  
  const handleSubmit = async () => {
    if (!selectedBus || selectedSeats.length === 0) return
    
    try {
      await createBooking({
        bus_id: selectedBus.id,
        seats: {
          seat_numbers: selectedSeats,
          count: selectedSeats.length
        },
        payment_method: paymentMethod
      })
      
      // Redirect to bookings page on success
      router.push('/commuter/bookings')
    } catch (error) {
      // Error is handled in the useBookings hook with toast
      console.error('Booking failed:', error)
    }
  }
  
  // Simplified function to generate seat grid
  const generateSeats = (rows: number, cols: number) => {
    const seats = []
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    
    for (let i = 0; i < rows; i++) {
      const row = []
      for (let j = 0; j < cols; j++) {
        const seatNumber = `${letters[i]}${j+1}`
        row.push(seatNumber)
      }
      seats.push(row)
    }
    
    return seats
  }
  
  // Generate a 10x4 seat grid for demonstration
  const seatGrid = generateSeats(10, 4)
  
  // If loading, show loading state
  if (isRouteLoading || isSchedulesLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }
  
  // If route data not found, show error
  if (!routeData || !routeData.route) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-lg font-medium mb-2">Route not found</p>
            <p className="text-muted-foreground text-center mb-6">
              The route you're trying to book doesn't exist or has been removed.
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
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/commuter/routes/${routeId}`} passHref>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Book Your Trip</h1>
      </div>
      
      {/* Route Information */}
      <RouteCard route={routeData.route} showBookButton={false} />
      
      {/* Schedule Selection */}
      {!scheduleId && (
        <Card>
          <CardHeader>
            <CardTitle>Select Schedule</CardTitle>
            <CardDescription>Pick your preferred departure time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedules.length > 0 ? (
                schedules.map((schedule) => (
                  <div 
                    key={schedule.id} 
                    className="border rounded-lg p-4 hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => router.push(`/commuter/booking?route_id=${routeId}&schedule_id=${schedule.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-lg">
                          {format(parseISO(schedule.departure_time), 'h:mm a')}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {format(parseISO(schedule.departure_time), 'EEEE, MMMM d, yyyy')}
                        </p>
                      </div>
                      <div className="bg-primary/10 px-3 py-1 rounded-full text-primary font-medium text-sm">
                        {schedule.bus.available_seats} seats available
                      </div>
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
                      <div className="text-right">
                        <Button size="sm">Select</Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <p className="mb-2">No schedules available for this route.</p>
                  <p>Please check back later or try a different route.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Seat Selection */}
      {scheduleId && selectedSchedule && (
        <Card>
          <CardHeader>
            <CardTitle>Select Seats</CardTitle>
            <CardDescription>
              Departure: {format(parseISO(selectedSchedule.departure_time), 'EEEE, MMMM d, yyyy h:mm a')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 border rounded-md bg-muted/50">
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                  <span>Occupied</span>
                </div>
              </div>
              
              <div className="grid place-items-center mb-6">
                <div className="w-1/2 h-10 bg-gray-300 flex items-center justify-center rounded-t-lg">
                  Driver
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-2">
                {seatGrid.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center gap-8">
                    <div className="flex gap-2">
                      {row.slice(0, 2).map((seat) => (
                        <button
                          key={seat}
                          className={`w-12 h-12 rounded-md flex items-center justify-center font-medium transition-colors ${
                            selectedSeats.includes(seat) 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                          onClick={() => handleSeatToggle(seat)}
                        >
                          {seat}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {row.slice(2, 4).map((seat) => (
                        <button
                          key={seat}
                          className={`w-12 h-12 rounded-md flex items-center justify-center font-medium transition-colors ${
                            selectedSeats.includes(seat) 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                          onClick={() => handleSeatToggle(seat)}
                        >
                          {seat}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center py-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Selected Seats</p>
                <p className="font-medium">
                  {selectedSeats.length > 0 
                    ? selectedSeats.sort().join(', ') 
                    : 'None selected'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Fare</p>
                <p className="font-medium text-lg">KES {calculateFare().toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Payment Method Selection */}
      {scheduleId && selectedSeats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Choose how you want to pay</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={(value) => setPaymentMethod(value as any)}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 border rounded-md p-4">
                <RadioGroupItem value="mpesa" id="mpesa" />
                <Label htmlFor="mpesa" className="flex-1 cursor-pointer">M-Pesa</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-4">
                <RadioGroupItem value="airtel_money" id="airtel" />
                <Label htmlFor="airtel" className="flex-1 cursor-pointer">Airtel Money</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-4">
                <RadioGroupItem value="bus_pass" id="pass" />
                <Label htmlFor="pass" className="flex-1 cursor-pointer">Bus Pass</Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-md p-4">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="flex-1 cursor-pointer">Cash (Pay on boarding)</Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setSelectedSeats([])}>
              Clear Selection
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isCreatingBooking || selectedSeats.length === 0}
            >
              {isCreatingBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Complete Booking
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
} 