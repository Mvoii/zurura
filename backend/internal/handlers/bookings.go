// backend/internal/handlers/bookings.go
package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"

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
		BusID             string  `json:"bus_id" binding:"required"`
		BoardingStopName  string  `json:"boarding_stop_name" binding:"required"`
		AlightingStopName string  `json:"alighting_stop_name" binding:"required"`
		Seats             SeatMap `json:"seats"`
		PaymentMethod     string  `json:"payment_method" binding:"required"`
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
		BusID:             req.BusID,
		BoardingStopName:  req.BoardingStopName,
		AlightingStopName: req.AlightingStopName,
		SeatNumbers:       req.Seats.SeatNumbers,
		PaymentMethod:     payments.PaymentMethod(req.PaymentMethod),
		UserID:            userID.(string),
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

// GetUserBookings retrieves all bookings for the authenticated user
func (h *BookingHandler) GetUserBookings(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Query to get all user bookings with basic info
	query := `
		SELECT
		   b.id, b.user_id, b.bus_id, b.route_id,
		   b.boarding_stop_id, b.alighting_stop_id,
		   b.seats, b.fare, b.status,
		   b.created_at, b.expires_at, b.boarded_at,
		   r.route_name, r.origin, r.destination,
		   bs1.name AS boarding_name, bs1.latitude AS boarding_lat, bs1.longitude AS boarding_lng,
		   bs2.name AS alighting_name, bs2.latitude AS alighting_lat, bs2.longitude AS alighting_lng
		FROM bookings b
		LEFT JOIN bus_routes r  ON b.route_id = r.id
		LEFT JOIN bus_stops bs1 ON b.boarding_stop_id  = bs1.id
		LEFT JOIN bus_stops bs2 ON b.alighting_stop_id = bs2.id
		WHERE b.user_id = $1
		ORDER BY b.created_at DESC
	`

	rows, err := h.db.Query(query, userID)
	if err != nil {
		log.Printf("[ERROR] Failed to fetch user bookings: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch bookings"})
		return
	}
	defer rows.Close()

	var bookings []gin.H
	for rows.Next() {
		var (
			id            string
			userID        string
			busID         string
			routeID       string
			boardStopID   sql.NullString
			boardingName  sql.NullString
			alightStopID  sql.NullString
			alightingName sql.NullString
			boardLat      sql.NullFloat64
			boardLng      sql.NullFloat64
			alightLat     sql.NullFloat64
			alightLng     sql.NullFloat64
			seatData      []byte // JSON data for seats
			fare          float64
			status        string
			createdAt     time.Time
			expiresAt     time.Time
			boardedAt     time.Time
			routeName     sql.NullString
			origin        sql.NullString
			destination   sql.NullString
		)

		err := rows.Scan(
			&id,
			&userID,
			&busID,
			&routeID,
			&boardStopID,
			&alightStopID,
			&seatData,
			&fare,
			&status,
			&createdAt,
			&expiresAt,
			&boardedAt,
			&routeName,
			&origin,
			&destination,
			&boardingName,
			&boardLat,
			&boardLng,
			&alightingName,
			&alightLat,
			&alightLng,
		)

		if err != nil {
			log.Printf("[ERROR] Failed to scan booking row: %v", err)
			continue
		}

		// Convert NullString to string
		routeNameStr := ""
		if routeName.Valid {
			routeNameStr = routeName.String
		}

		originStr := ""
		if origin.Valid {
			originStr = origin.String
		}

		destStr := ""
		if destination.Valid {
			destStr = destination.String
		}

		boarding := gin.H{"name": boardingName.String}
		if boardStopID.Valid {
			boarding["id"] = boardStopID.String
			boarding["location"] = gin.H{
				"latitude": boardLat.Float64,
				"longitude": boardLng.Float64,
			}
		}
		alighting := gin.H{"name": alightingName.String}
		if alightStopID.Valid {
			alighting["id"] = alightStopID.String
			alighting["location"] = gin.H{
				"latitude": alightLat.Float64,
				"longitude": alightLng.Float64,
			}
		}

		booking := gin.H{
			"id":          id,
			"user_id":     userID,
			"bus_id":      busID,
			"route_id":    routeID,
			"fare":        fare,
			"seats":       string(seatData), // This will be a JSON string that frontend can parse
			"status":      status,
			"created_at":  createdAt,
			"expires_at":  expiresAt,
			"boarded_at":  boardedAt,
			"route_name":  routeNameStr,
			"origin":      originStr,
			"destination": destStr,
			"boarding_stop": boarding,
			"alighting_stop": alighting,
		}

		bookings = append(bookings, booking)
	}

	// Return empty array instead of null
	if bookings == nil {
		bookings = []gin.H{}
	}

	c.JSON(http.StatusOK, bookings)
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
