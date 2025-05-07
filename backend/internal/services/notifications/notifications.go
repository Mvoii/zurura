// internal/services/notifications.go
package services

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/Mvoii/zurura/internal/handlers"
	"github.com/Mvoii/zurura/internal/models"
)

type NotificationService struct {
	db                  *sql.DB
	smsQueue            chan SMSMessage
	emailQueue          chan EmailMessage
	notificationHandler *handlers.NotificationHandler
}

// type NotificationType = models.NotificationType
/* type NotificationType string

const (
	NotificationBusArrival     NotificationType = "bus_arrival"
	NotificationDelay          NotificationType = "delay"
	NotificationRouteDeviation NotificationType = "route_deviation"
	NotificationPassExpiration NotificationType = "pass_expiration"
	NotificationPayment        NotificationType = "payment"
	NotificationScheduleUpdate NotificationType = "schedule_update"
) */

type SMSMessage struct {
	Phone          string
	Content        string
	NotificationID string
	RetryCount     int
}

type EmailMessage struct {
	Email          string
	Subject        string
	Body           string
	NotificationID string
	RetryCount     int
}

const maxRetries = 3

// const retryDelay = 5 // in seconds

func NewNotificationService(db *sql.DB, handler *handlers.NotificationHandler) *NotificationService {
	ns := &NotificationService{
		db:                  db,
		smsQueue:            make(chan SMSMessage, 100),
		emailQueue:          make(chan EmailMessage, 100),
		notificationHandler: handler,
	}
	go ns.ProcessNotifications()
	return ns
}

func (s *NotificationService) Send(userID string, msgType models.NotificationType, message string) error {
	// Store in database
	tx, err := s.db.Begin()
	if err != nil {
		log.Printf("failed to begin transaction: %v", err)
		return fmt.Errorf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback()
	/* _, err := s.db.Exec(`
		INSERT INTO notifications
		(user_id, type, message)
		VALUES ($1, $2, $3)
	`, userID, msgType, message) */

	var notificationID string
	err = tx.QueryRow(`
		INSERT INTO notifications
		(user_id, type, message)
		VALUES ($1, $2, $3)
		RETURNING id
	`, userID, msgType, message).Scan(&notificationID)

	if err != nil {
		log.Printf("[ERROR] failed to create notification: %v", err)
		return fmt.Errorf("failed to create notification: %v", err)
	}

	// Queue for delivery
	var user struct {
		Phone string
		Email string
	}

	err = tx.QueryRow("SELECT phone, email FROM users WHERE id = $1", userID).Scan(&user.Phone, &user.Email)

	if err != nil {
		log.Printf("[ERROR] failed to get user details: %v", err)
		return fmt.Errorf("failed to get user details: %v", err)
	}

	if err := tx.Commit(); err != nil {
		log.Printf("[ERROR] failed to commit transaction: %v", err)
		return fmt.Errorf("failed to commit transaction: %v", err)
	}

	switch msgType {
	case models.NotificationBusArrival, models.NotificationDelay:
		s.smsQueue <- SMSMessage{
			Phone:          user.Phone,
			Content:        message,
			NotificationID: notificationID,
			RetryCount:     0,
		}
		s.emailQueue <- EmailMessage{
			Email:          user.Email,
			Subject:        "Bus Update",
			Body:           message,
			NotificationID: notificationID,
			RetryCount:     0,
		}
	case models.NotificationPayment:
		s.smsQueue <- SMSMessage{
			Phone:          user.Phone,
			Content:        message,
			NotificationID: notificationID,
			RetryCount:     0,
		}
		s.emailQueue <- EmailMessage{
			Email:          user.Email,
			Subject:        "Payment Update",
			Body:           message,
			NotificationID: notificationID,
			RetryCount:     0,
		}
	}

	return nil
}

func (s *NotificationService) ProcessNotifications() {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("[ERROR] Recovered from panic in Notification processing failed: %v", r)
			go s.ProcessNotifications()
		}
	}()

	for {
		select {
		case sms := <-s.smsQueue:
			// Integrate with Twilio API
			err := s.sendSMS(sms)
			s.handleDeliveryResult(sms.NotificationID, err, sms.RetryCount, sms)
			fmt.Printf("Sending SMS to %s: %s\n", sms.Phone, sms.Content)

		case email := <-s.emailQueue:
			// Integrate with SendGrid/Mailgun
			err := s.sendEmail(email)
			s.handleDeliveryResult(email.NotificationID, err, email.RetryCount, email)
			fmt.Printf("Sending Email to %s: %s\n", email.Email, email.Body)
		}
	}
}

func (s *NotificationService) handleDeliveryResult(id string, err error, retryCount int, msg interface{}) {
	updateStmt := `
	UPDATE notifications
	SET delivery_attempts = delivery_attempts + 1,
		last_attempt_at = NOW()
	WHERE id = $1
	`

	if err == nil {
		updateStmt = `
			UPDATE notifications
			SET delivered_at = NOW(),
				delivery_attempts = delivery_attempts + 1,
				last_attempt_at = NOW()
			WHERE id = $1
		`
	}

	_, updateErr := s.db.Exec(updateStmt, id)
	if updateErr != nil {
		log.Printf("[ERROR] failed to update notification status: %v", updateErr)
		// return
	}

	if err != nil && retryCount < maxRetries {
		log.Printf("Retrying delivery (attempt %d/%d) for notification ID %s", retryCount+1, maxRetries, id)
		switch v := msg.(type) {
		case SMSMessage:
			v.RetryCount++
			s.smsQueue <- v
		case EmailMessage:
			v.RetryCount++
			s.emailQueue <- v
		}
	}
}

func (s *NotificationService) sendSMS(sms SMSMessage) error {
	// Placeholder for actual SMS sending logic
	// e.g., Twilio API integration
	log.Printf("Sending SMS to %s: %s\n", sms.Phone, sms.Content)
	return nil // sim success
}

func (s *NotificationService) sendEmail(email EmailMessage) error {
	// Placeholder for actual email sending logic
	// e.g., SendGrid/Mailgun API integration
	log.Printf("Sending Email to %s: \n\t%s\n%s", email.Email, email.Subject, email.Body)
	return nil // sim success
}

func (s *NotificationService) BroadcastNotification(notification models.Notification) {
	// send to ws
	s.notificationHandler.Mutex.RLock()
	defer s.notificationHandler.Mutex.RUnlock()

	if client, ok := s.notificationHandler.Clients[notification.UserID]; ok {
		select {
		case client.Send <- notification:
		default:
			// hadnle full channel adn remove client
			close(client.Send)
			delete(s.notificationHandler.Clients, notification.UserID)
			log.Printf("[ERROR] Notification channel full for user %s, removing client", notification.UserID)
		}
	}

	// also send to trad chans (sms and email)
	s.Send(notification.UserID, notification.Type, notification.Message)
}
