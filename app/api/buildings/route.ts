/**
 * GET /api/buildings
 * Get list of buildings with room counts
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse } from "@/src/lib/api/response"
import { cacheService } from "@/src/lib/cache.service"
import { CacheKeys, CacheTTL } from "@/src/lib/cache-keys"

export async function GET() {
  try {
    const cacheKey = CacheKeys.buildings()

    // Try to get from cache first
    const cachedBuildings = await cacheService.get<any[]>(cacheKey)
    if (cachedBuildings) {
      return NextResponse.json(successResponse(cachedBuildings))
    }

    // Get all rooms grouped by building
    const rooms = await prisma.room.findMany({
      where: {
        isActive: true,
      },
      select: {
        building: true,
        id: true,
      },
    })

    // Group by building and count rooms
    const buildingMap = new Map<string, number>()
    
    rooms.forEach((room) => {
      const count = buildingMap.get(room.building) || 0
      buildingMap.set(room.building, count + 1)
    })

    // Convert to array format
    const buildings = Array.from(buildingMap.entries()).map(([name, roomCount]) => ({
      name,
      roomCount,
    }))

    // Sort alphabetically
    buildings.sort((a, b) => a.name.localeCompare(b.name))

    // Cache the result (1 hour TTL - buildings change infrequently)
    await cacheService.set(cacheKey, buildings, CacheTTL.BUILDINGS)

    return NextResponse.json(successResponse(buildings))
  } catch (error: any) {
    console.error("Error fetching buildings:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch buildings", error.message),
      { status: 500 }
    )
  }
}

