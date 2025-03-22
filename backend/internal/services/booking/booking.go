// backend/internal/services/booking/booking.go
package booking

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"

	"github.com/Mvoii/zurura/internal/errors"
	"github.com/Mvoii/zurura/internal/models"
	"github.com/Mvoii/zurura/internal/services/payments"
)

type BookingService struct {
	db             *sql.DB
	paymentService payments.PaymentService
}

func NewBookingService(db *sql.DB, ps payments.PaymentService) *BookingService {
	return &BookingService{
		db:             db,
		paymentService: ps,
	}
}

type CreateBookingRequest struct {
	BusID         string
	SeatNumbers   []string
	PaymentMethod payments.PaymentMethod
	UserID        string
}

func (s *BookingService) CreateBooking(ctx context.Context, req CreateBookingRequest) (*models.Booking, error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// 1. Validate seat availability
	if err := s.validateSeatAvailability(ctx, tx, req.BusID, req.SeatNumbers); err != nil {
		return nil, err
	}

	// 2. Calculate fare
	fare, err := s.calculateFare(ctx, tx, req.BusID, len(req.SeatNumbers))
	if err != nil {
		return nil, err
	}

	// 3. Process payment
	paymentResp, err := s.processPayment(ctx, req, fare)
	if err != nil {
		return nil, err
	}

	// 4. Create booking record
	booking, err := s.createBookingRecord(ctx, tx, req, fare, paymentResp)
	if err != nil {
		return nil, err
	}

	// 5. Update bus occupancy
	if err := s.updateBusOccupancy(ctx, tx, req.BusID, len(req.SeatNumbers)); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	return booking, nil
}

func (s *BookingService) validateSeatAvailability(ctx context.Context, tx *sql.Tx, busID string, seatNumbers []string) error {
	// First check if the bus exists and get its capacity
	var capacity int
	err := tx.QueryRowContext(ctx, `
		SELECT capacity 
		FROM buses 
		WHERE id = $1 AND status IN ('active', 'assigned')
	`, busID).Scan(&capacity)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("[ERROR] Bus not found or inactive: %v", err)
			return &errors.BookingError{
				Code:    "BUS_NOT_FOUND",
				Message: "Bus not found or inactive",
			}
		}
		log.Printf("[ERROR] Database error: %v", err)
		return fmt.Errorf("database error: %w", err)
	}

	// Check if number of seats requested is valid
	if len(seatNumbers) > capacity {
		log.Printf("[ERROR] Invalid seat count: %d > %d", len(seatNumbers), capacity)
		return &errors.BookingError{
			Code:    "INVALID_SEAT_COUNT",
			Message: fmt.Sprintf("Cannot book more seats than bus capacity (%d)", capacity),
		}
	}

	// Check if seats are already booked
	var bookedSeats []string
	rows, err := tx.QueryContext(ctx, `
		SELECT jsonb_array_elements_text(seats->'seat_numbers') as seat_number 
		FROM bookings 
		WHERE bus_id = $1 
		AND status != 'cancelled'
		AND expires_at > NOW()
	`, busID)

	if err != nil {
		log.Printf("[ERROR] Database error: %v", err)
		return fmt.Errorf("database error: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var seat string
		if err := rows.Scan(&seat); err != nil {
			return fmt.Errorf("error scanning booked seats: %w", err)
		}
		bookedSeats = append(bookedSeats, seat)
	}

	// Check for seat conflicts
	for _, requestedSeat := range seatNumbers {
		for _, bookedSeat := range bookedSeats {
			if requestedSeat == bookedSeat {
				log.Printf("[ERROR] Seat already booked: %s", requestedSeat)
				return &errors.BookingError{
					Code:    "SEAT_ALREADY_BOOKED",
					Message: fmt.Sprintf("Seat %s is already booked", requestedSeat),
				}
			}
		}
	}

	return nil
}

