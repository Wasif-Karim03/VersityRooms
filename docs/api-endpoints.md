# API Endpoints Documentation

## Overview

All API endpoints return a consistent response format:

```typescript
// Success
{
  success: true,
  data: T
}

// Error
{
  success: false,
  error: string,
  statusCode?: number
}
```

## Authentication

Most endpoints require authentication. Include the session cookie in requests. Admin-only endpoints require the ADMIN role.

## Rooms

### GET /api/rooms

Get list of rooms with optional filters.

**Query Parameters:**
- `capacity` (optional): Minimum capacity (integer)
- `building` (optional): Building name (partial match, case-insensitive)
- `equipment` (optional): Equipment name to filter by

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "building": "string",
      "capacity": 120,
      "equipment": ["projector", "whiteboard"],
      "images": ["url1", "url2"],
      "isActive": true,
      "isLocked": false,
      "restrictedRoles": null,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Example:**
```
GET /api/rooms?capacity=50&building=Science
```

### GET /api/rooms/:id

Get a specific room by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "building": "string",
    "capacity": 120,
    "equipment": ["projector", "whiteboard"],
    "images": ["url1", "url2"],
    "isActive": true,
    "isLocked": false,
    "restrictedRoles": null,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET /api/rooms/:id/availability?date=YYYY-MM-DD

Get time slots and existing bookings for a specific day.

**Query Parameters:**
- `date` (required): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "roomId": "string",
    "timeSlots": [
      {
        "start": "2024-01-15T08:00:00Z",
        "end": "2024-01-15T08:30:00Z",
        "isAvailable": true
      },
      {
        "start": "2024-01-15T08:30:00Z",
        "end": "2024-01-15T09:00:00Z",
        "isAvailable": false,
        "bookingId": "string",
        "purpose": "Team meeting"
      }
    ],
    "bookings": [
      {
        "id": "string",
        "startAt": "2024-01-15T08:30:00Z",
        "endAt": "2024-01-15T10:00:00Z",
        "purpose": "Team meeting",
        "user": {
          "id": "string",
          "name": "John Doe",
          "email": "john@university.edu"
        }
      }
    ]
  }
}
```

**Example:**
```
GET /api/rooms/clx123/availability?date=2024-01-15
```

## Booking Requests

### POST /api/requests

Create a new booking request (requires authentication).

**Request Body:**
```json
{
  "roomId": "string",
  "startAt": "2024-01-15T10:00:00Z",
  "endAt": "2024-01-15T12:00:00Z",
  "purpose": "Team meeting"
}
```

**Validation:**
- `roomId`: Valid CUID
- `startAt`: ISO 8601 datetime
- `endAt`: ISO 8601 datetime (must be after startAt)
- `purpose`: 1-500 characters

**Business Rules:**
- Room must exist and be active
- Room must not be locked
- User must have permission (check restrictedRoles)
- No conflicts with existing bookings

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "roomId": "string",
    "userId": "string",
    "startAt": "2024-01-15T10:00:00Z",
    "endAt": "2024-01-15T12:00:00Z",
    "purpose": "Team meeting",
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "room": { ... },
    "user": { ... }
  }
}
```

**Error Codes:**
- `400`: Invalid data
- `401`: Not authenticated
- `403`: Permission denied (role restriction)
- `404`: Room not found
- `409`: Conflict with existing booking
- `500`: Server error

### GET /api/requests

Get booking requests with optional filters (requires authentication).

