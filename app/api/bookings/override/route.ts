/**
 * POST /api/bookings/override
 * Admin-only endpoint to create override bookings (bypasses conflict checks)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { createOverrideBookingSchema } from "@/src/lib/validations/bookings"
import { createAuditLog } from "@/src/lib/api/audit"
import { notifyOverrideCreated } from "@/src/lib/notifications"
import { successResponse, errorResponse } from "@/src/lib/api/response"
import { handleValidationError } from "@/src/lib/api/validation-errors"
import { cacheService } from "@/src/lib/cache.service"
import { checkRateLimit, getClientIdentifier, RateLimits } from "@/src/lib/rate-limit"
import { sanitizeString } from "@/src/lib/utils/sanitize"

export async function POST(request: NextRequest) {
  try {
    // Require admin
    const admin = await requireAdmin()

    // Rate limiting (10 requests per minute for admin write operations)
    const identifier = getClientIdentifier(request, admin.id)
    const rateLimitResult = await checkRateLimit(identifier, RateLimits.REPORTS)
    
    if (!rateLimitResult.allowed) {
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
            "X-RateLimit-Limit": RateLimits.REPORTS.max.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimitResult.reset).toISOString(),
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createOverrideBookingSchema.parse(body)

    const startAt = new Date(validatedData.startAt)
    const endAt = new Date(validatedData.endAt)

    // Verify room exists
    const room = await prisma.room.findUnique({
      where: { id: validatedData.roomId },
    })

    if (!room) {
      return NextResponse.json(
        errorResponse("Room not found", 404),
        { status: 404 }
      )
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    })

    if (!user) {
      return NextResponse.json(
        errorResponse("User not found", 404),
        { status: 404 }
      )
    }

    // Create override booking (sanitize purpose and reason)
    const booking = await prisma.booking.create({
      data: {
        roomId: validatedData.roomId,
        userId: validatedData.userId,
        startAt,
        endAt,
        purpose: sanitizeString(validatedData.purpose),
        isOverride: true,
      },
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
    })

    // Sanitize reason before storing
    const sanitizedReason = sanitizeString(validatedData.reason)

    // Create audit log
    await createAuditLog({
      actorUserId: admin.id,
      actionType: "BOOKING_OVERRIDE_CREATED",
      targetType: "Booking",
      targetId: booking.id,
      reason: sanitizedReason,
    })

    // Send notification
    await notifyOverrideCreated(
      validatedData.userId,
      booking.id,
      room.name,
      startAt,
      endAt,
      sanitizedReason
    )

    // Invalidate availability cache for the booked date range
    await cacheService.invalidateAvailabilityRange(
      validatedData.roomId,
      startAt,
      endAt
    )

    const response = NextResponse.json(successResponse(booking), { status: 201 })
    
    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", RateLimits.REPORTS.max.toString())
    response.headers.set("X-RateLimit-Remaining", rateLimitResult.remaining.toString())
    response.headers.set("X-RateLimit-Reset", new Date(rateLimitResult.reset).toISOString())
    
    return response
  } catch (error: any) {
    const validationError = handleValidationError(error)
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 })
    }
    if (error.message?.includes("not authenticated") || error.message?.includes("not admin")) {
      return NextResponse.json(
        errorResponse("Admin access required", 403),
        { status: 403 }
      )
    }
    console.error("Error creating override booking:", error)
    return NextResponse.json(
      errorResponse("Failed to create override booking", 500),
      { status: 500 }
    )
  }
}

