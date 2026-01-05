/**
 * POST /api/notifications/:id/read
 * Mark notification as read
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCurrentUser } from "@/src/lib/auth/session"
import { successResponse, errorResponse } from "@/src/lib/api/response"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireCurrentUser()

    const notification = await prisma.notification.findUnique({
      where: { id: params.id },
    })

    if (!notification) {
      return NextResponse.json(
        errorResponse("Notification not found", 404),
        { status: 404 }
      )
    }

    if (notification.userId !== user.id) {
      return NextResponse.json(
        errorResponse("Unauthorized", 403),
        { status: 403 }
      )
    }

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { read: true },
    })

    return NextResponse.json(successResponse(updated))
  } catch (error: any) {
    if (error.message?.includes("not authenticated")) {
      return NextResponse.json(
        errorResponse("Authentication required", 401),
        { status: 401 }
      )
    }
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      errorResponse("Failed to update notification", 500),
      { status: 500 }
    )
  }
}

