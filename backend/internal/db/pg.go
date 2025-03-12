// internal/db/pg.go
package db

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

func NewPostgresDB() (*sql.DB, error) {
	conn_str := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	//conn_str := fmt.Sprint("uri=%s", os.Getenv("DB_URI"))
	db, err := sql.Open("postgres", conn_str)
	if err != nil {
		return nil, fmt.Errorf("[ERROR] error opening db: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("[ERROR] error connecting to db: %w", err)
	}

	return db, nil
}
