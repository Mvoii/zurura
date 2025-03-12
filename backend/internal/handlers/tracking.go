// backend/internal/handlers/tracking.go
package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/Mvoii/zurura/internal/services/tracking"
	"github.com/gin-gonic/gin"
)

type TrackingHandler struct {
	trackingService *tracking.Service
}

func NewTrackingHandler(ts *tracking.Service) *TrackingHandler {
	return &TrackingHandler{trackingService: ts}
}

// Driver updates bus location
func (h *TrackingHandler) UpdateLocation(c *gin.Context) {
	var loc tracking.Location
	if err := c.ShouldBindJSON(&loc); err != nil {
		log.Printf("[ERROR] :%v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get bus ID from driver's JWT claims
	busID, exists := c.Get("bus_id")
	if !exists {
		c.JSON(http.StatusForbidden, gin.H{"error": "Driver not assigned to bus"})
		return
	}
	loc.BusID = busID.(string)

	if err := h.trackingService.UpdateBusLocation(loc); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update location"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Location updated"})
}

// User gets nearby buses
func (h *TrackingHandler) GetNearby(c *gin.Context) {
	lat, _ := strconv.ParseFloat(c.Query("lat"), 64)
	lng, _ := strconv.ParseFloat(c.Query("lng"), 64)
	radius, _ := strconv.Atoi(c.DefaultQuery("radius", "1000")) // meters

	locations, err := h.trackingService.GetNearbyBuses(lat, lng, float64(radius))
	if err != nil {
		log.Printf("[ERROR]: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch locations"})
		return
	}

	c.JSON(http.StatusOK, locations)
}

// Get specific bus location
func (h *TrackingHandler) GetBusLocation(c *gin.Context) {
	busID := c.Param("bus_id")
	loc, err := h.trackingService.GetLiveLocation(busID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bus location not found"})
		return
	}
	c.JSON(http.StatusOK, loc)
}
