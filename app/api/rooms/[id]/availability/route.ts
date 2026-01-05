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
import { handleValidationError } from "@/src/lib/api/validation-errors"
import { cacheService } from "@/src/lib/cache.service"
import { CacheKeys, CacheTTL } from "@/src/lib/cache-keys"

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

    // Create cache key (availability is cached per room per date)
    const cacheKey = CacheKeys.availability(id, date)

    // Try to get from cache first (CRITICAL for performance - this endpoint is hit frequently)
    const cachedAvailability = await cacheService.get<any>(cacheKey)
    if (cachedAvailability) {
      return NextResponse.json(successResponse(cachedAvailability))
    }

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

    // Also get full booking details for the day (using UTC to match database)
    // Use a wider range to account for timezone differences:
    // Query from (date - 1 day) 00:00 UTC to (date + 1 day) 23:59 UTC
    // This ensures we capture bookings that fall within the local date
    // even if they're stored on a different calendar day in UTC
    const dayStart = new Date(Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate() - 1,
      0, 0, 0, 0
    ))
    
    const dayEnd = new Date(Date.UTC(
      targetDate.getUTCFullYear(),
      targetDate.getUTCMonth(),
      targetDate.getUTCDate() + 1,
      23, 59, 59, 999
    ))

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

    const result = {
      date: date,
      roomId: id,
      timeSlots,
      bookings,
    }

    // Cache the result (5 minutes TTL - availability changes frequently)
    await cacheService.set(cacheKey, result, CacheTTL.AVAILABILITY)

    return NextResponse.json(successResponse(result))
  } catch (error: any) {
    const validationError = handleValidationError(error)
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 })
    }
    console.error("Error fetching availability:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch availability", 500),
      { status: 500 }
    )
  }
}

