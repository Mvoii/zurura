package models

import "time"

type Driver struct {
	ID             string    `json:"id" db:"id"`
	BusID          string    `json:"bus_id" db:"bus_id"`
	Name           string    `json:"name" db:"name"`
	DriverPhotoURL string    `json:"driver_photo_url" db:"driver_photo_url"`
	LicenseNumber  string    `json:"license_number" db:"license_number"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}
