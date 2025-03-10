package models

import (
	"time"
)

type Payment struct {
	ID                     string    `json:"id" db:"id"`
	UserID                 string    `json:"user_id" db:"user_id"`
	Amount                 float64   `json:"amount" db:"amount"`
	BusId                  string    `json:"bus_id" db:"bus_id"`
	PaymentMethod          string    `json:"payment_method" db:"payment_method"`
	PaymentStatus          string    `json:"payment_status" db:"payment_status"`
	TransactionID          string    `json:"transaction_id" db:"transaction_id"`
	PaymentGatewayResponse string    `json:"payment_gateway_response" db:"payment_gateway_response"`
	CreatedAt              time.Time `json:"created_at" db:"created_at"`
	UpdatedAt              time.Time `json:"updated_at" db:"updated_at"`
	ExpiresAt              time.Time `json:"expires_at" db:"expires_at"` // for subscription passes
}
