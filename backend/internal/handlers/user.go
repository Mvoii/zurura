// backend/internal/handlers/user.go
package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	//"time"

	"github.com/Mvoii/zurura/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
	// Use a nullable field for profile_photo_url
	var profilePhotoURL sql.NullString
	
	query := `
		SELECT id, email, first_name, last_name, phone_number, profile_photo_url, school_name, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	err := h.db.QueryRow(query, userID).Scan(
		&user.ID, &user.Email, &user.FirstName, &user.LastName, 
		&user.PhoneNumber, &profilePhotoURL, &user.SchoolName, 
		&user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		log.Printf("[ERROR] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user profile"})
		return
	}

	// Convert NullString to string
	if profilePhotoURL.Valid {
		user.ProfilePhotoURL = profilePhotoURL.String
	} else {
		user.ProfilePhotoURL = ""
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
	// Use a nullable field for profile_photo_url to handle NULL values
	var profilePhotoURL sql.NullString
	var phoneNumber sql.NullString
	var rideCount sql.NullInt32
	
	fetchQuery := `
		SELECT id, email, first_name, last_name, school_name, 
		       phone_number, profile_photo_url, ride_count, 
		       created_at, updated_at
		FROM users
		WHERE id = $1
	`

	err = h.db.QueryRow(fetchQuery, userID).Scan(
		&user.ID, &user.Email, &user.FirstName, &user.LastName,
		&user.SchoolName, &phoneNumber, &profilePhotoURL, &rideCount,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if err != nil {
		log.Printf("[ERROR] Database error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch updated profile"})
		return
	}

	// Convert NullString and NullInt32 to regular types
	if profilePhotoURL.Valid {
		user.ProfilePhotoURL = profilePhotoURL.String
	} else {
		user.ProfilePhotoURL = ""
	}
	
	if phoneNumber.Valid {
		user.PhoneNumber = phoneNumber.String
	} else {
		user.PhoneNumber = ""
	}
	
	if rideCount.Valid {
		user.RideCount = int(rideCount.Int32)
	} else {
		user.RideCount = 0
	}

	// Don't expose password hash
	user.PasswordHash = ""

	c.JSON(http.StatusOK, user)
}

// UploadProfilePhoto handles file uploads for profile pictures
func (h *UserHandler) UploadProfilePhoto(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Get the file from the request
	file, err := c.FormFile("photo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded or invalid form field"})
		return
	}

	// Validate file type
	if !isValidImageType(file.Filename) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type. Only JPG, JPEG, PNG and GIF are allowed"})
		return
	}

	// Max file size: 5MB
	const maxSize = 5 * 1024 * 1024
	if file.Size > maxSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File too large. Maximum size is 5MB"})
		return
	}

	// Create uploads directory if it doesn't exist
	uploadsDir := "./uploads/profile_photos"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		log.Printf("[ERROR] Failed to create uploads directory: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Server error"})
		return
	}

	// Generate a unique filename
	fileExt := filepath.Ext(file.Filename)
	newFilename := fmt.Sprintf("%s-%s%s", userID, uuid.New().String(), fileExt)
	filePath := filepath.Join(uploadsDir, newFilename)

	// Save the file
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		log.Printf("[ERROR] Failed to save file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Generate URL for the saved file
	baseURL := os.Getenv("API_BASE_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8080"
	}
	fileURL := fmt.Sprintf("%s/uploads/profile_photos/%s", baseURL, newFilename)

	// Update user profile with the new photo URL
	_, err = h.db.Exec(`
		UPDATE users 
		SET profile_photo_url = $1, updated_at = NOW() 
		WHERE id = $2
	`, fileURL, userID)

	if err != nil {
		log.Printf("[ERROR] Failed to update profile photo URL: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Profile photo uploaded successfully",
		"url": fileURL,
	})
}

// Helper function to validate image file types
func isValidImageType(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validExtensions := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
	}
	return validExtensions[ext]
}
