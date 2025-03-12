// backend/internal/handlers/operator_handler.go
package handlers

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/Mvoii/zurura/internal/models"
	"github.com/gin-gonic/gin"
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

// create new bus
func (h *OperatorHandler) AddBus(c *gin.Context) {
	var req AddBusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// get op id from context set during auth
	operatorID, _ := c.Get("user_id")

	_, err := h.db.Exec(`
		INSERT INTO buses (
			operator_id.
			registration_plate,
			capacity,
			bus_photo_url
		) VAALUES ($1, $2, $3, $4)`,
		operatorID, req.RegisterPlate, req.Capacity, req.BusPhotoURL)

	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"message": "reg plate already exists"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"error": "Bus added successfully"})
}

// update bus details
func (h *OperatorHandler) UpdateBus(c *gin.Context) {
	busID := c.Param("id")
	var req struct {
		Capacity    *int   `json:"capacity"`
		BusPhotoURL string `json:"bus_photo_url"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.db.Exec(`
		UPDATE buses
		SET
			capacity = COALESCE($1, capacity),
			bus_photo_url = COALECSE($2, bus_photo_url)
		WHERE id = $3`, req.Capacity, req.BusPhotoURL, busID,
	)
	if err != nil {
		log.Printf("[error] database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if rowsAffected, _ := result.RowsAffected(); rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bus not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "bus updated"})
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
