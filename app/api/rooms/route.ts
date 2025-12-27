/**
 * GET /api/rooms
 * Get list of rooms with optional filters
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { roomFiltersSchema } from "@/src/lib/validations/rooms"
import { successResponse, errorResponse } from "@/src/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      capacity: searchParams.get("capacity") || undefined,
      building: searchParams.get("building") || undefined,
      equipment: searchParams.get("equipment") || undefined,
    }

    // Validate filters
    const validatedFilters = roomFiltersSchema.parse(filters)

    // Build where clause
    const where: any = {
      isActive: true,
    }

    if (validatedFilters.capacity) {
      where.capacity = { gte: validatedFilters.capacity }
    }

    if (validatedFilters.building) {
      where.building = {
        contains: validatedFilters.building,
        mode: "insensitive",
      }
    }

    if (validatedFilters.equipment) {
      // For JSON array filtering, we'll filter in memory after fetching
      // Prisma doesn't have great JSON array filtering support
      // Alternative: Use raw query or filter client-side
    }

    let rooms = await prisma.room.findMany({
      where,
      orderBy: [
        { building: "asc" },
        { name: "asc" },
      ],
    })

    // Filter by equipment if specified (client-side filtering for JSON arrays)
    if (validatedFilters.equipment) {
      rooms = rooms.filter((room) => {
        const equipment = room.equipment as string[]
        return Array.isArray(equipment) && equipment.includes(validatedFilters.equipment!)
      })
    }

    return NextResponse.json(successResponse(rooms))
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        errorResponse("Invalid filter parameters", 400),
        { status: 400 }
      )
    }
    console.error("Error fetching rooms:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch rooms", 500),
      { status: 500 }
    )
  }
}

