# Database Schema Summary

## Models Overview

### 1. User
Stores university members (students, faculty, admins).

**Fields**:
- `id` (CUID, primary key)
- `name` (String)
- `email` (String, unique)
- `role` (UserRole enum: STUDENT, FACULTY, ADMIN)
- `department` (String, optional)
- `createdAt` (DateTime)

**Relations**:
- `bookingRequests` → BookingRequest[]
- `bookings` → Booking[]
- `auditLogs` → AuditLog[]

### 2. Room
Stores bookable rooms with equipment and restrictions.

**Fields**:
- `id` (CUID, primary key)
- `name` (String)
- `building` (String)
- `capacity` (Int)
- `equipment` (JSON array: `["projector", "whiteboard"]`)
- `images` (JSON array: `["url1", "url2"]`)
- `isActive` (Boolean, default: true)
- `isLocked` (Boolean, default: false)
- `restrictedRoles` (JSON array or null: `["FACULTY"]` or null for all)
- `createdAt` (DateTime)

**Relations**:
- `bookingRequests` → BookingRequest[]
- `bookings` → Booking[]

### 3. BookingRequest
Stores room reservation requests that need approval.

**Fields**:
- `id` (CUID, primary key)
- `roomId` (String, foreign key)
- `userId` (String, foreign key)
- `startAt` (DateTime)
- `endAt` (DateTime)
- `purpose` (String)
- `status` (BookingStatus enum: PENDING, APPROVED, REJECTED, CANCELLED)
- `createdAt` (DateTime)
- `updatedAt` (DateTime, auto-updated)

**Relations**:
- `user` → User
- `room` → Room
- `booking` → Booking? (if approved)

**Indexes**:
- `status` - For filtering by status
- `userId` - For user's requests
- `roomId, startAt, endAt` - For availability queries

### 4. Booking
Stores confirmed room reservations.

**Fields**:
- `id` (CUID, primary key)
- `roomId` (String, foreign key)
- `userId` (String, foreign key)
- `startAt` (DateTime)
- `endAt` (DateTime)
- `purpose` (String)
- `isOverride` (Boolean, default: false) - Admin override for conflicts
- `createdFromRequestId` (String, optional, foreign key) - Links to BookingRequest
- `createdAt` (DateTime)

**Relations**:
- `user` → User
- `room` → Room
- `request` → BookingRequest? (if created from request)

**Indexes**:
- `roomId, startAt, endAt` - For availability queries
- `userId` - For user's bookings
- `startAt, endAt` - For time range queries

### 5. AuditLog
Tracks all system actions for compliance and debugging.

**Fields**:
- `id` (CUID, primary key)
- `actorUserId` (String, foreign key) - Who performed the action
- `actionType` (String) - e.g., "BOOKING_CREATED", "ROOM_LOCKED"
- `targetType` (String) - e.g., "BookingRequest", "Room", "User"
- `targetId` (String, optional) - ID of the target entity
- `reason` (String, optional) - Reason/note for the action
- `createdAt` (DateTime)

**Relations**:
- `actor` → User

**Indexes**:
- `actorUserId` - For user's actions
- `targetType, targetId` - For finding logs by target
- `createdAt` - For time-based queries

## Enums

### UserRole
- `STUDENT`
- `FACULTY`
- `ADMIN`

### BookingStatus
- `PENDING`
- `APPROVED`
- `REJECTED`
- `CANCELLED`

## Key Design Decisions

1. **Separate BookingRequest and Booking**: 
   - BookingRequest is for pending requests
   - Booking is for confirmed reservations
   - Allows tracking approval workflow

2. **JSON Fields for Flexibility**:
   - `equipment` and `images` as JSON arrays
   - `restrictedRoles` as JSON array or null
   - Easy to extend without schema changes

3. **Audit Logging**:
   - Comprehensive audit trail
   - Tracks who did what, when, and why
   - Essential for compliance

4. **Indexes for Performance**:
   - Room availability queries (roomId + time range)
   - Status filtering (BookingRequest.status)
   - User queries (userId)

5. **Soft Deletes**:
   - Using status enums instead of hard deletes
   - Preserves data for audit purposes

## Usage Examples

### Create a Booking Request

```typescript
const request = await prisma.bookingRequest.create({
  data: {
    roomId: "room-id",
    userId: "user-id",
    startAt: new Date("2024-01-15T10:00:00Z"),
    endAt: new Date("2024-01-15T12:00:00Z"),
    purpose: "Team meeting",
    status: "PENDING",
  },
})
```

### Approve a Booking Request

```typescript
// Update request status
await prisma.bookingRequest.update({
  where: { id: requestId },
  data: { status: "APPROVED" },
})

// Create corresponding booking
const booking = await prisma.booking.create({
  data: {
    roomId: request.roomId,
    userId: request.userId,
    startAt: request.startAt,
    endAt: request.endAt,
    purpose: request.purpose,
    createdFromRequestId: request.id,
  },
})
```

### Check Room Availability

```typescript
const conflicts = await prisma.booking.findMany({
  where: {
    roomId: "room-id",
    OR: [
      {
        AND: [
          { startAt: { lte: newStartAt } },
          { endAt: { gt: newStartAt } },
        ],
      },
      {
        AND: [
          { startAt: { lt: newEndAt } },
          { endAt: { gte: newEndAt } },
        ],
      },
      {
        AND: [
          { startAt: { gte: newStartAt } },
          { endAt: { lte: newEndAt } },
        ],
      },
    ],
  },
})

const isAvailable = conflicts.length === 0
```

### Log an Action

```typescript
await prisma.auditLog.create({
  data: {
    actorUserId: "admin-id",
    actionType: "BOOKING_APPROVED",
    targetType: "BookingRequest",
    targetId: requestId,
    reason: "Approved by admin review",
  },
})
```

## Migration Commands

```bash
# Generate Prisma Client
npm run db:generate

# Create and apply migration
npm run db:migrate

# Push schema (development only)
npm run db:push

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

