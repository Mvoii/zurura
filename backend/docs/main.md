# API DOCS
## Base URL
    http://localhost:8080/a/v1

## Authentication
All protected endpoints require a JWT token in the Authorization header:
    Authorization: Bearer <token>



## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword",
    "first_name": "John",
    "last_name": "Doe",
    "school_name": "Example School"
}
```

**Response (201 Created)**
```json
{
    "token": "jwt_token",
    "user": {
        "id": "uuid",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "school_name": "Example School"
    }
}
```

#### Register Operator
```http
POST /auth/register/op
Content-Type: application/json

{
    "email": "operator@example.com",
    "password": "securepassword",
    "first_name": "Jane",
    "last_name": "Smith",
    "company": "Bus Company Ltd"
}
```

**Response (201 Created)**
```json
{
    "token": "jwt_token",
    "user": {
        "id": "uuid",
        "email": "operator@example.com",
        "first_name": "Jane",
        "last_name": "Smith",
        "role": "operator"
    }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword"
}
```

**Response (200 OK)**
```json
{
    "token": "jwt_token",
    "user": {
        "id": "uuid",
        "email": "user@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "user"
    }
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
    "message": "Successfully logged out"
}
```

### Bookings

#### Create Booking
```http
POST /bookings
Authorization: Bearer <token>
Content-Type: application/json

{
    "bus_id": "bus_uuid",
    "seat_numbers": ["A1", "A2"],
    "payment_method": "bus_pass"
}
```

**Response (201 Created)**
```json
{
    "id": "booking_uuid",
    "user_id": "user_uuid",
    "bus_id": "bus_uuid",
    "seats": {
        "seat_numbers": ["A1", "A2"],
        "count": 2
    },
    "fare": 100.00,
    "status": "pending",
    "expires_at": "2024-03-20T15:30:00Z"
}
```

#### Cancel Booking
```http
POST /bookings/:id/cancel
Authorization: Bearer <token>
```

**Response (200 OK)**
```json
{
    "message": "Booking cancelled successfully"
}
```

### Routes

#### Get Route Details
```http
GET /routes/:route_id
```

**Response (200 OK)**
```json
{
    "route": {
        "id": "route_uuid",
        "route_name": "CBD to Westlands",
        "description": "Main commuter route",
        "created_at": "2024-03-20T10:00:00Z",
        "updated_at": "2024-03-20T10:00:00Z"
    },
    "stops": [
        {
            "id": "stop_uuid",
            "name": "City Square",
            "landmark_description": "Next to post office",
            "latitude": -1.2921,
            "longitude": 36.8219,
            "stop_order": 1,
            "timetable": ["07:00", "12:00", "18:00"],
            "travel_time": 15
        }
    ]
}
```

#### Find Nearby Stops
```http
GET /stops/nearby?lat=-1.2921&lng=36.8219&radius=1000
```

**Response (200 OK)**
```json
[
    {
        "id": "stop_uuid",
        "name": "City Square",
        "landmark_description": "Next to post office",
        "latitude": -1.2921,
        "longitude": 36.8219,
        "distance": 150.5
    }
]
```

## Error Responses

### 400 Bad Request
```json
{
    "error": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
    "error": "Invalid or missing token"
}
```

### 403 Forbidden
```json
{
    "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
    "error": "Resource not found"
}
```

### 409 Conflict
```json
{
    "error": "Resource already exists"
}
```

### 422 Unprocessable Entity
```json
{
    "error": "Validation failed",
    "details": {
        "field": "error message"
    }
}
```

### 500 Internal Server Error
```json
{
    "error": "Internal server error"
}
```

