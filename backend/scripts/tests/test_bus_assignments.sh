#!/usr/bin/env bash

## backend/scripts/tests/test_bus_assignments.sh

# Enable error handling
set -e

# Function to handle errors
handle_error() {
    echo "Error: $1"
    echo "Response: $2"
    exit 1
}

echo "Registering operator..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8080/a/v1/auth/register/op \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_operator1@test.com",
    "password": "test123456",
    "first_name": "Test",
    "last_name": "Operator",
    "company": "Test Bus Company"
  }')

# Check if registration was successful and extract token
if ! TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token'); then
    handle_error "Failed to extract token from registration response" "$REGISTER_RESPONSE"
fi

if [ "$TOKEN" = "null" ]; then
    # If registration failed, try logging in instead
    echo "Registration failed (user might exist), trying login..."
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/a/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "test_operator1@test.com",
        "password": "test123456"
      }')
    
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
fi

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    handle_error "Failed to get valid token" "$LOGIN_RESPONSE"
fi

echo "Got token successfully"

# Create a route
# echo "Creating a route..."
# ROUTE_RESPONSE=$(curl -s -X POST http://localhost:8080/a/v1/op/routes \
#   -H "Authorization: Bearer $TOKEN" \
#   -H "Content-Type: application/json" \
#   -d '{
#     "route_name": "CBD to ksl Road",
#     "description": "Main commuter route"
#   }')
# 
# ROUTE_ID=$(echo "$ROUTE_RESPONSE" | jq -r '.id')
# if [ "$ROUTE_ID" = "null" ] || [ -z "$ROUTE_ID" ]; then
#     handle_error "Failed to create route" "$ROUTE_RESPONSE"
# fi
# echo "Created route with ID: $ROUTE_ID"

# Create a stop to route
# echo "test route stop creation"
# STOP_RESPONSE=$(curl -X POST http://localhost:8080/a/v1/op/$ROUTE_ID/stops \
#   -H "Content-Type: application/json" \
#   -H "Authorization: Bearer $TOKEN" \
#   -d '{
#     "stop_id":      "stop_456",
#     "timetable":    ["07:00", "12:00", "18:00"],
#     "travel_time":  15,
#     "name":         "Test Stop",
#     "latitude":    -1.2921,
#     "longitude":    36.8219
#   }'
# )
# STOP_ID=$(echo "$STOP_RESPONSE" | jq -r '.id')
# if [ "$STOP_ID" = "null" ] || [ -z "$STOP_ID" ]; then
#     handle_error "Failed to create stop" "$STOP_RESPONSE"
# fi
# echo "Created stop with ID: $STOP_ID"


# Add a bus
echo "Adding a bus..."
BUS_RESPONSE=$(curl -s -X POST http://localhost:8080/a/v1/op/buses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "registration_plate": "KAL 123O",
    "capacity": 45,
    "bus_photo_url": "https://example.com/bus1.jpg"
  }')

BUS_ID=$(echo "$BUS_RESPONSE" | jq -r '.id')
if [ "$BUS_ID" = "null" ] || [ -z "$BUS_ID" ]; then
    handle_error "Failed to create bus" "$BUS_RESPONSE"
fi
echo "Added bus with ID: $BUS_ID"

echo "listing buses"
ROUTE_ID=948672b1-a76d-416e-9d45-0c1971cf4aa9
# Assign bus to route
echo "Assigning bus to route..."
ASSIGNMENT_RESPONSE=$(curl -s -X POST http://localhost:8080/a/v1/op/buses/$BUS_ID/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bus_id": "'$BUS_ID'",
    "route_id": "'$ROUTE_ID'",
    "start_date": "2024-03-20T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z"
  }')

ASSIGNMENT_ID=$(echo "$ASSIGNMENT_RESPONSE" | jq -r '.assignment_id')
if [ "$ASSIGNMENT_ID" = "null" ] || [ -z "$ASSIGNMENT_ID" ]; then
    handle_error "Failed to create assignment" "$ASSIGNMENT_RESPONSE"
fi
echo "Created assignment with ID: $ASSIGNMENT_ID"

# Get current assignments
echo "Getting current assignments..."
ASSIGNMENTS_RESPONSE=$(curl -s -X GET http://localhost:8080/a/v1/op/buses/$BUS_ID/assignments \
  -H "Authorization: Bearer $TOKEN")
echo "Current assignments:"
echo "$ASSIGNMENTS_RESPONSE" | jq '.'

# Update the assignment
echo "Updating assignment..."
UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:8080/a/v1/op/buses/assignments/$ASSIGNMENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "route_id": "'$ROUTE_ID'",
    "start_date": "2024-04-01T00:00:00Z",
    "end_date": "2026-12-31T23:59:59Z",
    "status": "active"
  }')
echo "Update response:"
echo "$UPDATE_RESPONSE" | jq '.'

# Get updated assignments
echo "Getting updated assignments..."
FINAL_ASSIGNMENTS=$(curl -s -X GET http://localhost:8080/a/v1/op/buses/$BUS_ID/assignments \
  -H "Authorization: Bearer $TOKEN")
echo "Final assignments:"
echo "$FINAL_ASSIGNMENTS" | jq '.'

# Test error cases
echo -e "\nTesting error cases..."

# Try to assign bus during conflicting time period
echo "Testing conflicting assignment..."
CONFLICT_RESPONSE=$(curl -s -X POST http://localhost:8080/a/v1/op/buses/$BUS_ID/assign \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bus_id": "'$BUS_ID'",
    "route_id": "'$ROUTE_ID'",
    "start_date": "2024-04-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z"
  }')
echo "Conflict response:"
echo "$CONFLICT_RESPONSE" | jq '.'

# Try to update with invalid dates
echo "Testing invalid date update..."
INVALID_UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:8080/a/v1/op/buses/assignments/$ASSIGNMENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "route_id": "'$ROUTE_ID'",
    "start_date": "2024-12-31T23:59:59Z",
    "end_date": "2024-04-01T00:00:00Z",
    "status": "active"
  }')
echo "Invalid update response:"
echo "$INVALID_UPDATE_RESPONSE" | jq '.'

echo "list operator routes"
curl -H "Authorization: Bearer $TOKEN" \
  -s -X GET http://localhost:8080/a/v1/routes

echo -e "list operator buses"
curl -s -X GET http://localhost:8080/a/v1/op/buses -H "Authorization: Bearer $TOKEN" \

echo -e "\nAll tests completed!"

curl -H "Authorization: Bearer $TOKEN" \
  -s -X GET http://localhost:8080/a/v1/routes/$ROUTE_ID

