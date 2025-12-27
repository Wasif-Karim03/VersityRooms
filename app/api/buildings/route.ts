/**
 * GET /api/buildings
 * Get list of buildings with room counts
 */

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { successResponse, errorResponse } from "@/src/lib/api/response"

export async function GET() {
  try {
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

    return NextResponse.json(successResponse(buildings))
  } catch (error: any) {
    console.error("Error fetching buildings:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch buildings", error.message),
      { status: 500 }
    )
  }
}

