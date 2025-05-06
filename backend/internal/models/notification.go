package models

import (
	"database/sql"
	"time"
)

type NotificationType string

const (
	NotificationBusArrival     NotificationType = "bus_arrival"
	NotificationDelay          NotificationType = "delay"
	NotificationBooking        NotificationType = "booking"
	NotificationPayment        NotificationType = "payment"
	NotificationRouteDeviation NotificationType = "route_deviation"
	NotificationScheduleUpdate NotificationType = "schedule_update"
	NotificationPassExpiration NotificationType = "pass_expiration"
)

type Notification struct {
	ID     string           `json:"id" db:"id"`
	UserID string           `json:"user_id" db:"user_id"`
	Type   NotificationType `json:"type" db:"type"`
	//NotificationType string    `json:"notification_type" db:"notification_type"`
	Message          string       `json:"message" db:"message"`
	DeliveredAt      sql.NullTime `json:"delivered_at" db:"delivered_at"`
	ReadAt           sql.NullTime `json:"read_at" db:"read_at"`
	CreatedAt        time.Time    `json:"created_at" db:"created_at"`
	DeliveryAttempts int          `json:"delivery_attempts" db:"delivery_attempts"`
	LastAttemptAt    sql.NullTime `json:"last_attempt_at" db:"last_attempt_at"`
}
