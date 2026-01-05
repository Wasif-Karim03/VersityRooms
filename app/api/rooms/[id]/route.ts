/**
 * GET /api/rooms/:id
 * Get a specific room by ID
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { roomIdSchema } from "@/src/lib/validations/rooms"
import { successResponse, errorResponse } from "@/src/lib/api/response"
import { handleValidationError } from "@/src/lib/api/validation-errors"
import { cacheService } from "@/src/lib/cache.service"
import { CacheKeys, CacheTTL } from "@/src/lib/cache-keys"
import { transformRooms } from "@/lib/json-utils"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID
    const { id } = roomIdSchema.parse({ id: params.id })

    const cacheKey = CacheKeys.room(id)

    // Try to get from cache first
    const cachedRoom = await cacheService.get<any>(cacheKey)
    if (cachedRoom) {
      return NextResponse.json(successResponse(cachedRoom))
    }

    const room = await prisma.room.findUnique({
      where: { id },
    })

    if (!room) {
      return NextResponse.json(
        errorResponse("Room not found", 404),
        { status: 404 }
      )
    }

    // Transform room to parse JSON fields
    const transformedRoom = transformRooms([room])[0]

    // Cache the result (1 hour TTL)
    await cacheService.set(cacheKey, transformedRoom, CacheTTL.ROOM)

    return NextResponse.json(successResponse(transformedRoom))
  } catch (error: any) {
    const validationError = handleValidationError(error)
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 })
    }
    console.error("Error fetching room:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch room", 500),
      { status: 500 }
    )
  }
}

