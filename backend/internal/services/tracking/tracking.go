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
	Direction float64   `json:"direction"`
	Timestamp time.Time `json:"timestamp"`
}

type Service struct {
	db        *sql.DB
	locations map[string]Location // in mem cache
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
	if err := s.validateLocation(loc); err != nil {
		return err
	}

	loc.Timestamp = time.Now()

	// store in mem cache
	s.mu.Lock()
	s.locations[loc.BusID] = loc
	s.mu.Unlock()

	// persit to db
	query := `
		INSERT INTO bus_locations (bus_id, latitude, longitude, speed, direction, timestamp)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err := s.db.Exec(query, loc.BusID, loc.Latitude, loc.Longitude, loc.Speed, loc.Direction, loc.Timestamp)
	if err != nil {
		log.Printf("Error saving bus location: %v", err)
		return err
	}

	return nil
}

func (s *Service) GetLiveLocation(busID string) (Location, error) {
	// first look in mem cache
	s.mu.RLock()
	cachedLoc, exists := s.locations[busID]
	s.mu.RUnlock()

	if exists {
		if time.Since(cachedLoc.Timestamp) < time.Minute*2 {
			return cachedLoc, nil
		}
	}

	query := `
		SELECT bus_id, latitude, longitude, speed, direction, timestamp
		FROM bus_locations
		WHERE bus_id = $1
		ORDER BY timestamp DESC
		LIMIT 1
	`

	var dbLoc Location
	err := s.db.QueryRow(query, busID).Scan(
		&dbLoc.BusID, &dbLoc.Latitude, &dbLoc.Longitude, &dbLoc.Speed, &dbLoc.Direction, &dbLoc.Timestamp,
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
	/* query := `
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
	` */
	query := `
		SELECT bus_id, latitude, longitude, speed, direction, timestamp
		FROM bus_locations
		WHERE ST_DWithin(
			geolocation,
			ST_SetSRID(ST_MakePoint($1, $2), 4326),
			$3
		)
		AND timestamp > NOW() - INTERVAL '5 minutes'
		ORDER BY timestamp DESC
	`

	rows, err := s.db.Query(query, lat, lng, radiusKM)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var buses []Location
	for rows.Next() {
		var loc Location
		if err := rows.Scan(&loc.BusID, &loc.Latitude, &loc.Longitude, &loc.Speed, &loc.Direction, &loc.Timestamp); err != nil {
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
		return errors.New("invalid latitude")
	}
	if loc.Longitude < -180 || loc.Longitude > 180 {
		return errors.New("invalid longitude")
	}
	return nil
}

// eta calculation
func (s *Service) CalculateETA(busID string, destLat, destLng float64) (time.Duration, error) {
	// Get current location
	loc, err := s.GetLiveLocation(busID)
	if err != nil {
		return 0, err
	}

	// Get distance using PostGIS
	var distanceMeters float64
	err = s.db.QueryRow(`
		SELECT ST_Distance(
			ST_SetSRID(ST_MakePoint($1, $2), 
			ST_SetSRID(ST_MakePoint($3, $4)
		)`,
		loc.Longitude, loc.Latitude, destLng, destLat,
	).Scan(&distanceMeters)

	if err != nil {
		return 0, err
	}

	// Calculate time (distance meters / (speed m/s))
	speedMps := loc.Speed * 1000 / 3600 // Convert km/h to m/s
	if speedMps <= 0 {
		return 0, errors.New("bus not moving")
	}

	seconds := distanceMeters / speedMps
	return time.Duration(seconds * float64(time.Second)), nil
}
