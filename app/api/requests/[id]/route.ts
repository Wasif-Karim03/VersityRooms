/**
 * PATCH /api/requests/:id
 * Admin approve/reject/modify booking request
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { bookingRequestIdSchema } from "@/src/lib/validations/booking-requests"
import { updateBookingRequestSchema } from "@/src/lib/validations/booking-requests"
import { checkBookingConflicts } from "@/src/lib/api/availability"
import { createAuditLog } from "@/src/lib/api/audit"
import {
  notifyBookingApproved,
  notifyBookingRejected,
  notifyBookingModified,
} from "@/src/lib/notifications"
import { successResponse, errorResponse } from "@/src/lib/api/response"
import { handleValidationError } from "@/src/lib/api/validation-errors"
import { cacheService } from "@/src/lib/cache.service"
import { checkRateLimit, getClientIdentifier, RateLimits } from "@/src/lib/rate-limit"
import { sanitizeString } from "@/src/lib/utils/sanitize"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require admin
    const admin = await requireAdmin()

    // Rate limiting (10 requests per minute for admin write operations)
    const identifier = getClientIdentifier(request, admin.id)
    const rateLimitResult = await checkRateLimit(identifier, RateLimits.REPORTS)
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        errorResponse("Too many requests. Please try again later.", 429),
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

    // Validate request ID
    const { id } = bookingRequestIdSchema.parse({ id: params.id })

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateBookingRequestSchema.parse(body)

    // Get existing request
    const existingRequest = await prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        room: true,
        user: true,
      },
    })

    if (!existingRequest) {
      return NextResponse.json(
        errorResponse("Booking request not found", 404),
        { status: 404 }
      )
    }

    if (existingRequest.status !== "PENDING") {
      return NextResponse.json(
        errorResponse("Only pending requests can be modified", 400),
        { status: 400 }
      )
    }

    // Determine new start/end times
    const newStartAt = validatedData.startAt
      ? new Date(validatedData.startAt)
      : existingRequest.startAt
    const newEndAt = validatedData.endAt
      ? new Date(validatedData.endAt)
      : existingRequest.endAt

    // If approving, check for conflicts
    if (validatedData.status === "APPROVED") {
      const hasConflict = await checkBookingConflicts(
        existingRequest.roomId,
        newStartAt,
        newEndAt
      )

      if (hasConflict) {
        return NextResponse.json(
          errorResponse(
            "Cannot approve: Room is already booked for this time period. Use override booking instead.",
            409
          ),
          { status: 409 }
        )
      }
    }

    // Check if times were modified
    const timesModified =
      newStartAt.getTime() !== existingRequest.startAt.getTime() ||
      newEndAt.getTime() !== existingRequest.endAt.getTime()

    // Update request
    const updatedRequest = await prisma.bookingRequest.update({
      where: { id },
      data: {
        status: validatedData.status,
        startAt: newStartAt,
        endAt: newEndAt,
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

    // If approved, create corresponding booking
    let booking = null
    if (validatedData.status === "APPROVED") {
      booking = await prisma.booking.create({
        data: {
          roomId: existingRequest.roomId,
          userId: existingRequest.userId,
          startAt: newStartAt,
          endAt: newEndAt,
          purpose: existingRequest.purpose,
          createdFromRequestId: id,
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
        existingRequest.roomId,
        newStartAt,
        newEndAt
      )
    }

    // Sanitize reason before storing
    const sanitizedReason = sanitizeString(validatedData.reason)

    // Create audit log
    await createAuditLog({
      actorUserId: admin.id,
      actionType: `BOOKING_REQUEST_${validatedData.status}`,
      targetType: "BookingRequest",
      targetId: id,
      reason: sanitizedReason,
    })

    // Send notification (non-blocking - don't fail request if notification fails)
    if (validatedData.status === "APPROVED") {
      if (timesModified) {
        notifyBookingModified(
          existingRequest.userId,
          id,
          existingRequest.room.name,
          sanitizedReason,
          existingRequest.startAt,
          existingRequest.endAt,
          newStartAt,
          newEndAt
        ).catch((err) => {
          console.error("Failed to send booking modified notification:", err)
        })
      } else {
        notifyBookingApproved(
          existingRequest.userId,
          id,
          existingRequest.room.name,
          newStartAt,
          newEndAt
        ).catch((err) => {
          console.error("Failed to send booking approved notification:", err)
        })
      }
    } else {
      notifyBookingRejected(
        existingRequest.userId,
        id,
        existingRequest.room.name,
        sanitizedReason
      ).catch((err) => {
        console.error("Failed to send booking rejected notification:", err)
      })
    }

    const response = NextResponse.json(
      successResponse({
        request: updatedRequest,
        booking,
      })
    )

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
    console.error("Error updating booking request:", error)
    return NextResponse.json(
      errorResponse("Failed to update booking request", 500),
      { status: 500 }
    )
  }
}

