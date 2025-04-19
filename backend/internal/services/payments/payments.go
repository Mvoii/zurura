// backend/internal/services/payments/payments.go
package payments

import (
	"context"
	"fmt"
	"time"
)

// PaymentStatus represents the current state of a payment
type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusCompleted PaymentStatus = "completed"
	PaymentStatusFailed    PaymentStatus = "failed"
	PaymentStatusRefunded  PaymentStatus = "refunded"
	PaymentStatusExpired   PaymentStatus = "expired"
)

// PaymentMethod represents the available payment methods
type PaymentMethod string

const (
	PaymentMethodMPesa   PaymentMethod = "mpesa"
	PaymentMethodCash    PaymentMethod = "cash"
	PaymentMethodBusPass PaymentMethod = "bus_pass"
	PaymentMethodCard    PaymentMethod = "card"
)

// PaymentRequest represents a payment request
type PaymentRequest struct {
	Amount        float64
	Currency      string
	PaymentMethod PaymentMethod
	UserID        string
	BookingID     string
	Description   string
	Metadata      map[string]interface{} // Additional payment-specific data
}

// PaymentResponse represents a payment response
type PaymentResponse struct {
	TransactionID string                 `json:"transaction_id"`
	Status        PaymentStatus          `json:"status"`
	Amount        float64                `json:"amount"`
	Currency      string                 `json:"currency"`
	Timestamp     time.Time              `json:"timestamp"`
	PaymentMethod PaymentMethod          `json:"payment_method"`
	Metadata      map[string]interface{} `json:"metadata,omitempty"`
	BusPassID     string                 `json:"bus_pass_id,omitempty"`
}

// PaymentService defines the interface for payment operations
type PaymentService interface {
	// ProcessPayment handles the payment processing
	ProcessPayment(ctx context.Context, req PaymentRequest) (*PaymentResponse, error)

	// VerifyPayment verifies the status of a payment
	VerifyPayment(ctx context.Context, transactionID string) (*PaymentResponse, error)

	// RefundPayment processes a refund
	RefundPayment(ctx context.Context, transactionID string) error

	// GetPaymentStatus retrieves the current status of a payment
	GetPaymentStatus(ctx context.Context, transactionID string) (PaymentStatus, error)

	// CancelPayment cancels a pending payment
	CancelPayment(ctx context.Context, transactionID string) error
}

// PaymentError represents a payment-specific error
type PaymentError struct {
	Code    string
	Message string
	Err     error
}

func (e *PaymentError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("%s: %s (cause: %v)", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// Common payment errors
var (
	ErrPaymentFailed = &PaymentError{
		Code:    "PAYMENT_FAILED",
		Message: "Payment processing failed",
	}

	ErrInvalidAmount = &PaymentError{
		Code:    "INVALID_AMOUNT",
		Message: "Invalid payment amount",
	}

	ErrPaymentExpired = &PaymentError{
		Code:    "PAYMENT_EXPIRED",
		Message: "Payment has expired",
	}

	ErrRefundFailed = &PaymentError{
		Code:    "REFUND_FAILED",
		Message: "Refund processing failed",
	}
)
