// backend/cmd/api/main.go
package main

import (
	"log"
	"os"

	"github.com/Mvoii/zurura/internal/db"
	"github.com/Mvoii/zurura/internal/handlers"
	"github.com/Mvoii/zurura/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found")
	}

	db, err := db.NewPostgresDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	r := gin.Default()

	// init handlers
	authHandler := handlers.NewAuthHandler(db)

	// public routes
	r.POST("/api/v1/auth/login", authHandler.Login)

	// protected routes
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// add protected routes
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
