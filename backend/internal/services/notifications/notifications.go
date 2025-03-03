// backend/internal/services/notifications/notifications.go
package notifications

import (
	"database/sql"
	"log"
	"time"
)

type Service struct {
	db       *sql.DB
	pushChan chan Notification
}

type Notification struct {
	UserID  string
	Type    string
	Message string
	Time    time.Time
}

func NewService(db *sql.DB) *Service {
	s := &Service{
		db:       db,
		pushChan: make(chan Notification, 100),
	}
	go s.processNotifications()
	return s
}

func (s *Service) ScheduleNotification(userID, notifType, message string, triggerTime time.Time) error {
	_, err := s.db.Exec(`
        INSERT INTO notifications 
        (user_id, type, message, scheduled_at)
        VALUES ($1, $2, $3, $4)`,
		userID, notifType, message, triggerTime)
	return err
}

func (s *Service) processNotifications() {
	for {
		select {
		case notif := <-s.pushChan:

			// TODO: --
			// Implement actual push notification logic
			// Integrate with FCM/APNs
			log.Printf("Sending notification to %s: %s", notif.UserID, notif.Message)
		}
	}
}
