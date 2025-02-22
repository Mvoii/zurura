package models

import "time"

type BusStop struct {
	ID        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Latitude  float64   `json:"latitude" db:"latitude"`
	Longitude float64   `json:"longitude" db:"longitude"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
