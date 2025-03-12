// backend/internal/middleware/auth.go
package middleware

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func AuthRequired(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		log.Printf("[DEBUG] Authorization Header: %s", authHeader)

		if authHeader == "" {
			log.Printf("[Error] No authorization header provided")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No authorization header"})
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			log.Printf("[Error] Invalid header format: %v", parts)

			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid auth fmt"})
			c.Abort()
			return
		}
		tokenStr := parts[1]
		log.Printf("Token: %s", tokenStr)

		// parse and validate tok
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalidtoken claims"})
			c.Abort()
			return
		}

		jti, jtiExists := claims["jti"].(string)
		if !jtiExists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token missing jti"})
			c.Abort()
			return
		}

		var isBlacklisted bool
		err = db.QueryRow(
			`SELECT EXISTS(SELECT 1 FROM token_blacklist WHERE jti = $1)`, jti).Scan(&isBlacklisted)
		if isBlacklisted {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token revoked"})
			c.Abort()
			return
		}

		c.Set("user_id", claims["user_id"])
		c.Set("email", claims["email"])
		c.Set("school_id", claims["school_id"])

		c.Next()
	}
}

// OperatorAuthRequired checks if the user is an operator
func OperatorAuthRequired(db *sql.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// First apply the regular auth check
		AuthRequired(db)(c)

		// Check if request was aborted by the auth middleware
		if c.IsAborted() {
			return
		}

		// Get user ID from context
		userID, exists := c.Get("user_id")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User ID not found in token"})
			c.Abort()
			return
		}

		// TODO: Check if user is an operator in the database
		// For now, we'll use a simple environment variable for testing
		/* allowedOperators := strings.Split(os.Getenv("ALLOWED_OPERATORS"), ",") */
		isOperator := false
		err := db.QueryRow(`
			SELECT EXISTS(
				SELECT 1 FROM bus_operators
				WHERE user_id = $1
			)`, userID,
		).Scan(&isOperator)

		if err != nil || !isOperator{
			c.JSON(http.StatusForbidden, gin.H{"error": "operator privileges required"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
