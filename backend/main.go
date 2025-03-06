package main

import (
	"context"
	"log"

	"github.com/yourusername/msafiri/internal/db"
)

func main() {
	conn, err := db.NewPostgresDB(context.Background())
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}
	defer conn.Close(context.Background())

	log.Println("Connected to database successfully")
}
