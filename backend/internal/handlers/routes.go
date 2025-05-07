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
			EXTRACT(EPOCH FROM rs.estimated_arrival_time)::INT AS eta_minutes
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
		log.Printf("[DEBUG] Stop: %v", stop)
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

	/* travelTimeInt, err := strconv.Atoi(req.TravelTime)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid travel_time; must be an integer"})
		return
	} */

	tx, err := h.db.Begin()
	defer tx.Rollback()

	log.Printf("check route exist")
	// Check if route exists
	var routeExists bool
	err = tx.QueryRow("SELECT EXISTS(SELECT 1 FROM bus_routes WHERE id = $1)", routeID).Scan(&routeExists)
	if err != nil || !routeExists {
		c.JSON(http.StatusNotFound, gin.H{"error": "route not found"})
		return
	}

	var StopID string
	/* if req.StopID != "" {
		var exists bool
		err := tx.QueryRow("SELECT EXISTS(SELECT 1 FROM bus_stops WHERE id = $1)", req.StopID).Scan(&exists)
		if err != nil || !exists {
			c.JSON(http.StatusNotFound, gin.H{"error": "invalid stop id"})
			return
		}
		StopID = req.StopID
	} else { */
	// create new stop
	if req.Name == "" || req.Latitude == 0 || req.Longitude == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name, lat, lng required for new stop"})
		return
	}
	StopID = uuid.New().String()
	log.Printf("inserting stop to bus stops")
	_, err = tx.Exec(`
			INSERT INTO bus_stops (id, name, latitude, longitude, created_at, updated_at)
			VALUES ($1, $2, $3, $4, NOW(), NOW())`,
		StopID, req.Name, req.Latitude, req.Longitude)
	if err != nil {
		log.Printf("[ERROR] %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create bus stop"})
		return
	}
	log.Printf("stop created with id %s", StopID)
	//}

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
	log.Printf("getting max stop order")
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
	log.Printf("max order %d", maxOrder)

	log.Printf("inserting stop to route bus stops")
	_, err = tx.Exec(`
		INSERT INTO route_bus_stops (route_id, bus_stop_id, stop_order, timetable, estimated_arrival_time)
		VALUES ($1, $2, $3, $4, make_interval(mins => $5))`,
		routeID, StopID, maxOrder+1, pq.Array(req.Timetable), req.TravelTime)

	if err != nil {
		log.Printf(" exec [ERROR] %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add stop to route"})
		return
	}
	err = tx.Commit()
	log.Printf("committed transaction")

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
			"route_id":               routeID,
			"bus_stop_id":            StopID,
			"stop_order":             maxOrder + 1,
			"timetable":              req.Timetable,
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