func (s *BookingService) calculateFare(ctx context.Context, tx *sql.Tx, busID string, seatCount int) (float64, error) {
	// Get base fare from bus route using the bus_route_assignments table
	var baseFare float64
	err := tx.QueryRowContext(ctx, `
		SELECT r.base_fare
		FROM buses b
		JOIN bus_route_assignments bra ON b.id = bra.bus_id
		JOIN bus_routes r ON bra.route_id = r.id
		WHERE b.id = $1
		AND bra.status = 'active'
	`, busID).Scan(&baseFare)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("[ERROR] No fare information found for bus %s", busID)
			return 0, &errors.BookingError{
				Code:    "ROUTE_NOT_FOUND",
				Message: "Could not find fare information for this bus",
			}
		}
		log.Printf("[ERROR] Database error: %v", err)
		return 0, fmt.Errorf("database error: %w", err)
	}

	// Validate that base fare is greater than zero
	if baseFare <= 0 {
		log.Printf("[ERROR] Invalid base fare: %f", baseFare)
		return 0, &errors.BookingError{
			Code:    "INVALID_FARE",
			Message: "The fare for this route is not properly configured",
		}
	}

	// Calculate total fare
	totalFare := baseFare * float64(seatCount)

	// Check for any applicable discounts
	var discount float64
	err = tx.QueryRowContext(ctx, `
		SELECT discount_percentage
		FROM loyalty_discounts
		WHERE user_id = $1
		AND expires_at > NOW()
	`, ctx.Value("user_id")).Scan(&discount)

	if err == nil && discount > 0 {
		// Apply discount if available
		totalFare = totalFare * (1 - discount/100)
	}

	// Ensure final fare is never zero or negative
	if totalFare <= 0 {
		log.Printf("[ERROR] Calculated fare is zero or negative after discounts: %f", totalFare)
		return 0, &errors.BookingError{
			Code:    "INVALID_FARE",
			Message: "Cannot process a booking with zero or negative fare",
		}
	}

	return totalFare, nil
}

func (s *BookingService) processPayment(ctx context.Context, req CreateBookingRequest, amount float64) (*payments.PaymentResponse, error) {
	// Handle different payment methods
	switch req.PaymentMethod {
	case payments.PaymentMethodBusPass:
		// Check bus pass balance and get pass ID
		var passID string
		var balance float64
		err := s.db.QueryRowContext(ctx, `
			SELECT id, balance
			FROM bus_passes
			WHERE user_id = $1
			AND status = 'active'
			AND expiration_date > NOW()
			ORDER BY expiration_date DESC
			LIMIT 1
		`, req.UserID).Scan(&passID, &balance)

		if err != nil {
			if err == sql.ErrNoRows {
				log.Printf("[ERROR] No bus pass found for user %s", req.UserID)
				return nil, errors.ErrInsufficientBalance
			}
			log.Printf("[ERROR] Database error: %v", err)
			return nil, fmt.Errorf("database error: %w", err)
		}

		if balance < amount {
			log.Printf("[ERROR] Insufficient bus pass balance: %f < %f", balance, amount)
			return nil, errors.ErrInsufficientBalance
		}

		// Deduct from bus pass
		_, err = s.db.ExecContext(ctx, `
			UPDATE bus_passes
			SET balance = balance - $1
			WHERE id = $2
		`, amount, passID)

		if err != nil {
			log.Printf("[ERROR] Database error: %v", err)
			return nil, fmt.Errorf("failed to update bus pass balance: %w", err)
		}

		return &payments.PaymentResponse{
			TransactionID: fmt.Sprintf("PASS_%d", time.Now().UnixNano()),
			Status:        payments.PaymentStatusCompleted,
			Amount:        amount,
			Timestamp:     time.Now(),
			PaymentMethod: payments.PaymentMethodBusPass,
			BusPassID:     passID,
		}, nil

	default:
		// Process through payment gateway
		paymentReq := payments.PaymentRequest{
			Amount:        amount,
			Currency:      "KES",
			PaymentMethod: req.PaymentMethod,
			UserID:        req.UserID,
			Description:   "Bus booking payment",
		}

		return s.paymentService.ProcessPayment(ctx, paymentReq)
	}
}

