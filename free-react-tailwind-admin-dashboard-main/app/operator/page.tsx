import Link from "next/link"
import { BarChart3, Bus, CreditCard, DollarSign, LineChart, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OperatorDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your matatu business overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES 245,670</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,245</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Passengers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,672</div>
            <p className="text-xs text-muted-foreground">+18.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Passes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">+8.4% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="passengers">Passengers</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue for the past 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-md">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Revenue Chart</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trip Analytics</CardTitle>
              <CardDescription>Trip data for the past 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-md">
                <LineChart className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Trips Chart</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="passengers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Passenger Analytics</CardTitle>
              <CardDescription>Passenger data for the past 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-md">
                <LineChart className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Passengers Chart</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
            <CardDescription>Your matatus' most recent trips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 text-sm text-muted-foreground">
                <div>Matatu</div>
                <div>Route</div>
                <div>Time</div>
                <div>Revenue</div>
              </div>
              <div className="grid grid-cols-4 items-center">
                <div>KBZ 123X</div>
                <div>CBD to Westlands</div>
                <div>Today, 9:30 AM</div>
                <div>KES 2,450</div>
              </div>
              <div className="grid grid-cols-4 items-center">
                <div>KCY 456Z</div>
                <div>CBD to Eastlands</div>
                <div>Today, 10:15 AM</div>
                <div>KES 1,850</div>
              </div>
              <div className="grid grid-cols-4 items-center">
                <div>KDG 789A</div>
                <div>CBD to Rongai</div>
                <div>Today, 11:00 AM</div>
                <div>KES 3,200</div>
              </div>
              <div className="grid grid-cols-4 items-center">
                <div>KBZ 123X</div>
                <div>Westlands to CBD</div>
                <div>Today, 12:30 PM</div>
                <div>KES 2,100</div>
              </div>
              <div className="grid grid-cols-4 items-center">
                <div>KCY 456Z</div>
                <div>Eastlands to CBD</div>
                <div>Today, 1:45 PM</div>
                <div>KES 1,950</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Performing Routes</CardTitle>
            <CardDescription>Routes with highest revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">CBD to Rongai</span>
                    <span className="text-sm font-medium">KES 78,450</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">CBD to Westlands</span>
                    <span className="text-sm font-medium">KES 65,200</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "70%" }}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">CBD to Eastlands</span>
                    <span className="text-sm font-medium">KES 52,800</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Westlands to CBD</span>
                    <span className="text-sm font-medium">KES 48,120</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "55%" }}></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Eastlands to CBD</span>
                    <span className="text-sm font-medium">KES 41,100</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Link href="/operator/reports">
          <Button>View Detailed Reports</Button>
        </Link>
      </div>
    </div>
  )
}

