// backend/internal/services/tracking/tracking.go
package tracking

import (
	"database/sql"
	"errors"
	"log"
	"sync"
	"time"
)

// location represents a bus location with coordinates and metadata
type Location struct {
	BusID     string    `json:"bus_id"`
	Latitude  float64   `json:"latitude"`
	Longitude float64   `json:"longitude"`
	Speed     float64   `json:"speed"`
	Heading   float64   `json:"heading"`
	Timestamp time.Time `json:"timestamp"`
}

type Service struct {
	db        *sql.DB
	locations map[string]Location
	mu        sync.RWMutex
}

// creates new tracking service
func NewTrackingService(db *sql.DB) *Service {
	service := &Service{
		db:        db,
		locations: make(map[string]Location),
	}

	// clean up stale locations
	go service.cleanStaleLocations()

	return service
}

func (s *Service) UpdateBusLocation(loc Location) error {
	if loc.BusID == "" {
		return errors.New("bus ID required")
	}

	if loc.Timestamp.IsZero() {
		loc.Timestamp = time.Now()
	}

	// store in mem cache
	s.mu.Lock()
	s.locations[loc.BusID] = loc
	s.mu.Unlock()

	// persit to db
	query := `
		INSERT INTO bus_locations (bus_id, latitude, longitude, speed, heading, timestamp, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
	`

	_, err := s.db.Exec(query, loc.BusID, loc.Latitude, loc.Longitude, loc.Speed, loc.Heading, loc.Timestamp)
	if err != nil {
		log.Printf("Error savin bus location: %v", err)
		return err
	}

	return nil
}

func (s *Service) GetBusLocation(busID string) (Location, error) {
	// first look in mem cache
	s.mu.RLock()
	loc, exists := s.locations[busID]
	s.mu.RUnlock()

	if exists {
		if time.Since(loc.Timestamp) < time.Minute*2 {
			return loc, nil
		}
	}

	query := `
		SELECT bus_id, latitude, longitude, speed, heading, timestamp
		FROM bus_locations
		WHERE bus_id = $1
		ORDER BY timestamp DESC
		LIMIT 1
	`

	var dbLoc Location
	err := s.db.QueryRow(query, busID).Scan(
		&dbLoc.BusID, &dbLoc.Latitude, &dbLoc.Longitude, &dbLoc.Speed, &dbLoc.Heading, &dbLoc.Timestamp,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return Location{}, errors.New("no location found for bus")
		}
		return Location{}, err
	}

	// update cache
	s.mu.Lock()
	s.locations[busID] = dbLoc
	s.mu.Unlock()

	return dbLoc, nil
}

func (s *Service) GetNearbyBuses(lat, lng float64, radiusKM float64) ([]Location, error) {
	// using haversine formula to calculate distances
	// in prod use POSTGIS
	query := `
		SELECT
			b.id,
			bl.latitude,
			bl.longitude,
			bl.speed,
			bl.heading,
			bl.timestamp
		FROM buses b
		JOIN (
			SELECT DISTINCT ON (bus_id)
				bus_id, latitude, longitude, speed, heading, timestamp
			FROM bus_locations
			WHERE timestamp > NOW() - INTERVAL '10 minutes'
			ORDER BY bus_id, timestamp DESC
		) bl on b.id = bl.bus_id
		WHERE
			-- simplified distance calculation
			-- in prod use proper gis functions
			(bl.latitude BETWEEN $1 - ($3 / 111.0) AND $1 + ($3/ 111.0)) AND
			(bl.longitude BETWEEN $2 - ($3 / (111.0 * COS(RADIANS($1)))) AND $2 + ($3 / (111.0 * COS(RADIANS($1)))))
	`

	rows, err := s.db.Query(query, lat, lng, radiusKM)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var buses []Location
	for rows.Next() {
		var loc Location
		if err := rows.Scan(&loc.BusID, &loc.Latitude, &loc.Longitude, &loc.Speed, &loc.Heading, &loc.Timestamp); err != nil {
			return nil, err
		}

		buses = append(buses, loc)
	}

	return buses, nil
}

// perdically clean up stale locations
func (s *Service) cleanStaleLocations() {
	ticker := time.NewTicker(10 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		s.mu.Lock()
		for id, loc := range s.locations {
			if time.Since(loc.Timestamp) > time.Hour {
				delete(s.locations, id)
			}
		}
		s.mu.Unlock()
	}
}

// validate location coordinates
func (s *Service) validateLocation(loc Location) error {
	if loc.Latitude < -90 || loc.Latitude > 90 {
		return errors.New("Invalid latitude")
	}
	if loc.Longitude < -180 || loc.Longitude > 180 {
		return errors.New("Invalid longitude")
	}
	return nil
}
