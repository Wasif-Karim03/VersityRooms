# API Documentation

## Overview

This document provides comprehensive API documentation for the University Room Booking System. All endpoints follow RESTful conventions and return consistent JSON responses.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication

Most endpoints require authentication via NextAuth.js session cookies. Admin-only endpoints require the `ADMIN` role.

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "fields": {
    "fieldName": "Field-specific error message"
  },
  "statusCode": 400
}
```

**Note**: The `fields` object is only present for validation errors, providing field-level error messages.

## Rate Limiting

Some endpoints are rate-limited. Rate limit headers are included in responses:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Timestamp when limit resets
- `Retry-After`: Seconds to wait before retrying (on 429)

---

## Public Endpoints

### GET /api/rooms

Get list of available rooms with optional filters.

**Query Parameters:**
- `capacity` (optional): Minimum room capacity (integer)
- `building` (optional): Building name filter (string)
- `equipment` (optional): Equipment name filter (string)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "string",
        "name": "string",
        "building": "string",
        "capacity": 50,
        "equipment": ["projector", "whiteboard"],
        "images": ["image1.jpg"],
        "isActive": true,
        "isLocked": false,
        "restrictedRoles": null
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

### GET /api/rooms/:id

Get details of a specific room.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "building": "string",
    "capacity": 50,
    "equipment": ["projector"],
    "images": ["image1.jpg"],
    "isActive": true,
    "isLocked": false,
    "restrictedRoles": null,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### GET /api/rooms/:id/availability

Get time slots and bookings for a specific room on a specific date.

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
        "start": "2024-01-15T09:00:00Z",
        "end": "2024-01-15T09:30:00Z",
        "isAvailable": true,
        "bookingId": null,
        "purpose": null
      }
    ],
    "bookings": [
      {
        "id": "string",
        "startAt": "2024-01-15T10:00:00Z",
        "endAt": "2024-01-15T12:00:00Z",
        "purpose": "Team meeting",
        "user": {
          "id": "string",
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ]
  }
}
```

---

### GET /api/buildings

Get list of all buildings with room counts.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "name": "Science Building",
      "roomCount": 25
    },
    {
      "name": "Arts Building",
      "roomCount": 15
    }
  ]
}
```

---

## User Endpoints (Authentication Required)

### GET /api/bookings

Get bookings with optional filters.

**Query Parameters:**
- `roomId` (optional): Filter by room ID
- `from` (optional): Start date filter (ISO datetime)
- `to` (optional): End date filter (ISO datetime)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "string",
        "roomId": "string",
        "userId": "string",
        "startAt": "2024-01-15T10:00:00Z",
        "endAt": "2024-01-15T12:00:00Z",
        "purpose": "Team meeting",
        "isOverride": false,
        "room": { ... },
        "user": { ... },
        "request": { ... }
      }
    ],
    "pagination": { ... }
  }
}
```

---

### POST /api/requests

Create a new booking request.

**Rate Limit:** 20 requests per minute

**Request Body:**
```json
{
  "roomId": "string",
  "startAt": "2024-01-15T10:00:00Z",
  "endAt": "2024-01-15T12:00:00Z",
  "purpose": "Team meeting"
}
```

**Response:** 201 Created
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
    "room": { ... },
    "user": { ... }
  }
}
```

**Validation Errors Example:**
```json
{
  "success": false,
  "error": "Validation failed",
  "fields": {
    "startAt": "Start time must be in the future",
    "endAt": "End time must be after start time",
    "purpose": "Purpose is required"
  },
  "statusCode": 400
}
```

---

### GET /api/requests

Get booking requests with filters.

**Query Parameters:**
- `mine` (optional): If true, returns only current user's requests
- `status` (optional): Filter by status (PENDING, APPROVED, REJECTED, CANCELLED)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Note**: Filtering by `status=PENDING` with `mine=false` requires ADMIN role.

---

### POST /api/requests/:id/cancel

Cancel a pending booking request.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "status": "CANCELLED",
    ...
  }
}
```

---

### GET /api/notifications

Get current user's notifications.

**Query Parameters:**
- `unread` (optional): If "true", returns only unread notifications
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "string",
        "type": "REQUEST_APPROVED",
        "title": "Booking Approved",
        "message": "Your booking request has been approved",
        "read": false,
        "createdAt": "2024-01-15T10:00:00Z",
        "metadata": { ... }
      }
    ],
    "pagination": { ... },
    "unreadCount": 5
  }
}
```

---

### POST /api/notifications/:id/read

Mark a notification as read.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "read": true,
    ...
  }
}
```

