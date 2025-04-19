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

echo "Updating payments table constraints..."

# Execute the SQL migration
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f ./internal/db/migrations/update_payments_constraints.sql

if [ $? -eq 0 ]; then
    echo "Payments table constraints updated successfully!"
else
    echo "Failed to update payments table constraints."
    exit 1
fi 