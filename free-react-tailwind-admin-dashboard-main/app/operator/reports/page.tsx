"use client"

import { useState } from "react"
import { Download, FileText, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reportType, setReportType] = useState("revenue")

  const generateReport = () => {
    // Logic to generate report would go here
    alert(`Generating ${reportType} report from ${startDate} to ${endDate}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and view operational reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select parameters to generate a custom report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue Report</SelectItem>
                  <SelectItem value="trips">Trips Report</SelectItem>
                  <SelectItem value="passengers">Passengers Report</SelectItem>
                  <SelectItem value="drivers">Drivers Performance</SelectItem>
                  <SelectItem value="matatus">Matatu Utilization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <div className="flex gap-2">
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <div className="flex gap-2">
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} disabled={!reportType || !startDate || !endDate} className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Reports</TabsTrigger>
          <TabsTrigger value="trips">Trip Reports</TabsTrigger>
          <TabsTrigger value="performance">Performance Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Monthly Revenue Report</CardTitle>
                <CardDescription>January 2025</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 border-b p-3 font-medium">
                  <div>Route</div>
                  <div>Total Trips</div>
                  <div>Total Passengers</div>
                  <div>Total Revenue</div>
                </div>
                <div className="grid grid-cols-4 border-b p-3">
                  <div>CBD to Westlands</div>
                  <div>245</div>
                  <div>3,675</div>
                  <div>KES 257,250</div>
                </div>
                <div className="grid grid-cols-4 border-b p-3">
                  <div>CBD to Eastlands</div>
                  <div>198</div>
                  <div>2,970</div>
                  <div>KES 148,500</div>
                </div>
                <div className="grid grid-cols-4 border-b p-3">
                  <div>CBD to Rongai</div>
                  <div>156</div>
                  <div>4,524</div>
                  <div>KES 316,680</div>
                </div>
                <div className="grid grid-cols-4 border-b p-3">
                  <div>Westlands to CBD</div>
                  <div>232</div>
                  <div>3,480</div>
                  <div>KES 243,600</div>
                </div>
                <div className="grid grid-cols-4 border-b p-3">
                  <div>Eastlands to CBD</div>
                  <div>187</div>
                  <div>2,805</div>
                  <div>KES 140,250</div>
                </div>
                <div className="grid grid-cols-4 p-3 font-medium">
                  <div>Total</div>
                  <div>1,018</div>
                  <div>17,454</div>
                  <div>KES 1,106,280</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trips" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Weekly Trips Report</CardTitle>
                <CardDescription>January 8-14, 2025</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 border-b p-3 font-medium">
                  <div>Date</div>
                  <div>Matatu</div>
                  <div>Driver</div>
                  <div>Route</div>
                  <div>Trips Completed</div>
                </div>
                <div className="grid grid-cols-5 border-b p-3">
                  <div>Jan 8, 2025</div>
                  <div>KBZ 123X</div>
                  <div>John Kamau</div>
                  <div>CBD to Westlands</div>
                  <div>12</div>
                </div>
                <div className="grid grid-cols-5 border-b p-3">
                  <div>Jan 9, 2025</div>
                  <div>KCY 456Z</div>
                  <div>Peter Omondi</div>
                  <div>CBD to Eastlands</div>
                  <div>10</div>
                </div>
                <div className="grid grid-cols-5 border-b p-3">
                  <div>Jan 10, 2025</div>
                  <div>KDG 789A</div>
                  <div>James Mwangi</div>
                  <div>CBD to Rongai</div>
                  <div>8</div>
                </div>
                <div className="grid grid-cols-5 border-b p-3">
                  <div>Jan 11, 2025</div>
                  <div>KBL 321Y</div>
                  <div>Samuel Kipchoge</div>
                  <div>Westlands to CBD</div>
                  <div>11</div>
                </div>
                <div className="grid grid-cols-5 border-b p-3">
                  <div>Jan 12, 2025</div>
                  <div>KCX 654W</div>
                  <div>David Njoroge</div>
                  <div>Eastlands to CBD</div>
                  <div>9</div>
                </div>
                <div className="grid grid-cols-5 p-3 font-medium">
                  <div>Total</div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div>50</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Driver Performance Report</CardTitle>
                <CardDescription>January 2025</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-5 border-b p-3 font-medium">
                  <div>Driver</div>
                  <div>Trips Completed</div>
                  <div>Passengers</div>
                  <div>Revenue Generated</div>
                  <div>Rating</div>
                </div>
                <div className="grid grid-cols-5 border-b p-3">
                  <div>John Kamau</div>
                  <div>245</div>
                  <div>3,675</div>
                  <div>KES 257,250</div>
                  <div>4.8/5</div>
                </div>
                <div className="grid grid-cols-5 border-b p-3">
                  <div>Peter Omondi</div>
                  <div>198</div>
                  <div>2,970</div>
                  <div>KES 148,500</div>
                  <div>4.6/5</div>
                </div>
                <div className="grid grid-cols-5 border-b p-3">
                  <div>James Mwangi</div>
                  <div>156</div>
                  <div>4,524</div>
                  <div>KES 316,680</div>
                  <div>4.9/5</div>
                </div>
                <div className="grid grid-cols-5 border-b p-3">
                  <div>Samuel Kipchoge</div>
                  <div>232</div>
                  <div>3,480</div>
                  <div>KES 243,600</div>
                  <div>4.7/5</div>
                </div>
                <div className="grid grid-cols-5 border-b p-3">
                  <div>David Njoroge</div>
                  <div>187</div>
                  <div>2,805</div>
                  <div>KES 140,250</div>
                  <div>4.5/5</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

