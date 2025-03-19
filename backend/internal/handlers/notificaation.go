// internal/handlers/notifications.go
package handlers

import (
	"log"
	"net/http"

	"github.com/Mvoii/zurura/internal/models"
	"github.com/gin-gonic/gin"
)

func (h *UserHandler) GetNotifications(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	rows, err := h.db.Query(`
		SELECT id, type, message, read, created_at
		FROM notifications
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 50
	`, userID)

	if err != nil {
		log.Printf("Database error fetching notifications: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve notifications"})
		return
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var n models.Notification
		err := rows.Scan(
			&n.ID,
			&n.Type,
			&n.Message,
			&n.ReadAt,
			&n.CreatedAt,
		)
		if err != nil {
			log.Printf("Error scanning notification row: %v", err)
			continue // Skip malformed rows but return others
		}
		notifications = append(notifications, n)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Notification iteration error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Data processing error"})
		return
	}

	// Return empty array instead of null when no notifications
	if notifications == nil {
		notifications = make([]models.Notification, 0)
	}

	c.JSON(http.StatusOK, notifications)
}
