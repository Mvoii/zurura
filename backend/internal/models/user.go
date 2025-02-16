// backend/models/user.go
package models

import "time"

type User struct {
	ID        string    `json:"id" db:"id"`
	Email     string    `json:"email" db:"email"`
	Name      string    `json:"name" db:"name"`
	School    string    `json:"school" db:"school"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type BusPass struct {
	ID        string    `json:"id" db:"id"`
	UserId    string    `json:"user_id" db:"user_id"`
	Type      string    `json:"type" db:"type"`
	Balance   float64   `json:"balance" db:"balance"`
	ExpiresAt time.Time `json:"expires_at" db:"expires_at"`
	CreatedAt time.Time `json:"creeated_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
