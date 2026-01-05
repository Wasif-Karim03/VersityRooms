# Performance Optimization Guide
## Supporting 500+ Daily Active Users

## Table of Contents
1. [Load Requirements](#load-requirements)
2. [Database Optimization](#database-optimization)
3. [Caching Strategy](#caching-strategy)
4. [API Performance](#api-performance)
5. [Connection Pooling](#connection-pooling)
6. [Query Optimization](#query-optimization)
7. [Monitoring & Metrics](#monitoring--metrics)
8. [Load Testing](#load-testing)

---

## Load Requirements

### Expected Load Profile
- **Daily Active Users**: 500+
- **Peak Concurrent Users**: ~100-150 (during class scheduling periods)
- **Requests per Second (RPS)**: ~20-50 peak
- **Database Queries**: ~1000-2000 queries/minute during peak
- **Read vs Write Ratio**: 80% reads, 20% writes

### Performance Targets
- **API Response Time**: < 200ms (95th percentile)
- **Database Query Time**: < 50ms (95th percentile)
- **Page Load Time**: < 2 seconds
- **Availability**: 99.9% uptime
- **Error Rate**: < 0.1%

---

## Database Optimization

### 1. PostgreSQL Configuration for Production

```sql
-- postgresql.conf optimizations for 500+ users
max_connections = 200
shared_buffers = 4GB                    -- 25% of RAM
effective_cache_size = 12GB             -- 75% of RAM
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1                  -- For SSD
effective_io_concurrency = 200          -- For SSD

-- Connection pooling settings
max_connection_idle_time = 600          -- 10 minutes
max_connection_lifetime = 3600          -- 1 hour
```

### 2. Prisma Connection Pool Configuration

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" 
      ? ["error"] 
      : ["query", "error", "warn"],
    
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    
    // Connection pool configuration
    __internal: {
      engine: {
        // Connection pool settings
        connection_limit: 20,           // Max connections per instance
        pool_timeout: 10,               // Timeout in seconds
        connect_timeout: 5,             // Connection timeout
      },
    },
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Connection pool monitoring
if (process.env.NODE_ENV === "production") {
  setInterval(async () => {
    const pool = (prisma as any).__internal?.engine?.connectionPool
    if (pool) {
      console.log("Connection Pool Stats:", {
        active: pool.activeConnections,
        idle: pool.idleConnections,
        total: pool.totalConnections,
      })
    }
  }, 60000) // Log every minute
}
```

### 3. Database Connection Pooling with PgBouncer (Recommended)

For production, use **PgBouncer** as a connection pooler:

```ini
# pgbouncer.ini
[databases]
roombooking = host=localhost dbname=roombooking

[pgbouncer]
pool_mode = transaction              # Transaction-level pooling
max_client_conn = 1000               # Max client connections
default_pool_size = 25               # Connections per database
reserve_pool_size = 5                # Reserve connections
reserve_pool_timeout = 3             # Seconds to wait
max_db_connections = 100             # Max DB connections total
max_user_connections = 25            # Max connections per user
```

**Connection String**:
```env
DATABASE_URL="postgresql://user:pass@localhost:6432/roombooking?pgbouncer=true"
```

---

## Caching Strategy

### 1. Redis Configuration

```typescript
// lib/redis.ts
import Redis from "ioredis"

export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  
  // Connection pool
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
  
  // Performance
  enableOfflineQueue: false,          // Don't queue when disconnected
  lazyConnect: false,
  
  // Memory optimization
  maxmemory: "256mb",
  maxmemoryPolicy: "allkeys-lru",     // LRU eviction
})
```

### 2. Caching Layers

#### Layer 1: In-Memory Cache (Hot Data)
```typescript
// For frequently accessed, small data
const memoryCache = new Map<string, { data: any; expires: number }>()

export class MemoryCacheService {
  private ttl = 60000 // 1 minute

  get<T>(key: string): T | null {
    const item = memoryCache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expires) {
      memoryCache.delete(key)
      return null
    }
    
    return item.data as T
  }

  set(key: string, data: any, ttl: number = this.ttl): void {
    memoryCache.set(key, {
      data,
      expires: Date.now() + ttl,
    })
  }
}
```

#### Layer 2: Redis Cache (Warm Data)
```typescript
// lib/cache.service.ts
export class CacheService {
  constructor(
    private redis: Redis,
    private memoryCache: MemoryCacheService
  ) {}

  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memory = this.memoryCache.get<T>(key)
    if (memory) return memory

    // Check Redis
    try {
      const data = await this.redis.get(key)
      if (data) {
        const parsed = JSON.parse(data)
        // Also store in memory cache
        this.memoryCache.set(key, parsed, 60000)
        return parsed as T
      }
    } catch (error) {
      console.error("Redis cache error:", error)
      // Fall through to database
    }

    return null
  }

  async set(
    key: string,
    value: any,
    ttl: number = 3600
  ): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value))
      this.memoryCache.set(key, value, Math.min(ttl * 1000, 60000))
    } catch (error) {
      console.error("Redis cache set error:", error)
      // Non-critical, continue
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) {
        await this.redis.del(...keys)
        // Also clear memory cache
        keys.forEach(k => this.memoryCache.delete(k))
      }
    } catch (error) {
      console.error("Cache invalidation error:", error)
    }
  }
}
```

### 3. Cache Keys and TTL Strategy

```typescript
// src/lib/cache-keys.ts
export const CacheKeys = {
  // Room data (cache for 1 hour, invalidate on update)
  room: (id: string) => `room:${id}`,
  roomList: (filters: string) => `rooms:list:${filters}`,
  
  // Availability (cache for 5 minutes, high traffic)
  availability: (roomId: string, date: string) => 
    `availability:${roomId}:${date}`,
  
  // User data (cache for 30 minutes)
  user: (id: string) => `user:${id}`,
  
  // Booking lists (cache for 2 minutes)
  bookings: (userId: string, filters: string) => 
    `bookings:${userId}:${filters}`,
  
  // Reports (cache for 15 minutes)
  report: (type: string, params: string) => 
    `report:${type}:${params}`,
}

