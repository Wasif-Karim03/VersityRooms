/**
 * GET /api/rooms/:id/availability?date=YYYY-MM-DD
 * Get time slots or existing bookings for a specific day
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { roomIdSchema } from "@/src/lib/validations/rooms"
import { availabilityQuerySchema } from "@/src/lib/validations/rooms"
import { getDayTimeSlots } from "@/src/lib/api/availability"
import { successResponse, errorResponse } from "@/src/lib/api/response"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate room ID
    const { id } = roomIdSchema.parse({ id: params.id })

    // Validate date query parameter
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get("date")
    
    if (!dateParam) {
      return NextResponse.json(
        errorResponse("Date parameter is required (format: YYYY-MM-DD)", 400),
        { status: 400 }
      )
    }

    const { date } = availabilityQuerySchema.parse({ date: dateParam })
    const targetDate = new Date(date + "T00:00:00Z")

    // Verify room exists
    const room = await prisma.room.findUnique({
      where: { id },
    })

    if (!room) {
      return NextResponse.json(
        errorResponse("Room not found", 404),
        { status: 404 }
      )
    }

    // Get time slots for the day
    const timeSlots = await getDayTimeSlots(id, targetDate)

    // Also get full booking details for the day
    const dayStart = new Date(targetDate)
    dayStart.setHours(0, 0, 0, 0)
    
    const dayEnd = new Date(targetDate)
    dayEnd.setHours(23, 59, 59, 999)

    const bookings = await prisma.booking.findMany({
      where: {
        roomId: id,
        OR: [
          {
            AND: [
              { startAt: { gte: dayStart } },
              { startAt: { lte: dayEnd } },
            ],
          },
          {
            AND: [
              { endAt: { gte: dayStart } },
              { endAt: { lte: dayEnd } },
            ],
          },
          {
            AND: [
              { startAt: { lte: dayStart } },
              { endAt: { gte: dayEnd } },
            ],
          },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startAt: "asc",
      },
    })

    return NextResponse.json(
      successResponse({
        date: date,
        roomId: id,
        timeSlots,
        bookings,
      })
    )
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        errorResponse("Invalid parameters", 400),
        { status: 400 }
      )
    }
    console.error("Error fetching availability:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch availability", 500),
      { status: 500 }
    )
  }
}

