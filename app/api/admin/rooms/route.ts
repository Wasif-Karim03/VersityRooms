/**
 * GET /api/admin/rooms - Get all rooms (admin)
 * POST /api/admin/rooms - Create new room (admin)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { z } from "zod"
import { successResponse, errorResponse } from "@/src/lib/api/response"

const createRoomSchema = z.object({
  name: z.string().min(1).max(200),
  building: z.string().min(1).max(200),
  capacity: z.number().int().positive(),
  equipment: z.array(z.string()),
  images: z.array(z.string()),
  isActive: z.boolean().default(true),
  isLocked: z.boolean().default(false),
  restrictedRoles: z.array(z.enum(["STUDENT", "FACULTY", "ADMIN"])).nullable(),
})

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const rooms = await prisma.room.findMany({
      orderBy: [
        { building: "asc" },
        { name: "asc" },
      ],
    })

    return NextResponse.json(successResponse(rooms))
  } catch (error: any) {
    if (error.message?.includes("not admin")) {
      return NextResponse.json(
        errorResponse("Admin access required", 403),
        { status: 403 }
      )
    }
    console.error("Error fetching rooms:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch rooms", 500),
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin()

    const body = await request.json()
    const validatedData = createRoomSchema.parse(body)

    const room = await prisma.room.create({
      data: {
        name: validatedData.name,
        building: validatedData.building,
        capacity: validatedData.capacity,
        equipment: validatedData.equipment,
        images: validatedData.images,
        isActive: validatedData.isActive,
        isLocked: validatedData.isLocked,
        restrictedRoles: validatedData.restrictedRoles,
      },
    })

    return NextResponse.json(successResponse(room), { status: 201 })
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        errorResponse("Invalid room data", 400),
        { status: 400 }
      )
    }
    if (error.message?.includes("not admin")) {
      return NextResponse.json(
        errorResponse("Admin access required", 403),
        { status: 403 }
      )
    }
    console.error("Error creating room:", error)
    return NextResponse.json(
      errorResponse("Failed to create room", 500),
      { status: 500 }
    )
  }
}

