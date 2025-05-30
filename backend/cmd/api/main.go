// backend/cmd/api/main.go
package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/Mvoii/zurura/internal/db"
	"github.com/Mvoii/zurura/internal/handlers"
	"github.com/Mvoii/zurura/internal/middleware"
	"github.com/Mvoii/zurura/internal/services/booking"
	services "github.com/Mvoii/zurura/internal/services/notifications"
	"github.com/Mvoii/zurura/internal/services/payments"
	"github.com/Mvoii/zurura/internal/services/tracking"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

/* var Upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins, change for prod
	},
} */

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found\n env file should contain:\n DATABASE_URI\n JWT_SECRET\n PORT\n")
	}

	db, err := db.NewPostgresDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	log.Printf("[LOG] db connected")

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
		log.Printf("[LOG] cleared expired tokens")
	}()

	// start broadcasting

	r := gin.Default()

	// Initialize payment service
	paymentService := payments.NewMockPaymentService()

	// Initialize booking service with payment service
	bookingService := booking.NewBookingService(db, paymentService)

	// Initialize handlers
	bookingHandler := handlers.NewBookingHandler(db, bookingService)
	authHandler := handlers.NewAuthHandler(db)
	userHandler := handlers.NewUserHandler(db)
	//bussHandler := handlers
	scheduleHandler := handlers.NewScheduleHandler(db)
	trackingService := tracking.NewTrackingService(db)
	trackingHandler := handlers.NewTrackingHandler(trackingService)
	routeHandler := handlers.NewRouteHandler(db)
	//trackingHandler :=
	// bookingHandler :=
	// paymentHander :=
	operatorHandler := handlers.NewOperatorHandler(db)
	notificationHandler := handlers.NewNotificationHandler(db)
	notificationService := services.NewNotificationService(db, notificationHandler)

	/// go routine to start broadcasting for websockets
	go notificationHandler.StartBroadcasting()

	// start background notification service processing
	go notificationService.ProcessNotifications()

	/// [MOCK]
	/// Initialize with mock payment service
	//paymentService := handlers.MockPaymentService{}
	//bookingHandler := handlers.NewBookingHandler(db, &paymentService)

	// middleware
	r.Use(
		middleware.CORS(),
		gin.Recovery(),
	)

	// Setup static file serving for uploaded files
	r.Static("/uploads", "./uploads")

	// public routes
	api := r.Group("/a/v1")
	{
		public := api.Group("/")
		{
			public.POST("/auth/login", authHandler.Login)
			public.POST("/auth/register", authHandler.Register)
			public.POST("/auth/register/op", authHandler.RegisterOperator)

			public.GET("/schedules", scheduleHandler.ListSchedules)

			public.GET("/bus/:bus_id", operatorHandler.GetBusDetails)
		}

		// protected routes
		protected := api.Group("/")
		//protected.GET("/notifications/ws", notificationHandler.HandleWebSocket)
		protected.Use(middleware.AuthRequired(db))
		{
			protected.POST("/auth/logout", authHandler.Logout)
			// User profile
			protected.GET("/me/profile", userHandler.GetProfile)
			protected.PUT("/me/profile", userHandler.UpdateProfile)
			protected.POST("/me/profile/photo", userHandler.UploadProfilePhoto)

			// Add booking routes
			protected.POST("/bookings", bookingHandler.CreateBooking)
			protected.POST("/bookings/:id/cancel", bookingHandler.CancelBooking)
			protected.GET("/me/bookings", bookingHandler.GetUserBookings)

			// notifs
			protected.GET("/me/notifications", notificationHandler.GetNotifications)
			protected.GET("/me/notifications/:notification_id/read", notificationHandler.GetNotificationDetails)
			protected.POST("/me/notifications/:notification_id/read", notificationHandler.MarkAsRead)
		}

		protected.Use(middleware.OperatorAuthRequired(db), middleware.RoleRequired("operator"))
		{
			protected.POST("/op/buses", operatorHandler.AddBus)
			protected.PUT("/op/buses/:id", operatorHandler.UpdateBus)
			protected.GET("/op/buses", operatorHandler.ListBuses)

			protected.POST("/op/routes", routeHandler.CreateRoute)
			protected.POST("/op/:route_id/stops", routeHandler.AddStopToRoute)

			protected.POST("/op/schedules", scheduleHandler.CreateSchedule)
			protected.POST("/op/buses/:bus_id/assign", operatorHandler.AssignBusToRoute)
			protected.GET("/op/buses/:bus_id/assignments", operatorHandler.GetBusAssignments)
			protected.PUT("/op/buses/assignments/:assignment_id", operatorHandler.UpdateBusAssignment)
		}

		driverRoutes := api.Group("/driver")
		driverRoutes.Use(middleware.AuthRequired(db), middleware.RoleRequired("driver"))
		{
			driverRoutes.POST("/tracking", trackingHandler.UpdateLocation)

		}

		publicTracking := api.Group("/tracking")
		{
			publicTracking.GET("/nearby", trackingHandler.GetNearby)
			publicTracking.GET("/:bus_id", trackingHandler.GetBusLocation)
		}

		publicRoutes := api.Group("/routes")
		{
			publicRoutes.GET("/:route_id", routeHandler.GetRouteDetails)
			publicRoutes.GET("", routeHandler.FindRoutes)
			publicRoutes.GET("/:route_id/buses", routeHandler.GetBusesOnRoute)                             // get buses on route
			publicRoutes.GET("/nearby-buses", routeHandler.GetNearbyBusesbyStop) // get nearby buses by stop, random 3 buses nearby
			publicRoutes.GET("/search-route", routeHandler.GetRouteByName)

		}

		for _, ri := range r.Routes() {
			fmt.Printf("METHOD: %s\tPATH: %s\n", ri.Method, ri.Path)
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
}
