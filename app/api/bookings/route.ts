/**
 * GET /api/bookings?roomId=...&from=...&to=...
 * Get bookings with optional filters
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { bookingQuerySchema } from "@/src/lib/validations/bookings"
import { successResponse, errorResponse } from "@/src/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = {
      roomId: searchParams.get("roomId"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    }

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

    const bookings = await prisma.booking.findMany({
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
    })

    return NextResponse.json(successResponse(bookings))
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        errorResponse("Invalid query parameters", 400),
        { status: 400 }
      )
    }
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch bookings", 500),
      { status: 500 }
    )
  }
}

