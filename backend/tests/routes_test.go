// backend/internal/handlers/routes_test.go
package tests

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Mvoii/zurura/internal/handlers"
	"github.com/Mvoii/zurura/internal/models"
	"github.com/stretchr/testify/assert"
)

func TestGetRouteDetails(t *testing.T) {
	router := setupTestRouter()
	handler := handlers.NewRouteHandler(testDB)

	tests := []struct {
		name           string
		routeID        string
		expectedStatus int
		checkResponse  func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			name:           "Valid route",
			routeID:        "test-route-id",
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &response)
				assert.NoError(t, err)
				assert.Contains(t, response, "route")
				assert.Contains(t, response, "stops")
			},
		},
		{
			name:           "Invalid route ID",
			routeID:        "invalid-route-id",
			expectedStatus: http.StatusNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", "/routes/"+tt.routeID, nil)
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
			if tt.checkResponse != nil {
				tt.checkResponse(t, w)
			}
		})
	}
}

func TestFindNearbyStops(t *testing.T) {
	router := setupTestRouter()
	handler := handlers.NewRouteHandler(testDB)

	tests := []struct {
		name           string
		query          string
		expectedStatus int
		checkResponse  func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			name:           "Valid coordinates",
			query:          "lat=-1.2921&lng=36.8219&radius=1000",
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				var response []models.BusStop
				err := json.Unmarshal(w.Body.Bytes(), &response)
				assert.NoError(t, err)
				assert.NotEmpty(t, response)
			},
		},
		{
			name:           "Invalid coordinates",
			query:          "lat=invalid&lng=36.8219&radius=1000",
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", "/stops/nearby?"+tt.query, nil)
			router.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
			if tt.checkResponse != nil {
				tt.checkResponse(t, w)
			}
		})
	}
}
