package models

import "time"

type BusOperator struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	ContactInfo string    `json:"contact_info" db:"contact_info"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}
