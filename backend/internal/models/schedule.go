package models

import "time"

type Schedule struct {
	ID                 string    `json:"id" db:"id"`
	RouteID            string    `json:"route_id" db:"route_id"`
	BusID              string    `json:"bus_id" db:"bus_id"`
	StopID             string    `json:"stop_id" db:"stop_id"`
	DayOfWeek          int       `json:"day_of_week" db:"day_of_week"`
	IsActive           bool      `json:"is_active" db:"is_active"`
	ScheduledDeparture time.Time `json:"departure_time" db:"scheduled_departure"`
	ScheduledArrival   time.Time `json:"scheduled_arrival" db:"scheduled_arrival"`
	CreatedAt          time.Time `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time `json:"updated_at" db:"updated_at"`
}
