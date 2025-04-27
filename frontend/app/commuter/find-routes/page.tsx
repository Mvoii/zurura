"use client"

import { useState } from 'react'
import { useRoutes } from '@/lib/hooks/useRoutes'
import { RouteCard } from '@/components/route-card'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Search, MapPin, Navigation } from 'lucide-react'
import Link from 'next/link'

export default function FindRoutesPage() {
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const { routes, pagination, isLoading, isFetching, searchRoutes, changePage } = useRoutes()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchRoutes({ origin, destination })
  }

  const handleNextPage = () => {
    if (pagination && pagination.offset + pagination.limit < pagination.total) {
      changePage(pagination.offset + pagination.limit)
    }
  }

  const handlePrevPage = () => {
    if (pagination && pagination.offset > 0) {
      changePage(Math.max(0, pagination.offset - pagination.limit))
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold">Find Routes</h1>
        <p className="text-muted-foreground">Search for routes by origin and destination</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Routes</CardTitle>
          <CardDescription>Enter your origin and destination to find available routes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Origin (e.g. CBD)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative flex-1">
              <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Destination (e.g. Westlands)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading || isFetching}>
              {(isLoading || isFetching) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {origin || destination ? 'Search Results' : 'Available Routes'}
        </h2>
        
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : routes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <p className="text-lg font-medium mb-2">No routes found</p>
              <p className="text-muted-foreground text-center">
                Try different search terms or browse all available routes
              </p>
              <Button variant="outline" className="mt-4" onClick={() => searchRoutes({})}>
                View All Routes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {routes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
            
            {pagination && pagination.total > pagination.limit && (
              <div className="flex justify-between items-center mt-4">
                <Button 
                  variant="outline" 
                  onClick={handlePrevPage} 
                  disabled={pagination.offset === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} routes
                </span>
                <Button 
                  variant="outline" 
                  onClick={handleNextPage} 
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 