export const CacheTTL = {
  ROOM: 3600,              // 1 hour
  ROOM_LIST: 600,          // 10 minutes
  AVAILABILITY: 300,       // 5 minutes
  USER: 1800,              // 30 minutes
  BOOKINGS: 120,           // 2 minutes
  REPORTS: 900,            // 15 minutes
}
```

---

## API Performance

### 1. Response Compression

```typescript
// middleware/compression.ts
import { NextRequest, NextResponse } from "next/server"

export function withCompression(handler: Function) {
  return async (req: NextRequest) => {
    const response = await handler(req)
    
    // Add compression headers
    response.headers.set("Content-Encoding", "gzip")
    response.headers.set("Vary", "Accept-Encoding")
    
    return response
  }
}
```

### 2. Pagination for All List Endpoints

```typescript
// src/lib/pagination.ts
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function paginate<T>(
  data: T[],
  page: number = 1,
  limit: number = 20
): PaginatedResponse<T> {
  const start = (page - 1) * limit
  const end = start + limit
  const paginatedData = data.slice(start, end)

  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit),
      hasNext: end < data.length,
      hasPrev: page > 1,
    },
  }
}
```

### 3. Rate Limiting

```typescript
// middleware/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Different limits for different endpoints
export const apiRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
  analytics: true,
})

export const strictRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"),  // 20 requests per minute
  analytics: true,
})

// Usage in API routes
export async function withRateLimit(
  request: NextRequest,
  limit: Ratelimit
) {
  const ip = request.ip ?? "127.0.0.1"
  const { success, limit: limitCount, remaining, reset } = await limit.limit(ip)
  
  if (!success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
        },
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limitCount.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": new Date(reset).toISOString(),
        },
      }
    )
  }
  
  return null
}
```

---

## Query Optimization

### 1. Database Indexes (Critical for Performance)

```prisma
// prisma/schema.prisma - Enhanced indexes

model Booking {
  // ... fields
  
  @@index([roomId, startAt, endAt])     // Availability queries
  @@index([userId, startAt])            // User bookings (time-ordered)
  @@index([startAt, endAt])             // Time range queries
  @@index([createdAt])                  // Recent bookings
  @@index([roomId, startAt])            // Room availability (composite)
  
  // Partial indexes for common queries
  @@index([roomId], where: { startAt: { gte: Prisma.sql`NOW()` } })
}

model BookingRequest {
  // ... fields
  
  @@index([status, createdAt])          // Pending requests (admin)
  @@index([userId, status])             // User requests by status
  @@index([roomId, status, startAt])    // Room-specific requests
  @@index([status], where: { status: "PENDING" })  // Partial index
}

model Room {
  // ... fields
  
  @@index([building, isActive])         // Building filter
  @@index([isActive, capacity])         // Active rooms by capacity
  @@index([isActive])                   // Active rooms only
}

model Notification {
  // ... fields
  
  @@index([userId, read, createdAt])    // User notifications
  @@index([userId, read])               // Unread count
}

model AuditLog {
  // ... fields
  
  @@index([actorUserId, createdAt])     // User actions
  @@index([targetType, targetId])       // Entity logs
  @@index([createdAt])                  // Time-based queries
  @@index([actionType, createdAt])      // Action type queries
}
```

### 2. Optimized Query Patterns

```typescript
// Bad: Multiple queries
const room = await prisma.room.findUnique({ where: { id } })
const bookings = await prisma.booking.findMany({ where: { roomId: id } })

// Good: Single query with include
const room = await prisma.room.findUnique({
  where: { id },
  include: {
    bookings: {
      where: { startAt: { gte: new Date() } },
      take: 10,
      orderBy: { startAt: "asc" },
    },
  },
})

// Bad: Selecting all fields
const users = await prisma.user.findMany()

// Good: Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
  },
})
```

### 3. Batch Queries

```typescript
// Bad: N+1 queries
const rooms = await prisma.room.findMany()
for (const room of rooms) {
  const bookingCount = await prisma.booking.count({
    where: { roomId: room.id },
  })
}

