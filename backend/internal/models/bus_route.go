package models

import "time"

type BusRoute struct {
	ID          string    `json:"id" db:"id"`
	RouteName   string    `json:"route_name" db:"route_name"`
	Description string    `json:"description" db:"description"`
	Origin      string    `json:"origin" db:"origin"`
	Destination string    `json:"destination" db:"destination"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type RouteBusStop struct {
	ID          string    `json:"id" db:"id"`
	RouteID     string    `json:"route_id" db:"route_id"`
	BusStopID   string    `json:"bus_stop_id" db:"bus_stop_id"`
	StopOrder   int       `json:"stop_order" db:"stop_order"`
	Timetable   []string  `json:"timetable" db:"timetable"`
	StopDetails BusStop   `json:"stop_details"`
	TravelTime  int       `json:"travel_time" db:"estimated_arrival_time"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}
