package models

import "time"

type BusOperator struct {
	ID          string    `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	ContactInfo string    `json:"contact_info" db:"contact_info"`
	Email       string    `json:"email" db:"email"`
	Address     string    `json:"address" db:"address"`
	Phone       string    `json:"phone" db:"phone"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}
