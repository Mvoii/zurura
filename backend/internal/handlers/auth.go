// backend/internal/handlers/auth.go
package handlers

import (
	"database/sql"
	"net/http"
	"os"
	"time"

	"github.com/Mvoii/zurura/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
	// "github.com/Mvoii/zurura/backend/models"
)

type AuthHandler struct {
	db *sql.DB
}

func NewAuthHandler(db *sql.DB) *AuthHandler {
	return (&AuthHandler{db: db})
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required, min=8"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	SchoolID  string `json:"school_id" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// query user from db
	var user models.User
	query := `SELECT id, email, password_hash, first_name, last_name, school_id FROM users WHERE email= $1`
	err := h.db.QueryRow(query, req.Email).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.FirstName, &user.LastName, &user.SchoolID)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Credentials"})
		return
	}

	// TODO: Implement actual user auth
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":   user.ID,
		"email":     user.Email,
		"school_id": user.SchoolID,
		"exp":       time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
	})

	tokenStr, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenStr,
		"user": gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"first_name": user.FirstName,
			"last_name":  user.LastName,
			"school_id":  user.SchoolID,
		},
	})
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// check if email already exists
	var count int
	query := `SELECT COUNT(*) FROM users WHERE email = $1`
	if err := h.db.QueryRow(query, req.Email).Scan(&count); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		return
	}

	// hash
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not gen hash"})
		return
	}

	userID := generateUUID()

	insertQuery := `
		INSERT INTO users (id, email, password_hash, first_name, last_name, school_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
	`
	_, err = h.db.Exec(insertQuery, userID, req.Email, string(hashedPass), req.FirstName, req.LastName, req.SchoolID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// gen tok for immediate login
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":   userID,
		"email":     req.Email,
		"school_id": req.SchoolID,
		"exp":       time.Now().Add(time.Hour * 24 * 7).Unix(),
	})

	tokStr, err := tok.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not gen tok"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": tokStr,
		"user": gin.H{
			"id":         userID,
			"email":      req.Email,
			"first_name": req.FirstName,
			"last_name":  req.LastName,
			"school_id":  req.SchoolID,
		},
	})
}

// helpers
func generateUUID() string {
	// TODO: in prod use proper UUID lib
	// this is for dev
	return "user_" + time.Now().Format("20060102150405")
}
