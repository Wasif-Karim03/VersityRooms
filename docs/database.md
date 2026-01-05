# Database Schema & Migrations

## Overview

The database uses PostgreSQL with Prisma ORM. The schema includes models for users, rooms, booking requests, bookings, and audit logs.

## Models

### User
- **id**: Unique identifier (CUID)
- **name**: User's full name
- **email**: Unique email address
- **role**: UserRole enum (STUDENT, FACULTY, ADMIN)
- **department**: Optional department name
- **createdAt**: Timestamp

### Room
- **id**: Unique identifier (CUID)
- **name**: Room name (e.g., "Lecture Hall A")
- **building**: Building name
- **capacity**: Maximum occupancy
- **equipment**: JSON array of equipment (e.g., `["projector", "whiteboard"]`)
- **images**: JSON array of image URLs
- **isActive**: Whether room is available for booking
- **isLocked**: Whether room is temporarily locked
- **restrictedRoles**: JSON array of roles that can book (null = all roles)
- **createdAt**: Timestamp

### BookingRequest
- **id**: Unique identifier (CUID)
- **roomId**: Foreign key to Room
- **userId**: Foreign key to User
- **startAt**: Booking start time
- **endAt**: Booking end time
- **purpose**: Reason for booking
- **status**: BookingStatus enum (PENDING, APPROVED, REJECTED, CANCELLED)
- **createdAt**: Timestamp
- **updatedAt**: Timestamp

**Indexes**:
- `status` - For filtering by status
- `userId` - For user's requests
- `roomId, startAt, endAt` - For availability queries

### Booking
- **id**: Unique identifier (CUID)
- **roomId**: Foreign key to Room
- **userId**: Foreign key to User
- **startAt**: Booking start time
- **endAt**: Booking end time
- **purpose**: Reason for booking
- **isOverride**: Admin override flag (for conflicts)
- **createdFromRequestId**: Optional link to BookingRequest
- **createdAt**: Timestamp

**Indexes**:
- `roomId, startAt, endAt` - For availability queries
- `userId` - For user's bookings
- `startAt, endAt` - For time range queries

### AuditLog
- **id**: Unique identifier (CUID)
- **actorUserId**: Foreign key to User (who performed the action)
- **actionType**: Action type (e.g., "BOOKING_CREATED", "ROOM_LOCKED")
- **targetType**: Target entity type (e.g., "BookingRequest", "Room")
- **targetId**: Optional target entity ID
- **reason**: Optional reason/note
- **createdAt**: Timestamp

**Indexes**:
- `actorUserId` - For user's actions
- `targetType, targetId` - For finding logs by target
- `createdAt` - For time-based queries

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a `.env` file with your database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/university_room_booking?schema=public"
```

### 3. Generate Prisma Client

```bash
npm run db:generate
```

### 4. Run Migrations

For development (creates migration files):

```bash
npm run db:migrate
```

For quick prototyping (pushes schema without migrations):

```bash
npm run db:push
```

### 5. Seed Database

```bash
npm run db:seed
```

This creates:
- 1 admin user
- 1 faculty user
- 1 student user
- 8 sample rooms with realistic equipment
- 1 sample booking request
- 1 audit log entry

## Seed Data

### Users

1. **Admin User**
   - Email: `admin@university.edu`
   - Role: ADMIN
   - Department: Administration

2. **Faculty User**
   - Email: `jane.smith@university.edu`
   - Role: FACULTY
   - Department: Computer Science

3. **Student User**
   - Email: `john.doe@university.edu`
   - Role: STUDENT
   - Department: Computer Science

### Rooms

1. **Lecture Hall A** - Science Building (120 capacity)
2. **Conference Room 101** - Main Building (20 capacity, FACULTY/ADMIN only)
3. **Computer Lab 1** - Technology Building (30 capacity)
4. **Study Room 201** - Library (8 capacity)
5. **Seminar Room B** - Business Building (40 capacity)
6. **Workshop Space** - Engineering Building (15 capacity, FACULTY/ADMIN only)
7. **Presentation Hall** - Arts Building (80 capacity)
8. **Quiet Study Room** - Library (4 capacity)

## Database Queries

### Check Room Availability

```typescript
const conflictingBookings = await prisma.booking.findMany({
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
```

### Get User's Booking Requests

```typescript
const requests = await prisma.bookingRequest.findMany({
  where: {
    userId: "user-id",
    status: "PENDING",
  },
  include: {
    room: true,
  },
})
```

### Get Pending Requests (Admin)

```typescript
const pendingRequests = await prisma.bookingRequest.findMany({
  where: {
    status: "PENDING",
  },
  include: {
    user: true,
    room: true,
  },
  orderBy: {
    createdAt: "asc",
  },
})
```

## Prisma Studio

View and edit data in a GUI:

```bash
npm run db:studio
```

Opens at `http://localhost:5555`

## Migration Workflow

1. **Make schema changes** in `prisma/schema.prisma`
2. **Create migration**:
   ```bash
   npm run db:migrate
   ```
   This will:
   - Create a migration file
   - Apply it to your database
   - Regenerate Prisma Client
3. **Review migration** in `prisma/migrations/`
4. **Commit** migration files to version control

## Production Deployment

1. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

2. **Run migrations**:
   ```bash
   npm run db:migrate deploy
   ```

3. **Seed database** (optional):
   ```bash
   npm run db:seed
   ```

## Troubleshooting

### Migration Conflicts

If you have migration conflicts:

1. Reset database (development only):
   ```bash
   npm run db:migrate reset
   ```

2. Or manually resolve conflicts in migration files

### Schema Drift

If your database schema doesn't match Prisma schema:

1. **Pull schema from database**:
   ```bash
   npx prisma db pull
   ```

2. **Or push schema to database** (development only):
   ```bash
   npm run db:push
   ```

### Seed Script Issues

- Ensure database is migrated before seeding
- Check that all required fields are provided
- Verify JSON fields are properly formatted

## Best Practices

1. **Always create migrations** for schema changes
2. **Never edit migration files** after they've been applied
3. **Test migrations** on a copy of production data
4. **Backup database** before running migrations in production
5. **Use transactions** for complex operations
6. **Index frequently queried fields**
7. **Use JSON fields** for flexible data (equipment, images)

