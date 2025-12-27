/**
 * GET /api/notifications
 * Get current user's notifications
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCurrentUser } from "@/src/lib/auth/session"
import { successResponse, errorResponse } from "@/src/lib/api/response"

export async function GET(request: NextRequest) {
  try {
    const user = await requireCurrentUser()

    const searchParams = request.nextUrl.searchParams
    const unreadOnly = searchParams.get("unread") === "true"
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: any = {
      userId: user.id,
    }

    if (unreadOnly) {
      where.read = false
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    })

    return NextResponse.json(
      successResponse({
        notifications,
        unreadCount,
      })
    )
  } catch (error: any) {
    if (error.message?.includes("not authenticated")) {
      return NextResponse.json(
        errorResponse("Authentication required", 401),
        { status: 401 }
      )
    }
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch notifications", 500),
      { status: 500 }
    )
  }
}

