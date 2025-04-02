# Zurura API Documentation

## Overview

This document provides comprehensive documentation for the Zurura application API endpoints. Zurura is a bus booking and tracking platform that allows users to book seats, track buses in real-time, and manage bus operations.

## Base URL

All API endpoints are prefixed with: `/a/v1`

## Authentication

Most endpoints require authentication using JWT tokens. The token should be included in the Authorization header:

```
Authorization: Bearer <token>
```

## Response Format

All responses are in JSON format. Successful responses typically have status codes in the 200 range, while errors have status codes in the 400 or 500 range.

Error responses follow this structure:

```json
{
  "error": "Error message description"
}
```

Successful responses vary by endpoint but generally follow this structure:

```json
{
  "key1": "value1",
  "key2": "value2",
  ...
}
```

## API Endpoints

### Authentication

#### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Description**: Authenticates a user and returns a JWT token.

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200 OK)**:

```json
{
  "token": "JWT_TOKEN_STRING",
  "user": {
    "id": "user_uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Invalid credentials

#### Register

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Description**: Registers a new user account.

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "school_name": "University Name"
}
```

**Success Response (201 Created)**:

```json
{
  "token": "JWT_TOKEN_STRING",
  "user": {
    "id": "user_uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format or email already exists
- `500 Internal Server Error`: Server error

#### Register Operator

- **URL**: `/auth/register/op`
- **Method**: `POST`
- **Auth Required**: No
- **Description**: Registers a new bus operator account.

**Request Body**:

```json
{
  "email": "operator@example.com",
  "password": "password123",
  "first_name": "Jane",
  "last_name": "Smith",
  "company": "Bus Company Name"
}
```

**Success Response (201 Created)**:

```json
{
  "token": "JWT_TOKEN_STRING",
  "user": {
    "id": "user_uuid",
    "email": "operator@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "operator"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format or email already exists
- `500 Internal Server Error`: Server error

#### Logout

- **URL**: `/auth/logout`
- **Method**: `POST`
- **Auth Required**: Yes
- **Description**: Invalidates the current JWT token.

**Success Response (200 OK)**:

```json
{
  "message": "Successfully logged out"
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated

### User Profile

#### Get Profile

- **URL**: `/me/profile`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Retrieves the authenticated user's profile information.

**Success Response (200 OK)**:

```json
{
  "id": "user_uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "profile_photo": "url_to_photo",
  "created_at": "2023-01-01T00:00:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Server error

#### Update Profile

- **URL**: `/me/profile`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Description**: Updates the authenticated user's profile information.

**Request Body**:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com"
}
```

**Success Response (200 OK)**:

```json
{
  "id": "user_uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "profile_photo": "url_to_photo",
  "created_at": "2023-01-01T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Server error

#### Upload Profile Photo

- **URL**: `/me/profile/photo`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Description**: Uploads a profile photo for the authenticated user.

**Request Body**:
- `photo`: Image file

**Success Response (200 OK)**:

```json
{
  "profile_photo": "url_to_photo"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid file format or size
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Server error

### Bookings

#### Create Booking

- **URL**: `/bookings`
- **Method**: `POST`
- **Auth Required**: Yes
- **Description**: Creates a new booking for bus seats.

**Request Body**:

```json
{
  "bus_id": "bus_uuid",
  "seats": {
    "seat_numbers": ["A1", "A2"],
    "count": 2
  },
  "payment_method": "mpesa"
}
```

**Success Response (201 Created)**:

```json
{
  "booking_id": "booking_uuid",
  "status": "pending",
  "seats": ["A1", "A2"],
  "fare": 1000.00,
  "payment_status": "pending",
  "expires_at": "2023-01-01T00:30:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format or seat validation failed
- `401 Unauthorized`: User not authenticated
- `402 Payment Required`: Payment failed
- `409 Conflict`: Seats unavailable
- `500 Internal Server Error`: Server error

#### Cancel Booking

- **URL**: `/bookings/:id/cancel`
- **Method**: `POST`
- **Auth Required**: Yes
- **Description**: Cancels an existing booking.

**Success Response (200 OK)**:

```json
{
  "message": "Booking cancelled successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Booking already cancelled or cannot cancel
- `401 Unauthorized`: User not authenticated
- `404 Not Found`: Booking not found
- `500 Internal Server Error`: Server error

#### Get User Bookings

- **URL**: `/me/bookings`
- **Method**: `GET`
- **Auth Required**: Yes
- **Description**: Retrieves all bookings for the authenticated user.

**Success Response (200 OK)**:

```json
[
  {
    "id": "booking_uuid",
    "bus_id": "bus_uuid",
    "route_id": "route_uuid",
    "route_name": "Route Name",
    "origin": "Origin City",
    "destination": "Destination City",
    "seats": ["A1", "A2"],
    "fare": 1000.00,
    "status": "confirmed",
    "created_at": "2023-01-01T00:00:00Z",
    "expires_at": "2023-01-01T00:30:00Z"
  },
  ...
]
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `500 Internal Server Error`: Server error

### Bus Tracking

#### Update Bus Location (for Drivers)

- **URL**: `/driver/tracking`
- **Method**: `POST`
- **Auth Required**: Yes (Driver role)
- **Description**: Updates the current location of a bus.

**Request Body**:

```json
{
  "latitude": 1.2345,
  "longitude": 2.3456,
  "timestamp": "2023-01-01T00:00:00Z"
}
```

**Success Response (200 OK)**:

```json
{
  "message": "Location updated"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized as driver or not assigned to bus
- `500 Internal Server Error`: Server error

#### Get Nearby Buses

- **URL**: `/tracking/nearby`
- **Method**: `GET`
- **Auth Required**: No
- **Description**: Gets buses near a specified location.

**Query Parameters**:
- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `radius`: Radius in meters (optional, default: 1000)

**Success Response (200 OK)**:

```json
[
  {
    "bus_id": "bus_uuid",
    "latitude": 1.2345,
    "longitude": 2.3456,
    "last_updated": "2023-01-01T00:00:00Z",
    "distance": 500
  },
  ...
]
```

**Error Responses**:
- `500 Internal Server Error`: Server error

#### Get Bus Location

- **URL**: `/tracking/:bus_id`
- **Method**: `GET`
- **Auth Required**: No
- **Description**: Gets the current location of a specific bus.

**Success Response (200 OK)**:

```json
{
  "bus_id": "bus_uuid",
  "latitude": 1.2345,
  "longitude": 2.3456,
  "last_updated": "2023-01-01T00:00:00Z"
}
```

**Error Responses**:
- `404 Not Found`: Bus location not found

### Routes

#### Get Route Details

- **URL**: `/routes/:route_id`
- **Method**: `GET`
- **Auth Required**: No
- **Description**: Gets detailed information about a specific route.

**Success Response (200 OK)**:

```json
{
  "id": "route_uuid",
  "route_name": "Route Name",
  "description": "Route Description",
  "origin": "Origin City",
  "destination": "Destination City",
  "stops": [
    {
      "id": "stop_uuid",
      "name": "Stop Name",
      "latitude": 1.2345,
      "longitude": 2.3456,
      "stop_order": 1,
      "timetable": ["08:00", "12:00", "16:00"],
      "travel_time": 30
    },
    ...
  ],
  "created_at": "2023-01-01T00:00:00Z"
}
```

**Error Responses**:
- `404 Not Found`: Route not found
- `500 Internal Server Error`: Server error

#### Find Routes

- **URL**: `/routes`
- **Method**: `GET`
- **Auth Required**: No
- **Description**: Searches for routes based on criteria.

**Query Parameters**:
- `origin`: Origin location name (optional)
- `destination`: Destination location name (optional)

**Success Response (200 OK)**:

```json
[
  {
    "id": "route_uuid",
    "route_name": "Route Name",
    "description": "Route Description",
    "origin": "Origin City",
    "destination": "Destination City",
    "created_at": "2023-01-01T00:00:00Z"
  },
  ...
]
```

**Error Responses**:
- `500 Internal Server Error`: Server error

### Schedules

#### List Schedules

- **URL**: `/schedules`
- **Method**: `GET`
- **Auth Required**: No
- **Description**: Lists available bus schedules.

**Query Parameters**:
- `route_id`: Route ID (optional)
- `date`: Date in YYYY-MM-DD format (optional)

**Success Response (200 OK)**:

```json
[
  {
    "id": "schedule_uuid",
    "route_id": "route_uuid",
    "bus_id": "bus_uuid",
    "day_of_week": 1,
    "departure_time": "2023-01-01T08:00:00Z",
    "scheduled_arrival": "2023-01-01T10:00:00Z",
    "route_name": "Route Name",
    "origin": "Origin City",
    "destination": "Destination City",
    "available_seats": 40
  },
  ...
]
```

**Error Responses**:
- `500 Internal Server Error`: Server error

### Bus Operator Endpoints

#### Add Bus

- **URL**: `/op/buses`
- **Method**: `POST`
- **Auth Required**: Yes (Operator role)
- **Description**: Adds a new bus to the operator's fleet.

**Request Body**:

```json
{
  "registration_number": "KAA 123A",
  "capacity": 50,
  "model": "Bus Model",
  "year": 2020
}
```

**Success Response (201 Created)**:

```json
{
  "id": "bus_uuid",
  "registration_number": "KAA 123A",
  "capacity": 50,
  "model": "Bus Model",
  "year": 2020,
  "operator_id": "operator_uuid",
  "created_at": "2023-01-01T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized as operator
- `500 Internal Server Error`: Server error

#### Update Bus

- **URL**: `/op/buses/:id`
- **Method**: `PUT`
- **Auth Required**: Yes (Operator role)
- **Description**: Updates information for an existing bus.

**Request Body**:

```json
{
  "registration_number": "KAA 123A",
  "capacity": 50,
  "model": "Updated Bus Model",
  "year": 2020
}
```

**Success Response (200 OK)**:

```json
{
  "id": "bus_uuid",
  "registration_number": "KAA 123A",
  "capacity": 50,
  "model": "Updated Bus Model",
  "year": 2020,
  "operator_id": "operator_uuid",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-02T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized as operator
- `404 Not Found`: Bus not found
- `500 Internal Server Error`: Server error

#### List Buses

- **URL**: `/op/buses`
- **Method**: `GET`
- **Auth Required**: Yes (Operator role)
- **Description**: Lists all buses for the operator.

**Success Response (200 OK)**:

```json
[
  {
    "id": "bus_uuid",
    "registration_number": "KAA 123A",
    "capacity": 50,
    "model": "Bus Model",
    "year": 2020,
    "created_at": "2023-01-01T00:00:00Z"
  },
  ...
]
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized as operator
- `500 Internal Server Error`: Server error

#### Create Route

- **URL**: `/op/routes`
- **Method**: `POST`
- **Auth Required**: Yes (Operator role)
- **Description**: Creates a new bus route.

**Request Body**:

```json
{
  "route_name": "Route Name",
  "description": "Route Description",
  "origin": "Origin City",
  "destination": "Destination City"
}
```

**Success Response (201 Created)**:

```json
{
  "id": "route_uuid",
  "route_name": "Route Name",
  "description": "Route Description",
  "origin": "Origin City",
  "destination": "Destination City",
  "created_at": "2023-01-01T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized as operator
- `500 Internal Server Error`: Server error

#### Add Stop To Route

- **URL**: `/op/:route_id/stops`
- **Method**: `POST`
- **Auth Required**: Yes (Operator role)
- **Description**: Adds a stop to an existing route.

**Request Body**:

```json
{
  "stop_id": "stop_uuid",  // Optional if creating a new stop
  "name": "Stop Name",     // Required if creating a new stop
  "latitude": 1.2345,      // Required if creating a new stop
  "longitude": 2.3456,     // Required if creating a new stop
  "timetable": ["08:00", "12:00", "16:00"],
  "travel_time": 30
}
```

**Success Response (201 Created)**:

```json
{
  "id": "route_stop_uuid",
  "route_id": "route_uuid",
  "stop_id": "stop_uuid",
  "stop_order": 1,
  "timetable": ["08:00", "12:00", "16:00"],
  "travel_time": 30
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized as operator
- `404 Not Found`: Route not found
- `500 Internal Server Error`: Server error

#### Create Schedule

- **URL**: `/op/schedules`
- **Method**: `POST`
- **Auth Required**: Yes (Operator role)
- **Description**: Creates a new bus schedule.

**Request Body**:

```json
{
  "route_id": "route_uuid",
  "bus_id": "bus_uuid",
  "day_of_week": 1,
  "departure_time": "08:00:00",
  "arrival_time": "10:00:00"
}
```

**Success Response (201 Created)**:

```json
{
  "id": "schedule_uuid",
  "route_id": "route_uuid",
  "bus_id": "bus_uuid",
  "day_of_week": 1,
  "departure_time": "2023-01-01T08:00:00Z",
  "scheduled_arrival": "2023-01-01T10:00:00Z",
  "created_at": "2023-01-01T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format or validation error
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized as operator
- `500 Internal Server Error`: Server error

#### Assign Bus To Route

- **URL**: `/op/buses/:bus_id/assign`
- **Method**: `POST`
- **Auth Required**: Yes (Operator role)
- **Description**: Assigns a bus to a route for specific dates.

**Request Body**:

```json
{
  "route_id": "route_uuid",
  "start_date": "2023-01-01",
  "end_date": "2023-01-31",
  "departure_time": "08:00:00"
}
```

**Success Response (201 Created)**:

```json
{
  "id": "assignment_uuid",
  "bus_id": "bus_uuid",
  "route_id": "route_uuid",
  "start_date": "2023-01-01",
  "end_date": "2023-01-31",
  "departure_time": "08:00:00",
  "created_at": "2023-01-01T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format or validation error
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized as operator
- `404 Not Found`: Bus not found
- `500 Internal Server Error`: Server error

#### Get Bus Assignments

- **URL**: `/op/buses/:bus_id/assignments`
- **Method**: `GET`
- **Auth Required**: Yes (Operator role)
- **Description**: Gets all route assignments for a specific bus.

**Success Response (200 OK)**:

```json
[
  {
    "id": "assignment_uuid",
    "bus_id": "bus_uuid",
    "route_id": "route_uuid",
    "route_name": "Route Name",
    "start_date": "2023-01-01",
    "end_date": "2023-01-31",
    "departure_time": "08:00:00",
    "created_at": "2023-01-01T00:00:00Z"
  },
  ...
]
```

**Error Responses**:
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized as operator
- `404 Not Found`: Bus not found
- `500 Internal Server Error`: Server error

#### Update Bus Assignment

- **URL**: `/op/buses/assignments/:assignment_id`
- **Method**: `PUT`
- **Auth Required**: Yes (Operator role)
- **Description**: Updates an existing bus route assignment.

**Request Body**:

```json
{
  "start_date": "2023-02-01",
  "end_date": "2023-02-28",
  "departure_time": "09:00:00"
}
```

**Success Response (200 OK)**:

```json
{
  "id": "assignment_uuid",
  "bus_id": "bus_uuid",
  "route_id": "route_uuid",
  "start_date": "2023-02-01",
  "end_date": "2023-02-28",
  "departure_time": "09:00:00",
  "updated_at": "2023-01-15T00:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request format or validation error
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User not authorized as operator
- `404 Not Found`: Assignment not found
- `500 Internal Server Error`: Server error

## API Design Analysis

### Strengths

1. **Role-Based Access Control**: The API implements proper role-based authentication with separate endpoints for users, operators, and drivers.

2. **Comprehensive Booking System**: The booking system handles seat selection, payment processing, and cancellation workflows.

3. **Real-Time Tracking**: The application provides real-time bus tracking capabilities for both users and operators.

4. **Logical Resource Organization**: Resources are logically organized into entities like users, buses, routes, schedules, and bookings.

### Areas for Improvement

1. **Error Handling Standardization**: Error responses vary across endpoints and could benefit from a standardized format with error codes.

2. **API Versioning**: While the API has a version prefix (v1), there's no formal versioning strategy documented.

3. **Rate Limiting**: No visible implementation of rate limiting to prevent API abuse.

4. **Documentation**: This documentation was created after the fact. Having Swagger/OpenAPI documentation integrated with the API would be beneficial.

5. **Pagination**: Many list endpoints don't appear to support pagination, which could cause performance issues with large datasets.

6. **Query Parameter Validation**: More robust validation of query parameters would improve API robustness.

7. **Transaction Management**: Some endpoints that modify multiple database records should use transactions more consistently.

8. **Response Caching**: Implementation of response caching could improve performance for frequently accessed resources.

9. **HATEOAS Links**: Adding hyperlinks to related resources would improve API discoverability and adherence to REST principles.

10. **Webhook Support**: Adding webhook capabilities for events like booking confirmations or schedule changes would enhance integration possibilities.

## Data Models

The API uses the following primary data models:

1. **User**: Represents platform users with authentication credentials
2. **Bus**: Represents physical buses in the fleet
3. **BusRoute**: Defines routes with origin, destination, and stops
4. **BusStop**: Locations where buses pick up and drop off passengers
5. **Schedule**: Defines when buses run on specific routes
6. **Booking**: Records passenger seat reservations
7. **Payment**: Tracks payment transactions for bookings
8. **BusLocation**: Stores real-time location data for buses

## Conclusion

The Zurura API provides a robust foundation for a bus booking and tracking platform. With the additions and improvements suggested above, it could become even more scalable, maintainable, and user-friendly. 