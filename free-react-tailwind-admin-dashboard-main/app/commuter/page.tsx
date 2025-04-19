import Link from "next/link"
import { Bus, Clock, CreditCard, Map, QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CommuterHome() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Welcome back, John</h1>
        <p className="text-muted-foreground">Your daily commute made easy</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/commuter/track">
          <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Track Matatu</CardTitle>
              <Map className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Find matatus near you in real-time</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/commuter/pass">
          <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Pass</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">View and manage your digital passes</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/commuter/book">
          <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Book Matatu</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Reserve your seat in advance</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nearby Matatus</CardTitle>
            <CardDescription>Matatus within 1km of your location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-md bg-muted flex items-center justify-center">
              <Map className="h-8 w-8 text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Map View</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your recent trips and bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Bus className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">CBD to Westlands</p>
                  <p className="text-xs text-muted-foreground">Today, 9:30 AM</p>
                </div>
                <div className="ml-auto font-medium">KES 70</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Monthly Pass Purchased</p>
                  <p className="text-xs text-muted-foreground">Yesterday, 2:15 PM</p>
                </div>
                <div className="ml-auto font-medium">KES 2,000</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Bus className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Eastlands to CBD</p>
                  <p className="text-xs text-muted-foreground">Yesterday, 8:45 AM</p>
                </div>
                <div className="ml-auto font-medium">KES 50</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Upcoming Trips</h2>
        <Card>
          <CardContent className="p-0">
            <div className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">CBD to Rongai</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    Tomorrow, 7:30 AM
                  </div>
                </div>
                <Button size="sm">View Ticket</Button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Westlands to CBD</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    Friday, 6:00 PM
                  </div>
                </div>
                <Button size="sm">View Ticket</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

