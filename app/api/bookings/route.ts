/**
 * GET /api/bookings?roomId=...&from=...&to=...
 * Get bookings with optional filters
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { bookingQuerySchema } from "@/src/lib/validations/bookings"
import { successResponse, errorResponse } from "@/src/lib/api/response"
import { handleValidationError } from "@/src/lib/api/validation-errors"
import {
  parsePaginationParams,
  calculateSkip,
  createPaginatedResponse,
} from "@/src/lib/pagination"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = {
      roomId: searchParams.get("roomId"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    }

    // Parse pagination parameters
    const { page, limit } = parsePaginationParams(searchParams)

    const validatedQuery = bookingQuerySchema.parse(query)

    // Build where clause
    const where: any = {}

    if (validatedQuery.roomId) {
      where.roomId = validatedQuery.roomId
    }

    if (validatedQuery.from || validatedQuery.to) {
      where.OR = []

      if (validatedQuery.from && validatedQuery.to) {
        const from = new Date(validatedQuery.from)
        const to = new Date(validatedQuery.to)

        where.OR.push(
          {
            AND: [
              { startAt: { gte: from } },
              { startAt: { lte: to } },
            ],
          },
          {
            AND: [
              { endAt: { gte: from } },
              { endAt: { lte: to } },
            ],
          },
          {
            AND: [
              { startAt: { lte: from } },
              { endAt: { gte: to } },
            ],
          }
        )
      } else if (validatedQuery.from) {
        const from = new Date(validatedQuery.from)
        where.endAt = { gte: from }
      } else if (validatedQuery.to) {
        const to = new Date(validatedQuery.to)
        where.startAt = { lte: to }
      }
    }

    const skip = calculateSkip(page, limit)

    // Fetch paginated bookings and total count in parallel
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
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
          request: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        orderBy: {
          startAt: "asc",
        },
        skip,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ])

    const paginatedResponse = createPaginatedResponse(
      bookings,
      total,
      page,
      limit
    )

    return NextResponse.json(successResponse(paginatedResponse))
  } catch (error: any) {
    const validationError = handleValidationError(error)
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 })
    }
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch bookings", 500),
      { status: 500 }
    )
  }
}

