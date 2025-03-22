#!/bin/bash

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-zurura}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}

echo "Applying database migrations..."

# Apply first migration: Add updated_at to bookings
echo "1. Adding updated_at column to bookings table..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./internal/db/migrations/add_updated_at_to_bookings.sql

if [ $? -ne 0 ]; then
    echo "Migration 1 failed."
    exit 1
fi

# Apply second migration: Add booking_id to payments
echo "2. Adding booking_id column to payments table..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./internal/db/migrations/add_booking_id_to_payments.sql

if [ $? -ne 0 ]; then
    echo "Migration 2 failed."
    exit 1
fi

echo "All migrations completed successfully!" 