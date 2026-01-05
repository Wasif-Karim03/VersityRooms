/**
 * POST /api/requests/:id/cancel
 * Cancel a booking request (user can cancel their own pending requests)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCurrentUser } from "@/src/lib/auth/session"
import { bookingRequestIdSchema } from "@/src/lib/validations/booking-requests"
import { createAuditLog } from "@/src/lib/api/audit"
import { createNotification } from "@/src/lib/notifications"
import { successResponse, errorResponse } from "@/src/lib/api/response"
import { handleValidationError } from "@/src/lib/api/validation-errors"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireCurrentUser()

    // Validate request ID
    const { id } = bookingRequestIdSchema.parse({ id: params.id })

    // Get existing request
    const existingRequest = await prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        user: true,
      },
    })

    if (!existingRequest) {
      return NextResponse.json(
        errorResponse("Booking request not found", 404),
        { status: 404 }
      )
    }

    // Check ownership
    if (existingRequest.userId !== user.id) {
      return NextResponse.json(
        errorResponse("You can only cancel your own requests", 403),
        { status: 403 }
      )
    }

    // Check status
    if (existingRequest.status !== "PENDING") {
      return NextResponse.json(
        errorResponse("Only pending requests can be cancelled", 400),
        { status: 400 }
      )
    }

    // Update request status
    const updatedRequest = await prisma.bookingRequest.update({
      where: { id },
      data: {
        status: "CANCELLED",
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

    // Create audit log
    await createAuditLog({
      actorUserId: user.id,
      actionType: "BOOKING_REQUEST_CANCELLED",
      targetType: "BookingRequest",
      targetId: id,
      reason: "Cancelled by user",
    })

    // Send notification (non-blocking - don't fail request if notification fails)
    createNotification({
      userId: user.id,
      type: "REQUEST_CANCELLED",
      title: `Booking Request Cancelled: ${updatedRequest.room.name}`,
      message: `Your booking request for ${updatedRequest.room.name} has been cancelled.`,
      metadata: {
        requestId: id,
        roomName: updatedRequest.room.name,
      },
    }).catch((err) => {
      console.error("Failed to send notification for cancelled request:", err)
    })

    return NextResponse.json(successResponse(updatedRequest))
  } catch (error: any) {
    const validationError = handleValidationError(error)
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 })
    }
    if (error.message?.includes("not authenticated")) {
      return NextResponse.json(
        errorResponse("Authentication required", 401),
        { status: 401 }
      )
    }
    console.error("Error cancelling booking request:", error)
    return NextResponse.json(
      errorResponse("Failed to cancel booking request", 500),
      { status: 500 }
    )
  }
}

