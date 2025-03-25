"use client"

import { useState } from "react"
import { Edit, MoreHorizontal, Plus, Search, Trash } from "lucide-react"

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

export default function MatatusManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedMatatu, setSelectedMatatu] = useState(null)

  const matatus = [
    {
      id: 1,
      regNumber: "KBZ 123X",
      model: "Toyota Hiace",
      capacity: 14,
      driver: "John Kamau",
      route: "CBD to Westlands",
      status: "Active",
    },
    {
      id: 2,
      regNumber: "KCY 456Z",
      model: "Nissan Caravan",
      capacity: 14,
      driver: "Peter Omondi",
      route: "CBD to Eastlands",
      status: "Active",
    },
    {
      id: 3,
      regNumber: "KDG 789A",
      model: "Toyota Coaster",
      capacity: 29,
      driver: "James Mwangi",
      route: "CBD to Rongai",
      status: "Active",
    },
    {
      id: 4,
      regNumber: "KBL 321Y",
      model: "Isuzu NQR",
      capacity: 33,
      driver: "Samuel Kipchoge",
      route: "Westlands to CBD",
      status: "Maintenance",
    },
    {
      id: 5,
      regNumber: "KCX 654W",
      model: "Toyota Hiace",
      capacity: 14,
      driver: "David Njoroge",
      route: "Eastlands to CBD",
      status: "Active",
    },
  ]

  const handleEdit = (matatu) => {
    setSelectedMatatu(matatu)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (matatu) => {
    setSelectedMatatu(matatu)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Matatus Management</h1>
          <p className="text-muted-foreground">Manage your matatu fleet</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Matatu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Matatu</DialogTitle>
              <DialogDescription>Enter the details of the new matatu to add to your fleet.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="regNumber" className="text-right">
                  Reg Number
                </Label>
                <Input id="regNumber" placeholder="e.g. KBZ 123X" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="model" className="text-right">
                  Model
                </Label>
                <Input id="model" placeholder="e.g. Toyota Hiace" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">
                  Capacity
                </Label>
                <Input id="capacity" type="number" placeholder="e.g. 14" className="col-span-3" />
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
                    <SelectItem value="john">John Kamau</SelectItem>
                    <SelectItem value="peter">Peter Omondi</SelectItem>
                    <SelectItem value="james">James Mwangi</SelectItem>
                    <SelectItem value="samuel">Samuel Kipchoge</SelectItem>
                    <SelectItem value="david">David Njoroge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="route" className="text-right">
                  Route
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbd-westlands">CBD to Westlands</SelectItem>
                    <SelectItem value="cbd-eastlands">CBD to Eastlands</SelectItem>
                    <SelectItem value="cbd-rongai">CBD to Rongai</SelectItem>
                    <SelectItem value="westlands-cbd">Westlands to CBD</SelectItem>
                    <SelectItem value="eastlands-cbd">Eastlands to CBD</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Matatu</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search matatus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Matatu Fleet</CardTitle>
          <CardDescription>Manage and monitor all your matatus in one place</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reg Number</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matatus.map((matatu) => (
                <TableRow key={matatu.id}>
                  <TableCell className="font-medium">{matatu.regNumber}</TableCell>
                  <TableCell>{matatu.model}</TableCell>
                  <TableCell>{matatu.capacity}</TableCell>
                  <TableCell>{matatu.driver}</TableCell>
                  <TableCell>{matatu.route}</TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        matatu.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : matatu.status === "Maintenance"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {matatu.status}
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
                        <DropdownMenuItem onClick={() => handleEdit(matatu)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(matatu)}>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Matatu</DialogTitle>
            <DialogDescription>Update the details of the selected matatu.</DialogDescription>
          </DialogHeader>
          {selectedMatatu && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-regNumber" className="text-right">
                  Reg Number
                </Label>
                <Input id="edit-regNumber" defaultValue={selectedMatatu.regNumber} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-model" className="text-right">
                  Model
                </Label>
                <Input id="edit-model" defaultValue={selectedMatatu.model} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-capacity" className="text-right">
                  Capacity
                </Label>
                <Input id="edit-capacity" type="number" defaultValue={selectedMatatu.capacity} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-driver" className="text-right">
                  Driver
                </Label>
                <Select defaultValue={selectedMatatu.driver.toLowerCase().split(" ")[0]}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Kamau</SelectItem>
                    <SelectItem value="peter">Peter Omondi</SelectItem>
                    <SelectItem value="james">James Mwangi</SelectItem>
                    <SelectItem value="samuel">Samuel Kipchoge</SelectItem>
                    <SelectItem value="david">David Njoroge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-route" className="text-right">
                  Route
                </Label>
                <Select defaultValue={selectedMatatu.route.toLowerCase().replace(" to ", "-")}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cbd-westlands">CBD to Westlands</SelectItem>
                    <SelectItem value="cbd-eastlands">CBD to Eastlands</SelectItem>
                    <SelectItem value="cbd-rongai">CBD to Rongai</SelectItem>
                    <SelectItem value="westlands-cbd">Westlands to CBD</SelectItem>
                    <SelectItem value="eastlands-cbd">Eastlands to CBD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select defaultValue={selectedMatatu.status.toLowerCase()}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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
              Are you sure you want to delete this matatu? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedMatatu && (
            <div className="py-4">
              <p className="text-center font-medium">
                {selectedMatatu.regNumber} - {selectedMatatu.model}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive">Delete Matatu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

