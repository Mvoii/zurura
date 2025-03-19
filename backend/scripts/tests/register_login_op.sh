#!/usr/bin/env bash
# Register Operator
curl -X POST http://localhost:8080/a/v1/auth/register/op \
  -H "Content-Type: application/json" \
  -d '{
    "email": "operator_02@test.com",
    "password": "operator123",
    "first_name": "Bus",
    "last_name": "Operator",
    "company": "Nairobi Bus Services"
}'

# Login to Get Token
RESPONSE=$(curl -X POST http://localhost:8080/a/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operator_02@test.com","password":"operator123"}')

# Save the JWT token from response
# TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im9wZXJhdG9yQHRlc3QuY29tIiwiZXhwIjoxNzQyNzU2OTI1LCJqdGkiOiI0NTcyY2QyZS1jNjYxLTRjNzUtODgzMC05MTc2NzI4MzBiNjYiLCJyb2xlIjoib3BlcmF0b3IiLCJ1c2VyX2lkIjoiYmRhZjA0ODUtNzJlNC00OWQ4LTk1YmEtYTAyMjllYmU0M2MzIn0.pI8_KG6EOLhR_n_sBMtVjm_wGpw_ouGALb2gx9DBHRQ"
TOKEN=$(echo $RESPONSE | jq -r '.token')

echo $TOKEN

# 3. Use token to create route
curl -X POST http://localhost:8080/a/v1/op/routes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"CBD to Eastlands"}'

# create dup route
echo "DUP ROUTE CREATION"
curl -X POST http://localhost:8080/a/v1/op/routes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"CBD to Westlands"}'

echo "test route stop creation"
curl -X POST http://localhost:8080/a/v1/op/routes/route_123/stops \
  -H "Content-Type: application/json" \
  -H "Authorization: $TOKEN" \
  -d '{
    "stop_id": "stop_456",
    "timetable": ["07:00", "12:00", "18:00"],
    "travel_time": 15
}'

echo "list operator routes"
curl -H "Authorization: $TOKEN" \
  http://localhost:8080/a/v1/op/routes
