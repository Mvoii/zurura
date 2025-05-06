// backend/internal/handlers/operator_handler.go
package handlers

import (
	"database/sql"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/Mvoii/zurura/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"
)

type OperatorHandler struct {
	db *sql.DB
}

func NewOperatorHandler(db *sql.DB) *OperatorHandler {
	return &OperatorHandler{db: db}
}

// AddBusRequest - Request body for adding a bus
type AddBusRequest struct {
	RegisterPlate string `json:"registration_plate" binding:"required"`
	Capacity      int    `json:"capacity" binding:"required,min=1"`
	BusPhotoURL   string `json:"bus_photot_url"`
}

// Request structs
type AssignBusToRouteRequest struct {
	BusID     string    `json:"bus_id" binding:"required"`
	RouteID   string    `json:"route_id" binding:"required"`
	StartDate time.Time `json:"start_date" binding:"required"`
	EndDate   time.Time `json:"end_date" binding:"required"`
}

type UpdateBusAssignmentRequest struct {
	RouteID   string    `json:"route_id" binding:"required"`
	StartDate time.Time `json:"start_date" binding:"required"`
	EndDate   time.Time `json:"end_date" binding:"required"`
	Status    string    `json:"status" binding:"required,oneof=active inactive maintenance"`
}

// create new bus
func (h *OperatorHandler) AddBus(c *gin.Context) {
	var req AddBusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// get op id from context set during auth
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	/* 	_, err := h.db.Exec(`
	   		INSERT INTO buses (
	   			operator_id,
	   			registration_plate,
	   			capacity,
	   			bus_photo_url
	   		) VALUES ($1, $2, $3, $4)`,
	   		operatorID, req.RegisterPlate, req.Capacity, req.BusPhotoURL)

	   	if err != nil {
	   		var pgErr *pgconn.PgError
	   		if errors.As(err, &pgErr) {
	   			switch pgErr.Code {
	   			case "23505": // Unique violation
	   				log.Printf("[ERROR] %v", pgErr)
	   				c.JSON(http.StatusConflict, gin.H{"error": "registration plate already exists"})
	   			case "23503": // Foreign key violation
	   				log.Printf("[ERROR] %v", pgErr)
	   				c.JSON(http.StatusNotFound, gin.H{"error": "operator not found"})
	   			default:
	   				log.Printf("[ERROR] %v", pgErr)
	   				c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
	   			}
	   		} else {
	   			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add bus"})
	   		}
	   		return
	   	} */

	tx, err := h.db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start tx"})
		return
	}
	defer tx.Rollback()

	var operatorID string
	err = tx.QueryRow(`
		SELECT id FROM bus_operators
		WHERE user_id = $1
	`, userID).Scan(&operatorID)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("[ERROR] Operator not found: %v", err)
			c.JSON(http.StatusNotFound, gin.H{"error": "Operator not found"})
			return
		}
		log.Printf("[ERROR] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	busID := uuid.New().String()
	_, err = tx.Exec(`
		INSERT INTO buses (
			id,
			operator_id,
			registration_plate,
			capacity,
			bus_photo_url,
			status
		) VALUES ($1, $2, $3, $4, $5, $6)`,
		busID, operatorID, req.RegisterPlate, req.Capacity, req.BusPhotoURL, "active")

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case "23505": // Unique violation
				log.Printf("[ERROR] %v", pgErr)
				c.JSON(http.StatusConflict, gin.H{"error": "registration plate already exists"})
			case "23503": // Foreign key violation
				log.Printf("[ERROR] %v", pgErr)
				c.JSON(http.StatusNotFound, gin.H{"error": "operator not found"})
			default:
				log.Printf("[ERROR] %v", pgErr)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			}
		} else {
			log.Printf("[ERROR] Failed to add bus: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add bus"})
		}
		return
	}
	// Commit the transaction
	if err := tx.Commit(); err != nil {
		log.Printf("[ERROR] Failed to commit transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":                 busID,
		"operator_id":        operatorID,
		"registration_plate": req.RegisterPlate,
		"capacity":           req.Capacity,
		"bus_photo_url":      req.BusPhotoURL,
		"status":             "active",
		"created_at":         time.Now(),
	})
}

