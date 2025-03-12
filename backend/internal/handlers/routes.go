// backend/internal/handlers/route.go
package handlers

import (
	"database/sql"
	"net/http"

	"github.com/Mvoii/zurura/internal/models"
	"github.com/gin-gonic/gin"
)

type RouteHandler struct {
	db *sql.DB
}

func NewRouteHandler(db *sql.DB) *RouteHandler {
	return &RouteHandler{db: db}
}

// create new bus routes
func (h *RouteHandler) CreateRoute(c *gin.Context) {
	var route models.BusRoute
	if err := c.ShouldBindJSON(&route); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.db.Exec(`
		INSERT INTO bus_routes (route_name, description)
		VALUES ($1, $2)
	`, route.RouteName, route.Description)

	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Route name already exists"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Route created"})
}

// GetRouteDetails returns full route information
func (h *RouteHandler) GetRouteDetails(c *gin.Context) {
	routeID := c.Param("route_id")

	var route models.BusRoute
	var stops []models.RouteStop

	// Get route metadata
	err := h.db.QueryRow(`
		SELECT id, route_name, description, created_at, updated_at 
		FROM bus_routes 
		WHERE id = $1
	`, routeID).Scan(&route.ID, &route.RouteName, &route.Description, &route.CreatedAt, &route.UpdatedAt)

	// Get route stops with details
	rows, err := h.db.Query(`
		SELECT s.id, s.name, s.latitude, s.longitude, rs.stop_order, rs.timetable
		FROM route_bus_stops rs
		JOIN bus_stops s ON rs.bus_stop_id = s.id
		WHERE rs.route_id = $1
		ORDER BY rs.stop_order
	`, routeID)

	defer rows.Close()
	for rows.Next() {
		var stop models.RouteBusStop
		var timetable []string
		rows.Scan(
			&stop.StopID, &stop.Name, &stop.Latitude, &stop.Longitude,
			&stop.StopOrder, &timetable,
		)
		stop.Timetable = timetable
		stops = append(stops, stop)
	}

	c.JSON(http.StatusOK, gin.H{
		"route":  route,
		"stops":  stops,
		"length": len(stops),
	})
}
