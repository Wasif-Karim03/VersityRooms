/**
 * GET /api/notifications
 * Get current user's notifications
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCurrentUser } from "@/src/lib/auth/session"
import { successResponse, errorResponse } from "@/src/lib/api/response"
import { handleValidationError } from "@/src/lib/api/validation-errors"
import { parseJsonField } from "@/lib/json-utils"
import { notificationQuerySchema } from "@/src/lib/validations/notifications"
import {
  calculateSkip,
  createPaginatedResponse,
} from "@/src/lib/pagination"

export async function GET(request: NextRequest) {
  try {
    const user = await requireCurrentUser()

    const searchParams = request.nextUrl.searchParams
    const query = {
      unread: searchParams.get("unread"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    }

    // Validate query parameters
    const validatedQuery = notificationQuerySchema.parse(query)

    const where: any = {
      userId: user.id,
    }

    if (validatedQuery.unread) {
      where.read = false
    }

    const skip = calculateSkip(validatedQuery.page, validatedQuery.limit)

    // Fetch paginated notifications and total count in parallel
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: validatedQuery.limit,
      }),
      prisma.notification.count({ where }),
    ])

    // Parse JSON metadata fields
    const transformedNotifications = notifications.map(notif => ({
      ...notif,
      metadata: parseJsonField(notif.metadata as any),
    }))

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    })

    const paginatedResponse = createPaginatedResponse(
      transformedNotifications,
      total,
      validatedQuery.page,
      validatedQuery.limit
    )

    return NextResponse.json(
      successResponse({
        notifications: paginatedResponse.data,
        pagination: paginatedResponse.pagination,
        unreadCount,
      })
    )
  } catch (error: any) {
    const validationError = handleValidationError(error)
    if (validationError) {
      return NextResponse.json(validationError, { status: 400 })
    }
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

