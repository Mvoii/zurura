// backend/internal/handlers/routes.go
package handlers

import (
	"database/sql"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/Mvoii/zurura/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/lib/pq"
)

type RouteHandler struct {
	db *sql.DB
}

func NewRouteHandler(db *sql.DB) *RouteHandler {
	return &RouteHandler{db: db}
}

type AddStopRequest struct {
	// For existing stops
	StopID string `json:"stop_id"` // Optional if creating a new stop
	// For new stops
	Name       string   `json:"name"`      // Required if creating
	Latitude   float64  `json:"latitude"`  // Required if creating
	Longitude  float64  `json:"longitude"` // Required if creating
	Timetable  []string `json:"timetable"`
	TravelTime int      `json:"travel_time" binding:"required"`
}

// create new bus routes
func (h *RouteHandler) GetRouteDetails(c *gin.Context) {
	routeID := c.Param("route_id")

	var route models.BusRoute
	var stops []models.RouteBusStop

	// Get route metadata
	err := h.db.QueryRow(`
		SELECT id, route_name, description, origin, destination, created_at, updated_at
		FROM bus_routes
		WHERE id = $1
	`, routeID).Scan(&route.ID, &route.RouteName, &route.Description, &route.Origin, &route.Destination, &route.CreatedAt, &route.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
		} else {
			log.Printf("[ERROR] %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch route"})
		}
		return
	}

	// Get route stops with full details
	rows, err := h.db.Query(`
		SELECT 
			s.id, 
			s.name, 
			s.latitude, 
			s.longitude, 
			s.created_at, 
			s.updated_at, 
			rs.stop_order, 
			rs.timetable, 
			rs.estimated_arrival_time
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

		// Make sure the number of fields matches the query 
		err := rows.Scan(
			&stop.StopDetails.ID,
			&stop.StopDetails.Name,
			&stop.StopDetails.Latitude,
			&stop.StopDetails.Longitude,
			&stop.StopDetails.CreatedAt,
			&stop.StopDetails.UpdatedAt,
			&stop.StopOrder,
			pq.Array(&timetable),
			&stop.TravelTime,
		)
		
		if err != nil {
			log.Printf("[ERROR] Failed to scan stop row: %v", err)
			continue
		}

		stop.Timetable = timetable
		stops = append(stops, stop)
	}
	
	// Check for errors after iterating through rows
	if err = rows.Err(); err != nil {
		log.Printf("[ERROR] Error iterating through stops: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error processing stops data"})
		return
	}

	// Return empty array if no stops
	if stops == nil {
		stops = []models.RouteBusStop{}
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

	routeID := uuid.New().String()

	_, err := h.db.Exec(`
		INSERT INTO bus_routes (id, route_name, description, origin, destination)
		VALUES ($1, $2, $3, $4, $5)`,
		routeID, route.RouteName, route.Description, route.Origin, route.Destination)

	if err != nil {
		log.Printf("[ERROR] %v", err)
		c.JSON(http.StatusConflict, gin.H{"error": "route name already exists"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"id":          routeID,
		"route_name":  route.RouteName,
		"description": route.Description,
		"origin":      route.Origin,
		"destination": route.Destination,
		"created_at":  time.Now(),
	})
}

// Add stop to route with timetable
func (h *RouteHandler) AddStopToRoute(c *gin.Context) {
	routeID := c.Param("route_id")

	/* 	var stop struct {
		StopID     string   `json:"stop_id" binding:"required"`
		Timetable  []string `json:"timetable"`                      // ["08:00", "12:30"]
		TravelTime int      `json:"travel_time" binding:"required"` // min from route start
	} */
	var req AddStopRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx, err := h.db.Begin()
	defer tx.Rollback()

	// Check if route exists
	var routeExists bool
	err = tx.QueryRow("SELECT EXISTS(SELECT 1 FROM bus_routes WHERE id = $1)", routeID).Scan(&routeExists)
	if err != nil || !routeExists {
		c.JSON(http.StatusNotFound, gin.H{"error": "route not found"})
		return
	}

	var StopID string
	if req.StopID != "" {
		var exists bool
		err := tx.QueryRow("SELECT EXISTS(SELECT 1 FROM bus_stops WHERE id = $1)", req.StopID).Scan(&exists)
		if err != nil || !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "invalid stop id"})
			return
		}
		StopID = req.StopID
	} else {
		// create new stop
		if req.Name == "" || req.Latitude == 0 || req.Longitude == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "name, lat, lng required for new stop"})
			return
		}
		StopID = uuid.New().String()
		_, err := tx.Exec(`
			INSERT INTO bus_stops (id, name, latitude, longitude, created_at, updated_at)
			VALUES ($1, $2, $3, $4, NOW(), NOW())`,
			StopID, req.Name, req.Latitude, req.Longitude)
		if err != nil {
			log.Printf("[ERROR] %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create bus stop"})
			return
		}
	}

	// 1. Lock existing route_bus_stops for this route
	_, err = tx.Exec(`
		SELECT * 
		FROM route_bus_stops 
		WHERE route_id = $1 
		FOR UPDATE`, // Lock rows to prevent concurrent updates
		routeID)
	if err != nil {
		log.Printf("[ERROR] %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to lock route stops"})
		return
	}

	// get next stop order
	var maxOrder int
	err = tx.QueryRow(`
    	SELECT COALESCE(MAX(stop_order), 0) 
    	FROM route_bus_stops 
    	WHERE route_id = $1`,
		routeID).Scan(&maxOrder)

	if err != nil {
		log.Printf("[ERROR] %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add stop to route"})
		return
	}

	_, err = tx.Exec(`
		INSERT INTO route_bus_stops (route_id, bus_stop_id, stop_order, timetable, estimated_arrival_time)
		VALUES ($1, $2, $3, $4, $5)`,
		routeID, StopID, maxOrder+1, pq.Array(req.Timetable), req.TravelTime)

	if err != nil {
		log.Printf(" exec [ERROR] %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add stop to route"})
		return
	}
	err = tx.Commit()

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" { // Unique violation
			c.JSON(http.StatusConflict, gin.H{"error": "stop already exists in route"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "stop added to route",
		"stop": gin.H{
			"route_id": routeID,
			"bus_stop_id": StopID,
			"stop_order": maxOrder + 1,
			"timetable": req.Timetable,
			"estimated_arrival_time": req.TravelTime,
		},
	})
}

// FindRoutes searches for routes based on origin and destination
func (h *RouteHandler) FindRoutes(c *gin.Context) {
	originQuery := c.Query("origin")
	destinationQuery := c.Query("destination")
	
	if originQuery == "" && destinationQuery == "" {
		// If no search parameters are provided, return all routes with pagination
		limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
		offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
		
		// Query to get routes with their origin and destination
		query := `
			SELECT 
				id AS route_id,
				route_name,
				description,
				origin,
				destination,
				base_fare,
				created_at,
				updated_at
			FROM 
				bus_routes
			ORDER BY 
				route_name
			LIMIT $1 OFFSET $2
		`
		
		rows, err := h.db.Query(query, limit, offset)
		if err != nil {
			log.Printf("[ERROR] Failed to query routes: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch routes"})
			return
		}
		defer rows.Close()
		
		var routes []map[string]interface{}
		for rows.Next() {
			var route struct {
				ID          string    `db:"route_id"`
				RouteName   string    `db:"route_name"`
				Description string    `db:"description"`
				Origin      string    `db:"origin"`
				Destination string    `db:"destination"`
				BaseFare    float64   `db:"base_fare"`
				CreatedAt   time.Time `db:"created_at"`
				UpdatedAt   time.Time `db:"updated_at"`
			}
			
			err := rows.Scan(
				&route.ID,
				&route.RouteName,
				&route.Description,
				&route.Origin,
				&route.Destination,
				&route.BaseFare,
				&route.CreatedAt,
				&route.UpdatedAt,
			)
			
			if err != nil {
				log.Printf("[ERROR] Failed to scan route: %v", err)
				continue
			}
			
			routeMap := map[string]interface{}{
				"id":          route.ID,
				"route_name":  route.RouteName,
				"description": route.Description,
				"origin":      route.Origin,
				"destination": route.Destination,
				"base_fare":   route.BaseFare,
				"created_at":  route.CreatedAt,
				"updated_at":  route.UpdatedAt,
			}
			
			routes = append(routes, routeMap)
		}
		
		c.JSON(http.StatusOK, gin.H{"routes": routes})
		return
	}
	
	// If origin or destination is provided, search for matching routes
	query := `
		SELECT 
			id AS route_id,
			route_name,
			description,
			origin,
			destination,
			base_fare,
			created_at,
			updated_at
		FROM 
			bus_routes
		WHERE 
			1=1
	`
	
	var params []interface{}
	paramIndex := 1
	
	if originQuery != "" {
		query += fmt.Sprintf(" AND LOWER(origin) LIKE LOWER($%d)", paramIndex)
		params = append(params, "%"+originQuery+"%")
		paramIndex++
	}
	
	if destinationQuery != "" {
		query += fmt.Sprintf(" AND LOWER(destination) LIKE LOWER($%d)", paramIndex)
		params = append(params, "%"+destinationQuery+"%")
		paramIndex++
	}
	
	query += " ORDER BY route_name LIMIT 50"
	
	var rows *sql.Rows
	var err error
	
	if len(params) > 0 {
		rows, err = h.db.Query(query, params...)
	} else {
		rows, err = h.db.Query(query)
	}
	
	if err != nil {
		log.Printf("[ERROR] Failed to query routes: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch routes"})
		return
	}
	defer rows.Close()
	
	var routes []map[string]interface{}
	for rows.Next() {
		var route struct {
			ID          string    `db:"route_id"`
			RouteName   string    `db:"route_name"`
			Description string    `db:"description"`
			Origin      string    `db:"origin"`
			Destination string    `db:"destination"`
			BaseFare    float64   `db:"base_fare"`
			CreatedAt   time.Time `db:"created_at"`
			UpdatedAt   time.Time `db:"updated_at"`
		}
		
		err := rows.Scan(
			&route.ID,
			&route.RouteName,
			&route.Description,
			&route.Origin,
			&route.Destination,
			&route.BaseFare,
			&route.CreatedAt,
			&route.UpdatedAt,
		)
		
		if err != nil {
			log.Printf("[ERROR] Failed to scan route: %v", err)
			continue
		}
		
		routeMap := map[string]interface{}{
			"id":          route.ID,
			"route_name":  route.RouteName,
			"description": route.Description,
			"origin":      route.Origin,
			"destination": route.Destination,
			"base_fare":   route.BaseFare,
			"created_at":  route.CreatedAt,
			"updated_at":  route.UpdatedAt,
		}
		
		routes = append(routes, routeMap)
	}
	
	c.JSON(http.StatusOK, gin.H{"routes": routes})
}