// TODO: add func to find route using then name
func (h *RouteHandler) GetRouteByName(c *gin.Context) {
	routeName := c.Query("route_name")
	if routeName == "" {
		log.Printf("[WARN] route_name is required")
		c.JSON(http.StatusBadRequest, gin.H{"error": "route_name is required"})
		return
	}

	var route models.BusRoute
	var stops []models.RouteBusStop
	var basefare float64

	// get router metadata
	err := h.db.QueryRow(`
		SELECT id, route_name, description, origin, destination, created_at, updated_at, base_fare
		FROM bus_routes
		WHERE LOWER(route_name) = LOWER($1)
	`, routeName).Scan(&route.ID, &route.RouteName, &route.Description, &route.Origin, &route.Destination, &route.CreatedAt, &route.UpdatedAt, &basefare)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("[WARN] Route not found")
			c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
		} else {
			log.Printf("[ERROR] failed to fetch route: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch route"})
		}
		return
	}

	// get all stops for this route
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
			EXTRACT(EPOCH FROM rs.estimated_arrival_time)::INT AS eta_minutes
		FROM route_bus_stops rs
		JOIN bus_stops s ON rs.bus_stop_id = s.id
		WHERE rs.route_id = $1
		ORDER BY rs.stop_order
	`, route.ID)

	if err != nil {
		log.Printf("[ERROR] failed to fetch route stops: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch route stops"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var stop models.RouteBusStop
		var timetable []string
		stop.StopDetails = models.BusStop{}

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
			log.Printf("[ERROR] failed to scan stop row: %v", err)
			continue
		}
		stop.Timetable = timetable
		stops = append(stops, stop)
	}

	// return full route with all stops including origin/destination
	c.JSON(http.StatusOK, gin.H{
		"route": gin.H{
			"id":          route.ID,
			"route_name":  route.RouteName,
			"description": route.Description,
			"origin":      route.Origin,
			"destination": route.Destination,
			"created_at":  route.CreatedAt,
			"updated_at":  route.UpdatedAt,
			"base_fare":   basefare,
		},
		"stops": stops,
	})
}

// TODO: add fucntion to retrieve routes stops, the origin and destination should be included as stops

// add function to retrieve buses plying that route
func (h *RouteHandler) GetBusesOnRoute(c *gin.Context) {
	routeID := c.Param("route_id")

	query := `
		SELECT b.id, b.registration_plate, b.capacity, b.current_occupancy,
			bra.start_date, bra.end_date
		FROM bus_routes_assignments bra
		JOIN buses b ON bra.bus_id = b.id
		WHERE bra.route_id = $1
		AND b.status = 'active'
		AND NOW() BETWEEN bra.start_date AND bra.end_date
		AND curent_occupancy < b.capacity
	`
	rows, err := h.db.Query(query, routeID)
	if err != nil {
		log.Printf("[ERROR] %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch buses"})
		return
	}

	defer rows.Close()

	var buses []gin.H
	for rows.Next() {
		var bus struct {
			ID                string
			RegistrationPlate string
			Capacity          int
			CurrentOccupancy  int
			StartDate         time.Time
			EndDate           time.Time
		}
		err := rows.Scan(
			&bus.ID,
			&bus.RegistrationPlate,
			&bus.Capacity,
			&bus.CurrentOccupancy,
			&bus.StartDate,
			&bus.EndDate,
		)
		if err != nil {
			log.Printf("[ERROR] Failed to scan bus: %v", err)
			continue
		}

		buses = append(buses, gin.H{
			"bus_id":             bus.ID,
			"registration_plate": bus.RegistrationPlate,
			"capacity":           bus.Capacity,
			"current_occupancy":  bus.CurrentOccupancy,
			"assignment_period": gin.H{
				"start_date": bus.StartDate,
				"end_date":   bus.EndDate,
			},
		})
	}

	c.JSON(http.StatusOK, gin.H{"buses": buses})
}

// TODO: add function to find nearby buses to a stop (basically just simulate and pick three rundom buses that are plying that route for now)
func (h *RouteHandler) GetNearbyBusesbyStop(c *gin.Context) {
	stopName := c.Query("stop_name")
	routeID := c.Query("route_id")

	if stopName == "" || routeID == "" {
		log.Println("[WARN] Missing stop_name or route_id in query params")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing stop_name or route_id"})
		return
	}

	log.Printf("[DEBUG] stop name: %s, route id: %s", stopName, routeID)

	pattern := "%" + stopName + "%"

	/// DEBUG
	log.Printf("[DEBUG] assignment window for route %s:", routeID)
	var minStart, maxEnd time.Time
	h.db.QueryRow(`
	  SELECT MIN(start_date), MAX(end_date)
	  FROM bus_route_assignments
	  WHERE route_id = $1
	`, routeID).Scan(&minStart, &maxEnd)
	log.Printf("[DEBUG] start_date=%v, end_date=%v", minStart, maxEnd)

	query := `
		SELECT b.id, b.registration_plate, b.capacity, b.current_occupancy,
			bra.start_date, bra.end_date,
			bs.id, bs.name, bs.latitude, bs.longitude,
			br.id, br.route_name, br.base_fare
		FROM bus_route_assignments bra
		JOIN buses b ON bra.bus_id = b.id
		JOIN route_bus_stops rbs ON bra.route_id = rbs.route_id
		JOIN bus_stops bs ON rbs.bus_stop_id = bs.id
		JOIN bus_routes br ON bra.route_id = br.id
		WHERE bra.route_id = $1
		AND bs.name ILIKE $2
		AND b.status IN ('active','assigned')
		AND NOW() BETWEEN bra.start_date AND bra.end_date
		AND b.current_occupancy < b.capacity
		ORDER BY RANDOM()
		LIMIT 3
	`
	rows, err := h.db.Query(query, routeID, pattern)
	if err != nil {
		log.Printf("[ERROR] fetching rows: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch buses"})
		return
	}
	defer rows.Close()

	var buses []gin.H
	for rows.Next() {
		var bus struct {
			ID                string
			RegistrationPlate string
			Capacity          int
			CurrentOccupancy  int
			StartDate         time.Time
			EndDate           time.Time
			StopID            string
			StopName          string
			StopLatitude      float64
			StopLongitude     float64
			RouteID           string
			RouteName         string
			BaseFare          float64
		}

		if err := rows.Scan(
			&bus.ID, &bus.RegistrationPlate, &bus.Capacity, &bus.CurrentOccupancy,
			&bus.StartDate, &bus.EndDate, &bus.StopID, &bus.StopName, &bus.StopLatitude, &bus.StopLongitude, &bus.RouteID, &bus.RouteName, &bus.BaseFare); err != nil {
			log.Printf("[ERROR] Failed to scan bus: %v", err)
			continue
		}

		buses = append(buses, gin.H{
			"bus_id":             bus.ID,
			"registration_plate": bus.RegistrationPlate,
			"capacity":           bus.Capacity,
			"current_occupancy":  bus.CurrentOccupancy,
			"assignment_period": gin.H{
				"start_date": bus.StartDate,
				"end_date":   bus.EndDate,
			},
			"route": gin.H{
				"id":        bus.RouteID,
				"name":      bus.RouteName,
				"base_fare": bus.BaseFare,
			},
			"stop": gin.H{
				"id":   bus.StopID,
				"name": bus.StopName,
				"location": gin.H{
					"latitude":  bus.StopLatitude,
					"longitude": bus.StopLongitude,
				},
			},
		})

	}

	// Add after the rows.Next() loop:
	if err := rows.Err(); err != nil {
		log.Printf("[ERROR] Row iteration error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Data processing error"})
		return
	}

	if buses == nil {
		buses = make([]gin.H, 0)
	}
	log.Printf("[INFO] %d nearby buses returned", len(buses))

	c.JSON(http.StatusOK, gin.H{"nearby_buses": buses})
}
