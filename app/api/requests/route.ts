/**
 * POST /api/requests - Create a booking request
 * GET /api/requests - Get booking requests (with filters)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCurrentUser } from "@/src/lib/auth/session"
import { requireAdmin } from "@/src/lib/auth/guards"
import { createBookingRequestSchema } from "@/src/lib/validations/booking-requests"
import { bookingRequestQuerySchema } from "@/src/lib/validations/booking-requests"
import { checkBookingConflicts } from "@/src/lib/api/availability"
import { notifyBookingApproved } from "@/src/lib/notifications"
import { createAuditLog } from "@/src/lib/api/audit"
import { cacheService } from "@/src/lib/cache.service"
import { successResponse, errorResponse } from "@/src/lib/api/response"
import { handleValidationError } from "@/src/lib/api/validation-errors"
import { parseJsonField } from "@/lib/json-utils"
import {
  parsePaginationParams,
  calculateSkip,
  createPaginatedResponse,
} from "@/src/lib/pagination"
import { checkRateLimit, getClientIdentifier, RateLimits } from "@/src/lib/rate-limit"
import { sanitizeString } from "@/src/lib/utils/sanitize"

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireCurrentUser()

    // Rate limiting (20 booking requests per minute)
    const identifier = getClientIdentifier(request, user.id)
    const rateLimitResult = await checkRateLimit(identifier, RateLimits.BOOKING)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        errorResponse("Too many booking requests. Please try again later.", 429),
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RateLimits.BOOKING.max.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString(),
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createBookingRequestSchema.parse(body)

    const startAt = new Date(validatedData.startAt)
    const endAt = new Date(validatedData.endAt)

    // Verify room exists and is active
    const room = await prisma.room.findUnique({
      where: { id: validatedData.roomId },
    })

    if (!room) {
      return NextResponse.json(
        errorResponse("Room not found", 404),
        { status: 404 }
      )
    }

    if (!room.isActive) {
      return NextResponse.json(
        errorResponse("Room is not active", 400),
        { status: 400 }
      )
    }

    if (room.isLocked) {
      return NextResponse.json(
        errorResponse("Room is currently locked", 400),
        { status: 400 }
      )
    }

    // Check role restrictions
    if (room.restrictedRoles) {
      const restrictedRoles = parseJsonField<string[]>(room.restrictedRoles as any) || []
      if (restrictedRoles.length > 0 && !restrictedRoles.includes(user.role)) {
        return NextResponse.json(
          errorResponse("You do not have permission to book this room", 403),
          { status: 403 }
        )
      }
    }

    // Check for conflicts with existing bookings
    const hasConflict = await checkBookingConflicts(
      validatedData.roomId,
      startAt,
      endAt
    )

    if (hasConflict) {
      return NextResponse.json(
        errorResponse("Room is already booked for this time period", 409),
        { status: 409 }
      )
    }

    // Create booking request with APPROVED status (instant booking)
    const bookingRequest = await prisma.bookingRequest.create({
      data: {
        roomId: validatedData.roomId,
        userId: user.id,
        startAt,
        endAt,
        purpose: sanitizeString(validatedData.purpose),
        status: "APPROVED", // Auto-approved - instant booking
      },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Create the actual booking immediately (instant booking)
    const booking = await prisma.booking.create({
      data: {
        roomId: validatedData.roomId,
        userId: user.id,
        startAt,
        endAt,
        purpose: sanitizeString(validatedData.purpose),
        createdFromRequestId: bookingRequest.id,
      },
      include: {
        room: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Invalidate availability cache for the booked date range
    await cacheService.invalidateAvailabilityRange(
      validatedData.roomId,
      startAt,
      endAt
    )

    // Create audit log
    await createAuditLog({
      actorUserId: user.id,
      actionType: "BOOKING_REQUEST_APPROVED",
      targetType: "BookingRequest",
      targetId: bookingRequest.id,
      reason: "Auto-approved - instant booking",
    })

    // Send approval notification (non-blocking - don't fail request if notification fails)
    notifyBookingApproved(
      user.id,
      bookingRequest.id,
      bookingRequest.room.name,
      startAt,
      endAt
    ).catch((err) => {
      console.error("Failed to send notification for booking approval:", err)
    })

    // Return both the request and booking
    const response = NextResponse.json(
      successResponse({
        request: bookingRequest,
        booking,
      }),
      { status: 201 }
    )
    
    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", RateLimits.BOOKING.max.toString())
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString())
    response.headers.set("X-RateLimit-Reset", new Date(rateLimitResult.reset).toISOString())
    
    return response
  } catch (error: any) {
    console.error("Error creating booking request:", error)
    
    const validationError = handleValidationError(error)
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 })
    }
    if (error?.message === "User not authenticated") {
      return NextResponse.json(
        errorResponse("Authentication required", 401),
        { status: 401 }
      )
    }
    
    // Return more detailed error message for debugging
    const errorMessage = error?.message || "Failed to create booking request"
    return NextResponse.json(
      errorResponse(errorMessage, 500),
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query: any = {}

    // Handle mine parameter (convert string "true" to boolean)
    if (searchParams.get("mine") !== null) {
      query.mine = searchParams.get("mine") === "true"
    }

    // Handle status parameter
    if (searchParams.get("status")) {
      query.status = searchParams.get("status")
    }

    // Parse pagination parameters
    const { page, limit } = parsePaginationParams(searchParams)

    const validatedQuery = bookingRequestQuerySchema.parse(query)

    // Build where clause
    const where: any = {}

    // If "mine" is true, filter by current user
    if (validatedQuery.mine) {
      const user = await requireCurrentUser()
      where.userId = user.id
    }

    // If status is provided, filter by status
    if (validatedQuery.status) {
      where.status = validatedQuery.status
      
      // If filtering by PENDING, require admin for non-mine queries
      if (validatedQuery.status === "PENDING" && !validatedQuery.mine) {
        await requireAdmin()
      }
    }

    const skip = calculateSkip(page, limit)

    // Fetch paginated requests and total count in parallel
    const [bookingRequests, total] = await Promise.all([
      prisma.bookingRequest.findMany({
        where,
        include: {
          room: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.bookingRequest.count({ where }),
    ])

    const paginatedResponse = createPaginatedResponse(
      bookingRequests,
      total,
      page,
      limit
    )

    return NextResponse.json(successResponse(paginatedResponse))
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        errorResponse("Invalid query parameters", 400),
        { status: 400 }
      )
    }
    if (error.message === "User not authenticated") {
      return NextResponse.json(
        errorResponse("Authentication required", 401),
        { status: 401 }
      )
    }
    console.error("Error fetching booking requests:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch booking requests", 500),
      { status: 500 }
    )
  }
}

