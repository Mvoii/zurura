"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash, MoreHorizontal, QrCode, Ticket, Calendar, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for passes
const passes = [
  {
    id: "1",
    name: "Daily Pass",
    type: "Daily",
    price: 100,
    description: "Valid for unlimited rides for one day",
    validityPeriod: "24 hours",
    status: "Active",
    salesCount: 1250,
    revenue: 125000,
  },
  {
    id: "2",
    name: "Weekly Pass",
    type: "Weekly",
    price: 600,
    description: "Valid for unlimited rides for one week",
    validityPeriod: "7 days",
    status: "Active",
    salesCount: 450,
    revenue: 270000,
  },
  {
    id: "3",
    name: "Monthly Pass",
    type: "Monthly",
    price: 2000,
    description: "Valid for unlimited rides for one month",
    validityPeriod: "30 days",
    status: "Active",
    salesCount: 320,
    revenue: 640000,
  },
  {
    id: "4",
    name: "Student Monthly",
    type: "Monthly",
    price: 1500,
    description: "Discounted monthly pass for students",
    validityPeriod: "30 days",
    status: "Active",
    salesCount: 180,
    revenue: 270000,
  },
  {
    id: "5",
    name: "Weekend Pass",
    type: "Special",
    price: 300,
    description: "Valid for unlimited rides during weekends",
    validityPeriod: "Weekend only",
    status: "Inactive",
    salesCount: 0,
    revenue: 0,
  },
]

// Mock data for pass sales
const passSales = [
  {
    id: "1",
    passName: "Monthly Pass",
    customerName: "John Doe",
    customerPhone: "0712 345 678",
    purchaseDate: "2025-01-15",
    expiryDate: "2025-02-14",
    amount: 2000,
    status: "Active",
  },
  {
    id: "2",
    passName: "Weekly Pass",
    customerName: "Jane Smith",
    customerPhone: "0723 456 789",
    purchaseDate: "2025-01-18",
    expiryDate: "2025-01-25",
    amount: 600,
    status: "Active",
  },
  {
    id: "3",
    passName: "Daily Pass",
    customerName: "Peter Omondi",
    customerPhone: "0734 567 890",
    purchaseDate: "2025-01-20",
    expiryDate: "2025-01-21",
    amount: 100,
    status: "Expired",
  },
  {
    id: "4",
    passName: "Student Monthly",
    customerName: "Mary Wanjiku",
    customerPhone: "0745 678 901",
    purchaseDate: "2025-01-10",
    expiryDate: "2025-02-09",
    amount: 1500,
    status: "Active",
  },
  {
    id: "5",
    passName: "Monthly Pass",
    customerName: "James Mwangi",
    customerPhone: "0756 789 012",
    purchaseDate: "2025-01-05",
    expiryDate: "2025-02-04",
    amount: 2000,
    status: "Active",
  },
]

