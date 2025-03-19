package models

import "time"

type Notification struct {
	ID               string    `json:"id" db:"id"`
	UserID           string    `json:"user_id" db:"user_id"`
	Type             string    `json:"type" db:"type"`
	NotificationType string    `json:"notification_type" db:"notification_type"`
	Message          string    `json:"message" db:"message"`
	DeliveredAt      time.Time `json:"delivered_at" db:"delivered_at"`
	ReadAt           time.Time `json:"read_at" db:"read_at"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
}
