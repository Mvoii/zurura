// internal/handlers/notifications.go
package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"strconv"
	"sync"

	"github.com/Mvoii/zurura/cmd/api/main"
	"github.com/Mvoii/zurura/internal/models"
	"github.com/gin-gonic/gin"

	// "golang.org/x/net/websocket"
	"github.com/gorilla/websocket"
)

type Client struct {
	conn   *websocket.Conn
	UserID string
	Send   chan models.Notification
}

type NotificationHandler struct {
	db        *sql.DB
	Clients   map[string]*Client
	broadcast chan models.Notification
	Mutex     sync.RWMutex
}

func NewNotificationHandler(db *sql.DB) *NotificationHandler {
	return &NotificationHandler{
		db:        db,
		Clients:   make(map[string]*Client),
		broadcast: make(chan models.Notification, 100),
	}
}

func (h *NotificationHandler) HandleWebSocket(c *gin.Context) {
	// aut via jwt
	userID, exists := c.Get("user_id")
	if !exists {
		log.Printf("User not authenticated")
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	conn, err := main.Upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	client := &Client{
		conn:   conn,
		UserID: userID.(string),
		Send:   make(chan models.Notification, 256),
	}

	h.Mutex.Lock()
	h.Clients[client.UserID] = client
	h.Mutex.Unlock()

	go client.writePump()
	go client.readPump(h)
}

func (c *Client) writePump() {
	defer func() {
		c.conn.Close()
	}()

	for {
		select {
		case notification, ok := <-c.Send:
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			err := c.conn.WriteJSON(notification)
			if err != nil {
				log.Printf("Error writing to websocket: %v", err)
				return
			}
		}
	}
}

func (c *Client) readPump(h *NotificationHandler) {
	defer func() {
		h.Mutex.Lock()
		delete(h.Clients, c.UserID)
		h.Mutex.Unlock()
		c.conn.Close()
	}()

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway) {
				log.Printf("WebSocket unexpected close: %v", err)
			} else {
				log.Printf("Error reading from websocket: %v", err)
			}
			break
		}
	}
}

func (h *NotificationHandler) GetNotifications(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// pagination params
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * limit

	rows, err := h.db.Query(`
		SELECT id, type, message, delivered_at, read_at, delivery_attempts, last_attempt_at, created_at

		FROM notifications
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`, userID, limit, offset)

	if err != nil {
		log.Printf("Database error fetching notifications: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve notifications"})
		return
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var n models.Notification
		var deliveredAt, readAt, LastAttemptAt sql.NullTime

		err := rows.Scan(
			&n.ID,
			&n.Type,
			&n.Message,
			&deliveredAt,
			&readAt,
			&n.DeliveryAttempts,
			&LastAttemptAt,
			&n.CreatedAt,
		)

		if err != nil {
			log.Printf("Error scanning notification row: %v", err)
			continue // Skip malformed rows but return others
		}

		n.DeliveredAt = deliveredAt
		n.ReadAt = readAt
		n.LastAttemptAt = LastAttemptAt

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

	c.JSON(http.StatusOK, gin.H{
		"data": notifications,
		"meta": gin.H{
			"page":  page,
			"limit": limit,
			"total": len(notifications),
		},
	})
}

func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	notificationID := c.Param("notification_id")

	/* 	// var notif models.Notification

	   	type Notification struct {
	   		Type        models.NotificationType
	   		Message     string
	   		DeliveredAt time.Time
	   		CreatedAt   time.Time
	   	}
	   	var notif Notification

	   	err := h.db.QueryRow(`
	   		SELECT type, message, created_at
	   		FROM notifications
	   		WHERE id = $1 AND user_id = $2
	   	`, notificationID, userID).Scan(&notif.Type, &notif.Message, &notif.CreatedAt)

	   	if err != nil {
	   		if err == sql.ErrNoRows {
	   			log.Printf("No notification found for user %s with ID %s", userID, notificationID)
	   			c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
	   			return
	   		}
	   		log.Printf("Database error fetching notification: %v", err)
	   		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve notification"})
	   		return
	   	} */

	result, err := h.db.Exec(`
		UPDATE notifications
		SET read_at = NOW()
		WHERE id = $1 AND user_id = $2
	`, notificationID, userID)

	if err != nil {
		log.Printf("Database error marking notification as read: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update notification"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		log.Printf("No notification found for user %s with ID %s", userID, notificationID)
		c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notification marked as read"})
}

func (h *NotificationHandler) GetNotificationDetails(c *gin.Context) {
	userID := c.GetString("user_id")
	notificationID := c.Param("notification_id")

	var n models.Notification
	err := h.db.QueryRow(`
		SELECT id, user_id, type, message, delivered_at, read_at, created_at
		FROM notifications
		WHERE id = $1 AND user_id = $2
	`, notificationID, userID).Scan(
		&n.ID,
		&n.UserID,
		&n.Type,
		&n.Message,
		&n.DeliveredAt,
		&n.ReadAt,
		&n.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("No notification found for user %s with ID %s", userID, notificationID)
			c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
			return
		}
		log.Printf("Database error fetching notification details: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	c.JSON(http.StatusOK, n)
}

// activate broadcast channel
func (h *NotificationHandler) StartBroadcasting() {
	for notification := range h.broadcast {
		h.Mutex.RLock()
		client, exists := h.Clients[notification.UserID]
		h.Mutex.RUnlock()

		if exists {
			select {
			case client.Send <- notification:
			default:
				close(client.Send)
				h.Mutex.Lock()
				delete(h.Clients, notification.UserID)
				h.Mutex.Unlock()
				log.Printf("[ERROR] Notification channel full for user %s, removing client", notification.UserID)
			}
		}
	}
}
