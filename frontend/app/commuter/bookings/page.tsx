"use client"

import { useState } from 'react'
import { useBookings } from '@/lib/hooks/useBookings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Calendar, Clock, Bus, ArrowLeft, X, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'

export default function BookingsPage() {
  const { bookings, isLoadingBookings, cancelBooking, isCancellingBooking } = useBookings()
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all')
  
  // Filter bookings based on active tab
  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'all') return true
    if (activeTab === 'active') return booking.status === 'pending' || booking.status === 'confirmed'
    if (activeTab === 'completed') return booking.status === 'completed'
    if (activeTab === 'cancelled') return booking.status === 'cancelled'
    return true
  })
  
  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId)
      } catch (error) {
        console.error('Failed to cancel booking:', error)
      }
    }
  }
  
  // Helper function to get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  
  if (isLoadingBookings) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">View and manage your trip bookings</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-lg font-medium mb-2">No bookings found</p>
                <p className="text-muted-foreground text-center mb-6">
                  {activeTab === 'all' 
                    ? "You haven't made any bookings yet." 
                    : `You don't have any ${activeTab} bookings.`}
                </p>
                <Link href="/commuter/find-routes" passHref>
                  <Button>Find Routes</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:flex-1 p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">Booking #{booking.id.slice(0, 8)}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(booking.status)}`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Booked on {format(parseISO(booking.created_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <div className="bg-primary/10 px-3 py-1 rounded-full text-primary font-medium text-sm">
                          KES {booking.fare.toFixed(2)}
                        </div>
                      </div>

                      <div className="mt-4 space-y-4">
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Seats</p>
                            <p className="font-medium">{booking.seats.seat_numbers.join(', ')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Expires</p>
                            <p className="font-medium">
                              {format(parseISO(booking.expires_at), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Payment Method</p>
                            <p className="font-medium capitalize">
                              {booking.payment_method?.replace('_', ' ') || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-6 md:w-56 flex flex-col justify-between">
                      <div>
                        {booking.status === 'confirmed' && (
                          <div className="mb-4 p-2 bg-green-100 text-green-800 rounded text-sm flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Your booking is confirmed
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Link href={`/commuter/bookings/${booking.id}`} passHref>
                          <Button className="w-full" variant="outline" size="sm">View Details</Button>
                        </Link>
                        
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <Button 
                            className="w-full" 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={isCancellingBooking}
                          >
                            {isCancellingBooking ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <X className="mr-2 h-4 w-4" />
                                Cancel Booking
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 