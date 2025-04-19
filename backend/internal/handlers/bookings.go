// backend/internal/handlers/bookings.go
package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"

	//"github.com/Mvoii/zurura/internal/errors"
	"github.com/Mvoii/zurura/internal/models"
	"github.com/Mvoii/zurura/internal/services/booking"
	"github.com/Mvoii/zurura/internal/services/payments"
	"github.com/gin-gonic/gin"

	// Rename the imported errors package to avoid conflict
	bookingerrors "github.com/Mvoii/zurura/internal/errors"
)

type BookingHandler struct {
	db             *sql.DB
	bookingService *booking.BookingService
}

func NewBookingHandler(db *sql.DB, bs *booking.BookingService) *BookingHandler {
	return &BookingHandler{
		db:             db,
		bookingService: bs,
	}
}

type SeatMap struct {
	SeatNumbers []string `json:"seat_numbers" binding:"required"`
	Count       int      `json:"count" binding:"required"`
}

func (h *BookingHandler) CreateBooking(c *gin.Context) {
	var req struct {
		BusID         string   `json:"bus_id" binding:"required"`
		Seats         SeatMap  `json:"seats" binding:"required"`
		PaymentMethod string   `json:"payment_method" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

    if len(req.Seats.SeatNumbers) != req.Seats.Count {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Seat count does not match number of seats provided"})
        return
    }

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	bookingReq := booking.CreateBookingRequest{
		BusID:         req.BusID,
		SeatNumbers:   req.Seats.SeatNumbers,
		PaymentMethod: payments.PaymentMethod(req.PaymentMethod),
		UserID:        userID.(string),
	}

	booking, err := h.bookingService.CreateBooking(c.Request.Context(), bookingReq)
	if err != nil {
		switch e := err.(type) {
		case *bookingerrors.BookingError:
			switch e.Code {
			case "SEATS_UNAVAILABLE":
				log.Printf("[ERROR] Seats unavailable: %v", e)
				c.JSON(http.StatusConflict, gin.H{"error": e.Message})
			case "INVALID_SEAT_SELECTION":
				log.Printf("[ERROR] Invalid seat selection: %v", e)
				c.JSON(http.StatusBadRequest, gin.H{"error": e.Message})
			case "PAYMENT_FAILED":
				log.Printf("[ERROR] Payment failed: %v", e)
				c.JSON(http.StatusPaymentRequired, gin.H{"error": e.Message})
			case "INVALID_FARE":
				log.Printf("[ERROR] Invalid fare: %v", e)
				c.JSON(http.StatusBadRequest, gin.H{"error": e.Message})
			default:
				log.Printf("[ERROR] Booking error: %v", e)
				c.JSON(http.StatusInternalServerError, gin.H{"error": e.Message})
			}
		default:
			log.Printf("[ERROR] Booking error: %v", err)
			// Check if the error message contains "zero amount payment" 
			if err.Error() == "zero amount payment not allowed" {
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Payment validation failed: Zero fare amount. The route fare may not be properly configured.",
				})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		}
		return
	}

	c.JSON(http.StatusCreated, booking)
}

func (h *BookingHandler) CancelBooking(c *gin.Context) {
	bookingID := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	err := h.bookingService.CancelBooking(c.Request.Context(), bookingID, userID.(string))
	if err != nil {
		switch e := err.(type) {
		case *bookingerrors.BookingError:
			switch e.Code {
			case "BOOKING_NOT_FOUND":
				log.Printf("[ERROR] Booking not found: %v", e)
				c.JSON(http.StatusNotFound, gin.H{"error": e.Message})
			case "ALREADY_CANCELLED":
				log.Printf("[ERROR] Booking already cancelled: %v", e)
				c.JSON(http.StatusBadRequest, gin.H{"error": e.Message})
			case "CANNOT_CANCEL_COMPLETED":
				log.Printf("[ERROR] Cannot cancel completed booking: %v", e)
				c.JSON(http.StatusBadRequest, gin.H{"error": e.Message})
			default:
				log.Printf("[ERROR] Booking error: %v", e)
				c.JSON(http.StatusInternalServerError, gin.H{"error": e.Message})
			}
		default:
			log.Printf("[ERROR] Booking error: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal server error"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking cancelled successfully"})
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
			log.Printf("[ERROR] No active bus pass found for user %s", userID)
			return errors.New("no active bus pass found")
		}
		log.Printf("[ERROR] Database error: %v", err)
		return fmt.Errorf("database error: %v", err)
	}

	if pass.Balance < amount {
		log.Printf("[ERROR] Insufficient pass balance. Available: %.2f", pass.Balance)
		return fmt.Errorf("insufficient pass balance. Available: %.2f", pass.Balance)
	}

	_, err = tx.Exec(`
		UPDATE bus_passes
		SET balance = balance - $1
		WHERE id = $2
	`, amount, pass.ID)
	if err != nil {
		log.Printf("[ERROR] Balance update failed: %v", err)
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
		log.Printf("[ERROR] Could not retrieve fare info: %v", err)
		return 0, fmt.Errorf("could not retrieve fare info")
	}
	return farePerSeat * float64(seatCount), nil
}
