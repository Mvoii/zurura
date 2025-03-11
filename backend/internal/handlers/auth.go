// backend/internal/handlers/auth.go
package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/Mvoii/zurura/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/google/uuid"
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
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=8"`
	FirstName  string `json:"first_name" binding:"required"`
	LastName   string `json:"last_name" binding:"required"`
	SchoolName string `json:"school_name" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// query user from db
	var user models.User
	query := `SELECT id, email, password_hash, first_name, last_name, school_name FROM users WHERE email= $1`
	err := h.db.QueryRow(query, req.Email).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.FirstName, &user.LastName, &user.SchoolName)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Credentials"})
		return
	}

	// Implement actual user auth
	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.PasswordHash),
		[]byte(req.Password),
	); err != nil {
		log.Printf("Failed login attempt for %s", req.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Credentials"})
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":     user.ID,
		"email":       user.Email,
		"school_name": user.SchoolName,
		"exp":         time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
		"jti":         uuid.New().String(),
	})

	tokenStr, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenStr,
		"user": gin.H{
			"id":          user.ID,
			"email":       user.Email,
			"first_name":  user.FirstName,
			"last_name":   user.LastName,
			"school_name": user.SchoolName,
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
	query := `SELECT COUNT(*) FROM "users" WHERE email = $1`
	if err := h.db.QueryRow(query, req.Email).Scan(&count); err != nil {
		log.Printf("DATABASE ERROR: 1 - %v", err)
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

	userID := uuid.New()

	insertQuery := `
		INSERT INTO users (id, email, password_hash, first_name, last_name, school_name)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err = h.db.Exec(insertQuery, userID, req.Email, string(hashedPass), req.FirstName, req.LastName, req.SchoolName)
	if err != nil {
		log.Printf("DATABASE ERROR: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// gen tok for immediate login
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":     userID,
		"email":       req.Email,
		"school_name": req.SchoolName,
		"exp":         time.Now().Add(time.Hour * 24 * 1).Unix(),
		"jti":         uuid.New().String(),
	})

	tokStr, err := tok.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not gen tok"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": tokStr,
		"user": gin.H{
			"id":          userID,
			"email":       req.Email,
			"first_name":  req.FirstName,
			"last_name":   req.LastName,
			"school_name": req.SchoolName,
		},
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing token"})
		return
	}

	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenStr == authHeader {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token format"})
		return
	}

	token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})
	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	// add to black list
	jti, jtiExists := claims["jti"].(string)
	exp, expExists := claims["exp"].(float64)
	if !jtiExists || !expExists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Token missing required claims"})
		return
	}

	expiresAt := time.Unix(int64(exp), 0)
	_, err = h.db.Exec(`
		INSERT INTO token_blacklist (jti, token, expires_at)
		VALUES ($1, $2, $3)
		ON CONFLICT (jti) DO NOTHING`, // prevent duplicates
		jti, tokenStr, expiresAt,
	)

	if err != nil {
		log.Printf("Failed to blacklist tok: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to log out"})
	}
}

// helpers
/* func generateUUID() string {
	return uuid.New().String()
}
*/
