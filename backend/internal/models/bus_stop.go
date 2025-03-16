package models

import "time"

type BusStop struct {
	ID                  string    `json:"id" db:"id"`
	Name                string    `json:"name" db:"name"`
	LandmarkDescription string    `json:"landmark_description" db:"landmark_description"`
	Latitude            float64   `json:"latitude" db:"latitude"`
	Longitude           float64   `json:"longitude" db:"longitude"`
	Geolocation         string    `json:"-" db:"geolocation"`
	CreatedAt           time.Time `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time `json:"updated_at" db:"updated_at"`
}
