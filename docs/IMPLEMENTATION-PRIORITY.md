# Implementation Priority Guide
## Optimizing for 500+ Daily Active Users

## ⚠️ CRITICAL: Must Implement Before Production

These optimizations are **absolutely essential** for handling 500+ daily users. The system will not perform adequately without them.

---

## Priority 1: Database & Connection Management (Week 1)

### 1.1 Migrate to PostgreSQL ⚠️ CRITICAL
**Why**: SQLite cannot handle 500 concurrent users
**Impact**: System will fail under load without this

```bash
# Update DATABASE_URL in .env
DATABASE_URL="postgresql://user:pass@host:5432/dbname?connection_limit=20&pool_timeout=10"
```

**Action Items**:
- [ ] Set up PostgreSQL database (cloud or local)
- [ ] Update Prisma schema datasource to `postgresql`
- [ ] Run migrations
- [ ] Test connection pooling

### 1.2 Configure Connection Pooling ⚠️ CRITICAL
**Why**: Prevents database connection exhaustion
**Impact**: Without this, you'll hit connection limits quickly

```typescript
// lib/prisma.ts - MUST implement
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?connection_limit=20&pool_timeout=10",
    },
  },
})
```

**Action Items**:
- [ ] Add connection pool parameters to DATABASE_URL
- [ ] Set max connections per instance (20-25)
- [ ] Configure pool timeout (10 seconds)
- [ ] Monitor connection pool usage

### 1.3 Add Critical Database Indexes ⚠️ CRITICAL
**Why**: Queries will be slow without proper indexes
**Impact**: Response times will exceed 2+ seconds without indexes

```prisma
// prisma/schema.prisma - ADD THESE INDEXES
model Booking {
  @@index([roomId, startAt, endAt])     // Availability queries
  @@index([userId, startAt])            // User bookings
  @@index([startAt, endAt])             // Time range queries
}

model BookingRequest {
  @@index([status, createdAt])          // Pending requests
  @@index([userId, status])             // User requests
}

model Room {
  @@index([building, isActive])         // Building filter
  @@index([isActive, capacity])         // Active rooms
}
```

**Action Items**:
- [ ] Add all indexes from performance-optimization.md
- [ ] Run migration
- [ ] Verify index usage with EXPLAIN ANALYZE
- [ ] Monitor slow queries

---

## Priority 2: Caching Layer (Week 1-2)

### 2.1 Set Up Redis ⚠️ CRITICAL
**Why**: Reduces database load by 70-80%
**Impact**: Without caching, database will be overwhelmed

```bash
# Install Redis locally or use cloud service
# For production: Use Redis Cloud, AWS ElastiCache, or Upstash
```

**Action Items**:
- [ ] Install/set up Redis
- [ ] Add Redis connection in code
- [ ] Implement cache service
- [ ] Test cache hit/miss

### 2.2 Implement Caching for Hot Data ⚠️ CRITICAL
**Why**: Room listings and availability checks are 80% of traffic
**Impact**: Response times will be 5-10x slower without cache

**Cache These Endpoints**:
1. **Room Listings** (TTL: 10 minutes)
2. **Room Details** (TTL: 1 hour)
3. **Availability Checks** (TTL: 5 minutes) ⚠️ HIGHEST PRIORITY
4. **User Notifications** (TTL: 2 minutes)

```typescript
// Example: Cache availability checks
async getAvailability(roomId: string, date: string) {
  const cacheKey = `availability:${roomId}:${date}`
  
  // Check cache first
  const cached = await cache.get(cacheKey)
  if (cached) return cached
  
  // Query database
  const data = await queryAvailability(roomId, date)
  
  // Cache for 5 minutes
  await cache.set(cacheKey, data, 300)
  return data
}
```

**Action Items**:
- [ ] Implement cache service
- [ ] Add caching to room listing endpoint
- [ ] Add caching to availability endpoint
- [ ] Add caching to room details endpoint
- [ ] Implement cache invalidation on updates

---

## Priority 3: API Optimizations (Week 2)

### 3.1 Add Pagination to All List Endpoints ⚠️ CRITICAL
**Why**: Without pagination, endpoints will return too much data
**Impact**: Slow responses, high memory usage, timeout errors

```typescript
// BEFORE: Returns all bookings (could be thousands)
GET /api/bookings

// AFTER: Paginated (max 50 per page)
GET /api/bookings?page=1&limit=50
```

**Endpoints to Paginate**:
- [ ] `/api/rooms` (limit: 50)
- [ ] `/api/bookings` (limit: 50)
- [ ] `/api/requests` (limit: 50)
- [ ] `/api/admin/audit` (limit: 100)
- [ ] `/api/notifications` (limit: 50)

**Action Items**:
- [ ] Add pagination params to all list endpoints
- [ ] Update queries to use skip/take
- [ ] Return pagination metadata
- [ ] Update frontend to handle pagination

### 3.2 Implement Rate Limiting ⚠️ CRITICAL
**Why**: Prevents abuse and protects system from overload
**Impact**: System vulnerable to abuse, potential DoS

```typescript
// Rate limits:
// - General API: 100 requests/minute
// - Booking creation: 20 requests/minute
// - Reports: 10 requests/minute
```

**Action Items**:
- [ ] Set up rate limiting middleware
- [ ] Configure limits per endpoint type
- [ ] Add rate limit headers to responses
- [ ] Test rate limiting

### 3.3 Optimize Query Patterns ⚠️ IMPORTANT
**Why**: N+1 queries kill performance
**Impact**: Response times 10-50x slower

