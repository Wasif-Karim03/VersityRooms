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
import { notifyRequestSubmitted } from "@/src/lib/notifications"
import { successResponse, errorResponse } from "@/src/lib/api/response"

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireCurrentUser()

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
      const restrictedRoles = room.restrictedRoles as string[]
      if (!restrictedRoles.includes(user.role)) {
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

    // Create booking request
    const bookingRequest = await prisma.bookingRequest.create({
      data: {
        roomId: validatedData.roomId,
        userId: user.id,
        startAt,
        endAt,
        purpose: validatedData.purpose,
        status: "PENDING",
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

    // Send notification
    await notifyRequestSubmitted(
      user.id,
      bookingRequest.id,
      bookingRequest.room.name,
      startAt,
      endAt
    )

    return NextResponse.json(successResponse(bookingRequest), { status: 201 })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        errorResponse("Invalid request data", 400),
        { status: 400 }
      )
    }
    if (error.message === "User not authenticated") {
      return NextResponse.json(
        errorResponse("Authentication required", 401),
        { status: 401 }
      )
    }
    console.error("Error creating booking request:", error)
    return NextResponse.json(
      errorResponse("Failed to create booking request", 500),
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = {
      mine: searchParams.get("mine"),
      status: searchParams.get("status"),
    }

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

    const bookingRequests = await prisma.bookingRequest.findMany({
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
    })

    return NextResponse.json(successResponse(bookingRequests))
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

