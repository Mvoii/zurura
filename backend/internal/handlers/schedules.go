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

	baseQuery := `
		SELECT 
			s.id, s.departure_time,
			b.id, b.registration_plate, b.capacity, b.current_occupancy,
			d.id, d.first_name, d.last_name,
			r.id, r.route_name, r.description
		FROM schedules s
		JOIN buses b ON s.bus_id = b.id
		JOIN drivers d ON s.driver_id = d.id
		JOIN bus_routes r ON s.route_id = r.id
	`

	var args []interface{}
	filters := []string{"s.status = 'scheduled'"}

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
		filters = append(filters, fmt.Sprintf("DATE(s.departure_time) = $%d", len(args)))
	}

	if len(filters) > 0 {
		baseQuery += " WHERE " + strings.Join(filters, " AND ")
	}
	baseQuery += " ORDER BY s.departure_time LIMIT 100"

	rows, err := h.db.Query(baseQuery, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var schedules []ScheduleResponse
	for rows.Next() {
		var s ScheduleResponse
		err := rows.Scan(
			&s.ID, &s.DepartureTime,
			&s.Bus.ID, &s.Bus.PlateNumber, &s.Bus.Capacity, &s.Bus.CurrentSeats,
			&s.Driver.ID, &s.Driver.FirstName, &s.Driver.LastName,
			&s.Route.ID, &s.Route.Name, &s.Route.Description,
		)
		if err != nil {
			log.Printf("Error scanning schedule: %v", err)
			continue
		}
		schedules = append(schedules, s)
	}

	c.JSON(http.StatusOK, schedules)
}
