"use client"

import { useState } from "react"
import { Send, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function FeedbackPage() {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    // Submit feedback logic would go here
    alert("Thank you for your feedback!")
    setRating(0)
    setFeedback("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Feedback & Reviews</h1>
        <p className="text-muted-foreground">Share your experience with Zurura</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
          <CardDescription>Your feedback helps us improve our service for everyone</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>How would you rate your experience?</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Tell us about your experience</Label>
              <Textarea
                id="feedback"
                placeholder="Share your thoughts, suggestions, or report any issues..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={5}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={!rating || !feedback}>
              <Send className="mr-2 h-4 w-4" />
              Submit Feedback
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Trips</CardTitle>
          <CardDescription>Rate your recent matatu trips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">CBD to Westlands</p>
                <p className="text-sm text-muted-foreground">Today, 9:30 AM</p>
                <p className="text-xs text-muted-foreground">KBZ 123X • John Kamau</p>
              </div>
              <Button variant="outline" size="sm">
                Rate Trip
              </Button>
            </div>
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-medium">Eastlands to CBD</p>
                <p className="text-sm text-muted-foreground">Yesterday, 8:45 AM</p>
                <p className="text-xs text-muted-foreground">KCY 456Z • Peter Omondi</p>
              </div>
              <Button variant="outline" size="sm">
                Rate Trip
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">CBD to Rongai</p>
                <p className="text-sm text-muted-foreground">Jan 10, 2025, 6:15 PM</p>
                <p className="text-xs text-muted-foreground">KDG 789A • James Mwangi</p>
              </div>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">4.0</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