// update bus details
func (h *OperatorHandler) UpdateBus(c *gin.Context) {
	operatorID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	busID := c.Param("id")
	if _, err := uuid.Parse(busID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid bus ID format"})
		return
	}

	var req struct {
		Capacity    *int   `json:"capacity"`
		BusPhotoURL string `json:"bus_photo_url"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Capacity != nil && *req.Capacity <= 0 {
		c.JSON(400, gin.H{"error": "capacity must be positive"})
	}

	// Verify bus belongs to operator
	var busExists bool
	err := h.db.QueryRow(`
        SELECT EXISTS(
            SELECT 1 FROM buses 
            WHERE id = $1 AND operator_id = $2
        )`, busID, operatorID).Scan(&busExists)

	if err != nil || !busExists {
		c.JSON(http.StatusNotFound, gin.H{"error": "bus not found"})
		return
	}

	result, err := h.db.Exec(`
		UPDATE buses
		SET
			capacity = COALESCE($1, capacity),
			bus_photo_url = COALESCE($2, bus_photo_url)
			updated_at = NOW()
		WHERE id = $3`, req.Capacity, req.BusPhotoURL, busID,
	)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			switch pgErr.Code {
			case "23505":
				log.Printf("[ERROR] %v", pgErr)
				c.JSON(http.StatusConflict, gin.H{"error": "data conflict"})
			case "23514":
				log.Printf("[ERROR] %v", pgErr)
				c.JSON(http.StatusBadRequest, gin.H{"error": "invalid capacity value"})
			default:
				log.Printf("[ERROR] Database error: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
			}
		} else {
			log.Printf("[ERROR] Update failed: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "update failed"})
		}
		return
	}

	if rowsAffected, _ := result.RowsAffected(); rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "no changes detected"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":            busID,
		"capacity":      req.Capacity,
		"bus_photo_url": req.BusPhotoURL,
	})
}

// list bus
func (h *OperatorHandler) ListBuses(c *gin.Context) {
	operatorID, _ := c.Get("user_id")

	rows, err := h.db.Query(`
		SELECT
			id, registration_plate, capacity, bus_photo_url
		FROM buses
		WHERE operator_id = $1
	`, operatorID)

	if err != nil {
		log.Printf("[error] database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	defer rows.Close()

	var buses []models.Bus
	for rows.Next() {
		var bus models.Bus
		rows.Scan(
			&bus.ID,
			&bus.RegistrationPlate,
			&bus.Capacity,
			&bus.BusPhotoURL,
		)
		buses = append(buses, bus)
	}
	c.JSON(http.StatusOK, buses)
}

// AssignBusToRoute assigns a bus to a route
func (h *OperatorHandler) AssignBusToRoute(c *gin.Context) {
	var req AssignBusToRouteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get operator IDs from context
	userID, _ := c.Get("user_id")
	/* operatorUserID, _ := c.Get("user_id") */

	// Start transaction
	tx, err := h.db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	var operatorID string
	err = tx.QueryRow(`
		SELECT id FROM bus_operators 
		WHERE user_id = $1
	`, userID).Scan(&operatorID)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("[ERROR] Operator not found: %v", err)
			c.JSON(http.StatusNotFound, gin.H{"error": "Operator not found"})
			return
		}
		log.Printf("[ERROR] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Validate bus ownership and availability
	var bus struct {
		Capacity int
		Status   string
	}
	err = tx.QueryRow(`
        SELECT b.capacity, b.status 
        FROM buses b
        WHERE b.id = $1 AND b.operator_id = $2
    `, req.BusID, operatorID).Scan(&bus.Capacity, &bus.Status)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("[ERROR] Bus not found: %v", err)
			c.JSON(http.StatusNotFound, gin.H{"error": "Bus not found or not owned by operator"})
			return
		}
		log.Printf("[ERROR] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if bus.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bus is not active"})
		return
	}

	// Validate route exists and is active
	var route struct {
		BaseFare float64
		Status   string
	}
	err = tx.QueryRow(`
        SELECT base_fare, status 
        FROM bus_routes 
        WHERE id = $1
    `, req.RouteID).Scan(&route.BaseFare, &route.Status)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("[ERROR] Route not found: %v", err)
			c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
			return
		}
		log.Printf("[ERROR] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if route.Status != "active" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Route is not active"})
		return
	}

	// Check for active assignment conflicts
	var hasActiveConflict bool
	err = tx.QueryRow(`
        SELECT EXISTS(
            SELECT 1 FROM bus_route_assignments
            WHERE bus_id = $1 
            AND status = 'active'
            AND (
                (start_date <= $2 AND end_date >= $2) OR
                (start_date <= $3 AND end_date >= $3) OR
                (start_date >= $2 AND end_date <= $3)
            )
        )
    `, req.BusID, req.StartDate, req.EndDate).Scan(&hasActiveConflict)

	if err != nil {
		log.Printf("[ERROR] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if hasActiveConflict {
		log.Printf("[ERROR] Bus is already assigned during this period")
		c.JSON(http.StatusConflict, gin.H{
			"error":   "Bus is already assigned during this period",
			"details": "Please check existing assignments or choose a different time period",
		})
		return
	}

	// Create the assignment
	assignmentID := uuid.New().String()
	_, err = tx.Exec(`
        INSERT INTO bus_route_assignments (
            id, bus_id, route_id, operator_id, operator_user_id,
            status, start_date, end_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, assignmentID, req.BusID, req.RouteID, operatorID, userID,
		"active", req.StartDate, req.EndDate)

	if err != nil {
		log.Printf("[ERROR] Failed to create assignment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create assignment"})
		return
	}

	// Update bus status
	_, err = tx.Exec(`
        UPDATE buses 
        SET status = 'assigned', updated_at = NOW()
        WHERE id = $1
    `, req.BusID)

	if err != nil {
		log.Printf("[ERROR] Failed to update bus status: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update bus status"})
		return
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		log.Printf("[ERROR] Failed to commit transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":       "Bus assigned to route successfully",
		"assignment_id": assignmentID,
		"bus_id":        req.BusID,
		"route_id":      req.RouteID,
		"operator_id":   operatorID,
		"status":        "active",
		"start_date":    req.StartDate,
		"end_date":      req.EndDate,
		"created_at":    time.Now(),
	})
}

