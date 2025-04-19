// backend/internal/handlers/user.go
package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"github.com/Mvoii/zurura/internal/models"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	db *sql.DB
}

func NewUserHandler(db *sql.DB) *UserHandler {
	return &UserHandler{db: db}
}

type UpdateProfileRequest struct {
	FirstName       string `json:"first_name" binding:"omitempty,min=1"`
	LastName        string `json:"last_name" binding:"omitempty,min=1"`
	PhoneNumber     string `json:"phone_number" binding:"omitempty"`
	ProfilePhotoURL string `json:"profile_photo_url" binding:"omitempty"`
	SchoolName      string `json:"school_name" binding:"omitempty"`
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var user models.User
	query := `
		SELECT id, email, first_name, last_name, school_name, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	err := h.db.QueryRow(query, userID).Scan(
		&user.ID, &user.Email, &user.FirstName, &user.LastName,
		&user.SchoolName, &user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user profile"})
		return
	}

	// Don't expose password hash
	user.PasswordHash = ""

	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Start transaction for safe updates
	tx, err := h.db.Begin()
	if err != nil {
		log.Printf("[ERROR] Failed to start transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start transaction"})
		return
	}
	defer tx.Rollback()

	// Construct update query dynamically based on provided fields
	query := "UPDATE users SET updated_at = NOW()"
	params := []interface{}{}
	paramCount := 1

	if req.FirstName != "" {
		query += fmt.Sprintf(", first_name = $%d", paramCount)
		params = append(params, req.FirstName)
		paramCount++
	}

	if req.LastName != "" {
		query += fmt.Sprintf(", last_name = $%d", paramCount)
		params = append(params, req.LastName)
		paramCount++
	}

	if req.PhoneNumber != "" {
		query += fmt.Sprintf(", phone_number = $%d", paramCount)
		params = append(params, req.PhoneNumber)
		paramCount++
	}

	if req.ProfilePhotoURL != "" {
		query += fmt.Sprintf(", profile_photo_url = $%d", paramCount)
		params = append(params, req.ProfilePhotoURL)
		paramCount++
	}

	if req.SchoolName != "" {
		query += fmt.Sprintf(", school_name = $%d", paramCount)
		params = append(params, req.SchoolName)
		paramCount++
	}

	// Add WHERE clause and user ID parameter
	query += fmt.Sprintf(" WHERE id = $%d", paramCount)
	params = append(params, userID)

	// Execute update query
	_, err = tx.Exec(query, params...)
	if err != nil {
		log.Printf("[ERROR] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	if err := tx.Commit(); err != nil {
		log.Printf("[ERROR] Failed to commit transaction: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	// Fetch and return updated user profile
	var user models.User
	fetchQuery := `
		SELECT id, email, first_name, last_name, school_name, 
		       phone_number, profile_photo_url, ride_count, 
		       created_at, updated_at
		FROM users
		WHERE id = $1
	`

	err = h.db.QueryRow(fetchQuery, userID).Scan(
		&user.ID, &user.Email, &user.FirstName, &user.LastName,
		&user.SchoolName, &user.PhoneNumber, &user.ProfilePhotoURL, &user.RideCount,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		log.Printf("[ERROR] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated profile"})
		return
	}

	// Don't expose password hash
	user.PasswordHash = ""

	c.JSON(http.StatusOK, user)
}
