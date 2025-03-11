// backend/internal/models/loyalty_discounts.go
package models

import "time"

type LoyaltyDiscounts struct {
	ID                 string    `json:"id" db:"id"`
	UserId             string    `json:"user_id" db:"user_id"`
	DiscountPercentage float64   `json:"discount_percentage" db:"discount_percentage"`
	RidesCount         int       `json:"rides_count" db:"rides_count"`
	CreatedAt          time.Time `json:"created_at" db:"created_at"`
	UpdatedAt          time.Time `json:"updated_at" db:"updated_at"`
}
