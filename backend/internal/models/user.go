// backend/models/user.go
package models

import "time"

type User struct {
	ID              string `json:"id" db:"id"`
	SchoolName      string `json:"school_name" db:"school_name"`
	Email           string `json:"email" db:"email"`
	PasswordHash    string `json:"password_hash" db:"password_hash"`
	FirstName       string `json:"first_name" db:"first_name"`
	LastName        string `json:"last_name" db:"last_name"`
	PhoneNumber     string `json:"phone_number" db:"phone_number"`
	ProfilePhotoURL string `json:"profile_photo_url" db:"profile_photo_url"`
	RideCount       int    `json:"ride_count" db:"ride_count"`

	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}
