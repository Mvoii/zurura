// backend/internal/models/bookings.go
package models

import "time"

type Booking struct {
	ID              string    `json:"id" db:"id"`
	UserID          string    `json:"user_id" db:"user_id"`
	BusID           string    `json:"bus_id" db:"bus_id"`
	RouteID         string    `json:"route_id" db:"route_id"`
	BoardingStopID  string    `json:"boarding_stop_id" db:"bus_stop_id"`
	BoardingStopName string    `json:"boarding_stop_name" db:"boarding_stop_name"`
	AlightingStopID string    `json:"alighting_stop_id" db:"alighting_stop_id"`
	AlightingStopName string    `json:"alighting_stop_name" db:"alighting_stop_name"`
	Seats           SeatMap   `json:"seats" db:"seats"`
	Fare            float64   `json:"fare" db:"fare"`
	BookingTime     time.Time `json:"booking_time" db:"booking_time"`
	Status          string    `json:"status" db:"status"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	ExpiresAt       time.Time `json:"expires_at" db:"expires_at"`
	BoardedAt       time.Time `json:"boarded_at" db:"boarded_at"`
}

type SeatMap struct {
	SeatNumbers []string `json:"seat_numbers"`
	Count       int      `json:"count"`
}
