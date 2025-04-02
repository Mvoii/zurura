"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Schedule {
  id: string
  route: string
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  matatu: string
  availableSeats: number
  fare: number
}

export default function CommuterSchedulesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedRoute, setSelectedRoute] = useState("all")

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
  }

  const schedules: Schedule[] = [
    {
      id: "1",
      route: "Route 125",
      from: "CBD",
      to: "Westlands",
      departureTime: "07:00 AM",
      arrivalTime: "07:30 AM",
      matatu: "KBZ 123X",
      availableSeats: 8,
      fare: 70,
    },
    {
      id: "2",
      route: "Route 125",
      from: "CBD",
      to: "Westlands",
      departureTime: "07:30 AM",
      arrivalTime: "08:00 AM",
      matatu: "KCY 456Z",
      availableSeats: 12,
      fare: 70,
    },
    {
      id: "3",
      route: "Route 125",
      from: "CBD",
      to: "Westlands",
      departureTime: "08:00 AM",
      arrivalTime: "08:30 AM",
      matatu: "KDG 789A",
      availableSeats: 5,
      fare: 70,
    },
    {
      id: "4",
      route: "Route 58",
      from: "CBD",
      to: "Eastlands",
      departureTime: "07:15 AM",
      arrivalTime: "07:50 AM",
      matatu: "KBL 321Y",
      availableSeats: 10,
      fare: 50,
    },
    {
      id: "5",
      route: "Route 58",
      from: "CBD",
      to: "Eastlands",
      departureTime: "07:45 AM",
      arrivalTime: "08:20 AM",
      matatu: "KCX 654W",
      availableSeats: 15,
      fare: 50,
    },
    {
      id: "6",
      route: "Route 33",
      from: "CBD",
      to: "Rongai",
      departureTime: "07:30 AM",
      arrivalTime: "08:45 AM",
      matatu: "KDG 789A",
      availableSeats: 20,
      fare: 150,
    },
  ]

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.matatu.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRoute = selectedRoute === "all" || schedule.route === selectedRoute

    return matchesSearch && matchesRoute
  })

  const morningSchedules = schedules.filter((schedule) => {
    const hour = Number.parseInt(schedule.departureTime.split(":")[0])
    const isPM = schedule.departureTime.includes("PM")
    return (hour < 12 && !isPM) || (hour === 12 && !isPM)
  })

  const afternoonSchedules = schedules.filter((schedule) => {
    const hour = Number.parseInt(schedule.departureTime.split(":")[0])
    const isPM = schedule.departureTime.includes("PM")
    return (hour < 5 && isPM) || (hour === 12 && isPM)
  })

  const eveningSchedules = schedules.filter((schedule) => {
    const hour = Number.parseInt(schedule.departureTime.split(":")[0])
    const isPM = schedule.departureTime.includes("PM")
    return hour >= 5 && hour <= 11 && isPM
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Schedules</h1>
        <p className="text-muted-foreground">View and book matatu schedules</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="relative">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[180px]"
            />
            <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-1 gap-2">
          <Input
            placeholder="Search routes, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm"
          />
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Select value={selectedRoute} onValueChange={setSelectedRoute}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by route" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Routes</SelectItem>
              <SelectItem value="Route 125">Route 125 (CBD-Westlands)</SelectItem>
              <SelectItem value="Route 58">Route 58 (CBD-Eastlands)</SelectItem>
              <SelectItem value="Route 33">Route 33 (CBD-Rongai)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold">{formatDate(selectedDate)}</h2>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Times</TabsTrigger>
          <TabsTrigger value="morning">Morning</TabsTrigger>
          <TabsTrigger value="afternoon">Afternoon</TabsTrigger>
          <TabsTrigger value="evening">Evening</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Schedules</CardTitle>
              <CardDescription>All available matatu schedules for {formatDate(selectedDate)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSchedules.length > 0 ? (
                  filteredSchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {schedule.departureTime} - {schedule.arrivalTime}
                          </span>
                        </div>
                        <p className="font-medium">
                          {schedule.route}: {schedule.from} to {schedule.to}
                        </p>
                        <p className="text-sm text-muted-foreground">Matatu: {schedule.matatu}</p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.availableSeats} seats available • KES {schedule.fare}
                        </p>
                      </div>
                      <Button>Book Seat</Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No schedules found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="morning">
          <Card>
            <CardHeader>
              <CardTitle>Morning Schedules</CardTitle>
              <CardDescription>Morning matatu schedules for {formatDate(selectedDate)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {morningSchedules.length > 0 ? (
                  morningSchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {schedule.departureTime} - {schedule.arrivalTime}
                          </span>
                        </div>
                        <p className="font-medium">
                          {schedule.route}: {schedule.from} to {schedule.to}
                        </p>
                        <p className="text-sm text-muted-foreground">Matatu: {schedule.matatu}</p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.availableSeats} seats available • KES {schedule.fare}
                        </p>
                      </div>
                      <Button>Book Seat</Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No morning schedules found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="afternoon">
          <Card>
            <CardHeader>
              <CardTitle>Afternoon Schedules</CardTitle>
              <CardDescription>Afternoon matatu schedules for {formatDate(selectedDate)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {afternoonSchedules.length > 0 ? (
                  afternoonSchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {schedule.departureTime} - {schedule.arrivalTime}
                          </span>
                        </div>
                        <p className="font-medium">
                          {schedule.route}: {schedule.from} to {schedule.to}
                        </p>
                        <p className="text-sm text-muted-foreground">Matatu: {schedule.matatu}</p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.availableSeats} seats available • KES {schedule.fare}
                        </p>
                      </div>
                      <Button>Book Seat</Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No afternoon schedules found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evening">
          <Card>
            <CardHeader>
              <CardTitle>Evening Schedules</CardTitle>
              <CardDescription>Evening matatu schedules for {formatDate(selectedDate)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eveningSchedules.length > 0 ? (
                  eveningSchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {schedule.departureTime} - {schedule.arrivalTime}
                          </span>
                        </div>
                        <p className="font-medium">
                          {schedule.route}: {schedule.from} to {schedule.to}
                        </p>
                        <p className="text-sm text-muted-foreground">Matatu: {schedule.matatu}</p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.availableSeats} seats available • KES {schedule.fare}
                        </p>
                      </div>
                      <Button>Book Seat</Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">No evening schedules found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