```typescript
// BAD: N+1 queries
const rooms = await prisma.room.findMany()
for (const room of rooms) {
  const bookings = await prisma.booking.findMany({ where: { roomId: room.id } })
}

// GOOD: Single query with include
const rooms = await prisma.room.findMany({
  include: {
    _count: { select: { bookings: true } },
  },
})
```

**Action Items**:
- [ ] Audit all API routes for N+1 queries
- [ ] Use Prisma `include` for relationships
- [ ] Use `select` to limit returned fields
- [ ] Test query performance

---

## Priority 4: Monitoring & Health Checks (Week 2-3)

### 4.1 Add Health Check Endpoint
**Why**: Monitor system health and database connectivity
**Impact**: No visibility into system issues

```typescript
// GET /api/health
// Returns: { database: true, cache: true, timestamp: "..." }
```

**Action Items**:
- [ ] Create health check endpoint
- [ ] Test database connectivity
- [ ] Test Redis connectivity
- [ ] Set up monitoring alerts

### 4.2 Implement Logging & Metrics
**Why**: Need visibility into performance issues
**Impact**: Can't diagnose problems in production

**Action Items**:
- [ ] Add request logging (duration, status)
- [ ] Log slow queries (>100ms)
- [ ] Track cache hit rates
- [ ] Monitor error rates

---

## Performance Benchmarks

### Target Metrics (Must Achieve)

| Endpoint | Response Time (95th percentile) | With Cache |
|----------|--------------------------------|------------|
| Room List | < 300ms | < 50ms |
| Room Details | < 200ms | < 30ms |
| Availability | < 150ms | < 30ms ⚠️ |
| Booking Creation | < 300ms | N/A |
| Reports | < 2000ms | < 500ms |

### Load Test Requirements

Before going to production, run load tests:

```bash
# Test with k6 or Artillery
# Simulate 100 concurrent users
# Run for 10 minutes
# Target: < 1% error rate, < 500ms response time
```

**Action Items**:
- [ ] Set up load testing tool (k6/Artillery)
- [ ] Create test scenarios
- [ ] Run load tests
- [ ] Verify all targets met

---

## Implementation Checklist

### Week 1: Foundation
- [ ] **PostgreSQL setup** ⚠️ CRITICAL
- [ ] **Connection pooling** ⚠️ CRITICAL
- [ ] **Database indexes** ⚠️ CRITICAL
- [ ] **Redis setup** ⚠️ CRITICAL
- [ ] **Basic caching** ⚠️ CRITICAL

### Week 2: API & Caching
- [ ] **Complete caching layer** ⚠️ CRITICAL
- [ ] **Pagination on all endpoints** ⚠️ CRITICAL
- [ ] **Rate limiting** ⚠️ CRITICAL
- [ ] **Query optimization** ⚠️ IMPORTANT
- [ ] **Health checks** ⚠️ IMPORTANT

### Week 3: Testing & Monitoring
- [ ] **Load testing** ⚠️ CRITICAL
- [ ] **Performance monitoring** ⚠️ IMPORTANT
- [ ] **Error tracking** ⚠️ IMPORTANT
- [ ] **Documentation** ⚠️ IMPORTANT

---

## What Happens Without These Optimizations?

### Scenario: 500 Users, No Optimizations

1. **SQLite + No Connection Pooling**
   - ❌ Database locks and timeouts
   - ❌ Connection errors
   - ❌ System crashes

2. **No Caching**
   - ❌ Every request hits database
   - ❌ Response times: 2-5 seconds
   - ❌ Database overwhelmed
   - ❌ High server costs

3. **No Pagination**
   - ❌ Endpoints return thousands of records
   - ❌ Memory exhaustion
   - ❌ Request timeouts
   - ❌ Poor user experience

4. **No Rate Limiting**
   - ❌ Vulnerable to abuse
   - ❌ Single user can crash system
   - ❌ No protection against spikes

5. **No Indexes**
   - ❌ Full table scans
   - ❌ Query times: 5-30 seconds
   - ❌ Database CPU at 100%
   - ❌ System unusable

---

## Estimated Performance Impact

### Current State (SQLite, No Cache, No Indexes)
- **Concurrent Users**: ~10-20 before issues
- **Response Time**: 2-10 seconds
- **Error Rate**: 10-30%
- **Status**: ❌ **NOT PRODUCTION READY**

### With Priority 1-2 (PostgreSQL + Cache + Indexes)
- **Concurrent Users**: 100-150 ✅
- **Response Time**: 200-500ms ✅
- **Error Rate**: < 1% ✅
- **Status**: ✅ **PRODUCTION READY**

### With All Priorities (Full Optimization)
- **Concurrent Users**: 150-200 ✅
- **Response Time**: 50-200ms ✅
- **Error Rate**: < 0.1% ✅
- **Status**: ✅✅ **OPTIMIZED**

---

## Quick Start: Minimum Viable Optimization

If you need to go live quickly, implement these **5 critical items**:

1. ✅ **PostgreSQL** (1 day)
2. ✅ **Connection Pooling** (2 hours)
3. ✅ **Critical Indexes** (1 hour)
4. ✅ **Redis Caching for Availability** (1 day)
5. ✅ **Pagination** (1 day)

**Total Time**: ~3-4 days

This will get you from "unusable" to "production-ready" for 500 users.

---

## Resources

- [Performance Optimization Guide](./performance-optimization.md)
- [System Design Document](./system-design.md)
- [Database Schema](./database.md)

---

**Remember**: It's better to spend 1 week optimizing than to have a system crash on day 1 with 500 users.

