// backend/internal/models/bus_route_assignment.go
package models

import "time"

type BusRouteAssignment struct {
    ID          string    `json:"id" db:"id"`
    BusID       string    `json:"bus_id" db:"bus_id"`
    RouteID     string    `json:"route_id" db:"route_id"`
    OperatorID  string    `json:"operator_id" db:"operator_id"`
    Status      string    `json:"status" db:"status"` // active, inactive, maintenance
    StartDate   time.Time `json:"start_date" db:"start_date"`
    EndDate     time.Time `json:"end_date" db:"end_date"`
    CreatedAt   time.Time `json:"created_at" db:"created_at"`
    UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}
