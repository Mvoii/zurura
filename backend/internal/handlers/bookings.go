// backend/internal/handlers/bookings.go
package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/Mvoii/zurura/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type BookingHandler struct {
	db          *sql.DB
	paymentGate PaymentService
}

type PaymentService interface {
	Process(c *gin.Context, amount float64) error
}

func NewBookingHandler(db *sql.DB, pg PaymentService) *BookingHandler {
	return &BookingHandler{db: db, paymentGate: pg}
}

func (h *BookingHandler) CreateBooking(c *gin.Context) {
	var req struct {
		BusID         string   `json:"bus_id" binding:"required"`
		SeatNumbers   []string `json:"seat_numbers" binding:"required"`
		PaymentMethod string   `json:"payment_method" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	tx, err := h.db.Begin()
	if err != nil {
		log.Printf("[ERROR] Transaction begin failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		return
	}
	defer tx.Rollback()

	// seat availability
	var (
		available        bool
		capacity         int
		currentOccupancy int
		routeID          string
	)
	err = tx.QueryRow(`
		SELECT 
			b.capacity, 
			b.current_occupancy, 
			b.route_id,
			(b.capacity - b.current_occupancy) >= $1
		FROM buses b 
		WHERE b.id = $2
	`, len(req.SeatNumbers), req.BusID).Scan(
		&capacity,
		&currentOccupancy,
		&routeID,
		&available,
	)
	if err != nil {
		log.Printf("[ERROR] Seat check failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Seat availability check failed"})
		return
	}

	if !available {
		c.JSON(http.StatusConflict, gin.H{"error": fmt.Sprintf("only %d available", capacity-currentOccupancy)})
		return
	}

	fare, err := calculateFare(tx, req.BusID, len(req.SeatNumbers))
	if err != nil {
		log.Printf("[ERROR] Fare calculation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Fare calculation failed"})
		return
	}

	switch req.PaymentMethod {
	case "bus_pass":
		if err := deductFromPass(userID.(string), fare, tx); err != nil {
			c.JSON(http.StatusPaymentRequired, gin.H{"error": err.Error()})
			return
		}

	default:
		if err := h.paymentGate.Process(c, fare); err != nil {
			log.Printf("[ERROR] %v", err)
			c.JSON(http.StatusPaymentRequired, gin.H{"error": "Payment processing failed"})
			return
		}
	}

	bookingID := uuid.New().String()
	seatsJSON, _ := json.Marshal(models.SeatMap{
		Numbers: req.SeatNumbers,
		Count:   len(req.SeatNumbers),
	})

	_, err = tx.Exec(`
		INSERT INTO bookings (id, user_id, bus_id, route_id, seats, fare, payment_method, status, created_at, expires_at) VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed', NOW(), $8)
	`, bookingID, userID, req.BusID, routeID, seatsJSON, fare, req.PaymentMethod, time.Now().Add(15*time.Minute))
	if err != nil {
		log.Printf("[ERROR] booking creation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "booking creation failed"})
		return
	}

	_, err = tx.Exec(`
		UPDATE buses
		SET current_company = current_occupancy + $1
		WHERE id = $2`, len(req.SeatNumbers), req.BusID)

	if err != nil {
		log.Printf("[ERROR] bus update failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "bus update failed"})
		return
	}

	if err := tx.Commit(); err != nil {
		log.Printf("[ERROR] Transaction commit failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Transaction failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"booking_id": bookingID,
		"expires_at": time.Now().Add(15 * time.Minute).Format(time.RFC3339),
	})
}

// helpers
func deductFromPass(userID string, amount float64, tx *sql.Tx) error {
	var pass models.BusPass
	err := tx.QueryRow(`
		SELECT id, balance
		FROM bus_passes
		WHERE user_id = $1
		AND status = 'active'
		AND expiration_date > NOW()
		ORDER BY expiration_date DESC
		LIMIT 1
	`, userID).Scan(&pass.ID, &pass.Balance)
	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New("no active bus pass found")
		}
		return fmt.Errorf("database error: %v", err)
	}

	if pass.Balance < amount {
		return fmt.Errorf("insufficient pass balance. Availabe: %.2f", pass.Balance)
	}

	_, err = tx.Exec(`
		UPDATE bus_passes
		SET balance = balance - $1
		WHERE id = $2
	`, amount, pass.ID)
	if err != nil {
		return fmt.Errorf("balance update failed: %v", err)
	}

	/* 	_, err = tx.Exec(`
	   		INSERT INTO pass_usage (...) VALUES ($1, $2, $3)
	   	`, pass.ID, bookingID, amount)
	   	if err != nil {
	   		log.Printf("[ERROR] %v", err)
	   		return errors.New(err.Error())
	   	}
	*/
	return nil
}

func calculateFare(tx *sql.Tx, busID string, seatCount int) (float64, error) {
	var farePerSeat float64
	err := tx.QueryRow(`
		SELECT fare_per_seat
		FROM buses
		WHERE id = $1
	`, busID).Scan(&farePerSeat)
	if err != nil {
		return 0, fmt.Errorf("could not retrieve fare info")
	}
	return farePerSeat * float64(seatCount), nil
}


// Mock payment service (implement your actual payment gateway here)
type MockPaymentService struct{}

func (m *MockPaymentService) Process(c *gin.Context, amount float64) error {
	// Implement actual payment gateway integration
	// For now, just simulate successful payment
	return nil 
}

