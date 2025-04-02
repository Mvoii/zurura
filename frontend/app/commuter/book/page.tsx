"use client"

import { useState } from "react"
import { Calendar, ChevronRight, CreditCard, QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function BookMatatu() {
  const [step, setStep] = useState(1)
  const [selectedRoute, setSelectedRoute] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedSeat, setSelectedSeat] = useState("")

  const handleNext = () => {
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Book Matatu</h1>
        <p className="text-muted-foreground">Reserve your seat in advance</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "border border-input bg-background"}`}
          >
            1
          </div>
          <div className={`h-1 w-12 ${step >= 2 ? "bg-primary" : "bg-input"}`}></div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "border border-input bg-background"}`}
          >
            2
          </div>
          <div className={`h-1 w-12 ${step >= 3 ? "bg-primary" : "bg-input"}`}></div>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 3 ? "bg-primary text-primary-foreground" : "border border-input bg-background"}`}
          >
            3
          </div>
        </div>
        <div className="text-sm text-muted-foreground">Step {step} of 3</div>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Route & Time</CardTitle>
            <CardDescription>Choose your route, date and time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="route">Route</Label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger id="route">
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cbd-westlands">CBD to Westlands</SelectItem>
                  <SelectItem value="cbd-eastlands">CBD to Eastlands</SelectItem>
                  <SelectItem value="cbd-rongai">CBD to Rongai</SelectItem>
                  <SelectItem value="westlands-cbd">Westlands to CBD</SelectItem>
                  <SelectItem value="eastlands-cbd">Eastlands to CBD</SelectItem>
                  <SelectItem value="rongai-cbd">Rongai to CBD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="flex gap-2">
                <Input id="date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                <Button variant="outline" size="icon">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6:00">6:00 AM</SelectItem>
                  <SelectItem value="7:00">7:00 AM</SelectItem>
                  <SelectItem value="8:00">8:00 AM</SelectItem>
                  <SelectItem value="9:00">9:00 AM</SelectItem>
                  <SelectItem value="17:00">5:00 PM</SelectItem>
                  <SelectItem value="18:00">6:00 PM</SelectItem>
                  <SelectItem value="19:00">7:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" disabled>
              Back
            </Button>
            <Button onClick={handleNext} disabled={!selectedRoute || !selectedDate || !selectedTime}>
              Next
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Seat</CardTitle>
            <CardDescription>Choose your preferred seat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="border rounded-md p-4 bg-muted/30">
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-background">
                      <input
                        type="radio"
                        name="seat"
                        id="seat-1"
                        className="sr-only"
                        value="1"
                        onChange={(e) => setSelectedSeat(e.target.value)}
                      />
                      <label
                        htmlFor="seat-1"
                        className={`flex h-full w-full cursor-pointer items-center justify-center rounded-md ${selectedSeat === "1" ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        1
                      </label>
                    </div>
                    <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-background">
                      <input
                        type="radio"
                        name="seat"
                        id="seat-2"
                        className="sr-only"
                        value="2"
                        onChange={(e) => setSelectedSeat(e.target.value)}
                      />
                      <label
                        htmlFor="seat-2"
                        className={`flex h-full w-full cursor-pointer items-center justify-center rounded-md ${selectedSeat === "2" ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        2
                      </label>
                    </div>
                    <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-background">
                      <input
                        type="radio"
                        name="seat"
                        id="seat-3"
                        className="sr-only"
                        value="3"
                        onChange={(e) => setSelectedSeat(e.target.value)}
                      />
                      <label
                        htmlFor="seat-3"
                        className={`flex h-full w-full cursor-pointer items-center justify-center rounded-md ${selectedSeat === "3" ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        3
                      </label>
                    </div>
                    <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-background">
                      <input
                        type="radio"
                        name="seat"
                        id="seat-4"
                        className="sr-only"
                        value="4"
                        onChange={(e) => setSelectedSeat(e.target.value)}
                      />
                      <label
                        htmlFor="seat-4"
                        className={`flex h-full w-full cursor-pointer items-center justify-center rounded-md ${selectedSeat === "4" ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        4
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-background">
                      <input
                        type="radio"
                        name="seat"
                        id="seat-5"
                        className="sr-only"
                        value="5"
                        onChange={(e) => setSelectedSeat(e.target.value)}
                      />
                      <label
                        htmlFor="seat-5"
                        className={`flex h-full w-full cursor-pointer items-center justify-center rounded-md ${selectedSeat === "5" ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        5
                      </label>
                    </div>
                    <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-background">
                      <input
                        type="radio"
                        name="seat"
                        id="seat-6"
                        className="sr-only"
                        value="6"
                        onChange={(e) => setSelectedSeat(e.target.value)}
                      />
                      <label
                        htmlFor="seat-6"
                        className={`flex h-full w-full cursor-pointer items-center justify-center rounded-md ${selectedSeat === "6" ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        6
                      </label>
                    </div>
                    <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-background">
                      <input
                        type="radio"
                        name="seat"
                        id="seat-7"
                        className="sr-only"
                        value="7"
                        onChange={(e) => setSelectedSeat(e.target.value)}
                      />
                      <label
                        htmlFor="seat-7"
                        className={`flex h-full w-full cursor-pointer items-center justify-center rounded-md ${selectedSeat === "7" ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        7
                      </label>
                    </div>
                    <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-background">
                      <input
                        type="radio"
                        name="seat"
                        id="seat-8"
                        className="sr-only"
                        value="8"
                        onChange={(e) => setSelectedSeat(e.target.value)}
                      />
                      <label
                        htmlFor="seat-8"
                        className={`flex h-full w-full cursor-pointer items-center justify-center rounded-md ${selectedSeat === "8" ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        8
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-background">
                      <input
                        type="radio"
                        name="seat"
                        id="seat-9"
                        className="sr-only"
                        value="9"
                        onChange={(e) => setSelectedSeat(e.target.value)}
                      />
                      <label
                        htmlFor="seat-9"
                        className={`flex h-full w-full cursor-pointer items-center justify-center rounded-md ${selectedSeat === "9" ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        9
                      </label>
                    </div>
                    <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-background">
                      <input
                        type="radio"
                        name="seat"
                        id="seat-10"
                        className="sr-only"
                        value="10"
                        onChange={(e) => setSelectedSeat(e.target.value)}
                      />
                      <label
                        htmlFor="seat-10"
                        className={`flex h-full w-full cursor-pointer items-center justify-center rounded-md ${selectedSeat === "10" ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        10
                      </label>
                    </div>
                    <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-background">
                      <input
                        type="radio"
                        name="seat"
                        id="seat-11"
                        className="sr-only"
                        value="11"
                        onChange={(e) => setSelectedSeat(e.target.value)}
                      />
                      <label
                        htmlFor="seat-11"
                        className={`flex h-full w-full cursor-pointer items-center justify-center rounded-md ${selectedSeat === "11" ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        11
                      </label>
                    </div>
                    <div className="flex items-center justify-center h-10 w-10 rounded-md border bg-background">
                      <input
                        type="radio"
                        name="seat"
                        id="seat-12"
                        className="sr-only"
                        value="12"
                        onChange={(e) => setSelectedSeat(e.target.value)}
                      />
                      <label
                        htmlFor="seat-12"
                        className={`flex h-full w-full cursor-pointer items-center justify-center rounded-md ${selectedSeat === "12" ? "bg-primary text-primary-foreground" : ""}`}
                      >
                        12
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-background border mr-2"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-primary mr-2"></div>
                  <span className="text-sm">Selected</span>
                </div>
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full bg-muted-foreground mr-2"></div>
                  <span className="text-sm">Booked</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={!selectedSeat}>
              Next
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>Complete your booking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium">Booking Summary</h3>
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Route:</span>
                  <span className="text-sm font-medium">CBD to Westlands</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Date:</span>
                  <span className="text-sm font-medium">January 15, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Time:</span>
                  <span className="text-sm font-medium">7:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Seat:</span>
                  <span className="text-sm font-medium">Seat {selectedSeat}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total:</span>
                  <span className="text-sm font-medium">KES 70</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Payment Method</h3>
              <RadioGroup defaultValue="mpesa">
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="mpesa" id="mpesa" />
                  <Label htmlFor="mpesa" className="flex-1">
                    M-Pesa
                  </Label>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="pass" id="pass" />
                  <Label htmlFor="pass" className="flex-1">
                    Use Matatu Pass
                  </Label>
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">M-Pesa Phone Number</h3>
              <Input type="tel" placeholder="e.g. 07XX XXX XXX" />
              <p className="text-xs text-muted-foreground">You will receive an M-Pesa prompt to complete payment</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button>
              Complete Booking <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

