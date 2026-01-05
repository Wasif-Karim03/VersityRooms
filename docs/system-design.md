# System Design Document
## University Room Booking System
### Optimized for 500+ Daily Active Users

## Table of Contents
1. [Current State Analysis](#current-state-analysis)
2. [System Architecture Overview](#system-architecture-overview)
3. [Database Design](#database-design)
4. [API Architecture](#api-architecture)
5. [Service Layer Design](#service-layer-design)
6. [Performance Optimization](#performance-optimization)
7. [Scalability Considerations](#scalability-considerations)
8. [Security & Compliance](#security--compliance)
9. [Recommendations & Improvements](#recommendations--improvements)

---

## Current State Analysis

### Technology Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless Functions)
- **Database**: SQLite (Development) / PostgreSQL (Recommended for Production)
- **ORM**: Prisma
- **Authentication**: NextAuth.js (Demo mode)
- **State Management**: React Server Components + Client Components

### Current Features
1. **User Management**
   - Role-based access control (STUDENT, FACULTY, ADMIN)
   - User authentication (demo mode)
   - User profiles

2. **Room Management**
   - Room CRUD operations (Admin only)
   - Room filtering (building, capacity, equipment)
   - Room availability checking
   - Room restrictions (role-based access)

3. **Booking System**
   - Booking request creation
   - Booking approval/rejection workflow
   - Conflict detection
   - Admin override capability
   - Booking cancellation

4. **Calendar & Scheduling**
   - Calendar view
   - Time slot availability
   - Day-by-day booking view

5. **Admin Features**
   - Request approval/rejection
   - Room management
   - Audit logging
   - Reports (utilization, peak hours, bookings by role)
   - Data export

6. **Notifications**
   - In-app notifications
   - Database-stored notifications
   - Email notifications (stub implementation)

### Current Issues & Limitations

1. **Database**
   - Using SQLite (not suitable for production)
   - JSON fields for arrays (equipment, images) - not normalized
   - Missing some indexes for complex queries
   - No database connection pooling configuration

2. **Architecture**
   - Business logic mixed in API routes
   - No service layer separation
   - No repository pattern
   - Limited error handling strategies
   - No transaction management for complex operations

3. **Performance**
   - No caching layer (Redis/Memory)
   - Reports computed on-the-fly
   - Availability checks query database directly each time
   - No pagination in some endpoints
   - N+1 query potential in some routes

4. **Scalability**
   - No queue system for async operations
   - No background job processing
   - Synchronous notification sending
   - No rate limiting

5. **Real-time Features**
   - No WebSocket/SSE for real-time updates
   - No live availability updates
   - Static data fetching

6. **Security**
   - Basic authentication (demo mode)
   - No rate limiting
   - No request validation middleware
   - Audit logging present but could be enhanced

---

## System Architecture Overview

### Proposed Architecture: Layered Architecture with Service Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  Next.js Pages (Server Components + Client Components)      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  Next.js API Routes (Request/Response Handling)             │
│  - Authentication Middleware                                 │
│  - Validation Middleware                                     │
│  - Error Handling                                           │
│  - Rate Limiting                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  Business Logic (Pure Functions)                            │
│  - BookingService                                           │
│  - RoomService                                              │
│  - AvailabilityService                                      │
│  - NotificationService                                      │
│  - AuditService                                             │
│  - ReportService                                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Repository Layer                           │
│  Data Access (Prisma Queries)                               │
│  - BookingRepository                                        │
│  - RoomRepository                                           │
│  - UserRepository                                           │
│  - NotificationRepository                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  PostgreSQL Database + Redis Cache                          │
└─────────────────────────────────────────────────────────────┘
```

### Component Diagram

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │    │  API Routes  │    │   Services   │
│  (Next.js)   │◄──►│  (Next.js)   │◄──►│  (Business   │
│              │    │              │    │   Logic)     │
└──────────────┘    └──────────────┘    └──────────────┘
                            │                    │
                            │                    ▼
                    ┌───────┴────────┐    ┌──────────────┐
                    │  Middleware    │    │ Repositories │
                    │  - Auth        │    │  (Prisma)    │
                    │  - Validation  │    └──────────────┘
                    │  - Rate Limit  │           │
                    └───────────────┘           │
                                                ▼
                                        ┌──────────────┐
                                        │  PostgreSQL  │
                                        │  + Redis     │
                                        └──────────────┘
```

---

## Database Design

### Improved Schema Design

#### 1. Normalized Schema Changes

**Current Issue**: Using JSON strings for arrays
```prisma
equipment String @default("[]")  // Bad: JSON string
```

**Proposed Solution**: Separate tables with relationships
```prisma
model Room {
  id              String    @id @default(cuid())
  name            String
  building        String
  capacity        Int
  isActive        Boolean   @default(true)
  isLocked        Boolean   @default(false)
  createdAt       DateTime  @default(now())
  
  equipment       RoomEquipment[]
  images          RoomImage[]
  restrictions    RoomRestriction[]
  bookings        Booking[]
  bookingRequests BookingRequest[]
  
  @@index([building, isActive])
  @@index([isActive, capacity])
}

model Equipment {
  id          String   @id @default(cuid())
  name        String   @unique  // "projector", "whiteboard", etc.
  description String?
  createdAt   DateTime @default(now())
  
  rooms       RoomEquipment[]
}

model RoomEquipment {
  id          String   @id @default(cuid())
  roomId      String
  equipmentId String
  
  room        Room      @relation(fields: [roomId], references: [id], onDelete: Cascade)
  equipment   Equipment @relation(fields: [equipmentId], references: [id], onDelete: Cascade)
  
  @@unique([roomId, equipmentId])
  @@index([roomId])
}

model RoomImage {
  id        String   @id @default(cuid())
  roomId    String
  url       String
  alt       String?
  order     Int      @default(0)
  createdAt DateTime @default(now())
  
  room      Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  
  @@index([roomId, order])
}

model RoomRestriction {
  id     String   @id @default(cuid())
  roomId String
  role   String   // "STUDENT", "FACULTY", "ADMIN"
  
  room   Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  
  @@unique([roomId, role])
  @@index([roomId])
}
```

#### 2. Enhanced Indexing Strategy

**Booking Queries Optimization**:
```prisma
model Booking {
  // ... existing fields
  
  @@index([roomId, startAt, endAt])  // For availability queries
  @@index([userId, startAt])         // For user bookings (ordered by time)
  @@index([startAt, endAt])          // For time range queries
  @@index([createdAt])               // For recent bookings
  @@index([roomId, startAt])         // Composite for room availability
}

model BookingRequest {
  // ... existing fields
  
  @@index([status, createdAt])       // For pending requests (admin)
  @@index([userId, status])          // For user requests
  @@index([roomId, status, startAt]) // For room-specific requests
}
```

#### 3. Database Migrations to PostgreSQL

**Migration Path**:
1. Set up PostgreSQL database
2. Update `DATABASE_URL` in `.env`
3. Run `prisma migrate dev` to create schema
4. Data migration script (if needed)

**Connection Pooling**:
```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

---

## API Architecture

### RESTful API Design Principles

#### 1. Endpoint Structure

```
/api
├── /auth              # Authentication endpoints
│   └── /[...nextauth] # NextAuth handlers
│
├── /rooms             # Public room endpoints
│   ├── GET /          # List rooms (with filters)
│   └── GET /:id       # Get room details
│
├── /rooms/:id
│   └── /availability  # Room availability
│       └── GET /      # Get availability for date
│
├── /bookings          # Booking endpoints
│   ├── GET /          # List bookings (filtered)
│   └── POST /         # Create booking (direct)
│
├── /requests          # Booking request endpoints
│   ├── GET /          # List requests
│   ├── POST /         # Create request
│   ├── PATCH /:id     # Update request (admin)
│   └── /:id/cancel    # Cancel request
│
├── /notifications     # Notification endpoints
│   ├── GET /          # Get user notifications
│   ├── POST /:id/read # Mark as read
│   └── POST /read-all # Mark all as read
│
└── /admin             # Admin-only endpoints
    ├── /rooms         # Room management
    ├── /users         # User management
    ├── /requests      # Request management
    ├── /audit         # Audit logs
    └── /reports       # Analytics & reports
        ├── /utilization
        ├── /peak-hours
        ├── /bookings-by-role
        └── /export
```

#### 2. Response Format Standardization

```typescript
// Success Response
{
  success: true,
  data: T,
  meta?: {
    pagination?: {
      page: number,
      limit: number,
      total: number,
      totalPages: number
    },
    filters?: Record<string, any>
  }
}

// Error Response
{
  success: false,
  error: {
    code: string,        // "VALIDATION_ERROR", "NOT_FOUND", etc.
    message: string,
    details?: any
  },
  statusCode: number
}
```

#### 3. Request Validation

Use Zod schemas for all inputs:
```typescript
// src/lib/validations/bookings.ts
export const createBookingSchema = z.object({
  roomId: z.string().cuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  purpose: z.string().min(1).max(500),
}).refine((data) => new Date(data.endAt) > new Date(data.startAt), {
  message: "End time must be after start time",
  path: ["endAt"],
})
```

---

## Service Layer Design

### Service Organization

```
src/services/
├── booking.service.ts
├── room.service.ts
├── availability.service.ts
├── notification.service.ts
├── audit.service.ts
├── report.service.ts
└── user.service.ts
```

### Example: BookingService

```typescript
// src/services/booking.service.ts
export class BookingService {
  constructor(
    private bookingRepo: BookingRepository,
    private availabilityService: AvailabilityService,
    private notificationService: NotificationService,
    private auditService: AuditService
  ) {}

  async createBookingRequest(
    userId: string,
    data: CreateBookingRequestDto
  ): Promise<BookingRequest> {
    // 1. Validate room exists and is available
    const room = await this.roomRepo.findById(data.roomId)
    if (!room || !room.isActive) {
      throw new NotFoundError("Room not found or inactive")
    }

    // 2. Check role restrictions
    await this.validateRoomAccess(userId, room)

    // 3. Check for conflicts
    const hasConflict = await this.availabilityService.checkConflicts(
      data.roomId,
      data.startAt,
      data.endAt
    )
    if (hasConflict) {
      throw new ConflictError("Room is already booked for this time")
    }

    // 4. Create booking request (transaction)
    const request = await this.bookingRepo.createRequest({
      userId,
      roomId: data.roomId,
      startAt: data.startAt,
      endAt: data.endAt,
      purpose: data.purpose,
      status: "PENDING",
    })

    // 5. Send notification (async)
    await this.notificationService.notifyRequestSubmitted(request)

    // 6. Audit log
    await this.auditService.log({
      actorId: userId,
      action: "BOOKING_REQUEST_CREATED",
      targetType: "BookingRequest",
      targetId: request.id,
    })

    return request
  }

  async approveRequest(
    adminId: string,
    requestId: string,
    reason: string
  ): Promise<{ request: BookingRequest; booking: Booking }> {
    // 1. Get request
    const request = await this.bookingRepo.findRequestById(requestId)
    if (!request || request.status !== "PENDING") {
      throw new BadRequestError("Request not found or not pending")
    }

    // 2. Check conflicts again
    const hasConflict = await this.availabilityService.checkConflicts(
      request.roomId,
      request.startAt,
      request.endAt
    )
    if (hasConflict) {
      throw new ConflictError("Cannot approve: conflicts with existing booking")
    }

    // 3. Transaction: Update request + Create booking
    const result = await this.bookingRepo.approveRequest(requestId, {
      approvedBy: adminId,
      reason,
    })

    // 4. Notifications
    await this.notificationService.notifyBookingApproved(result.request)

    // 5. Audit
    await this.auditService.log({
      actorId: adminId,
      action: "BOOKING_REQUEST_APPROVED",
      targetType: "BookingRequest",
      targetId: requestId,
      reason,
    })

    return result
  }
}
```

### Repository Pattern

```typescript
// src/repositories/booking.repository.ts
export class BookingRepository {
  constructor(private prisma: PrismaClient) {}

  async createRequest(data: CreateBookingRequestData): Promise<BookingRequest> {
    return this.prisma.bookingRequest.create({
      data,
      include: {
        room: true,
        user: { select: { id: true, name: true, email: true } },
      },
    })
  }

  async findRequestById(id: string): Promise<BookingRequest | null> {
    return this.prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        room: true,
        user: true,
      },
    })
  }

  async approveRequest(
    requestId: string,
    data: { approvedBy: string; reason: string }
  ): Promise<{ request: BookingRequest; booking: Booking }> {
    // Use transaction
    return this.prisma.$transaction(async (tx) => {
      // Update request
      const request = await tx.bookingRequest.update({
        where: { id: requestId },
        data: { status: "APPROVED" },
      })

      // Create booking
      const booking = await tx.booking.create({
        data: {
          roomId: request.roomId,
          userId: request.userId,
          startAt: request.startAt,
          endAt: request.endAt,
          purpose: request.purpose,
          createdFromRequestId: request.id,
        },
      })

      return { request, booking }
    })
  }
}
```

---

## Performance Optimization
### Critical for 500+ Daily Users

> **⚠️ Performance Target**: System must handle 500+ daily active users with peak concurrent load of 100-150 users. All optimizations below are **REQUIRED** for production.

**See detailed performance guide**: [performance-optimization.md](./performance-optimization.md)

### Key Performance Requirements
- **Response Time**: < 200ms (95th percentile)
- **Database Queries**: < 50ms (95th percentile)
- **Concurrent Connections**: 100-150 peak
- **Uptime**: 99.9%
- **Error Rate**: < 0.1%

### 1. Caching Strategy (REQUIRED)

**Redis Integration**:
```typescript
// lib/redis.ts
import Redis from "ioredis"

export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379")

// Cache keys
export const CacheKeys = {
  room: (id: string) => `room:${id}`,
  roomAvailability: (roomId: string, date: string) => `availability:${roomId}:${date}`,
  roomsList: (filters: string) => `rooms:list:${filters}`,
}
```

**Caching Service**:
```typescript
// src/services/cache.service.ts
export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await redis.setex(key, ttl, JSON.stringify(value))
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) await redis.del(...keys)
  }
}
```

**Usage Example**:
```typescript
// In RoomService
async getRoom(id: string): Promise<Room> {
  const cacheKey = CacheKeys.room(id)
  
  // Check cache
  const cached = await this.cacheService.get<Room>(cacheKey)
  if (cached) return cached
  
  // Fetch from DB
  const room = await this.roomRepo.findById(id)
  if (!room) throw new NotFoundError("Room not found")
  
  // Cache for 1 hour
  await this.cacheService.set(cacheKey, room, 3600)
  
  return room
}
```

### 2. Query Optimization

**Eager Loading**:
```typescript
// Bad: N+1 queries
const bookings = await prisma.booking.findMany()
for (const booking of bookings) {
  const room = await prisma.room.findUnique({ where: { id: booking.roomId } })
}

// Good: Single query with include
const bookings = await prisma.booking.findMany({
  include: {
    room: true,
    user: { select: { id: true, name: true, email: true } },
  },
})
```

**Pagination**:
```typescript
async getBookings(params: {
  page: number
  limit: number
  filters?: BookingFilters
}): Promise<PaginatedResult<Booking>> {
  const skip = (params.page - 1) * params.limit
  
  const [data, total] = await Promise.all([
    this.prisma.booking.findMany({
      where: this.buildWhereClause(params.filters),
      skip,
      take: params.limit,
      include: { room: true, user: true },
      orderBy: { startAt: "desc" },
    }),
    this.prisma.booking.count({
      where: this.buildWhereClause(params.filters),
    }),
  ])
  
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  }
}
```

### 3. Background Jobs

**Queue System (BullMQ)**:
```typescript
// lib/queue.ts
import { Queue } from "bullmq"

export const notificationQueue = new Queue("notifications", {
  connection: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
})

// In BookingService
async approveRequest(...) {
  // ... approval logic
  
  // Add to queue instead of synchronous
  await notificationQueue.add("send-approval-email", {
    userId: request.userId,
    requestId: request.id,
  })
}
```

---

## Scalability Considerations

### 1. Horizontal Scaling

- **Stateless API**: All API routes are stateless
- **Database Connection Pooling**: Configure Prisma connection pool
- **Load Balancing**: Use load balancer for multiple instances
- **Session Storage**: Use Redis for session storage (NextAuth)

### 2. Database Scaling

- **Read Replicas**: For read-heavy operations (reports, listings)
- **Partitioning**: Partition large tables by date (bookings, audit logs)
- **Archiving**: Archive old bookings/audit logs

### 3. Microservices Consideration (Future)

If scaling beyond single service:
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Booking    │    │  Notification│    │   Reports   │
│  Service    │    │   Service    │    │   Service   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │
       └──────────────────┼──────────────────┘
                          │
                  ┌───────┴────────┐
                  │  API Gateway   │
                  └───────┬────────┘
                          │
                  ┌───────┴────────┐
                  │   PostgreSQL   │
                  │   + Redis      │
                  └────────────────┘
```

---

## Security & Compliance

### 1. Authentication & Authorization

- **Production Auth**: Replace demo auth with OWU SSO
- **JWT Tokens**: Secure token storage
- **Role-Based Access Control**: Enforce at service layer
- **Session Management**: Secure session storage

### 2. Data Protection

- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Prisma handles this
- **XSS Prevention**: React escapes by default
- **CSRF Protection**: Next.js built-in protection

### 3. Rate Limiting

```typescript
// middleware/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})
```

### 4. Audit Logging

Current audit logging is good but enhance:
- Log all mutations (CREATE, UPDATE, DELETE)
- Include request metadata (IP, user agent)
- Retention policy (90 days active, archive older)

---

## Recommendations & Improvements

### Priority 1: Critical (Immediate)

1. **Migrate to PostgreSQL**
   - Production-ready database
   - Better performance
   - Advanced features

2. **Normalize Database Schema**
   - Separate Equipment, Images, Restrictions tables
   - Remove JSON fields
   - Better query performance

3. **Service Layer Implementation**
   - Extract business logic from API routes
   - Better testability
   - Code reusability

4. **Error Handling**
   - Standardized error responses
   - Proper error types
   - Error logging

### Priority 2: Important (Short-term)

5. **Caching Layer**
   - Redis for frequently accessed data
   - Cache invalidation strategy
   - Performance improvement

6. **Pagination**
   - Add pagination to all list endpoints
   - Prevent large data transfers

7. **Background Jobs**
   - Async notification sending
   - Email queue
   - Report generation

8. **Database Indexing**
   - Add missing indexes
   - Optimize query performance

### Priority 3: Enhancement (Medium-term)

9. **Real-time Updates**
   - WebSocket/SSE for live availability
   - Push notifications

10. **Advanced Reporting**
    - Cached reports
    - Scheduled report generation
    - Export formats (PDF, CSV)

11. **Rate Limiting**
    - Protect against abuse
    - API throttling

12. **Monitoring & Logging**
    - Application monitoring (Sentry)
    - Performance monitoring
    - Log aggregation

### Priority 4: Future (Long-term)

13. **Microservices**
    - Split into separate services if needed
    - Service mesh

14. **Advanced Features**
    - Recurring bookings
    - Booking templates
    - Calendar integration (iCal)
    - Mobile app

15. **Analytics**
    - User behavior tracking
    - Booking patterns
    - Predictive analytics

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Migrate to PostgreSQL
- [ ] Normalize database schema
- [ ] Create service layer structure
- [ ] Implement repository pattern

### Phase 2: Core Improvements (Weeks 3-4)
- [ ] Add caching layer (Redis)
- [ ] Implement pagination
- [ ] Add background job processing
- [ ] Enhance error handling

### Phase 3: Performance (Weeks 5-6)
- [ ] Query optimization
- [ ] Database indexing
- [ ] Caching strategy implementation
- [ ] Performance testing

### Phase 4: Production Ready (Weeks 7-8)
- [ ] Rate limiting
- [ ] Monitoring setup
- [ ] Security hardening
- [ ] Documentation

---

## Conclusion

This system design provides a roadmap for improving the current room booking system. The key focus areas are:

1. **Database**: Normalize schema and migrate to PostgreSQL
2. **Architecture**: Implement service layer and repository pattern
3. **Performance**: Add caching and optimize queries
4. **Scalability**: Prepare for growth with proper architecture
5. **Security**: Enhance security measures and compliance

The phased approach allows for incremental improvements while maintaining system stability.

