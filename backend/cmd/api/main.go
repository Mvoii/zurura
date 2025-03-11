// backend/cmd/api/main.go
package main

import (
	"log"
	"os"
	"time"

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

	go func() {
		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()

		for range ticker.C {
			_, err := db.Exec(`
				DELETE FROM token_blacklist
				WHERE expires_at < NOW() - INTERVAL '2 days'
			`)
			if err != nil {
				log.Printf("failed to clean up expired toks: %v", err)
			}
		}
	}()

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
	r.Use(
		middleware.CORS(),
		gin.Recovery(),
	)

	// public routes
	api := r.Group("/a/v1")
	{
		public := api.Group("/")
		{
			public.POST("/auth/login", authHandler.Login)
			public.POST("/auth/register", authHandler.Register)
		}

		// protected routes
		protected := api.Group("/")
		protected.Use(middleware.AuthRequired(db))
		{
			protected.POST("/auth/logout", authHandler.Logout)
			// User profile
			protected.GET("/me/profile", userHandler.GetProfile)
			// protected.PUT("/users/profile", userHandler.UpdateProfile)
		}

		protected.Use(middleware.OperatorAuthRequired(db))
		{
			protected.POST("/op/buses", operatorHandler.AddBus)
			protected.PUT("/op/buses/:id", operatorHander.UpdateBus)
			protected.GET("/op/buses", operatorHander.ListBuses)
		}
	}

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
