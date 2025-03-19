// backend/internal/handlers/routes.go
package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"

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
func (h *RouteHandler) GetRouteDetails(c *gin.Context) {
	routeID := c.Param("route_id")

	var route models.BusRoute
	var stops []models.RouteBusStop

	// Get route metadata
	err := h.db.QueryRow(`
		SELECT id, route_name, description, created_at, updated_at
		FROM bus_routes
		WHERE id = $1
		`, routeID).Scan(&route.ID, &route.RouteName, &route.Description, &route.CreatedAt, &route.UpdatedAt)
	if err != nil {
		log.Printf("[ERROR] %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch route"})
		return
	}

	// get route sops with full details
	rows, err := h.db.Query(`
		SELECT s.id, s.name, s.landmark_decription, s.latitude, s.longitude, s.created_at, s.updated_at, rs.stop_order, rs.timetable, rs.estimated_arrival_time
		FROM route_bus_stops rs
		JOIN bus_stops s ON rs.bus_stop_id = s.id
		WHERE rs.route_id = $1
		ORDER BY rs.stop_order
	`, routeID)
	if err != nil {
		log.Printf("[ERROR] %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stop details"})
		return
	}

	defer rows.Close()
	for rows.Next() {
		var stop models.RouteBusStop
		var timetable []string
		stop.StopDetails = models.BusStop{}

		rows.Scan(
			&stop.StopDetails.ID,
			&stop.StopDetails.Name,
			&stop.StopDetails.LandmarkDescription,
			&stop.StopDetails.Latitude,
			&stop.StopDetails.Longitude,
			&stop.StopDetails.CreatedAt,
			&stop.StopDetails.UpdatedAt,
			&stop.StopOrder,
			&timetable,
			&stop.TravelTime,
		)

		stop.Timetable = timetable
		stops = append(stops, stop)
	}

	c.JSON(http.StatusOK, gin.H{
		"route": route,
		"stops": stops,
	})
}

func (h *RouteHandler) FindNearbyStops(c *gin.Context) {
	lat, _ := strconv.ParseFloat(c.Query("lat"), 64)
	lng, _ := strconv.ParseFloat(c.Query("lng"), 64)
	radius, _ := strconv.Atoi(c.DefaultQuery("radius", "500")) //meters

	rows, err := h.db.Query(`
		SELECT
			id, name, landmark_description, latitude, longitude, created_at, updated_at, ST_DISTANCE(geolocation, $1) AS distance
		FEOM bus_stops
		WHERE ST_DWithin(geolocation, $1, $2)
		ORDER BY distance
		LIMIT 20
	`, fmt.Sprintf("SRID=4326;POINT(%f %f)", lng, lat), // postgis fmt
		radius,
	)

	if err != nil {
		log.Printf("[ERROR] %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch near stops"})
		return
	}

	var stops []models.BusStop
	for rows.Next() {
		var stop models.BusStop
		var distance float64
		rows.Scan(
			&stop.ID,
			&stop.Name,
			&stop.LandmarkDescription,
			&stop.Latitude,
			&stop.Longitude,
			&stop.CreatedAt,
			&stop.UpdatedAt,
			&distance,
		)
		stops = append(stops, stop)
	}

	c.JSON(http.StatusOK, stops)
}

// create route
func (h *RouteHandler) CreateRoute(c *gin.Context) {
	var route models.BusRoute
	if err := c.ShouldBindJSON(&route); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	_, err := h.db.Exec(`
		INSERT INTO bus_routes (route_name, description)
		VALUES ($1, $2)`,
		route.RouteName, route.Description)

	if err != nil {
		log.Printf("[ERROR] %v", err)
		c.JSON(http.StatusConflict, gin.H{"error": "route name already exists"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Route created"})
}

// Add stop to route with timetable
func (h *RouteHandler) AddStopToRoute(c *gin.Context) {
	routeID := c.Param("route_id")

	var stop struct {
		StopID     string   `json:"stop_id" binding:"required"`
		Timetable  []string `json:"timetable"`                      // ["08:00", "12:30"]
		TravelTime int      `json:"travel_time" binding:"required"` // min from route start
	}

	if err := c.ShouldBindJSON(&stop); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// get next stop order
	var maxOrder int
	h.db.QueryRow(`
		SELECT COALESCE(MAX(stop_order), 0)
		FROM route_bus_stops
		WHERE route_id = $1`,
		routeID).Scan(&maxOrder)

	_, err := h.db.Exec(`
		INSERT INTO route_bus_stops (route_id, bus_stop_id, stop_order, timetable, estimated_arrival_time)
		VALUES ($1, $2, $3, $4, $5)`,
		routeID, stop.StopID, maxOrder+1, stop.Timetable, stop.TravelTime)

	if err != nil {
		log.Printf("[ERROR] %v", err)
		c.JSON(http.StatusConflict, gin.H{"error": "stop already in route"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "stop added to route"})
}
