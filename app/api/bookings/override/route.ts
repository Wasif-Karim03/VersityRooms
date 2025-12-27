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

export async function POST(request: NextRequest) {
  try {
    // Require admin
    const admin = await requireAdmin()

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

    // Create override booking
    const booking = await prisma.booking.create({
      data: {
        roomId: validatedData.roomId,
        userId: validatedData.userId,
        startAt,
        endAt,
        purpose: validatedData.purpose,
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

    // Create audit log
    await createAuditLog({
      actorUserId: admin.id,
      actionType: "BOOKING_OVERRIDE_CREATED",
      targetType: "Booking",
      targetId: booking.id,
      reason: validatedData.reason,
    })

    // Send notification
    await notifyOverrideCreated(
      validatedData.userId,
      booking.id,
      room.name,
      startAt,
      endAt,
      validatedData.reason
    )

    return NextResponse.json(successResponse(booking), { status: 201 })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        errorResponse("Invalid request data", 400),
        { status: 400 }
      )
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

