"use client"

import { useState } from "react"
import { Bus, Edit, MapPin, MoreHorizontal, Plus, Search, Trash } from "lucide-react"

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

interface Route {
  id: string
  name: string
  from: string
  to: string
  distance: string
  estimatedTime: string
  fare: number
  frequency: string
  assignedMatatus: number
  status: "Active" | "Inactive" | "Planned"
}

export default function OperatorRoutesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)

  const [routes, setRoutes] = useState<Route[]>([
    {
      id: "1",
      name: "Route 125",
      from: "CBD",
      to: "Westlands",
      distance: "7 km",
      estimatedTime: "25-30 min",
      fare: 70,
      frequency: "Every 10 min",
      assignedMatatus: 5,
      status: "Active",
    },
    {
      id: "2",
      name: "Route 58",
      from: "CBD",
      to: "Eastlands",
      distance: "8 km",
      estimatedTime: "30-35 min",
      fare: 50,
      frequency: "Every 15 min",
      assignedMatatus: 4,
      status: "Active",
    },
    {
      id: "3",
      name: "Route 33",
      from: "CBD",
      to: "Rongai",
      distance: "25 km",
      estimatedTime: "60-75 min",
      fare: 150,
      frequency: "Every 20 min",
      assignedMatatus: 3,
      status: "Active",
    },
    {
      id: "4",
      name: "Route 125R",
      from: "Westlands",
      to: "CBD",
      distance: "7 km",
      estimatedTime: "25-30 min",
      fare: 70,
      frequency: "Every 10 min",
      assignedMatatus: 5,
      status: "Active",
    },
    {
      id: "5",
      name: "Route 58R",
      from: "Eastlands",
      to: "CBD",
      distance: "8 km",
      estimatedTime: "30-35 min",
      fare: 50,
      frequency: "Every 15 min",
      assignedMatatus: 4,
      status: "Active",
    },
    {
      id: "6",
      name: "Route 33R",
      from: "Rongai",
      to: "CBD",
      distance: "25 km",
      estimatedTime: "60-75 min",
      fare: 150,
      frequency: "Every 20 min",
      assignedMatatus: 3,
      status: "Active",
    },
    {
      id: "7",
      name: "Route 45",
      from: "CBD",
      to: "Karen",
      distance: "15 km",
      estimatedTime: "45-50 min",
      fare: 100,
      frequency: "Every 30 min",
      assignedMatatus: 0,
      status: "Planned",
    },
  ])

  const handleEdit = (route: Route) => {
    setSelectedRoute(route)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (route: Route) => {
    setSelectedRoute(route)
    setIsDeleteDialogOpen(true)
  }

  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.to.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeRoutes = routes.filter((route) => route.status === "Active")
  const plannedRoutes = routes.filter((route) => route.status === "Planned")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Routes Management</h1>
          <p className="text-muted-foreground">Manage your matatu routes</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Route
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Route</DialogTitle>
              <DialogDescription>Enter the details of the new route to add to your network.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="routeName" className="text-right">
                  Route Name
                </Label>
                <Input id="routeName" placeholder="e.g. Route 125" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="from" className="text-right">
                  From
                </Label>
                <Input id="from" placeholder="e.g. CBD" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="to" className="text-right">
                  To
                </Label>
                <Input id="to" placeholder="e.g. Westlands" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="distance" className="text-right">
                  Distance
                </Label>
                <Input id="distance" placeholder="e.g. 7 km" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="estimatedTime" className="text-right">
                  Est. Time
                </Label>
                <Input id="estimatedTime" placeholder="e.g. 25-30 min" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="fare" className="text-right">
                  Fare (KES)
                </Label>
                <Input id="fare" type="number" placeholder="e.g. 70" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right">
                  Frequency
                </Label>
                <Input id="frequency" placeholder="e.g. Every 10 min" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Route</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="card">Card View</TabsTrigger>
          <TabsTrigger value="active">Active Routes</TabsTrigger>
          <TabsTrigger value="planned">Planned Routes</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>All Routes</CardTitle>
              <CardDescription>Manage and monitor all your matatu routes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Route Name</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Est. Time</TableHead>
                    <TableHead>Fare (KES)</TableHead>
                    <TableHead>Assigned Matatus</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoutes.map((route) => (
                    <TableRow key={route.id}>
                      <TableCell className="font-medium">{route.name}</TableCell>
                      <TableCell>{route.from}</TableCell>
                      <TableCell>{route.to}</TableCell>
                      <TableCell>{route.distance}</TableCell>
                      <TableCell>{route.estimatedTime}</TableCell>
                      <TableCell>{route.fare}</TableCell>
                      <TableCell>{route.assignedMatatus}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            route.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : route.status === "Inactive"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {route.status}
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
                            <DropdownMenuItem onClick={() => handleEdit(route)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(route)}>
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
            {filteredRoutes.map((route) => (
              <Card key={route.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{route.name}</CardTitle>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        route.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : route.status === "Inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {route.status}
                    </div>
                  </div>
                  <CardDescription>
                    {route.from} to {route.to}
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
                      <span>Est. Time:</span>
                      <span className="font-medium">{route.estimatedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fare:</span>
                      <span className="font-medium">KES {route.fare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frequency:</span>
                      <span className="font-medium">{route.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-muted-foreground" />
                        <span>Assigned Matatus:</span>
                      </div>
                      <span className="font-medium">{route.assignedMatatus}</span>
                    </div>
                  </div>
                </CardContent>
                <div className="flex border-t p-3">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleEdit(route)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(route)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeRoutes.map((route) => (
              <Card key={route.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{route.name}</CardTitle>
                    <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                      Active
                    </div>
                  </div>
                  <CardDescription>
                    {route.from} to {route.to}
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
                      <span>Est. Time:</span>
                      <span className="font-medium">{route.estimatedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fare:</span>
                      <span className="font-medium">KES {route.fare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frequency:</span>
                      <span className="font-medium">{route.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-muted-foreground" />
                        <span>Assigned Matatus:</span>
                      </div>
                      <span className="font-medium">{route.assignedMatatus}</span>
                    </div>
                  </div>
                </CardContent>
                <div className="flex border-t p-3">
                  <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleEdit(route)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(route)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="planned">
          {plannedRoutes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plannedRoutes.map((route) => (
                <Card key={route.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{route.name}</CardTitle>
                      <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800">
                        Planned
                      </div>
                    </div>
                    <CardDescription>
                      {route.from} to {route.to}
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
                        <span>Est. Time:</span>
                        <span className="font-medium">{route.estimatedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fare:</span>
                        <span className="font-medium">KES {route.fare}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frequency:</span>
                        <span className="font-medium">{route.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-muted-foreground" />
                          <span>Assigned Matatus:</span>
                        </div>
                        <span className="font-medium">{route.assignedMatatus}</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="flex border-t p-3">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleEdit(route)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(route)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No planned routes</h3>
              <p className="text-muted-foreground">Add planned routes to see them here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Route</DialogTitle>
            <DialogDescription>Update the details of the selected route.</DialogDescription>
          </DialogHeader>
          {selectedRoute && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-routeName" className="text-right">
                  Route Name
                </Label>
                <Input id="edit-routeName" defaultValue={selectedRoute.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-from" className="text-right">
                  From
                </Label>
                <Input id="edit-from" defaultValue={selectedRoute.from} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-to" className="text-right">
                  To
                </Label>
                <Input id="edit-to" defaultValue={selectedRoute.to} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-distance" className="text-right">
                  Distance
                </Label>
                <Input id="edit-distance" defaultValue={selectedRoute.distance} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-estimatedTime" className="text-right">
                  Est. Time
                </Label>
                <Input id="edit-estimatedTime" defaultValue={selectedRoute.estimatedTime} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-fare" className="text-right">
                  Fare (KES)
                </Label>
                <Input id="edit-fare" type="number" defaultValue={selectedRoute.fare} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-frequency" className="text-right">
                  Frequency
                </Label>
                <Input id="edit-frequency" defaultValue={selectedRoute.frequency} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select defaultValue={selectedRoute.status.toLowerCase()}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this route? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedRoute && (
            <div className="py-4">
              <p className="text-center font-medium">
                {selectedRoute.name} - {selectedRoute.from} to {selectedRoute.to}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive">Delete Route</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

