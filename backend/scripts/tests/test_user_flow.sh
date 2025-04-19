#!/bin/bash

# backend/scripts/tests/test_user_flow.sh

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:8080/a/v1"

# Helper function for error handling
handle_error() {
    local response=$1
    if [ -z "$response" ]; then
        echo -e "${RED}Empty response received${NC}"
        return 1
    fi
    
    # Try to parse as JSON first
    if echo "$response" | jq -e . >/dev/null 2>&1; then
        local error_msg=$(echo $response | jq -r '.error // empty')
        if [ ! -z "$error_msg" ]; then
            echo -e "${RED}Error: $error_msg${NC}"
            return 1
        fi
    else
        echo -e "${RED}Invalid JSON response: $response${NC}"
        return 1
    fi
    return 0
}

# Print response for debugging
debug_response() {
    local response=$1
    echo -e "${YELLOW}Response received:${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
}

echo -e "${YELLOW}Starting User Flow Tests...${NC}"

# 1. User Registration
echo -e "\n${YELLOW}Testing User Registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "testuser@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User",
        "school_name": "test_01 University"
    }')

debug_response "$REGISTER_RESPONSE"
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token // empty')
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.user.id // empty')

if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}Registration failed, trying login...${NC}"
    
    # 2. User Login
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "testuser@example.com",
            "password": "testpass123"
        }')
    
    debug_response "$LOGIN_RESPONSE"
    TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')
    USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.user.id // empty')
fi

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Authentication failed${NC}"
    exit 1
fi

echo -e "${GREEN}Authentication successful${NC}"

# 3. Search Available Routes
ROUTE_ID="d58ecf33-bfa6-418c-9990-947844823b65"
echo -e "\n${YELLOW}Testing Route Search...${NC}"
ROUTES_RESPONSE=$(curl -s -X GET "$BASE_URL/routes/$ROUTE_ID" \
    -H "Authorization: Bearer $TOKEN")

debug_response "$ROUTES_RESPONSE"
if handle_error "$ROUTES_RESPONSE"; then
    ROUTE_ID=$(echo $ROUTES_RESPONSE | jq -r '.route.id // empty')
    if [ -z "$ROUTE_ID" ]; then
        echo -e "${YELLOW}No routes found, skipping route-dependent tests${NC}"
        exit 0
    fi
fi

# 4. Create Booking
BUS_ID="e9f4e072-34cb-4447-8fe6-6834b13ed036"
echo -e "\n${YELLOW}Testing Booking Creation...${NC}"
BOOKING_RESPONSE=$(curl -s -X POST "$BASE_URL/bookings" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "bus_id": "e9f4e072-34cb-4447-8fe6-6834b13ed036",
        "seats": {
                "seat_numbers": ["A1", "A2"],
                "count": 2
            },
        "payment_method": "mpesa"
    }')

debug_response "$BOOKING_RESPONSE"
if handle_error "$BOOKING_RESPONSE"; then
    BOOKING_ID=$(echo $BOOKING_RESPONSE | jq -r '.id // empty')
fi

# 5. Cancel Booking (only if we have a booking_id)
if [ ! -z "$BOOKING_ID" ]; then
    echo -e "\n${YELLOW}Testing Booking Cancellation...${NC}"
    CANCEL_RESPONSE=$(curl -s -X POST "$BASE_URL/bookings/$BOOKING_ID/cancel" \
        -H "Authorization: Bearer $TOKEN")

    debug_response "$CANCEL_RESPONSE"
    handle_error "$CANCEL_RESPONSE"
fi

# 6. Logout
echo -e "\n${YELLOW}Testing Logout...${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
    -H "Authorization: Bearer $TOKEN")

debug_response "$LOGOUT_RESPONSE"
handle_error "$LOGOUT_RESPONSE"

echo -e "\n${GREEN}All tests completed!${NC}"

# Print test summary
echo -e "\n${YELLOW}Test Summary:${NC}"
echo "User ID: $USER_ID"
echo "Route ID: $ROUTE_ID"
echo "Booking ID: $BOOKING_ID"
