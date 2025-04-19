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

export default function DriversManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)

  const drivers = [
    {
      id: 1,
      name: "John Kamau",
      phone: "0712 345 678",
      license: "DL12345",
      experience: "5 years",
      status: "Active",
      assignedMatatu: "KBZ 123X",
    },
    {
      id: 2,
      name: "Peter Omondi",
      phone: "0723 456 789",
      license: "DL23456",
      experience: "3 years",
      status: "Active",
      assignedMatatu: "KCY 456Z",
    },
    {
      id: 3,
      name: "James Mwangi",
      phone: "0734 567 890",
      license: "DL34567",
      experience: "7 years",
      status: "Active",
      assignedMatatu: "KDG 789A",
    },
    {
      id: 4,
      name: "Samuel Kipchoge",
      phone: "0745 678 901",
      license: "DL45678",
      experience: "4 years",
      status: "On Leave",
      assignedMatatu: "KBL 321Y",
    },
    {
      id: 5,
      name: "David Njoroge",
      phone: "0756 789 012",
      license: "DL56789",
      experience: "2 years",
      status: "Active",
      assignedMatatu: "KCX 654W",
    },
  ]

  const handleEdit = (driver) => {
    setSelectedDriver(driver)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (driver) => {
    setSelectedDriver(driver)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Drivers Management</h1>
          <p className="text-muted-foreground">Manage your matatu drivers</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
              <DialogDescription>Enter the details of the new driver to add to your team.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Full Name
                </Label>
                <Input id="name" placeholder="e.g. John Kamau" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone Number
                </Label>
                <Input id="phone" placeholder="e.g. 0712 345 678" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="license" className="text-right">
                  License Number
                </Label>
                <Input id="license" placeholder="e.g. DL12345" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="experience" className="text-right">
                  Experience
                </Label>
                <Input id="experience" placeholder="e.g. 5 years" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assignedMatatu" className="text-right">
                  Assigned Matatu
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
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="onleave">On Leave</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Driver</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search drivers..."
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
            <SelectItem value="onleave">On Leave</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Driver Team</CardTitle>
          <CardDescription>Manage and monitor all your matatu drivers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Assigned Matatu</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium">{driver.name}</TableCell>
                  <TableCell>{driver.phone}</TableCell>
                  <TableCell>{driver.license}</TableCell>
                  <TableCell>{driver.experience}</TableCell>
                  <TableCell>{driver.assignedMatatu}</TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        driver.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : driver.status === "On Leave"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {driver.status}
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
                        <DropdownMenuItem onClick={() => handleEdit(driver)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(driver)}>
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
            <DialogTitle>Edit Driver</DialogTitle>
            <DialogDescription>Update the details of the selected driver.</DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Full Name
                </Label>
                <Input id="edit-name" defaultValue={selectedDriver.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Phone Number
                </Label>
                <Input id="edit-phone" defaultValue={selectedDriver.phone} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-license" className="text-right">
                  License Number
                </Label>
                <Input id="edit-license" defaultValue={selectedDriver.license} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-experience" className="text-right">
                  Experience
                </Label>
                <Input id="edit-experience" defaultValue={selectedDriver.experience} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-assignedMatatu" className="text-right">
                  Assigned Matatu
                </Label>
                <Select defaultValue={selectedDriver.assignedMatatu.toLowerCase().replace(" ", "")}>
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
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select defaultValue={selectedDriver.status.toLowerCase().replace(" ", "")}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="onleave">On Leave</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
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
              Are you sure you want to delete this driver? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="py-4">
              <p className="text-center font-medium">
                {selectedDriver.name} - {selectedDriver.license}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive">Delete Driver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

