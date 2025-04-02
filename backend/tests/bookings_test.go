package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Mvoii/zurura/internal/handlers"
	"github.com/Mvoii/zurura/internal/models"
	"github.com/Mvoii/zurura/internal/services/booking"
	"github.com/Mvoii/zurura/internal/services/payments"
	"github.com/stretchr/testify/assert"
)

func TestCreateBooking(t *testing.T) {
	router := setupTestRouter()
	paymentService := payments.NewMockPaymentService()
	bookingService := booking.NewBookingService(testDB, paymentService)
	handler := handlers.NewBookingHandler(testDB, bookingService)

	tests := []struct {
		name           string
		payload        map[string]interface{}
		token          string
		expectedStatus int
		checkResponse  func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			name: "Valid booking",
			payload: map[string]interface{}{
				"bus_id":         "test-bus-id",
				"seat_numbers":   []string{"A1", "A2"},
				"payment_method": "bus_pass",
			},
			token:          "valid_token",
			expectedStatus: http.StatusCreated,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response models.Booking
				err := json.Unmarshal(w.Body.Bytes(), &response)
				assert.NoError(t, err)
				assert.NotEmpty(t, response.ID)
				assert.Equal(t, "test-bus-id", response.BusID)
				assert.Equal(t, 2, response.Seats.Count)
			},
		},
		{
			name: "Invalid bus ID",
			payload: map[string]interface{}{
				"bus_id":         "invalid-bus-id",
				"seat_numbers":   []string{"A1"},
				"payment_method": "bus_pass",
			},
			token:          "valid_token",
			expectedStatus: http.StatusNotFound,
		},
		{
			name: "Missing token",
			payload: map[string]interface{}{
				"bus_id":         "test-bus-id",
				"seat_numbers":   []string{"A1"},
				"payment_method": "bus_pass",
			},
			token:          "",
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			body, _ := json.Marshal(tt.payload)
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("POST", "/bookings", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			if tt.token != "" {
				req.Header.Set("Authorization", "Bearer "+tt.token)
			}
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
			if tt.checkResponse != nil {
				tt.checkResponse(t, w)
			}
		})
	}
}

func TestCancelBooking(t *testing.T) {
	router := setupTestRouter()
	paymentService := payments.NewMockPaymentService()
	bookingService := booking.NewBookingService(testDB, paymentService)
	handler := handlers.NewBookingHandler(testDB, bookingService)

	tests := []struct {
		name           string
		bookingID      string
		token          string
		expectedStatus int
	}{
		{
			name:           "Valid cancellation",
			bookingID:      "test-booking-id",
			token:          "valid_token",
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Invalid booking ID",
			bookingID:      "invalid-booking-id",
			token:          "valid_token",
			expectedStatus: http.StatusNotFound,
		},
		{
			name:           "Missing token",
			bookingID:      "test-booking-id",
			token:          "",
			expectedStatus: http.StatusUnauthorized,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("POST", "/bookings/"+tt.bookingID+"/cancel", nil)
			if tt.token != "" {
				req.Header.Set("Authorization", "Bearer "+tt.token)
			}
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
		})
	}
}
