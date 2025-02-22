package models

import "time"

type Payment struct {
	ID            string    `json:"id" db:"id"`
	UserID        string    `json:"user_id" db:"user_id"`
	Amount        float64   `json:"amount" db:"amount"`
	PaymentMethod string    `json:"payment_method" db:"payment_method"`
	PaymentStatus string    `json:"payment_status" db:"payment_status"`
	TransactionID string    `json:"transaction_id" db:"transaction_id"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}