// UpdateBusAssignment updates an existing bus route assignment
func (h *OperatorHandler) UpdateBusAssignment(c *gin.Context) {
	assignmentID := c.Param("assignment_id")
	var req UpdateBusAssignmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get operator IDs from context
	operatorUserID, _ := c.Get("user_id")
	var operatorID string
	err := h.db.QueryRow(`
		SELECT operator_id FROM bus_route_assignments WHERE operator_user_id = $1
	`, operatorUserID).Scan(&operatorID)
	if err != nil {
		log.Printf("[ERROR] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Start transaction
	tx, err := h.db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	// Validate assignment exists and belongs to operator
	var assignment struct {
		BusID   string
		RouteID string
		Status  string
	}
	err = tx.QueryRow(`
        SELECT bus_id, route_id, status
        FROM bus_route_assignments
        WHERE id = $1 AND operator_id = $2 AND operator_user_id = $3
    `, assignmentID, operatorID, operatorUserID).Scan(&assignment.BusID, &assignment.RouteID, &assignment.Status)

	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("[ERROR] Assignment not found: %v", err)
			c.JSON(http.StatusNotFound, gin.H{"error": "Assignment not found or not owned by operator"})
			return
		}
		log.Printf("[ERROR] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Check for conflicts with other active assignments
	var hasConflict bool
	err = tx.QueryRow(`
        SELECT EXISTS(
            SELECT 1 FROM bus_route_assignments
            WHERE bus_id = $1 
            AND id != $2
            AND status = 'active'
            AND (
                (start_date <= $3 AND end_date >= $3) OR
                (start_date <= $4 AND end_date >= $4) OR
                (start_date >= $3 AND end_date <= $4)
            )
        )
    `, assignment.BusID, assignmentID, req.StartDate, req.EndDate).Scan(&hasConflict)

	if err != nil {
		log.Printf("[ERROR] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if hasConflict {
		log.Printf("[ERROR] Bus is already assigned during this period")
		c.JSON(http.StatusConflict, gin.H{
			"error":   "Bus is already assigned during this period",
			"details": "Please check existing assignments or choose a different time period",
		})
		return
	}

	// Update the assignment
	_, err = tx.Exec(`
        UPDATE bus_route_assignments
        SET 
            route_id = $1,
            start_date = $2,
            end_date = $3,
            status = $4,
            updated_at = NOW()
        WHERE id = $5
    `, req.RouteID, req.StartDate, req.EndDate, req.Status, assignmentID)

	if err != nil {
		log.Printf("[ERROR] Failed to update assignment: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update assignment"})
		return
	}

	// Update bus status based on assignment status
	_, err = tx.Exec(`
        UPDATE buses 
        SET 
            status = CASE 
                WHEN $1 = 'active' THEN 'assigned'
                WHEN $1 = 'maintenance' THEN 'maintenance'
                ELSE 'inactive'
            END,
            updated_at = NOW()
        WHERE id = $2
    `, req.Status, assignment.BusID)

	if err != nil {
		log.Printf("[ERROR] Failed to update bus status: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update bus status"})
		return
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		log.Printf("[ERROR] Failed to commit transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Bus assignment updated successfully",
		"assignment": gin.H{
			"id":         assignmentID,
			"bus_id":     assignment.BusID,
			"route_id":   req.RouteID,
			"status":     req.Status,
			"start_date": req.StartDate,
			"end_date":   req.EndDate,
			"updated_at": time.Now(),
		},
	})
}

// GetBusAssignments retrieves all assignments for a bus
func (h *OperatorHandler) GetBusAssignments(c *gin.Context) {
	busID := c.Param("bus_id")
	//userID, _ := c.Get("user_id")

	var operatorID string
	err := h.db.QueryRow(`
		SELECT operator_id FROM buses WHERE id = $1
	`, busID).Scan(&operatorID)

	rows, err := h.db.Query(`
        SELECT 
            bra.id, bra.bus_id, bra.route_id, bra.status,
            bra.start_date, bra.end_date, bra.created_at,
            br.route_name, br.description
        FROM bus_route_assignments bra
        JOIN bus_routes br ON bra.route_id = br.id
        WHERE bra.bus_id = $1 AND bra.operator_id = $2
        ORDER BY bra.start_date DESC
    `, busID, operatorID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assignments"})
		return
	}
	defer rows.Close()

	var assignments []struct {
		ID          string    `json:"id"`
		BusID       string    `json:"bus_id"`
		RouteID     string    `json:"route_id"`
		Status      string    `json:"status"`
		StartDate   time.Time `json:"start_date"`
		EndDate     time.Time `json:"end_date"`
		CreatedAt   time.Time `json:"created_at"`
		RouteName   string    `json:"route_name"`
		Description string    `json:"description"`
	}

	for rows.Next() {
		var a struct {
			ID          string    `json:"id"`
			BusID       string    `json:"bus_id"`
			RouteID     string    `json:"route_id"`
			Status      string    `json:"status"`
			StartDate   time.Time `json:"start_date"`
			EndDate     time.Time `json:"end_date"`
			CreatedAt   time.Time `json:"created_at"`
			RouteName   string    `json:"route_name"`
			Description string    `json:"description"`
		}
		err := rows.Scan(
			&a.ID, &a.BusID, &a.RouteID, &a.Status,
			&a.StartDate, &a.EndDate, &a.CreatedAt,
			&a.RouteName, &a.Description,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan assignments"})
			return
		}
		assignments = append(assignments, a)
	}

	c.JSON(http.StatusOK, assignments)
}

func (h *OperatorHandler) GetBusDetails(c *gin.Context) {
	BusID := c.Param("bus_id")
	if _, err := uuid.Parse(BusID); err != nil {
		log.Printf("[ERROR] Bus ID is invalid")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid bus ID format"})
		return
	}

	log.Printf("[INFO] Fetching bus details for ID: %s", BusID)

	var bus models.Bus
	err := h.db.QueryRow(`
		SELECT
			id, operator_id, registration_plate, capacity, bus_photo_url, status, current_occupancy, created_at, updated_at
		FROM buses
		WHERE id = $1
	`, BusID).Scan(
		&bus.ID,
		&bus.OperatorID,
		&bus.RegistrationPlate,
		&bus.Capacity,
		&bus.BusPhotoURL,
		&bus.Status,
		&bus.CurrentOccupancy,
		&bus.CreatedAt,
		&bus.UpdatedAt,
	)

	if err != nil {
		log.Printf("[error] database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retreive bus details"})
		return
	}
	log.Printf("[INFO] Bus details fetched successfully: %v", bus)

	/*
		row.Scan(
			&bus.ID,
			&bus.RegistrationPlate,
			&bus.Capacity,
			&bus.BusPhotoURL,
		) */

	// include assignment details if available
	var assignment struct {
		RouteID   string    `json:"route_id"`
		StartDate time.Time `json:"start_date"`
		EndDate   time.Time `json:"end_date"`
	}

	h.db.QueryRow(`
		SELECT route_id, start_date, end_date
		FROM bus_route_assignments
		WHERE bus_id = $1 AND status = 'active'
		LIMIT 1
	`, BusID).Scan(&assignment.RouteID, &assignment.StartDate, &assignment.EndDate)


	c.JSON(http.StatusOK, gin.H{
		"bus": bus,
		"current_assignment": assignment,
	})
}
