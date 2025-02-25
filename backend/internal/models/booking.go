package models

import "time"

type Booking struct {
	ID          string    `json:"id" db:"id"`
	UserID      string    `json:"user_id" db:"user_id"`
	BusID       string    `json:"bus_id" db:"bus_id"`
	RouteID     string    `json:"route_id" db:"route_id"`
	BusStopID		string	  `json:"bus_stop_id" db:"bus_stop_id"`
	BookingTime time.Time `json:"booking_time" db:"booking_time"`
	Status      string    `json:"status" db:"status"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}
