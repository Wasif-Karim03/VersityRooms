/**
 * GET /api/admin/audit
 * Get audit logs with optional filters (admin only)
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/src/lib/auth/guards"
import { successResponse, errorResponse } from "@/src/lib/api/response"
import {
  parsePaginationParams,
  calculateSkip,
  createPaginatedResponse,
} from "@/src/lib/pagination"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const actionType = searchParams.get("actionType")
    const targetType = searchParams.get("targetType")
    const actorUserId = searchParams.get("actorUserId")
    
    // Parse pagination parameters (default limit 100 for audit logs)
    const defaultLimit = 100
    const pageParam = searchParams.get("page")
    const limitParam = searchParams.get("limit")
    const page = Math.max(1, parseInt(pageParam || "1", 10) || 1)
    const limit = Math.min(
      100,
      Math.max(1, parseInt(limitParam || String(defaultLimit), 10) || defaultLimit)
    )

    const where: any = {}

    if (actionType) {
      where.actionType = actionType
    }

    if (targetType) {
      where.targetType = targetType
    }

    if (actorUserId) {
      where.actorUserId = actorUserId
    }

    const skip = calculateSkip(page, limit)

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip,
      }),
      prisma.auditLog.count({ where }),
    ])

    const paginatedResponse = createPaginatedResponse(
      logs,
      total,
      page,
      limit
    )

    return NextResponse.json(successResponse(paginatedResponse))
  } catch (error: any) {
    if (error.message?.includes("not admin")) {
      return NextResponse.json(
        errorResponse("Admin access required", 403),
        { status: 403 }
      )
    }
    console.error("Error fetching audit logs:", error)
    return NextResponse.json(
      errorResponse("Failed to fetch audit logs", 500),
      { status: 500 }
    )
  }
}

