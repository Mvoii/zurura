// backend/internal/handlers/schedules.go
package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type ScheduleHandler struct {
	db *sql.DB
}

type ScheduleResponse struct {
	ID            string    `json:"id"`
	DepartureTime time.Time `json:"departure_time"`
	Bus           struct {
		ID           string `json:"id"`
		PlateNumber  string `json:"plate_number"`
		Capacity     int    `json:"capacity"`
		CurrentSeats int    `json:"available_seats"`
	} `json:"bus"`
	Driver struct {
		ID        string `json:"id"`
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
	} `json:"driver"`
	Route struct {
		ID          string `json:"id"`
		Name        string `json:"name"`
		Description string `json:"description"`
	} `json:"route"`
}

func NewScheduleHandler(db *sql.DB) *ScheduleHandler {
	return &ScheduleHandler{db: db}
}

func (h *ScheduleHandler) CreateSchedule(c *gin.Context) {
	var req struct {
		RouteID      string `json:"route_id" binding:"required"`
		BusID        string `json:"bus_id" binding:"required"`
		DriverID     string `json:"driver_id" binding:"required"`
		DepartureISO string `json:"departure_time" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	departureTime, err := time.Parse(time.RFC3339, req.DepartureISO)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid time format"})
		return
	}

	// Check for conflicts
	var conflict string
	err = h.db.QueryRow(`
		SELECT CASE 
			WHEN EXISTS(SELECT 1 FROM schedules WHERE bus_id = $1 AND departure_time = $2) THEN 'bus'
			WHEN EXISTS(SELECT 1 FROM schedules WHERE driver_id = $3 AND departure_time = $2) THEN 'driver'
		END
	`, req.BusID, departureTime, req.DriverID).Scan(&conflict)

	if conflict != "" {
		c.JSON(http.StatusConflict, gin.H{
			"error": fmt.Sprintf("%s already scheduled at this time", conflict),
		})
		return
	}

	// Create schedule
	_, err = h.db.Exec(`
		INSERT INTO schedules 
		(route_id, bus_id, driver_id, departure_time)
		VALUES ($1, $2, $3, $4)
	`, req.RouteID, req.BusID, req.DriverID, departureTime)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create schedule"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Schedule created"})
}

func (h *ScheduleHandler) ListSchedules(c *gin.Context) {
	routeID := c.Query("route_id")
	date := c.Query("date") // Format: 2025-03-20

	// Check the actual schema of the schedules table
	baseQuery := `
		SELECT 
			s.id, s.scheduled_departure AS departure_time,
			b.id, b.registration_plate, b.capacity, b.current_occupancy,
			r.id, r.route_name, r.description
		FROM schedules s
		JOIN buses b ON s.bus_id = b.id
		JOIN bus_routes r ON s.route_id = r.id
	`

	var args []interface{}
	filters := []string{}

	if routeID != "" {
		args = append(args, routeID)
		filters = append(filters, fmt.Sprintf("s.route_id = $%d", len(args)))
	}

	if date != "" {
		_, err := time.Parse("2006-01-02", date)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
			return
		}
		args = append(args, date)
		filters = append(filters, fmt.Sprintf("DATE(s.scheduled_departure) = $%d", len(args)))
	}

	if len(filters) > 0 {
		baseQuery += " WHERE " + strings.Join(filters, " AND ")
	}
	baseQuery += " ORDER BY s.scheduled_departure LIMIT 100"

	var rows *sql.Rows
	var err error
	
	if len(args) > 0 {
		rows, err = h.db.Query(baseQuery, args...)
	} else {
		rows, err = h.db.Query(baseQuery)
	}
	
	if err != nil {
		log.Printf("Error querying schedules: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var schedules []ScheduleResponse
	for rows.Next() {
		var s ScheduleResponse
		// Modify the scan to exclude driver fields
		err := rows.Scan(
			&s.ID, &s.DepartureTime,
			&s.Bus.ID, &s.Bus.PlateNumber, &s.Bus.Capacity, &s.Bus.CurrentSeats,
			&s.Route.ID, &s.Route.Name, &s.Route.Description,
		)
		
		// Set default driver info since we don't have it in DB
		s.Driver.ID = "unknown"
		s.Driver.FirstName = "System"
		s.Driver.LastName = "Driver"
		
		if err != nil {
			log.Printf("Error scanning schedule: %v", err)
			continue
		}
		schedules = append(schedules, s)
	}

	// Initialize empty array if no schedules found
	if schedules == nil {
		schedules = []ScheduleResponse{}
	}

	c.JSON(http.StatusOK, schedules)
}