---

### POST /api/notifications/read-all

Mark all notifications as read.

**Response:**
```json
{
  "success": true
}
```

---

## Admin Endpoints (Admin Role Required)

### GET /api/admin/rooms

Get all rooms (admin view, includes inactive rooms).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

---

### POST /api/admin/rooms

Create a new room.

**Rate Limit:** 10 requests per minute

**Request Body:**
```json
{
  "name": "Room 101",
  "building": "Science Building",
  "capacity": 50,
  "equipment": ["projector", "whiteboard"],
  "images": ["image1.jpg"],
  "isActive": true,
  "isLocked": false,
  "restrictedRoles": ["STUDENT", "FACULTY"] // or null
}
```

---

### PUT /api/admin/rooms/:id

Update a room.

**Rate Limit:** 10 requests per minute

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Room Name",
  "capacity": 60,
  "isActive": false
}
```

---

### DELETE /api/admin/rooms/:id

Deactivate a room (soft delete).

**Rate Limit:** 10 requests per minute

---

### GET /api/admin/users

Get all users.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

---

### PATCH /api/requests/:id

Approve or reject a booking request (admin only).

**Rate Limit:** 10 requests per minute

**Request Body:**
```json
{
  "status": "APPROVED", // or "REJECTED"
  "reason": "Approved after review",
  "startAt": "2024-01-15T10:00:00Z", // Optional - to modify times
  "endAt": "2024-01-15T12:00:00Z"    // Optional - to modify times
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request": { ... },
    "booking": { ... } // Only present if status is "APPROVED"
  }
}
```

---

### POST /api/bookings/override

Create an override booking (bypasses conflict checks, admin only).

**Rate Limit:** 10 requests per minute

**Request Body:**
```json
{
  "roomId": "string",
  "userId": "string",
  "startAt": "2024-01-15T10:00:00Z",
  "endAt": "2024-01-15T12:00:00Z",
  "purpose": "Emergency meeting",
  "reason": "Override reason"
}
```

---

### GET /api/admin/reports/utilization

Get room utilization metrics.

**Rate Limit:** 10 requests per minute

**Query Parameters:**
- `weeks` (optional): Number of weeks to analyze (default: 4, max: 52)
- `startDate` (optional): Start date (ISO datetime)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "roomId": "string",
      "roomName": "Room 101",
      "building": "Science Building",
      "totalHours": 120.5,
      "avgHoursPerWeek": 30.1,
      "weeklyBreakdown": [
        {
          "week": "2024-W01",
          "hours": 25.5
        }
      ]
    }
  ]
}
```

---

### GET /api/admin/reports/peak-hours

Get peak booking hours analysis.

**Rate Limit:** 10 requests per minute

**Query Parameters:**
- `weeks` (optional): Number of weeks to analyze (default: 4, max: 52)
- `startDate` (optional): Start date (ISO datetime)

**Response:**
```json
{
  "success": true,
  "data": {
    "peakHours": [
      {
        "hour": 10,
        "hourLabel": "10 AM",
        "count": 45
      }
    ],
    "peakHour": 10,
    "maxCount": 45
  }
}
```

---

### GET /api/admin/reports/bookings-by-role

Get bookings breakdown by user role.

**Rate Limit:** 10 requests per minute

**Query Parameters:**
- `weeks` (optional): Number of weeks to analyze (default: 4, max: 52)
- `startDate` (optional): Start date (ISO datetime)

**Response:**
```json
{
  "success": true,
  "data": {
    "byRole": [
      {
        "role": "STUDENT",
        "count": 100,
        "hours": 250.5,
        "percentage": 50.0
      }
    ],
    "total": {
      "count": 200,
      "hours": 500.0
    }
  }
}
```

---

### GET /api/admin/reports/export

Export bookings to CSV.

**Rate Limit:** 10 requests per minute

**Query Parameters:**
- `startDate` (optional): Start date (ISO datetime, default: 30 days ago)
- `endDate` (optional): End date (ISO datetime, default: now)

**Response:** CSV file download

---

### GET /api/admin/audit

Get audit logs.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 100, max: 100)

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (authentication required) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (e.g., booking conflict) |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |

---

## Notes

- All datetime values are in ISO 8601 format
- All IDs are CUID format strings
- Pagination is available on all list endpoints
- Rate limiting applies to write operations and reports
- Field-level validation errors are returned for better UX
- All string inputs are sanitized before storage

