# Service Layer Refactoring Guide

## Overview

This guide outlines the service layer architecture pattern for refactoring the codebase. The service layer separates business logic from API route handlers, making the code more maintainable, testable, and reusable.

## Structure

```
src/services/
  ├── room.service.ts          # Room business logic
  ├── booking.service.ts       # Booking business logic
  ├── request.service.ts       # Booking request business logic
  ├── notification.service.ts  # Notification business logic
  └── report.service.ts        # Report generation logic
```

## Example: Room Service

A basic `RoomService` example has been created in `src/services/room.service.ts`. This demonstrates the pattern:

```typescript
// Instead of business logic in API routes:
export async function POST(request: NextRequest) {
  // ... validation ...
  // ... business logic ...
  const room = await prisma.room.create({ ... })
  // ... cache invalidation ...
  return NextResponse.json(successResponse(room))
}

// Use service layer:
export async function POST(request: NextRequest) {
  const data = createRoomSchema.parse(body)
  const room = await roomService.createRoom(data)
  await cacheService.invalidate("rooms:list:*")
  return NextResponse.json(successResponse(room))
}
```

## Benefits

1. **Separation of Concerns**: API routes handle HTTP, services handle business logic
2. **Testability**: Services can be unit tested without HTTP context
3. **Reusability**: Business logic can be reused across different entry points
4. **Maintainability**: Easier to understand and modify business logic

## Refactoring Steps

1. **Identify Business Logic**: Extract logic from API routes
2. **Create Service Classes**: One service per domain (Room, Booking, etc.)
3. **Move Logic to Services**: Move database operations and business rules
4. **Update API Routes**: Call services instead of direct database access
5. **Add Tests**: Test services independently

## Current Status

- ✅ Example service created (`room.service.ts`)
- ⚠️ Full refactoring not yet implemented (low priority)

## Future Work

To fully implement the service layer:

1. Create all service files
2. Move business logic from API routes to services
3. Update API routes to use services
4. Add unit tests for services
5. Update integration tests

**Estimated Time**: 1-2 days for full refactoring

