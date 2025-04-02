// backend/internal/errors/booking.go
package errors

import "fmt"

type BookingError struct {
    Code    string
    Message string
    Err     error
}

func (e *BookingError) Error() string {
    if e.Err != nil {
        return fmt.Sprintf("%s: %s (cause: %v)", e.Code, e.Message, e.Err)
    }
    return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

var (
    ErrSeatsUnavailable = &BookingError{
        Code:    "SEATS_UNAVAILABLE",
        Message: "Requested seats are not available",
    }
    
    ErrInvalidSeatSelection = &BookingError{
        Code:    "INVALID_SEAT_SELECTION",
        Message: "Invalid seat selection",
    }
    
    ErrBookingExpired = &BookingError{
        Code:    "BOOKING_EXPIRED",
        Message: "Booking has expired",
    }
    
    ErrPaymentFailed = &BookingError{
        Code:    "PAYMENT_FAILED",
        Message: "Payment processing failed",
    }
    
    ErrInsufficientBalance = &BookingError{
        Code:    "INSUFFICIENT_BALANCE",
        Message: "Insufficient balance in bus pass",
    }
)
