package models

import "time"

type BusPass struct {
	ID             string    `json:"id" db:"id"`
	UserID         string    `json:"user_id" db:"user_id"`
	PassType       string    `json:"pass_type" db:"pass_type"`
	Balance        float64   `json:"balance" db:"balance"`
	Fee            float64   `json:"fee" db:"fee"`
	Status         string    `json:"status" db:"status"`
	ExpirationDate time.Time `json:"expiration_date" db:"expiration_date"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time `json:"updated_at" db:"updated_at"`
}
