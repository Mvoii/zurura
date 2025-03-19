// internal/services/notifications.go
package services

import (
	"database/sql"
	"fmt"
)

type NotificationService struct {
	db         *sql.DB
	smsQueue   chan SMSMessage
	emailQueue chan EmailMessage
}

type SMSMessage struct {
	Phone   string
	Content string
}

type EmailMessage struct {
	Email   string
	Subject string
	Body    string
}

func NewNotificationService(db *sql.DB) *NotificationService {
	ns := &NotificationService{
		db:         db,
		smsQueue:   make(chan SMSMessage, 100),
		emailQueue: make(chan EmailMessage, 100),
	}
	go ns.processNotifications()
	return ns
}

func (s *NotificationService) Send(userID string, msgType string, message string) error {
	// Store in database
	_, err := s.db.Exec(`
		INSERT INTO notifications 
		(user_id, type, message)
		VALUES ($1, $2, $3)
	`, userID, msgType, message)

	// Queue for delivery
	var user struct {
		Phone string
		Email string
	}
	s.db.QueryRow("SELECT phone, email FROM users WHERE id = $1", userID).
		Scan(&user.Phone, &user.Email)

	switch msgType {
	case "sms":
		s.smsQueue <- SMSMessage{user.Phone, message}
	case "email":
		s.emailQueue <- EmailMessage{user.Email, "Transport Update", message}
	}

	return err
}

func (s *NotificationService) processNotifications() {
	for {
		select {
		case sms := <-s.smsQueue:
			// Integrate with Twilio API
			fmt.Printf("Sending SMS to %s: %s\n", sms.Phone, sms.Content)

		case email := <-s.emailQueue:
			// Integrate with SendGrid/Mailgun
			fmt.Printf("Sending Email to %s: %s\n", email.Email, email.Body)
		}
	}
}