// Good: Single aggregated query
const rooms = await prisma.room.findMany({
  include: {
    _count: {
      select: { bookings: true },
    },
  },
})
```

---

## Connection Pooling

### 1. Prisma Connection Pool Settings

```typescript
// lib/prisma.ts - Production configuration
import { PrismaClient } from "@prisma/client"

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "production" 
      ? ["error"] 
      : ["query", "error", "warn"],
    
    datasources: {
      db: {
        url: process.env.DATABASE_URL + "?connection_limit=20&pool_timeout=10",
      },
    },
  })
}

export const prisma = 
  globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect()
})
```

### 2. Environment Variables

```env
# .env.production
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname?connection_limit=20&pool_timeout=10&connect_timeout=5"

# Or with PgBouncer
DATABASE_URL="postgresql://user:pass@localhost:6432/dbname?pgbouncer=true"
```

---

## Monitoring & Metrics

### 1. Performance Monitoring

```typescript
// lib/metrics.ts
export class MetricsService {
  async trackQuery(query: string, duration: number) {
    if (duration > 100) { // Log slow queries
      console.warn("Slow Query:", { query, duration })
    }
    
    // Send to monitoring service (e.g., Datadog, New Relic)
    // await metricsClient.histogram("db.query.duration", duration, {
    //   query: query.substring(0, 100),
    // })
  }

  async trackApiRequest(
    endpoint: string,
    method: string,
    duration: number,
    statusCode: number
  ) {
    // Track API metrics
    console.log("API Request:", {
      endpoint,
      method,
      duration,
      statusCode,
    })
  }
}
```

### 2. Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"

export async function GET() {
  const checks = {
    database: false,
    cache: false,
    timestamp: new Date().toISOString(),
  }

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch (error) {
    console.error("Database health check failed:", error)
  }

  try {
    // Redis check
    await redis.ping()
    checks.cache = true
  } catch (error) {
    console.error("Cache health check failed:", error)
  }

  const isHealthy = checks.database && checks.cache

  return NextResponse.json(checks, {
    status: isHealthy ? 200 : 503,
  })
}
```

---

## Load Testing

### 1. Load Test Scenarios

Using **k6** or **Artillery**:

```javascript
// load-test.js (k6)
import http from "k6/http"
import { check, sleep } from "k6"

export const options = {
  stages: [
    { duration: "2m", target: 50 },   // Ramp up to 50 users
    { duration: "5m", target: 50 },   // Stay at 50 users
    { duration: "2m", target: 100 },  // Ramp up to 100 users
    { duration: "5m", target: 100 },  // Stay at 100 users
    { duration: "2m", target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests < 500ms
    http_req_failed: ["rate<0.01"],   // Error rate < 1%
  },
}

export default function () {
  // Test room listing
  const roomsRes = http.get("http://localhost:3000/api/rooms")
  check(roomsRes, {
    "rooms status is 200": (r) => r.status === 200,
    "rooms response time < 500ms": (r) => r.timings.duration < 500,
  })

  sleep(1)

  // Test availability
  const availabilityRes = http.get(
    "http://localhost:3000/api/rooms/room-id/availability?date=2024-01-15"
  )
  check(availabilityRes, {
    "availability status is 200": (r) => r.status === 200,
  })

  sleep(1)
}
```

### 2. Performance Benchmarks

Target metrics:
- **Room Listing**: < 100ms (with cache), < 300ms (without cache)
- **Availability Check**: < 50ms (with cache), < 150ms (without cache)
- **Booking Creation**: < 200ms
- **Report Generation**: < 500ms (with cache), < 2000ms (without cache)

---

## Summary Checklist

### Database
- [ ] PostgreSQL with optimized configuration
- [ ] PgBouncer connection pooling
- [ ] All critical indexes created
- [ ] Query performance monitoring
- [ ] Connection pool monitoring

### Caching
- [ ] Redis configured and connected
- [ ] Memory cache for hot data
- [ ] Redis cache for warm data
- [ ] Cache invalidation strategy
- [ ] Cache hit rate monitoring

### API
- [ ] Pagination on all list endpoints
- [ ] Response compression enabled
- [ ] Rate limiting implemented
- [ ] Error handling standardized
- [ ] Request validation on all endpoints

### Monitoring
- [ ] Health check endpoint
- [ ] Performance metrics collection
- [ ] Slow query logging
- [ ] Error tracking
- [ ] Uptime monitoring

### Testing
- [ ] Load testing completed
- [ ] Performance benchmarks met
- [ ] Stress testing completed
- [ ] Database load testing

---

## Expected Performance with 500 Users

With these optimizations:

- **Concurrent Users**: 100-150 users
- **Requests/Second**: 20-50 RPS peak
- **Database Connections**: 20-30 active connections (via pooler)
- **Cache Hit Rate**: 70-80% for room/availability queries
- **Response Times**: 
  - Room listing: 50-150ms (cached: 10-30ms)
  - Availability: 30-100ms (cached: 5-20ms)
  - Booking creation: 150-300ms
  - Reports: 200-500ms (cached: 50-150ms)

