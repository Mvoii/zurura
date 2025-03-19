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

type OperatorRegisterRequest struct {
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Company   string `json:"company" binding:"required"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// query user from db
	var user models.User
	query := `SELECT id, email, password_hash, first_name, last_name FROM users WHERE email= $1`
	err := h.db.QueryRow(query, req.Email).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.FirstName, &user.LastName)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid Credentials"})
		return
	}

	//var isOperator bool
	var role string
	err = h.db.QueryRow(
		`SELECT CASE WHEN EXISTS(SELECT 1 FROM bus_operators WHERE user_id = $1) THEN 'operator' ELSE 'user' END`, user.ID).Scan(&role)
	if err != nil {
		log.Printf("Operator check failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Internal Server Error"})
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

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(), // 7 days
		"jti":     uuid.New().String(),
	}
/* 	if isOperator {
		claims["role"] = "operator"
	} */

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

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
			"role":       claims["role"],
		},
	})
}

func (h *AuthHandler) RegisterOperator(c *gin.Context) {
	var req OperatorRegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if email exists
	var count int
	query := `SELECT COUNT(*) FROM users WHERE email = $1`
	if err := h.db.QueryRow(query, req.Email).Scan(&count); err != nil || count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
		return
	}

	// Hash password
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
		return
	}

	// Create user
	userID := uuid.New().String()
	_, err = h.db.Exec(`
        INSERT INTO users (id, email, password_hash, first_name, last_name, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    `, userID, req.Email, string(hashedPass), req.FirstName, req.LastName)

	if err != nil {
		log.Printf("[DEBUG] error creaing user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Create operator entry
	_, err = h.db.Exec(`
        INSERT INTO bus_operators (id, user_id, name, contact_info, email, phone, address)
        VALUES ($1, $2, $3, '', $4, '', '')
    `, uuid.New().String(), userID, req.Company, req.Email)

	if err != nil {
		log.Printf("DATABASE ERROR: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create operator"})
		return
	}

	// Generate JWT token (same as regular login)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"email":   req.Email,
		"role":    "operator",
		"exp":     time.Now().Add(time.Hour * 24 * 7).Unix(),
		"jti":     uuid.New().String(),
	})

	tokenStr, _ := token.SignedString([]byte(os.Getenv("JWT_SECRET")))

	c.JSON(http.StatusCreated, gin.H{
		"token": tokenStr,
		"user": gin.H{
			"id":         userID,
			"email":      req.Email,
			"first_name": req.FirstName,
			"last_name":  req.LastName,
			"role":       "operator", // Indicate operator role
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
		log.Printf("[DATABASE ERROR] email checker: %v", err)
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
