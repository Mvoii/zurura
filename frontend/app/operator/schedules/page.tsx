"use client"

import { useState } from "react"
import { Calendar, ChevronLeft, ChevronRight, Edit, MoreHorizontal, Plus, Search, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Schedule {
  id: string
  route: string
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  matatu: string
  driver: string
  capacity: number
  bookedSeats: number
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled"
}

export default function OperatorSchedulesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedRoute, setSelectedRoute] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
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
      driver: "John Kamau",
      capacity: 14,
      bookedSeats: 6,
      status: "Scheduled"
    },
    {
      id: "2",
      route: "Route 125",
      from: "CBD",
      to: "Westlands",
      departureTime: "07:30 AM",
      arrivalTime: "08:00 AM",
      matatu: "KCY 456Z",
      driver: "Peter Omondi",
      capacity: 14,
      bookedSeats: 2,
      status: "Scheduled"
    },
    {
      id: "3",
      route: "Route 125",
      from: "CBD",
      to: "Westlands",
      departureTime: "08:00 AM",
      arrivalTime: "08:30 AM",
      matatu: "KDG 789A",
      driver: "James Mwangi",
      capacity: 14,
      bookedSeats: 9,
      status: "Scheduled"
    },
    {
      id: "4",
      route: "Route 58",
      from: "CBD",
      to: "Eastlands",
      departureTime: "07:15 AM",
      arrivalTime: "07:50 AM",
      matatu: "KBL 321Y",
      driver: "Samuel Kipchoge",
      capacity: 14,
      bookedSeats: 4,
      status: "Scheduled"
    },
    {
      id: "5",
      route: "Route 58",
      from: "CBD",
      to: "Eastlands",
      departureTime: "07:45 AM",
      arrivalTime: "08:20 AM",
      matatu: "KCX 654W",
      driver: "David Njoroge",
      capacity: 14,
      bookedSeats: 0,
      status: "Scheduled"
    },
    {
      id: "6",
      route: "Route 33",
      from: "CBD",
      to: "Rongai",
      departureTime: "07:30 AM",
      arrivalTime: "08:45 AM",
      matatu: "KDG 789A",
      driver: "James Mwangi",
      capacity: 29,
      bookedSeats: 9,
      status: "Scheduled"
    }
  ]
  
  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsEditDialogOpen(true)
  }
  
  const handleDelete = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setIsDeleteDialogOpen(true)
  }
  
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = 
      schedule.route.toLowerCase().includes(searchQuery.toLowerCase()) || 
      schedule.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.matatu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.driver.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRoute = selectedRoute === "all" || schedule.route === selectedRoute
    
    return matchesSearch && matchesRoute
  })
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule Management</h1>
          <p className="text-muted-foreground">Manage your matatu schedules</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Schedule</DialogTitle>
              <DialogDescription>
                Enter the details of the new schedule to add to your timetable.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="route" className="text-right">
                  Route
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="route125">Route 125 (CBD-Westlands)</SelectItem>
                    <SelectItem value="route58">Route 58 (CBD-Eastlands)</SelectItem>
                    <SelectItem value="route33">Route 33 (CBD-Rongai)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input id="date" type="date" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="departureTime" className="text-right">
                  Departure Time
                </Label>
                <Input id="departureTime" type="time" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="arrivalTime" className="text-right">
                  Arrival Time
                </Label>
                <Input id="arrivalTime" type="time" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="matatu" className="text-right">
                  Matatu
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select matatu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kbz123x">KBZ 123X</SelectItem>
                    <SelectItem value="kcy456z">KCY 456Z</SelectItem>
                    <SelectItem value="kdg789a">KDG 789A</SelectItem>
                    <SelectItem value="kbl321y">KBL 321Y</SelectItem>
                    <SelectItem value="kcx654w">KCX 654W</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="driver" className="text-right">
                  Driver
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="johnkamau">John Kamau</SelectItem>
                    <SelectItem value="peteromondi">Peter Omondi</SelectItem>
                    <SelectItem value="jamesmwangi">James Mwangi</SelectItem>
                    <SelectItem value="samuelkipchoge">Samuel Kipchoge</SelectItem>
                    <SelectItem value="davidnjoroge">David Njoroge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            placeholder="Search routes, matatus, drivers..."
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
      
      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="card">Card View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>All Schedules</CardTitle>
              <CardDescription>
                All scheduled matatu trips for {formatDate(selectedDate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>From - To</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Matatu</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSchedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">{schedule.route}</TableCell>
                      <TableCell>{schedule.from} - {schedule.to}</TableCell>
                      <TableCell>{schedule.departureTime} - {schedule.arrivalTime}</TableCell>
                      <TableCell>{schedule.matatu}</TableCell>
                      <TableCell>{schedule.driver}</TableCell>
                      <TableCell>{schedule.bookedSeats}/{schedule.capacity}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          schedule.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                          schedule.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                          schedule.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {schedule.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(schedule)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(schedule)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="card">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSchedules.map((schedule) => (
              <Card key={schedule.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{schedule.route}</CardTitle>
                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      schedule.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' : 
                      schedule.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                      schedule.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {schedule.status}
                    </div>
                  </div>
                  <CardDescription>{schedule.from} to {schedule.to}</CardDescription>
                </CardHeader>
                <Car\

