package payments

import (
	"context"
	"errors"
	"fmt"
	"time"
)

// MockPaymentService provides a mock implementation of the PaymentService interface
// This is used for testing and development environments
type MockPaymentService struct{}

func NewMockPaymentService() *MockPaymentService {
	return &MockPaymentService{}
}

func (m *MockPaymentService) ProcessPayment(ctx context.Context, req PaymentRequest) (*PaymentResponse, error) {
	transactionID := fmt.Sprintf("MOCK_%d", time.Now().UnixNano())

	// Simulate payment processing
	time.Sleep(200 * time.Millisecond)

	// For testing, fail payments for specific amounts
	if req.Amount == 0 {
		return nil, errors.New("zero amount payment not allowed")
	}

	if req.Amount > 10000 {
		return nil, errors.New("amount exceeds maximum allowed")
	}

	response := &PaymentResponse{
		TransactionID: transactionID,
		Status:        PaymentStatusCompleted,
		Amount:        req.Amount,
		Currency:      req.Currency,
		Timestamp:     time.Now(),
		PaymentMethod: req.PaymentMethod,
		Metadata:      map[string]interface{}{"mocked": true},
		BusPassID:     "", // Empty for non-bus-pass payments
	}

	return response, nil
}

// VerifyPayment implements payment verification
func (m *MockPaymentService) VerifyPayment(ctx context.Context, transactionID string) (*PaymentResponse, error) {
	// Simulate network delay
	time.Sleep(200 * time.Millisecond)

	// In a real implementation, this would verify with the payment gateway
	return &PaymentResponse{
		TransactionID: transactionID,
		Status:        PaymentStatusCompleted,
		Timestamp:     time.Now(),
		Metadata:      map[string]interface{}{"verified": true},
	}, nil
}

// RefundPayment implements refund processing
func (m *MockPaymentService) RefundPayment(ctx context.Context, transactionID string) error {
	// Simulate network delay
	time.Sleep(300 * time.Millisecond)

	// Always succeed for mock implementation
	return nil
}

// GetPaymentStatus implements status checking
func (m *MockPaymentService) GetPaymentStatus(ctx context.Context, transactionID string) (PaymentStatus, error) {
	// Simulate network delay
	time.Sleep(100 * time.Millisecond)

	// In a real implementation, this would check with the payment gateway
	return PaymentStatusCompleted, nil
}

// CancelPayment implements payment cancellation
func (m *MockPaymentService) CancelPayment(ctx context.Context, transactionID string) error {
	// Simulate network delay
	time.Sleep(200 * time.Millisecond)

	// Always succeed for mock implementation
	return nil
}