export default function PassesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPass, setSelectedPass] = useState(null)
  const [selectedPassType, setSelectedPassType] = useState("all")

  const handleEdit = (pass) => {
    setSelectedPass(pass)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (pass) => {
    setSelectedPass(pass)
    setIsDeleteDialogOpen(true)
  }

  const filteredPasses = passes.filter((pass) => {
    const matchesSearch =
      pass.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pass.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedPassType === "all" || pass.type === selectedPassType

    return matchesSearch && matchesType
  })

  const filteredPassSales = passSales.filter(
    (sale) =>
      sale.passName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customerPhone.includes(searchQuery),
  )

  const totalRevenue = passes.reduce((sum, pass) => sum + pass.revenue, 0)
  const totalSales = passes.reduce((sum, pass) => sum + pass.salesCount, 0)
  const activePasses = passSales.filter((sale) => sale.status === "Active").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Digital Passes</h1>
          <p className="text-muted-foreground">Manage your digital pass offerings and sales</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Pass
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Pass</DialogTitle>
              <DialogDescription>Enter the details of the new digital pass to add to your offerings.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pass-name" className="text-right">
                  Pass Name
                </Label>
                <Input id="pass-name" placeholder="e.g. Monthly Pass" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pass-type" className="text-right">
                  Pass Type
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pass-price" className="text-right">
                  Price (KES)
                </Label>
                <Input id="pass-price" type="number" placeholder="e.g. 2000" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pass-validity" className="text-right">
                  Validity Period
                </Label>
                <Input id="pass-validity" placeholder="e.g. 30 days" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pass-description" className="text-right">
                  Description
                </Label>
                <Input id="pass-description" placeholder="Brief description of the pass" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pass-status" className="text-right">
                  Status
                </Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Pass</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pass Revenue</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Passes Sold</CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Passes</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePasses}</div>
            <p className="text-xs text-muted-foreground">+5.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Search passes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Select value={selectedPassType} onValueChange={setSelectedPassType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="Special">Special</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="passes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="passes">Pass Management</TabsTrigger>
          <TabsTrigger value="sales">Pass Sales</TabsTrigger>
          <TabsTrigger value="analytics">Pass Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="passes">
          <Card>
            <CardHeader>
              <CardTitle>Digital Pass Offerings</CardTitle>
              <CardDescription>Manage your digital pass products</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pass Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price (KES)</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPasses.map((pass) => (
                    <TableRow key={pass.id}>
                      <TableCell className="font-medium">{pass.name}</TableCell>
                      <TableCell>{pass.type}</TableCell>
                      <TableCell>{pass.price.toLocaleString()}</TableCell>
                      <TableCell>{pass.validityPeriod}</TableCell>
                      <TableCell className="max-w-xs truncate">{pass.description}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            pass.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {pass.status}
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
                            <DropdownMenuItem onClick={() => handleEdit(pass)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(pass)}>
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

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Pass Sales</CardTitle>
              <CardDescription>View and manage digital pass sales</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pass Type</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Amount (KES)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPassSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.passName}</TableCell>
                      <TableCell>
                        <div>
                          <div>{sale.customerName}</div>
                          <div className="text-xs text-muted-foreground">{sale.customerPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(sale.purchaseDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(sale.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>{sale.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            sale.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {sale.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <QrCode className="mr-2 h-4 w-4" />
                          View QR
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pass Sales by Type</CardTitle>
                <CardDescription>Distribution of pass sales by type</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="h-full w-full">
                  {/* Pass Sales Chart Visualization */}
                  <div className="flex h-full flex-col">
                    <div className="flex justify-between pb-2">
                      {passes
                        .filter((p) => p.status === "Active")
                        .map((pass, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">{pass.type}</span>
                          </div>
                        ))}
                    </div>
                    <div className="relative flex h-full items-end gap-2">
                      {passes
                        .filter((p) => p.status === "Active")
                        .map((pass, i) => {
                          const height = `${(pass.salesCount / Math.max(...passes.map((p) => p.salesCount))) * 100}%`
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center">
                              <div
                                className="w-full bg-zurura-500 rounded-t-sm"
                                style={{ height }}
                                title={`${pass.salesCount.toLocaleString()} passes sold`}
                              ></div>
                            </div>
                          )
                        })}
                    </div>
                    <div className="flex justify-between pt-2">
                      {passes
                        .filter((p) => p.status === "Active")
                        .map((pass, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <span className="text-xs font-medium">{pass.salesCount}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pass Revenue by Type</CardTitle>
                <CardDescription>Distribution of revenue by pass type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {passes
                    .filter((p) => p.status === "Active")
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((pass, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{pass.name}</span>
                          <span className="text-sm font-medium">KES {pass.revenue.toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-zurura-500"
                            style={{
                              width: `${(pass.revenue / totalRevenue) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{Math.round((pass.revenue / totalRevenue) * 100)}% of total revenue</span>
                          <span>{pass.salesCount} passes sold</span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pass Expiry Timeline</CardTitle>
                <CardDescription>Upcoming pass expirations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {passSales
                    .filter((sale) => sale.status === "Active")
                    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
                    .slice(0, 5)
                    .map((sale, i) => {
                      const expiryDate = new Date(sale.expiryDate)
                      const today = new Date()
                      const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))

                      return (
                        <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{sale.passName}</p>
                            <p className="text-xs text-muted-foreground">{sale.customerName}</p>
                            <div className="flex items-center text-xs">
                              <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Expires: {new Date(sale.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              daysLeft <= 3 ? "text-red-600" : daysLeft <= 7 ? "text-yellow-600" : "text-green-600"
                            }`}
                          >
                            {daysLeft} days left
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pass Usage Statistics</CardTitle>
                <CardDescription>How customers are using their passes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Usage Rate</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-zurura-500" style={{ width: "78%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">Percentage of pass value utilized by customers</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pass Renewal Rate</span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-zurura-600" style={{ width: "65%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">Percentage of customers who renew their passes</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">First-time Buyers</span>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-zurura-700" style={{ width: "35%" }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">Percentage of new customers buying passes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pass</DialogTitle>
            <DialogDescription>Update the details of the selected pass.</DialogDescription>
          </DialogHeader>
          {selectedPass && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-pass-name" className="text-right">
                  Pass Name
                </Label>
                <Input id="edit-pass-name" defaultValue={selectedPass.name} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-pass-type" className="text-right">
                  Pass Type
                </Label>
                <Select defaultValue={selectedPass.type.toLowerCase()}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-pass-price" className="text-right">
                  Price (KES)
                </Label>
                <Input id="edit-pass-price" type="number" defaultValue={selectedPass.price} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-pass-validity" className="text-right">
                  Validity Period
                </Label>
                <Input id="edit-pass-validity" defaultValue={selectedPass.validityPeriod} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-pass-description" className="text-right">
                  Description
                </Label>
                <Input id="edit-pass-description" defaultValue={selectedPass.description} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-pass-status" className="text-right">
                  Status
                </Label>
                <Select defaultValue={selectedPass.status.toLowerCase()}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
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
              Are you sure you want to delete this pass? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedPass && (
            <div className="py-4">
              <p className="text-center font-medium">
                {selectedPass.name} - KES {selectedPass.price.toLocaleString()}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive">Delete Pass</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

