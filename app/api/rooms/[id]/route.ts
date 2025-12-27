/**
 * GET /api/rooms/:id
 * Get a specific room by ID
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { roomIdSchema } from "@/src/lib/validations/rooms"
import { successResponse, errorResponse } from "@/src/lib/api/response"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID
    const { id } = roomIdSchema.parse({ id: params.id })

    const room = await prisma.room.findUnique({
      where: { id },
    })

    if (!room) {
      return NextResponse.json(
        errorResponse("Room not found", 404),
        { status: 404 }
      )
    }

    return NextResponse.json(successResponse(room))
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        errorResponse("Invalid room ID", 400),
        { status: 400 }
      )
    }
    console.error("Error fetching room:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch room", 500),
      { status: 500 }
    )
  }
}

