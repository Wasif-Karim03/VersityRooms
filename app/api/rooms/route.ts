/**
 * GET /api/rooms
 * Get list of rooms with optional filters
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { roomFiltersSchema } from "@/src/lib/validations/rooms"
import { successResponse, errorResponse } from "@/src/lib/api/response"
import { handleValidationError } from "@/src/lib/api/validation-errors"
import { transformRooms, parseJsonField } from "@/lib/json-utils"
import { cacheService } from "@/src/lib/cache.service"
import { CacheKeys, CacheTTL } from "@/src/lib/cache-keys"
import {
  parsePaginationParams,
  calculateSkip,
  createPaginatedResponse,
} from "@/src/lib/pagination"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = {
      capacity: searchParams.get("capacity") || undefined,
      building: searchParams.get("building") || undefined,
      equipment: searchParams.get("equipment") || undefined,
    }

    // Parse pagination parameters
    const { page, limit } = parsePaginationParams(searchParams)

    // Validate filters
    const validatedFilters = roomFiltersSchema.parse(filters)

    // Create cache key from filters (without pagination - cache full results)
    const filterKey = JSON.stringify(validatedFilters)
    const cacheKey = CacheKeys.roomList(filterKey)

    // Try to get from cache first
    const cachedRooms = await cacheService.get<any[]>(cacheKey)
    if (cachedRooms) {
      // Paginate cached results in memory
      const skip = calculateSkip(page, limit)
      const paginatedRooms = cachedRooms.slice(skip, skip + limit)
      const paginatedResponse = createPaginatedResponse(
        paginatedRooms,
        cachedRooms.length,
        page,
        limit
      )
      return NextResponse.json(successResponse(paginatedResponse))
    }

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

    // Transform rooms to parse JSON fields
    const transformedRooms = transformRooms(rooms)

    // Filter by equipment if specified (client-side filtering for JSON arrays)
    let filteredRooms = transformedRooms
    if (validatedFilters.equipment) {
      filteredRooms = transformedRooms.filter((room) => {
        const equipment = room.equipment as string[]
        return Array.isArray(equipment) && equipment.includes(validatedFilters.equipment!)
      })
    }

    // Cache the full filtered result (10 minutes TTL) - cache before pagination
    await cacheService.set(cacheKey, filteredRooms, CacheTTL.ROOM_LIST)

    // Paginate the results
    const skip = calculateSkip(page, limit)
    const paginatedRooms = filteredRooms.slice(skip, skip + limit)
    const paginatedResponse = createPaginatedResponse(
      paginatedRooms,
      filteredRooms.length,
      page,
      limit
    )

    return NextResponse.json(successResponse(paginatedResponse))
  } catch (error: any) {
    const validationError = handleValidationError(error)
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 })
    }
    console.error("Error fetching rooms:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch rooms", 500),
      { status: 500 }
    )
  }
}

