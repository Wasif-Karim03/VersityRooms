/**
 * PUT /api/admin/rooms/:id - Update room (admin)
 * DELETE /api/admin/rooms/:id - Delete room (admin)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { roomIdSchema } from "@/src/lib/validations/rooms"
import { z } from "zod"
import { createAuditLog } from "@/src/lib/api/audit"
import { successResponse, errorResponse } from "@/src/lib/api/response"

const updateRoomSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  building: z.string().min(1).max(200).optional(),
  capacity: z.number().int().positive().optional(),
  equipment: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  restrictedRoles: z.array(z.enum(["STUDENT", "FACULTY", "ADMIN"])).nullable().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin()

    const { id } = roomIdSchema.parse({ id: params.id })
    const body = await request.json()
    const validatedData = updateRoomSchema.parse(body)

    const room = await prisma.room.update({
      where: { id },
      data: validatedData,
    })

    await createAuditLog({
      actorUserId: admin.id,
      actionType: "ROOM_UPDATED",
      targetType: "Room",
      targetId: id,
      reason: "Room updated by admin",
    })

    return NextResponse.json(successResponse(room))
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
    console.error("Error updating room:", error)
    return NextResponse.json(
      errorResponse("Failed to update room", 500),
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin()

    const { id } = roomIdSchema.parse({ id: params.id })

    // Instead of deleting, deactivate the room
    const room = await prisma.room.update({
      where: { id },
      data: { isActive: false },
    })

    await createAuditLog({
      actorUserId: admin.id,
      actionType: "ROOM_DEACTIVATED",
      targetType: "Room",
      targetId: id,
      reason: "Room deactivated by admin",
    })

    return NextResponse.json(successResponse(room))
  } catch (error: any) {
    if (error.message?.includes("not admin")) {
      return NextResponse.json(
        errorResponse("Admin access required", 403),
        { status: 403 }
      )
    }
    console.error("Error deleting room:", error)
    return NextResponse.json(
      errorResponse("Failed to delete room", 500),
      { status: 500 }
    )
  }
}