**Query Parameters:**
- `mine` (optional): If true, returns only current user's requests
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED, CANCELLED)
  - If status=PENDING and mine=false, requires ADMIN role

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "roomId": "string",
      "userId": "string",
      "startAt": "2024-01-15T10:00:00Z",
      "endAt": "2024-01-15T12:00:00Z",
      "purpose": "Team meeting",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "room": { ... },
      "user": { ... }
    }
  ]
}
```

**Examples:**
```
GET /api/requests?mine=true
GET /api/requests?status=PENDING  # Admin only
```

### PATCH /api/requests/:id

Admin approve/reject/modify booking request (requires ADMIN role).

**Request Body:**
```json
{
  "status": "APPROVED",
  "reason": "Approved after review",
  "startAt": "2024-01-15T10:00:00Z",  // Optional
  "endAt": "2024-01-15T12:00:00Z"     // Optional
}
```

**Validation:**
- `status`: Must be "APPROVED" or "REJECTED"
- `reason`: Required, 1-1000 characters
- `startAt`: Optional, ISO 8601 datetime
- `endAt`: Optional, ISO 8601 datetime (must be after startAt if both provided)

**Business Rules:**
- Only pending requests can be modified
- If approving, checks for conflicts (returns 409 if conflict exists)
- If approved, creates corresponding Booking
- Creates audit log entry

**Response:**
```json
{
  "success": true,
  "data": {
    "request": { ... },
    "booking": { ... }  // Only if status=APPROVED
  }
}
```

**Error Codes:**
- `400`: Invalid data or request not pending
- `403`: Not admin
- `404`: Request not found
- `409`: Conflict with existing booking (cannot approve)
- `500`: Server error

## Bookings

### GET /api/bookings

Get bookings with optional filters.

**Query Parameters:**
- `roomId` (optional): Filter by room ID
- `from` (optional): Start of time range (ISO 8601 datetime)
- `to` (optional): End of time range (ISO 8601 datetime)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "roomId": "string",
      "userId": "string",
      "startAt": "2024-01-15T10:00:00Z",
      "endAt": "2024-01-15T12:00:00Z",
      "purpose": "Team meeting",
      "isOverride": false,
      "createdFromRequestId": "string",
      "createdAt": "2024-01-01T00:00:00Z",
      "room": { ... },
      "user": { ... },
      "request": { ... }
    }
  ]
}
```

**Examples:**
```
GET /api/bookings?roomId=clx123
GET /api/bookings?from=2024-01-15T00:00:00Z&to=2024-01-15T23:59:59Z
```

### POST /api/bookings/override

Create an override booking that bypasses conflict checks (requires ADMIN role).

**Request Body:**
```json
{
  "roomId": "string",
  "userId": "string",
  "startAt": "2024-01-15T10:00:00Z",
  "endAt": "2024-01-15T12:00:00Z",
  "purpose": "Emergency meeting",
  "reason": "Override due to urgent need"
}
```

**Validation:**
- All fields required
- `reason`: Required, 1-1000 characters
- `endAt` must be after `startAt`

**Business Rules:**
- Admin only
- Bypasses conflict checking
- Sets `isOverride: true`
- Creates audit log entry

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "roomId": "string",
    "userId": "string",
    "startAt": "2024-01-15T10:00:00Z",
    "endAt": "2024-01-15T12:00:00Z",
    "purpose": "Emergency meeting",
    "isOverride": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "room": { ... },
    "user": { ... }
  }
}
```

**Error Codes:**
- `400`: Invalid data
- `403`: Not admin
- `404`: Room or user not found
- `500`: Server error

## Business Rules

### Overlap Detection

Two bookings overlap if:
```
newStart < existingEnd AND newEnd > existingStart
```

This is checked for:
- Creating booking requests
- Approving booking requests

### Conflict Resolution

- Regular bookings: Conflicts prevent creation
- Override bookings: Admin can create despite conflicts (with reason logged)

### Audit Logging

The following actions create audit log entries:
- Approving/rejecting booking requests (with reason)
- Creating override bookings (with reason)

All audit logs include:
- Actor (who performed the action)
- Action type
- Target entity
- Reason (required for admin actions)

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

Common status codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (overlapping bookings)
- `500`: Internal Server Error

## TypeScript Types

All endpoints are fully typed. Import types from:

```typescript
import type { ApiResponse } from "@/src/lib/api/response"
```

