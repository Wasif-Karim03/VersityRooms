/**
 * POST /api/notifications/read-all
 * Mark all notifications as read
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCurrentUser } from "@/src/lib/auth/session"
import { successResponse, errorResponse } from "@/src/lib/api/response"

export async function POST(request: NextRequest) {
  try {
    const user = await requireCurrentUser()

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    })

    return NextResponse.json(successResponse({ success: true }))
  } catch (error: any) {
    if (error.message?.includes("not authenticated")) {
      return NextResponse.json(
        errorResponse("Authentication required", 401),
        { status: 401 }
      )
    }
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json(
      errorResponse("Failed to update notifications", 500),
      { status: 500 }
    )
  }
}

