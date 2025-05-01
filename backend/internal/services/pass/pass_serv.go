// backend/internal/services/pass/pass_serv.go
package pass

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/Mvoii/zurura/internal/models"
	"github.com/Mvoii/zurura/internal/services/payments"
	"github.com/google/uuid"
)

var (
	ErrPassNotFound        = errors.New("pass not found")
	ErrInsufficientBalance = errors.New("insufficient balance")
)

type PassService struct {
	db             *sql.DB
	paymentService *payments.PaymentService
}

func NewPassService(db *sql.DB, paymentService *payments.PaymentService) *PassService {
	return &PassService{
		db:             db,
		paymentService: paymentService,
	}
}

// create new prepaid padd for user
func (s *PassService) CreatePrepaidPass(ctx context.Context, userID string) (*models.BusPass, error) {
	pass := &models.BusPass{
		ID:             uuid.New().String(),
		UserID:         userID,
		PassType:       "prepaid",
		Balance:        0,
		Status:         "active",
		ExpirationDate: time.Now().AddDate(1, 0, 0), // 1 year from now
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	_, err := s.db.ExecContext(ctx, `
		INSERT INTO bus_passes (id, user_id, pass_type, balance, status, expiration_date, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, pass.ID, pass.UserID, pass.PassType, pass.Balance, pass.Status, pass.ExpirationDate, pass.CreatedAt, pass.UpdatedAt)

	if err != nil {
		log.Printf("[ERROR] Failed to create pass: %v", err)
		return nil, fmt.Errorf("failed to create pass: %w", err)
	}

	return pass, nil
}

// get balance of a pass
func (s *PassService) GetBalance(ctx context.Context, passID string) (float64, error) {
	var balance float64
	err := s.db.QueryRowContext(ctx, `
		SELECT balance
		FROM bus_passes
		WHERE id = $1 And status = 'active'`,
		passID).Scan(&balance)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			log.Printf("[ERROR] Pass not found: %v", err)
			return 0, ErrPassNotFound
		}
		log.Printf("[ERROR] Failed to get balance: %v", err)
		return 0, fmt.Errorf("failed to get balance: %w", err)
	}

	return balance, nil
}

// deduct amount from pass balance automaticallt
func (s *PassService) DeductBalance(ctx context.Context, passID string, amount float64, bookingID string) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		log.Printf("[ERROR] Failed to begin transaction: %v", err)
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// lock pass row for update
	var currentBalance float64
	err = tx.QueryRowContext(ctx, `
		SELECT balance
		FROM bus_passes
		WHERE id = $1 AND status = 'active' FOR UPDATE`,
		passID,
	).Scan(&currentBalance)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			log.Printf("[ERROR] Pass not found: %v", err)
			return ErrPassNotFound
		}
		log.Printf("[ERROR] Failed to get balance: %v", err)
		return fmt.Errorf("failed to get balance: %w", err)
	}

	if currentBalance < amount {
		log.Printf("[ERROR] Insufficient balance: %v", err)
		return ErrInsufficientBalance
	}

	_, err = tx.ExecContext(ctx, `
		UPDATE bus_passes
		SET balance = balance - $1,
		updated_at = NOW()
		WHERE id = $2`,
		amount, passID,
	)
	if err != nil {
		log.Printf("[ERROR] Failed to deduct balance: %v", err)
		return fmt.Errorf("failed to update balance: %w", err)
	}

	// record transaction
	_, err = tx.ExecContext(ctx, `
		INSERT INTO pass_transactions (pass_id, amount, type, reference_id)
		VALUES ($1, $2, $3, $4)`,
		passID, -amount, "booking", bookingID,
	)
	if err != nil {
		log.Printf("[ERROR] Failed to record transaction: %v", err)
		return fmt.Errorf("failed to record transaction: %w", err)
	}

	return tx.Commit()
}

// add funds to a pass
func (s *PassService) ProcessTopUp(ctx context.Context, passID string, amount float64, paymentMethod payments.PaymentMethod) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		log.Printf("[ERROR] Failed to begin transaction: %v", err)
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// lock pass row for update
	// process payment first
	paymentReq := payments.PaymentRequest{
		Amount:        amount,
		PaymentMethod: paymentMethod,
		Description:   "Top-up bus pass",
	}

	paymentResp, errr := s.paymentService.ProcessPayment(ctx, paymentReq)
	if errr != nil {
		log.Printf("[ERROR] Failed to process payment: %v", errr)
		return fmt.Errorf("failed to process payment: %w", errr)
	}

	// update pass balance
	_, err = tx.ExecContext(ctx, `
		UPDATE bus_passes
		SET balance = balance + $1
		WHERE id = $2`,
		amount, passID,
	)
	if err != nil {
		log.Printf("[ERROR] Failed to update balance: %v", err)
		return fmt.Errorf("failed to update balance: %w", err)
	}

	// record transaction
	_, err = tx.ExecContext(ctx, `
		INSERT INTO pass_transactions
			(pass_id, amount, type, reference_id)
		VALUES ($1, $2, $3, $4)`,
		passID, amount, "topup", paymentResp.TransactionID,
	)
	if err != nil {
		log.Printf("[ERROR] Failed to record transaction: %v", err)
		return fmt.Errorf("failed to record transaction: %w", err)
	}

	return tx.Commit()
}

func handlePassError(err error) error {
	if errors.Is(err, sql.ErrNoRows) {
		return ErrPassNotFound
	}
	if errors.Is(err, ErrInsufficientBalance) {
		return ErrInsufficientBalance
	}
	return fmt.Errorf("pass service error: %w", err)
}
