"use client"

import { useState } from "react"
import {
  LineChart,
  PieChart,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users,
  Route,
  Bus,
  DollarSign,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data for charts
const revenueData = [
  { month: "Jan", amount: 120000 },
  { month: "Feb", amount: 145000 },
  { month: "Mar", amount: 165000 },
  { month: "Apr", amount: 140000 },
  { month: "May", amount: 180000 },
  { month: "Jun", amount: 210000 },
]

const passengersData = [
  { month: "Jan", count: 15200 },
  { month: "Feb", count: 16800 },
  { month: "Mar", count: 18500 },
  { month: "Apr", count: 17200 },
  { month: "May", count: 19800 },
  { month: "Jun", count: 22500 },
]

const tripsData = [
  { month: "Jan", count: 1250 },
  { month: "Feb", count: 1380 },
  { month: "Mar", count: 1520 },
  { month: "Apr", count: 1420 },
  { month: "May", count: 1680 },
  { month: "Jun", count: 1850 },
]

const routePerformance = [
  { route: "CBD to Westlands", trips: 580, passengers: 8700, revenue: 609000 },
  { route: "CBD to Eastlands", trips: 520, passengers: 7800, revenue: 390000 },
  { route: "CBD to Rongai", trips: 320, passengers: 9280, revenue: 1392000 },
  { route: "Westlands to CBD", trips: 560, passengers: 8400, revenue: 588000 },
  { route: "Eastlands to CBD", trips: 510, passengers: 7650, revenue: 382500 },
]

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [selectedRoute, setSelectedRoute] = useState("all")
  const [selectedTimeframe, setSelectedTimeframe] = useState("month")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1500)
  }

  // Calculate KPIs
  const totalTrips = tripsData.reduce((sum, item) => sum + item.count, 0)
  const totalPassengers = passengersData.reduce((sum, item) => sum + item.count, 0)
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0)
  const avgPassengersPerTrip = Math.round(totalPassengers / totalTrips)
  const activeRoutes = 5

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights into your matatu operations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="route">Route</Label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger id="route">
                  <SelectValue placeholder="All Routes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routes</SelectItem>
                  <SelectItem value="cbd-westlands">CBD to Westlands</SelectItem>
                  <SelectItem value="cbd-eastlands">CBD to Eastlands</SelectItem>
                  <SelectItem value="cbd-rongai">CBD to Rongai</SelectItem>
                  <SelectItem value="westlands-cbd">Westlands to CBD</SelectItem>
                  <SelectItem value="eastlands-cbd">Eastlands to CBD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger id="timeframe">
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="quarter">Quarterly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="sm" className="ml-auto">
            <Filter className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </CardFooter>
      </Card>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {(totalRevenue / 1000).toFixed(0)}K</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+15.3% from last period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Bus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTrips.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+8.7% from last period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Passengers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPassengers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+12.1% from last period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRoutes}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+1 from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Passengers Per Trip</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPassengersPerTrip}</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="mr-1 h-3 w-3" />
              <span>-2.5% from last period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Revenue Per Trip</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {Math.round(totalRevenue / totalTrips).toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+5.8% from last period</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Revenue Per Passenger</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {Math.round(totalRevenue / totalPassengers).toLocaleString()}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>+3.2% from last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="passengers">Passengers</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
          <TabsTrigger value="routes">Route Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly revenue for the past 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="h-full w-full">
                {/* Revenue Chart Visualization */}
                <div className="flex h-full flex-col">
                  <div className="flex justify-between pb-2">
                    {revenueData.map((item, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground">{item.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="relative flex h-full items-end gap-2">
                    {revenueData.map((item, i) => {
                      const height = `${(item.amount / Math.max(...revenueData.map((d) => d.amount))) * 100}%`
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-zurura-500 rounded-t-sm"
                            style={{ height }}
                            title={`KES ${item.amount.toLocaleString()}`}
                          ></div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between pt-2">
                    {revenueData.map((item, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-xs font-medium">{(item.amount / 1000).toFixed(0)}K</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Route</CardTitle>
                <CardDescription>Distribution of revenue across routes</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <div className="h-full w-full flex items-center justify-center">
                  {/* Pie Chart Visualization */}
                  <PieChart className="h-12 w-12 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Revenue Distribution Chart</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Analysis of revenue sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Direct Bookings</span>
                      <span className="text-sm font-medium">KES 580,000</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-zurura-500" style={{ width: "58%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Digital Passes</span>
                      <span className="text-sm font-medium">KES 320,000</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-zurura-600" style={{ width: "32%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Cash Payments</span>
                      <span className="text-sm font-medium">KES 100,000</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-zurura-700" style={{ width: "10%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="passengers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Passenger Trends</CardTitle>
              <CardDescription>Monthly passenger counts for the past 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="h-full w-full">
                {/* Passenger Chart Visualization */}
                <div className="flex h-full flex-col">
                  <div className="flex justify-between pb-2">
                    {passengersData.map((item, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground">{item.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="relative flex h-full items-end gap-2">
                    {passengersData.map((item, i) => {
                      const height = `${(item.count / Math.max(...passengersData.map((d) => d.count))) * 100}%`
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-ocean-500 rounded-t-sm"
                            style={{ height }}
                            title={`${item.count.toLocaleString()} passengers`}
                          ></div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between pt-2">
                    {passengersData.map((item, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-xs font-medium">{(item.count / 1000).toFixed(1)}K</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Passenger Demographics</CardTitle>
                <CardDescription>Breakdown of passenger types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Regular Commuters</span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-ocean-500" style={{ width: "65%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Occasional Travelers</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-ocean-600" style={{ width: "25%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">First-time Users</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-ocean-700" style={{ width: "10%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
                <CardDescription>Passenger distribution by time of day</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <div className="h-full w-full flex items-center justify-center">
                  {/* Line Chart Visualization */}
                  <LineChart className="h-12 w-12 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Hourly Distribution Chart</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trip Trends</CardTitle>
              <CardDescription>Monthly trip counts for the past 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="h-full w-full">
                {/* Trips Chart Visualization */}
                <div className="flex h-full flex-col">
                  <div className="flex justify-between pb-2">
                    {tripsData.map((item, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-xs text-muted-foreground">{item.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="relative flex h-full items-end gap-2">
                    {tripsData.map((item, i) => {
                      const height = `${(item.count / Math.max(...tripsData.map((d) => d.count))) * 100}%`
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-zurura-700 rounded-t-sm"
                            style={{ height }}
                            title={`${item.count.toLocaleString()} trips`}
                          ></div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex justify-between pt-2">
                    {tripsData.map((item, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <span className="text-xs font-medium">{(item.count / 1000).toFixed(1)}K</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trip Completion Rate</CardTitle>
                <CardDescription>Analysis of completed vs. canceled trips</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completed Trips</span>
                      <span className="text-sm font-medium">95.8%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-green-500" style={{ width: "95.8%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Delayed Trips</span>
                      <span className="text-sm font-medium">3.2%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-yellow-500" style={{ width: "3.2%" }}></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Canceled Trips</span>
                      <span className="text-sm font-medium">1.0%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-red-500" style={{ width: "1.0%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Trip Efficiency</CardTitle>
                <CardDescription>Average capacity utilization per trip</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <div className="h-full w-full flex items-center justify-center">
                  {/* Gauge Chart Visualization */}
                  <div className="relative h-40 w-40">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold">78%</div>
                        <div className="text-xs text-muted-foreground">Capacity Utilization</div>
                      </div>
                    </div>
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="10"
                        strokeDasharray="283"
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#b7094c"
                        strokeWidth="10"
                        strokeDasharray="283"
                        strokeDashoffset="62"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Route Performance</CardTitle>
              <CardDescription>Comparative analysis of route performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-medium">Route</th>
                      <th className="pb-2 text-right font-medium">Trips</th>
                      <th className="pb-2 text-right font-medium">Passengers</th>
                      <th className="pb-2 text-right font-medium">Revenue (KES)</th>
                      <th className="pb-2 text-right font-medium">Avg. Occupancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routePerformance.map((route, i) => (
                      <tr key={i} className="border-b">
                        <td className="py-3 text-left">{route.route}</td>
                        <td className="py-3 text-right">{route.trips.toLocaleString()}</td>
                        <td className="py-3 text-right">{route.passengers.toLocaleString()}</td>
                        <td className="py-3 text-right">{route.revenue.toLocaleString()}</td>
                        <td className="py-3 text-right">{Math.round(route.passengers / route.trips)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Routes</CardTitle>
                <CardDescription>Routes with highest revenue per trip</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routePerformance
                    .sort((a, b) => b.revenue / b.trips - a.revenue / a.trips)
                    .slice(0, 3)
                    .map((route, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{route.route}</span>
                          <span className="text-sm font-medium">
                            KES {Math.round(route.revenue / route.trips).toLocaleString()}/trip
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-zurura-500"
                            style={{
                              width: `${
                                (route.revenue /
                                  route.trips /
                                  (routePerformance[2].revenue / routePerformance[2].trips)) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Route Utilization</CardTitle>
                <CardDescription>Average passenger occupancy by route</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routePerformance
                    .sort((a, b) => b.passengers / b.trips - a.passengers / a.trips)
                    .map((route, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{route.route}</span>
                          <span className="text-sm font-medium">
                            {Math.round(route.passengers / route.trips)} passengers/trip
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-ocean-500"
                            style={{
                              width: `${(route.passengers / route.trips / 30) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

