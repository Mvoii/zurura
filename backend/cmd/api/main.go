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
		log.Printf("Warning: .env file not found\n env file should contain:\n DATABASE_URI\n JWT_SECRET\n PORT\n")
	}

	db, err := db.NewPostgresDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	r := gin.Default()

	// init handlers
	authHandler := handlers.NewAuthHandler(db)
	userHandler := handlers.NewUserHandler(db)
	//bussHandler := handlers
	//routeHandler :=
	//trackingHandler :=
	// bookingHandler :=
	// paymentHander :=
	// operatorHandler :=

	// middleware
	r.Use(middleware.CORS())

	// public routes
	public := r.Group("/a/v1/")
	{
		// auth
		public.POST("/auth/login", authHandler.Login)
		public.POST("/auth/register", authHandler.Register)
	}

	// r.POST("/api/v1/auth/login", authHandler.Login)

	// protected routes
	protected := r.Group("/a/v1/")
	protected.Use(middleware.AuthRequired())
	{
		// User profile
		protected.GET("/users/profile", userHandler.GetProfile)
		// protected.PUT("/users/profile", userHandler.UpdateProfile)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8050"
	}

	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
