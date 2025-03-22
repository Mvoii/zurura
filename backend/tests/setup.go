// backend/internal/tests/setup.go
package tests

import (
	"database/sql"
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/Mvoii/zurura/internal/db"
)

var testDB *sql.DB

func TestMain(m *testing.M) {
	// Setup test database
	var err error
	testDB, err = db.NewPostgresDB()
	if err != nil {
		fmt.Printf("Failed to connect to test database: %v\n", err)
		os.Exit(1)
	}
	defer testDB.Close()

	// Clear test data
	clearTestData()

	// Insert test data
	if err := insertTestData(); err != nil {
		fmt.Printf("Failed to insert test data: %v\n", err)
		os.Exit(1)
	}

	// Run tests
	code := m.Run()

	// Cleanup
	clearTestData()

	os.Exit(code)
}

func clearTestData() {
	tables := []string{
		"bookings", "payments", "bus_passes", "schedules",
		"buses", "drivers", "bus_operators", "bus_routes",
		"bus_stops", "route_bus_stops", "users", "schools",
	}

	for _, table := range tables {
		testDB.Exec(fmt.Sprintf("DELETE FROM %s", table))
	}
}

func insertTestData() error {
	// Insert test school
	schoolID := "test-school-id"
	_, err := testDB.Exec(`
        INSERT INTO schools (id, name, location)
        VALUES ($1, $2, $3)
    `, schoolID, "Test School", "Test Location")
	if err != nil {
		return err
	}

	// Insert test user
	userID := "test-user-id"
	_, err = testDB.Exec(`
        INSERT INTO users (id, email, password_hash, first_name, last_name, school_name)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, userID, "test@example.com", "hashed_password", "Test", "User", "Test School")
	if err != nil {
		return err
	}

	// Insert test operator
	operatorID := "test-operator-id"
	_, err = testDB.Exec(`
        INSERT INTO bus_operators (id, user_id, name, contact_info)
        VALUES ($1, $2, $3, $4)
    `, operatorID, userID, "Test Bus Company", "test@buscompany.com")
	if err != nil {
		return err
	}

	// Insert test bus
	busID := "test-bus-id"
	_, err = testDB.Exec(`
        INSERT INTO buses (id, operator_id, registration_plate, capacity)
        VALUES ($1, $2, $3, $4)
    `, busID, operatorID, "TEST123", 50)
	if err != nil {
		return err
	}

	// Insert test route
	routeID := "test-route-id"
	_, err = testDB.Exec(`
        INSERT INTO bus_routes (id, route_name, description, base_fare)
        VALUES ($1, $2, $3, $4)
    `, routeID, "Test Route", "Test Route Description", 100.00)
	if err != nil {
		return err
	}

	// Insert test bus stop
	stopID := "test-stop-id"
	_, err = testDB.Exec(`
        INSERT INTO bus_stops (id, name, landmark_description, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5)
    `, stopID, "Test Stop", "Test Landmark", -1.2921, 36.8219)
	if err != nil {
		return err
	}

	// Insert test schedule
	_, err = testDB.Exec(`
        INSERT INTO schedules (id, route_id, bus_id, stop_id, schedule_departure, schedule_arrival)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, "test-schedule-id", routeID, busID, stopID, time.Now(), time.Now().Add(time.Hour))
	if err != nil {
		return err
	}

	return nil
}
