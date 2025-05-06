package models

import "time"

type Bus struct {
	ID                string    `json:"id" db:"id"`
	OperatorID        string    `json:"operator_id" db:"operator_id"`
	RegistrationPlate string    `json:"registration_plate" db:"registration_plate"`
	Capacity          int       `json:"capacity" db:"capacity"`
	BusPhotoURL       string    `json:"bus_photo_url" db:"bus_photo_url"`
	Status            string    `json:"status" db:"status"`
	CurrentOccupancy  int       `json:"current_occupancy" db:"current_occupancy"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" db:"updated_at"`
}