func (s *BookingService) createBookingRecord(ctx context.Context, tx *sql.Tx, req CreateBookingRequest, fare float64, payment *payments.PaymentResponse) (*models.Booking, error) {
	bookingID := uuid.New().String()
	now := time.Now()

	seats := models.SeatMap{
		SeatNumbers: req.SeatNumbers,
		Count:       len(req.SeatNumbers),
	}

	// Convert seats struct to JSON for PostgreSQL JSONB column
	seatsJSON, err := json.Marshal(seats)
	if err != nil {
		log.Printf("[ERROR] Failed to marshal seats to JSON: %v", err)
		return nil, fmt.Errorf("failed to marshal seats to JSON: %w", err)
	}

	// Get route_id for the bus from the bus_route_assignments table
	var routeID string
	err = tx.QueryRowContext(ctx, `
		SELECT route_id 
		FROM bus_route_assignments 
		WHERE bus_id = $1
		AND status = 'active'
	`, req.BusID).Scan(&routeID)
	if err != nil {
		log.Printf("[ERROR] Database error: %v", err)
		return nil, fmt.Errorf("failed to get route_id: %w", err)
	}

	// Create booking record with JSONB data - remove updated_at
	_, err = tx.ExecContext(ctx, `
		INSERT INTO bookings (
			id, user_id, bus_id, route_id, seats, fare, payment_method,
			status, created_at, expires_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`,
		bookingID,
		req.UserID,
		req.BusID,
		routeID,
		seatsJSON,
		fare,
		payment.PaymentMethod,
		"confirmed",
		now,
		now.Add(15*time.Minute),
	)

	if err != nil {
		log.Printf("[ERROR] Database error: %v", err)
		return nil, fmt.Errorf("failed to create booking record: %w", err)
	}

	// Create payment record
	paymentMetadata := map[string]interface{}{
		"booking_type": "bus_ride",
		"seat_count":   len(req.SeatNumbers),
		"route_id":     routeID,
	}
	
	metadataJSON, err := json.Marshal(paymentMetadata)
	if err != nil {
		log.Printf("[ERROR] Failed to marshal metadata to JSON: %v", err)
		return nil, fmt.Errorf("failed to marshal metadata to JSON: %w", err)
	}
	
	// Handle bus_pass_id - either use the value from payment or NULL
	var busPassID interface{} = nil
	if payment.BusPassID != "" {
		busPassID = payment.BusPassID
	}
	
	_, err = tx.ExecContext(ctx, `
		INSERT INTO payments (
			id, booking_id, user_id, amount, payment_method, payment_status,
			transaction_id, currency, metadata, created_at, updated_at, bus_pass_id
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
	`,
		uuid.New().String(),
		bookingID,
		req.UserID,
		fare,
		payment.PaymentMethod,
		payment.Status,
		payment.TransactionID,
		"KES", // Default currency
		metadataJSON,
		now,
		now,
		busPassID,
	)

	if err != nil {
		log.Printf("[ERROR] Database error: %v", err)
		return nil, fmt.Errorf("failed to create payment record: %w", err)
	}

	return &models.Booking{
		ID:        bookingID,
		UserID:    req.UserID,
		BusID:     req.BusID,
		RouteID:   routeID,
		Seats:     seats,
		Fare:      fare,
		Status:    "confirmed",
		CreatedAt: now,
		ExpiresAt: now.Add(15*time.Minute),
	}, nil
}

func (s *BookingService) updateBusOccupancy(ctx context.Context, tx *sql.Tx, busID string, seatCount int) error {
	_, err := tx.ExecContext(ctx, `
		UPDATE buses
		SET current_occupancy = current_occupancy + $1,
			updated_at = NOW()
		WHERE id = $2
	`, seatCount, busID)

	if err != nil {
		log.Printf("[ERROR] Database error: %v", err)
		return fmt.Errorf("failed to update bus occupancy: %w", err)
	}

	return nil
}

