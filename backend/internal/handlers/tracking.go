// backend/internal/handlers/tracking.go
package handlers

import (
	"database/sql"

	"github.com/Mvoii/zurura/internal/services/tracking"
)

type TrackingHandler struct {
	db              *sql.DB
	trackingService *tracking.Service
}

func NewTrackingService(db *sql.DB) *TrackingHandler {
	return &TrackingHandler{
		db:              db,
		trackingService: tracking.NewTrackingService(db),
	}
}
