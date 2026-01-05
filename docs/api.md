# API Documentation

## Overview

This document outlines the planned API endpoints for the University Room Booking System. All endpoints will be implemented as Next.js API Routes.

## Base URL

Development: `http://localhost:3000/api`
Production: `https://your-domain.com/api`

## Authentication

All protected endpoints will require authentication. Authentication strategy to be implemented (likely JWT tokens via NextAuth.js).

## Endpoints

### Rooms

#### GET /api/rooms
Get list of all available rooms.

**Query Parameters:**
- `building` (optional) - Filter by building name
- `capacity` (optional) - Minimum capacity
- `amenities` (optional) - Comma-separated list of required amenities
- `available` (optional) - Filter by availability (true/false)
- `startTime` (optional) - ISO datetime string for availability check
- `endTime` (optional) - ISO datetime string for availability check

**Response:**
```json
{
  "rooms": [
    {
      "id": "string",
      "name": "string",
      "building": "string",
      "floor": "number",
      "capacity": "number",
      "amenities": ["string"],
      "description": "string",
      "isActive": "boolean"
    }
  ]
}
```

#### GET /api/rooms/[id]
Get details of a specific room.

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "building": "string",
  "floor": "number",
  "capacity": "number",
  "amenities": ["string"],
  "description": "string",
  "isActive": "boolean",
  "bookings": []
}
```

#### POST /api/rooms (Admin only)
Create a new room.

**Request Body:**
```json
{
  "name": "string",
  "building": "string",
  "floor": "number",
  "capacity": "number",
  "amenities": ["string"],
  "description": "string"
}
```

#### PUT /api/rooms/[id] (Admin only)
Update a room.

**Request Body:**
```json
{
  "name": "string",
  "building": "string",
  "floor": "number",
  "capacity": "number",
  "amenities": ["string"],
  "description": "string",
  "isActive": "boolean"
}
```

#### DELETE /api/rooms/[id] (Admin only)
Delete (deactivate) a room.

---

### Bookings

#### GET /api/bookings
Get user's bookings (or all bookings if admin).

**Query Parameters:**
- `status` (optional) - Filter by status (PENDING, APPROVED, REJECTED, CANCELLED)
- `roomId` (optional) - Filter by room
- `startDate` (optional) - Filter bookings after this date
- `endDate` (optional) - Filter bookings before this date

**Response:**
```json
{
  "bookings": [
    {
      "id": "string",
      "userId": "string",
      "roomId": "string",
      "room": {
        "name": "string",
        "building": "string"
      },
      "startTime": "ISO datetime",
      "endTime": "ISO datetime",
      "purpose": "string",
      "status": "PENDING | APPROVED | REJECTED | CANCELLED",
      "createdAt": "ISO datetime"
    }
  ]
}
```

#### GET /api/bookings/[id]
Get details of a specific booking.

**Response:**
```json
{
  "id": "string",
  "userId": "string",
  "roomId": "string",
  "room": {},
  "user": {},
  "startTime": "ISO datetime",
  "endTime": "ISO datetime",
  "purpose": "string",
  "status": "string",
  "createdAt": "ISO datetime"
}
```

#### POST /api/bookings
Create a new booking request.

**Request Body:**
```json
{
  "roomId": "string",
  "startTime": "ISO datetime",
  "endTime": "ISO datetime",
  "purpose": "string"
}
```

**Response:**
```json
{
  "id": "string",
  "status": "PENDING",
  "message": "Booking request created successfully"
}
```

#### PUT /api/bookings/[id]/status (Admin only)
Update booking status (approve/reject).

**Request Body:**
```json
{
  "status": "APPROVED | REJECTED"
}
```

#### DELETE /api/bookings/[id]
Cancel a booking (user can cancel their own, admin can cancel any).

---

### Availability

#### GET /api/availability
Check room availability for a time range.

**Query Parameters:**
- `roomId` (required) - Room ID to check
- `startTime` (required) - ISO datetime string
- `endTime` (required) - ISO datetime string

**Response:**
```json
{
  "available": "boolean",
  "conflictingBookings": [
    {
      "id": "string",
      "startTime": "ISO datetime",
      "endTime": "ISO datetime"
    }
  ]
}
```

#### GET /api/availability/rooms
Get availability for multiple rooms in a time range.

**Query Parameters:**
- `startTime` (required) - ISO datetime string
- `endTime` (required) - ISO datetime string
- `building` (optional) - Filter by building

**Response:**
```json
{
  "rooms": [
    {
      "roomId": "string",
      "roomName": "string",
      "available": "boolean"
    }
  ]
}
```

---

### Users (Admin only)

#### GET /api/users
Get list of users.

**Query Parameters:**
- `role` (optional) - Filter by role
- `search` (optional) - Search by name or email

#### GET /api/users/[id]
Get user details.

#### PUT /api/users/[id]
Update user (role, etc.).

---

### Calendar

#### GET /api/calendar
Get calendar view data.

**Query Parameters:**
- `startDate` (required) - ISO date string
- `endDate` (required) - ISO date string
- `roomId` (optional) - Filter by room

**Response:**
```json
{
  "events": [
    {
      "id": "string",
      "roomId": "string",
      "roomName": "string",
      "title": "string",
      "start": "ISO datetime",
      "end": "ISO datetime",
      "status": "string",
      "userId": "string",
      "userName": "string"
    }
  ]
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "string",
  "message": "string",
  "statusCode": "number"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., room already booked)
- `500` - Internal Server Error

## Data Models

### User
```typescript
{
  id: string
  email: string
  name: string
  role: "STUDENT" | "STAFF" | "FACULTY" | "ADMIN"
  createdAt: Date
  updatedAt: Date
}
```

### Room
```typescript
{
  id: string
  name: string
  building: string
  floor?: number
  capacity: number
  amenities: string[]
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Booking
```typescript
{
  id: string
  userId: string
  roomId: string
  startTime: Date
  endTime: Date
  purpose: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  createdAt: Date
  updatedAt: Date
}
```