func (s *BookingService) CancelBooking(ctx context.Context, bookingID string, userID string) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		log.Printf("[ERROR] Failed to begin transaction for booking cancellation: %v", err)
		return fmt.Errorf("database error: %w", err)
	}
	defer tx.Rollback()

	// 1. Validate booking exists and belongs to user
	var booking struct {
		Status        string
		PaymentID     string
		Amount        float64
		PaymentMethod string
	}
	err = tx.QueryRowContext(ctx, `
		SELECT b.status, p.id, p.amount, p.payment_method
		FROM bookings b
		LEFT JOIN payments p ON b.id = p.booking_id
		WHERE b.id = $1 AND b.user_id = $2
	`, bookingID, userID).Scan(&booking.Status, &booking.PaymentID, &booking.Amount, &booking.PaymentMethod)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("[ERROR] Booking not found or does not belong to user: %v", err)
			return &errors.BookingError{
				Code:    "BOOKING_NOT_FOUND",
				Message: "Booking not found or does not belong to user",
			}
		}
		log.Printf("[ERROR] Database error while fetching booking: %v", err)
		return fmt.Errorf("database error: %w", err)
	}

	// 2. Validate booking can be cancelled
	if booking.Status == "cancelled" {
		log.Printf("[ERROR] Booking is already cancelled")
		return &errors.BookingError{
			Code:    "ALREADY_CANCELLED",
			Message: "Booking is already cancelled",
		}
	}

	if booking.Status == "completed" {
		log.Printf("[ERROR] Booking is already completed")
		return &errors.BookingError{
			Code:    "CANNOT_CANCEL_COMPLETED",
			Message: "Cannot cancel a completed booking",
		}
	}

	// 3. Process refund if payment was made
	if booking.PaymentID != "" {
		if err := s.processRefund(ctx, tx, booking.PaymentID, booking.Amount, booking.PaymentMethod); err != nil {
			log.Printf("[ERROR] Failed to process refund: %v", err)
			return err
		}
	}

	// 4. Update booking status
	_, err = tx.ExecContext(ctx, `
		UPDATE bookings
		SET status = 'cancelled'
		WHERE id = $1
	`, bookingID)

	if err != nil {
		log.Printf("[ERROR] Failed to update booking status: %v", err)
		return fmt.Errorf("failed to update booking status: %w", err)
	}

	// 5. Update bus occupancy - fixed JSONB query
	var seatCount int
	err = tx.QueryRowContext(ctx, `
		SELECT jsonb_array_length(seats->'seat_numbers')
		FROM bookings
		WHERE id = $1
	`, bookingID).Scan(&seatCount)

	if err != nil {
		log.Printf("[ERROR] Failed to get seat count: %v", err)
		return fmt.Errorf("failed to get seat count: %w", err)
	}

	_, err = tx.ExecContext(ctx, `
		UPDATE buses b
		SET current_occupancy = current_occupancy - $1,
			updated_at = NOW()
		FROM bookings bk
		WHERE bk.id = $2 AND b.id = bk.bus_id
	`, seatCount, bookingID)

	if err != nil {
		log.Printf("[ERROR] Failed to update bus occupancy: %v", err)
		return fmt.Errorf("failed to update bus occupancy: %w", err)
	}

	if err := tx.Commit(); err != nil {
		log.Printf("[ERROR] Failed to commit cancellation transaction: %v", err)
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("[INFO] Successfully cancelled booking %s for user %s", bookingID, userID)
	return nil
}

func (s *BookingService) processRefund(ctx context.Context, tx *sql.Tx, paymentID string, amount float64, paymentMethod string) error {
	// Convert string to PaymentMethod type
	method := payments.PaymentMethod(paymentMethod)

	switch method {
	case payments.PaymentMethodBusPass:
		// Refund to bus pass
		_, err := tx.ExecContext(ctx, `
			UPDATE bus_passes bp
			SET balance = balance + $1,
				updated_at = NOW()
			FROM payments p
			WHERE p.id = $2 AND p.user_id = bp.user_id
		`, amount, paymentID)

		if err != nil {
			log.Printf("[ERROR] Database error: %v", err)
			return fmt.Errorf("failed to refund bus pass: %w", err)
		}

	default:
		// Process refund through payment gateway
		if err := s.paymentService.RefundPayment(ctx, paymentID); err != nil {
			log.Printf("[ERROR] Failed to process refund: %v", err)
			return fmt.Errorf("failed to process refund: %w", err)
		}
	}

	// Update payment status
	_, err := tx.ExecContext(ctx, `
		UPDATE payments
		SET payment_status = 'refunded',
			updated_at = NOW()
		WHERE id = $1
	`, paymentID)

	if err != nil {
		log.Printf("[ERROR] Database error: %v", err)
		return fmt.Errorf("failed to update payment status: %w", err)
	}

	return nil
}
